// admin-availability.ts — aligned to: drivers/users, vehicles, bookings, routes

export type SlotStatus =
  | 'available'
  | 'reserved'
  | 'blocked'
  | 'maintenance'
  | 'off'
  | 'in_operation'
  | 'partial';

export interface DaySlot {
  morning: SlotStatus;
  afternoon: SlotStatus;
  evening: SlotStatus;
  booking_ref?: string;
  notes?: string;
}

export interface WeekSchedule {
  mon: DaySlot;
  tue: DaySlot;
  wed: DaySlot;
  thu: DaySlot;
  fri: DaySlot;
  sat: DaySlot;
  sun: DaySlot;
}

export type ResourceType = 'driver' | 'vehicle';

export interface AvailabilityDriver {
  id: string;
  name: string;
  initials: string;
  avatar_color: string;
  phone: string;
  category: string;
  rating: number;
  license: string;
  status: 'active' | 'inactive' | 'on_leave';
  weekly: WeekSchedule;
  shifts_today: number;
  total_this_week: number;
  blocked_days: number;
}

export interface AvailabilityVehicle {
  id: string;
  plate: string;
  model: string;
  type: string;
  capacity: number;
  assigned_driver_id: string | null;
  assigned_driver_name: string | null;
  status: 'active' | 'maintenance' | 'inactive';
  maintenance_due: string | null;
  weekly: WeekSchedule;
  km_today: number;
  operations_today: number;
}

export interface AvailabilityConflict {
  id: string;
  type: 'driver_overlap' | 'vehicle_overlap' | 'double_booking' | 'maintenance_conflict' | 'no_driver';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affected_ids: string[];
  affected_names: string[];
  day: string;
  time_range: string;
  booking_ref?: string;
}

// ─── Week dates (Mon 11 → Sun 17 May 2026) ────────────────────────────────
export const weekDays = [
  { key: 'mon', short: 'Seg', date: '12', full: 'Seg 12' },
  { key: 'tue', short: 'Ter', date: '13', full: 'Ter 13' },
  { key: 'wed', short: 'Qua', date: '14', full: 'Qua 14' },
  { key: 'thu', short: 'Qui', date: '15', full: 'Qui 15' },
  { key: 'fri', short: 'Sex', date: '16', full: 'Sex 16' },
  { key: 'sat', short: 'Sáb', date: '17', full: 'Sáb 17' },
  { key: 'sun', short: 'Dom', date: '18', full: 'Dom 18' },
] as const;

export const todayKey = 'sat'; // May 17 = Sat

// ─── Drivers ──────────────────────────────────────────────────────────────
export const mockAvailabilityDrivers: AvailabilityDriver[] = [
  {
    id: 'drv_01',
    name: 'Carlos Mendes',
    initials: 'CM',
    avatar_color: 'bg-teal-500/20 text-teal-700',
    phone: '+55 11 9 7654-3210',
    category: 'Executivo',
    rating: 4.9,
    license: 'B + D',
    status: 'active',
    shifts_today: 2,
    total_this_week: 10,
    blocked_days: 0,
    weekly: {
      mon: { morning: 'available', afternoon: 'reserved', evening: 'available', booking_ref: 'BK-0041' },
      tue: { morning: 'in_operation', afternoon: 'in_operation', evening: 'available', booking_ref: 'BK-0043' },
      wed: { morning: 'available', afternoon: 'available', evening: 'available' },
      thu: { morning: 'reserved', afternoon: 'reserved', evening: 'blocked', booking_ref: 'BK-0049', notes: 'Transfer VIP noturno' },
      fri: { morning: 'available', afternoon: 'available', evening: 'available' },
      sat: { morning: 'in_operation', afternoon: 'reserved', evening: 'available', booking_ref: 'BK-0055' },
      sun: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Folga semanal' },
    },
  },
  {
    id: 'drv_02',
    name: 'Paulo Ferreira',
    initials: 'PF',
    avatar_color: 'bg-sky-500/20 text-sky-700',
    phone: '+55 11 9 8765-4321',
    category: 'Premium',
    rating: 4.8,
    license: 'B',
    status: 'active',
    shifts_today: 1,
    total_this_week: 8,
    blocked_days: 1,
    weekly: {
      mon: { morning: 'available', afternoon: 'available', evening: 'reserved', booking_ref: 'BK-0042' },
      tue: { morning: 'blocked', afternoon: 'blocked', evening: 'blocked', notes: 'Consulta médica' },
      wed: { morning: 'available', afternoon: 'reserved', evening: 'available', booking_ref: 'BK-0046' },
      thu: { morning: 'available', afternoon: 'available', evening: 'available' },
      fri: { morning: 'in_operation', afternoon: 'in_operation', evening: 'reserved', booking_ref: 'BK-0051' },
      sat: { morning: 'available', afternoon: 'in_operation', evening: 'available', booking_ref: 'BK-0056' },
      sun: { morning: 'available', afternoon: 'available', evening: 'off' },
    },
  },
  {
    id: 'drv_03',
    name: 'Marcos Lima',
    initials: 'ML',
    avatar_color: 'bg-amber-500/20 text-amber-700',
    phone: '+55 21 9 9876-5432',
    category: 'Standard',
    rating: 4.6,
    license: 'B',
    status: 'active',
    shifts_today: 0,
    total_this_week: 5,
    blocked_days: 2,
    weekly: {
      mon: { morning: 'available', afternoon: 'available', evening: 'available' },
      tue: { morning: 'reserved', afternoon: 'available', evening: 'available', booking_ref: 'BK-0044' },
      wed: { morning: 'blocked', afternoon: 'blocked', evening: 'available', notes: 'Treinamento interno' },
      thu: { morning: 'available', afternoon: 'reserved', evening: 'available', booking_ref: 'BK-0050' },
      fri: { morning: 'available', afternoon: 'available', evening: 'available' },
      sat: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Folga' },
      sun: { morning: 'available', afternoon: 'available', evening: 'available' },
    },
  },
  {
    id: 'drv_04',
    name: 'André Rocha',
    initials: 'AR',
    avatar_color: 'bg-indigo-500/20 text-indigo-700',
    phone: '+55 11 9 5432-1098',
    category: 'Van',
    rating: 4.7,
    license: 'B + D',
    status: 'active',
    shifts_today: 1,
    total_this_week: 7,
    blocked_days: 0,
    weekly: {
      mon: { morning: 'in_operation', afternoon: 'available', evening: 'available', booking_ref: 'BK-0040' },
      tue: { morning: 'available', afternoon: 'available', evening: 'reserved', booking_ref: 'BK-0045' },
      wed: { morning: 'reserved', afternoon: 'reserved', evening: 'available', booking_ref: 'BK-0047' },
      thu: { morning: 'available', afternoon: 'available', evening: 'available' },
      fri: { morning: 'blocked', afternoon: 'available', evening: 'reserved', booking_ref: 'BK-0052', notes: 'Manhã reservada p/ revisão' },
      sat: { morning: 'available', afternoon: 'reserved', evening: 'in_operation', booking_ref: 'BK-0057' },
      sun: { morning: 'off', afternoon: 'available', evening: 'available' },
    },
  },
  {
    id: 'drv_05',
    name: 'Roberto Castro',
    initials: 'RC',
    avatar_color: 'bg-rose-500/20 text-rose-700',
    phone: '+55 11 9 4321-0987',
    category: 'Executivo',
    rating: 4.5,
    license: 'B',
    status: 'on_leave',
    shifts_today: 0,
    total_this_week: 0,
    blocked_days: 7,
    weekly: {
      mon: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Férias' },
      tue: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Férias' },
      wed: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Férias' },
      thu: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Férias' },
      fri: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Férias' },
      sat: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Férias' },
      sun: { morning: 'off', afternoon: 'off', evening: 'off', notes: 'Férias' },
    },
  },
];

// ─── Vehicles ─────────────────────────────────────────────────────────────
export const mockAvailabilityVehicles: AvailabilityVehicle[] = [
  {
    id: 'veh_01',
    plate: 'ABC-1234',
    model: 'Mercedes-Benz Classe E',
    type: 'Sedan Executivo',
    capacity: 3,
    assigned_driver_id: 'drv_01',
    assigned_driver_name: 'Carlos Mendes',
    status: 'active',
    maintenance_due: null,
    km_today: 148,
    operations_today: 2,
    weekly: {
      mon: { morning: 'available', afternoon: 'in_operation', evening: 'available', booking_ref: 'BK-0041' },
      tue: { morning: 'in_operation', afternoon: 'in_operation', evening: 'available' },
      wed: { morning: 'available', afternoon: 'available', evening: 'available' },
      thu: { morning: 'reserved', afternoon: 'reserved', evening: 'available' },
      fri: { morning: 'available', afternoon: 'available', evening: 'available' },
      sat: { morning: 'in_operation', afternoon: 'reserved', evening: 'available' },
      sun: { morning: 'available', afternoon: 'available', evening: 'available' },
    },
  },
  {
    id: 'veh_02',
    plate: 'DEF-5678',
    model: 'BMW Série 5',
    type: 'Sedan Premium',
    capacity: 3,
    assigned_driver_id: 'drv_02',
    assigned_driver_name: 'Paulo Ferreira',
    status: 'active',
    maintenance_due: null,
    km_today: 92,
    operations_today: 1,
    weekly: {
      mon: { morning: 'available', afternoon: 'available', evening: 'reserved' },
      tue: { morning: 'available', afternoon: 'available', evening: 'available' },
      wed: { morning: 'available', afternoon: 'reserved', evening: 'available' },
      thu: { morning: 'available', afternoon: 'available', evening: 'available' },
      fri: { morning: 'in_operation', afternoon: 'in_operation', evening: 'reserved' },
      sat: { morning: 'available', afternoon: 'in_operation', evening: 'available' },
      sun: { morning: 'available', afternoon: 'available', evening: 'available' },
    },
  },
  {
    id: 'veh_03',
    plate: 'GHI-9012',
    model: 'Toyota Hiace',
    type: 'Van Executiva',
    capacity: 12,
    assigned_driver_id: 'drv_04',
    assigned_driver_name: 'André Rocha',
    status: 'active',
    maintenance_due: '2026-05-25',
    km_today: 215,
    operations_today: 3,
    weekly: {
      mon: { morning: 'in_operation', afternoon: 'available', evening: 'available' },
      tue: { morning: 'available', afternoon: 'available', evening: 'reserved' },
      wed: { morning: 'reserved', afternoon: 'reserved', evening: 'available' },
      thu: { morning: 'available', afternoon: 'available', evening: 'available' },
      fri: { morning: 'available', afternoon: 'available', evening: 'reserved' },
      sat: { morning: 'available', afternoon: 'reserved', evening: 'in_operation' },
      sun: { morning: 'maintenance', afternoon: 'maintenance', evening: 'maintenance', notes: 'Revisão preventiva agendada' },
    },
  },
  {
    id: 'veh_04',
    plate: 'JKL-3456',
    model: 'Chevrolet S10 Cabine Dupla',
    type: 'SUV Premium',
    capacity: 5,
    assigned_driver_id: 'drv_03',
    assigned_driver_name: 'Marcos Lima',
    status: 'maintenance',
    maintenance_due: '2026-05-18',
    km_today: 0,
    operations_today: 0,
    weekly: {
      mon: { morning: 'maintenance', afternoon: 'maintenance', evening: 'maintenance', notes: 'Em manutenção corretiva' },
      tue: { morning: 'maintenance', afternoon: 'maintenance', evening: 'maintenance' },
      wed: { morning: 'maintenance', afternoon: 'available', evening: 'available', notes: 'Retorno previsto 13h' },
      thu: { morning: 'available', afternoon: 'available', evening: 'available' },
      fri: { morning: 'available', afternoon: 'available', evening: 'available' },
      sat: { morning: 'available', afternoon: 'available', evening: 'available' },
      sun: { morning: 'available', afternoon: 'available', evening: 'available' },
    },
  },
];

// ─── Conflicts ─────────────────────────────────────────────────────────────
export const mockConflicts: AvailabilityConflict[] = [
  {
    id: 'cfl_01',
    type: 'double_booking',
    severity: 'high',
    title: 'Sobreposição de reservas — Carlos Mendes',
    description: 'Motorista alocado em dois transfers simultâneos no período da tarde.',
    affected_ids: ['drv_01'],
    affected_names: ['Carlos Mendes'],
    day: 'Qui 15',
    time_range: '14h00 – 17h30',
    booking_ref: 'BK-0049',
  },
  {
    id: 'cfl_02',
    type: 'maintenance_conflict',
    severity: 'medium',
    title: 'Veículo JKL-3456 em manutenção — transfer agendado',
    description: 'SUV Premium está na oficina mas possui reserva para sexta-feira. Verificar retorno.',
    affected_ids: ['veh_04'],
    affected_names: ['JKL-3456 · Chevrolet S10'],
    day: 'Sex 16',
    time_range: 'Manhã',
    booking_ref: 'BK-0052',
  },
  {
    id: 'cfl_03',
    type: 'no_driver',
    severity: 'medium',
    title: 'Transfer sem motorista — Domingo',
    description: 'Roberto Castro em férias. Três escalas no domingo sem cobertura de motorista.',
    affected_ids: ['drv_05'],
    affected_names: ['Roberto Castro'],
    day: 'Dom 18',
    time_range: 'Dia todo',
  },
  {
    id: 'cfl_04',
    type: 'driver_overlap',
    severity: 'low',
    title: 'Paulo Ferreira — bloqueio na terça',
    description: 'Motorista marcou indisponibilidade em dia com reserva previamente anotada.',
    affected_ids: ['drv_02'],
    affected_names: ['Paulo Ferreira'],
    day: 'Ter 13',
    time_range: 'Dia todo',
  },
];

// ─── Summary Stats ──────────────────────────────────────────────────────────
export const mockAvailabilitySummary = {
  drivers_available: 3,
  drivers_total: 5,
  vehicles_available: 2,
  vehicles_total: 4,
  conflicts_detected: mockConflicts.length,
  active_blocks: 4,
  operational_capacity_pct: 72,
  shifts_today: 5,
};