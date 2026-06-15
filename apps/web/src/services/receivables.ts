import { supabase } from '@/lib/supabase';

export type ReceivableStatus = 'open' | 'received' | 'overdue' | 'partial' | 'cancelled';
export type PaymentMethodName = 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'invoice';

export const receivableStatusLabels: Record<ReceivableStatus, string> = {
  open: 'Em aberto',
  received: 'Recebido',
  overdue: 'Atrasado',
  partial: 'Parcial',
  cancelled: 'Cancelado',
};

export const paymentMethodLabels: Record<PaymentMethodName, string> = {
  pix: 'PIX',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  bank_transfer: 'Transferência',
  cash: 'Dinheiro',
  invoice: 'Boleto / Fatura',
};

export const paymentMethodIcons: Record<PaymentMethodName, string> = {
  pix: 'ri-qr-code-line',
  credit_card: 'ri-bank-card-line',
  debit_card: 'ri-bank-card-2-line',
  bank_transfer: 'ri-bank-line',
  cash: 'ri-money-dollar-box-line',
  invoice: 'ri-file-text-line',
};

export interface ReceivableItem {
  id: string;
  booking_ref: string;
  passenger_name: string;
  passenger_email: string;
  route_name: string;
  origin: string;
  destination: string;
  due_date: string;
  forecast_date: string;
  amount: number;
  amount_received: number;
  status: ReceivableStatus;
  method: PaymentMethodName;
  category: string;
  notes: string;
  created_at: string;
  overdue_days?: number;
  installments?: number;
  installment_current?: number;
}

const STATUS_MAP: Record<string, ReceivableStatus> = {
  pending: 'open',
  processing: 'open',
  completed: 'received',
  refunded: 'cancelled',
  cancelled: 'cancelled',
  failed: 'overdue',
};

const METHOD_MAP: Record<string, PaymentMethodName> = {
  credit_card: 'credit_card',
  debit_card: 'debit_card',
  pix: 'pix',
  boleto: 'invoice',
  manual: 'cash',
};

interface PaymentRow {
  id: string;
  booking_id: string | null;
  user_id: string | null;
  amount: number;
  method: string | null;
  status: string;
  paid_at: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
  users?: { email: string | null; full_name: string | null } | null;
  bookings?: {
    pickup_location: string | null;
    dropoff_location: string | null;
    scheduled_at: string | null;
    passenger_count: number | null;
    total_amount: number | null;
    routes: { name: string } | null;
  } | null;
}

function toReceivableItem(p: PaymentRow): ReceivableItem {
  const status = STATUS_MAP[p.status] ?? 'open';
  const today = new Date();
  const createdDate = new Date(p.created_at);
  const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / 86400000);

  return {
    id: p.id,
    booking_ref: p.booking_id ? `#${p.booking_id.slice(0, 8)}` : '—',
    passenger_name: p.users?.full_name ?? '—',
    passenger_email: p.users?.email ?? '',
    route_name: p.bookings?.routes?.name ?? '—',
    origin: p.bookings?.pickup_location ?? '—',
    destination: p.bookings?.dropoff_location ?? '—',
    due_date: p.bookings?.scheduled_at ?? p.created_at,
    forecast_date: p.bookings?.scheduled_at ?? p.created_at,
    amount: p.amount,
    amount_received: status === 'received' ? p.amount : 0,
    status,
    method: METHOD_MAP[p.method ?? ''] ?? 'credit_card',
    category: 'Transfers',
    notes: '',
    created_at: p.created_at,
    overdue_days: status === 'overdue' ? daysDiff : undefined,
  };
}

export const receivablesService = {
  async list(): Promise<{ data: ReceivableItem[]; total: number }> {
    const { data, error, count } = await supabase
      .from('payments')
      .select(`
        id, booking_id, user_id, amount, method, status, paid_at, created_at, metadata,
        bookings!inner(pickup_location, dropoff_location, scheduled_at, passenger_count, total_amount, routes(name)),
        users!inner(email, full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[receivablesService.list]', error);
      return { data: [], total: 0 };
    }

    const items = (data ?? []).map(toReceivableItem);

    return { data: items, total: count ?? 0 };
  },

  async markAsPaid(id: string): Promise<boolean> {
    const client = supabase as any;
    const { error } = await client
      .from('payments')
      .update({ status: 'completed', paid_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[receivablesService.markAsPaid]', error);
      return false;
    }

    return true;
  },
};
