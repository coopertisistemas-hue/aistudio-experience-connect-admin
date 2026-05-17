-- ============================================================
-- CONCURRENCY TEST SETUP
-- ============================================================

-- Configurable auth.uid()
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.test_auth_uid', true), '')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ LANGUAGE sql STABLE;

-- Results table
DROP TABLE IF EXISTS test_concurrency_results;
CREATE TABLE test_concurrency_results (
  id serial PRIMARY KEY,
  worker_id int NOT NULL,
  idempotency_key text NOT NULL,
  result text NOT NULL, -- 'success', 'capacity_error', 'other_error', 'timeout'
  booking_id uuid,
  hold_id uuid,
  error_message text,
  run_at timestamptz DEFAULT now()
);

-- Test tenant
INSERT INTO tenants (id, slug, name) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc1', 'concurrency-tenant', 'Concurrency Tenant');

-- Test user
INSERT INTO auth.users (id, email) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'concurrency-test@example.com');
INSERT INTO users (id, email) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'concurrency-test@example.com');
INSERT INTO user_tenants (user_id, tenant_id, role, status) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc2', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', 'admin', 'active');

-- Test vehicle
INSERT INTO vehicles (id, tenant_id, name, type, capacity) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc3', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', 'Test Van', 'van', 10);

-- Test slot with 10 capacity
INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, remaining_seats) VALUES
  ('cccccccc-cccc-cccc-cccc-ccccccccccc4', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', 'cccccccc-cccc-cccc-cccc-ccccccccccc3',
   '2025-07-01 08:00:00+00', '2025-07-01 10:00:00+00', 10, 10);
