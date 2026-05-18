// PLACEHOLDER — schema-aware mock aligned with bookings, passengers, routes, payments tables
// Fields match Supabase schema: bookings.status, scheduled_at, pickup_location, dropoff_location,
// total_amount, passenger_count, payment status from payments table

export type BookingStatus =
  | 'confirmed'
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'rescheduled';

export type PaymentStatus = 'paid' | 'pending' | 'overdue' | 'refunded' | 'partial';

export interface MockPassenger {
  id: string;
  full_name: string;
  document?: string;
  age_group: 'adult' | 'child' | 'senior';
}

export interface MockTimelineEvent {
  id: string;
  event: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
}

export interface MockBooking {
  id: string;
  reference: string;
  tenant_id: string;
  booking_type: 'transfer' | 'experience';
  status: BookingStatus;
  // Passenger principal
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_count: number;
  passengers: MockPassenger[];
  // Route
  pickup_location: string;
  dropoff_location: string;
  route_name: string | null;
  scheduled_at: string;
  created_at: string;
  // Operation
  driver_name: string | null;
  driver_phone: string | null;
  vehicle_name: string | null;
  vehicle_plate: string | null;
  vehicle_type: string | null;
  // Financial
  total_amount: number;
  payment_status: PaymentStatus;
  payment_method: string | null;
  // Extra
  notes: string | null;
  timeline: MockTimelineEvent[];
}

export const mockBookings: MockBooking[] = [
  {
    id: 'bk-001',
    reference: 'BK-0051',
    tenant_id: 't1',
    booking_type: 'transfer',
    status: 'confirmed',
    passenger_name: 'Eduardo Tavares',
    passenger_email: 'eduardo.tavares@email.com',
    passenger_phone: '+55 21 99812-3344',
    passenger_count: 2,
    passengers: [
      { id: 'p1', full_name: 'Eduardo Tavares', document: '012.345.678-90', age_group: 'adult' },
      { id: 'p2', full_name: 'Sofia Tavares', age_group: 'adult' },
    ],
    pickup_location: 'Hotel Fasano, Ipanema',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    route_name: 'Ipanema → GIG',
    scheduled_at: '2026-05-17T16:00:00',
    created_at: '2026-05-12T09:31:00',
    driver_name: 'João Silva',
    driver_phone: '+55 21 98801-2233',
    vehicle_name: 'Mercedes Vito',
    vehicle_plate: 'ABC-1D23',
    vehicle_type: 'Van Premium',
    total_amount: 420,
    payment_status: 'paid',
    payment_method: 'Cartão de Crédito',
    notes: 'Cliente solicita saída pontual às 16h. Voo às 19h30.',
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Reserva registrada via portal.', at: '2026-05-12T09:31:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_confirmed', label: 'Pagamento confirmado', description: 'Cartão de crédito processado com sucesso.', at: '2026-05-12T09:35:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 't3', event: 'driver_assigned', label: 'Motorista atribuído', description: 'João Silva alocado. Mercedes Vito ABC-1D23.', at: '2026-05-13T14:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'bk-002',
    reference: 'BK-0050',
    tenant_id: 't1',
    booking_type: 'transfer',
    status: 'in_progress',
    passenger_name: 'Mariana Costa',
    passenger_email: 'mariana.costa@email.com',
    passenger_phone: '+55 21 97700-5566',
    passenger_count: 4,
    passengers: [
      { id: 'p3', full_name: 'Mariana Costa', document: '987.654.321-00', age_group: 'adult' },
      { id: 'p4', full_name: 'Felipe Costa', age_group: 'adult' },
      { id: 'p5', full_name: 'Laura Costa', age_group: 'child' },
      { id: 'p6', full_name: 'Ana Beatriz Costa', age_group: 'child' },
    ],
    pickup_location: 'Aeroporto Santos Dumont (SDU)',
    dropoff_location: 'Hotel Windsor Leblon',
    route_name: 'SDU → Leblon',
    scheduled_at: '2026-05-17T14:30:00',
    created_at: '2026-05-10T16:22:00',
    driver_name: 'Carlos Mendes',
    driver_phone: '+55 21 99900-7788',
    vehicle_name: 'Toyota Hiace',
    vehicle_plate: 'DEF-2E34',
    vehicle_type: 'Minibus',
    total_amount: 380,
    payment_status: 'paid',
    payment_method: 'PIX',
    notes: null,
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Reserva registrada via integração.', at: '2026-05-10T16:22:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_confirmed', label: 'Pagamento confirmado', description: 'PIX recebido e confirmado.', at: '2026-05-10T16:30:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 't3', event: 'driver_assigned', label: 'Motorista atribuído', description: 'Carlos Mendes — Toyota Hiace DEF-2E34.', at: '2026-05-11T09:15:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 't4', event: 'started', label: 'Transfer iniciado', description: 'Motorista confirmou início do trajeto.', at: '2026-05-17T14:33:00', icon: 'ri-car-line', color: 'navy' },
    ],
  },
  {
    id: 'bk-003',
    reference: 'BK-0049',
    tenant_id: 't1',
    booking_type: 'transfer',
    status: 'completed',
    passenger_name: 'Rafael Andrade',
    passenger_email: 'rafael@andrade.com.br',
    passenger_phone: '+55 21 98234-1122',
    passenger_count: 1,
    passengers: [
      { id: 'p7', full_name: 'Rafael Andrade', document: '456.789.012-11', age_group: 'adult' },
    ],
    pickup_location: 'Copacabana Palace',
    dropoff_location: 'Centro de Convenções',
    route_name: 'Copacabana → Centro',
    scheduled_at: '2026-05-17T10:00:00',
    created_at: '2026-05-14T11:05:00',
    driver_name: 'Ana Ferreira',
    driver_phone: '+55 21 99011-3344',
    vehicle_name: 'Sprinter Premium',
    vehicle_plate: 'GHI-3F45',
    vehicle_type: 'Van Executiva',
    total_amount: 180,
    payment_status: 'paid',
    payment_method: 'Cartão de Crédito',
    notes: null,
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Reserva registrada.', at: '2026-05-14T11:05:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_confirmed', label: 'Pagamento confirmado', description: 'Cartão aprovado.', at: '2026-05-14T11:10:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 't3', event: 'driver_assigned', label: 'Motorista atribuído', description: 'Ana Ferreira — Sprinter Premium.', at: '2026-05-15T08:00:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 't4', event: 'started', label: 'Transfer iniciado', description: 'Partida confirmada.', at: '2026-05-17T10:02:00', icon: 'ri-car-line', color: 'navy' },
      { id: 't5', event: 'completed', label: 'Finalizado', description: 'Passageiro entregue com sucesso.', at: '2026-05-17T10:47:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'bk-004',
    reference: 'BK-0048',
    tenant_id: 't1',
    booking_type: 'experience',
    status: 'confirmed',
    passenger_name: 'Beatriz Lemos',
    passenger_email: 'bia.lemos@outlook.com',
    passenger_phone: '+55 21 97625-8899',
    passenger_count: 6,
    passengers: [
      { id: 'p8', full_name: 'Beatriz Lemos', document: '321.654.987-22', age_group: 'adult' },
      { id: 'p9', full_name: 'Rodrigo Lemos', age_group: 'adult' },
      { id: 'p10', full_name: 'Clara Lemos', age_group: 'adult' },
      { id: 'p11', full_name: 'Theo Lemos', age_group: 'child' },
      { id: 'p12', full_name: 'Isabela Fontes', age_group: 'adult' },
      { id: 'p13', full_name: 'Davi Fontes', age_group: 'adult' },
    ],
    pickup_location: 'Marina da Glória',
    dropoff_location: 'Búzios — Hotel Casas Brancas',
    route_name: 'Rio → Búzios Premium',
    scheduled_at: '2026-05-18T08:00:00',
    created_at: '2026-05-08T14:30:00',
    driver_name: 'Pedro Rocha',
    driver_phone: '+55 22 98800-4455',
    vehicle_name: 'Van Executive',
    vehicle_plate: 'JKL-4G56',
    vehicle_type: 'Van Executiva',
    total_amount: 1200,
    payment_status: 'partial',
    payment_method: 'Transferência Bancária',
    notes: 'Grupo solicita parada em Arraial do Cabo. Confirmar com motorista.',
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Grupo registrado via formulário.', at: '2026-05-08T14:30:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_partial', label: 'Pagamento parcial', description: 'R$ 600 recebidos. Saldo: R$ 600.', at: '2026-05-09T10:00:00', icon: 'ri-money-dollar-circle-line', color: 'amber' },
      { id: 't3', event: 'driver_assigned', label: 'Motorista atribuído', description: 'Pedro Rocha — Van Executive JKL-4G56.', at: '2026-05-10T09:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'bk-005',
    reference: 'BK-0047',
    tenant_id: 't1',
    booking_type: 'transfer',
    status: 'pending',
    passenger_name: 'Lucas Farias',
    passenger_email: 'lucas.farias@corp.com',
    passenger_phone: '+55 21 99344-6677',
    passenger_count: 2,
    passengers: [
      { id: 'p14', full_name: 'Lucas Farias', age_group: 'adult' },
      { id: 'p15', full_name: 'Camila Farias', age_group: 'adult' },
    ],
    pickup_location: 'JW Marriott Rio',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    route_name: 'Barra → GIG',
    scheduled_at: '2026-05-17T19:00:00',
    created_at: '2026-05-15T18:44:00',
    driver_name: null,
    driver_phone: null,
    vehicle_name: null,
    vehicle_plate: null,
    vehicle_type: null,
    total_amount: 520,
    payment_status: 'pending',
    payment_method: null,
    notes: 'Aguardando confirmação de pagamento.',
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Aguardando pagamento e confirmação.', at: '2026-05-15T18:44:00', icon: 'ri-add-circle-line', color: 'stone' },
    ],
  },
  {
    id: 'bk-006',
    reference: 'BK-0046',
    tenant_id: 't1',
    booking_type: 'experience',
    status: 'confirmed',
    passenger_name: 'Fernanda Rocha',
    passenger_email: 'fernanda.rocha@email.com',
    passenger_phone: '+55 21 98567-9900',
    passenger_count: 3,
    passengers: [
      { id: 'p16', full_name: 'Fernanda Rocha', document: '789.012.345-33', age_group: 'adult' },
      { id: 'p17', full_name: 'Paulo Rocha', age_group: 'adult' },
      { id: 'p18', full_name: 'Valentina Rocha', age_group: 'child' },
    ],
    pickup_location: 'Aeroporto do Galeão (GIG)',
    dropoff_location: 'Paraty — Pousada do Príncipe',
    route_name: 'GIG → Paraty Experiência',
    scheduled_at: '2026-05-18T11:00:00',
    created_at: '2026-05-09T20:12:00',
    driver_name: 'João Silva',
    driver_phone: '+55 21 98801-2233',
    vehicle_name: 'Mercedes Vito',
    vehicle_plate: 'ABC-1D23',
    vehicle_type: 'Van Premium',
    total_amount: 950,
    payment_status: 'paid',
    payment_method: 'PIX',
    notes: null,
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Experiência Paraty registrada.', at: '2026-05-09T20:12:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_confirmed', label: 'Pagamento confirmado', description: 'PIX confirmado.', at: '2026-05-09T20:20:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 't3', event: 'driver_assigned', label: 'Motorista atribuído', description: 'João Silva — Mercedes Vito ABC-1D23.', at: '2026-05-11T10:30:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'bk-007',
    reference: 'BK-0045',
    tenant_id: 't1',
    booking_type: 'transfer',
    status: 'cancelled',
    passenger_name: 'André Nascimento',
    passenger_email: 'andre.nascimento@gmail.com',
    passenger_phone: '+55 21 97123-4455',
    passenger_count: 1,
    passengers: [
      { id: 'p19', full_name: 'André Nascimento', age_group: 'adult' },
    ],
    pickup_location: 'Barra da Tijuca',
    dropoff_location: 'Aeroporto Santos Dumont (SDU)',
    route_name: 'Barra → SDU',
    scheduled_at: '2026-05-16T07:00:00',
    created_at: '2026-05-14T08:20:00',
    driver_name: null,
    driver_phone: null,
    vehicle_name: null,
    vehicle_plate: null,
    vehicle_type: null,
    total_amount: 210,
    payment_status: 'refunded',
    payment_method: 'Cartão de Crédito',
    notes: 'Cancelado pelo cliente. Estorno processado.',
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Registrada.', at: '2026-05-14T08:20:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_confirmed', label: 'Pagamento confirmado', description: 'Cartão aprovado.', at: '2026-05-14T08:25:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 't3', event: 'cancelled', label: 'Reserva cancelada', description: 'Cancelado a pedido do cliente.', at: '2026-05-15T15:10:00', icon: 'ri-close-circle-line', color: 'red' },
      { id: 't4', event: 'refunded', label: 'Estorno processado', description: 'Reembolso creditado em 2-5 dias úteis.', at: '2026-05-15T15:12:00', icon: 'ri-refund-2-line', color: 'stone' },
    ],
  },
  {
    id: 'bk-008',
    reference: 'BK-0044',
    tenant_id: 't1',
    booking_type: 'experience',
    status: 'completed',
    passenger_name: 'Camila Souza',
    passenger_email: 'camila.souza@hotmail.com',
    passenger_phone: '+55 21 99456-7788',
    passenger_count: 5,
    passengers: [
      { id: 'p20', full_name: 'Camila Souza', document: '654.321.098-44', age_group: 'adult' },
      { id: 'p21', full_name: 'Bruno Souza', age_group: 'adult' },
      { id: 'p22', full_name: 'Helena Souza', age_group: 'child' },
      { id: 'p23', full_name: 'Mateus Lima', age_group: 'adult' },
      { id: 'p24', full_name: 'Priscila Lima', age_group: 'adult' },
    ],
    pickup_location: 'Ipanema Beach Hotels',
    dropoff_location: 'Cristo Redentor + Pão de Açúcar Tour',
    route_name: 'Tour Pontos Turísticos RJ',
    scheduled_at: '2026-05-17T08:30:00',
    created_at: '2026-05-07T19:00:00',
    driver_name: 'Carlos Mendes',
    driver_phone: '+55 21 99900-7788',
    vehicle_name: 'Toyota Hiace',
    vehicle_plate: 'DEF-2E34',
    vehicle_type: 'Minibus',
    total_amount: 780,
    payment_status: 'paid',
    payment_method: 'Cartão de Crédito',
    notes: null,
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Tour registrado.', at: '2026-05-07T19:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_confirmed', label: 'Pagamento confirmado', description: 'Cartão aprovado.', at: '2026-05-07T19:08:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 't3', event: 'driver_assigned', label: 'Motorista atribuído', description: 'Carlos Mendes — Toyota Hiace.', at: '2026-05-08T09:00:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 't4', event: 'started', label: 'Tour iniciado', description: 'Grupo coletado em Ipanema.', at: '2026-05-17T08:32:00', icon: 'ri-car-line', color: 'navy' },
      { id: 't5', event: 'completed', label: 'Tour finalizado', description: 'Experiência concluída com sucesso.', at: '2026-05-17T15:15:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'bk-009',
    reference: 'BK-0043',
    tenant_id: 't1',
    booking_type: 'transfer',
    status: 'rescheduled',
    passenger_name: 'Isabela Drummond',
    passenger_email: 'isabela.drummond@email.com',
    passenger_phone: '+55 21 98900-2211',
    passenger_count: 2,
    passengers: [
      { id: 'p25', full_name: 'Isabela Drummond', age_group: 'adult' },
      { id: 'p26', full_name: 'Victor Drummond', age_group: 'adult' },
    ],
    pickup_location: 'Hotel Nacional, São Conrado',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    route_name: 'São Conrado → GIG',
    scheduled_at: '2026-05-19T06:30:00',
    created_at: '2026-05-11T10:00:00',
    driver_name: 'Ana Ferreira',
    driver_phone: '+55 21 99011-3344',
    vehicle_name: 'Sprinter Premium',
    vehicle_plate: 'GHI-3F45',
    vehicle_type: 'Van Executiva',
    total_amount: 390,
    payment_status: 'paid',
    payment_method: 'PIX',
    notes: 'Reagendado de 17/05 para 19/05. Voo remarcado pelo cliente.',
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Registrada para 17/05.', at: '2026-05-11T10:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_confirmed', label: 'Pagamento confirmado', description: 'PIX recebido.', at: '2026-05-11T10:05:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 't3', event: 'driver_assigned', label: 'Motorista atribuído', description: 'Ana Ferreira alocada.', at: '2026-05-12T08:00:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 't4', event: 'rescheduled', label: 'Reagendada', description: 'Novo horário: 19/05 às 06h30.', at: '2026-05-16T14:22:00', icon: 'ri-calendar-line', color: 'amber' },
    ],
  },
  {
    id: 'bk-010',
    reference: 'BK-0042',
    tenant_id: 't1',
    booking_type: 'transfer',
    status: 'pending',
    passenger_name: 'Thiago Cavalcanti',
    passenger_email: 'thiago.c@empresa.com',
    passenger_phone: '+55 21 97789-3344',
    passenger_count: 1,
    passengers: [
      { id: 'p27', full_name: 'Thiago Cavalcanti', document: '111.222.333-44', age_group: 'adult' },
    ],
    pickup_location: 'Aeroporto Santos Dumont (SDU)',
    dropoff_location: 'Hotel Fasano, Ipanema',
    route_name: 'SDU → Ipanema',
    scheduled_at: '2026-05-18T21:45:00',
    created_at: '2026-05-16T07:15:00',
    driver_name: null,
    driver_phone: null,
    vehicle_name: null,
    vehicle_plate: null,
    vehicle_type: null,
    total_amount: 290,
    payment_status: 'overdue',
    payment_method: null,
    notes: 'Pagamento vencido. Aguardando regularização.',
    timeline: [
      { id: 't1', event: 'created', label: 'Reserva criada', description: 'Aguardando pagamento.', at: '2026-05-16T07:15:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 't2', event: 'payment_overdue', label: 'Pagamento vencido', description: 'Prazo de pagamento expirado.', at: '2026-05-17T00:00:00', icon: 'ri-alarm-warning-line', color: 'red' },
    ],
  },
];