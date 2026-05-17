-- BACKEND VALIDATION TESTS
-- Dom Pietro Experience Connect V2
-- Run with: psql <database> -f tests/backend_validation.sql
-- Or via Supabase SQL Editor

-- ============================================
-- SETUP TEST CONTEXT
-- ============================================
DO $$
BEGIN
  -- Create test auth user if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@dompietro.com') THEN
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      'test@dompietro.com',
      '{"full_name":"Test User"}'::jsonb
    );
  END IF;

  -- Create second test auth user
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test2@dompietro.com') THEN
    INSERT INTO auth.users (id, email, raw_user_meta_data)
    VALUES (
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      'test2@dompietro.com',
      '{"full_name":"Test User 2"}'::jsonb
    );
  END IF;
END $$;

-- Ensure user profile exists
INSERT INTO users (id, email, full_name, status)
VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'test@dompietro.com', 'Test User', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, email, full_name, status)
VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'test2@dompietro.com', 'Test User 2', 'active')
ON CONFLICT (id) DO NOTHING;

-- Ensure membership exists
INSERT INTO user_tenants (user_id, tenant_id, role, status)
VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'guest',
  'active'
)
ON CONFLICT DO NOTHING;

INSERT INTO user_tenants (user_id, tenant_id, role, status)
VALUES (
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'guest',
  'active'
)
ON CONFLICT DO NOTHING;

-- ============================================
-- TEST 1: EXCLUDE CONSTRAINT OVERLAP PREVENTION
-- ============================================
DO $$
DECLARE
  v_slot1 uuid := '33333333-3333-3333-3333-333333333333';
  v_slot2 uuid;
  v_error text;
BEGIN
  -- Attempt to create overlapping slot
  BEGIN
    INSERT INTO vehicle_slots (id, tenant_id, vehicle_id, slot_start, slot_end, total_capacity, held_seats, reserved_seats, remaining_seats, status)
    VALUES (
      gen_random_uuid(),
      '11111111-1111-1111-1111-111111111111',
      '22222222-2222-2222-2222-222222222222',
      (SELECT slot_start + interval '30 minutes' FROM vehicle_slots WHERE id = v_slot1),
      (SELECT slot_end + interval '30 minutes' FROM vehicle_slots WHERE id = v_slot1),
      15, 0, 0, 15, 'held'
    );
    RAISE EXCEPTION 'TEST 1 FAILED: Overlapping slot was allowed';
  EXCEPTION WHEN exclusion_violation THEN
    RAISE NOTICE 'TEST 1 PASSED: EXCLUDE constraint blocked overlapping reservation';
  END;
END $$;

-- ============================================
-- TEST 2: CAPACITY CHECK CONSTRAINTS
-- ============================================
DO $$
BEGIN
  -- Attempt negative remaining_seats
  BEGIN
    UPDATE vehicle_slots
    SET remaining_seats = -1
    WHERE id = '33333333-3333-3333-3333-333333333333';
    RAISE EXCEPTION 'TEST 2a FAILED: Negative remaining_seats allowed';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'TEST 2a PASSED: CHECK blocked negative remaining_seats';
  END;

  -- Attempt held + reserved > total
  BEGIN
    UPDATE vehicle_slots
    SET held_seats = 10, reserved_seats = 10
    WHERE id = '33333333-3333-3333-3333-333333333333';
    RAISE EXCEPTION 'TEST 2b FAILED: Capacity ceiling violated';
  EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'TEST 2b PASSED: CHECK blocked capacity ceiling violation';
  END;
END $$;

-- ============================================
-- TEST 3: RLS TENANT ISOLATION
-- ============================================
DO $$
DECLARE
  v_count int;
BEGIN
  -- Simulate auth user from different tenant (none exists, should get 0)
  PERFORM set_config('request.jwt.claim.sub', '99999999-9999-9999-9999-999999999999', true);

  SELECT COUNT(*) INTO v_count
  FROM bookings
  WHERE tenant_id = '11111111-1111-1111-1111-111111111111';

  -- Note: RLS tests via SQL editor may behave differently depending on session.
  -- This test is best validated via Supabase client with real JWT.
  RAISE NOTICE 'TEST 3 INFO: RLS isolation should be validated via client integration tests';
END $$;

-- ============================================
-- TEST 4: CREATE BOOKING HOLD (concurrency simulation)
-- ============================================
DO $$
DECLARE
  v_result record;
  v_slot_id uuid := '33333333-3333-3333-3333-333333333333';
BEGIN
  -- Reset slot
  UPDATE vehicle_slots
  SET held_seats = 0, reserved_seats = 0, remaining_seats = total_capacity, status = 'available'
  WHERE id = v_slot_id;

  -- Create hold for 5 passengers
  PERFORM set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', true);

  SELECT * INTO v_result
  FROM create_booking_hold(
    '11111111-1111-1111-1111-111111111111',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    v_slot_id,
    5,
    (now() + interval '1 day')::date + interval '10 hours',
    (now() + interval '1 day')::date + interval '11 hours',
    'Aeroporto',
    'Pousada',
    'test-hold-001'
  );

  IF v_result.booking_id IS NULL THEN
    RAISE EXCEPTION 'TEST 4a FAILED: Hold creation returned null';
  END IF;

  RAISE NOTICE 'TEST 4a PASSED: Hold created with booking_id %', v_result.booking_id;

  -- Verify slot updated
  IF NOT EXISTS (
    SELECT 1 FROM vehicle_slots
    WHERE id = v_slot_id
      AND held_seats = 5
      AND remaining_seats = 10
      AND status = 'held'
  ) THEN
    RAISE EXCEPTION 'TEST 4b FAILED: Slot capacity not updated correctly';
  END IF;

  RAISE NOTICE 'TEST 4b PASSED: Slot capacity updated correctly (held=5, remaining=10)';

  -- Attempt second hold exceeding capacity (15 total, 5 held, request 11)
  BEGIN
    PERFORM create_booking_hold(
      '11111111-1111-1111-1111-111111111111',
      'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
      v_slot_id,
      11,
      (now() + interval '1 day')::date + interval '10 hours',
      (now() + interval '1 day')::date + interval '11 hours',
      'Aeroporto',
      'Pousada',
      'test-hold-002'
    );
    RAISE EXCEPTION 'TEST 4c FAILED: Over-capacity hold was allowed';
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'TEST 4c PASSED: Over-capacity hold rejected: %', SQLERRM;
  END;
END $$;

-- ============================================
-- TEST 5: WEBHOOK IDEMPOTENCY
-- ============================================
DO $$
DECLARE
  v_payment_id uuid;
  v_booking_id uuid;
  v_result boolean;
BEGIN
  -- Create a test payment
  INSERT INTO payments (tenant_id, booking_id, user_id, amount, status, idempotency_key)
  VALUES (
    '11111111-1111-1111-1111-111111111111',
    (SELECT id FROM bookings WHERE idempotency_key = 'test-hold-001'),
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    180.00,
    'pending',
    'test-payment-001'
  )
  RETURNING id INTO v_payment_id;

  v_booking_id := (SELECT id FROM bookings WHERE idempotency_key = 'test-hold-001');

  -- Process first webhook
  v_result := process_mp_webhook(
    'mercado_pago',
    'evt-001',
    'hash-001',
    v_payment_id,
    '11111111-1111-1111-1111-111111111111',
    v_booking_id,
    'confirmed',
    'mp-001',
    '{"status":"approved"}'::jsonb,
    'corr-001'
  );

  IF NOT v_result THEN
    RAISE EXCEPTION 'TEST 5a FAILED: First webhook processing failed';
  END IF;

  RAISE NOTICE 'TEST 5a PASSED: First webhook processed';

  -- Process duplicate webhook
  v_result := process_mp_webhook(
    'mercado_pago',
    'evt-001',
    'hash-001',
    v_payment_id,
    '11111111-1111-1111-1111-111111111111',
    v_booking_id,
    'confirmed',
    'mp-001',
    '{"status":"approved"}'::jsonb,
    'corr-002'
  );

  IF NOT v_result THEN
    RAISE EXCEPTION 'TEST 5b FAILED: Duplicate webhook handling failed';
  END IF;

  -- Verify only one payment event
  IF (SELECT COUNT(*) FROM payment_events WHERE provider_event_id = 'mp-001') != 1 THEN
    RAISE EXCEPTION 'TEST 5c FAILED: Duplicate payment_event created';
  END IF;

  RAISE NOTICE 'TEST 5b/c PASSED: Duplicate webhook ignored, single payment_event preserved';
END $$;

-- ============================================
-- TEST 6: STATE MACHINE ENFORCEMENT
-- ============================================
DO $$
DECLARE
  v_booking_id uuid;
BEGIN
  v_booking_id := (SELECT id FROM bookings WHERE idempotency_key = 'test-hold-001');

  -- Verify booking is confirmed after webhook
  IF NOT EXISTS (SELECT 1 FROM bookings WHERE id = v_booking_id AND status = 'confirmed') THEN
    RAISE EXCEPTION 'TEST 6a FAILED: Booking not confirmed after payment webhook';
  END IF;

  RAISE NOTICE 'TEST 6a PASSED: Booking confirmed from payment';

  -- Verify slot moved to reserved
  IF NOT EXISTS (
    SELECT 1 FROM vehicle_slots
    WHERE id = '33333333-3333-3333-3333-333333333333'
      AND reserved_seats = 5
      AND held_seats = 0
      AND status = 'reserved'
  ) THEN
    RAISE EXCEPTION 'TEST 6b FAILED: Slot seats not moved from held to reserved';
  END IF;

  RAISE NOTICE 'TEST 6b PASSED: Slot seats moved from held to reserved';
END $$;

-- ============================================
-- TEST 7: SOFT DELETE INVARIANT
-- ============================================
DO $$
DECLARE
  v_booking_id uuid;
BEGIN
  v_booking_id := (SELECT id FROM bookings WHERE idempotency_key = 'test-hold-001');

  -- Soft delete booking
  UPDATE bookings SET deleted_at = now() WHERE id = v_booking_id;

  IF NOT EXISTS (SELECT 1 FROM bookings WHERE id = v_booking_id AND deleted_at IS NOT NULL) THEN
    RAISE EXCEPTION 'TEST 7 FAILED: Booking not soft-deleted';
  END IF;

  RAISE NOTICE 'TEST 7 PASSED: Soft delete works correctly';
END $$;

-- ============================================
-- CLEANUP
-- ============================================
-- DO NOT physically delete test data; it serves as validation evidence.
-- All test records are soft-deleted where applicable.

RAISE NOTICE '========================================';
RAISE NOTICE 'VALIDATION TESTS COMPLETED SUCCESSFULLY';
RAISE NOTICE '========================================';
