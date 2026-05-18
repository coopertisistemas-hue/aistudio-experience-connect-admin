// PLACEHOLDER — schema-aware mock aligned with payments, bookings, passengers, routes tables
// Fields match Supabase schema: payments.status, amount, payment_method, paid_at, due_at

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'partial' | 'refunded' | 'cancelled';

export type PaymentMethod =
  | 'pix'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'cash'
  | 'payment_link';

export interface MockPaymentEvent {
  id: string;
  event: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
  amount?: number;
}

export interface MockPayment {
  id: string;
  reference: string;
  booking_reference: string;
  booking_id: string;
  tenant_id: string;
  // Passenger
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  // Route
  route_name: string;
  pickup_location: string;
  dropoff_location: string;
  category: 'transfer' | 'experience';
  scheduled_at: string;
  // Financial
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  status: PaymentStatus;
  method: PaymentMethod | null;
  // Dates
  created_at: string;
  due_at: string | null;
  paid_at: string | null;
  overdue_since?: string;
  refunded_at?: string;
  // Extra
  installments?: number;
  notes: string | null;
  receipt_url?: string;
  payment_link?: string;
  timeline: MockPaymentEvent[];
}

const methodLabel: Record<PaymentMethod, string> = {
  pix:          'PIX',
  credit_card:  'Cartão de Crédito',
  debit_card:   'Cartão de Débito',
  bank_transfer:'Transferência Bancária',
  cash:         'Dinheiro',
  payment_link: 'Link de Pagamento',
};

export { methodLabel };

export const mockPayments: MockPayment[] = [
  {
    id: 'py-001',
    reference: 'PAY-0051',
    booking_reference: 'BK-0051',
    booking_id: 'bk-001',
    tenant_id: 't1',
    passenger_name: 'Eduardo Tavares',
    passenger_email: 'eduardo.tavares@email.com',
    passenger_phone: '+55 21 99812-3344',
    route_name: 'Ipanema → GIG',
    pickup_location: 'Hotel Fasano, Ipanema',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    category: 'transfer',
    scheduled_at: '2026-05-17T16:00:00',
    total_amount: 420,
    paid_amount: 420,
    pending_amount: 0,
    status: 'paid',
    method: 'credit_card',
    created_at: '2026-05-12T09:31:00',
    due_at: '2026-05-14T23:59:00',
    paid_at: '2026-05-12T09:35:00',
    installments: 1,
    notes: null,
    receipt_url: '#',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança gerada automaticamente.', at: '2026-05-12T09:31:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'paid', label: 'Pagamento confirmado', description: 'Cartão de crédito aprovado — R$ 420,00.', at: '2026-05-12T09:35:00', icon: 'ri-checkbox-circle-line', color: 'teal', amount: 420 },
    ],
  },
  {
    id: 'py-002',
    reference: 'PAY-0050',
    booking_reference: 'BK-0050',
    booking_id: 'bk-002',
    tenant_id: 't1',
    passenger_name: 'Mariana Costa',
    passenger_email: 'mariana.costa@email.com',
    passenger_phone: '+55 21 97700-5566',
    route_name: 'SDU → Leblon',
    pickup_location: 'Aeroporto Santos Dumont (SDU)',
    dropoff_location: 'Hotel Windsor Leblon',
    category: 'transfer',
    scheduled_at: '2026-05-17T14:30:00',
    total_amount: 380,
    paid_amount: 380,
    pending_amount: 0,
    status: 'paid',
    method: 'pix',
    created_at: '2026-05-10T16:22:00',
    due_at: '2026-05-12T23:59:00',
    paid_at: '2026-05-10T16:30:00',
    notes: null,
    receipt_url: '#',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança gerada via portal.', at: '2026-05-10T16:22:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'paid', label: 'PIX recebido', description: 'Transferência PIX confirmada — R$ 380,00.', at: '2026-05-10T16:30:00', icon: 'ri-checkbox-circle-line', color: 'teal', amount: 380 },
    ],
  },
  {
    id: 'py-003',
    reference: 'PAY-0049',
    booking_reference: 'BK-0049',
    booking_id: 'bk-003',
    tenant_id: 't1',
    passenger_name: 'Rafael Andrade',
    passenger_email: 'rafael@andrade.com.br',
    passenger_phone: '+55 21 98234-1122',
    route_name: 'Copacabana → Centro',
    pickup_location: 'Copacabana Palace',
    dropoff_location: 'Centro de Convenções',
    category: 'transfer',
    scheduled_at: '2026-05-17T10:00:00',
    total_amount: 180,
    paid_amount: 180,
    pending_amount: 0,
    status: 'paid',
    method: 'credit_card',
    created_at: '2026-05-14T11:05:00',
    due_at: '2026-05-15T23:59:00',
    paid_at: '2026-05-14T11:10:00',
    notes: null,
    receipt_url: '#',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança gerada.', at: '2026-05-14T11:05:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'paid', label: 'Cartão aprovado', description: 'Pagamento aprovado — R$ 180,00.', at: '2026-05-14T11:10:00', icon: 'ri-checkbox-circle-line', color: 'teal', amount: 180 },
    ],
  },
  {
    id: 'py-004',
    reference: 'PAY-0048',
    booking_reference: 'BK-0048',
    booking_id: 'bk-004',
    tenant_id: 't1',
    passenger_name: 'Beatriz Lemos',
    passenger_email: 'bia.lemos@outlook.com',
    passenger_phone: '+55 21 97625-8899',
    route_name: 'Rio → Búzios Premium',
    pickup_location: 'Marina da Glória',
    dropoff_location: 'Búzios — Hotel Casas Brancas',
    category: 'experience',
    scheduled_at: '2026-05-18T08:00:00',
    total_amount: 1200,
    paid_amount: 600,
    pending_amount: 600,
    status: 'partial',
    method: 'bank_transfer',
    created_at: '2026-05-08T14:30:00',
    due_at: '2026-05-17T23:59:00',
    paid_at: null,
    notes: 'Primeiro pagamento de R$ 600 recebido. Saldo de R$ 600 vence hoje.',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança total de R$ 1.200,00 gerada.', at: '2026-05-08T14:30:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'partial', label: 'Pagamento parcial', description: 'R$ 600,00 recebidos via transferência.', at: '2026-05-09T10:00:00', icon: 'ri-money-dollar-circle-line', color: 'amber', amount: 600 },
    ],
  },
  {
    id: 'py-005',
    reference: 'PAY-0047',
    booking_reference: 'BK-0047',
    booking_id: 'bk-005',
    tenant_id: 't1',
    passenger_name: 'Lucas Farias',
    passenger_email: 'lucas.farias@corp.com',
    passenger_phone: '+55 21 99344-6677',
    route_name: 'Barra → GIG',
    pickup_location: 'JW Marriott Rio',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    category: 'transfer',
    scheduled_at: '2026-05-17T19:00:00',
    total_amount: 520,
    paid_amount: 0,
    pending_amount: 520,
    status: 'pending',
    method: null,
    created_at: '2026-05-15T18:44:00',
    due_at: '2026-05-17T12:00:00',
    paid_at: null,
    payment_link: '#',
    notes: 'Aguardando seleção de método e confirmação.',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Aguardando pagamento de R$ 520,00.', at: '2026-05-15T18:44:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'link_sent', label: 'Link enviado', description: 'Link de pagamento enviado por e-mail.', at: '2026-05-15T18:45:00', icon: 'ri-link', color: 'navy' },
    ],
  },
  {
    id: 'py-006',
    reference: 'PAY-0046',
    booking_reference: 'BK-0046',
    booking_id: 'bk-006',
    tenant_id: 't1',
    passenger_name: 'Fernanda Rocha',
    passenger_email: 'fernanda.rocha@email.com',
    passenger_phone: '+55 21 98567-9900',
    route_name: 'GIG → Paraty Experiência',
    pickup_location: 'Aeroporto do Galeão (GIG)',
    dropoff_location: 'Paraty — Pousada do Príncipe',
    category: 'experience',
    scheduled_at: '2026-05-18T11:00:00',
    total_amount: 950,
    paid_amount: 950,
    pending_amount: 0,
    status: 'paid',
    method: 'pix',
    created_at: '2026-05-09T20:12:00',
    due_at: '2026-05-11T23:59:00',
    paid_at: '2026-05-09T20:20:00',
    notes: null,
    receipt_url: '#',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança de R$ 950,00 gerada.', at: '2026-05-09T20:12:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'paid', label: 'PIX confirmado', description: 'Pagamento integral recebido.', at: '2026-05-09T20:20:00', icon: 'ri-checkbox-circle-line', color: 'teal', amount: 950 },
    ],
  },
  {
    id: 'py-007',
    reference: 'PAY-0045',
    booking_reference: 'BK-0045',
    booking_id: 'bk-007',
    tenant_id: 't1',
    passenger_name: 'André Nascimento',
    passenger_email: 'andre.nascimento@gmail.com',
    passenger_phone: '+55 21 97123-4455',
    route_name: 'Barra → SDU',
    pickup_location: 'Barra da Tijuca',
    dropoff_location: 'Aeroporto Santos Dumont (SDU)',
    category: 'transfer',
    scheduled_at: '2026-05-16T07:00:00',
    total_amount: 210,
    paid_amount: 0,
    pending_amount: 0,
    status: 'refunded',
    method: 'credit_card',
    created_at: '2026-05-14T08:20:00',
    due_at: '2026-05-15T23:59:00',
    paid_at: '2026-05-14T08:25:00',
    refunded_at: '2026-05-15T15:12:00',
    notes: 'Estorno processado. Prazo 2-5 dias úteis no cartão.',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança gerada.', at: '2026-05-14T08:20:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'paid', label: 'Cartão aprovado', description: 'R$ 210,00 processados.', at: '2026-05-14T08:25:00', icon: 'ri-checkbox-circle-line', color: 'teal', amount: 210 },
      { id: 'e3', event: 'cancelled', label: 'Reserva cancelada', description: 'Cancelado a pedido do cliente.', at: '2026-05-15T15:10:00', icon: 'ri-close-circle-line', color: 'red' },
      { id: 'e4', event: 'refunded', label: 'Estorno processado', description: 'R$ 210,00 estornados ao cartão.', at: '2026-05-15T15:12:00', icon: 'ri-refund-2-line', color: 'stone', amount: 210 },
    ],
  },
  {
    id: 'py-008',
    reference: 'PAY-0044',
    booking_reference: 'BK-0044',
    booking_id: 'bk-008',
    tenant_id: 't1',
    passenger_name: 'Camila Souza',
    passenger_email: 'camila.souza@hotmail.com',
    passenger_phone: '+55 21 99456-7788',
    route_name: 'Tour Pontos Turísticos RJ',
    pickup_location: 'Ipanema Beach Hotels',
    dropoff_location: 'Cristo Redentor + Pão de Açúcar Tour',
    category: 'experience',
    scheduled_at: '2026-05-17T08:30:00',
    total_amount: 780,
    paid_amount: 780,
    pending_amount: 0,
    status: 'paid',
    method: 'credit_card',
    created_at: '2026-05-07T19:00:00',
    due_at: '2026-05-09T23:59:00',
    paid_at: '2026-05-07T19:08:00',
    installments: 2,
    notes: null,
    receipt_url: '#',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança de R$ 780,00 gerada.', at: '2026-05-07T19:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'paid', label: 'Cartão aprovado', description: 'Parcelado em 2x — R$ 780,00.', at: '2026-05-07T19:08:00', icon: 'ri-checkbox-circle-line', color: 'teal', amount: 780 },
    ],
  },
  {
    id: 'py-009',
    reference: 'PAY-0043',
    booking_reference: 'BK-0043',
    booking_id: 'bk-009',
    tenant_id: 't1',
    passenger_name: 'Isabela Drummond',
    passenger_email: 'isabela.drummond@email.com',
    passenger_phone: '+55 21 98900-2211',
    route_name: 'São Conrado → GIG',
    pickup_location: 'Hotel Nacional, São Conrado',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    category: 'transfer',
    scheduled_at: '2026-05-19T06:30:00',
    total_amount: 390,
    paid_amount: 390,
    pending_amount: 0,
    status: 'paid',
    method: 'pix',
    created_at: '2026-05-11T10:00:00',
    due_at: '2026-05-13T23:59:00',
    paid_at: '2026-05-11T10:05:00',
    notes: 'Reagendado de 17/05 para 19/05.',
    receipt_url: '#',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança gerada para 17/05.', at: '2026-05-11T10:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'paid', label: 'PIX confirmado', description: 'R$ 390,00 recebidos.', at: '2026-05-11T10:05:00', icon: 'ri-checkbox-circle-line', color: 'teal', amount: 390 },
      { id: 'e3', event: 'rescheduled', label: 'Reserva reagendada', description: 'Pagamento mantido para nova data.', at: '2026-05-16T14:22:00', icon: 'ri-calendar-line', color: 'amber' },
    ],
  },
  {
    id: 'py-010',
    reference: 'PAY-0042',
    booking_reference: 'BK-0042',
    booking_id: 'bk-010',
    tenant_id: 't1',
    passenger_name: 'Thiago Cavalcanti',
    passenger_email: 'thiago.c@empresa.com',
    passenger_phone: '+55 21 97789-3344',
    route_name: 'SDU → Ipanema',
    pickup_location: 'Aeroporto Santos Dumont (SDU)',
    dropoff_location: 'Hotel Fasano, Ipanema',
    category: 'transfer',
    scheduled_at: '2026-05-18T21:45:00',
    total_amount: 290,
    paid_amount: 0,
    pending_amount: 290,
    status: 'overdue',
    method: null,
    created_at: '2026-05-16T07:15:00',
    due_at: '2026-05-17T00:00:00',
    paid_at: null,
    overdue_since: '2026-05-17T00:00:00',
    payment_link: '#',
    notes: 'Prazo de pagamento expirado. Aguardando regularização urgente.',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Aguardando pagamento de R$ 290,00.', at: '2026-05-16T07:15:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'link_sent', label: 'Link de pagamento enviado', description: 'E-mail enviado com link de pagamento.', at: '2026-05-16T07:16:00', icon: 'ri-link', color: 'navy' },
      { id: 'e3', event: 'overdue', label: 'Pagamento vencido', description: 'Prazo expirado sem confirmação.', at: '2026-05-17T00:00:00', icon: 'ri-alarm-warning-line', color: 'red' },
    ],
  },
  {
    id: 'py-011',
    reference: 'PAY-0041',
    booking_reference: 'BK-0041',
    booking_id: 'bk-011',
    tenant_id: 't1',
    passenger_name: 'Renata Borges',
    passenger_email: 'renata.borges@gmail.com',
    passenger_phone: '+55 21 99001-4422',
    route_name: 'GIG → Búzios VIP',
    pickup_location: 'Aeroporto do Galeão (GIG)',
    dropoff_location: 'Búzios — Villa D\'Este Resort',
    category: 'experience',
    scheduled_at: '2026-05-20T10:00:00',
    total_amount: 1850,
    paid_amount: 0,
    pending_amount: 1850,
    status: 'pending',
    method: null,
    created_at: '2026-05-16T14:00:00',
    due_at: '2026-05-19T23:59:00',
    paid_at: null,
    payment_link: '#',
    notes: 'Grupo VIP. Aguardando confirmação de pagamento completo.',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança de R$ 1.850,00 gerada.', at: '2026-05-16T14:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'link_sent', label: 'Link enviado', description: 'Link de pagamento premium enviado.', at: '2026-05-16T14:01:00', icon: 'ri-link', color: 'navy' },
    ],
  },
  {
    id: 'py-012',
    reference: 'PAY-0040',
    booking_reference: 'BK-0040',
    booking_id: 'bk-012',
    tenant_id: 't1',
    passenger_name: 'Gustavo Henrique',
    passenger_email: 'gustavo.h@corp.com.br',
    passenger_phone: '+55 21 98234-5511',
    route_name: 'Corporativo Centro RJ',
    pickup_location: 'Hotel Intercontinental, Barra',
    dropoff_location: 'Centro Empresarial — Barra da Tijuca',
    category: 'transfer',
    scheduled_at: '2026-05-18T07:30:00',
    total_amount: 240,
    paid_amount: 240,
    pending_amount: 0,
    status: 'paid',
    method: 'cash',
    created_at: '2026-05-17T06:00:00',
    due_at: '2026-05-18T07:30:00',
    paid_at: '2026-05-17T16:30:00',
    notes: 'Pagamento em dinheiro na hora do embarque.',
    timeline: [
      { id: 'e1', event: 'created', label: 'Pagamento criado', description: 'Cobrança gerada.', at: '2026-05-17T06:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', event: 'paid', label: 'Pago em dinheiro', description: 'R$ 240,00 recebidos em espécie.', at: '2026-05-17T16:30:00', icon: 'ri-money-dollar-circle-line', color: 'teal', amount: 240 },
    ],
  },
];

export const mockPaymentStats = {
  receita_confirmada: mockPayments.filter((p) => p.status === 'paid').reduce((a, p) => a + p.paid_amount, 0),
  pendentes: mockPayments.filter((p) => p.status === 'pending').reduce((a, p) => a + p.pending_amount, 0),
  atrasados: mockPayments.filter((p) => p.status === 'overdue').reduce((a, p) => a + p.pending_amount, 0),
  ticket_medio: Math.round(
    mockPayments.filter((p) => p.status === 'paid').reduce((a, p) => a + p.total_amount, 0) /
    Math.max(mockPayments.filter((p) => p.status === 'paid').length, 1)
  ),
  reembolsos: mockPayments.filter((p) => p.status === 'refunded').reduce((a, p) => a + p.total_amount, 0),
  taxa_conversao: Math.round(
    (mockPayments.filter((p) => p.status === 'paid').length / mockPayments.length) * 100
  ),
  overdue_count: mockPayments.filter((p) => p.status === 'overdue').length,
  pending_count: mockPayments.filter((p) => p.status === 'pending').length,
  partial_count: mockPayments.filter((p) => p.status === 'partial').length,
};