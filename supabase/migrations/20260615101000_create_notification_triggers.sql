-- Migration: create_notification_triggers
-- Auto-creates in-app notifications when booking status changes to 'confirmed'
-- Forward-only + idempotent

CREATE OR REPLACE FUNCTION notify_booking_confirmed()
RETURNS TRIGGER AS $$
DECLARE
  v_route_name text;
  v_guest_name text;
  v_guest_id uuid;
  v_scheduled_at timestamptz;
BEGIN
  -- Only fire when status changes TO 'confirmed'
  IF NEW.new_status <> 'confirmed' THEN
    RETURN NEW;
  END IF;

  -- Fetch guest info from the booking
  SELECT b.user_id, b.scheduled_at INTO v_guest_id, v_scheduled_at
  FROM bookings b
  WHERE b.id = NEW.booking_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  -- Fetch route name
  SELECT COALESCE(r.name, 'Transfer') INTO v_route_name
  FROM bookings b
  LEFT JOIN routes r ON r.id = b.route_id
  WHERE b.id = NEW.booking_id;

  -- Fetch guest name
  SELECT COALESCE(u.full_name, 'Cliente') INTO v_guest_name
  FROM users u
  WHERE u.id = v_guest_id;

  -- Insert in-app notification
  INSERT INTO notifications (
    tenant_id,
    user_id,
    type,
    category,
    severity,
    title,
    message,
    booking_id,
    entity_ref,
    entity_label
  ) VALUES (
    NEW.tenant_id,
    v_guest_id,
    'booking_confirmed',
    'Reservas',
    'success',
    'Reserva confirmada',
    'Sua reserva para ' || v_route_name || ' em ' || to_char(v_scheduled_at, 'DD/MM/YYYY') || ' foi confirmada.',
    NEW.booking_id,
    NEW.booking_id::text,
    'Reserva #' || substring(NEW.booking_id::text, 1, 8)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DO $trig$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notify_booking_confirmed') THEN
    CREATE TRIGGER trg_notify_booking_confirmed
      AFTER INSERT ON booking_status_changes
      FOR EACH ROW
      EXECUTE FUNCTION notify_booking_confirmed();
  END IF;
END $trig$;
