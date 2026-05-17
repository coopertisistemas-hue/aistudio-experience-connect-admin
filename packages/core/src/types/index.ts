// V2 Type Exports — Dom Pietro Experience Connect
// Aligned with 20250516120000_v2_core_schema.sql

export type TenantId = string;
export type UserId = string;
export type BookingId = string;

// V2 membership roles (stored in user_tenants.role, NOT users.role)
export type Role = 'guest' | 'admin' | 'driver' | 'operator';

// V2 booking statuses (from schema CHECK constraint)
export type BookingStatus =
  | 'draft'
  | 'hold_created'
  | 'payment_pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

// V2 payment statuses (source of truth: payments.status)
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type VehicleType = 'van' | 'sedan' | 'suv' | 'bus' | 'motorcycle';

// V2 vehicle statuses (from schema CHECK constraint)
export type VehicleStatus = 'available' | 'held' | 'reserved' | 'maintenance' | 'inactive';

// Re-export generated database types
export type { Database } from './database';
