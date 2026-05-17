-- ============================================================
-- WEBHOOK HARDENING TEST SCRIPT
-- Dom Pietro Experience Connect — V2 Architecture
-- ============================================================

DROP TABLE IF EXISTS test_webhook_results;
CREATE TABLE test_webhook_results (
  id serial PRIMARY KEY,
  test_name text NOT NULL,
  expected text NOT NULL,
  actual text NOT NULL,
  passed boolean NOT NULL,
  run_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION record_webhook_test(p_name text, p_expected text, p_actual text)
RETURNS void AS $$
BEGIN
  INSERT INTO test_webhook_results (test_name, expected, actual, passed)
  VALUES (p_name, p_expected, p_actual, p_expected = p_actual);
END;
$$ LANGUAGE plpgsql;

-- Setup data
INSERT INTO tenants (id, slug, name) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'webhook-tenant', 'Webhook Tenant');

INSERT INTO auth.users (id, email) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'webhook-test@example.com');
INSERT INTO users (id, email) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'webhook-test@example.com');
INSERT INTO user_tenants (user_id, tenant_id, role, status) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'admin', 'active');

INSERT INTO vehicles (id, tenant_id, name, type, capacity) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'Webhook Van', 'van', 10);

INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, remaining_seats) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
   '2025-08-01 08:00:00+00', '2025-08-01 10:00:00+00', 10, 10);

-- Create booking and hold manually (avoiding create_booking_hold dependency for test isolation)
INSERT INTO bookings (id, tenant_id, user_id, vehicle_id, status, scheduled_at, scheduled_end_at, passenger_count, total_amount) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
   'hold_created', '2025-08-01 08:00:00+00', '2025-08-01 10:00:00+00', 2, 100.00);

INSERT INTO booking_holds (id, tenant_id, booking_id, vehicle_id, vehicle_slot_id, passenger_count, seat_count, hold_start, hold_end, expires_at, status, idempotency_key) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee6', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee3',
   'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4', 2, 2, '2025-08-01 08:00:00+00', '2025-08-01 10:00:00+00', '2025-08-01 12:00:00+00', 'active', 'webhook-hold-1');

-- Update slot to reflect hold
UPDATE vehicle_slots SET held_seats = 2, remaining_seats = 8, status = 'held' WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4';

-- Create pending payment
INSERT INTO payments (id, tenant_id, booking_id, user_id, amount, status, idempotency_key) VALUES
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee7', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', 100.00, 'pending', 'webhook-pay-1');

-- Set auth context for webhook processing (process_mp_webhook is SECURITY DEFINER)
SELECT set_config('app.test_auth_uid', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee2', false);

-- Force recompilation of the auth/authorization chain to pick up session-based auth.uid()
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

CREATE OR REPLACE FUNCTION confirm_booking_from_payment(
  p_tenant_id uuid,
  p_booking_id uuid,
  p_payment_id uuid,
  p_idempotency_key text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_payment payments%ROWTYPE;
  v_hold booking_holds%ROWTYPE;
BEGIN
  IF NOT is_tenant_member(p_tenant_id, ARRAY['admin', 'operator']) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  IF EXISTS (
    SELECT 1 FROM booking_status_changes
    WHERE booking_id = p_booking_id
      AND new_status = 'confirmed'
      AND correlation_id = p_idempotency_key
  ) THEN
    RETURN true;
  END IF;

  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  SELECT * INTO v_payment
  FROM payments
  WHERE id = p_payment_id AND tenant_id = p_tenant_id;

  IF NOT FOUND OR v_payment.status != 'completed' THEN
    RAISE EXCEPTION 'Payment not completed';
  END IF;

  SELECT * INTO v_hold
  FROM booking_holds
  WHERE booking_id = p_booking_id AND status = 'active'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active hold found';
  END IF;

  UPDATE vehicle_slots
  SET held_seats = held_seats - v_hold.passenger_count,
      reserved_seats = reserved_seats + v_hold.passenger_count,
      remaining_seats = total_capacity - (reserved_seats + v_hold.passenger_count) - (held_seats - v_hold.passenger_count),
      status = 'reserved',
      lock_version = lock_version + 1
  WHERE id = v_hold.vehicle_slot_id;

  UPDATE booking_holds
  SET status = 'converted'
  WHERE id = v_hold.id;

  UPDATE bookings
  SET status = 'confirmed',
      lock_version = lock_version + 1
  WHERE id = p_booking_id;

  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION process_mp_webhook(
  p_provider text,
  p_event_id text,
  p_payload_hash text,
  p_payment_id uuid,
  p_tenant_id uuid,
  p_booking_id uuid,
  p_event_type text,
  p_provider_event_id text,
  p_payload jsonb,
  p_correlation_id text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_delivery_id uuid;
BEGIN
  INSERT INTO webhook_deliveries (provider, event_id, payload_hash, status)
  VALUES (p_provider, p_event_id, p_payload_hash, 'received')
  ON CONFLICT (provider, event_id) DO NOTHING
  RETURNING id INTO v_delivery_id;

  IF v_delivery_id IS NULL THEN
    RETURN true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM payments WHERE id = p_payment_id AND tenant_id = p_tenant_id
  ) THEN
    UPDATE webhook_deliveries
    SET status = 'failed', error_message = 'Payment not found'
    WHERE id = v_delivery_id;
    RETURN false;
  END IF;

  INSERT INTO payment_events (
    payment_id, tenant_id, booking_id, event_type,
    provider_event_id, payload, processed_by, correlation_id
  ) VALUES (
    p_payment_id, p_tenant_id, p_booking_id, p_event_type,
    p_provider_event_id, p_payload, 'webhook', p_correlation_id
  );

  UPDATE payments
  SET status = CASE p_event_type
    WHEN 'confirmed' THEN 'completed'
    WHEN 'failed' THEN 'failed'
    WHEN 'refunded' THEN 'refunded'
    ELSE status
  END,
  paid_at = CASE WHEN p_event_type = 'confirmed' THEN now() ELSE paid_at END,
  lock_version = lock_version + 1
  WHERE id = p_payment_id;

  IF p_event_type = 'confirmed' THEN
    PERFORM confirm_booking_from_payment(
      p_tenant_id, p_booking_id, p_payment_id, p_correlation_id
    );
  END IF;

  UPDATE webhook_deliveries
  SET status = 'processed', processed_at = now()
  WHERE id = v_delivery_id;

  RETURN true;
END;
$$;

-- ============================================================
-- TEST W1: Duplicate event_id → idempotent no-op
-- ============================================================
DO $$
DECLARE
  v_result boolean;
BEGIN
  -- First delivery
  SELECT process_mp_webhook(
    'mercado_pago', 'evt-dupe-001', 'hash-abc',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee7',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
    'confirmed', 'mp-evt-1', '{}', 'corr-1'
  ) INTO v_result;

  -- Second delivery (same event_id)
  SELECT process_mp_webhook(
    'mercado_pago', 'evt-dupe-001', 'hash-abc',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee7',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
    'confirmed', 'mp-evt-1', '{}', 'corr-2'
  ) INTO v_result;

  PERFORM record_webhook_test('W1: Duplicate event_id is idempotent', '1-1',
    (SELECT COUNT(*)::text FROM webhook_deliveries WHERE event_id = 'evt-dupe-001')
    || '-' ||
    (SELECT COUNT(*)::text FROM payment_events WHERE provider_event_id = 'mp-evt-1')
  );
END $$;

-- ============================================================
-- TEST W2: Payment not found → should record delivery but fail processing
-- ============================================================
DO $$
DECLARE
  v_result boolean;
BEGIN
  SELECT process_mp_webhook(
    'mercado_pago', 'evt-missing-001', 'hash-xyz',
    '00000000-0000-0000-0000-000000000000',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    '00000000-0000-0000-0000-000000000000',
    'confirmed', 'mp-evt-missing', '{}', 'corr-3'
  ) INTO v_result;

  PERFORM record_webhook_test('W2: Invalid payment results in failed webhook status', 'failed',
    COALESCE((SELECT status FROM webhook_deliveries WHERE event_id = 'evt-missing-001'), 'null')
  );
END $$;

-- ============================================================
-- TEST W3: Different event_ids with same payload processed separately
-- ============================================================
DO $$
DECLARE
  v_result boolean;
BEGIN
  SELECT process_mp_webhook(
    'mercado_pago', 'evt-separate-001', 'hash-def',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee7',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
    'confirmed', 'mp-evt-sep-1', '{}', 'corr-4'
  ) INTO v_result;

  SELECT process_mp_webhook(
    'mercado_pago', 'evt-separate-002', 'hash-def',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee7',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee1',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5',
    'confirmed', 'mp-evt-sep-2', '{}', 'corr-5'
  ) INTO v_result;

  PERFORM record_webhook_test('W3: Different event_ids processed separately', '2',
    (SELECT COUNT(*)::text FROM webhook_deliveries WHERE event_id LIKE 'evt-separate-%')
  );
END $$;

-- ============================================================
-- TEST W4: Booking confirmed after successful webhook
-- ============================================================
DO $$
BEGIN
  PERFORM record_webhook_test('W4: Booking status confirmed after webhook', 'confirmed',
    COALESCE((SELECT status FROM bookings WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee5'), 'null')
  );
END $$;

-- ============================================================
-- TEST W5: Payment status updated after webhook
-- ============================================================
DO $$
BEGIN
  PERFORM record_webhook_test('W5: Payment status completed after webhook', 'completed',
    COALESCE((SELECT status FROM payments WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee7'), 'null')
  );
END $$;

-- ============================================================
-- TEST W6: Slot converted from held to reserved after confirmation
-- ============================================================
DO $$
BEGIN
  PERFORM record_webhook_test('W6: Slot status reserved after confirmation', 'reserved',
    COALESCE((SELECT status FROM vehicle_slots WHERE id = 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeee4'), 'null')
  );
END $$;

-- ============================================================
-- REPORT
-- ============================================================
SELECT test_name, expected, actual, passed
FROM test_webhook_results
ORDER BY id;

SELECT COUNT(*) FILTER (WHERE passed) AS passed,
       COUNT(*) FILTER (WHERE NOT passed) AS failed,
       COUNT(*) AS total
FROM test_webhook_results;
