/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@connect/core';
import type { BookingStatus, PaymentStatus } from '@connect/core';

export interface GuestHoldInput {
  routeId: string;
  slotId: string;
  passengerName: string;
  passengerCount: number;
  email: string;
  phone?: string;
  tenantId: string;
}

export interface HoldResult {
  bookingId: string;
  holdId: string;
  expiresAt: string;
}

export interface PreferenceResult {
  paymentId: string;
  preferenceId: string;
  initPoint: string;
  expiresAt: string;
}

export interface BookingStatusData {
  id: string;
  reference: string;
  status: BookingStatus;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_count: number;
  route_name: string | null;
  scheduled_at: string;
  scheduled_end_at: string;
  total_amount: number;
  pickup_location: string | null;
  dropoff_location: string | null;
  payment_status: PaymentStatus;
  payment_method: string | null;
  created_at: string;
  timeline: TimelineEvent[];
}

export interface TimelineEvent {
  id: string;
  event: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: string;
}

function generateReference(id: string): string {
  return `BK-${id.slice(-4).toUpperCase()}`;
}

function mapBookingStatus(data: Record<string, unknown>): BookingStatusData {
  const payments = (data.payments as Record<string, unknown>[]) || [];
  const payment = payments[0] || {};
  const route = data.routes as Record<string, unknown> | null;

  return {
    id: data.id as string,
    reference: generateReference(data.id as string),
    status: data.status as BookingStatus,
    passenger_name: (data.guest_name as string) || (data.passenger_name as string) || '—',
    passenger_email: (data.guest_email as string) || (data.passenger_email as string) || '—',
    passenger_phone: (data.guest_phone as string) || (data.passenger_phone as string) || '—',
    passenger_count: (data.passenger_count as number) || 1,
    route_name: (route?.name as string) || null,
    scheduled_at: data.scheduled_at as string,
    scheduled_end_at: data.scheduled_end_at as string,
    total_amount: data.total_amount as number,
    pickup_location: (data.pickup_location as string) || null,
    dropoff_location: (data.dropoff_location as string) || null,
    payment_status: (payment?.status as PaymentStatus) || 'pending',
    payment_method: (payment?.method as string) || null,
    created_at: data.created_at as string,
    timeline: [],
  };
}

export const publicBookingService = {
  async createHold(input: GuestHoldInput): Promise<HoldResult | null> {
    const idempotency_key = crypto.randomUUID();
    const sb = supabase as any;
    const { data, error } = await invokeEdgeFunction<{
      booking_id: string;
      hold_id: string;
      expires_at: string;
    }>(
      sb,
      'create-booking-hold',
      {
        route_id: input.routeId,
        vehicle_slot_id: input.slotId,
        passenger_count: input.passengerCount,
        guest_name: input.passengerName,
        guest_email: input.email,
        guest_phone: input.phone || '',
        tenant_id: input.tenantId,
        idempotency_key,
      } as any,
    );

    if (error || !data) {
      console.error('[publicBookingService.createHold]', error);
      return null;
    }

    return {
      bookingId: data.booking_id,
      holdId: data.hold_id,
      expiresAt: data.expires_at,
    };
  },

  async createPreference(holdId: string): Promise<PreferenceResult | null> {
    const sb = supabase as any;
    const { data, error } = await invokeEdgeFunction<{
      payment_id: string;
      preference_id: string;
      init_point: string;
      expires_at: string;
    }>(
      sb,
      'create-payment-preference',
      { booking_hold_id: holdId } as any,
    );

    if (error || !data) {
      console.error('[publicBookingService.createPreference]', error);
      return null;
    }

    return {
      paymentId: data.payment_id,
      preferenceId: data.preference_id,
      initPoint: data.init_point,
      expiresAt: data.expires_at,
    };
  },

  async cancelBooking(bookingId: string): Promise<boolean> {
    const sb = supabase as any;
    const { error } = await invokeEdgeFunction<{ success: boolean }>(
      sb,
      'cancel-booking',
      {
        booking_id: bookingId,
        tenant_id: import.meta.env.VITE_PUBLIC_TENANT_ID || '',
        reason: 'Cancelado pelo cliente',
      } as any,
    );

    if (error) {
      console.error('[publicBookingService.cancelBooking]', error);
      return false;
    }

    // Update local cache
    const cached = sessionStorage.getItem(`booking:${bookingId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        parsed.status = 'cancelled';
        sessionStorage.setItem(`booking:${bookingId}`, JSON.stringify(parsed));
      } catch {
        // ignore
      }
    }

    return true;
  },

  async getBooking(bookingId: string): Promise<BookingStatusData | null> {
    // Prefer cached data from sessionStorage
    const cached = sessionStorage.getItem(`booking:${bookingId}`);
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return {
          ...parsed,
          scheduled_end_at: parsed.scheduled_at,
          pickup_location: parsed.pickup_location || null,
          dropoff_location: parsed.dropoff_location || null,
          payment_method: parsed.payment_method || null,
          created_at: parsed.created_at || new Date().toISOString(),
          timeline: [],
        } as BookingStatusData;
      } catch {
        // invalid cache, continue to query
      }
    }

    const sb = supabase as any;
    const { data, error } = await invokeEdgeFunction<Record<string, unknown>>(
      sb,
      'get-booking',
      { booking_id: bookingId },
    );

    if (error || !data) {
      console.error('[publicBookingService.getBooking]', error);
      return null;
    }

    // Merge booking + route + payments into flat structure for mapBookingStatus
    const flatData: Record<string, unknown> = {
      ...(data.booking as Record<string, unknown> || {}),
      routes: data.route ? data.route : null,
      payments: data.payments || [],
    };

    return mapBookingStatus(flatData);
  },
};
