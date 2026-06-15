-- Migration: create_notifications
-- Creates notifications table for system/user notifications
-- Forward-only + idempotent

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  category text,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'success', 'warning', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  entity_ref text,
  entity_label text,
  entity_path text,
  is_read boolean NOT NULL DEFAULT false,
  resolved boolean NOT NULL DEFAULT false,
  data jsonb NOT NULL DEFAULT '{}',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(tenant_id, user_id) WHERE NOT is_read AND deleted_at IS NULL;

DO $trig$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_notifications_updated_at') THEN
    CREATE TRIGGER trg_notifications_updated_at BEFORE UPDATE ON notifications
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig$;

DO $pol$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_select' AND tablename = 'notifications') THEN
    CREATE POLICY notifications_select ON notifications
      FOR SELECT USING (
        user_id = auth.uid()
        OR is_tenant_member(tenant_id, ARRAY['admin', 'operator'])
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_insert' AND tablename = 'notifications') THEN
    CREATE POLICY notifications_insert ON notifications
      FOR INSERT WITH CHECK (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'notifications_update' AND tablename = 'notifications') THEN
    CREATE POLICY notifications_update ON notifications
      FOR UPDATE USING (
        user_id = auth.uid()
        OR is_tenant_member(tenant_id, ARRAY['admin', 'operator'])
      );
  END IF;
END $pol$;
