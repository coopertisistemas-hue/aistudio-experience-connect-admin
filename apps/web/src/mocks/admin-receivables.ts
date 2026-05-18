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

export const mockReceivables: MockReceivable[] = [
  {
    id: 'rec-001',
    booking_ref: 'BK-2026-0142',
    passenger_name: 'Alexandre Ferreira Santos',
    passenger_email: 'alexandre.fsantos@gmail.com',
    route_name: 'GRU → Grand Hyatt',
    origin: 'Aeroporto Internacional de Guarulhos',
    destination: 'Grand Hyatt São Paulo',
    due_date: '2026-05-17',
    forecast_date: '2026-05-17',
    amount: 340,
    amount_received: 0,
    status: 'open',
    method: 'pix',
    category: 'Transfers Aeroporto',
    notes: '',
    created_at: '2026-05-14',
  },
  {
    id: 'rec-002',
    booking_ref: 'BK-2026-0138',
    passenger_name: 'Carla Mendonça Ribeiro',
    passenger_email: 'carla.mribeiro@outlook.com',
    route_name: 'Hotel → Congonhas',
    origin: 'Tivoli Mofarrej São Paulo',
    destination: 'Aeroporto de Congonhas',
    due_date: '2026-05-16',
    forecast_date: '2026-05-18',
    amount: 220,
    amount_received: 220,
    status: 'received',
    method: 'credit_card',
    category: 'Transfers Aeroporto',
    notes: 'Pago via Mercado Pago. Confirmado automaticamente.',
    created_at: '2026-05-13',
  },
  {
    id: 'rec-003',
    booking_ref: 'BK-2026-0129',
    passenger_name: 'Roberto Leal Vasconcelos',
    passenger_email: 'roberto.lv@empresa.com.br',
    route_name: 'Rota dos Vinhos — Bento G.',
    origin: 'Porto Alegre',
    destination: 'Bento Gonçalves',
    due_date: '2026-05-10',
    forecast_date: '2026-05-20',
    amount: 1300,
    amount_received: 0,
    status: 'overdue',
    method: 'invoice',
    category: 'Rotas de Vinho',
    notes: 'Fatura enviada em 10/05. Aguardando retorno do financeiro da empresa.',
    created_at: '2026-05-07',
    overdue_days: 7,
  },
  {
    id: 'rec-004',
    booking_ref: 'BK-2026-0135',
    passenger_name: 'Fernanda Duarte Lima',
    passenger_email: 'fernanda.dlima@gmail.com',
    route_name: 'City Tour SP — Executivo',
    origin: 'Hotel Fasano',
    destination: 'Centro Histórico SP',
    due_date: '2026-05-19',
    forecast_date: '2026-05-19',
    amount: 640,
    amount_received: 320,
    status: 'partial',
    method: 'pix',
    category: 'Experiências Privadas',
    notes: '50% pago na reserva. Saldo pendente na data do serviço.',
    created_at: '2026-05-15',
    installments: 2,
    installment_current: 1,
  },
  {
    id: 'rec-005',
    booking_ref: 'BK-2026-0127',
    passenger_name: 'Gustavo Machado Pires',
    passenger_email: 'gustavo.mpires@icloud.com',
    route_name: 'GRU → Paulista Premium',
    origin: 'Aeroporto de Guarulhos',
    destination: 'Avenida Paulista',
    due_date: '2026-05-14',
    forecast_date: '2026-05-14',
    amount: 380,
    amount_received: 380,
    status: 'received',
    method: 'pix',
    category: 'Transfers Aeroporto',
    notes: '',
    created_at: '2026-05-12',
  },
  {
    id: 'rec-006',
    booking_ref: 'BK-2026-0122',
    passenger_name: 'Patricia Souza Andrade',
    passenger_email: 'patricia.sandrade@yahoo.com',
    route_name: 'Passeio Gramado — Família',
    origin: 'Hotel Laghetto Stilo',
    destination: 'Canela + Caracol',
    due_date: '2026-05-08',
    forecast_date: '2026-05-25',
    amount: 1780,
    amount_received: 0,
    status: 'overdue',
    method: 'bank_transfer',
    category: 'Turismo Familiar',
    notes: 'Transferência bancária aguardada. Segundo aviso enviado.',
    created_at: '2026-05-05',
    overdue_days: 9,
  },
  {
    id: 'rec-007',
    booking_ref: 'BK-2026-0118',
    passenger_name: 'Marcos Henrique Cavalcanti',
    passenger_email: 'mhcavalcanti@empresa.com.br',
    route_name: 'VIP Corporativo — Itaim',
    origin: 'Aeroporto Executivo Catarina',
    destination: 'Itaim Bibi',
    due_date: '2026-05-22',
    forecast_date: '2026-05-22',
    amount: 890,
    amount_received: 0,
    status: 'open',
    method: 'invoice',
    category: 'Executivo',
    notes: 'Fatura a emitir após confirmação do departamento de compras.',
    created_at: '2026-05-16',
  },
  {
    id: 'rec-008',
    booking_ref: 'BK-2026-0111',
    passenger_name: 'Juliana Rocha Esteves',
    passenger_email: 'juliana.resteves@gmail.com',
    route_name: 'Litoral Norte — Ubatuba',
    origin: 'São Paulo — Vila Madalena',
    destination: 'Ubatuba Centro',
    due_date: '2026-04-28',
    forecast_date: '2026-05-30',
    amount: 560,
    amount_received: 0,
    status: 'cancelled',
    method: 'credit_card',
    category: 'Passeios',
    notes: 'Cancelado pelo passageiro em 27/04. Reembolso integral processado.',
    created_at: '2026-04-20',
  },
  {
    id: 'rec-009',
    booking_ref: 'BK-2026-0144',
    passenger_name: 'Thiago Barbosa Nunes',
    passenger_email: 'thiagob.nunes@hotmail.com',
    route_name: 'GRU → Faria Lima',
    origin: 'Aeroporto Internacional de Guarulhos',
    destination: 'Faria Lima',
    due_date: '2026-05-18',
    forecast_date: '2026-05-18',
    amount: 310,
    amount_received: 0,
    status: 'open',
    method: 'pix',
    category: 'Transfers Aeroporto',
    notes: '',
    created_at: '2026-05-16',
  },
  {
    id: 'rec-010',
    booking_ref: 'BK-2026-0101',
    passenger_name: 'Luciana Campos Tavares',
    passenger_email: 'luciana.ctavares@gmail.com',
    route_name: 'Noite Gastronômica — D.O.M.',
    origin: 'Hotel Grand Hyatt',
    destination: 'Restaurante D.O.M.',
    due_date: '2026-05-15',
    forecast_date: '2026-05-15',
    amount: 2400,
    amount_received: 2400,
    status: 'received',
    method: 'credit_card',
    category: 'Experiências Privadas',
    notes: 'Pago integralmente no ato da reserva.',
    created_at: '2026-05-10',
  },
];

// ─── Reconciliation ───────────────────────────────────────────────────────────

export const mockReconciliations: MockReconciliation[] = [
  {
    id: 'conc-001',
    reference: 'TXN-2026-04821',
    booking_ref: 'BK-2026-0138',
    passenger_name: 'Carla Mendonça Ribeiro',
    route_name: 'Hotel → Congonhas',
    method: 'credit_card',
    processor: 'Mercado Pago',
    amount_expected: 220,
    amount_received: 220,
    difference: 0,
    status: 'reconciled',
    processed_at: '2026-05-16T14:32:00',
    settlement_date: '2026-05-18',
    gateway_ref: 'MP-8832991-A',
    notes: 'Conciliação automática via webhook.',
  },
  {
    id: 'conc-002',
    reference: 'TXN-2026-04799',
    booking_ref: 'BK-2026-0127',
    passenger_name: 'Gustavo Machado Pires',
    route_name: 'GRU → Paulista Premium',
    method: 'pix',
    processor: 'Banco do Brasil',
    amount_expected: 380,
    amount_received: 380,
    difference: 0,
    status: 'reconciled',
    processed_at: '2026-05-14T09:18:00',
    settlement_date: '2026-05-14',
    gateway_ref: 'PIX-4431-BB',
    notes: '',
  },
  {
    id: 'conc-003',
    reference: 'TXN-2026-04756',
    booking_ref: 'BK-2026-0129',
    passenger_name: 'Roberto Leal Vasconcelos',
    route_name: 'Rota dos Vinhos — Bento G.',
    method: 'invoice',
    processor: 'Boleto Bancário',
    amount_expected: 1300,
    amount_received: 0,
    difference: -1300,
    status: 'pending',
    processed_at: '2026-05-10T00:00:00',
    settlement_date: '2026-05-10',
    gateway_ref: 'BOL-99120-C',
    notes: 'Boleto vencido. Aguardando pagamento ou renegociação.',
  },
  {
    id: 'conc-004',
    reference: 'TXN-2026-04733',
    booking_ref: 'BK-2026-0135',
    passenger_name: 'Fernanda Duarte Lima',
    route_name: 'City Tour SP — Executivo',
    method: 'pix',
    processor: 'Nubank',
    amount_expected: 640,
    amount_received: 320,
    difference: -320,
    status: 'divergent',
    processed_at: '2026-05-15T11:45:00',
    settlement_date: '2026-05-15',
    gateway_ref: 'PIX-7821-NU',
    divergence_reason: 'Recebido 50% (primeira parcela). Segunda parcela pendente.',
    notes: 'Parcelamento informado no ato da reserva.',
  },
  {
    id: 'conc-005',
    reference: 'TXN-2026-04701',
    booking_ref: 'BK-2026-0101',
    passenger_name: 'Luciana Campos Tavares',
    route_name: 'Noite Gastronômica — D.O.M.',
    method: 'credit_card',
    processor: 'Cielo',
    amount_expected: 2400,
    amount_received: 2400,
    difference: 0,
    status: 'reconciled',
    processed_at: '2026-05-10T16:02:00',
    settlement_date: '2026-05-12',
    gateway_ref: 'CIELO-38821-X',
    notes: 'Transação aprovada. Taxa 3.2% (R$ 76,80) descontada.',
  },
  {
    id: 'conc-006',
    reference: 'TXN-2026-04688',
    booking_ref: 'BK-2026-0111',
    passenger_name: 'Juliana Rocha Esteves',
    route_name: 'Litoral Norte — Ubatuba',
    method: 'credit_card',
    processor: 'Mercado Pago',
    amount_expected: 560,
    amount_received: 560,
    difference: 0,
    status: 'reversed',
    processed_at: '2026-04-20T10:15:00',
    settlement_date: '2026-04-28',
    gateway_ref: 'MP-7741001-B',
    divergence_reason: 'Cancelamento solicitado pelo passageiro. Estorno processado integralmente.',
    notes: 'Estorno integral em 27/04. Confirmado pela processadora.',
  },
  {
    id: 'conc-007',
    reference: 'TXN-2026-04655',
    booking_ref: 'BK-2026-0122',
    passenger_name: 'Patricia Souza Andrade',
    route_name: 'Passeio Gramado — Família',
    method: 'bank_transfer',
    processor: 'Itaú Empresas',
    amount_expected: 1780,
    amount_received: 0,
    difference: -1780,
    status: 'in_review',
    processed_at: '2026-05-08T00:00:00',
    settlement_date: '2026-05-08',
    gateway_ref: 'TED-5521-ITA',
    divergence_reason: 'TED não localizada na conta da operação. Em verificação com o banco.',
    notes: 'Passageiro enviou comprovante. Aguardando confirmação bancária.',
  },
  {
    id: 'conc-008',
    reference: 'TXN-2026-04630',
    booking_ref: 'BK-2026-0144',
    passenger_name: 'Thiago Barbosa Nunes',
    route_name: 'GRU → Faria Lima',
    method: 'pix',
    processor: 'Banco do Brasil',
    amount_expected: 310,
    amount_received: 0,
    difference: -310,
    status: 'pending',
    processed_at: '2026-05-16T00:00:00',
    settlement_date: '2026-05-18',
    gateway_ref: 'PIX-PENDING-001',
    notes: 'PIX agendado. Confirmação esperada em 18/05.',
  },
];

// ─── Cashflow Forecast ────────────────────────────────────────────────────────

export const mockCashflowWeekly: CashflowEntry[] = [
  { date: '2026-05-12', label: 'Seg 12', expected: 1420, received: 1420 },
  { date: '2026-05-13', label: 'Ter 13', expected: 890,  received: 890 },
  { date: '2026-05-14', label: 'Qua 14', expected: 760,  received: 760 },
  { date: '2026-05-15', label: 'Qui 15', expected: 3280, received: 2720 },
  { date: '2026-05-16', label: 'Sex 16', expected: 560,  received: 220 },
  { date: '2026-05-17', label: 'Sáb 17', expected: 340,  received: 0 },
  { date: '2026-05-18', label: 'Dom 18', expected: 1200, received: 0 },
];

export const mockCashflowMonthly: CashflowEntry[] = [
  { date: '2026-05-W1', label: 'Sem 1', expected: 8420, received: 7900 },
  { date: '2026-05-W2', label: 'Sem 2', expected: 6910, received: 5010 },
  { date: '2026-05-W3', label: 'Sem 3', expected: 9340, received: 0 },
  { date: '2026-05-W4', label: 'Sem 4', expected: 7280, received: 0 },
];

// ─── Summary Stats ────────────────────────────────────────────────────────────

const totalToReceive = mockReceivables
  .filter((r) => r.status !== 'cancelled' && r.status !== 'received')
  .reduce((s, r) => s + r.amount - r.amount_received, 0);

const receivedToday = mockReceivables
  .filter((r) => r.status === 'received' && r.due_date === '2026-05-16')
  .reduce((s, r) => s + r.amount_received, 0);

const overdueAmount = mockReceivables
  .filter((r) => r.status === 'overdue')
  .reduce((s, r) => s + r.amount, 0);

const openCount = mockReceivables.filter((r) => r.status === 'open').length;
const overdueCount = mockReceivables.filter((r) => r.status === 'overdue').length;
const receivedTotal = mockReceivables.filter((r) => r.status === 'received').reduce((s, r) => s + r.amount_received, 0);
const avgTicket = Math.round(mockReceivables.filter((r) => r.status !== 'cancelled').reduce((s, r) => s + r.amount, 0) / mockReceivables.filter((r) => r.status !== 'cancelled').length);

export const mockReceivablesStats = {
  total_to_receive: totalToReceive,
  received_today: receivedToday,
  open_count: openCount,
  overdue_count: overdueCount,
  overdue_amount: overdueAmount,
  avg_ticket: avgTicket,
  cashflow_forecast: totalToReceive + receivedTotal,
  received_total: receivedTotal,
};

// Reconciliation stats
const conciliatedCount = mockReconciliations.filter((r) => r.status === 'reconciled').length;
const pendingCount = mockReconciliations.filter((r) => r.status === 'pending').length;
const divergentCount = mockReconciliations.filter((r) => r.status === 'divergent').length;
const reversedCount = mockReconciliations.filter((r) => r.status === 'reversed').length;
const totalTransactions = mockReconciliations.length;
const reconciliationRate = Math.round((conciliatedCount / totalTransactions) * 100);

export const mockReconciliationStats = {
  reconciled: conciliatedCount,
  pending: pendingCount,
  divergent: divergentCount,
  reversed: reversedCount,
  total: totalTransactions,
  rate: reconciliationRate,
  avg_processing_hours: 1.8,
  total_divergence: Math.abs(mockReconciliations.filter((r) => r.difference < 0).reduce((s, r) => s + r.difference, 0)),
};

// ─── Labels ───────────────────────────────────────────────────────────────────

export const receivableStatusLabels: Record<ReceivableStatus, string> = {
  open:      'Em aberto',
  received:  'Recebido',
  overdue:   'Atrasado',
  partial:   'Parcial',
  cancelled: 'Cancelado',
};

export const reconciliationStatusLabels: Record<ReconciliationStatus, string> = {
  reconciled: 'Conciliado',
  pending:    'Pendente',
  divergent:  'Divergente',
  reversed:   'Estornado',
  in_review:  'Em análise',
};

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  pix:           'PIX',
  credit_card:   'Cartão de crédito',
  debit_card:    'Cartão de débito',
  bank_transfer: 'Transferência',
  cash:          'Dinheiro',
  invoice:       'Boleto / Fatura',
};

export const paymentMethodIcons: Record<PaymentMethod, string> = {
  pix:           'ri-qr-code-line',
  credit_card:   'ri-bank-card-line',
  debit_card:    'ri-bank-card-2-line',
  bank_transfer: 'ri-bank-line',
  cash:          'ri-money-dollar-box-line',
  invoice:       'ri-file-text-line',
};