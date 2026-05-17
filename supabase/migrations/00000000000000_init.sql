-- Migration inicial: schema base + RLS + funções utilitárias
-- Dom Pietro Experience Connect

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS (estende auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  full_name text,
  avatar_url text,
  role text NOT NULL DEFAULT 'guest' CHECK (role IN ('guest', 'admin', 'driver', 'super_admin')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  preferences jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VEHICLES
-- ============================================
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('van', 'sedan', 'suv', 'bus', 'motorcycle')),
  plate text,
  capacity int NOT NULL DEFAULT 4,
  color text,
  photo_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ROUTES
-- ============================================
CREATE TABLE IF NOT EXISTS routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  origin_coords point,
  destination_coords point,
  distance_km decimal(10,2),
  duration_min int,
  base_price decimal(10,2) NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BOOKINGS
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_type') THEN
    CREATE TYPE booking_type AS ENUM ('transfer', 'experience', 'itinerary');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_status') THEN
    CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id),
  route_id uuid REFERENCES routes(id),
  vehicle_id uuid REFERENCES vehicles(id),
  driver_id uuid REFERENCES users(id),
  booking_type booking_type NOT NULL DEFAULT 'transfer',
  status booking_status NOT NULL DEFAULT 'pending',
  scheduled_at timestamptz NOT NULL,
  pickup_location text,
  dropoff_location text,
  passenger_count int NOT NULL DEFAULT 1,
  luggage_count int DEFAULT 0,
  special_requests text,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status NOT NULL DEFAULT 'pending',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled ON bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant_status ON bookings(tenant_id, status);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PASSENGERS
-- ============================================
CREATE TABLE IF NOT EXISTS passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  document text,
  age_group text NOT NULL DEFAULT 'adult' CHECK (age_group IN ('adult', 'child', 'infant')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  user_id uuid NOT NULL REFERENCES users(id),
  provider text NOT NULL DEFAULT 'mercado_pago',
  provider_payment_id text,
  amount decimal(10,2) NOT NULL,
  currency text NOT NULL DEFAULT 'BRL',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  method text CHECK (method IN ('credit_card', 'debit_card', 'pix', 'boleto')),
  metadata jsonb NOT NULL DEFAULT '{}',
  paid_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id),
  invoice_number text NOT NULL,
  amount decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) NOT NULL DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date,
  paid_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id),
  sender_id uuid NOT NULL REFERENCES users(id),
  recipient_id uuid REFERENCES users(id),
  channel text NOT NULL DEFAULT 'app' CHECK (channel IN ('app', 'sms', 'email', 'whatsapp')),
  type text NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'system')),
  content text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUDIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  table_name text NOT NULL,
  record_id uuid,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- ============================================
-- FUNÇÕES UTILITÁRIAS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers de updated_at
CREATE OR REPLACE FUNCTION create_updated_at_trigger(table_name text)
RETURNS void AS $$
BEGIN
  EXECUTE format(
    'CREATE TRIGGER %I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();',
    table_name, table_name
  );
END;
$$ LANGUAGE plpgsql;

SELECT create_updated_at_trigger('tenants');
SELECT create_updated_at_trigger('users');
SELECT create_updated_at_trigger('vehicles');
SELECT create_updated_at_trigger('routes');
SELECT create_updated_at_trigger('bookings');

-- Função para setar contexto de tenant
CREATE OR REPLACE FUNCTION set_tenant_context(tenant_uuid uuid)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_tenant', tenant_uuid::text, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS POLICIES (padrão)
-- ============================================

-- Users: isolamento por tenant + próprio perfil
CREATE POLICY "users_tenant_select" ON users
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    OR role = 'super_admin'
  );

CREATE POLICY "users_tenant_modify" ON users
  FOR ALL USING (
    (tenant_id = current_setting('app.current_tenant', true)::uuid AND auth.jwt() ->> 'role' IN ('admin', 'super_admin'))
    OR id = auth.uid()
  );

-- Vehicles
CREATE POLICY "vehicles_tenant_select" ON vehicles
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY "vehicles_tenant_modify" ON vehicles
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );

-- Routes
CREATE POLICY "routes_tenant_select" ON routes
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY "routes_tenant_modify" ON routes
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );

-- Bookings
CREATE POLICY "bookings_tenant_select" ON bookings
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND (user_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'driver', 'super_admin'))
  );

CREATE POLICY "bookings_tenant_modify" ON bookings
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND (user_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'super_admin'))
  );

-- Passengers
CREATE POLICY "passengers_tenant_select" ON passengers
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY "passengers_tenant_modify" ON passengers
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );

-- Payments
CREATE POLICY "payments_tenant_select" ON payments
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND (user_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'super_admin'))
  );

CREATE POLICY "payments_tenant_modify" ON payments
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );

-- Invoices
CREATE POLICY "invoices_tenant_select" ON invoices
  FOR SELECT USING (tenant_id = current_setting('app.current_tenant', true)::uuid);

CREATE POLICY "invoices_tenant_modify" ON invoices
  FOR ALL USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );

-- Messages
CREATE POLICY "messages_tenant_select" ON messages
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND (sender_id = auth.uid() OR recipient_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'super_admin'))
  );

CREATE POLICY "messages_tenant_insert" ON messages
  FOR INSERT WITH CHECK (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND sender_id = auth.uid()
  );

-- Audit logs: apenas admin/super_admin
CREATE POLICY "audit_logs_tenant_select" ON audit_logs
  FOR SELECT USING (
    tenant_id = current_setting('app.current_tenant', true)::uuid
    AND auth.jwt() ->> 'role' IN ('admin', 'super_admin')
  );
