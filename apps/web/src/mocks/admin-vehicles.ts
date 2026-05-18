// admin-vehicles.ts — schema-aligned with vehicles + users + bookings + routes tables

export type VehicleStatus = 'available' | 'in_operation' | 'maintenance' | 'inactive' | 'reserved' | 'attention';
export type VehicleType = 'van' | 'sprinter' | 'sedan' | 'suv' | 'bus';

export interface VehicleTodayTransfer {
  id: string;
  reference: string;
  scheduled_at: string;
  route_name: string;
  origin: string;
  destination: string;
  pax: number;
  status: 'scheduled' | 'driver_assigned' | 'in_progress' | 'completed' | 'delayed';
}

export interface VehicleMaintenanceEvent {
  date: string;
  type: string;
  description: string;
  km: number;
  technician: string;
}

export interface VehicleTimelineEvent {
  time: string;
  label: string;
  type: 'info' | 'warning' | 'success' | 'error';
}

export interface MockVehicle {
  id: string;
  tenant_id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  plate: string;
  capacity: number;
  color: string;
  photo_url: string | null;
  status: VehicleStatus;
  // Driver info
  assigned_driver_id: string | null;
  assigned_driver: string | null;
  assigned_driver_initials: string | null;
  assigned_driver_phone: string | null;
  // Operational data
  km_today: number;
  km_total: number;
  transfers_today: number;
  transfers_total: number;
  current_occupancy: number;
  // Maintenance
  last_service: string;
  last_service_km: number;
  next_service: string;
  next_service_km: number;
  maintenance_status: 'ok' | 'due_soon' | 'overdue' | 'in_maintenance';
  maintenance_notes: string | null;
  // Today's transfers
  today_transfers: VehicleTodayTransfer[];
  // Maintenance history
  maintenance_history: VehicleMaintenanceEvent[];
  // Timeline
  timeline: VehicleTimelineEvent[];
  // Notes
  notes: string | null;
  // Metadata
  registered_at: string;
  last_activity: string | null;
}

export const mockVehicles: MockVehicle[] = [
  {
    id: 'veh-1',
    tenant_id: 'ten1',
    name: 'Mercedes Vito Executive',
    make: 'Mercedes-Benz',
    model: 'Vito 119 CDI',
    year: 2024,
    type: 'van',
    plate: 'ABC-1234',
    capacity: 7,
    color: 'Prata Metálico',
    photo_url: null,
    status: 'in_operation',
    assigned_driver_id: 'drv-1',
    assigned_driver: 'João Silva',
    assigned_driver_initials: 'JS',
    assigned_driver_phone: '+55 21 98765-4321',
    km_today: 142,
    km_total: 38450,
    transfers_today: 3,
    transfers_total: 284,
    current_occupancy: 5,
    last_service: '2026-04-10',
    last_service_km: 38000,
    next_service: '2026-07-10',
    next_service_km: 43000,
    maintenance_status: 'ok',
    maintenance_notes: null,
    today_transfers: [
      { id: 'tf-101', reference: 'TRF-2891', scheduled_at: '2026-05-17T08:00:00', route_name: 'SDU → Ipanema', origin: 'Aeroporto Santos Dumont', destination: 'Hotel Fasano Ipanema', pax: 2, status: 'completed' },
      { id: 'tf-102', reference: 'TRF-2894', scheduled_at: '2026-05-17T11:30:00', route_name: 'Ipanema → GIG', origin: 'Hotel Fasano Ipanema', destination: 'Aeroporto Galeão', pax: 5, status: 'in_progress' },
      { id: 'tf-103', reference: 'TRF-2899', scheduled_at: '2026-05-17T16:00:00', route_name: 'GIG → Barra', origin: 'Aeroporto Galeão', destination: 'Grand Hyatt Rio', pax: 4, status: 'scheduled' },
    ],
    maintenance_history: [
      { date: '2026-04-10', type: 'Revisão Geral', description: 'Troca de óleo, filtros e revisão de freios', km: 38000, technician: 'AutoService Premium' },
      { date: '2026-01-15', type: 'Revisão Periódica', description: 'Verificação geral, alinhamento e balanceamento', km: 32500, technician: 'AutoService Premium' },
      { date: '2025-09-20', type: 'Manutenção Preventiva', description: 'Troca de pneus dianteiros e alinhamento', km: 27000, technician: 'AutoService Premium' },
    ],
    timeline: [
      { time: '08:42', label: 'TRF-2891 concluído — SDU → Ipanema', type: 'success' },
      { time: '08:05', label: 'TRF-2891 iniciado', type: 'info' },
      { time: '07:50', label: 'Motorista confirmou saída para SDU', type: 'info' },
    ],
    notes: 'Veículo exclusivo para clientes VIP. Sempre priorizar este veículo para transfers de longa distância.',
    registered_at: '2024-03-01',
    last_activity: '2026-05-17T09:45:00',
  },
  {
    id: 'veh-2',
    tenant_id: 'ten1',
    name: 'Toyota Hiace Premium',
    make: 'Toyota',
    model: 'Hiace 2.8 GL',
    year: 2023,
    type: 'van',
    plate: 'DEF-5678',
    capacity: 12,
    color: 'Branco Pérola',
    photo_url: null,
    status: 'in_operation',
    assigned_driver_id: 'drv-2',
    assigned_driver: 'Carlos Mendes',
    assigned_driver_initials: 'CM',
    assigned_driver_phone: '+55 21 97654-3210',
    km_today: 98,
    km_total: 52180,
    transfers_today: 2,
    transfers_total: 391,
    current_occupancy: 10,
    last_service: '2026-03-22',
    last_service_km: 51500,
    next_service: '2026-06-22',
    next_service_km: 56500,
    maintenance_status: 'due_soon',
    maintenance_notes: 'Revisão dos 56.500 km programada. Verificar pneus traseiros.',
    today_transfers: [
      { id: 'tf-201', reference: 'TRF-2887', scheduled_at: '2026-05-17T07:00:00', route_name: 'GIG → Copacabana', origin: 'Aeroporto Galeão', destination: 'Copa Hotel Suítes', pax: 8, status: 'completed' },
      { id: 'tf-202', reference: 'TRF-2896', scheduled_at: '2026-05-17T14:00:00', route_name: 'Copacabana → Búzios', origin: 'Copa Hotel Suítes', destination: 'Insolito Boutique Hotel', pax: 10, status: 'driver_assigned' },
    ],
    maintenance_history: [
      { date: '2026-03-22', type: 'Revisão Periódica', description: 'Troca de óleo e filtros, revisão geral', km: 51500, technician: 'Toyota Oficial RJ' },
      { date: '2025-11-10', type: 'Revisão de Freios', description: 'Substituição das pastilhas dianteiras', km: 46200, technician: 'Toyota Oficial RJ' },
    ],
    timeline: [
      { time: '09:15', label: 'TRF-2887 concluído — GIG → Copacabana', type: 'success' },
      { time: '07:05', label: 'TRF-2887 iniciado', type: 'info' },
    ],
    notes: 'Veículo ideal para grupos. Manter sempre em boas condições para transfers de grupos premium.',
    registered_at: '2023-06-10',
    last_activity: '2026-05-17T09:20:00',
  },
  {
    id: 'veh-3',
    tenant_id: 'ten1',
    name: 'Mercedes Sprinter Luxury',
    make: 'Mercedes-Benz',
    model: 'Sprinter 515 CDI',
    year: 2024,
    type: 'sprinter',
    plate: 'GHI-9012',
    capacity: 14,
    color: 'Preto Obsidiana',
    photo_url: null,
    status: 'available',
    assigned_driver_id: 'drv-3',
    assigned_driver: 'Ana Ferreira',
    assigned_driver_initials: 'AF',
    assigned_driver_phone: '+55 21 96543-2109',
    km_today: 55,
    km_total: 21800,
    transfers_today: 1,
    transfers_total: 156,
    current_occupancy: 0,
    last_service: '2026-05-01',
    last_service_km: 21500,
    next_service: '2026-08-01',
    next_service_km: 26500,
    maintenance_status: 'ok',
    maintenance_notes: null,
    today_transfers: [
      { id: 'tf-301', reference: 'TRF-2892', scheduled_at: '2026-05-17T06:30:00', route_name: 'SDU → Paraty', origin: 'Aeroporto Santos Dumont', destination: 'Pousada do Ouro Paraty', pax: 12, status: 'completed' },
    ],
    maintenance_history: [
      { date: '2026-05-01', type: 'Revisão Geral', description: 'Revisão completa 20.000 km — óleo, filtros, freios, suspensão', km: 21500, technician: 'Mercedes-Benz Oficial' },
      { date: '2026-02-12', type: 'Revisão Preventiva', description: 'Verificação de fluidos e filtros', km: 18200, technician: 'Mercedes-Benz Oficial' },
    ],
    timeline: [
      { time: '13:30', label: 'TRF-2892 concluído — chegada em Paraty', type: 'success' },
      { time: '06:35', label: 'TRF-2892 iniciado', type: 'info' },
    ],
    notes: 'Sprinter de máxima capacidade para grupos grandes e eventos corporativos.',
    registered_at: '2024-01-15',
    last_activity: '2026-05-17T13:45:00',
  },
  {
    id: 'veh-4',
    tenant_id: 'ten1',
    name: 'Van Executive Grafite',
    make: 'Ford',
    model: 'Transit 2.2 TDCI',
    year: 2023,
    type: 'van',
    plate: 'JKL-3456',
    capacity: 8,
    color: 'Grafite Space',
    photo_url: null,
    status: 'reserved',
    assigned_driver_id: 'drv-4',
    assigned_driver: 'Pedro Rocha',
    assigned_driver_initials: 'PR',
    assigned_driver_phone: '+55 21 95432-1098',
    km_today: 0,
    km_total: 44920,
    transfers_today: 0,
    transfers_total: 312,
    current_occupancy: 0,
    last_service: '2026-04-28',
    last_service_km: 44500,
    next_service: '2026-07-28',
    next_service_km: 49500,
    maintenance_status: 'ok',
    maintenance_notes: null,
    today_transfers: [
      { id: 'tf-401', reference: 'TRF-2910', scheduled_at: '2026-05-17T19:00:00', route_name: 'GIG → Ipanema', origin: 'Aeroporto Galeão', destination: 'Hotel Ipanema Plaza', pax: 6, status: 'scheduled' },
    ],
    maintenance_history: [
      { date: '2026-04-28', type: 'Revisão Periódica', description: 'Troca de óleo, alinhamento e balanceamento', km: 44500, technician: 'Ford Premium Service' },
      { date: '2026-01-18', type: 'Revisão Preventiva', description: 'Verificação geral e troca de filtros', km: 39800, technician: 'Ford Premium Service' },
    ],
    timeline: [
      { time: '09:00', label: 'Veículo reservado para TRF-2910 — 19:00h', type: 'info' },
    ],
    notes: 'Reservado para transfer VIP noturno. Não alocar para outros transfers hoje após 17h.',
    registered_at: '2023-04-20',
    last_activity: '2026-05-16T22:30:00',
  },
  {
    id: 'veh-5',
    tenant_id: 'ten1',
    name: 'Sedã Executivo Preto',
    make: 'BMW',
    model: '520d Executive',
    year: 2023,
    type: 'sedan',
    plate: 'MNO-7890',
    capacity: 3,
    color: 'Preto Safira',
    photo_url: null,
    status: 'maintenance',
    assigned_driver_id: null,
    assigned_driver: null,
    assigned_driver_initials: null,
    assigned_driver_phone: null,
    km_today: 0,
    km_total: 28600,
    transfers_today: 0,
    transfers_total: 210,
    current_occupancy: 0,
    last_service: '2026-02-15',
    last_service_km: 25000,
    next_service: '2026-05-20',
    next_service_km: 30000,
    maintenance_status: 'in_maintenance',
    maintenance_notes: 'Em manutenção na BMW Oficial RJ. Retorno previsto: 20/05/2026. Problema no sistema de ar-condicionado traseiro e revisão de freios.',
    today_transfers: [],
    maintenance_history: [
      { date: '2026-05-15', type: 'Manutenção Corretiva', description: 'Falha no sistema de A/C traseiro — enviado para BMW Oficial', km: 28600, technician: 'BMW Oficial RJ' },
      { date: '2026-02-15', type: 'Revisão 25.000 km', description: 'Revisão completa e alinhamento', km: 25000, technician: 'BMW Oficial RJ' },
      { date: '2025-09-05', type: 'Revisão Periódica', description: 'Troca de óleo sintético e filtros', km: 19500, technician: 'BMW Oficial RJ' },
    ],
    timeline: [
      { time: '15/05', label: 'Enviado para manutenção na BMW Oficial RJ', type: 'warning' },
      { time: '15/05', label: 'Falha de A/C identificada após TRF-2855', type: 'error' },
    ],
    notes: 'Veículo exclusivo para clientes corporativos de alto padrão. Prioridade no retorno.',
    registered_at: '2023-01-10',
    last_activity: '2026-05-15T20:00:00',
  },
  {
    id: 'veh-6',
    tenant_id: 'ten1',
    name: 'Ônibus Premium 52L',
    make: 'Mercedes-Benz',
    model: 'OF-1721 BlueTec 5',
    year: 2022,
    type: 'bus',
    plate: 'PQR-1122',
    capacity: 52,
    color: 'Branco/Azul Corporativo',
    photo_url: null,
    status: 'available',
    assigned_driver_id: null,
    assigned_driver: null,
    assigned_driver_initials: null,
    assigned_driver_phone: null,
    km_today: 0,
    km_total: 91300,
    transfers_today: 0,
    transfers_total: 98,
    current_occupancy: 0,
    last_service: '2026-05-05',
    last_service_km: 91000,
    next_service: '2026-08-05',
    next_service_km: 96000,
    maintenance_status: 'ok',
    maintenance_notes: null,
    today_transfers: [],
    maintenance_history: [
      { date: '2026-05-05', type: 'Revisão Geral', description: 'Revisão completa 90.000 km — motor, freios, suspensão, pneumáticos', km: 91000, technician: 'MB Trucks & Buses RJ' },
      { date: '2026-02-10', type: 'Revisão Semestral', description: 'Verificação geral e lubrificação', km: 87500, technician: 'MB Trucks & Buses RJ' },
    ],
    timeline: [
      { time: '05/05', label: 'Revisão geral 90.000 km concluída', type: 'success' },
    ],
    notes: 'Disponível para eventos, grupos grandes e excursões corporativas. Motorista próprio necessário.',
    registered_at: '2022-08-15',
    last_activity: '2026-05-10T18:00:00',
  },
  {
    id: 'veh-7',
    tenant_id: 'ten1',
    name: 'SUV Premium Blindado',
    make: 'Toyota',
    model: 'Land Cruiser 4.0 VX',
    year: 2024,
    type: 'suv',
    plate: 'STU-3344',
    capacity: 5,
    color: 'Preto Fosco',
    photo_url: null,
    status: 'attention',
    assigned_driver_id: 'drv-5',
    assigned_driver: 'Roberto Lima',
    assigned_driver_initials: 'RL',
    assigned_driver_phone: '+55 21 94321-0987',
    km_today: 215,
    km_total: 18720,
    transfers_today: 4,
    transfers_total: 142,
    current_occupancy: 4,
    last_service: '2026-03-10',
    last_service_km: 15000,
    next_service: '2026-06-10',
    next_service_km: 20000,
    maintenance_status: 'due_soon',
    maintenance_notes: 'Próxima revisão dos 20.000 km em breve. Revisar blindagem — 9 meses sem inspeção.',
    today_transfers: [
      { id: 'tf-701', reference: 'TRF-2880', scheduled_at: '2026-05-17T06:00:00', route_name: 'Barra → SDU', origin: 'Residence Barra', destination: 'Aeroporto Santos Dumont', pax: 2, status: 'completed' },
      { id: 'tf-702', reference: 'TRF-2885', scheduled_at: '2026-05-17T09:00:00', route_name: 'SDU → Búzios', origin: 'Aeroporto Santos Dumont', destination: 'Insolito Boutique Hotel', pax: 3, status: 'completed' },
      { id: 'tf-703', reference: 'TRF-2897', scheduled_at: '2026-05-17T14:30:00', route_name: 'Búzios → GIG', origin: 'Insolito Boutique Hotel', destination: 'Aeroporto Galeão', pax: 4, status: 'in_progress' },
      { id: 'tf-704', reference: 'TRF-2903', scheduled_at: '2026-05-17T19:30:00', route_name: 'GIG → Barra', origin: 'Aeroporto Galeão', destination: 'Residence Barra VIP', pax: 4, status: 'scheduled' },
    ],
    maintenance_history: [
      { date: '2026-03-10', type: 'Revisão 15.000 km', description: 'Troca de óleo sintético, filtros e verificação geral', km: 15000, technician: 'Toyota Blindados RJ' },
      { date: '2025-10-22', type: 'Revisão Preventiva', description: 'Alinhamento, balanceamento e revisão de blindagem', km: 10200, technician: 'Toyota Blindados RJ' },
    ],
    timeline: [
      { time: '16:15', label: 'TRF-2897 em andamento — Búzios → GIG', type: 'info' },
      { time: '12:30', label: 'TRF-2885 concluído — SDU → Búzios', type: 'success' },
      { time: '07:50', label: 'TRF-2880 concluído — Barra → SDU', type: 'success' },
      { time: '—', label: 'Alerta: inspeção de blindagem vencida há 9 meses', type: 'warning' },
    ],
    notes: 'SUV blindado nível III-A. Inspeção de blindagem vencida — agendar com prioridade. Uso restrito a protocolos VIP de segurança.',
    registered_at: '2024-02-20',
    last_activity: '2026-05-17T16:20:00',
  },
  {
    id: 'veh-8',
    tenant_id: 'ten1',
    name: 'Mercedes Vito City',
    make: 'Mercedes-Benz',
    model: 'Vito 116 CDI',
    year: 2022,
    type: 'van',
    plate: 'VWX-5566',
    capacity: 7,
    color: 'Cinza Nardo',
    photo_url: null,
    status: 'inactive',
    assigned_driver_id: null,
    assigned_driver: null,
    assigned_driver_initials: null,
    assigned_driver_phone: null,
    km_today: 0,
    km_total: 68400,
    transfers_today: 0,
    transfers_total: 503,
    current_occupancy: 0,
    last_service: '2026-01-20',
    last_service_km: 66000,
    next_service: '2026-04-20',
    next_service_km: 71000,
    maintenance_status: 'overdue',
    maintenance_notes: 'Inativo temporariamente por excesso de quilometragem sem revisão. Revisão dos 71.000 km atrasada desde abril.',
    today_transfers: [],
    maintenance_history: [
      { date: '2026-01-20', type: 'Revisão 66.000 km', description: 'Troca de óleo, filtros e inspeção geral', km: 66000, technician: 'AutoService Premium' },
      { date: '2025-08-15', type: 'Revisão Semestral', description: 'Alinhamento, freios e suspensão', km: 60500, technician: 'AutoService Premium' },
    ],
    timeline: [
      { time: 'Abr 20', label: 'Revisão dos 71.000 km atrasada — veículo suspenso', type: 'error' },
      { time: 'Jan 20', label: 'Revisão 66.000 km concluída', type: 'success' },
    ],
    notes: 'Aguardando revisão atrasada para retornar à operação. Agendar com AutoService Premium.',
    registered_at: '2022-05-12',
    last_activity: '2026-04-18T17:30:00',
  },
];