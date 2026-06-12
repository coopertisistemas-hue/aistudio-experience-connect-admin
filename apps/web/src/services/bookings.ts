import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@connect/core';
import { withTenant, injectTenant } from '@connect/core';
import type { Database, BookingStatus, TenantId } from '@connect/core';

type BookingRow = Database['public']['Tables']['bookings']['Row'];
type BookingHoldRow = Database['public']['Tables']['booking_holds']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];
type DriverRow = Database['public']['Tables']['drivers']['Row'];
type VehicleRow = Database['public']['Tables']['vehicles']['Row'];
type RouteRow = Database['public']['Tables']['routes']['Row'];

export interface BookingFilters {
  search?: string;
  status?: BookingStatus | 'all';
  paymentStatus?: string;
  bookingType?: 'transfer' | 'experience' | 'all';
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export interface CreateHoldInput {
  tenant_id: string;
  vehicle_slot_id: string;
  passenger_count: number;
  scheduled_at: string;
  scheduled_end_at: string;
  pickup_location?: string;
  dropoff_location?: string;
  notes?: string;
}

export interface TimelineEvent {
  id: string;
  event: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
}

export interface BookingPassengerDetails {
  id: string;
  full_name: string;
  document?: string;
  age_group: string;
}

export interface BookingWithDetails {
  id: string;
  reference: string;
  tenant_id: string;
  booking_type: 'transfer' | 'experience';
  status: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_count: number;
  passengers: BookingPassengerDetails[];
  pickup_location: string;
  dropoff_location: string;
  route_name: string | null;
  scheduled_at: string;
  created_at: string;
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_name: string | null;
  vehicle_plate: string | null;
  vehicle_type: string | null;
  total_amount: number;
  payment_status: string;
  payment_method: string | null;
  notes: string | null;
  timeline: TimelineEvent[];
}

function generateReference(index: number): string {
  return `BK-${String(2050 - index).padStart(4, '0')}`;
}

function mapBookingToDetails(
  booking: BookingRow,
  user?: UserRow | null,
  driver?: DriverRow | null,
  vehicle?: VehicleRow | null,
  route?: RouteRow | null,
  payments?: PaymentRow[],
): BookingWithDetails {
  const payment = payments?.[0];
  return {
    id: booking.id,
    reference: generateReference(Math.floor(Math.random() * 100)),
    tenant_id: booking.tenant_id,
    booking_type: (booking.booking_type as 'transfer' | 'experience') || 'transfer',
    status: booking.status,
    passenger_name: user?.full_name || '—',
    passenger_email: user?.email || '—',
    passenger_phone: user?.phone || '—',
    passenger_count: booking.passenger_count,
    passengers: [],
    pickup_location: booking.pickup_location || '—',
    dropoff_location: booking.dropoff_location || '—',
    route_name: route?.name || null,
    scheduled_at: booking.scheduled_at,
    created_at: booking.created_at,
    driver_name: driver?.name || null,
    driver_phone: driver?.phone || null,
    vehicle_name: vehicle?.name || null,
    vehicle_plate: vehicle?.plate || null,
    vehicle_type: vehicle?.type || null,
    total_amount: booking.total_amount,
    payment_status: payment?.status || 'pending',
    payment_method: payment?.method || null,
    notes: booking.notes,
    timeline: [],
  };
}

export const bookingService = {
  async list(tenantId: string, filters?: BookingFilters): Promise<{ data: BookingWithDetails[]; total: number }> {
    let query = supabase
      .from('bookings')
      .select(`
        *,
        users!bookings_user_id_fkey(*),
        drivers!bookings_driver_id_fkey(*),
        vehicles!bookings_vehicle_id_fkey(*),
        routes!bookings_route_id_fkey(*),
        payments!payments_booking_id_fkey(*)
      `, { count: 'exact' });

    query = withTenant(query as any, tenantId) as typeof query;

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.bookingType && filters.bookingType !== 'all') {
      query = query.eq('booking_type', filters.bookingType);
    }
    if (filters?.dateFrom) {
      query = query.gte('scheduled_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('scheduled_at', `${filters.dateTo}T23:59:59`);
    }
    if (filters?.search) {
      const q = `%${filters.search}%`;
      query = query.or(`users.full_name.ilike.${q},pickup_location.ilike.${q},dropoff_location.ilike.${q},routes.name.ilike.${q}`);
    }

    const page = filters?.page ?? 0;
    const pageSize = filters?.pageSize ?? 50;
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
    query = query.order('scheduled_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('[bookingService.list]', error);
      return { data: [], total: 0 };
    }

    const mapped = (data || []).map((row: any) =>
      mapBookingToDetails(
        row as BookingRow,
        row.users as UserRow | null,
        row.drivers as DriverRow | null,
        row.vehicles as VehicleRow | null,
        row.routes as RouteRow | null,
        row.payments as PaymentRow[],
      ),
    );

    return { data: mapped, total: count ?? mapped.length };
  },

  async getById(id: string, tenantId: string): Promise<BookingWithDetails | null> {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        users!bookings_user_id_fkey(*),
        drivers!bookings_driver_id_fkey(*),
        vehicles!bookings_vehicle_id_fkey(*),
        routes!bookings_route_id_fkey(*),
        payments!payments_booking_id_fkey(*)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      console.error('[bookingService.getById]', error);
      return null;
    }

    const row = data as any;
    return mapBookingToDetails(
      row as BookingRow,
      row.users as UserRow | null,
      row.drivers as DriverRow | null,
      row.vehicles as VehicleRow | null,
      row.routes as RouteRow | null,
      row.payments as PaymentRow[],
    );
  },

  async createHold(input: CreateHoldInput): Promise<{ booking_id: string; hold_id: string; expires_at: string } | null> {
    const idempotency_key = crypto.randomUUID();
    const { data, error } = await invokeEdgeFunction<{ booking_id: string; hold_id: string; expires_at: string }>(
      supabase as any,
      'create-booking-hold',
      { ...input, idempotency_key } as any,
    );

    if (error || !data) {
      console.error('[bookingService.createHold]', error);
      return null;
    }

    return data;
  },

  async confirmFromPayment(bookingHoldId: string): Promise<boolean> {
    const { data, error } = await invokeEdgeFunction<{ success: boolean }>(
      supabase as any,
      'confirm-booking-from-payment',
      { booking_hold_id: bookingHoldId } as any,
    );

    if (error) {
      console.error('[bookingService.confirmFromPayment]', error);
      return false;
    }

    return true;
  },

  async cancel(id: string, reason?: string): Promise<boolean> {
    const { data, error } = await invokeEdgeFunction<{ success: boolean }>(
      supabase as any,
      'cancel-booking',
      { booking_id: id, reason: reason || 'Cancelado pelo admin' } as any,
    );

    if (error) {
      console.error('[bookingService.cancel]', error);
      return false;
    }

    return true;
  },

  async reschedule(bookingId: string, newSlotId: string, newScheduledAt: string, newScheduledEndAt: string, reason?: string): Promise<boolean> {
    const { data, error } = await invokeEdgeFunction<{ success: boolean }>(
      supabase as any,
      'reschedule-booking',
      {
        booking_id: bookingId,
        new_vehicle_slot_id: newSlotId,
        new_scheduled_at: newScheduledAt,
        new_scheduled_end_at: newScheduledEndAt,
        reason: reason || 'Reagendado pelo admin',
      } as any,
    );

    if (error) {
      console.error('[bookingService.reschedule]', error);
      return false;
    }

    return true;
  },
};
