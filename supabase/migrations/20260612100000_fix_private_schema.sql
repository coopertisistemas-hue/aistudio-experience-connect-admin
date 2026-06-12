-- Migration: Fix private schema functions
-- Creates private.get_current_tenant_id() used by payment_preferences RLS policies
-- Forward-only. Idempotent.

-- 1. Create private schema if not exists
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Create the missing tenant_id resolution function
-- Used by payment_preferences RLS policies for tenant isolation
CREATE OR REPLACE FUNCTION private.get_current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('app.tenant_id', TRUE)::uuid,
    (SELECT (raw_user_meta_data->>'tenant_id')::uuid FROM auth.users WHERE id = auth.uid())
  );
$$;

-- 3. Note: payment_preferences uses a dedicated trigger function
-- (private.update_payment_preferences_updated_at) defined in
-- 20260612010000_create_payment_preferences.sql.
-- This is kept separate from the shared update_updated_at_column()
-- because payment_preferences follows an older schema pattern.
-- Future migrations should consolidate all triggers onto
-- the shared update_updated_at_column() function.
