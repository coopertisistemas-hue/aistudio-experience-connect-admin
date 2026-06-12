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
// DB CHECK constraint: pending, completed, failed, refunded, cancelled, processing
// 'overdue', 'partial', 'paid' are computed/UI-only statuses (not stored in DB)
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'overdue' | 'partial' | 'cancelled' | 'paid' | 'processing';

export type PaymentMethod = 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash' | 'payment_link';

export interface PaymentWithDetails {
  id: string;
  tenant_id: string;
  booking_id: string;
  user_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  method: PaymentMethod | null;
  provider: string;
  provider_payment_id: string | null;
  preference_id: string | null;
  paid_at: string | null;
  refunded_at: string | null;
  created_at: string;
  updated_at: string;
}

export type VehicleType = 'van' | 'sedan' | 'suv' | 'bus' | 'motorcycle';

// V2 vehicle statuses (from schema CHECK constraint)
export type VehicleStatus = 'available' | 'held' | 'reserved' | 'maintenance' | 'inactive';

// Re-export generated database types
export type { Database } from './database';
