-- Migration: V2 RLS Policies
-- Dom Pietro Experience Connect
-- Idempotent policy creation for all tenant-scoped tables

-- ============================================
-- RLS POLICIES (idempotent via DO blocks)
-- ============================================

DO $pol$
BEGIN
  -- TENANTS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tenants_select' AND tablename = 'tenants') THEN
    CREATE POLICY tenants_select ON tenants
      FOR SELECT USING (
        is_tenant_member(id) OR (auth.uid() IS NOT NULL AND EXISTS (
          SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.metadata ->> 'is_super_admin' = 'true'
        ))
      );
  END IF;

  -- USERS: self access OR admin/operator of same tenant
  DROP POLICY IF EXISTS users_select ON users;
  CREATE POLICY users_select ON users
    FOR SELECT USING (
      id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM user_tenants ut_current
        JOIN user_tenants ut_target ON ut_current.tenant_id = ut_target.tenant_id
        WHERE ut_current.user_id = auth.uid()
          AND ut_current.role IN ('admin', 'operator')
          AND ut_current.status = 'active'
          AND ut_target.user_id = users.id
      )
    );

  -- USER_TENANTS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'user_tenants_select' AND tablename = 'user_tenants') THEN
    CREATE POLICY user_tenants_select ON user_tenants
      FOR SELECT USING (
        user_id = auth.uid() OR is_tenant_member(tenant_id, ARRAY['admin', 'operator'])
      );
  END IF;

  -- SERVED_LODGINGS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'served_lodgings_select' AND tablename = 'served_lodgings') THEN
    CREATE POLICY served_lodgings_select ON served_lodgings
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'served_lodgings_modify' AND tablename = 'served_lodgings') THEN
    CREATE POLICY served_lodgings_modify ON served_lodgings
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- DRIVERS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'drivers_select' AND tablename = 'drivers') THEN
    CREATE POLICY drivers_select ON drivers
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'drivers_modify' AND tablename = 'drivers') THEN
    CREATE POLICY drivers_modify ON drivers
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- ROUTE_CATEGORIES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'route_categories_select' AND tablename = 'route_categories') THEN
    CREATE POLICY route_categories_select ON route_categories
      FOR SELECT USING (is_tenant_member(tenant_id) OR (is_active = true AND auth.uid() IS NULL));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'route_categories_modify' AND tablename = 'route_categories') THEN
    CREATE POLICY route_categories_modify ON route_categories
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- PARTNERS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'partners_select' AND tablename = 'partners') THEN
    CREATE POLICY partners_select ON partners
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'partners_modify' AND tablename = 'partners') THEN
    CREATE POLICY partners_modify ON partners
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- VEHICLES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vehicles_select' AND tablename = 'vehicles') THEN
    CREATE POLICY vehicles_select ON vehicles
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vehicles_modify' AND tablename = 'vehicles') THEN
    CREATE POLICY vehicles_modify ON vehicles
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- ROUTES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'routes_select' AND tablename = 'routes') THEN
    CREATE POLICY routes_select ON routes
      FOR SELECT USING (
        is_tenant_member(tenant_id) OR (is_active = true AND auth.uid() IS NULL)
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'routes_modify' AND tablename = 'routes') THEN
    CREATE POLICY routes_modify ON routes
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- VEHICLE_SLOTS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vehicle_slots_select' AND tablename = 'vehicle_slots') THEN
    CREATE POLICY vehicle_slots_select ON vehicle_slots
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vehicle_slots_modify' AND tablename = 'vehicle_slots') THEN
    CREATE POLICY vehicle_slots_modify ON vehicle_slots
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- BOOKINGS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_guest_select' AND tablename = 'bookings') THEN
    CREATE POLICY bookings_guest_select ON bookings
      FOR SELECT USING (user_id = auth.uid() AND is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_admin_select' AND tablename = 'bookings') THEN
    CREATE POLICY bookings_admin_select ON bookings
      FOR SELECT USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator', 'driver']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_guest_insert' AND tablename = 'bookings') THEN
    CREATE POLICY bookings_guest_insert ON bookings
      FOR INSERT WITH CHECK (user_id = auth.uid() AND is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'bookings_admin_modify' AND tablename = 'bookings') THEN
    CREATE POLICY bookings_admin_modify ON bookings
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- BOOKING_HOLDS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'booking_holds_select' AND tablename = 'booking_holds') THEN
    CREATE POLICY booking_holds_select ON booking_holds
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'booking_holds_modify' AND tablename = 'booking_holds') THEN
    CREATE POLICY booking_holds_modify ON booking_holds
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- BOOKING_PASSENGERS
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'booking_passengers_select' AND tablename = 'booking_passengers') THEN
    CREATE POLICY booking_passengers_select ON booking_passengers
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'booking_passengers_modify' AND tablename = 'booking_passengers') THEN
    CREATE POLICY booking_passengers_modify ON booking_passengers
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- PAYMENTS: guests see own payments; admin/operator see tenant-wide
  DROP POLICY IF EXISTS payments_select ON payments;
  DROP POLICY IF EXISTS payments_modify ON payments;
  CREATE POLICY payments_guest_select ON payments
    FOR SELECT USING (user_id = auth.uid() AND is_tenant_member(tenant_id));
  CREATE POLICY payments_admin_select ON payments
    FOR SELECT USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  CREATE POLICY payments_modify ON payments
    FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));

  -- Append-only tables: SELECT only for authenticated members, no direct INSERT/UPDATE/DELETE
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'payment_events_select' AND tablename = 'payment_events') THEN
    CREATE POLICY payment_events_select ON payment_events
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'webhook_deliveries_select' AND tablename = 'webhook_deliveries') THEN
    CREATE POLICY webhook_deliveries_select ON webhook_deliveries
      FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'audit_logs_select' AND tablename = 'audit_logs') THEN
    CREATE POLICY audit_logs_select ON audit_logs
      FOR SELECT USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'booking_status_changes_select' AND tablename = 'booking_status_changes') THEN
    CREATE POLICY booking_status_changes_select ON booking_status_changes
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;

  -- INVOICES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invoices_select' AND tablename = 'invoices') THEN
    CREATE POLICY invoices_select ON invoices
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'invoices_modify' AND tablename = 'invoices') THEN
    CREATE POLICY invoices_modify ON invoices
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;

  -- MESSAGES
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'messages_select' AND tablename = 'messages') THEN
    CREATE POLICY messages_select ON messages
      FOR SELECT USING (
        is_tenant_member(tenant_id) AND (sender_id = auth.uid() OR recipient_id = auth.uid())
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'messages_insert' AND tablename = 'messages') THEN
    CREATE POLICY messages_insert ON messages
      FOR INSERT WITH CHECK (
        is_tenant_member(tenant_id) AND sender_id = auth.uid()
      );
  END IF;
END $pol$;
