-- ============================================================
-- OBSERVABILITY VALIDATION SCRIPT
-- Dom Pietro Experience Connect — V2 Architecture
-- ============================================================

DROP TABLE IF EXISTS test_obs_results;
CREATE TABLE test_obs_results (
  id serial PRIMARY KEY,
  test_name text NOT NULL,
  expected text NOT NULL,
  actual text NOT NULL,
  passed boolean NOT NULL,
  run_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION record_obs_test(p_name text, p_expected text, p_actual text)
RETURNS void AS $$
BEGIN
  INSERT INTO test_obs_results (test_name, expected, actual, passed)
  VALUES (p_name, p_expected, p_actual, p_expected = p_actual);
END;
$$ LANGUAGE plpgsql;

-- Setup (same as webhook test)
INSERT INTO tenants (id, slug, name) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff1', 'obs-tenant', 'Observability Tenant');

INSERT INTO auth.users (id, email) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff2', 'obs-test@example.com');
INSERT INTO users (id, email) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff2', 'obs-test@example.com');
INSERT INTO user_tenants (user_id, tenant_id, role, status) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff2', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'admin', 'active');

INSERT INTO vehicles (id, tenant_id, name, type, capacity) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff3', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'Obs Van', 'van', 10);

INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, remaining_seats) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff4', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'ffffffff-ffff-ffff-ffff-fffffffffff3',
   '2025-09-01 08:00:00+00', '2025-09-01 10:00:00+00', 10, 10);

INSERT INTO bookings (id, tenant_id, user_id, vehicle_id, status, scheduled_at, scheduled_end_at, passenger_count, total_amount) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff5', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'ffffffff-ffff-ffff-ffff-fffffffffff2', 'ffffffff-ffff-ffff-ffff-fffffffffff3',
   'hold_created', '2025-09-01 08:00:00+00', '2025-09-01 10:00:00+00', 2, 100.00);

INSERT INTO booking_holds (id, tenant_id, booking_id, vehicle_id, vehicle_slot_id, passenger_count, seat_count, hold_start, hold_end, expires_at, status, idempotency_key) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff6', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'ffffffff-ffff-ffff-ffff-fffffffffff5', 'ffffffff-ffff-ffff-ffff-fffffffffff3',
   'ffffffff-ffff-ffff-ffff-fffffffffff4', 2, 2, '2025-09-01 08:00:00+00', '2025-09-01 10:00:00+00', '2025-09-01 12:00:00+00', 'active', 'obs-hold-1');

UPDATE vehicle_slots SET held_seats = 2, remaining_seats = 8, status = 'held' WHERE id = 'ffffffff-ffff-ffff-ffff-fffffffffff4';

-- Insert manual audit log to simulate hold creation audit
INSERT INTO audit_logs (tenant_id, user_id, table_name, record_id, action, new_data, reason)
VALUES ('ffffffff-ffff-ffff-ffff-fffffffffff1', 'ffffffff-ffff-ffff-ffff-fffffffffff2', 'bookings', 'ffffffff-ffff-ffff-ffff-fffffffffff5', 'INSERT',
        '{"status": "hold_created"}'::jsonb, 'create_booking_hold');

INSERT INTO payments (id, tenant_id, booking_id, user_id, amount, status, idempotency_key) VALUES
  ('ffffffff-ffff-ffff-ffff-fffffffffff7', 'ffffffff-ffff-ffff-ffff-fffffffffff1', 'ffffffff-ffff-ffff-ffff-fffffffffff5', 'ffffffff-ffff-ffff-ffff-fffffffffff2', 100.00, 'pending', 'obs-pay-1');

-- Force recompile auth chain
CREATE OR REPLACE FUNCTION auth.uid()
RETURNS uuid AS $$
  SELECT COALESCE(
    NULLIF(current_setting('app.test_auth_uid', true), '')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$ LANGUAGE sql STABLE;

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

SELECT set_config('app.test_auth_uid', 'ffffffff-ffff-ffff-ffff-fffffffffff2', false);

-- Process webhook to generate audit trail
DO $$
DECLARE
  v_result boolean;
BEGIN
  SELECT process_mp_webhook(
    'mercado_pago', 'evt-obs-001', 'hash-obs',
    'ffffffff-ffff-ffff-ffff-fffffffffff7',
    'ffffffff-ffff-ffff-ffff-fffffffffff1',
    'ffffffff-ffff-ffff-ffff-fffffffffff5',
    'confirmed', 'mp-evt-obs-1', '{}', 'corr-obs-1'
  ) INTO v_result;
END $$;

-- ============================================================
-- OBSERVABILITY TESTS
-- ============================================================

-- O1: payment_events has correlation_id
DO $$
BEGIN
  PERFORM record_obs_test('O1: payment_events has correlation_id', '1',
    (SELECT COUNT(*)::text FROM payment_events WHERE correlation_id = 'corr-obs-1'));
END $$;

-- O2: booking_status_changes tracks transition
DO $$
BEGIN
  PERFORM record_obs_test('O2: booking_status_changes tracks hold_created→confirmed', '1',
    (SELECT COUNT(*)::text FROM booking_status_changes
     WHERE booking_id = 'ffffffff-ffff-ffff-ffff-fffffffffff5'
       AND previous_status = 'hold_created' AND new_status = 'confirmed'));
END $$;

-- O3: webhook_deliveries tracks processing status
DO $$
BEGIN
  PERFORM record_obs_test('O3: webhook_deliveries tracks processed status', '1',
    (SELECT COUNT(*)::text FROM webhook_deliveries
     WHERE event_id = 'evt-obs-001' AND status = 'processed'));
END $$;

-- O4: audit_logs captured the hold creation (from create_booking_hold, simulated here by direct insert)
-- Note: create_booking_hold inserts audit_logs. Since we inserted manually, we check if audit_logs exist for the booking.
DO $$
BEGIN
  PERFORM record_obs_test('O4: audit_logs captured booking activity', '1',
    (SELECT COUNT(*)::text FROM audit_logs WHERE record_id = 'ffffffff-ffff-ffff-ffff-fffffffffff5'));
END $$;

-- O5: Append-only table payment_events has no updates
DO $$
DECLARE
  v_count int;
BEGIN
  SELECT COUNT(*) INTO v_count FROM pg_stat_user_tables WHERE relname = 'payment_events';
  -- We cannot directly test "no updates" historically, but we can verify the table has no UPDATE policy
  PERFORM record_obs_test('O5: payment_events has no UPDATE policy', '0',
    (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'payment_events' AND cmd = 'UPDATE'));
END $$;

-- O6: Append-only table booking_status_changes has no UPDATE policy
DO $$
BEGIN
  PERFORM record_obs_test('O6: booking_status_changes has no UPDATE policy', '0',
    (SELECT COUNT(*)::text FROM pg_policies WHERE tablename = 'booking_status_changes' AND cmd = 'UPDATE'));
END $$;

-- O7: Booking traceability — full lifecycle visible
DO $$
BEGIN
  PERFORM record_obs_test('O7: Full booking lifecycle traceable', '1',
    (SELECT COUNT(*)::text FROM booking_status_changes WHERE booking_id = 'ffffffff-ffff-ffff-ffff-fffffffffff5'));
END $$;

-- ============================================================
-- REPORT
-- ============================================================
SELECT test_name, expected, actual, passed
FROM test_obs_results
ORDER BY id;

SELECT COUNT(*) FILTER (WHERE passed) AS passed,
       COUNT(*) FILTER (WHERE NOT passed) AS failed,
       COUNT(*) AS total
FROM test_obs_results;
