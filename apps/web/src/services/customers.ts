import { supabase } from '@/lib/supabase';
import type { Database } from '@connect/core';

type UserRow = Database['public']['Tables']['users']['Row'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type UserTenantRow = Database['public']['Tables']['user_tenants']['Row'];

export interface CustomerBooking {
  id: string;
  reference: string;
  route_name: string;
  pickup_location: string;
  dropoff_location: string;
  scheduled_at: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  amount: number;
  payment_status: string;
  category: 'transfer' | 'experience';
}

export interface CustomerJourneyEvent {
  id: string;
  event: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
}

export interface CustomerDisplay {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string | null;
  nationality: string;
  language: string;
  status: string;
  created_at: string;
  last_activity_at: string;
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  next_booking: CustomerBooking | null;
  last_booking: CustomerBooking | null;
  recent_bookings: CustomerBooking[];
  total_spent: number;
  ticket_medio: number;
  pending_amount: number;
  preferences: string[];
  notes: string | null;
  is_recurring: boolean;
  recurrence_count: number;
  journey: CustomerJourneyEvent[];
}

export interface CustomerStats {
  total_ativos: number;
  novos_clientes: number;
  recorrentes: number;
  reservas_por_cliente: number;
  ticket_medio: number;
  valor_total: number;
  vip_count: number;
  overdue_count: number;
}

let referenceCounter = 0;

function generateReference(): string {
  return `REF-${Date.now()}-${String(referenceCounter++).padStart(4, '0')}`;
}

function mapBooking(row: BookingRow, payment?: PaymentRow): CustomerBooking {
  return {
    id: row.id,
    reference: generateReference(),
    route_name: row.pickup_location && row.dropoff_location
      ? `${row.pickup_location} → ${row.dropoff_location}`
      : 'Transfer',
    pickup_location: row.pickup_location || '—',
    dropoff_location: row.dropoff_location || '—',
    scheduled_at: row.scheduled_at,
    status: row.status as CustomerBooking['status'],
    amount: row.total_amount,
    payment_status: payment?.status || 'pending',
    category: (row.booking_type as 'transfer' | 'experience') || 'transfer',
  };
}

function computeStatus(user: UserRow, totalBookings: number): string {
  if (user.status === 'inactive') return 'inactive';
  if (totalBookings >= 10) return 'vip';
  return 'active';
}

function getPreferences(user: UserRow): string[] {
  const prefs = user.preferences;
  if (Array.isArray(prefs)) return prefs as string[];
  if (typeof prefs === 'object' && prefs !== null) {
    const vals = Object.values(prefs as Record<string, unknown>);
    if (vals.length > 0 && typeof vals[0] === 'string') return vals as string[];
  }
  return [];
}

function getMetadataString(user: UserRow, key: string): string | null {
  const meta = user.metadata as Record<string, unknown> | null;
  if (meta && typeof meta[key] === 'string') return meta[key] as string;
  return null;
}

interface UserBookingsData {
  bookings: BookingRow[];
  payments: PaymentRow[];
}

interface UserAggregatedData {
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  total_spent: number;
  pending_amount: number;
  bookings_with_payments: CustomerBooking[];
}

function buildUserDataMap(bookings: BookingRow[], payments: PaymentRow[]): Map<string, UserBookingsData> {
  const map = new Map<string, UserBookingsData>();

  for (const b of bookings) {
    if (!map.has(b.user_id)) map.set(b.user_id, { bookings: [], payments: [] });
    map.get(b.user_id)!.bookings.push(b);
  }

  for (const p of payments) {
    if (!map.has(p.user_id)) map.set(p.user_id, { bookings: [], payments: [] });
    map.get(p.user_id)!.payments.push(p);
  }

  return map;
}

function aggregateUserData(data: UserBookingsData): UserAggregatedData {
  const { bookings, payments } = data;
  const completed = ['confirmed', 'completed', 'in_progress'];

  const completedBookings = bookings.filter((b) => completed.includes(b.status));
  const totalSpent = completedBookings.reduce((s, b) => s + b.total_amount, 0);

  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'overdue');
  const pendingAmount = pendingPayments.reduce((s, p) => s + p.amount, 0);

  const cancelledBookings = bookings.filter((b) => b.status === 'cancelled');

  const paymentsByBooking = new Map<string, PaymentRow[]>();
  for (const p of payments) {
    if (!paymentsByBooking.has(p.booking_id)) paymentsByBooking.set(p.booking_id, []);
    paymentsByBooking.get(p.booking_id)!.push(p);
  }

  const bookingsWithPayments = bookings.map((b) => {
    const bp = paymentsByBooking.get(b.id);
    return mapBooking(b, bp?.[0]);
  });

  return {
    total_bookings: bookings.length,
    completed_bookings: completedBookings.length,
    cancelled_bookings: cancelledBookings.length,
    total_spent: totalSpent,
    pending_amount: pendingAmount,
    bookings_with_payments: bookingsWithPayments,
  };
}

function buildCustomerDisplay(user: UserRow, agg: UserAggregatedData): CustomerDisplay {
  const prefs = getPreferences(user);
  const status = computeStatus(user, agg.total_bookings);
  const now = new Date();

  const allBookings = agg.bookings_with_payments;
  const future = allBookings.filter((b) => new Date(b.scheduled_at) > now && b.status !== 'cancelled');
  const past = allBookings.filter((b) => new Date(b.scheduled_at) <= now || b.status === 'completed' || b.status === 'cancelled');
  const sortedFuture = future.sort((a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime());
  const sortedPast = past.sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime());
  const nextBooking = sortedFuture[0] || null;
  const lastBooking = sortedPast.find((b) => b.status === 'completed') || sortedPast[0] || null;

  const recent = [...allBookings].slice(0, 5);
  const isRecurring = agg.total_bookings >= 3;

  return {
    id: user.id,
    name: user.full_name || '—',
    email: user.email,
    phone: user.phone || '—',
    document: getMetadataString(user, 'document'),
    nationality: getMetadataString(user, 'nationality') || 'Brasileiro',
    language: getMetadataString(user, 'language') || 'Português',
    status,
    created_at: user.created_at,
    last_activity_at: user.updated_at,
    total_bookings: agg.total_bookings,
    completed_bookings: agg.completed_bookings,
    cancelled_bookings: agg.cancelled_bookings,
    next_booking: nextBooking,
    last_booking: lastBooking,
    recent_bookings: recent.slice(0, 5),
    total_spent: agg.total_spent,
    ticket_medio: agg.total_bookings > 0 ? Math.round(agg.total_spent / agg.total_bookings) : 0,
    pending_amount: agg.pending_amount,
    preferences: prefs,
    notes: getMetadataString(user, 'notes'),
    is_recurring: isRecurring,
    recurrence_count: agg.total_bookings,
    journey: [],
  };
}

const _from = <T>(table: string) => supabase.from(table) as any;

export const customerService = {
  async list(tenantId: string): Promise<CustomerDisplay[]> {
    const { data: userTenants, error: utError } = await supabase
      .from('user_tenants')
      .select('user_id')
      .eq('tenant_id', tenantId);

    if (utError || !userTenants || userTenants.length === 0) {
      console.error('[customerService.list] No users for tenant', utError);
      if (utError) throw utError;
      return [];
    }

    const userIds = (userTenants as UserTenantRow[]).map((ut) => ut.user_id);

    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds)
      .order('created_at', { ascending: false });

    if (error || !users) {
      console.error('[customerService.list]', error);
      if (error) throw error;
      return [];
    }

    const [{ data: allBookings }, { data: allPayments }] = await Promise.all([
      supabase
        .from('bookings')
        .select('*')
        .in('user_id', userIds)
        .eq('tenant_id', tenantId)
        .order('scheduled_at', { ascending: false }),
      supabase
        .from('payments')
        .select('*')
        .in('user_id', userIds)
        .eq('tenant_id', tenantId),
    ]);

    const userDataMap = buildUserDataMap(
      (allBookings || []) as BookingRow[],
      (allPayments || []) as PaymentRow[],
    );

    const mapped = (users as UserRow[]).map((u) => {
      const data = userDataMap.get(u.id) || { bookings: [], payments: [] };
      const agg = aggregateUserData(data);
      return buildCustomerDisplay(u, agg);
    });

    return mapped;
  },

  async getById(id: string, tenantId: string): Promise<CustomerDisplay | null> {
    const { data: userTenant, error: utError } = await _from('user_tenants')
      .select('user_id')
      .eq('user_id', id)
      .eq('tenant_id', tenantId)
      .single();

    if (utError || !userTenant) {
      console.error('[customerService.getById] User not in tenant', utError);
      if (utError) throw utError;
      return null;
    }

    const { data: user, error } = await _from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) {
      console.error('[customerService.getById]', error);
      if (error) throw error;
      return null;
    }

    const [{ data: allBookings }, { data: allPayments }] = await Promise.all([
      _from('bookings')
        .select('*')
        .eq('user_id', id)
        .eq('tenant_id', tenantId)
        .order('scheduled_at', { ascending: false })
        .limit(20),
      _from('payments')
        .select('*')
        .eq('user_id', id)
        .eq('tenant_id', tenantId),
    ]);

    const userDataMap = buildUserDataMap(
      (allBookings || []) as BookingRow[],
      (allPayments || []) as PaymentRow[],
    );
    const data = userDataMap.get(id) || { bookings: [], payments: [] };
    const agg = aggregateUserData(data);
    return buildCustomerDisplay(user as UserRow, agg);
  },

  async create(data: Database['public']['Tables']['users']['Insert']): Promise<Database['public']['Tables']['users']['Row'] | null> {
    const { data: result, error } = await _from('users')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('[customerService.create]', error);
      throw error;
    }

    return result as Database['public']['Tables']['users']['Row'];
  },

  async update(id: string, data: Database['public']['Tables']['users']['Update']): Promise<Database['public']['Tables']['users']['Row'] | null> {
    const { data: result, error } = await _from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[customerService.update]', error);
      throw error;
    }

    return result as Database['public']['Tables']['users']['Row'];
  },

  async getStats(tenantId: string): Promise<CustomerStats> {
    const { data: userTenants } = await supabase
      .from('user_tenants')
      .select('user_id')
      .eq('tenant_id', tenantId);

    const userIds = (userTenants || []).map((ut: any) => ut.user_id);

    if (userIds.length === 0) {
      return {
        total_ativos: 0,
        novos_clientes: 0,
        recorrentes: 0,
        reservas_por_cliente: 0,
        ticket_medio: 0,
        valor_total: 0,
        vip_count: 0,
        overdue_count: 0,
      };
    }

    const [{ data: users }, { data: bookings }, { data: payments }] = await Promise.all([
      _from('users')
        .select('id, status, created_at')
        .in('id', userIds),
      _from('bookings')
        .select('user_id, status, total_amount')
        .in('user_id', userIds)
        .eq('tenant_id', tenantId),
      _from('payments')
        .select('user_id, amount, status')
        .in('user_id', userIds)
        .eq('tenant_id', tenantId),
    ]);

    const safeUsers: { id: string; status: string; created_at: string }[] = users || [];
    const safeBookings: { user_id: string; status: string; total_amount: number }[] = bookings || [];
    const safePayments: { user_id: string; amount: number; status: string }[] = payments || [];

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const activeUsers = safeUsers.filter((u) => u.status !== 'inactive');
    const newUsers = safeUsers.filter((u) => new Date(u.created_at) >= thisMonth);

    const bookingsByUser = new Map<string, { total: number; completedAmount: number }>();
    for (const b of safeBookings) {
      if (!bookingsByUser.has(b.user_id)) bookingsByUser.set(b.user_id, { total: 0, completedAmount: 0 });
      const entry = bookingsByUser.get(b.user_id)!;
      entry.total++;
      if (['confirmed', 'completed', 'in_progress'].includes(b.status)) {
        entry.completedAmount += b.total_amount;
      }
    }

    const paymentsByUser = new Map<string, number>();
    for (const p of safePayments) {
      if (p.status === 'pending' || p.status === 'overdue') {
        paymentsByUser.set(p.user_id, (paymentsByUser.get(p.user_id) || 0) + p.amount);
      }
    }

    let recorrentes = 0;
    let vipCount = 0;
    let overdueCount = 0;
    let totalBookingsSum = 0;
    let totalSpentSum = 0;
    let spenderSum = 0;
    let spenderCount = 0;

    for (const userId of userIds) {
      const stats = bookingsByUser.get(userId) || { total: 0, completedAmount: 0 };
      totalBookingsSum += stats.total;
      totalSpentSum += stats.completedAmount;

      if (stats.total >= 3) recorrentes++;
      if (stats.total >= 10) vipCount++;

      if (stats.completedAmount > 0) {
        spenderSum += stats.completedAmount;
        spenderCount++;
      }

      const pendingAmt = paymentsByUser.get(userId) || 0;
      if (pendingAmt > 0) overdueCount++;
    }

    return {
      total_ativos: activeUsers.length,
      novos_clientes: newUsers.length,
      recorrentes,
      reservas_por_cliente: userIds.length > 0 ? Math.round(totalBookingsSum / userIds.length) : 0,
      ticket_medio: spenderCount > 0 ? Math.round(spenderSum / spenderCount) : 0,
      valor_total: totalSpentSum,
      vip_count: vipCount,
      overdue_count: overdueCount,
    };
  },
};
