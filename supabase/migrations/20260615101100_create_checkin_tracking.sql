-- Migration: create_checkin_tracking
-- Extends passengers table with checkin fields + creates checkin_timeline

DO $ext$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='passengers' AND column_name='checkin_status') THEN
    ALTER TABLE passengers ADD COLUMN checkin_status text NOT NULL DEFAULT 'pending'
      CHECK (checkin_status IN ('pending', 'confirmed', 'boarded', 'in_transit', 'completed', 'absent', 'cancelled'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='passengers' AND column_name='checked_in_at') THEN
    ALTER TABLE passengers ADD COLUMN checked_in_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='passengers' AND column_name='boarded_at') THEN
    ALTER TABLE passengers ADD COLUMN boarded_at timestamptz;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='passengers' AND column_name='seat') THEN
    ALTER TABLE passengers ADD COLUMN seat text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='passengers' AND column_name='special_needs') THEN
    ALTER TABLE passengers ADD COLUMN special_needs text;
  END IF;
END $ext$;

CREATE TABLE IF NOT EXISTS checkin_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  event text NOT NULL,
  label text NOT NULL,
  description text,
  icon text NOT NULL DEFAULT 'ri-time-line',
  color text NOT NULL DEFAULT 'stone' CHECK (color IN ('teal', 'navy', 'amber', 'red', 'stone')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_checkin_timeline_booking ON checkin_timeline(booking_id);
ALTER TABLE checkin_timeline ENABLE ROW LEVEL SECURITY;

DO $pol$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkin_timeline_select' AND tablename = 'checkin_timeline') THEN
    CREATE POLICY checkin_timeline_select ON checkin_timeline FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'checkin_timeline_insert' AND tablename = 'checkin_timeline') THEN
    CREATE POLICY checkin_timeline_insert ON checkin_timeline FOR INSERT WITH CHECK (is_tenant_member(tenant_id, ARRAY['admin', 'operator', 'driver']));
  END IF;
END $pol$;
