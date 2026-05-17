-- Migration: V2 Core Schema
-- Dom Pietro Experience Connect
-- Forward-only. Idempotent where possible.

-- ============================================
-- EXTENSIONS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ============================================
-- HELPERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION is_tenant_member(t_uuid uuid, required_roles text[] DEFAULT NULL)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_tenants ut
    WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = t_uuid
      AND ut.status = 'active'
      AND (required_roles IS NULL OR ut.role = ANY(required_roles))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TENANTS
-- ============================================
CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  settings jsonb NOT NULL DEFAULT '{}',
  branding jsonb NOT NULL DEFAULT '{}',
  plan text NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'pro', 'enterprise')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);

DO $trig1$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tenants_updated_at') THEN
    CREATE TRIGGER trg_tenants_updated_at BEFORE UPDATE ON tenants
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig1$;

-- ============================================
-- USERS (profile extension)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  full_name text,
  avatar_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  preferences jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

DO $trig2$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_users_updated_at') THEN
    CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig2$;

-- ============================================
-- USER_TENANTS (memberships)
-- ============================================
CREATE TABLE IF NOT EXISTS user_tenants (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('guest', 'admin', 'driver', 'operator')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  invited_by uuid REFERENCES auth.users(id),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tenant_id)
);

ALTER TABLE user_tenants ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_user_tenants_tenant ON user_tenants(tenant_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_user ON user_tenants(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tenants_role ON user_tenants(tenant_id, role) WHERE status = 'active';

DO $trig3$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_user_tenants_updated_at') THEN
    CREATE TRIGGER trg_user_tenants_updated_at BEFORE UPDATE ON user_tenants
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig3$;

-- ============================================
-- SERVED_LODGINGS (pousadas / hotels)
-- ============================================
CREATE TABLE IF NOT EXISTS served_lodgings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name text NOT NULL,
  contact_person text,
  phone text,
  whatsapp text,
  address text,
  pickup_point text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE served_lodgings ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_served_lodgings_tenant ON served_lodgings(tenant_id);

DO $trig_sl$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_served_lodgings_updated_at') THEN
    CREATE TRIGGER trg_served_lodgings_updated_at BEFORE UPDATE ON served_lodgings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig_sl$;

-- ============================================
-- DRIVERS
-- ============================================
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name text NOT NULL,
  phone text,
  whatsapp text,
  document text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_trip', 'off_duty')),
  default_vehicle_id uuid,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_drivers_tenant ON drivers(tenant_id);

DO $trig_drv$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_drivers_updated_at') THEN
    CREATE TRIGGER trg_drivers_updated_at BEFORE UPDATE ON drivers
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig_drv$;

-- ============================================
-- ROUTE_CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS route_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  sort_order int NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE route_categories ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_route_categories_tenant ON route_categories(tenant_id);

DO $trig_rc$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_route_categories_updated_at') THEN
    CREATE TRIGGER trg_route_categories_updated_at BEFORE UPDATE ON route_categories
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig_rc$;

-- ============================================
-- PARTNERS (restaurants, attractions, operators)
-- ============================================
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  partner_type text NOT NULL CHECK (partner_type IN ('restaurant', 'attraction', 'tourism_operator', 'gastronomy', 'experience')),
  name text NOT NULL,
  contact_name text,
  phone text,
  whatsapp text,
  address text,
  notes text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_partners_tenant ON partners(tenant_id);
CREATE INDEX IF NOT EXISTS idx_partners_type ON partners(tenant_id, partner_type);

DO $trig_part$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_partners_updated_at') THEN
    CREATE TRIGGER trg_partners_updated_at BEFORE UPDATE ON partners
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig_part$;

-- ============================================
-- VEHICLES
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('van', 'sedan', 'suv', 'bus', 'motorcycle')),
  plate text,
  model text,
  capacity int NOT NULL DEFAULT 4 CHECK (capacity > 0),
  color text,
  photo_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'inactive')),
  default_driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_vehicles_tenant ON vehicles(tenant_id);

DO $trig4$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vehicles_updated_at') THEN
    CREATE TRIGGER trg_vehicles_updated_at BEFORE UPDATE ON vehicles
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig4$;

-- Add FK from drivers to vehicles (after vehicles exist)
DO $drv_fk$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_drivers_default_vehicle'
  ) THEN
    ALTER TABLE drivers ADD CONSTRAINT fk_drivers_default_vehicle
      FOREIGN KEY (default_vehicle_id) REFERENCES vehicles(id) ON DELETE SET NULL;
  END IF;
END $drv_fk$;

-- ============================================
-- ROUTES / EXPERIENCES
-- ============================================
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  category_id uuid REFERENCES route_categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text NOT NULL,
  short_description text,
  full_description text,
  origin text,
  destination text,
  origin_coords point,
  destination_coords point,
  distance_km decimal(10,2),
  duration_min int CHECK (duration_min > 0),
  base_price decimal(10,2) NOT NULL CHECK (base_price >= 0),
  images jsonb NOT NULL DEFAULT '[]',
  included_items jsonb NOT NULL DEFAULT '[]',
  pickup_info text,
  operational_notes text,
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_routes_tenant ON routes(tenant_id);
CREATE INDEX IF NOT EXISTS idx_routes_category ON routes(category_id);

DO $trig5$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_routes_updated_at') THEN
    CREATE TRIGGER trg_routes_updated_at BEFORE UPDATE ON routes
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig5$;

-- ============================================
-- VEHICLE_SLOTS (inventory pool)
-- ============================================
CREATE TABLE IF NOT EXISTS vehicle_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL CHECK (slot_end > slot_start),
  total_capacity int NOT NULL CHECK (total_capacity > 0),
  held_seats int NOT NULL DEFAULT 0 CHECK (held_seats >= 0),
  reserved_seats int NOT NULL DEFAULT 0 CHECK (reserved_seats >= 0),
  remaining_seats int NOT NULL DEFAULT 0 CHECK (remaining_seats >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'reserved')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  lock_version int NOT NULL DEFAULT 0
);

DO $check1$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_slot_capacity'
  ) THEN
    ALTER TABLE vehicle_slots ADD CONSTRAINT chk_slot_capacity
      CHECK (held_seats + reserved_seats <= total_capacity);
  END IF;
END $check1$;

DO $check2$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_slot_remaining'
  ) THEN
    ALTER TABLE vehicle_slots ADD CONSTRAINT chk_slot_remaining
      CHECK (remaining_seats = total_capacity - held_seats - reserved_seats);
  END IF;
END $check2$;

-- Overlap exclusion constraint
DO $block$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exclude_vehicle_slot_overlap'
  ) THEN
    ALTER TABLE vehicle_slots
      ADD CONSTRAINT exclude_vehicle_slot_overlap
      EXCLUDE USING gist (
        vehicle_id WITH =,
        tstzrange(slot_start, slot_end) WITH &&
      )
      WHERE (status IN ('held', 'reserved'));
  END IF;
END $block$;

CREATE INDEX IF NOT EXISTS idx_vehicle_slots_tenant ON vehicle_slots(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_slots_vehicle ON vehicle_slots(vehicle_id, slot_start);

ALTER TABLE vehicle_slots ENABLE ROW LEVEL SECURITY;

DO $trig6$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_vehicle_slots_updated_at') THEN
    CREATE TRIGGER trg_vehicle_slots_updated_at BEFORE UPDATE ON vehicle_slots
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig6$;

-- ============================================
-- BOOKINGS
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id),
  route_id uuid REFERENCES routes(id),
  vehicle_id uuid REFERENCES vehicles(id),
  vehicle_slot_id uuid REFERENCES vehicle_slots(id),
  driver_id uuid REFERENCES drivers(id),
  served_lodging_id uuid REFERENCES served_lodgings(id) ON DELETE SET NULL,
  booking_type text NOT NULL DEFAULT 'transfer' CHECK (booking_type IN ('transfer', 'experience', 'itinerary')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'hold_created', 'payment_pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'refunded')),
  scheduled_at timestamptz NOT NULL,
  scheduled_end_at timestamptz NOT NULL CHECK (scheduled_end_at > scheduled_at),
  pickup_location text,
  dropoff_location text,
  passenger_count int NOT NULL DEFAULT 1 CHECK (passenger_count > 0),
  seat_count int NOT NULL DEFAULT 1 CHECK (seat_count > 0),
  luggage_count int DEFAULT 0,
  special_requests text,
  total_amount decimal(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  notes text,
  idempotency_key text UNIQUE,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  lock_version int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_scheduled ON bookings(tenant_id, scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_vehicle_time ON bookings(vehicle_id, scheduled_at, scheduled_end_at);
CREATE INDEX IF NOT EXISTS idx_bookings_slot ON bookings(vehicle_slot_id);
CREATE INDEX IF NOT EXISTS idx_bookings_idempotency ON bookings(idempotency_key);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

DO $trig7$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_bookings_updated_at') THEN
    CREATE TRIGGER trg_bookings_updated_at BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig7$;

-- ============================================
-- BOOKING_HOLDS
-- ============================================
CREATE TABLE IF NOT EXISTS booking_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  vehicle_slot_id uuid REFERENCES vehicle_slots(id) ON DELETE SET NULL,
  passenger_count int NOT NULL DEFAULT 1 CHECK (passenger_count > 0),
  seat_count int NOT NULL DEFAULT 1 CHECK (seat_count > 0),
  hold_start timestamptz NOT NULL,
  hold_end timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'expired', 'converted')),
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_holds_tenant ON booking_holds(tenant_id);
CREATE INDEX IF NOT EXISTS idx_booking_holds_booking ON booking_holds(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_holds_slot ON booking_holds(vehicle_slot_id);
CREATE INDEX IF NOT EXISTS idx_booking_holds_expires ON booking_holds(expires_at) WHERE status = 'active';

ALTER TABLE booking_holds ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BOOKING_PASSENGERS
-- ============================================
CREATE TABLE IF NOT EXISTS booking_passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  document text,
  age_group text NOT NULL DEFAULT 'adult' CHECK (age_group IN ('adult', 'child', 'infant')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_passengers_booking ON booking_passengers(booking_id);
ALTER TABLE booking_passengers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  user_id uuid NOT NULL REFERENCES users(id),
  provider text NOT NULL DEFAULT 'mercado_pago',
  provider_payment_id text,
  preference_id text,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  method text CHECK (method IN ('credit_card', 'debit_card', 'pix', 'boleto', 'manual')),
  idempotency_key text NOT NULL UNIQUE,
  metadata jsonb NOT NULL DEFAULT '{}',
  paid_at timestamptz,
  refunded_at timestamptz,
  manual_override_reason text,
  manual_override_by uuid REFERENCES users(id),
  manual_override_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  lock_version int NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_idempotency ON payments(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_payments_provider_payment ON payments(provider, provider_payment_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

DO $trig8$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_payments_updated_at') THEN
    CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig8$;

-- ============================================
-- PAYMENT_EVENTS (append-only ledger)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  event_type text NOT NULL CHECK (event_type IN ('created', 'preference_generated', 'webhook_received', 'confirmed', 'failed', 'refunded', 'reconciled', 'manual_override')),
  provider_event_id text,
  payload jsonb NOT NULL DEFAULT '{}',
  processed_by text NOT NULL,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_events_payment ON payment_events(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_tenant ON payment_events(tenant_id, created_at);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- WEBHOOK_DELIVERIES
-- ============================================
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  payload_signature text,
  payload_hash text NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'validated', 'processed', 'failed')),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_webhook_deliveries_event ON webhook_deliveries(provider, event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_deliveries_status ON webhook_deliveries(status, created_at);

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  invoice_number text NOT NULL,
  amount decimal(10,2) NOT NULL CHECK (amount >= 0),
  tax_amount decimal(10,2) NOT NULL DEFAULT 0 CHECK (tax_amount >= 0),
  total_amount decimal(10,2) NOT NULL CHECK (total_amount >= 0),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_booking ON invoices(booking_id);
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid REFERENCES bookings(id),
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_id uuid REFERENCES users(id),
  channel text NOT NULL DEFAULT 'app' CHECK (channel IN ('app', 'sms', 'email', 'whatsapp')),
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_messages_tenant ON messages(tenant_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUDIT_LOGS (append-only)
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id uuid REFERENCES users(id),
  impersonator_id uuid REFERENCES users(id),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'IMPERSONATE', 'RLS_VIOLATION_ATTEMPT')),
  old_data jsonb,
  new_data jsonb,
  reason text,
  correlation_id text,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant_table ON audit_logs(tenant_id, table_name, created_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_correlation ON audit_logs(correlation_id);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BOOKING_STATUS_CHANGES (append-only)
-- ============================================
CREATE TABLE IF NOT EXISTS booking_status_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  tenant_id uuid NOT NULL,
  previous_status text NOT NULL,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  reason text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_status_changes_booking ON booking_status_changes(booking_id);
CREATE INDEX IF NOT EXISTS idx_status_changes_created ON booking_status_changes(created_at);

ALTER TABLE booking_status_changes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TRIGGERS
-- ============================================

-- Log booking status changes
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO booking_status_changes (
      booking_id, tenant_id, previous_status, new_status, changed_by, correlation_id
    ) VALUES (
      NEW.id, NEW.tenant_id, OLD.status, NEW.status,
      auth.uid(), current_setting('app.correlation_id', true)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $trig$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_booking_status_change'
  ) THEN
    CREATE TRIGGER trg_booking_status_change
      AFTER UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();
  END IF;
END $trig$;
