export type AgendaStatus =
  | 'scheduled'
  | 'driver_assigned'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'cancelled';

export type AgendaConflictType =
  | 'driver_double'
  | 'vehicle_double'
  | 'time_overlap'
  | 'capacity_exceeded'
  | 'operational_delay';

export interface AgendaDriver {
  id: string;
  name: string;
  initials: string;
  phone: string;
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_type: string;
  vehicle_capacity: number;
}

export interface AgendaTimelineEvent {
  id: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
}

export interface AgendaItem {
  id: string;
  reference: string;
  booking_type: 'transfer' | 'experience';
  status: AgendaStatus;
  scheduled_at: string;
  estimated_duration_min: number;
  pickup_location: string;
  dropoff_location: string;
  route_name: string | null;
  driver: AgendaDriver | null;
  passenger_name: string;
  passenger_count: number;
  notes: string | null;
  timeline: AgendaTimelineEvent[];
}

export interface AgendaConflict {
  id: string;
  type: AgendaConflictType;
  severity: 'warning' | 'critical';
  label: string;
  description: string;
  affected_item_ids: string[];
}

export const mockDrivers: AgendaDriver[] = [
  { id: 'drv-1', name: 'João Silva', initials: 'JS', phone: '+55 21 98801-2233', vehicle_name: 'Mercedes Vito', vehicle_plate: 'ABC-1D23', vehicle_type: 'Van Premium', vehicle_capacity: 8 },
  { id: 'drv-2', name: 'Carlos Mendes', initials: 'CM', phone: '+55 21 99900-7788', vehicle_name: 'Toyota Hiace', vehicle_plate: 'DEF-2E34', vehicle_type: 'Minibus', vehicle_capacity: 14 },
  { id: 'drv-3', name: 'Ana Ferreira', initials: 'AF', phone: '+55 21 99011-3344', vehicle_name: 'Sprinter Premium', vehicle_plate: 'GHI-3F45', vehicle_type: 'Van Executiva', vehicle_capacity: 10 },
  { id: 'drv-4', name: 'Pedro Rocha', initials: 'PR', phone: '+55 22 98800-4455', vehicle_name: 'Van Executive', vehicle_plate: 'JKL-4G56', vehicle_type: 'Van Executiva', vehicle_capacity: 8 },
];

export const mockAgendaItems: AgendaItem[] = [
  // TODAY — 2026-05-17
  {
    id: 'ag-001',
    reference: 'BK-0044',
    booking_type: 'experience',
    status: 'completed',
    scheduled_at: '2026-05-17T08:30:00',
    estimated_duration_min: 405,
    pickup_location: 'Ipanema Beach Hotels',
    dropoff_location: 'Cristo Redentor + Pão de Açúcar Tour',
    route_name: 'Tour Pontos Turísticos RJ',
    driver: mockDrivers[1],
    passenger_name: 'Camila Souza',
    passenger_count: 5,
    notes: null,
    timeline: [
      { id: 'e1', label: 'Transfer iniciado', description: 'Partida confirmada em Ipanema.', at: '2026-05-17T08:32:00', icon: 'ri-car-line', color: 'navy' },
      { id: 'e2', label: 'Check-in Cristo Redentor', description: 'Grupo embarcou para o Cristo.', at: '2026-05-17T09:45:00', icon: 'ri-map-pin-line', color: 'teal' },
      { id: 'e3', label: 'Tour finalizado', description: 'Experiência concluída. Retorno a Ipanema.', at: '2026-05-17T15:15:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'ag-002',
    reference: 'BK-0049',
    booking_type: 'transfer',
    status: 'completed',
    scheduled_at: '2026-05-17T10:00:00',
    estimated_duration_min: 50,
    pickup_location: 'Copacabana Palace',
    dropoff_location: 'Centro de Convenções',
    route_name: 'Copacabana → Centro',
    driver: mockDrivers[2],
    passenger_name: 'Rafael Andrade',
    passenger_count: 1,
    notes: null,
    timeline: [
      { id: 'e1', label: 'Transfer iniciado', description: 'Partida confirmada.', at: '2026-05-17T10:02:00', icon: 'ri-car-line', color: 'navy' },
      { id: 'e2', label: 'Finalizado', description: 'Passageiro entregue com sucesso.', at: '2026-05-17T10:47:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'ag-003',
    reference: 'BK-0050',
    booking_type: 'transfer',
    status: 'in_progress',
    scheduled_at: '2026-05-17T14:30:00',
    estimated_duration_min: 35,
    pickup_location: 'Aeroporto Santos Dumont (SDU)',
    dropoff_location: 'Hotel Windsor Leblon',
    route_name: 'SDU → Leblon',
    driver: mockDrivers[1],
    passenger_name: 'Mariana Costa',
    passenger_count: 4,
    notes: null,
    timeline: [
      { id: 'e1', label: 'Motorista a caminho', description: 'Carlos Mendes partiu para o SDU.', at: '2026-05-17T14:00:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 'e2', label: 'Transfer iniciado', description: 'Passageiros embarcados.', at: '2026-05-17T14:33:00', icon: 'ri-car-line', color: 'navy' },
    ],
  },
  {
    id: 'ag-004',
    reference: 'BK-0051',
    booking_type: 'transfer',
    status: 'driver_assigned',
    scheduled_at: '2026-05-17T16:00:00',
    estimated_duration_min: 55,
    pickup_location: 'Hotel Fasano, Ipanema',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    route_name: 'Ipanema → GIG',
    driver: mockDrivers[0],
    passenger_name: 'Eduardo Tavares',
    passenger_count: 2,
    notes: 'Cliente solicita saída pontual às 16h. Voo às 19h30.',
    timeline: [
      { id: 'e1', label: 'Reserva confirmada', description: 'Pagamento aprovado.', at: '2026-05-12T09:35:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
      { id: 'e2', label: 'Motorista atribuído', description: 'João Silva — Mercedes Vito ABC-1D23.', at: '2026-05-13T14:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'ag-005',
    reference: 'BK-0053',
    booking_type: 'transfer',
    status: 'driver_assigned',
    scheduled_at: '2026-05-17T17:30:00',
    estimated_duration_min: 40,
    pickup_location: 'Hotel Copacabana Othon Palace',
    dropoff_location: 'Aeroporto Santos Dumont (SDU)',
    route_name: 'Copacabana → SDU',
    driver: mockDrivers[2],
    passenger_name: 'Priscila Monteiro',
    passenger_count: 2,
    notes: null,
    timeline: [
      { id: 'e1', label: 'Reserva confirmada', description: 'PIX recebido.', at: '2026-05-15T11:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
      { id: 'e2', label: 'Motorista atribuído', description: 'Ana Ferreira — Sprinter Premium.', at: '2026-05-16T09:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'ag-006',
    reference: 'BK-0047',
    booking_type: 'transfer',
    status: 'scheduled',
    scheduled_at: '2026-05-17T19:00:00',
    estimated_duration_min: 60,
    pickup_location: 'JW Marriott Rio',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    route_name: 'Barra → GIG',
    driver: null,
    passenger_name: 'Lucas Farias',
    passenger_count: 2,
    notes: 'Aguardando confirmação de pagamento.',
    timeline: [
      { id: 'e1', label: 'Reserva criada', description: 'Aguardando pagamento e alocação.', at: '2026-05-15T18:44:00', icon: 'ri-add-circle-line', color: 'stone' },
    ],
  },
  {
    id: 'ag-007',
    reference: 'BK-0054',
    booking_type: 'transfer',
    status: 'delayed',
    scheduled_at: '2026-05-17T15:00:00',
    estimated_duration_min: 45,
    pickup_location: 'Aeroporto do Galeão (GIG)',
    dropoff_location: 'Hotel Fairmont Rio',
    route_name: 'GIG → Barra',
    driver: mockDrivers[3],
    passenger_name: 'Rodrigo Almeida',
    passenger_count: 3,
    notes: 'Atraso de 25 minutos — trânsito na Linha Amarela.',
    timeline: [
      { id: 'e1', label: 'Transfer iniciado', description: 'Partida do GIG com atraso.', at: '2026-05-17T15:24:00', icon: 'ri-car-line', color: 'amber' },
      { id: 'e2', label: 'Alerta de atraso', description: 'ETA revisado: +25 min sobre o previsto.', at: '2026-05-17T15:35:00', icon: 'ri-alarm-warning-line', color: 'amber' },
    ],
  },
  {
    id: 'ag-008',
    reference: 'BK-0055',
    booking_type: 'transfer',
    status: 'driver_assigned',
    scheduled_at: '2026-05-17T20:30:00',
    estimated_duration_min: 50,
    pickup_location: 'Aeroporto do Galeão (GIG)',
    dropoff_location: 'Hotel Emiliano Rio',
    route_name: 'GIG → Ipanema',
    driver: mockDrivers[0],
    passenger_name: 'Helena Fonseca',
    passenger_count: 1,
    notes: null,
    timeline: [
      { id: 'e1', label: 'Reserva confirmada', description: 'Cartão aprovado.', at: '2026-05-16T20:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
      { id: 'e2', label: 'Motorista atribuído', description: 'João Silva — Mercedes Vito.', at: '2026-05-17T08:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'ag-009',
    reference: 'BK-0042',
    booking_type: 'transfer',
    status: 'scheduled',
    scheduled_at: '2026-05-17T21:45:00',
    estimated_duration_min: 30,
    pickup_location: 'Aeroporto Santos Dumont (SDU)',
    dropoff_location: 'Hotel Fasano, Ipanema',
    route_name: 'SDU → Ipanema',
    driver: null,
    passenger_name: 'Thiago Cavalcanti',
    passenger_count: 1,
    notes: 'Pagamento vencido. Aguardando regularização.',
    timeline: [
      { id: 'e1', label: 'Reserva criada', description: 'Aguardando pagamento.', at: '2026-05-16T07:15:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Pagamento vencido', description: 'Prazo expirado.', at: '2026-05-17T00:00:00', icon: 'ri-alarm-warning-line', color: 'red' },
    ],
  },
  // TOMORROW — 2026-05-18
  {
    id: 'ag-010',
    reference: 'BK-0048',
    booking_type: 'experience',
    status: 'driver_assigned',
    scheduled_at: '2026-05-18T08:00:00',
    estimated_duration_min: 480,
    pickup_location: 'Marina da Glória',
    dropoff_location: 'Búzios — Hotel Casas Brancas',
    route_name: 'Rio → Búzios Premium',
    driver: mockDrivers[3],
    passenger_name: 'Beatriz Lemos',
    passenger_count: 6,
    notes: 'Parada em Arraial do Cabo. Confirmar com motorista.',
    timeline: [
      { id: 'e1', label: 'Motorista atribuído', description: 'Pedro Rocha — Van Executive.', at: '2026-05-10T09:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'ag-011',
    reference: 'BK-0046',
    booking_type: 'experience',
    status: 'driver_assigned',
    scheduled_at: '2026-05-18T11:00:00',
    estimated_duration_min: 360,
    pickup_location: 'Aeroporto do Galeão (GIG)',
    dropoff_location: 'Paraty — Pousada do Príncipe',
    route_name: 'GIG → Paraty Experiência',
    driver: mockDrivers[0],
    passenger_name: 'Fernanda Rocha',
    passenger_count: 3,
    notes: null,
    timeline: [
      { id: 'e1', label: 'Motorista atribuído', description: 'João Silva — Mercedes Vito.', at: '2026-05-11T10:30:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'ag-012',
    reference: 'BK-0056',
    booking_type: 'transfer',
    status: 'driver_assigned',
    scheduled_at: '2026-05-18T06:00:00',
    estimated_duration_min: 45,
    pickup_location: 'Hotel Leblon Premium',
    dropoff_location: 'Aeroporto Santos Dumont (SDU)',
    route_name: 'Leblon → SDU',
    driver: mockDrivers[2],
    passenger_name: 'Marina Cavalcante',
    passenger_count: 2,
    notes: 'Voo às 08h30.',
    timeline: [
      { id: 'e1', label: 'Motorista atribuído', description: 'Ana Ferreira.', at: '2026-05-17T16:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'ag-013',
    reference: 'BK-0043',
    booking_type: 'transfer',
    status: 'driver_assigned',
    scheduled_at: '2026-05-19T06:30:00',
    estimated_duration_min: 55,
    pickup_location: 'Hotel Nacional, São Conrado',
    dropoff_location: 'Aeroporto do Galeão (GIG)',
    route_name: 'São Conrado → GIG',
    driver: mockDrivers[2],
    passenger_name: 'Isabela Drummond',
    passenger_count: 2,
    notes: 'Reagendado de 17/05 para 19/05. Voo remarcado.',
    timeline: [
      { id: 'e1', label: 'Reagendada', description: 'Novo horário: 19/05 às 06h30.', at: '2026-05-16T14:22:00', icon: 'ri-calendar-line', color: 'amber' },
    ],
  },
];

// Conflict detection (derived from mock data, represents real-time conflict analysis)
export const mockConflicts: AgendaConflict[] = [
  {
    id: 'c1',
    type: 'time_overlap',
    severity: 'critical',
    label: 'Conflito de horário — Carlos Mendes',
    description: 'Carlos Mendes tem Tour (08:30–15:15) e SDU → Leblon (14:30). Sobreposição de 45 minutos.',
    affected_item_ids: ['ag-001', 'ag-003'],
  },
  {
    id: 'c2',
    type: 'driver_double',
    severity: 'warning',
    label: 'Motorista não alocado — 2 transfers pendentes',
    description: 'BK-0047 (19:00) e BK-0042 (21:45) ainda sem motorista definido.',
    affected_item_ids: ['ag-006', 'ag-009'],
  },
  {
    id: 'c3',
    type: 'operational_delay',
    severity: 'warning',
    label: 'Atraso operacional — Pedro Rocha',
    description: 'BK-0054 com atraso de 25 min. Passageiro notificado. ETA revisado para 16h05.',
    affected_item_ids: ['ag-007'],
  },
];