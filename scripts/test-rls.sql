-- ============================================================
-- RLS RUNTIME VALIDATION SCRIPT
-- Dom Pietro Experience Connect — V2 Architecture
-- ============================================================
-- Prerequisites:
--   - Schema V2 applied
--   - Run as a non-superuser to test RLS enforcement
-- ============================================================

-- Make auth.uid() session-configurable for testing
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.test_auth_uid', true), '')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ LANGUAGE sql STABLE;

-- Test results collector
DROP TABLE IF EXISTS test_results;
CREATE TABLE test_results (
  id serial PRIMARY KEY,
  test_name text NOT NULL,
  expected text NOT NULL,
  actual text NOT NULL,
  passed boolean NOT NULL,
  run_at timestamptz DEFAULT now()
);

-- Helper to record a test result
CREATE OR REPLACE FUNCTION record_test(p_name text, p_expected text, p_actual text)
RETURNS void AS $$
BEGIN
  INSERT INTO test_results (test_name, expected, actual, passed)
  VALUES (p_name, p_expected, p_actual, p_expected = p_actual);
END;
$$ LANGUAGE plpgsql;

-- Create a non-superuser test role and grant basic access
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'test_user') THEN
    CREATE ROLE test_user LOGIN;
  END IF;
END $$;

GRANT USAGE ON SCHEMA public, auth TO test_user;
GRANT ALL ON ALL TABLES IN SCHEMA public TO test_user;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO test_user;
GRANT ALL ON ALL TABLES IN SCHEMA auth TO test_user;

-- ============================================================
-- TEST DATA SETUP (run as superuser, bypasses RLS)
-- ============================================================

-- Tenants
INSERT INTO tenants (id, slug, name) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'tenant-a', 'Tenant A'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'tenant-b', 'Tenant B');

-- Auth users
INSERT INTO auth.users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'admin-a@example.com'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'guest-a@example.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'admin-b@example.com'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'orphan@example.com');

-- Profiles
INSERT INTO users (id, email) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'admin-a@example.com'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'guest-a@example.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'admin-b@example.com'),
  ('cccccccc-cccc-cccc-cccc-ccccccccccc0', 'orphan@example.com');

-- Memberships
INSERT INTO user_tenants (user_id, tenant_id, role, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'admin', 'active'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'guest', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'admin', 'active');

-- Vehicles and slots per tenant
INSERT INTO vehicles (id, tenant_id, name, type, capacity) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'Van A1', 'van', 10),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'Van B1', 'van', 10);

INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, remaining_seats) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa6', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
   '2025-06-01 08:00:00+00', '2025-06-01 10:00:00+00', 10, 10),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb6', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
   '2025-06-01 08:00:00+00', '2025-06-01 10:00:00+00', 10, 10);

-- Bookings per tenant
INSERT INTO bookings (id, tenant_id, user_id, vehicle_id, status, scheduled_at, scheduled_end_at, passenger_count, total_amount) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
   'draft', '2025-06-01 08:00:00+00', '2025-06-01 10:00:00+00', 2, 100.00),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb5',
   'draft', '2025-06-01 08:00:00+00', '2025-06-01 10:00:00+00', 3, 150.00);

-- Payments for bookings (needed for payment_events FK)
INSERT INTO payments (id, tenant_id, booking_id, user_id, amount, idempotency_key) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', 100.00, 'pay-a1'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb8', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', 150.00, 'pay-b1');

-- New domain tables per tenant
INSERT INTO served_lodgings (id, tenant_id, name, contact_person, phone, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'Pousada A', 'Contato A', '+5549988011111', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbc1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'Pousada B', 'Contato B', '+5549988022222', 'active');

INSERT INTO drivers (id, tenant_id, name, phone, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaad1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'Motorista A', '+5549988012345', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbd1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'Motorista B', '+5549988012346', 'active');

INSERT INTO route_categories (id, tenant_id, name, slug, description, sort_order, is_active) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaae1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'Categoria A', 'categoria-a', 'Desc A', 1, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbe1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'Categoria B', 'categoria-b', 'Desc B', 1, true);

INSERT INTO partners (id, tenant_id, partner_type, name, status) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaf1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'restaurant', 'Parceiro A', 'active'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbf1', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0', 'restaurant', 'Parceiro B', 'active');

-- ============================================================
-- RLS TESTS (run as test_user to enforce policies)
-- ============================================================

-- Helper: switch to test_user context
CREATE OR REPLACE FUNCTION run_as_test_user(p_auth_uid text, p_sql text)
RETURNS text AS $$
DECLARE
  v_result text;
BEGIN
  PERFORM set_config('app.test_auth_uid', p_auth_uid, false);
  EXECUTE format('SET ROLE test_user; %s', p_sql);
  RESET ROLE;
  RETURN 'done';
EXCEPTION WHEN OTHERS THEN
  RESET ROLE;
  RETURN SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- T1: Admin-A cannot see Tenant-B bookings
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;
SELECT record_test('T1: Admin-A cannot see Tenant-B bookings', '0',
  (SELECT count(*)::text FROM bookings WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0'));
RESET ROLE;

-- T1b: Admin-A cannot see Tenant-B vehicle_slots
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;
SELECT record_test('T1b: Admin-A cannot see Tenant-B vehicle_slots', '0',
  (SELECT count(*)::text FROM vehicle_slots WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0'));
RESET ROLE;

-- T2: Guest-A cannot see Tenant-B bookings
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', false);
SET ROLE test_user;
SELECT record_test('T2: Guest-A cannot see Tenant-B bookings', '0',
  (SELECT count(*)::text FROM bookings WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0'));
RESET ROLE;

-- T3: Guest-A can see OWN bookings in Tenant-A
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', false);
SET ROLE test_user;
SELECT record_test('T3: Guest-A can see own booking in Tenant-A', '1',
  (SELECT count(*)::text FROM bookings WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0'));
RESET ROLE;

-- T4: Guest cannot see OTHER user's bookings in same tenant
INSERT INTO auth.users (id, email) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'guest-a2@example.com');
INSERT INTO users (id, email) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'guest-a2@example.com');
INSERT INTO user_tenants (user_id, tenant_id, role, status) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'guest', 'active');
INSERT INTO bookings (id, tenant_id, user_id, vehicle_id, status, scheduled_at, scheduled_end_at, passenger_count, total_amount) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
   'draft', '2025-06-02 08:00:00+00', '2025-06-02 10:00:00+00', 1, 50.00);

SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', false);
SET ROLE test_user;
SELECT record_test('T4: Guest-A cannot see Guest-A2 booking (not owner)', '1',
  (SELECT count(*)::text FROM bookings WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0'));
RESET ROLE;

-- T5: Admin can see ALL bookings in tenant
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;
SELECT record_test('T5: Admin-A can see all bookings in Tenant-A', '2',
  (SELECT count(*)::text FROM bookings WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0'));
RESET ROLE;

-- T6: Orphan user sees nothing
SELECT set_config('app.test_auth_uid', 'cccccccc-cccc-cccc-cccc-ccccccccccc0', false);
SET ROLE test_user;
SELECT record_test('T6: Orphan user sees no bookings', '0',
  (SELECT count(*)::text FROM bookings));
SELECT record_test('T6b: Orphan user sees no tenants', '0',
  (SELECT count(*)::text FROM tenants));
SELECT record_test('T6c: Orphan user sees no vehicles', '0',
  (SELECT count(*)::text FROM vehicles));
RESET ROLE;

-- T7: Append-only tables — frontend user cannot INSERT
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;

DO $t7$
BEGIN
  BEGIN
    INSERT INTO payment_events (payment_id, tenant_id, booking_id, event_type, processed_by)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa8', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0',
            'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'created', 'test');
    PERFORM record_test('T7: Admin cannot INSERT into payment_events', 'blocked', 'allowed');
  EXCEPTION WHEN insufficient_privilege THEN
    PERFORM record_test('T7: Admin cannot INSERT into payment_events', 'blocked', 'blocked');
  END;
END $t7$;

DO $t7b$
BEGIN
  BEGIN
    INSERT INTO booking_status_changes (booking_id, tenant_id, previous_status, new_status)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'draft', 'confirmed');
    PERFORM record_test('T7b: Admin cannot INSERT into booking_status_changes', 'blocked', 'allowed');
  EXCEPTION WHEN insufficient_privilege THEN
    PERFORM record_test('T7b: Admin cannot INSERT into booking_status_changes', 'blocked', 'blocked');
  END;
END $t7b$;

DO $t7c$
BEGIN
  BEGIN
    INSERT INTO audit_logs (tenant_id, table_name, action)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'bookings', 'INSERT');
    PERFORM record_test('T7c: Admin cannot INSERT into audit_logs', 'blocked', 'allowed');
  EXCEPTION WHEN insufficient_privilege THEN
    PERFORM record_test('T7c: Admin cannot INSERT into audit_logs', 'blocked', 'blocked');
  END;
END $t7c$;

RESET ROLE;

-- T8: Soft delete visibility — admin can still see deleted record
UPDATE bookings SET deleted_at = now() WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9';
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;
SELECT record_test('T8: Admin can see soft-deleted booking', '1',
  (SELECT count(*)::text FROM bookings WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9'));
RESET ROLE;

-- T9: Guest cannot modify other user's booking
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', false);
SET ROLE test_user;

DO $t9$
DECLARE
  v_count int;
BEGIN
  UPDATE bookings SET passenger_count = 99 WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN
    PERFORM record_test('T9: Guest-A cannot modify Guest-A2 booking', 'blocked', 'blocked');
  ELSE
    PERFORM record_test('T9: Guest-A cannot modify Guest-A2 booking', 'blocked', 'allowed');
  END IF;
END $t9$;

RESET ROLE;

-- T10: Admin CAN modify any booking in tenant
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;

DO $t10$
BEGIN
  BEGIN
    UPDATE bookings SET passenger_count = 5 WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa7';
    PERFORM record_test('T10: Admin-A can modify any booking in tenant', 'allowed', 'allowed');
  EXCEPTION WHEN insufficient_privilege THEN
    PERFORM record_test('T10: Admin-A can modify any booking in tenant', 'allowed', 'blocked');
  END;
END $t10$;

RESET ROLE;

-- T11: Cross-tenant modification blocked
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;

DO $t11$
DECLARE
  v_count int;
BEGIN
  UPDATE bookings SET passenger_count = 5 WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb7';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN
    PERFORM record_test('T11: Admin-A cannot modify Tenant-B booking', 'blocked', 'blocked');
  ELSE
    PERFORM record_test('T11: Admin-A cannot modify Tenant-B booking', 'blocked', 'allowed');
  END IF;
END $t11$;

RESET ROLE;

-- T12: vehicle_slots overlap constraint (EXCLUDE)
-- Note: run as superuser to bypass RLS for constraint test
INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, remaining_seats, status)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
        '2025-06-01 08:30:00+00', '2025-06-01 09:30:00+00', 10, 10, 'held');

DO $t12$
BEGIN
  BEGIN
    INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, remaining_seats, status)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab1', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
            '2025-06-01 09:00:00+00', '2025-06-01 10:30:00+00', 10, 10, 'held');
    PERFORM record_test('T12: EXCLUDE constraint blocks overlapping held slots', 'blocked', 'allowed');
  EXCEPTION WHEN exclusion_violation THEN
    PERFORM record_test('T12: EXCLUDE constraint blocks overlapping held slots', 'blocked', 'blocked');
  END;
END $t12$;

DO $t12b$
BEGIN
  BEGIN
    INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, remaining_seats, status)
    VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab2', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa5',
            '2025-06-01 09:00:00+00', '2025-06-01 10:30:00+00', 10, 10, 'available');
    PERFORM record_test('T12b: EXCLUDE allows overlapping available slots', 'allowed', 'allowed');
  EXCEPTION WHEN exclusion_violation THEN
    PERFORM record_test('T12b: EXCLUDE allows overlapping available slots', 'allowed', 'blocked');
  END;
END $t12b$;

-- ============================================================
-- NEW DOMAIN TABLES RLS TESTS
-- ============================================================

-- T13-T16: Tenant isolation — Admin-A cannot see Tenant-B domain rows
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;
SELECT record_test('T13: Admin-A cannot see Tenant-B served_lodgings', '0',
  (SELECT count(*)::text FROM served_lodgings WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0'));
SELECT record_test('T14: Admin-A cannot see Tenant-B drivers', '0',
  (SELECT count(*)::text FROM drivers WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0'));
SELECT record_test('T15: Admin-A cannot see Tenant-B partners', '0',
  (SELECT count(*)::text FROM partners WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0'));
SELECT record_test('T16: Admin-A cannot see Tenant-B route_categories', '0',
  (SELECT count(*)::text FROM route_categories WHERE tenant_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb0'));
RESET ROLE;

-- T17-T20: Authenticated member access — Guest-A can see Tenant-A domain rows
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', false);
SET ROLE test_user;
SELECT record_test('T17: Guest-A can see Tenant-A served_lodgings', '1',
  (SELECT count(*)::text FROM served_lodgings WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0'));
SELECT record_test('T18: Guest-A can see Tenant-A drivers', '1',
  (SELECT count(*)::text FROM drivers WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0'));
SELECT record_test('T19: Guest-A can see Tenant-A partners', '1',
  (SELECT count(*)::text FROM partners WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0'));
SELECT record_test('T20: Guest-A can see Tenant-A route_categories', '1',
  (SELECT count(*)::text FROM route_categories WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0'));
RESET ROLE;

-- T21-T24: Orphan user sees nothing
SELECT set_config('app.test_auth_uid', 'cccccccc-cccc-cccc-cccc-ccccccccccc0', false);
SET ROLE test_user;
SELECT record_test('T21: Orphan user sees no served_lodgings', '0',
  (SELECT count(*)::text FROM served_lodgings));
SELECT record_test('T22: Orphan user sees no drivers', '0',
  (SELECT count(*)::text FROM drivers));
SELECT record_test('T23: Orphan user sees no partners', '0',
  (SELECT count(*)::text FROM partners));
SELECT record_test('T24: Orphan user sees no route_categories', '0',
  (SELECT count(*)::text FROM route_categories));
RESET ROLE;

-- T25-T28: Role-based modification — admin CAN modify, guest CANNOT
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;

DO $t25$
DECLARE v_count int;
BEGIN
  UPDATE served_lodgings SET contact_person = 'Admin Updated' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN PERFORM record_test('T25: Admin-A can modify served_lodgings', 'allowed', 'allowed');
  ELSE PERFORM record_test('T25: Admin-A can modify served_lodgings', 'allowed', 'blocked'); END IF;
END $t25$;

DO $t26$
DECLARE v_count int;
BEGIN
  UPDATE drivers SET name = 'Admin Updated' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaad1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN PERFORM record_test('T26: Admin-A can modify drivers', 'allowed', 'allowed');
  ELSE PERFORM record_test('T26: Admin-A can modify drivers', 'allowed', 'blocked'); END IF;
END $t26$;

DO $t27$
DECLARE v_count int;
BEGIN
  UPDATE partners SET name = 'Admin Updated' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaf1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN PERFORM record_test('T27: Admin-A can modify partners', 'allowed', 'allowed');
  ELSE PERFORM record_test('T27: Admin-A can modify partners', 'allowed', 'blocked'); END IF;
END $t27$;

DO $t28$
DECLARE v_count int;
BEGIN
  UPDATE route_categories SET name = 'Admin Updated' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaae1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count > 0 THEN PERFORM record_test('T28: Admin-A can modify route_categories', 'allowed', 'allowed');
  ELSE PERFORM record_test('T28: Admin-A can modify route_categories', 'allowed', 'blocked'); END IF;
END $t28$;

RESET ROLE;

-- T29-T32: Guest modification blocked
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', false);
SET ROLE test_user;

DO $t29$
DECLARE v_count int;
BEGIN
  UPDATE served_lodgings SET contact_person = 'Guest Updated' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaac1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN PERFORM record_test('T29: Guest-A cannot modify served_lodgings', 'blocked', 'blocked');
  ELSE PERFORM record_test('T29: Guest-A cannot modify served_lodgings', 'blocked', 'allowed'); END IF;
END $t29$;

DO $t30$
DECLARE v_count int;
BEGIN
  UPDATE drivers SET name = 'Guest Updated' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaad1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN PERFORM record_test('T30: Guest-A cannot modify drivers', 'blocked', 'blocked');
  ELSE PERFORM record_test('T30: Guest-A cannot modify drivers', 'blocked', 'allowed'); END IF;
END $t30$;

DO $t31$
DECLARE v_count int;
BEGIN
  UPDATE partners SET name = 'Guest Updated' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaf1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN PERFORM record_test('T31: Guest-A cannot modify partners', 'blocked', 'blocked');
  ELSE PERFORM record_test('T31: Guest-A cannot modify partners', 'blocked', 'allowed'); END IF;
END $t31$;

DO $t32$
DECLARE v_count int;
BEGIN
  UPDATE route_categories SET name = 'Guest Updated' WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaae1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN PERFORM record_test('T32: Guest-A cannot modify route_categories', 'blocked', 'blocked');
  ELSE PERFORM record_test('T32: Guest-A cannot modify route_categories', 'blocked', 'allowed'); END IF;
END $t32$;

RESET ROLE;

-- T33: Cross-tenant modification blocked (admin tries to modify Tenant-B domain row)
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;

DO $t33$
DECLARE v_count int;
BEGIN
  UPDATE drivers SET name = 'Cross-Tenant' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbd1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN PERFORM record_test('T33: Admin-A cannot modify Tenant-B drivers', 'blocked', 'blocked');
  ELSE PERFORM record_test('T33: Admin-A cannot modify Tenant-B drivers', 'blocked', 'allowed'); END IF;
END $t33$;

DO $t34$
DECLARE v_count int;
BEGIN
  UPDATE partners SET name = 'Cross-Tenant' WHERE id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbf1';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  IF v_count = 0 THEN PERFORM record_test('T34: Admin-A cannot modify Tenant-B partners', 'blocked', 'blocked');
  ELSE PERFORM record_test('T34: Admin-A cannot modify Tenant-B partners', 'blocked', 'allowed'); END IF;
END $t34$;

RESET ROLE;

-- Add payment for Guest-A2 to test payment isolation
INSERT INTO payments (id, tenant_id, booking_id, user_id, amount, idempotency_key) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaab0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa9', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', 50.00, 'pay-a2');

-- T35-T38: Users table RLS hardening
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', false);
SET ROLE test_user;
SELECT record_test('T35: Guest-A can see own user profile', '1',
  (SELECT count(*)::text FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'));
SELECT record_test('T36: Guest-A cannot see Guest-A2 profile', '0',
  (SELECT count(*)::text FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'));
RESET ROLE;

SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;
SELECT record_test('T37: Admin-A can see Guest-A profile', '1',
  (SELECT count(*)::text FROM users WHERE id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'));
RESET ROLE;

SELECT set_config('app.test_auth_uid', 'cccccccc-cccc-cccc-cccc-ccccccccccc0', false);
SET ROLE test_user;
-- Orphan can see their own profile (self access) but no one else's
SELECT record_test('T38: Orphan can see own profile only', '1',
  (SELECT count(*)::text FROM users WHERE id = 'cccccccc-cccc-cccc-cccc-ccccccccccc0'));
SELECT record_test('T38b: Orphan cannot see other user profiles', '0',
  (SELECT count(*)::text FROM users WHERE id != 'cccccccc-cccc-cccc-cccc-ccccccccccc0'));
RESET ROLE;

-- T39-T42: Payments table RLS hardening
SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', false);
SET ROLE test_user;
SELECT record_test('T39: Guest-A can see own payments', '1',
  (SELECT count(*)::text FROM payments WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2'));
SELECT record_test('T40: Guest-A cannot see Guest-A2 payments', '0',
  (SELECT count(*)::text FROM payments WHERE user_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3'));
RESET ROLE;

SELECT set_config('app.test_auth_uid', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', false);
SET ROLE test_user;
SELECT record_test('T41: Admin-A can see all payments in tenant', '2',
  (SELECT count(*)::text FROM payments WHERE tenant_id = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa0'));
RESET ROLE;

SELECT set_config('app.test_auth_uid', 'cccccccc-cccc-cccc-cccc-ccccccccccc0', false);
SET ROLE test_user;
SELECT record_test('T42: Orphan cannot see any payments', '0',
  (SELECT count(*)::text FROM payments));
RESET ROLE;

-- ============================================================
-- REPORT
-- ============================================================
SELECT test_name, expected, actual, passed
FROM test_results
ORDER BY id;

SELECT COUNT(*) FILTER (WHERE passed) AS passed,
       COUNT(*) FILTER (WHERE NOT passed) AS failed,
       COUNT(*) AS total
FROM test_results;
