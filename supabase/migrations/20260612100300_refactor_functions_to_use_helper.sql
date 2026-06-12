-- Migration: Refactor RPCs to use release_slot_capacity helper
-- Replaces inline seat-release UPDATEs with PERFORM release_slot_capacity(...)
-- Idempotent via CREATE OR REPLACE FUNCTION

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
      PERFORM release_slot_capacity(v_hold.vehicle_slot_id, v_hold.passenger_count, true);
    ELSE
      PERFORM release_slot_capacity(v_hold.vehicle_slot_id, v_hold.passenger_count, false);
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
  PERFORM release_slot_capacity(v_hold.vehicle_slot_id, v_hold.passenger_count, true);

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
      PERFORM release_slot_capacity(v_hold.vehicle_slot_id, v_hold.passenger_count, true);
    ELSE
      PERFORM release_slot_capacity(v_hold.vehicle_slot_id, v_hold.passenger_count, false);
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
