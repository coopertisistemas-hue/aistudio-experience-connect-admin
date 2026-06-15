import { supabase } from '@/lib/supabase';

interface Row { [key: string]: any }

export interface DailyTransferStat {
  date: string;
  label: string;
  transfers: number;
  revenue: number;
  occupancy_pct: number;
}

export interface RouteAnalytic {
  id: string;
  name: string;
  category: 'airport' | 'tourism' | 'corporate' | 'hotel';
  transfers: number;
  revenue: number;
  avg_occupancy_pct: number;
  avg_duration_min: number;
  trend: 'up' | 'down' | 'stable';
  trend_pct: number;
}

export interface DriverPerformanceStat {
  id: string;
  name: string;
  initials: string;
  transfers_completed: number;
  punctuality_pct: number;
  completion_pct: number;
  avg_rating: number;
  incidents: number;
  km_total: number;
  rank: number;
}

export interface VehicleUtilizationStat {
  id: string;
  name: string;
  plate: string;
  type: string;
  capacity: number;
  transfers: number;
  avg_occupancy_pct: number;
  km_total: number;
  km_today: number;
  maintenance_status: 'ok' | 'due_soon' | 'overdue';
  utilization_pct: number;
}

export interface RevenueByCategoryItem {
  category: string;
  revenue: number;
  transfers: number;
  pct: number;
  color: string;
}

export interface HourlyPeakStat {
  hour: string;
  transfers: number;
}

export interface ExecutiveSummary {
  receita_total: number;
  receita_mes: number;
  receita_semana: number;
  transfers_realizados: number;
  transfers_mes: number;
  taxa_ocupacao_pct: number;
  ticket_medio: number;
  motoristas_ativos: number;
  checkins_confirmados: number;
  pagamentos_pendentes: number;
  crescimento_receita_pct: number;
  crescimento_transfers_pct: number;
}

export interface MonthlyRevenueItem {
  month: string;
  revenue: number;
  transfers: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  airport: '#06b6d4',
  tourism: '#10b981',
  corporate: '#6366f1',
  hotel: '#f59e0b',
};

function makeInitials(name: string): string {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export const reportsService = {
  async getExecutiveSummary(tenantId: string): Promise<ExecutiveSummary> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfWeek = new Date(now.getTime() - 7 * 86400000).toISOString();

    const { data: bookings } = await supabase
      .from('bookings')
      .select('status, total_amount, passenger_count, scheduled_at')
      .eq('tenant_id', tenantId);

    const { data: payments } = await supabase
      .from('payments')
      .select('amount, status, created_at')
      .eq('tenant_id', tenantId);

    const { data: drivers } = await supabase
      .from('drivers')
      .select('id, status')
      .eq('tenant_id', tenantId);

    const allBookings = (bookings ?? []) as Row[];
    const allPayments = (payments ?? []) as Row[];
    const allDrivers = (drivers ?? []) as Row[];

    const transfersRealizados = allBookings.filter((b: Row) => b.status === 'completed').length;
    const transfersMes = allBookings.filter((b: Row) => b.scheduled_at >= startOfMonth && b.status === 'completed').length;
    const receitaTotal = allPayments.filter((p: Row) => p.status === 'completed').reduce((s: number, p: Row) => s + p.amount, 0);
    const receitaMes = allPayments.filter((p: Row) => p.status === 'completed' && p.created_at >= startOfMonth).reduce((s: number, p: Row) => s + p.amount, 0);
    const receitaSemana = allPayments.filter((p: Row) => p.status === 'completed' && p.created_at >= startOfWeek).reduce((s: number, p: Row) => s + p.amount, 0);
    const pagamentosPendentes = allPayments.filter((p: Row) => p.status === 'pending').reduce((s: number, p: Row) => s + p.amount, 0);
    const motoristasAtivos = allDrivers.filter((d: Row) => d.status === 'active' || d.status === 'on_trip' || d.status === 'off_duty').length;
    const totalPassengers = allBookings.filter((b: Row) => b.status === 'completed').reduce((s: number, b: Row) => s + (b.passenger_count ?? 0), 0);
    const totalBookingsCompleted = allBookings.filter((b: Row) => b.status === 'completed').length;
    const taxaOcupacao = totalBookingsCompleted > 0 ? Math.round((totalPassengers / totalBookingsCompleted) * 10) : 85;
    const ticketMedio = transfersRealizados > 0 ? Math.round(receitaTotal / transfersRealizados) : 0;

    return {
      receita_total: receitaTotal,
      receita_mes: receitaMes,
      receita_semana: receitaSemana,
      transfers_realizados: transfersRealizados,
      transfers_mes: transfersMes,
      taxa_ocupacao_pct: Math.min(taxaOcupacao, 100),
      ticket_medio: ticketMedio,
      motoristas_ativos: motoristasAtivos,
      checkins_confirmados: allBookings.filter((b: Row) => b.status === 'completed' || b.status === 'in_progress').length,
      pagamentos_pendentes: pagamentosPendentes,
      crescimento_receita_pct: 0,
      crescimento_transfers_pct: 0,
    };
  },

  async getDailyStats(tenantId: string): Promise<DailyTransferStat[]> {
    const { data: rows } = await supabase
      .from('bookings')
      .select('scheduled_at, total_amount, passenger_count, status')
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', new Date(Date.now() - 30 * 86400000).toISOString())
      .order('scheduled_at', { ascending: true });

    const bookings = (rows ?? []) as Row[];
    if (bookings.length === 0) return [];

    const daily: Record<string, { transfers: number; revenue: number; passengers: number }> = {};
    for (const b of bookings) {
      const day = String(b.scheduled_at ?? '').slice(0, 10);
      if (!day) continue;
      if (!daily[day]) daily[day] = { transfers: 0, revenue: 0, passengers: 0 };
      daily[day].transfers++;
      daily[day].revenue += Number(b.total_amount ?? 0);
      daily[day].passengers += Number(b.passenger_count ?? 0);
    }

    return Object.entries(daily).map(([date, d]) => ({
      date,
      label: new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
      transfers: d.transfers,
      revenue: d.revenue,
      occupancy_pct: d.transfers > 0 ? Math.min(Math.round((d.passengers / d.transfers / 4) * 100), 100) : 0,
    }));
  },

  async getRouteAnalytics(tenantId: string): Promise<RouteAnalytic[]> {
    const { data: rows } = await supabase
      .from('bookings')
      .select('total_amount, passenger_count, status, routes!inner(id, name)')
      .eq('tenant_id', tenantId)
      .eq('booking_type', 'transfer');

    const bookings = (rows ?? []) as Row[];
    if (bookings.length === 0) return [];

    const byRoute: Record<string, { name: string; transfers: number; revenue: number; passengers: number }> = {};
    for (const b of bookings) {
      const routeInfo = (b.routes ?? {}) as Row;
      const routeId = String(routeInfo.id ?? 'unknown');
      const routeName = String(routeInfo.name ?? '—');
      if (!byRoute[routeId]) byRoute[routeId] = { name: routeName, transfers: 0, revenue: 0, passengers: 0 };
      byRoute[routeId].transfers++;
      byRoute[routeId].revenue += Number(b.total_amount ?? 0);
      byRoute[routeId].passengers += Number(b.passenger_count ?? 1);
    }

    return Object.entries(byRoute).map(([id, r], i) => ({
      id,
      name: r.name,
      category: (['airport', 'tourism', 'corporate', 'hotel'] as const)[i % 4],
      transfers: r.transfers,
      revenue: r.revenue,
      avg_occupancy_pct: r.transfers > 0 ? Math.min(Math.round((r.passengers / r.transfers / 4) * 100), 100) : 0,
      avg_duration_min: 45,
      trend: 'stable' as const,
      trend_pct: 0,
    }));
  },

  async getDriverPerformance(tenantId: string): Promise<DriverPerformanceStat[]> {
    const { data: driverRows } = await supabase
      .from('drivers')
      .select('id, name')
      .eq('tenant_id', tenantId);

    const drivers = (driverRows ?? []) as Row[];
    if (drivers.length === 0) return [];

    const { data: bookingRows } = await supabase
      .from('bookings')
      .select('driver_id, status')
      .eq('tenant_id', tenantId);

    const bookings = (bookingRows ?? []) as Row[];
    const driverBookings: Record<string, { completed: number; total: number }> = {};
    for (const b of bookings) {
      const did = String(b.driver_id ?? '');
      if (!did) continue;
      if (!driverBookings[did]) driverBookings[did] = { completed: 0, total: 0 };
      driverBookings[did].total++;
      if (b.status === 'completed') driverBookings[did].completed++;
    }

    return drivers.map((d: Row, i: number) => {
      const stats = driverBookings[String(d.id)] ?? { completed: 0, total: 0 };
      return {
        id: String(d.id),
        name: String(d.name ?? ''),
        initials: makeInitials(String(d.name ?? '')),
        transfers_completed: stats.completed,
        punctuality_pct: 95,
        completion_pct: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 100,
        avg_rating: 4.5,
        incidents: 0,
        km_total: 0,
        rank: i + 1,
      };
    });
  },

  async getVehicleUtilization(tenantId: string): Promise<VehicleUtilizationStat[]> {
    const { data: vehicleRows } = await supabase
      .from('vehicles')
      .select('id, name, plate, type, capacity, status')
      .eq('tenant_id', tenantId);

    const vehicles = (vehicleRows ?? []) as Row[];
    if (vehicles.length === 0) return [];

    const { data: bookingRows } = await supabase
      .from('bookings')
      .select('vehicle_id, passenger_count, status')
      .eq('tenant_id', tenantId);

    const bookings = (bookingRows ?? []) as Row[];
    const vehicleStats: Record<string, { transfers: number; passengers: number }> = {};
    for (const b of bookings) {
      const vid = String(b.vehicle_id ?? '');
      if (!vid) continue;
      if (!vehicleStats[vid]) vehicleStats[vid] = { transfers: 0, passengers: 0 };
      if (b.status === 'completed') {
        vehicleStats[vid].transfers++;
        vehicleStats[vid].passengers += Number(b.passenger_count ?? 1);
      }
    }

    return vehicles.map((v: Row) => {
      const vs = vehicleStats[String(v.id)] ?? { transfers: 0, passengers: 0 };
      const cap = Number(v.capacity ?? 4);
      const avgOcc = vs.transfers > 0 ? Math.round((vs.passengers / vs.transfers / cap) * 100) : 0;
      return {
        id: String(v.id),
        name: String(v.name ?? ''),
        plate: String(v.plate ?? '—'),
        type: String(v.type ?? ''),
        capacity: cap,
        transfers: vs.transfers,
        avg_occupancy_pct: Math.min(avgOcc, 100),
        km_total: 0,
        km_today: 0,
        maintenance_status: 'ok' as const,
        utilization_pct: avgOcc,
      };
    });
  },

  async getRevenueByCategory(tenantId: string): Promise<RevenueByCategoryItem[]> {
    const routes = await this.getRouteAnalytics(tenantId);
    const total = routes.reduce((s, r) => s + r.revenue, 0);

    if (total === 0) {
      return Object.entries(CATEGORY_COLORS).map(([category, color]) => ({
        category,
        revenue: 0,
        transfers: 0,
        pct: 0,
        color,
      }));
    }

    const byCat: Record<string, { revenue: number; transfers: number }> = {};
    for (const r of routes) {
      if (!byCat[r.category]) byCat[r.category] = { revenue: 0, transfers: 0 };
      byCat[r.category].revenue += r.revenue;
      byCat[r.category].transfers += r.transfers;
    }

    return Object.entries(byCat).map(([category, d]) => ({
      category,
      revenue: d.revenue,
      transfers: d.transfers,
      pct: Math.round((d.revenue / total) * 100),
      color: CATEGORY_COLORS[category] ?? '#94a3b8',
    }));
  },

  async getMonthlyRevenue(tenantId: string): Promise<MonthlyRevenueItem[]> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: paymentRows } = await supabase
      .from('payments')
      .select('amount, created_at')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte('created_at', sixMonthsAgo.toISOString())
      .order('created_at', { ascending: true });

    const { data: bookingRows } = await supabase
      .from('bookings')
      .select('scheduled_at')
      .eq('tenant_id', tenantId)
      .gte('scheduled_at', sixMonthsAgo.toISOString());

    const payments = (paymentRows ?? []) as Row[];
    const bookings = (bookingRows ?? []) as Row[];

    const monthlyPayments: Record<string, number> = {};
    for (const p of payments) {
      const m = String(p.created_at ?? '').slice(0, 7);
      if (!m) continue;
      monthlyPayments[m] = (monthlyPayments[m] ?? 0) + Number(p.amount ?? 0);
    }

    const monthlyBookings: Record<string, number> = {};
    for (const b of bookings) {
      const m = String(b.scheduled_at ?? '').slice(0, 7);
      if (!m) continue;
      monthlyBookings[m] = (monthlyBookings[m] ?? 0) + 1;
    }

    const months: MonthlyRevenueItem[] = [];
    const d = new Date(sixMonthsAgo);
    while (d <= new Date()) {
      const m = d.toISOString().slice(0, 7);
      months.push({
        month: d.toLocaleDateString('pt-BR', { month: 'short' }),
        revenue: monthlyPayments[m] ?? 0,
        transfers: monthlyBookings[m] ?? 0,
      });
      d.setMonth(d.getMonth() + 1);
    }

    return months;
  },

  async getHourlyPeaks(tenantId: string): Promise<HourlyPeakStat[]> {
    const { data: rows } = await supabase
      .from('bookings')
      .select('scheduled_at')
      .eq('tenant_id', tenantId);

    const bookings = (rows ?? []) as Row[];
    const hourly: Record<string, number> = {};
    for (const b of bookings) {
      if (!b.scheduled_at) continue;
      const h = new Date(b.scheduled_at).getHours().toString().padStart(2, '0') + ':00';
      hourly[h] = (hourly[h] ?? 0) + 1;
    }

    return Array.from({ length: 18 }, (_, i) => {
      const h = (i + 6).toString().padStart(2, '0') + ':00';
      return { hour: h, transfers: hourly[h] ?? 0 };
    });
  },
};
