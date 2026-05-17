-- Migration: V2 Core Functions
-- Dom Pietro Experience Connect
-- Security definer RPCs for transactional orchestration

-- ============================================
-- SECURITY HELPERS
-- ============================================

CREATE OR REPLACE FUNCTION has_tenant_role(p_tenant_id uuid, p_role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_tenants ut
    WHERE ut.user_id = auth.uid()
      AND ut.tenant_id = p_tenant_id
      AND ut.status = 'active'
      AND ut.role = p_role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- CREATE BOOKING HOLD
-- ============================================
CREATE OR REPLACE FUNCTION create_booking_hold(
  p_tenant_id uuid,
  p_user_id uuid,
  p_vehicle_slot_id uuid,
  p_passenger_count int,
  p_scheduled_at timestamptz,
  p_scheduled_end_at timestamptz,
  p_pickup_location text,
  p_dropoff_location text,
  p_idempotency_key text
)
RETURNS TABLE (booking_id uuid, hold_id uuid, expires_at timestamptz)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_slot vehicle_slots%ROWTYPE;
  v_booking_id uuid;
  v_hold_id uuid;
  v_expires_at timestamptz;
BEGIN
  -- Validate membership
  IF NOT is_tenant_member(p_tenant_id) THEN
    RAISE EXCEPTION 'Unauthorized tenant access';
  END IF;

  -- Idempotency check
  SELECT bh.booking_id INTO v_booking_id
  FROM booking_holds bh
  WHERE bh.idempotency_key = p_idempotency_key
    AND bh.tenant_id = p_tenant_id
  LIMIT 1;

  IF v_booking_id IS NOT NULL THEN
    SELECT bh.id, bh.expires_at INTO v_hold_id, v_expires_at
    FROM booking_holds bh
    WHERE bh.idempotency_key = p_idempotency_key;
    RETURN QUERY SELECT v_booking_id, v_hold_id, v_expires_at;
    RETURN;
  END IF;

  -- Lock slot and validate capacity
  SELECT * INTO v_slot
  FROM vehicle_slots
  WHERE id = p_vehicle_slot_id
    AND tenant_id = p_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Vehicle slot not found';
  END IF;

  IF v_slot.remaining_seats < p_passenger_count THEN
    RAISE EXCEPTION 'Insufficient capacity: remaining %, requested %', v_slot.remaining_seats, p_passenger_count;
  END IF;

  -- Create booking in draft -> hold_created
  INSERT INTO bookings (
    tenant_id, user_id, vehicle_id, vehicle_slot_id, status,
    scheduled_at, scheduled_end_at,
    pickup_location, dropoff_location,
    passenger_count, seat_count, idempotency_key
  ) VALUES (
    p_tenant_id, p_user_id, v_slot.vehicle_id, v_slot.id, 'hold_created',
    p_scheduled_at, p_scheduled_end_at,
    p_pickup_location, p_dropoff_location,
    p_passenger_count, p_passenger_count, p_idempotency_key
  )
  RETURNING id INTO v_booking_id;

  -- Create hold
  v_expires_at := now() + interval '15 minutes';

  INSERT INTO booking_holds (
    tenant_id, booking_id, vehicle_id, vehicle_slot_id,
    passenger_count, seat_count, hold_start, hold_end, expires_at,
    status, idempotency_key
  ) VALUES (
    p_tenant_id, v_booking_id, v_slot.vehicle_id, v_slot.id,
    p_passenger_count, p_passenger_count, p_scheduled_at, p_scheduled_end_at, v_expires_at,
    'active', p_idempotency_key
  )
  RETURNING id INTO v_hold_id;

  -- Update slot: increment held_seats, decrement remaining
  UPDATE vehicle_slots
  SET held_seats = held_seats + p_passenger_count,
      remaining_seats = total_capacity - reserved_seats - (held_seats + p_passenger_count),
      status = CASE WHEN total_capacity - reserved_seats - (held_seats + p_passenger_count) = 0 THEN 'held' ELSE 'held' END,
      lock_version = lock_version + 1
  WHERE id = p_vehicle_slot_id
    AND remaining_seats >= p_passenger_count;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Slot capacity changed during transaction';
  END IF;

  -- Audit log
  INSERT INTO audit_logs (
    tenant_id, user_id, table_name, record_id, action, new_data, reason, correlation_id
  ) VALUES (
    p_tenant_id, p_user_id, 'bookings', v_booking_id, 'INSERT',
    jsonb_build_object('status', 'hold_created', 'slot_id', p_vehicle_slot_id),
    'create_booking_hold', current_setting('app.correlation_id', true)
  );

  RETURN QUERY SELECT v_booking_id, v_hold_id, v_expires_at;
END;
$$;

-- ============================================
-- CONFIRM BOOKING FROM PAYMENT
-- ============================================
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

  -- Idempotency
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

  -- Move seats from held to reserved
  UPDATE vehicle_slots
  SET held_seats = held_seats - v_hold.passenger_count,
      reserved_seats = reserved_seats + v_hold.passenger_count,
      remaining_seats = total_capacity - (reserved_seats + v_hold.passenger_count) - (held_seats - v_hold.passenger_count),
      status = 'reserved',
      lock_version = lock_version + 1
  WHERE id = v_hold.vehicle_slot_id;

  -- Update hold
  UPDATE booking_holds
  SET status = 'converted'
  WHERE id = v_hold.id;

  -- Confirm booking
  UPDATE bookings
  SET status = 'confirmed',
      lock_version = lock_version + 1
  WHERE id = p_booking_id;

  RETURN true;
END;
$$;

-- ============================================
-- CANCEL BOOKING
-- ============================================
CREATE OR REPLACE FUNCTION cancel_booking(
  p_tenant_id uuid,
  p_booking_id uuid,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_hold booking_holds%ROWTYPE;
BEGIN
  IF NOT is_tenant_member(p_tenant_id, ARRAY['admin', 'operator']) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  SELECT * INTO v_hold
  FROM booking_holds
  WHERE booking_id = p_booking_id AND status IN ('active', 'converted')
  FOR UPDATE;

  IF FOUND THEN
    -- Release seats
    IF v_hold.status = 'active' THEN
      UPDATE vehicle_slots
      SET held_seats = held_seats - v_hold.passenger_count,
          remaining_seats = total_capacity - reserved_seats - (held_seats - v_hold.passenger_count),
          status = CASE WHEN reserved_seats > 0 THEN 'reserved' ELSE 'available' END,
          lock_version = lock_version + 1
      WHERE id = v_hold.vehicle_slot_id;
    ELSE
      UPDATE vehicle_slots
      SET reserved_seats = reserved_seats - v_hold.passenger_count,
          remaining_seats = total_capacity - (reserved_seats - v_hold.passenger_count) - held_seats,
          status = CASE WHEN held_seats > 0 THEN 'held' ELSE 'available' END,
          lock_version = lock_version + 1
      WHERE id = v_hold.vehicle_slot_id;
    END IF;

    UPDATE booking_holds
    SET status = 'released'
    WHERE id = v_hold.id;
  END IF;

  UPDATE bookings
  SET status = 'cancelled',
      lock_version = lock_version + 1
  WHERE id = p_booking_id;

  RETURN true;
END;
$$;

-- ============================================
-- EXPIRE BOOKING HOLD (reaper)
-- ============================================
CREATE OR REPLACE FUNCTION expire_booking_hold(
  p_hold_id uuid,
  p_admin_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_hold booking_holds%ROWTYPE;
BEGIN
  SELECT * INTO v_hold
  FROM booking_holds
  WHERE id = p_hold_id AND status = 'active' AND expires_at < now()
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- OPERATIONAL BOUNDARY: if called with admin_id, validate admin/operator role
  IF p_admin_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM user_tenants
      WHERE user_id = p_admin_id
        AND tenant_id = v_hold.tenant_id
        AND role IN ('admin', 'operator')
        AND status = 'active'
    ) THEN
      RAISE EXCEPTION 'Unauthorized';
    END IF;
  END IF;
  -- If p_admin_id IS NULL, assume trusted internal/service_role execution

  -- Release held seats
  UPDATE vehicle_slots
  SET held_seats = held_seats - v_hold.passenger_count,
      remaining_seats = total_capacity - reserved_seats - (held_seats - v_hold.passenger_count),
      status = CASE WHEN reserved_seats > 0 THEN 'reserved' ELSE 'available' END,
      lock_version = lock_version + 1
  WHERE id = v_hold.vehicle_slot_id;

  -- Expire hold
  UPDATE booking_holds
  SET status = 'expired'
  WHERE id = p_hold_id;

  -- Cancel associated booking if still in hold_created or payment_pending
  UPDATE bookings
  SET status = 'cancelled',
      lock_version = lock_version + 1
  WHERE id = v_hold.booking_id
    AND status IN ('hold_created', 'payment_pending');

  RETURN true;
END;
$$;

-- ============================================
-- RESCHEDULE BOOKING
-- ============================================
CREATE OR REPLACE FUNCTION reschedule_booking(
  p_tenant_id uuid,
  p_booking_id uuid,
  p_new_vehicle_slot_id uuid,
  p_new_scheduled_at timestamptz,
  p_new_scheduled_end_at timestamptz,
  p_reason text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking bookings%ROWTYPE;
  v_old_slot vehicle_slots%ROWTYPE;
  v_new_slot vehicle_slots%ROWTYPE;
  v_hold booking_holds%ROWTYPE;
BEGIN
  IF NOT is_tenant_member(p_tenant_id, ARRAY['admin', 'operator']) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT * INTO v_booking
  FROM bookings
  WHERE id = p_booking_id AND tenant_id = p_tenant_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found';
  END IF;

  IF v_booking.status NOT IN ('confirmed', 'hold_created', 'payment_pending') THEN
    RAISE EXCEPTION 'Booking cannot be rescheduled from status %', v_booking.status;
  END IF;

  -- Lock and validate new slot
  SELECT * INTO v_new_slot
  FROM vehicle_slots
  WHERE id = p_new_vehicle_slot_id
    AND tenant_id = p_tenant_id
    AND deleted_at IS NULL
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'New vehicle slot not found';
  END IF;

  IF v_new_slot.remaining_seats < v_booking.seat_count THEN
    RAISE EXCEPTION 'Insufficient capacity on new slot: remaining %, needed %', v_new_slot.remaining_seats, v_booking.seat_count;
  END IF;

  -- Get active hold
  SELECT * INTO v_hold
  FROM booking_holds
  WHERE booking_id = p_booking_id AND status IN ('active', 'converted')
  FOR UPDATE;

  -- Release old slot capacity
  IF FOUND AND v_hold.vehicle_slot_id IS NOT NULL THEN
    SELECT * INTO v_old_slot
    FROM vehicle_slots
    WHERE id = v_hold.vehicle_slot_id
    FOR UPDATE;

    IF v_hold.status = 'active' THEN
      UPDATE vehicle_slots
      SET held_seats = held_seats - v_hold.passenger_count,
          remaining_seats = total_capacity - reserved_seats - (held_seats - v_hold.passenger_count),
          status = CASE WHEN reserved_seats > 0 THEN 'reserved' ELSE 'available' END,
          lock_version = lock_version + 1
      WHERE id = v_hold.vehicle_slot_id;
    ELSE
      UPDATE vehicle_slots
      SET reserved_seats = reserved_seats - v_hold.passenger_count,
          remaining_seats = total_capacity - (reserved_seats - v_hold.passenger_count) - held_seats,
          status = CASE WHEN held_seats > 0 THEN 'held' ELSE 'available' END,
          lock_version = lock_version + 1
      WHERE id = v_hold.vehicle_slot_id;
    END IF;
  END IF;

  -- Update booking
  UPDATE bookings
  SET vehicle_id = v_new_slot.vehicle_id,
      vehicle_slot_id = v_new_slot.id,
      scheduled_at = p_new_scheduled_at,
      scheduled_end_at = p_new_scheduled_end_at,
      lock_version = lock_version + 1
  WHERE id = p_booking_id;

  -- Update hold to new slot
  IF FOUND THEN
    UPDATE booking_holds
    SET vehicle_id = v_new_slot.vehicle_id,
        vehicle_slot_id = v_new_slot.id,
        hold_start = p_new_scheduled_at,
        hold_end = p_new_scheduled_end_at
    WHERE id = v_hold.id;

    -- If hold was converted, re-reserve on new slot
    IF v_hold.status = 'converted' THEN
      UPDATE vehicle_slots
      SET reserved_seats = reserved_seats + v_hold.passenger_count,
          remaining_seats = total_capacity - (reserved_seats + v_hold.passenger_count) - held_seats,
          status = 'reserved',
          lock_version = lock_version + 1
      WHERE id = v_new_slot.id;
    ELSE
      UPDATE vehicle_slots
      SET held_seats = held_seats + v_hold.passenger_count,
          remaining_seats = total_capacity - reserved_seats - (held_seats + v_hold.passenger_count),
          status = 'held',
          lock_version = lock_version + 1
      WHERE id = v_new_slot.id;
    END IF;
  END IF;

  -- Audit log
  INSERT INTO audit_logs (
    tenant_id, user_id, table_name, record_id, action, new_data, reason, correlation_id
  ) VALUES (
    p_tenant_id, auth.uid(), 'bookings', p_booking_id, 'UPDATE',
    jsonb_build_object('old_slot_id', v_hold.vehicle_slot_id, 'new_slot_id', v_new_slot.id),
    COALESCE(p_reason, 'reschedule_booking'), current_setting('app.correlation_id', true)
  );

  RETURN true;
END;
$$;

-- ============================================
-- PROCESS MP WEBHOOK
-- ============================================
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
  -- Atomic insert with conflict detection
  INSERT INTO webhook_deliveries (provider, event_id, payload_hash, status)
  VALUES (p_provider, p_event_id, p_payload_hash, 'received')
  ON CONFLICT (provider, event_id) DO NOTHING
  RETURNING id INTO v_delivery_id;

  IF v_delivery_id IS NULL THEN
    -- Duplicate webhook
    RETURN true;
  END IF;

  -- Validate payment exists
  IF NOT EXISTS (
    SELECT 1 FROM payments WHERE id = p_payment_id AND tenant_id = p_tenant_id
  ) THEN
    UPDATE webhook_deliveries
    SET status = 'failed', error_message = 'Payment not found'
    WHERE id = v_delivery_id;
    RETURN false;
  END IF;

  -- Record payment event
  INSERT INTO payment_events (
    payment_id, tenant_id, booking_id, event_type,
    provider_event_id, payload, processed_by, correlation_id
  ) VALUES (
    p_payment_id, p_tenant_id, p_booking_id, p_event_type,
    p_provider_event_id, p_payload, 'webhook', p_correlation_id
  );

  -- Update payment status
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

  -- Confirm booking if payment completed
  IF p_event_type = 'confirmed' THEN
    PERFORM confirm_booking_from_payment(
      p_tenant_id, p_booking_id, p_payment_id, p_correlation_id
    );
  END IF;

  -- Mark processed
  UPDATE webhook_deliveries
  SET status = 'processed', processed_at = now()
  WHERE id = v_delivery_id;

  RETURN true;
END;
$$;

-- ============================================
-- RECORD PAYMENT EVENT (lightweight wrapper)
-- ============================================
CREATE OR REPLACE FUNCTION record_payment_event(
  p_payment_id uuid,
  p_tenant_id uuid,
  p_booking_id uuid,
  p_event_type text,
  p_provider_event_id text,
  p_payload jsonb,
  p_processed_by text,
  p_correlation_id text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_event_id uuid;
BEGIN
  INSERT INTO payment_events (
    payment_id, tenant_id, booking_id, event_type,
    provider_event_id, payload, processed_by, correlation_id
  ) VALUES (
    p_payment_id, p_tenant_id, p_booking_id, p_event_type,
    p_provider_event_id, p_payload, p_processed_by, p_correlation_id
  )
  RETURNING id INTO v_event_id;

  RETURN v_event_id;
END;
$$;

-- ============================================
-- RECORD MANUAL PAYMENT
-- ============================================
CREATE OR REPLACE FUNCTION record_manual_payment(
  p_tenant_id uuid,
  p_booking_id uuid,
  p_admin_id uuid,
  p_amount decimal,
  p_reason text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_payment_id uuid;
  v_idempotency_key text;
BEGIN
  IF NOT is_tenant_member(p_tenant_id, ARRAY['admin', 'operator']) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  v_idempotency_key := 'manual-' || p_booking_id::text || '-' || extract(epoch from now())::text;

  INSERT INTO payments (
    tenant_id, booking_id, user_id, provider,
    amount, status, method, idempotency_key,
    manual_override_reason, manual_override_by, manual_override_at
  ) VALUES (
    p_tenant_id, p_booking_id, p_admin_id, 'manual',
    p_amount, 'completed', 'manual', v_idempotency_key,
    p_reason, p_admin_id, now()
  )
  RETURNING id INTO v_payment_id;

  INSERT INTO payment_events (
    payment_id, tenant_id, booking_id, event_type,
    processed_by, correlation_id
  ) VALUES (
    v_payment_id, p_tenant_id, p_booking_id, 'manual_override',
    'rpc', current_setting('app.correlation_id', true)
  );

  PERFORM confirm_booking_from_payment(
    p_tenant_id, p_booking_id, v_payment_id, v_idempotency_key
  );

  RETURN v_payment_id;
END;
$$;
