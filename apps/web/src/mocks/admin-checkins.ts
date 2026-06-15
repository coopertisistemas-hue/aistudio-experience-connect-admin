// PLACEHOLDER — schema-aware mock aligned with bookings, passengers, routes, vehicles, users tables
// check-in status mirrors passenger operational state for boarding coordination

export type CheckinStatus = 'pending' | 'confirmed' | 'boarded' | 'in_transit' | 'completed' | 'absent' | 'cancelled';

export interface MockCheckinPassenger {
  id: string;
  full_name: string;
  document?: string;
  age_group: 'adult' | 'child' | 'senior';
  checkin_status: CheckinStatus;
  checked_in_at?: string;
  boarded_at?: string;
  seat?: string;
  special_needs?: string;
}

export interface MockCheckinTimelineEvent {
  id: string;
  event: string;
  label: string;
  description: string;
  at: string;
  icon: string;
  color: 'teal' | 'navy' | 'amber' | 'red' | 'stone';
}

export interface MockCheckin {
  id: string;
  booking_reference: string;
  booking_id: string;
  tenant_id: string;
  // Scheduling
  scheduled_at: string;
  scheduled_date: string;
  scheduled_time: string;
  // Route
  route_name: string;
  origin: string;
  destination: string;
  category: 'airport' | 'hotel' | 'tourism' | 'corporate';
  // Passengers
  passenger_lead: string;
  passenger_lead_phone: string;
  passenger_lead_email: string;
  passenger_count: number;
  passengers: MockCheckinPassenger[];
  // Operation
  driver_name: string | null;
  driver_phone: string | null;
  driver_initials: string | null;
  vehicle_name: string | null;
  vehicle_plate: string | null;
  vehicle_type: string | null;
  vehicle_capacity: number | null;
  // Status
  status: CheckinStatus;
  boarding_status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  confirmed_count: number;
  boarded_count: number;
  // Meta
  notes: string | null;
  checkin_started_at: string | null;
  boarding_started_at: string | null;
  completed_at: string | null;
  delay_minutes?: number;
  qr_code_ref?: string;
  timeline: MockCheckinTimelineEvent[];
}

export const mockCheckins: any[] = [];

export const mockCheckinStats: any = { today_total: 0, pending: 0, boarded: 0, absent: 0, transfers_ready: 0, waiting_arrival: 0, confirmed: 0 };