// ─── Types ────────────────────────────────────────────────────────────────────

export type ReceivableStatus = 'open' | 'received' | 'overdue' | 'partial' | 'cancelled';
export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'invoice';
export type ReconciliationStatus = 'reconciled' | 'pending' | 'divergent' | 'reversed' | 'in_review';

export interface MockReceivable {
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
  method: PaymentMethod;
  category: string;
  notes: string;
  created_at: string;
  overdue_days?: number;
  installments?: number;
  installment_current?: number;
}

export interface MockReconciliation {
  id: string;
  reference: string;
  booking_ref: string;
  passenger_name: string;
  route_name: string;
  method: PaymentMethod;
  processor: string;
  amount_expected: number;
  amount_received: number;
  difference: number;
  status: ReconciliationStatus;
  processed_at: string;
  settlement_date: string;
  gateway_ref: string;
  divergence_reason?: string;
  notes: string;
}

export interface CashflowEntry {
  date: string;
  label: string;
  expected: number;
  received: number;
}

// ─── Receivables ──────────────────────────────────────────────────────────────

export const mockReceivables: any[] = [];

// ─── Reconciliation ───────────────────────────────────────────────────────────

export const mockReconciliations: any[] = [];

// ─── Cashflow Forecast ────────────────────────────────────────────────────────

export const mockCashflowWeekly: any[] = [];

export const mockCashflowMonthly: any[] = [];

// ─── Summary Stats ────────────────────────────────────────────────────────────

export const mockReceivablesStats: any = { total_to_receive: 0, received_today: 0, open_count: 0, overdue_count: 0, overdue_amount: 0, avg_ticket: 0, cashflow_forecast: 0 };

// Reconciliation stats

export const mockReconciliationStats: any = { total: 0, reconciled: 0, pending: 0, divergent: 0, reversed: 0, in_review: 0, rate: 0, total_divergence: 0, avg_processing_hours: 0 };

// ─── Labels ───────────────────────────────────────────────────────────────────

export const receivableStatusLabels: Record<ReceivableStatus, string> = {} as any;

export const reconciliationStatusLabels: Record<ReconciliationStatus, string> = {} as any;

export const paymentMethodLabels: Record<PaymentMethod, string> = {} as any;

export const paymentMethodIcons: Record<PaymentMethod, string> = {} as any;