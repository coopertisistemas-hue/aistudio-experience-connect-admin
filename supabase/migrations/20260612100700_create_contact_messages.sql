-- Migration: create_contact_messages
-- Creates contact_messages table for landing page contact form
-- Forward-only + idempotent

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_contact_messages_tenant ON contact_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at);

DO $pol$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'contact_messages_anon_insert' AND tablename = 'contact_messages') THEN
    CREATE POLICY contact_messages_anon_insert ON contact_messages
      FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'contact_messages_admin_select' AND tablename = 'contact_messages') THEN
    CREATE POLICY contact_messages_admin_select ON contact_messages
      FOR SELECT USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;
END $pol$;
