-- Migration: Drop V1 RLS anti-pattern policies
-- Drops 11 V1 policies using auth.jwt() ->> 'role' (multi-tenant anti-pattern)
-- V2 policies from 20250516120200_v2_rls_policies.sql handle access correctly
-- using is_tenant_member().

DO $drop$
BEGIN
  -- Users
  DROP POLICY IF EXISTS users_tenant_modify ON users;

  -- Vehicles
  DROP POLICY IF EXISTS vehicles_tenant_modify ON vehicles;

  -- Routes
  DROP POLICY IF EXISTS routes_tenant_modify ON routes;

  -- Bookings
  DROP POLICY IF EXISTS bookings_tenant_select ON bookings;
  DROP POLICY IF EXISTS bookings_tenant_modify ON bookings;

  -- Passengers
  DROP POLICY IF EXISTS passengers_tenant_modify ON passengers;

  -- Payments
  DROP POLICY IF EXISTS payments_tenant_select ON payments;
  DROP POLICY IF EXISTS payments_tenant_modify ON payments;

  -- Invoices
  DROP POLICY IF EXISTS invoices_tenant_modify ON invoices;

  -- Messages
  DROP POLICY IF EXISTS messages_tenant_select ON messages;

  -- Audit logs
  DROP POLICY IF EXISTS audit_logs_tenant_select ON audit_logs;
END $drop$;
