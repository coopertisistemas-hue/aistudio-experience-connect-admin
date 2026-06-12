import { supabase } from '@/lib/supabase';
import type { Database } from '@connect/core';

type VehicleSlotRow = Database['public']['Tables']['vehicle_slots']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type BookingRow = Database['public']['Tables']['bookings']['Row'];
type WebhookDeliveryRow = Database['public']['Tables']['webhook_deliveries']['Row'];

export interface DashboardKPIData {
  reservasHoje: number;
  transfersAtivos: number;
  motoristasAtivos: number;
  ocupacaoMedia: number;
  receitaConfirmada: number;
  checkInsPendentes: number;
}

export interface DashboardAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  icon: string;
  title: string;
  description: string;
  time: string;
  created_at: string;
}

export interface DashboardRecentActivity {
  id: string;
  type: string;
  text: string;
  detail: string;
  time: string;
  created_at: string;
}

export const dashboardService = {
  async getKPIs(tenantId: string): Promise<DashboardKPIData> {
    const today = new Date().toISOString().split('T')[0];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const q1 = supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('created_at', today)
      .lt('created_at', tomorrowStr);

    const q2 = supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'confirmed');

    const q3 = supabase
      .from('drivers')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'active');

    const q4 = supabase
      .from('vehicle_slots')
      .select('total_capacity, reserved_seats, held_seats')
      .eq('tenant_id', tenantId)
      .gte('slot_start', today)
      .lt('slot_start', tomorrowStr);

    const q5 = supabase
      .from('payments')
      .select('amount')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed');

    const q6 = supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'confirmed');

    const results = await Promise.all([q1, q2, q3, q4, q5, q6]);

    const reservasHoje = results[0].count ?? 0;
    const transfersAtivos = results[1].count ?? 0;
    const motoristasAtivos = results[2].count ?? 0;

    const occupiedRows: VehicleSlotRow[] = results[3].data ?? [];
    const usedSeats = occupiedRows.reduce((acc, s) => acc + (s.reserved_seats || 0) + (s.held_seats || 0), 0);
    const totalCap = occupiedRows.reduce((acc, s) => acc + (s.total_capacity || 0), 0);
    const ocupacaoMedia = totalCap > 0 ? Math.round((usedSeats / totalCap) * 100) : 0;

    const receiptRows: PaymentRow[] = results[4].data ?? [];
    const receitaConfirmada = receiptRows.reduce((acc, p) => acc + (p.amount || 0), 0);
    const checkInsPendentes = results[5].count ?? 0;

    return {
      reservasHoje,
      transfersAtivos,
      motoristasAtivos,
      ocupacaoMedia,
      receitaConfirmada,
      checkInsPendentes,
    };
  },

  async getAlerts(tenantId: string): Promise<DashboardAlert[]> {
    const now = new Date().toISOString();
    const yesterday = new Date(Date.now() - 86400000).toISOString();

    const [overdueResult, failedResult] = await Promise.all([
      supabase
        .from('payments')
        .select('id, amount, created_at, booking_id, status')
        .eq('tenant_id', tenantId)
        .eq('status', 'overdue'),
      supabase
        .from('webhook_deliveries')
        .select('*')
        .eq('status', 'failed')
        .gte('created_at', yesterday)
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    const overdue: PaymentRow[] = overdueResult.data ?? [];
    const failed: WebhookDeliveryRow[] = failedResult.data ?? [];

    const alerts: DashboardAlert[] = [];

    for (const p of overdue) {
      alerts.push({
        id: `overdue-${p.id}`,
        type: 'error',
        icon: 'ri-alarm-warning-line',
        title: 'Pagamento em atraso',
        description: `Reserva #${(p.booking_id || '').slice(-4) || '---'} — R$ ${(p.amount || 0).toLocaleString('pt-BR')}`,
        time: new Date(p.created_at).toLocaleString('pt-BR'),
        created_at: p.created_at,
      });
    }

    for (const w of failed) {
      alerts.push({
        id: `webhook-${w.id}`,
        type: 'warning',
        icon: 'ri-link-unlink-line',
        title: 'Webhook com falha',
        description: `Evento ${w.event_id || 'desconhecido'} — ${w.error_message || 'Sem detalhes'}`,
        time: new Date(w.created_at).toLocaleString('pt-BR'),
        created_at: w.created_at,
      });
    }

    if (alerts.length === 0) {
      alerts.push({
        id: 'all-clear',
        type: 'info',
        icon: 'ri-checkbox-circle-line',
        title: 'Tudo em ordem',
        description: 'Nenhum alerta no momento.',
        time: 'Agora',
        created_at: now,
      });
    }

    return alerts;
  },

  async getRecentActivity(tenantId: string): Promise<DashboardRecentActivity[]> {
    const { data: recentBookings } = await supabase
      .from('bookings')
      .select('id, status, created_at, total_amount, pickup_location, dropoff_location')
      .eq('tenant_id', tenantId)
      .order('created_at', { ascending: false })
      .limit(5);

    const bookings: BookingRow[] = recentBookings ?? [];
    return bookings.map((b) => ({
      id: b.id,
      type: b.status === 'cancelled' ? 'booking' : 'transfer',
      text: b.status === 'cancelled' ? 'Reserva cancelada' : 'Nova reserva criada',
      detail: `#${b.id.slice(-4)} — ${b.pickup_location || 'N/A'} → ${b.dropoff_location || 'N/A'}${b.status !== 'cancelled' ? ` — R$ ${Number(b.total_amount).toLocaleString('pt-BR')}` : ''}`,
      time: new Date(b.created_at).toLocaleString('pt-BR'),
      created_at: b.created_at,
    }));
  },
};
