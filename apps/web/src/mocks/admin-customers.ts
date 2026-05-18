// schema-aware mock aligned with passengers, bookings, payments, routes tables
// CustomerStatus, preferences, booking history all sourced from real schema fields

export type CustomerStatus = 'active' | 'inactive' | 'vip';
export type CustomerPreference =
  | 'aeroporto'
  | 'hotel'
  | 'executivo'
  | 'turismo'
  | 'familia'
  | 'acessibilidade'
  | 'ingles'
  | 'espanhol'
  | 'bagagem_extra';

export interface MockCustomerBooking {
  id: string;
  reference: string;
  route_name: string;
  pickup_location: string;
  dropoff_location: string;
  scheduled_at: string;
  status: 'confirmed' | 'completed' | 'cancelled' | 'pending';
  amount: number;
  payment_status: 'paid' | 'pending' | 'overdue' | 'refunded' | 'partial';
  category: 'transfer' | 'experience';
}

export interface MockCustomerJourneyEvent {
  id: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
}

export interface MockCustomer {
  id: string;
  // Identity
  name: string;
  email: string;
  phone: string;
  document: string | null;
  nationality: string;
  language: string;
  // Status
  status: CustomerStatus;
  created_at: string;
  last_activity_at: string;
  // Booking stats
  total_bookings: number;
  completed_bookings: number;
  cancelled_bookings: number;
  next_booking: MockCustomerBooking | null;
  last_booking: MockCustomerBooking | null;
  recent_bookings: MockCustomerBooking[];
  // Financial
  total_spent: number;
  ticket_medio: number;
  pending_amount: number;
  // Preferences
  preferences: CustomerPreference[];
  notes: string | null;
  // Recurrence
  is_recurring: boolean;
  recurrence_count: number;
  // Journey
  journey: MockCustomerJourneyEvent[];
}

const makeBooking = (
  ref: string,
  route: string,
  pickup: string,
  dropoff: string,
  date: string,
  status: MockCustomerBooking['status'],
  amount: number,
  payStatus: MockCustomerBooking['payment_status'],
  category: MockCustomerBooking['category'] = 'transfer'
): MockCustomerBooking => ({
  id: `bk-${ref}`,
  reference: ref,
  route_name: route,
  pickup_location: pickup,
  dropoff_location: dropoff,
  scheduled_at: date,
  status,
  amount,
  payment_status: payStatus,
  category,
});

export const mockCustomers: MockCustomer[] = [
  {
    id: 'cu-001',
    name: 'Eduardo Tavares',
    email: 'eduardo.tavares@email.com',
    phone: '+55 21 99812-3344',
    document: '123.456.789-10',
    nationality: 'Brasileiro',
    language: 'Português',
    status: 'vip',
    created_at: '2025-11-03T10:00:00',
    last_activity_at: '2026-05-17T09:30:00',
    total_bookings: 14,
    completed_bookings: 12,
    cancelled_bookings: 1,
    next_booking: makeBooking('BK-0051', 'Ipanema → GIG', 'Hotel Fasano, Ipanema', 'Aeroporto do Galeão (GIG)', '2026-05-17T16:00:00', 'confirmed', 420, 'paid'),
    last_booking: makeBooking('BK-0048', 'GIG → Leblon', 'Aeroporto do Galeão', 'Hotel Fasano, Leblon', '2026-05-10T11:00:00', 'completed', 390, 'paid'),
    recent_bookings: [
      makeBooking('BK-0051', 'Ipanema → GIG', 'Hotel Fasano', 'Aeroporto do Galeão', '2026-05-17T16:00:00', 'confirmed', 420, 'paid'),
      makeBooking('BK-0048', 'GIG → Leblon', 'Aeroporto do Galeão', 'Hotel Fasano', '2026-05-10T11:00:00', 'completed', 390, 'paid'),
      makeBooking('BK-0039', 'SDU → Leblon', 'Santos Dumont', 'Hotel Fasano', '2026-04-28T08:00:00', 'completed', 380, 'paid'),
      makeBooking('BK-0031', 'Rio → Búzios Premium', 'Marina da Glória', 'Casas Brancas', '2026-04-12T09:00:00', 'completed', 1200, 'paid', 'experience'),
    ],
    total_spent: 6840,
    ticket_medio: 487,
    pending_amount: 0,
    preferences: ['aeroporto', 'executivo', 'bagagem_extra'],
    notes: 'Hóspede frequente do Hotel Fasano. Prefere veículos executivos. Sempre reserva com antecedência.',
    is_recurring: true,
    recurrence_count: 14,
    journey: [
      { id: 'j1', label: 'Primeiro contato', description: 'Reserva inicial via site.', at: '2025-11-03T10:00:00', icon: 'ri-star-line', color: 'teal' },
      { id: 'j2', label: 'Transfer concluído', description: 'Ipanema → GIG. Avaliação 5 estrelas.', at: '2025-11-03T17:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
      { id: 'j3', label: 'Upgrade para VIP', description: 'Atingiu 5 reservas concluídas.', at: '2026-01-15T00:00:00', icon: 'ri-vip-crown-line', color: 'navy' },
      { id: 'j4', label: 'Experiência Búzios', description: 'Tour premium contratado.', at: '2026-04-12T09:00:00', icon: 'ri-compass-discover-line', color: 'teal' },
      { id: 'j5', label: '14ª reserva', description: 'Cliente fidelizado recorrente.', at: '2026-05-17T16:00:00', icon: 'ri-repeat-line', color: 'navy' },
    ],
  },
  {
    id: 'cu-002',
    name: 'Mariana Costa',
    email: 'mariana.costa@email.com',
    phone: '+55 21 97700-5566',
    document: '987.654.321-00',
    nationality: 'Brasileira',
    language: 'Português',
    status: 'active',
    created_at: '2026-02-14T14:00:00',
    last_activity_at: '2026-05-17T14:30:00',
    total_bookings: 5,
    completed_bookings: 4,
    cancelled_bookings: 0,
    next_booking: makeBooking('BK-0050', 'SDU → Leblon', 'Aeroporto Santos Dumont', 'Hotel Windsor Leblon', '2026-05-17T14:30:00', 'confirmed', 380, 'paid'),
    last_booking: makeBooking('BK-0044', 'Leblon → SDU', 'Windsor Leblon', 'Santos Dumont', '2026-05-08T06:30:00', 'completed', 360, 'paid'),
    recent_bookings: [
      makeBooking('BK-0050', 'SDU → Leblon', 'Santos Dumont', 'Windsor Leblon', '2026-05-17T14:30:00', 'confirmed', 380, 'paid'),
      makeBooking('BK-0044', 'Leblon → SDU', 'Windsor Leblon', 'Santos Dumont', '2026-05-08T06:30:00', 'completed', 360, 'paid'),
      makeBooking('BK-0037', 'GIG → Ipanema', 'Galeão', 'Hotel Ipanema', '2026-04-20T19:00:00', 'completed', 420, 'paid'),
    ],
    total_spent: 1920,
    ticket_medio: 384,
    pending_amount: 0,
    preferences: ['aeroporto', 'hotel'],
    notes: 'Viaja frequentemente entre Leblon e SDU. Pontualidade é prioridade.',
    is_recurring: true,
    recurrence_count: 5,
    journey: [
      { id: 'j1', label: 'Cadastro', description: 'Primeiro booking via indicação.', at: '2026-02-14T14:00:00', icon: 'ri-user-add-line', color: 'stone' },
      { id: 'j2', label: 'Transfer concluído', description: 'SDU → Leblon. Ótimo feedback.', at: '2026-02-14T16:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
      { id: 'j3', label: '5ª reserva', description: 'Cliente recorrente ativo.', at: '2026-05-17T14:30:00', icon: 'ri-repeat-line', color: 'teal' },
    ],
  },
  {
    id: 'cu-003',
    name: 'Beatriz Lemos',
    email: 'bia.lemos@outlook.com',
    phone: '+55 21 97625-8899',
    document: '234.567.890-11',
    nationality: 'Brasileira',
    language: 'Português',
    status: 'active',
    created_at: '2026-03-01T09:00:00',
    last_activity_at: '2026-05-18T08:00:00',
    total_bookings: 3,
    completed_bookings: 1,
    cancelled_bookings: 0,
    next_booking: makeBooking('BK-0048', 'Rio → Búzios Premium', 'Marina da Glória', 'Casas Brancas', '2026-05-18T08:00:00', 'confirmed', 1200, 'partial', 'experience'),
    last_booking: makeBooking('BK-0036', 'GIG → Ipanema', 'Galeão', 'Hotel Ipanema Beach', '2026-04-01T11:00:00', 'completed', 420, 'paid'),
    recent_bookings: [
      makeBooking('BK-0048', 'Rio → Búzios Premium', 'Marina da Glória', 'Casas Brancas', '2026-05-18T08:00:00', 'confirmed', 1200, 'partial', 'experience'),
      makeBooking('BK-0036', 'GIG → Ipanema', 'Galeão', 'Hotel Ipanema Beach', '2026-04-01T11:00:00', 'completed', 420, 'paid'),
      makeBooking('BK-0029', 'Ipanema → SDU', 'Hotel Ipanema Beach', 'Santos Dumont', '2026-03-12T07:00:00', 'completed', 350, 'paid'),
    ],
    total_spent: 1970,
    ticket_medio: 657,
    pending_amount: 600,
    preferences: ['turismo', 'hotel', 'familia'],
    notes: 'Interessa por experiências turísticas premium. Tem filhos pequenos — veículo família preferível.',
    is_recurring: false,
    recurrence_count: 3,
    journey: [
      { id: 'j1', label: 'Cadastro', description: 'Primeira reserva via site.', at: '2026-03-01T09:00:00', icon: 'ri-user-add-line', color: 'stone' },
      { id: 'j2', label: 'Transfer concluído', description: 'Ipanema → SDU sem intercorrências.', at: '2026-03-12T07:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
      { id: 'j3', label: 'Experiência agendada', description: 'Búzios Premium reservado.', at: '2026-05-08T14:30:00', icon: 'ri-compass-discover-line', color: 'navy' },
    ],
  },
  {
    id: 'cu-004',
    name: 'Fernanda Rocha',
    email: 'fernanda.rocha@email.com',
    phone: '+55 21 98567-9900',
    document: '345.678.901-22',
    nationality: 'Brasileira',
    language: 'Português',
    status: 'vip',
    created_at: '2025-09-10T11:00:00',
    last_activity_at: '2026-05-18T11:00:00',
    total_bookings: 18,
    completed_bookings: 16,
    cancelled_bookings: 2,
    next_booking: makeBooking('BK-0046', 'GIG → Paraty Experiência', 'Aeroporto do Galeão', 'Pousada do Príncipe', '2026-05-18T11:00:00', 'confirmed', 950, 'paid', 'experience'),
    last_booking: makeBooking('BK-0041', 'Paraty → GIG', 'Pousada do Príncipe', 'Aeroporto do Galeão', '2026-05-04T07:00:00', 'completed', 950, 'paid', 'experience'),
    recent_bookings: [
      makeBooking('BK-0046', 'GIG → Paraty Experiência', 'Galeão', 'Pousada do Príncipe', '2026-05-18T11:00:00', 'confirmed', 950, 'paid', 'experience'),
      makeBooking('BK-0041', 'Paraty → GIG', 'Pousada do Príncipe', 'Galeão', '2026-05-04T07:00:00', 'completed', 950, 'paid', 'experience'),
      makeBooking('BK-0032', 'GIG → Búzios VIP', 'Galeão', 'Casas Brancas', '2026-04-15T10:00:00', 'completed', 1850, 'paid', 'experience'),
      makeBooking('BK-0024', 'GIG → Paraty', 'Galeão', 'Paraty Centro', '2026-03-22T09:00:00', 'completed', 920, 'paid', 'experience'),
    ],
    total_spent: 12400,
    ticket_medio: 689,
    pending_amount: 0,
    preferences: ['turismo', 'aeroporto', 'hotel', 'ingles', 'espanhol'],
    notes: 'Excelente cliente. Prefere experiências turísticas premium. Bilíngue. Sempre deixa avaliações positivas.',
    is_recurring: true,
    recurrence_count: 18,
    journey: [
      { id: 'j1', label: 'Primeiro contato', description: 'Indicação de parceiro hoteleiro.', at: '2025-09-10T11:00:00', icon: 'ri-star-line', color: 'stone' },
      { id: 'j2', label: 'Cliente VIP', description: 'Promovida após 5ª reserva.', at: '2025-11-20T00:00:00', icon: 'ri-vip-crown-line', color: 'navy' },
      { id: 'j3', label: 'Experiência Búzios VIP', description: 'Package exclusivo contratado.', at: '2026-04-15T10:00:00', icon: 'ri-compass-discover-line', color: 'teal' },
      { id: 'j4', label: '18ª reserva', description: 'Cliente mais fidelizada da operação.', at: '2026-05-18T11:00:00', icon: 'ri-award-line', color: 'teal' },
    ],
  },
  {
    id: 'cu-005',
    name: 'Lucas Farias',
    email: 'lucas.farias@corp.com',
    phone: '+55 21 99344-6677',
    document: '456.789.012-33',
    nationality: 'Brasileiro',
    language: 'Português',
    status: 'active',
    created_at: '2026-04-02T16:00:00',
    last_activity_at: '2026-05-17T19:00:00',
    total_bookings: 2,
    completed_bookings: 0,
    cancelled_bookings: 0,
    next_booking: makeBooking('BK-0047', 'Barra → GIG', 'JW Marriott Rio', 'Aeroporto do Galeão', '2026-05-17T19:00:00', 'confirmed', 520, 'pending'),
    last_booking: makeBooking('BK-0033', 'GIG → Barra', 'Galeão', 'JW Marriott Rio', '2026-04-02T20:00:00', 'completed', 510, 'paid'),
    recent_bookings: [
      makeBooking('BK-0047', 'Barra → GIG', 'JW Marriott Rio', 'Galeão', '2026-05-17T19:00:00', 'confirmed', 520, 'pending'),
      makeBooking('BK-0033', 'GIG → Barra', 'Galeão', 'JW Marriott Rio', '2026-04-02T20:00:00', 'completed', 510, 'paid'),
    ],
    total_spent: 510,
    ticket_medio: 515,
    pending_amount: 520,
    preferences: ['aeroporto', 'executivo'],
    notes: 'Viajante corporativo. Prefere veículo executivo. Pagamento pendente na reserva atual.',
    is_recurring: false,
    recurrence_count: 2,
    journey: [
      { id: 'j1', label: 'Cadastro corporativo', description: 'Reserva via empresa.', at: '2026-04-02T16:00:00', icon: 'ri-building-line', color: 'stone' },
      { id: 'j2', label: 'Transfer concluído', description: 'GIG → Barra. Pontual.', at: '2026-04-02T22:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'cu-006',
    name: 'Renata Borges',
    email: 'renata.borges@gmail.com',
    phone: '+55 21 99001-4422',
    document: '567.890.123-44',
    nationality: 'Brasileira',
    language: 'Português',
    status: 'active',
    created_at: '2026-05-01T10:00:00',
    last_activity_at: '2026-05-16T14:00:00',
    total_bookings: 1,
    completed_bookings: 0,
    cancelled_bookings: 0,
    next_booking: makeBooking('BK-0041', 'GIG → Búzios VIP', 'Aeroporto do Galeão', "Villa D'Este Resort", '2026-05-20T10:00:00', 'confirmed', 1850, 'pending', 'experience'),
    last_booking: null,
    recent_bookings: [
      makeBooking('BK-0041', 'GIG → Búzios VIP', 'Galeão', "Villa D'Este Resort", '2026-05-20T10:00:00', 'confirmed', 1850, 'pending', 'experience'),
    ],
    total_spent: 0,
    ticket_medio: 1850,
    pending_amount: 1850,
    preferences: ['turismo', 'hotel', 'bagagem_extra'],
    notes: 'Nova cliente. Reserva VIP de alto valor. Pagamento ainda pendente.',
    is_recurring: false,
    recurrence_count: 1,
    journey: [
      { id: 'j1', label: 'Primeiro cadastro', description: 'Reserva Búzios VIP de R$ 1.850,00.', at: '2026-05-01T10:00:00', icon: 'ri-user-add-line', color: 'stone' },
      { id: 'j2', label: 'Aguardando pagamento', description: 'Link de pagamento enviado.', at: '2026-05-16T14:01:00', icon: 'ri-time-line', color: 'amber' },
    ],
  },
  {
    id: 'cu-007',
    name: 'Camila Souza',
    email: 'camila.souza@hotmail.com',
    phone: '+55 21 99456-7788',
    document: '678.901.234-55',
    nationality: 'Brasileira',
    language: 'Português',
    status: 'active',
    created_at: '2026-01-20T08:00:00',
    last_activity_at: '2026-05-17T08:30:00',
    total_bookings: 7,
    completed_bookings: 6,
    cancelled_bookings: 0,
    next_booking: makeBooking('BK-0044', 'Tour Pontos Turísticos RJ', 'Ipanema Beach Hotels', 'Cristo + Pão de Açúcar', '2026-05-17T08:30:00', 'confirmed', 780, 'paid', 'experience'),
    last_booking: makeBooking('BK-0038', 'GIG → Ipanema', 'Galeão', 'Hotel Sol Ipanema', '2026-05-01T15:00:00', 'completed', 420, 'paid'),
    recent_bookings: [
      makeBooking('BK-0044', 'Tour Turístico RJ', 'Ipanema Hotels', 'Cristo + Pão de Açúcar', '2026-05-17T08:30:00', 'confirmed', 780, 'paid', 'experience'),
      makeBooking('BK-0038', 'GIG → Ipanema', 'Galeão', 'Hotel Sol Ipanema', '2026-05-01T15:00:00', 'completed', 420, 'paid'),
      makeBooking('BK-0029', 'Tour Búzios Day Trip', 'Ipanema', 'Búzios', '2026-04-10T07:00:00', 'completed', 690, 'paid', 'experience'),
      makeBooking('BK-0020', 'Ipanema → SDU', 'Sol Ipanema', 'Santos Dumont', '2026-03-05T06:00:00', 'completed', 340, 'paid'),
    ],
    total_spent: 3840,
    ticket_medio: 548,
    pending_amount: 0,
    preferences: ['turismo', 'familia', 'hotel'],
    notes: 'Apaixonada por turismo no Rio. Frequentemente reserva tours e experiências para família.',
    is_recurring: true,
    recurrence_count: 7,
    journey: [
      { id: 'j1', label: 'Primeiro tour', description: 'Tour Cristo Redentor. Avaliação 5⭐.', at: '2026-01-20T10:00:00', icon: 'ri-compass-discover-line', color: 'teal' },
      { id: 'j2', label: 'Cliente recorrente', description: 'Atingiu 3 reservas em 60 dias.', at: '2026-02-28T00:00:00', icon: 'ri-repeat-line', color: 'navy' },
      { id: 'j3', label: '7ª reserva', description: 'Tour turístico agendado.', at: '2026-05-17T08:30:00', icon: 'ri-star-line', color: 'teal' },
    ],
  },
  {
    id: 'cu-008',
    name: 'André Nascimento',
    email: 'andre.nascimento@gmail.com',
    phone: '+55 21 97123-4455',
    document: '789.012.345-66',
    nationality: 'Brasileiro',
    language: 'Português',
    status: 'inactive',
    created_at: '2026-03-15T11:00:00',
    last_activity_at: '2026-05-14T08:20:00',
    total_bookings: 2,
    completed_bookings: 1,
    cancelled_bookings: 1,
    next_booking: null,
    last_booking: makeBooking('BK-0045', 'Barra → SDU', 'Barra da Tijuca', 'Santos Dumont', '2026-05-16T07:00:00', 'cancelled', 210, 'refunded'),
    recent_bookings: [
      makeBooking('BK-0045', 'Barra → SDU', 'Barra da Tijuca', 'Santos Dumont', '2026-05-16T07:00:00', 'cancelled', 210, 'refunded'),
      makeBooking('BK-0022', 'SDU → Barra', 'Santos Dumont', 'Barra da Tijuca', '2026-03-15T18:00:00', 'completed', 200, 'paid'),
    ],
    total_spent: 200,
    ticket_medio: 210,
    pending_amount: 0,
    preferences: ['aeroporto'],
    notes: 'Última reserva cancelada. Estorno processado. Sem atividade recente.',
    is_recurring: false,
    recurrence_count: 1,
    journey: [
      { id: 'j1', label: 'Cadastro', description: 'Primeira reserva concluída.', at: '2026-03-15T18:00:00', icon: 'ri-user-add-line', color: 'stone' },
      { id: 'j2', label: 'Reserva cancelada', description: 'Cancelado a pedido — estorno R$ 210,00.', at: '2026-05-15T15:10:00', icon: 'ri-close-circle-line', color: 'red' },
    ],
  },
  {
    id: 'cu-009',
    name: 'Isabela Drummond',
    email: 'isabela.drummond@email.com',
    phone: '+55 21 98900-2211',
    document: '890.123.456-77',
    nationality: 'Brasileira',
    language: 'Português',
    status: 'active',
    created_at: '2026-04-11T09:00:00',
    last_activity_at: '2026-05-11T10:00:00',
    total_bookings: 2,
    completed_bookings: 1,
    cancelled_bookings: 0,
    next_booking: makeBooking('BK-0043', 'São Conrado → GIG', 'Hotel Nacional', 'Aeroporto do Galeão', '2026-05-19T06:30:00', 'confirmed', 390, 'paid'),
    last_booking: makeBooking('BK-0038', 'GIG → São Conrado', 'Galeão', 'Hotel Nacional', '2026-04-11T14:00:00', 'completed', 380, 'paid'),
    recent_bookings: [
      makeBooking('BK-0043', 'São Conrado → GIG', 'Hotel Nacional', 'Galeão', '2026-05-19T06:30:00', 'confirmed', 390, 'paid'),
      makeBooking('BK-0038', 'GIG → São Conrado', 'Galeão', 'Hotel Nacional', '2026-04-11T14:00:00', 'completed', 380, 'paid'),
    ],
    total_spent: 380,
    ticket_medio: 385,
    pending_amount: 0,
    preferences: ['aeroporto', 'hotel'],
    notes: 'Reagendou última reserva de 17/05 para 19/05. Hospedada no Hotel Nacional.',
    is_recurring: false,
    recurrence_count: 2,
    journey: [
      { id: 'j1', label: 'Cadastro', description: 'Reserva GIG → São Conrado.', at: '2026-04-11T09:00:00', icon: 'ri-user-add-line', color: 'stone' },
      { id: 'j2', label: 'Transfer concluído', description: 'GIG → Hotel Nacional sem problemas.', at: '2026-04-11T16:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
      { id: 'j3', label: 'Reagendamento', description: 'Próximo transfer movido para 19/05.', at: '2026-05-16T14:22:00', icon: 'ri-calendar-line', color: 'amber' },
    ],
  },
  {
    id: 'cu-010',
    name: 'Thiago Cavalcanti',
    email: 'thiago.c@empresa.com',
    phone: '+55 21 97789-3344',
    document: '901.234.567-88',
    nationality: 'Brasileiro',
    language: 'Português',
    status: 'active',
    created_at: '2026-05-16T07:00:00',
    last_activity_at: '2026-05-16T07:15:00',
    total_bookings: 1,
    completed_bookings: 0,
    cancelled_bookings: 0,
    next_booking: makeBooking('BK-0042', 'SDU → Ipanema', 'Santos Dumont', 'Hotel Fasano', '2026-05-18T21:45:00', 'pending', 290, 'overdue'),
    last_booking: null,
    recent_bookings: [
      makeBooking('BK-0042', 'SDU → Ipanema', 'Santos Dumont', 'Hotel Fasano', '2026-05-18T21:45:00', 'pending', 290, 'overdue'),
    ],
    total_spent: 0,
    ticket_medio: 290,
    pending_amount: 290,
    preferences: ['aeroporto', 'executivo'],
    notes: 'Pagamento vencido. Necessário regularização urgente antes do embarque.',
    is_recurring: false,
    recurrence_count: 1,
    journey: [
      { id: 'j1', label: 'Cadastro', description: 'Reserva SDU → Ipanema registrada.', at: '2026-05-16T07:00:00', icon: 'ri-user-add-line', color: 'stone' },
      { id: 'j2', label: 'Pagamento vencido', description: 'Prazo expirou sem confirmação.', at: '2026-05-17T00:00:00', icon: 'ri-alarm-warning-line', color: 'red' },
    ],
  },
  {
    id: 'cu-011',
    name: 'Gustavo Henrique',
    email: 'gustavo.h@corp.com.br',
    phone: '+55 21 98234-5511',
    document: '012.345.678-99',
    nationality: 'Brasileiro',
    language: 'Português',
    status: 'active',
    created_at: '2026-02-05T08:00:00',
    last_activity_at: '2026-05-17T06:00:00',
    total_bookings: 6,
    completed_bookings: 5,
    cancelled_bookings: 0,
    next_booking: makeBooking('BK-0040', 'Corporativo Barra', 'Hotel Intercontinental', 'Centro Empresarial', '2026-05-18T07:30:00', 'confirmed', 240, 'paid'),
    last_booking: makeBooking('BK-0034', 'Centro → Intercontinental', 'Centro Empresarial', 'Hotel Intercontinental', '2026-05-12T19:00:00', 'completed', 240, 'paid'),
    recent_bookings: [
      makeBooking('BK-0040', 'Corporativo Barra', 'Intercontinental', 'Centro Empresarial', '2026-05-18T07:30:00', 'confirmed', 240, 'paid'),
      makeBooking('BK-0034', 'Centro → Intercontinental', 'Centro Empresarial', 'Intercontinental', '2026-05-12T19:00:00', 'completed', 240, 'paid'),
      makeBooking('BK-0028', 'Corporativo Barra', 'Intercontinental', 'Centro Empresarial', '2026-04-28T07:30:00', 'completed', 240, 'paid'),
      makeBooking('BK-0021', 'Corporativo Barra', 'Intercontinental', 'Centro Empresarial', '2026-04-07T07:30:00', 'completed', 240, 'paid'),
    ],
    total_spent: 1200,
    ticket_medio: 240,
    pending_amount: 0,
    preferences: ['executivo', 'aeroporto'],
    notes: 'Rotina corporativa fixa. Sempre mesmo trajeto Barra ↔ Centro Empresarial.',
    is_recurring: true,
    recurrence_count: 6,
    journey: [
      { id: 'j1', label: 'Cadastro corporativo', description: 'Contrato corporativo firmado.', at: '2026-02-05T08:00:00', icon: 'ri-building-line', color: 'stone' },
      { id: 'j2', label: 'Recorrência estabelecida', description: 'Routine semanal confirmada.', at: '2026-03-01T00:00:00', icon: 'ri-repeat-line', color: 'navy' },
      { id: 'j3', label: '6ª reserva', description: 'Rotina corporativa em andamento.', at: '2026-05-18T07:30:00', icon: 'ri-calendar-check-line', color: 'teal' },
    ],
  },
  {
    id: 'cu-012',
    name: 'Rafael Andrade',
    email: 'rafael@andrade.com.br',
    phone: '+55 21 98234-1122',
    document: '111.222.333-44',
    nationality: 'Brasileiro',
    language: 'Português',
    status: 'vip',
    created_at: '2025-10-15T12:00:00',
    last_activity_at: '2026-05-17T10:00:00',
    total_bookings: 11,
    completed_bookings: 10,
    cancelled_bookings: 1,
    next_booking: makeBooking('BK-0049', 'Copacabana → Centro', 'Copacabana Palace', 'Centro de Convenções', '2026-05-17T10:00:00', 'confirmed', 180, 'paid'),
    last_booking: makeBooking('BK-0043', 'Centro → Copacabana', 'Centro de Convenções', 'Copacabana Palace', '2026-05-10T18:00:00', 'completed', 180, 'paid'),
    recent_bookings: [
      makeBooking('BK-0049', 'Copacabana → Centro', 'Copacabana Palace', 'Centro de Convenções', '2026-05-17T10:00:00', 'confirmed', 180, 'paid'),
      makeBooking('BK-0043', 'Centro → Copacabana', 'Centro de Convenções', 'Copacabana Palace', '2026-05-10T18:00:00', 'completed', 180, 'paid'),
      makeBooking('BK-0037', 'Copacabana → GIG', 'Copacabana Palace', 'Galeão', '2026-04-22T05:30:00', 'completed', 410, 'paid'),
      makeBooking('BK-0030', 'GIG → Copacabana', 'Galeão', 'Copacabana Palace', '2026-04-08T19:00:00', 'completed', 410, 'paid'),
    ],
    total_spent: 3840,
    ticket_medio: 349,
    pending_amount: 0,
    preferences: ['aeroporto', 'hotel', 'executivo'],
    notes: 'Hóspede frequente do Copacabana Palace. Reserva mista: transfers aeroporto e trajetos corporativos.',
    is_recurring: true,
    recurrence_count: 11,
    journey: [
      { id: 'j1', label: 'Primeiro contato', description: 'Reserva via Copacabana Palace.', at: '2025-10-15T12:00:00', icon: 'ri-star-line', color: 'stone' },
      { id: 'j2', label: 'Cliente VIP', description: 'Promovido após 5ª reserva concluída.', at: '2025-12-10T00:00:00', icon: 'ri-vip-crown-line', color: 'navy' },
      { id: 'j3', label: '11ª reserva', description: 'Rotina ativa Copacabana ↔ GIG.', at: '2026-05-17T10:00:00', icon: 'ri-repeat-line', color: 'teal' },
    ],
  },
];

export const mockCustomerStats = {
  total_ativos: mockCustomers.filter((c) => c.status !== 'inactive').length,
  novos_clientes: mockCustomers.filter((c) => c.created_at >= '2026-05-01').length,
  recorrentes: mockCustomers.filter((c) => c.is_recurring).length,
  reservas_por_cliente: Math.round(
    mockCustomers.reduce((a, c) => a + c.total_bookings, 0) / mockCustomers.length
  ),
  ticket_medio: Math.round(
    mockCustomers.filter((c) => c.total_spent > 0).reduce((a, c) => a + c.ticket_medio, 0) /
    Math.max(mockCustomers.filter((c) => c.total_spent > 0).length, 1)
  ),
  valor_total: mockCustomers.reduce((a, c) => a + c.total_spent, 0),
  vip_count: mockCustomers.filter((c) => c.status === 'vip').length,
  overdue_count: mockCustomers.filter((c) => c.pending_amount > 0).length,
};

export const preferenceLabels: Record<CustomerPreference, string> = {
  aeroporto: 'Aeroporto',
  hotel: 'Hotel',
  executivo: 'Executivo',
  turismo: 'Turismo',
  familia: 'Família',
  acessibilidade: 'Acessibilidade',
  ingles: 'Inglês',
  espanhol: 'Espanhol',
  bagagem_extra: 'Bagagem Extra',
};

export const preferenceIcons: Record<CustomerPreference, string> = {
  aeroporto: 'ri-flight-takeoff-line',
  hotel: 'ri-hotel-line',
  executivo: 'ri-briefcase-4-line',
  turismo: 'ri-compass-discover-line',
  familia: 'ri-parent-line',
  acessibilidade: 'ri-wheelchair-line',
  ingles: 'ri-global-line',
  espanhol: 'ri-translate-2',
  bagagem_extra: 'ri-luggage-cart-line',
};