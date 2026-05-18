// Schema-aware mock — users + user_tenants (role='driver') + vehicles + bookings
// user_tenants.role = 'driver', users.status maps to DriverStatus

export type DriverStatus = 'available' | 'on_trip' | 'off_duty' | 'paused' | 'unavailable' | 'pending';

export type DayAvailability = 'available' | 'partial' | 'off' | 'blocked';

export interface DriverTodayTransfer {
  id: string;
  reference: string;
  route_name: string;
  scheduled_at: string;
  status: 'completed' | 'in_progress' | 'driver_assigned' | 'scheduled';
}

export interface DriverPerformance {
  acceptance_rate: number;   // 0–100
  completion_rate: number;   // 0–100
  on_time_rate: number;      // 0–100
  avg_rating: number;        // 0–5
  transfers_this_month: number;
  transfers_this_week: number;
  incidents: number;
}

export interface DriverAvailabilityDay {
  date: string;       // YYYY-MM-DD
  label: string;      // Mon, Tue, etc.
  status: DayAvailability;
  shifts: ('morning' | 'afternoon' | 'evening')[];
}

export interface MockDriver {
  id: string;
  tenant_id: string;
  // user fields
  full_name: string;
  initials: string;
  email: string;
  phone: string;
  avatar_url: string | null;
  license_type: string;      // CNH type: A, B, C, D, E, AB, AD
  // user_tenants fields
  role: 'driver';
  status: DriverStatus;
  joined_at: string;
  // vehicle
  assigned_vehicle: string | null;
  assigned_vehicle_plate: string | null;
  assigned_vehicle_type: string | null;
  vehicle_capacity: number | null;
  // operational
  transfers_today: number;
  transfers_total: number;
  last_activity: string | null;
  today_transfers: DriverTodayTransfer[];
  // performance
  performance: DriverPerformance;
  // availability (next 7 days starting 2026-05-17)
  availability: DriverAvailabilityDay[];
  // app
  app_installed: boolean;
  app_last_login: string | null;
  app_device: string | null;
  // notes
  notes: string | null;
}

const makeAvailability = (statuses: DayAvailability[]): DriverAvailabilityDay[] => {
  const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const base = new Date('2026-05-17');
  return statuses.map((status, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return {
      date: d.toISOString().split('T')[0],
      label: days[d.getDay()],
      status,
      shifts: status === 'available'
        ? ['morning', 'afternoon', 'evening']
        : status === 'partial'
        ? ['morning', 'afternoon']
        : [],
    };
  });
};

export const mockDrivers: MockDriver[] = [
  {
    id: 'drv-1',
    tenant_id: 'ten1',
    full_name: 'João Silva',
    initials: 'JS',
    email: 'joao.silva@ec.com',
    phone: '+55 21 98801-2233',
    avatar_url: null,
    license_type: 'D',
    role: 'driver',
    status: 'on_trip',
    joined_at: '2023-03-15',
    assigned_vehicle: 'Mercedes Vito',
    assigned_vehicle_plate: 'ABC-1D23',
    assigned_vehicle_type: 'Van Premium',
    vehicle_capacity: 8,
    transfers_today: 3,
    transfers_total: 248,
    last_activity: '2026-05-17T16:02:00',
    today_transfers: [
      { id: 'tt1', reference: 'TR-0029', route_name: 'Copacabana → Centro', scheduled_at: '2026-05-17T10:00:00', status: 'completed' },
      { id: 'tt2', reference: 'TR-0031', route_name: 'Ipanema → GIG', scheduled_at: '2026-05-17T16:00:00', status: 'in_progress' },
      { id: 'tt3', reference: 'TR-0024', route_name: 'GIG → Ipanema', scheduled_at: '2026-05-17T20:30:00', status: 'driver_assigned' },
    ],
    performance: {
      acceptance_rate: 98,
      completion_rate: 99,
      on_time_rate: 96,
      avg_rating: 4.9,
      transfers_this_month: 54,
      transfers_this_week: 12,
      incidents: 0,
    },
    availability: makeAvailability(['available', 'available', 'available', 'partial', 'available', 'off', 'available']),
    app_installed: true,
    app_last_login: '2026-05-17T15:58:00',
    app_device: 'iPhone 15 Pro',
    notes: 'Motorista sênior. Responsável por transfers VIP e aeroporto GIG.',
  },
  {
    id: 'drv-2',
    tenant_id: 'ten1',
    full_name: 'Carlos Mendes',
    initials: 'CM',
    email: 'carlos.mendes@ec.com',
    phone: '+55 21 99900-7788',
    avatar_url: null,
    license_type: 'D',
    role: 'driver',
    status: 'on_trip',
    joined_at: '2023-06-01',
    assigned_vehicle: 'Toyota Hiace',
    assigned_vehicle_plate: 'DEF-2E34',
    assigned_vehicle_type: 'Minibus',
    vehicle_capacity: 14,
    transfers_today: 2,
    transfers_total: 195,
    last_activity: '2026-05-17T14:33:00',
    today_transfers: [
      { id: 'tt4', reference: 'TR-0030', route_name: 'SDU → Leblon', scheduled_at: '2026-05-17T14:30:00', status: 'in_progress' },
      { id: 'tt5', reference: 'TR-0026', route_name: 'GIG → Paraty Experiência', scheduled_at: '2026-05-18T11:00:00', status: 'driver_assigned' },
    ],
    performance: {
      acceptance_rate: 95,
      completion_rate: 97,
      on_time_rate: 92,
      avg_rating: 4.8,
      transfers_this_month: 41,
      transfers_this_week: 9,
      incidents: 1,
    },
    availability: makeAvailability(['available', 'available', 'partial', 'available', 'available', 'available', 'off']),
    app_installed: true,
    app_last_login: '2026-05-17T14:25:00',
    app_device: 'Samsung Galaxy S24',
    notes: 'Especialista em grupos grandes e minibus. CNH D com experiência em transporte coletivo.',
  },
  {
    id: 'drv-3',
    tenant_id: 'ten1',
    full_name: 'Ana Ferreira',
    initials: 'AF',
    email: 'ana.ferreira@ec.com',
    phone: '+55 21 99011-3344',
    avatar_url: null,
    license_type: 'D',
    role: 'driver',
    status: 'available',
    joined_at: '2022-11-20',
    assigned_vehicle: 'Sprinter Premium',
    assigned_vehicle_plate: 'GHI-3F45',
    assigned_vehicle_type: 'Van Executiva',
    vehicle_capacity: 10,
    transfers_today: 1,
    transfers_total: 312,
    last_activity: '2026-05-17T10:47:00',
    today_transfers: [
      { id: 'tt6', reference: 'TR-0029', route_name: 'Copacabana → Centro', scheduled_at: '2026-05-17T10:00:00', status: 'completed' },
    ],
    performance: {
      acceptance_rate: 99,
      completion_rate: 100,
      on_time_rate: 98,
      avg_rating: 5.0,
      transfers_this_month: 67,
      transfers_this_week: 14,
      incidents: 0,
    },
    availability: makeAvailability(['available', 'available', 'available', 'available', 'partial', 'available', 'off']),
    app_installed: true,
    app_last_login: '2026-05-17T11:00:00',
    app_device: 'iPhone 14',
    notes: 'Motorista mais experiente da frota. Alta aprovação VIP. Foco em transfers executivos.',
  },
  {
    id: 'drv-4',
    tenant_id: 'ten1',
    full_name: 'Pedro Rocha',
    initials: 'PR',
    email: 'pedro.rocha@ec.com',
    phone: '+55 22 98800-4455',
    avatar_url: null,
    license_type: 'D',
    role: 'driver',
    status: 'on_trip',
    joined_at: '2024-01-10',
    assigned_vehicle: 'Van Executive',
    assigned_vehicle_plate: 'JKL-4G56',
    assigned_vehicle_type: 'Van Executiva',
    vehicle_capacity: 8,
    transfers_today: 2,
    transfers_total: 167,
    last_activity: '2026-05-17T15:35:00',
    today_transfers: [
      { id: 'tt7', reference: 'TR-0025', route_name: 'GIG → Barra', scheduled_at: '2026-05-17T15:00:00', status: 'in_progress' },
      { id: 'tt8', reference: 'TR-0028', route_name: 'Rio → Búzios Premium', scheduled_at: '2026-05-18T08:00:00', status: 'driver_assigned' },
    ],
    performance: {
      acceptance_rate: 90,
      completion_rate: 94,
      on_time_rate: 85,
      avg_rating: 4.7,
      transfers_this_month: 35,
      transfers_this_week: 8,
      incidents: 2,
    },
    availability: makeAvailability(['available', 'partial', 'available', 'available', 'available', 'off', 'available']),
    app_installed: true,
    app_last_login: '2026-05-17T15:00:00',
    app_device: 'Motorola Edge 40',
    notes: 'Transfer com atraso em 17/05. Notificado. Atenção a prazos em GIG.',
  },
  {
    id: 'drv-5',
    tenant_id: 'ten1',
    full_name: 'Marcos Lima',
    initials: 'ML',
    email: 'marcos.lima@ec.com',
    phone: '+55 21 97234-5678',
    avatar_url: null,
    license_type: 'B',
    role: 'driver',
    status: 'paused',
    joined_at: '2024-08-05',
    assigned_vehicle: null,
    assigned_vehicle_plate: null,
    assigned_vehicle_type: null,
    vehicle_capacity: null,
    transfers_today: 0,
    transfers_total: 89,
    last_activity: '2026-05-15T17:30:00',
    today_transfers: [],
    performance: {
      acceptance_rate: 88,
      completion_rate: 91,
      on_time_rate: 84,
      avg_rating: 4.6,
      transfers_this_month: 12,
      transfers_this_week: 0,
      incidents: 1,
    },
    availability: makeAvailability(['off', 'off', 'available', 'available', 'available', 'available', 'off']),
    app_installed: true,
    app_last_login: '2026-05-15T17:28:00',
    app_device: 'iPhone 13',
    notes: 'Em pausa — aguardando renovação CNH. Retorno previsto para 19/05.',
  },
  {
    id: 'drv-6',
    tenant_id: 'ten1',
    full_name: 'Sandra Vieira',
    initials: 'SV',
    email: 'sandra.vieira@ec.com',
    phone: '+55 21 96789-0123',
    avatar_url: null,
    license_type: 'D',
    role: 'driver',
    status: 'unavailable',
    joined_at: '2025-02-14',
    assigned_vehicle: null,
    assigned_vehicle_plate: null,
    assigned_vehicle_type: null,
    vehicle_capacity: null,
    transfers_today: 0,
    transfers_total: 54,
    last_activity: '2026-05-10T09:00:00',
    today_transfers: [],
    performance: {
      acceptance_rate: 92,
      completion_rate: 96,
      on_time_rate: 93,
      avg_rating: 4.8,
      transfers_this_month: 0,
      transfers_this_week: 0,
      incidents: 0,
    },
    availability: makeAvailability(['blocked', 'blocked', 'blocked', 'blocked', 'blocked', 'available', 'available']),
    app_installed: false,
    app_last_login: null,
    app_device: null,
    notes: 'Férias até 21/05. Retorno confirmado para o fim de semana.',
  },
  {
    id: 'drv-7',
    tenant_id: 'ten1',
    full_name: 'Rafael Monteiro',
    initials: 'RM',
    email: 'rafael.monteiro@ec.com',
    phone: '+55 21 98456-7890',
    avatar_url: null,
    license_type: 'D',
    role: 'driver',
    status: 'pending',
    joined_at: '2026-05-10',
    assigned_vehicle: null,
    assigned_vehicle_plate: null,
    assigned_vehicle_type: null,
    vehicle_capacity: null,
    transfers_today: 0,
    transfers_total: 0,
    last_activity: null,
    today_transfers: [],
    performance: {
      acceptance_rate: 0,
      completion_rate: 0,
      on_time_rate: 0,
      avg_rating: 0,
      transfers_this_month: 0,
      transfers_this_week: 0,
      incidents: 0,
    },
    availability: makeAvailability(['available', 'available', 'available', 'available', 'available', 'available', 'available']),
    app_installed: false,
    app_last_login: null,
    app_device: null,
    notes: 'Cadastro pendente. Aguardando convite de acesso ao App do Motorista.',
  },
];