-- Migration: create_trip_incidents
-- Creates trip_incidents table for driver-reported occurrences
-- Forward-only + idempotent

CREATE TABLE IF NOT EXISTS trip_incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE RESTRICT,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  description text NOT NULL,
  photo_path text,
  reported_by uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'resolved', 'dismissed')),
  resolution_notes text,
  resolved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  resolved_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE trip_incidents ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_trip_incidents_booking ON trip_incidents(booking_id);
CREATE INDEX IF NOT EXISTS idx_trip_incidents_tenant ON trip_incidents(tenant_id);

DO $trig$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_trip_incidents_updated_at') THEN
    CREATE TRIGGER trg_trip_incidents_updated_at BEFORE UPDATE ON trip_incidents
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig$;

DO $pol$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'trip_incidents_select' AND tablename = 'trip_incidents') THEN
    CREATE POLICY trip_incidents_select ON trip_incidents
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'trip_incidents_insert' AND tablename = 'trip_incidents') THEN
    CREATE POLICY trip_incidents_insert ON trip_incidents
      FOR INSERT WITH CHECK (is_tenant_member(tenant_id, ARRAY['admin', 'operator', 'driver']));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'trip_incidents_update' AND tablename = 'trip_incidents') THEN
    CREATE POLICY trip_incidents_update ON trip_incidents
      FOR UPDATE USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;
END $pol$;
