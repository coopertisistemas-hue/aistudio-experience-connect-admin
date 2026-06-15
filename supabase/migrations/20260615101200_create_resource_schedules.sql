-- Migration: create_resource_schedules
-- Weekly availability scheduling for drivers and vehicles

CREATE TABLE IF NOT EXISTS resource_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  resource_type text NOT NULL CHECK (resource_type IN ('driver', 'vehicle')),
  resource_id uuid NOT NULL,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  period text NOT NULL CHECK (period IN ('morning', 'afternoon', 'evening')),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'blocked', 'maintenance', 'off')),
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (resource_type, resource_id, day_of_week, period)
);

ALTER TABLE resource_schedules ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_resource_schedules_tenant ON resource_schedules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_resource_schedules_resource ON resource_schedules(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_resource_schedules_day ON resource_schedules(resource_type, day_of_week);

DO $trig$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_resource_schedules_updated_at') THEN
    CREATE TRIGGER trg_resource_schedules_updated_at BEFORE UPDATE ON resource_schedules
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig$;

DO $pol$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'resource_schedules_select' AND tablename = 'resource_schedules') THEN
    CREATE POLICY resource_schedules_select ON resource_schedules FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'resource_schedules_modify' AND tablename = 'resource_schedules') THEN
    CREATE POLICY resource_schedules_modify ON resource_schedules FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;
END $pol$;

CREATE TABLE IF NOT EXISTS operational_conflicts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  conflict_type text NOT NULL CHECK (conflict_type IN ('driver_overlap', 'vehicle_overlap', 'double_booking', 'maintenance_conflict', 'no_driver')),
  severity text NOT NULL DEFAULT 'medium' CHECK (severity IN ('high', 'medium', 'low')),
  title text NOT NULL,
  description text,
  affected_resource_type text CHECK (affected_resource_type IN ('driver', 'vehicle')),
  affected_resource_id uuid,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  day date,
  time_range text,
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE operational_conflicts ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_operational_conflicts_tenant ON operational_conflicts(tenant_id);

DO $pol2$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'operational_conflicts_select' AND tablename = 'operational_conflicts') THEN
    CREATE POLICY operational_conflicts_select ON operational_conflicts FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'operational_conflicts_insert' AND tablename = 'operational_conflicts') THEN
    CREATE POLICY operational_conflicts_insert ON operational_conflicts FOR INSERT WITH CHECK (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'operational_conflicts_update' AND tablename = 'operational_conflicts') THEN
    CREATE POLICY operational_conflicts_update ON operational_conflicts FOR UPDATE USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;
END $pol2$;
