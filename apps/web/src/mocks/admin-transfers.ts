export type TransferStatus =
  | 'scheduled'
  | 'driver_assigned'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'cancelled';

export interface MockTransferPassenger {
  id: string;
  full_name: string;
  document?: string;
  age_group: 'adult' | 'child' | 'senior';
}

export interface MockTransferTimelineEvent {
  id: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
}

export interface MockTransfer {
  id: string;
  reference: string;
  tenant_id: string;
  booking_reference: string | null;
  route_name: string;
  origin: string;
  destination: string;
  // Driver
  driver_id: string | null;
  driver_name: string | null;
  driver_initials: string | null;
  driver_phone: string | null;
  // Vehicle
  vehicle_name: string;
  vehicle_plate: string;
  vehicle_type: string;
  capacity: number;
  // Schedule
  scheduled_at: string;
  duration_min: number;
  // Passengers
  passenger_name: string;
  passenger_email: string;
  passenger_phone: string;
  passenger_count: number;
  passengers: MockTransferPassenger[];
  // Status
  status: TransferStatus;
  notes: string | null;
  // Timeline
  timeline: MockTransferTimelineEvent[];
}

export const mockTransfers: MockTransfer[] = [
  {
    id: 'tr-001',
    reference: 'TR-0031',
    tenant_id: 'ten1',
    booking_reference: 'BK-0051',
    route_name: 'Ipanema → GIG',
    origin: 'Hotel Fasano, Ipanema',
    destination: 'Aeroporto do Galeão (GIG)',
    driver_id: 'drv-1',
    driver_name: 'João Silva',
    driver_initials: 'JS',
    driver_phone: '+55 21 98801-2233',
    vehicle_name: 'Mercedes Vito',
    vehicle_plate: 'ABC-1D23',
    vehicle_type: 'Van Premium',
    capacity: 8,
    scheduled_at: '2026-05-17T16:00:00',
    duration_min: 55,
    passenger_name: 'Eduardo Tavares',
    passenger_email: 'eduardo.tavares@email.com',
    passenger_phone: '+55 21 99812-3344',
    passenger_count: 2,
    passengers: [
      { id: 'p1', full_name: 'Eduardo Tavares', document: '012.345.678-90', age_group: 'adult' },
      { id: 'p2', full_name: 'Sofia Tavares', age_group: 'adult' },
    ],
    status: 'driver_assigned',
    notes: 'Cliente solicita saída pontual às 16h. Voo às 19h30.',
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Transfer gerado a partir da reserva BK-0051.', at: '2026-05-12T09:31:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Pagamento confirmado', description: 'Cartão de crédito aprovado.', at: '2026-05-12T09:35:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 'e3', label: 'Motorista atribuído', description: 'João Silva — Mercedes Vito ABC-1D23.', at: '2026-05-13T14:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'tr-002',
    reference: 'TR-0030',
    tenant_id: 'ten1',
    booking_reference: 'BK-0050',
    route_name: 'SDU → Leblon',
    origin: 'Aeroporto Santos Dumont (SDU)',
    destination: 'Hotel Windsor Leblon',
    driver_id: 'drv-2',
    driver_name: 'Carlos Mendes',
    driver_initials: 'CM',
    driver_phone: '+55 21 99900-7788',
    vehicle_name: 'Toyota Hiace',
    vehicle_plate: 'DEF-2E34',
    vehicle_type: 'Minibus',
    capacity: 14,
    scheduled_at: '2026-05-17T14:30:00',
    duration_min: 35,
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
    status: 'in_progress',
    notes: null,
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Registrado via integração.', at: '2026-05-10T16:22:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Pagamento confirmado', description: 'PIX recebido e confirmado.', at: '2026-05-10T16:30:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 'e3', label: 'Motorista atribuído', description: 'Carlos Mendes — Toyota Hiace DEF-2E34.', at: '2026-05-11T09:15:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 'e4', label: 'Transfer iniciado', description: 'Motorista confirmou início do trajeto às 14h33.', at: '2026-05-17T14:33:00', icon: 'ri-car-line', color: 'teal' },
    ],
  },
  {
    id: 'tr-003',
    reference: 'TR-0029',
    tenant_id: 'ten1',
    booking_reference: 'BK-0049',
    route_name: 'Copacabana → Centro',
    origin: 'Copacabana Palace',
    destination: 'Centro de Convenções',
    driver_id: 'drv-3',
    driver_name: 'Ana Ferreira',
    driver_initials: 'AF',
    driver_phone: '+55 21 99011-3344',
    vehicle_name: 'Sprinter Premium',
    vehicle_plate: 'GHI-3F45',
    vehicle_type: 'Van Executiva',
    capacity: 10,
    scheduled_at: '2026-05-17T10:00:00',
    duration_min: 50,
    passenger_name: 'Rafael Andrade',
    passenger_email: 'rafael@andrade.com.br',
    passenger_phone: '+55 21 98234-1122',
    passenger_count: 1,
    passengers: [
      { id: 'p7', full_name: 'Rafael Andrade', document: '456.789.012-11', age_group: 'adult' },
    ],
    status: 'completed',
    notes: null,
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Reserva BK-0049 processada.', at: '2026-05-14T11:05:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Motorista atribuído', description: 'Ana Ferreira — Sprinter GHI-3F45.', at: '2026-05-15T08:00:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 'e3', label: 'Transfer iniciado', description: 'Partida confirmada às 10h02.', at: '2026-05-17T10:02:00', icon: 'ri-car-line', color: 'navy' },
      { id: 'e4', label: 'Finalizado', description: 'Passageiro entregue com sucesso.', at: '2026-05-17T10:47:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'tr-004',
    reference: 'TR-0028',
    tenant_id: 'ten1',
    booking_reference: 'BK-0048',
    route_name: 'Rio → Búzios Premium',
    origin: 'Marina da Glória',
    destination: 'Búzios — Hotel Casas Brancas',
    driver_id: 'drv-4',
    driver_name: 'Pedro Rocha',
    driver_initials: 'PR',
    driver_phone: '+55 22 98800-4455',
    vehicle_name: 'Van Executive',
    vehicle_plate: 'JKL-4G56',
    vehicle_type: 'Van Executiva',
    capacity: 8,
    scheduled_at: '2026-05-18T08:00:00',
    duration_min: 480,
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
    status: 'confirmed',
    notes: 'Grupo solicita parada em Arraial do Cabo. Confirmar com motorista.',
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Gerado a partir de BK-0048.', at: '2026-05-08T14:30:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Motorista atribuído', description: 'Pedro Rocha — Van Executive JKL-4G56.', at: '2026-05-10T09:00:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 'e3', label: 'Confirmado', description: 'Motorista confirmou operação para 18/05.', at: '2026-05-16T18:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'tr-005',
    reference: 'TR-0027',
    tenant_id: 'ten1',
    booking_reference: 'BK-0047',
    route_name: 'Barra → GIG',
    origin: 'JW Marriott Rio',
    destination: 'Aeroporto do Galeão (GIG)',
    driver_id: null,
    driver_name: null,
    driver_initials: null,
    driver_phone: null,
    vehicle_name: 'A definir',
    vehicle_plate: '—',
    vehicle_type: '—',
    capacity: 0,
    scheduled_at: '2026-05-17T19:00:00',
    duration_min: 60,
    passenger_name: 'Lucas Farias',
    passenger_email: 'lucas.farias@corp.com',
    passenger_phone: '+55 21 99344-6677',
    passenger_count: 2,
    passengers: [
      { id: 'p14', full_name: 'Lucas Farias', age_group: 'adult' },
      { id: 'p15', full_name: 'Camila Farias', age_group: 'adult' },
    ],
    status: 'scheduled',
    notes: 'Aguardando confirmação de pagamento e alocação de motorista.',
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Reserva pendente de pagamento.', at: '2026-05-15T18:44:00', icon: 'ri-add-circle-line', color: 'stone' },
    ],
  },
  {
    id: 'tr-006',
    reference: 'TR-0026',
    tenant_id: 'ten1',
    booking_reference: 'BK-0046',
    route_name: 'GIG → Paraty Experiência',
    origin: 'Aeroporto do Galeão (GIG)',
    destination: 'Paraty — Pousada do Príncipe',
    driver_id: 'drv-1',
    driver_name: 'João Silva',
    driver_initials: 'JS',
    driver_phone: '+55 21 98801-2233',
    vehicle_name: 'Mercedes Vito',
    vehicle_plate: 'ABC-1D23',
    vehicle_type: 'Van Premium',
    capacity: 8,
    scheduled_at: '2026-05-18T11:00:00',
    duration_min: 360,
    passenger_name: 'Fernanda Rocha',
    passenger_email: 'fernanda.rocha@email.com',
    passenger_phone: '+55 21 98567-9900',
    passenger_count: 3,
    passengers: [
      { id: 'p16', full_name: 'Fernanda Rocha', document: '789.012.345-33', age_group: 'adult' },
      { id: 'p17', full_name: 'Paulo Rocha', age_group: 'adult' },
      { id: 'p18', full_name: 'Valentina Rocha', age_group: 'child' },
    ],
    status: 'confirmed',
    notes: null,
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Experiência Paraty registrada.', at: '2026-05-09T20:12:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Pagamento confirmado', description: 'PIX confirmado.', at: '2026-05-09T20:20:00', icon: 'ri-secure-payment-line', color: 'teal' },
      { id: 'e3', label: 'Motorista atribuído', description: 'João Silva — Mercedes Vito ABC-1D23.', at: '2026-05-11T10:30:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 'e4', label: 'Confirmado', description: 'Operação confirmada para 18/05 às 11h.', at: '2026-05-16T09:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'tr-007',
    reference: 'TR-0025',
    tenant_id: 'ten1',
    booking_reference: 'BK-0054',
    route_name: 'GIG → Barra',
    origin: 'Aeroporto do Galeão (GIG)',
    destination: 'Hotel Fairmont Rio',
    driver_id: 'drv-4',
    driver_name: 'Pedro Rocha',
    driver_initials: 'PR',
    driver_phone: '+55 22 98800-4455',
    vehicle_name: 'Van Executive',
    vehicle_plate: 'JKL-4G56',
    vehicle_type: 'Van Executiva',
    capacity: 8,
    scheduled_at: '2026-05-17T15:00:00',
    duration_min: 45,
    passenger_name: 'Rodrigo Almeida',
    passenger_email: 'rodrigo.almeida@hotmail.com',
    passenger_phone: '+55 21 98345-6789',
    passenger_count: 3,
    passengers: [
      { id: 'p19', full_name: 'Rodrigo Almeida', document: '555.666.777-88', age_group: 'adult' },
      { id: 'p20', full_name: 'Patrícia Almeida', age_group: 'adult' },
      { id: 'p21', full_name: 'Lucas Almeida Jr.', age_group: 'child' },
    ],
    status: 'delayed',
    notes: 'Atraso de 25 minutos — trânsito na Linha Amarela.',
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Reserva BK-0054.', at: '2026-05-16T14:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Motorista atribuído', description: 'Pedro Rocha — Van JKL-4G56.', at: '2026-05-16T15:00:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 'e3', label: 'Transfer iniciado', description: 'Partida do GIG com atraso de 24min.', at: '2026-05-17T15:24:00', icon: 'ri-car-line', color: 'amber' },
      { id: 'e4', label: 'Alerta de atraso', description: 'ETA revisado: +25 min sobre o previsto. Passageiro notificado.', at: '2026-05-17T15:35:00', icon: 'ri-alarm-warning-line', color: 'amber' },
    ],
  },
  {
    id: 'tr-008',
    reference: 'TR-0024',
    tenant_id: 'ten1',
    booking_reference: 'BK-0055',
    route_name: 'GIG → Ipanema',
    origin: 'Aeroporto do Galeão (GIG)',
    destination: 'Hotel Emiliano Rio',
    driver_id: 'drv-1',
    driver_name: 'João Silva',
    driver_initials: 'JS',
    driver_phone: '+55 21 98801-2233',
    vehicle_name: 'Mercedes Vito',
    vehicle_plate: 'ABC-1D23',
    vehicle_type: 'Van Premium',
    capacity: 8,
    scheduled_at: '2026-05-17T20:30:00',
    duration_min: 50,
    passenger_name: 'Helena Fonseca',
    passenger_email: 'helena.fonseca@gmail.com',
    passenger_phone: '+55 21 97123-9900',
    passenger_count: 1,
    passengers: [
      { id: 'p22', full_name: 'Helena Fonseca', document: '999.888.777-66', age_group: 'adult' },
    ],
    status: 'driver_assigned',
    notes: null,
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Cartão aprovado.', at: '2026-05-16T20:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Motorista atribuído', description: 'João Silva — Mercedes Vito.', at: '2026-05-17T08:00:00', icon: 'ri-steering-2-line', color: 'navy' },
    ],
  },
  {
    id: 'tr-009',
    reference: 'TR-0023',
    tenant_id: 'ten1',
    booking_reference: 'BK-0043',
    route_name: 'São Conrado → GIG',
    origin: 'Hotel Nacional, São Conrado',
    destination: 'Aeroporto do Galeão (GIG)',
    driver_id: 'drv-3',
    driver_name: 'Ana Ferreira',
    driver_initials: 'AF',
    driver_phone: '+55 21 99011-3344',
    vehicle_name: 'Sprinter Premium',
    vehicle_plate: 'GHI-3F45',
    vehicle_type: 'Van Executiva',
    capacity: 10,
    scheduled_at: '2026-05-19T06:30:00',
    duration_min: 55,
    passenger_name: 'Isabela Drummond',
    passenger_email: 'isabela.drummond@email.com',
    passenger_phone: '+55 21 98900-2211',
    passenger_count: 2,
    passengers: [
      { id: 'p23', full_name: 'Isabela Drummond', age_group: 'adult' },
      { id: 'p24', full_name: 'Victor Drummond', age_group: 'adult' },
    ],
    status: 'confirmed',
    notes: 'Reagendado de 17/05 para 19/05. Voo remarcado pelo cliente.',
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Reserva BK-0043.', at: '2026-05-11T10:00:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Motorista atribuído', description: 'Ana Ferreira — Sprinter GHI-3F45.', at: '2026-05-12T08:00:00', icon: 'ri-steering-2-line', color: 'navy' },
      { id: 'e3', label: 'Reagendado', description: 'Novo horário: 19/05 às 06h30.', at: '2026-05-16T14:22:00', icon: 'ri-calendar-line', color: 'amber' },
      { id: 'e4', label: 'Confirmado', description: 'Motorista confirmou novo horário.', at: '2026-05-16T15:00:00', icon: 'ri-checkbox-circle-line', color: 'teal' },
    ],
  },
  {
    id: 'tr-010',
    reference: 'TR-0022',
    tenant_id: 'ten1',
    booking_reference: 'BK-0042',
    route_name: 'SDU → Ipanema',
    origin: 'Aeroporto Santos Dumont (SDU)',
    destination: 'Hotel Fasano, Ipanema',
    driver_id: null,
    driver_name: null,
    driver_initials: null,
    driver_phone: null,
    vehicle_name: 'A definir',
    vehicle_plate: '—',
    vehicle_type: '—',
    capacity: 0,
    scheduled_at: '2026-05-17T21:45:00',
    duration_min: 30,
    passenger_name: 'Thiago Cavalcanti',
    passenger_email: 'thiago.c@empresa.com',
    passenger_phone: '+55 21 97789-3344',
    passenger_count: 1,
    passengers: [
      { id: 'p25', full_name: 'Thiago Cavalcanti', document: '111.222.333-44', age_group: 'adult' },
    ],
    status: 'scheduled',
    notes: 'Pagamento vencido. Aguardando regularização antes de alocar.',
    timeline: [
      { id: 'e1', label: 'Transfer criado', description: 'Aguardando pagamento.', at: '2026-05-16T07:15:00', icon: 'ri-add-circle-line', color: 'stone' },
      { id: 'e2', label: 'Pagamento vencido', description: 'Prazo de pagamento expirado.', at: '2026-05-17T00:00:00', icon: 'ri-alarm-warning-line', color: 'red' },
    ],
  },
];