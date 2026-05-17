-- ============================================================
-- CONCURRENCY SCENARIO 2: Hold + Confirm + Expire
-- ============================================================

-- Setup: create a hold that is about to expire
DO $$
DECLARE
  v_result record;
BEGIN
  PERFORM set_config('app.test_auth_uid', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', false);

  SELECT * INTO v_result
  FROM create_booking_hold(
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    'cccccccc-cccc-cccc-cccc-ccccccccccc2',
    'cccccccc-cccc-cccc-cccc-ccccccccccc4',
    3,
    '2025-07-01 08:00:00+00',
    '2025-07-01 10:00:00+00',
    'Test Pickup',
    'Test Dropoff',
    'scenario2-hold-1'
  );

  -- Artificially set expires_at to now() so the reaper can catch it
  UPDATE booking_holds SET expires_at = now() WHERE id = v_result.hold_id;
END $$;

-- Worker A: try to confirm booking from payment
DO $$
DECLARE
  v_booking_id uuid;
  v_payment_id uuid;
BEGIN
  PERFORM set_config('app.test_auth_uid', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', false);

  SELECT booking_id INTO v_booking_id
  FROM booking_holds WHERE idempotency_key = 'scenario2-hold-1';

  -- Create a completed payment
  INSERT INTO payments (id, tenant_id, booking_id, user_id, amount, status, idempotency_key)
  VALUES ('dddddddd-dddd-dddd-dddd-ddddddddddd1', 'cccccccc-cccc-cccc-cccc-ccccccccccc1', v_booking_id, 'cccccccc-cccc-cccc-cccc-ccccccccccc2', 100.00, 'completed', 'scenario2-payment-1');

  -- Try to confirm
  PERFORM confirm_booking_from_payment(
    'cccccccc-cccc-cccc-cccc-ccccccccccc1',
    v_booking_id,
    'dddddddd-dddd-dddd-dddd-ddddddddddd1',
    'scenario2-confirm-1'
  );
END $$;
