// admin-availability.ts — aligned to: drivers/users, vehicles, bookings, routes

export type SlotStatus = 'available' | 'reserved' | 'blocked' | 'maintenance' | 'off' | 'in_operation' | 'partial';

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
export const weekDays: { key: string; short: string; full: string; date: string }[] = [];
export const todayKey = '';

// ─── Drivers ──────────────────────────────────────────────────────────────
export const mockAvailabilityDrivers: any[] = [];

// ─── Vehicles ─────────────────────────────────────────────────────────────
export const mockAvailabilityVehicles: any[] = [];

// ─── Conflicts ─────────────────────────────────────────────────────────────
export const mockConflicts: any[] = [];

// ─── Summary Stats ──────────────────────────────────────────────────────────
export const mockAvailabilitySummary: any = { today_total: 0, available_slots: 0, conflicts: 0, occupancy_pct: 0, drivers_available: 0, drivers_total: 0, vehicles_available: 0, vehicles_total: 0, conflicts_detected: 0, active_blocks: 0, operational_capacity_pct: 0, shifts_today: 0 };