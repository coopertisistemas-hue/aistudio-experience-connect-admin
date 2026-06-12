import { supabase } from '@/lib/supabase';
import { invokeEdgeFunction } from '@connect/core';
import { withTenant } from '@connect/core';
import type { Database, PaymentStatus } from '@connect/core';

type PaymentRow = Database['public']['Tables']['payments']['Row'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];
type UserRow = Database['public']['Tables']['users']['Row'];
type PaymentJoinRow = PaymentRow & {
  bookings: BookingRow | null;
  users: UserRow | null;
};

export interface PaymentFilters {
  search?: string;
  status?: PaymentStatus | 'all';
  method?: string;
  period?: string;
  page?: number;
  pageSize?: number;
}

export interface ManualPaymentInput {
  tenant_id: string;
  booking_id: string;
  amount: number;
  reason: string;
  admin_id: string;
}

export interface PaymentTimelineEvent {
  id: string;
  event: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
  amount?: number;
}

export interface PaymentWithDetails {
  id: string;
  reference: string;
  booking_reference: string;
  booking_id: string;
  tenant_id: string;
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  route_name: string;
  pickup_location: string;
  dropoff_location: string;
  category: 'transfer' | 'experience';
  scheduled_at: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: string;
  method: string | null;
  created_at: string;
  due_at: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  installments?: number;
  notes: string | null;
  payment_link?: string;
  timeline: PaymentTimelineEvent[];
}

export interface PaymentStats {
  receita_confirmada: number;
  pendentes: number;
  atrasados: number;
  ticket_medio: number;
  reembolsos: number;
  taxa_conversao: number;
  overdue_count: number;
  pending_count: number;
  partial_count: number;
}

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function generateReference(index: number): string {
  return `PAY-${String(2050 - index).padStart(4, '0')}`;
}

function mapPaymentToDetails(
  payment: PaymentRow,
  booking?: BookingRow | null,
  user?: UserRow | null,
): PaymentWithDetails {
  const paidAmount = payment.status === 'completed' || payment.status === 'paid' ? payment.amount : 0;
  return {
    id: payment.id,
    reference: generateReference(Math.floor(Math.random() * 100)),
    booking_reference: booking?.id ? `BK-${booking.id.slice(-4)}` : '—',
    booking_id: payment.booking_id,
    tenant_id: payment.tenant_id,
    passenger_name: user?.full_name || '—',
    passenger_email: user?.email || '—',
    passenger_phone: user?.phone || '—',
    route_name: '—',
    pickup_location: booking?.pickup_location || '—',
    dropoff_location: booking?.dropoff_location || '—',
    category: (booking?.booking_type as 'transfer' | 'experience') || 'transfer',
    scheduled_at: booking?.scheduled_at || payment.created_at,
    total_amount: payment.amount,
    paid_amount: paidAmount,
    pending_amount: payment.status === 'pending' ? payment.amount : 0,
    status: payment.status,
    method: payment.method,
    created_at: payment.created_at,
    due_at: null,
    paid_at: payment.paid_at,
    refunded_at: payment.refunded_at,
    notes: null,
    timeline: [],
  };
}

export const paymentService = {
  async list(tenantId: string, filters?: PaymentFilters): Promise<{ data: PaymentWithDetails[]; total: number }> {
    let query = supabase
      .from('payments')
      .select(`
        *,
        bookings!payments_booking_id_fkey(*),
        users!payments_user_id_fkey(*)
      `, { count: 'exact' });

    query = withTenant(query, tenantId);

    if (filters?.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
    if (filters?.method) {
      query = query.eq('method', filters.method);
    }
    if (filters?.search) {
      const q = `%${filters.search}%`;
      query = query.or(`bookings->>pickup_location.ilike.${q},bookings->>dropoff_location.ilike.${q}`);
    }

    const page = filters?.page ?? 0;
    const pageSize = filters?.pageSize ?? 50;
    query = query.range(page * pageSize, (page + 1) * pageSize - 1);
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('[paymentService.list]', error);
      return { data: [], total: 0 };
    }

    const mapped = (data || []).map((row: PaymentJoinRow) =>
      mapPaymentToDetails(
        row,
        row.bookings,
        row.users,
      ),
    );

    return { data: mapped, total: count ?? mapped.length };
  },

  async getById(id: string, tenantId: string): Promise<PaymentWithDetails | null> {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings!payments_booking_id_fkey(*),
        users!payments_user_id_fkey(*)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (error || !data) {
      console.error('[paymentService.getById]', error);
      return null;
    }

    const row = data as unknown as PaymentJoinRow;
    return mapPaymentToDetails(
      row,
      row.bookings,
      row.users,
    );
  },

  async createPreference(bookingHoldId: string): Promise<{ payment_id: string; preference_id: string; init_point: string; expires_at?: string } | null> {
    const { data, error } = await invokeEdgeFunction<{ payment_id: string; preference_id: string; init_point: string; expires_at?: string }>(
      supabase,
      'create-payment-preference',
      { booking_hold_id: bookingHoldId },
    );

    if (error || !data) {
      console.error('[paymentService.createPreference]', error);
      return null;
    }

    return data;
  },

  async recordManual(input: ManualPaymentInput): Promise<string | null> {
    type RecordManualPaymentArgs = Database['public']['Functions']['record_manual_payment']['Args'];
    const { data, error } = await (supabase.rpc as unknown as {
      (fn: 'record_manual_payment', args: RecordManualPaymentArgs): Promise<{ data: string | null; error: unknown }>;
    })('record_manual_payment', {
      p_tenant_id: input.tenant_id,
      p_booking_id: input.booking_id,
      p_admin_id: input.admin_id,
      p_amount: input.amount,
      p_reason: input.reason,
    });

    if (error) {
      console.error('[paymentService.recordManual]', error);
      return null;
    }

    return data;
  },

  async getStats(tenantId: string): Promise<PaymentStats> {
    const { data: payments, error } = await supabase
      .from('payments')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      console.error('[paymentService.getStats]', error);
      return {
        receita_confirmada: 0,
        pendentes: 0,
        atrasados: 0,
        ticket_medio: 0,
        reembolsos: 0,
        taxa_conversao: 0,
        overdue_count: 0,
        pending_count: 0,
        partial_count: 0,
      };
    }

    const all: PaymentRow[] = payments ?? [];
    const paid = all.filter((p) => p.status === 'completed' || p.status === 'paid');
    const pending = all.filter((p) => p.status === 'pending');
    const overdue = all.filter((p) => p.status === 'overdue');
    const refunded = all.filter((p) => p.status === 'refunded');
    const partial = all.filter((p) => p.status === 'partial');

    return {
      receita_confirmada: paid.reduce((a, p) => a + p.amount, 0),
      pendentes: pending.reduce((a, p) => a + p.amount, 0),
      atrasados: overdue.reduce((a, p) => a + p.amount, 0),
      ticket_medio: paid.length > 0
        ? Math.round(paid.reduce((a, p) => a + p.amount, 0) / paid.length)
        : 0,
      reembolsos: refunded.reduce((a, p) => a + p.amount, 0),
      taxa_conversao: all.length > 0
        ? Math.round((paid.length / all.length) * 100)
        : 0,
      overdue_count: overdue.length,
      pending_count: pending.length,
      partial_count: partial.length,
    };
  },
};
