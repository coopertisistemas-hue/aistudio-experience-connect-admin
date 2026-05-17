-- ============================================================
-- CONCURRENCY TEST WORKER
-- Run with: psql ... -v worker_id=N -f test-concurrency-worker.sql
-- ============================================================

DO $$
DECLARE
  v_worker_id int := NULLIF(current_setting('app.worker_id', true), '')::int;
  v_idempotency_key text := 'concurrency-worker-' || COALESCE(v_worker_id::text, 'unknown') || '-' || extract(epoch from clock_timestamp())::text;
  v_result record;
BEGIN
  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'app.worker_id not set';
  END IF;

  PERFORM set_config('app.test_auth_uid', 'cccccccc-cccc-cccc-cccc-ccccccccccc2', false);

  BEGIN
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
      v_idempotency_key
    );

    INSERT INTO test_concurrency_results (worker_id, idempotency_key, result, booking_id, hold_id)
    VALUES (v_worker_id, v_idempotency_key, 'success', v_result.booking_id, v_result.hold_id);
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM LIKE '%capacity%' OR SQLERRM LIKE '%Insufficient%' OR SQLERRM LIKE '%capacity changed%' THEN
        INSERT INTO test_concurrency_results (worker_id, idempotency_key, result, error_message)
        VALUES (v_worker_id, v_idempotency_key, 'capacity_error', SQLERRM);
      ELSE
        INSERT INTO test_concurrency_results (worker_id, idempotency_key, result, error_message)
        VALUES (v_worker_id, v_idempotency_key, 'other_error', SQLERRM);
      END IF;
  END;
END $$;
