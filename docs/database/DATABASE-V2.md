# DATABASE V2 — Dom Pietro Experience Connect

> Complete database architecture for production-grade multi-tenant SaaS. This document replaces DATABASE-V1 entirely.

---

## 1. SCHEMA STRATEGY

### Principles

1. **Multi-tenancy via membership:** `user_tenants` is the source of truth for who belongs to which tenant and with what role.
2. **RLS via membership checks:** Policies query `user_tenants`, not JWT claims.
3. **Append-only audit:** `payment_events`, `booking_status_changes`, `webhook_deliveries` are immutable.
4. **Soft deletes:** All operational tables have `deleted_at`.
5. **Optimistic locking:** Concurrent tables have `lock_version`.
6. **Idempotency:** Critical creation tables have `idempotency_key` with unique constraints.
7. **Forward-only migrations:** Schema evolves without destructive changes.

---

## 2. ENTITY OVERVIEW

```
tenants
  └── user_tenants (memberships)
  └── users (profiles)
  └── vehicles
  └── routes
  └── vehicle_slots
  └── booking_holds
  └── bookings
  └── passengers
  └── payments
  └── payment_events
  └── invoices
  └── webhook_deliveries
  └── messages
  └── audit_logs
  └── booking_status_changes
```

---

## 3. CORE TABLES

### 3.1 tenants

```sql
CREATE TABLE tenants (
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
CREATE INDEX idx_tenants_slug ON tenants(slug);
```

### 3.2 users (profile extension)

```sql
CREATE TABLE users (
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
CREATE INDEX idx_users_email ON users(email);
```

**Correction from V1:** Removed `tenant_id` and `role` from `users`. These now live in `user_tenants`.

### 3.3 user_tenants (memberships)

```sql
CREATE TABLE user_tenants (
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
CREATE INDEX idx_user_tenants_tenant ON user_tenants(tenant_id);
CREATE INDEX idx_user_tenants_user ON user_tenants(user_id);
CREATE INDEX idx_user_tenants_role ON user_tenants(tenant_id, role) WHERE status = 'active';
```

### 3.4 vehicles

```sql
CREATE TABLE vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('van', 'sedan', 'suv', 'bus', 'motorcycle')),
  plate text,
  capacity int NOT NULL DEFAULT 4 CHECK (capacity > 0),
  color text,
  photo_url text,
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'maintenance', 'inactive')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_vehicles_tenant ON vehicles(tenant_id);
```

### 3.5 routes

```sql
CREATE TABLE routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  origin_coords point,
  destination_coords point,
  distance_km decimal(10,2),
  duration_min int CHECK (duration_min > 0),
  base_price decimal(10,2) NOT NULL CHECK (base_price >= 0),
  is_active boolean NOT NULL DEFAULT true,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_routes_tenant ON routes(tenant_id);
```

### 3.6 vehicle_slots

```sql
CREATE TABLE vehicle_slots (
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

-- Constraints
ALTER TABLE vehicle_slots ADD CONSTRAINT chk_remaining_calc
  CHECK (remaining_seats = total_capacity - held_seats - reserved_seats);

ALTER TABLE vehicle_slots ADD CONSTRAINT chk_slot_capacity_bounds
  CHECK (held_seats + reserved_seats <= total_capacity);

-- Overlap prevention using exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE vehicle_slots
  ADD CONSTRAINT exclude_vehicle_slot_overlap
  EXCLUDE USING gist (
    vehicle_id WITH =,
    tstzrange(slot_start, slot_end) WITH &&
  )
  WHERE (status IN ('held', 'reserved'));

-- Indexes
CREATE INDEX idx_vehicle_slots_tenant ON vehicle_slots(tenant_id);
CREATE INDEX idx_vehicle_slots_vehicle_start ON vehicle_slots(vehicle_id, slot_start);
```

### 3.7 booking_holds

```sql
CREATE TABLE booking_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  vehicle_slot_id uuid REFERENCES vehicle_slots(id) ON DELETE RESTRICT,
  seat_count int NOT NULL DEFAULT 1 CHECK (seat_count > 0),
  hold_start timestamptz NOT NULL,
  hold_end timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'expired', 'converted')),
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_holds_tenant ON booking_holds(tenant_id);
CREATE INDEX idx_booking_holds_booking ON booking_holds(booking_id);
CREATE INDEX idx_booking_holds_expires ON booking_holds(expires_at) WHERE status = 'active';
```

### 3.8 bookings

```sql
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id),
  route_id uuid REFERENCES routes(id),
  vehicle_id uuid REFERENCES vehicles(id),
  vehicle_slot_id uuid REFERENCES vehicle_slots(id) ON DELETE RESTRICT,
  driver_id uuid REFERENCES users(id),
  booking_type text NOT NULL DEFAULT 'transfer' CHECK (booking_type IN ('transfer', 'experience', 'itinerary')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'hold_created', 'payment_pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'refunded')),
  scheduled_at timestamptz NOT NULL,
  scheduled_end_at timestamptz NOT NULL CHECK (scheduled_end_at > scheduled_at),
  pickup_location text,
  dropoff_location text,
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

-- Indexes
CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_tenant_scheduled ON bookings(tenant_id, scheduled_at);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_vehicle_time ON bookings(vehicle_id, scheduled_at, scheduled_end_at);
CREATE INDEX idx_bookings_vehicle_slot ON bookings(vehicle_slot_id);
CREATE INDEX idx_bookings_idempotency ON bookings(idempotency_key);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

**Corrections from V1:**
- Added `scheduled_end_at` (mandatory for overlap checks).
- Added `lock_version`.
- Added `idempotency_key`.
- Added `deleted_at`.
- Removed `payment_status` (source of truth is `payments` table).
- Expanded `status` to full state machine including `hold_created`, `payment_pending`, `no_show`.

### 3.9 passengers

```sql
CREATE TABLE passengers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  document text,
  age_group text NOT NULL DEFAULT 'adult' CHECK (age_group IN ('adult', 'child', 'infant')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_passengers_booking ON passengers(booking_id);
ALTER TABLE passengers ENABLE ROW LEVEL SECURITY;
```

### 3.10 payments

```sql
CREATE TABLE payments (
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

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE UNIQUE INDEX idx_payments_idempotency ON payments(idempotency_key);
CREATE INDEX idx_payments_provider_payment ON payments(provider, provider_payment_id);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
```

**Corrections from V1:**
- Added `idempotency_key` with unique index.
- Added `preference_id`.
- Added `lock_version`.
- Added `deleted_at`.
- Added `method = 'manual'`.
- No `payment_status` duplication with bookings.

### 3.11 payment_events

```sql
CREATE TABLE payment_events (
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

CREATE INDEX idx_payment_events_payment ON payment_events(payment_id);
CREATE INDEX idx_payment_events_tenant ON payment_events(tenant_id, created_at);

ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
```

**Rule:** Append-only. No UPDATE or DELETE policies.

### 3.12 webhook_deliveries

```sql
CREATE TABLE webhook_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  event_id text NOT NULL,
  payload_signature text,
  payload_hash text NOT NULL,
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'validated', 'processed', 'failed', 'ignored')),
  processed_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_webhook_deliveries_event ON webhook_deliveries(provider, event_id);
CREATE INDEX idx_webhook_deliveries_status ON webhook_deliveries(status, created_at);

ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Webhook idempotency pattern:
-- INSERT INTO webhook_deliveries (...) VALUES (...)
-- ON CONFLICT (provider, event_id) DO NOTHING
-- RETURNING id;
-- If 0 rows returned, webhook is a duplicate.
```

### 3.13 invoices

```sql
CREATE TABLE invoices (
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

CREATE INDEX idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX idx_invoices_booking ON invoices(booking_id);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
```

### 3.14 messages

```sql
CREATE TABLE messages (
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

CREATE INDEX idx_messages_tenant_created ON messages(tenant_id, created_at);
CREATE INDEX idx_messages_booking ON messages(booking_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
```

### 3.15 audit_logs

```sql
CREATE TABLE audit_logs (
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

CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_tenant_table ON audit_logs(tenant_id, table_name, created_at);
CREATE INDEX idx_audit_logs_correlation ON audit_logs(correlation_id);

-- Append-only: no UPDATE/DELETE policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
```

### 3.16 booking_status_changes

```sql
CREATE TABLE booking_status_changes (
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

CREATE INDEX idx_status_changes_booking ON booking_status_changes(booking_id);
CREATE INDEX idx_status_changes_created ON booking_status_changes(created_at);
```

---

## 4. RLS STRATEGY

### Base Patterns

**Membership Check (used in most policies):**
```sql
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
```

**Example Policies for bookings:**
```sql
-- Guest can read own bookings
CREATE POLICY bookings_guest_select ON bookings
  FOR SELECT USING (
    user_id = auth.uid()
    AND is_tenant_member(tenant_id)
  );

-- Admin/operator can read all tenant bookings
CREATE POLICY bookings_admin_select ON bookings
  FOR SELECT USING (
    is_tenant_member(tenant_id, ARRAY['admin', 'operator'])
  );

-- Driver can read assigned bookings
CREATE POLICY bookings_driver_select ON bookings
  FOR SELECT USING (
    driver_id = auth.uid()
    AND is_tenant_member(tenant_id, ARRAY['driver'])
  );

-- Guest can create bookings
CREATE POLICY bookings_guest_insert ON bookings
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    AND is_tenant_member(tenant_id)
  );

-- Admin/operator can modify bookings
CREATE POLICY bookings_admin_modify ON bookings
  FOR ALL USING (
    is_tenant_member(tenant_id, ARRAY['admin', 'operator'])
  );
```

### user_tenants Policies

```sql
-- Users can see their own memberships
CREATE POLICY user_tenants_self ON user_tenants
  FOR SELECT USING (user_id = auth.uid());

-- Admins can see memberships in their tenant
CREATE POLICY user_tenants_admin ON user_tenants
  FOR SELECT USING (
    is_tenant_member(tenant_id, ARRAY['admin'])
  );
```

### Append-Only Tables

`payment_events`, `booking_status_changes`, `audit_logs`:

**Write policy:** These tables are append-only and must be written exclusively by trusted server-side contexts (Edge Functions using `service_role` internally, or SECURITY DEFINER functions). They must NOT be writable directly by authenticated frontend clients.

```sql
-- No INSERT policies for authenticated users
-- SELECT only for audit access
CREATE POLICY append_only_select ON payment_events
  FOR SELECT USING (is_tenant_member(tenant_id));

-- No UPDATE or DELETE policies exist on append-only tables
```

**Trusted execution context:** Writes to append-only ledgers must originate from:
- Edge Functions after validating business logic
- SECURITY DEFINER database triggers
- Never from frontend Supabase clients

---

## 5. TRIGGERS & FUNCTIONS

### updated_at trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

Apply to all tables with `updated_at`.

### booking status change trigger

```sql
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

CREATE TRIGGER trg_booking_status_change
  AFTER UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION log_booking_status_change();
```

### soft delete helper

```sql
CREATE OR REPLACE FUNCTION soft_delete(table_name text, record_id uuid)
RETURNS void AS $$
BEGIN
  EXECUTE format('UPDATE %I SET deleted_at = now() WHERE id = %L', table_name, record_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. INDEXES SUMMARY

| Table | Index | Purpose |
|-------|-------|---------|
| tenants | slug | Lookup by subdomain |
| user_tenants | tenant_id | List tenant members |
| user_tenants | user_id | List user memberships |
| user_tenants | tenant_id + role (partial) | Role queries |
| vehicles | tenant_id | Tenant isolation query |
| routes | tenant_id | Catalog queries |
| vehicle_slots | vehicle_id + slot_start | Agenda queries |
| vehicle_slots | EXCLUDE USING gist on `vehicle_id` + `tstzrange(slot_start, slot_end)` | Overlap prevention |
| booking_holds | booking_id | Hold lookup |
| booking_holds | expires_at (partial) | Reaper query |
| bookings | tenant_id + scheduled_at | Agenda + report queries |
| bookings | vehicle_id + scheduled_at + scheduled_end_at | Overlap detection |
| bookings | vehicle_slot_id | Booking-to-slot pool lookup |
| bookings | idempotency_key | Duplicate prevention |
| passengers | booking_id | Passenger list |
| payments | booking_id | Payment lookup |
| payments | idempotency_key | Duplicate prevention |
| payments | provider + provider_payment_id | Reconciliation |
| payment_events | payment_id | Event history |
| payment_events | tenant_id + created_at | Audit queries |
| webhook_deliveries | provider + event_id | Duplicate detection |
| invoices | tenant_id | Financial queries |
| messages | tenant_id + created_at | Chat history |
| audit_logs | tenant_id + table_name + created_at | Audit queries |
| audit_logs | correlation_id | Trace queries |
| booking_status_changes | booking_id | Status history |

---

## 7. MIGRATION NOTES FROM V1 TO V2

### Breaking Changes

1. **users.tenant_id and users.role removed**
   - Migration must migrate existing data to `user_tenants`.
   - Script: `INSERT INTO user_tenants SELECT id, tenant_id, role, 'active' FROM users WHERE tenant_id IS NOT NULL;`

2. **bookings.payment_status removed**
   - Migration must drop column.
   - Views or queries referencing it must be updated.

3. **bookings.scheduled_end_at added**
   - Migration must backfill from `routes.duration_min` where `route_id` is not null.
   - For custom pickups, default to `scheduled_at + interval '1 hour'` and allow admin correction.

4. **New tables: user_tenants, vehicle_slots, booking_holds, payment_events, webhook_deliveries, booking_status_changes**
   - Create tables.
   - Populate `vehicle_slots` from existing bookings (one-time backfill).

### Non-Breaking Additions

- `deleted_at` on all operational tables.
- `lock_version` on concurrent tables.
- `idempotency_key` on bookings and payments.
- `correlation_id` on audit_logs and status_changes.

### RLS Policy Migration

- All existing policies must be rewritten to use `is_tenant_member()` instead of `auth.jwt() ->> 'role'`.
- Test queries must validate zero tenant leakage after migration.

---

## 8. DATA INTEGRITY CONSTRAINTS

| Constraint | Location | Purpose |
|------------|----------|---------|
| `capacity > 0` | vehicles | Valid vehicle capacity |
| `duration_min > 0` | routes | Valid route duration |
| `base_price >= 0` | routes | Valid pricing |
| `slot_end > slot_start` | vehicle_slots | Valid time range |
| `remaining_seats = total_capacity - held_seats - reserved_seats` | vehicle_slots | Consistent math |
| `held_seats + reserved_seats <= total_capacity` | vehicle_slots | Capacity bound |
| `scheduled_end_at > scheduled_at` | bookings | Valid booking window |
| `seat_count > 0` | bookings | At least one seat |
| `total_amount >= 0` | bookings | Non-negative amount |
| `amount > 0` | payments | Positive payment |
| `tax_amount >= 0` | invoices | Non-negative tax |
| `total_amount >= 0` | invoices | Non-negative total |

---

## 9. SEED DATA STRATEGY

### Tenant Provisioning

```sql
INSERT INTO tenants (slug, name, status, plan)
VALUES ('dom-pietro', 'Dom Pietro Experience', 'active', 'pro');
```

### Admin Membership

```sql
-- After auth.users creation
INSERT INTO users (id, email, full_name, status)
VALUES ('<admin-auth-uuid>', 'admin@dompietro.com', 'Platform Admin', 'active');

INSERT INTO user_tenants (user_id, tenant_id, role, status)
SELECT u.id, t.id, 'admin', 'active'
FROM users u, tenants t
WHERE u.email = 'admin@dompietro.com' AND t.slug = 'dom-pietro';
```

---

## 10. VALIDATION CHECKLIST

- [ ] All tables have `tenant_id` or appropriate FK
- [ ] All tenant-scoped tables have RLS enabled
- [ ] No policy uses `auth.jwt() ->> 'role'`
- [ ] `user_tenants` has composite PK `(user_id, tenant_id)`
- [ ] `vehicle_slots` has overlap-prevention index
- [ ] `bookings` has `scheduled_end_at`
- [ ] `payments` has unique `idempotency_key`
- [ ] `payment_events` has no UPDATE/DELETE policies
- [ ] `webhook_deliveries` has unique `(provider, event_id)`
- [ ] All operational tables have `deleted_at`
- [ ] Concurrent tables have `lock_version`
- [ ] All FKs specify `ON DELETE` behavior
- [ ] All CHECK constraints enforce business invariants
