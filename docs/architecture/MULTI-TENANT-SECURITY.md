# MULTI-TENANT SECURITY — Dom Pietro Experience Connect

> Enterprise SaaS tenant isolation architecture. Every data access path must enforce isolation. Every exception must be audited.

---

## 1. WHY tenant_id ALONE IS INSUFFICIENT

A `tenant_id` column on every table is necessary but not sufficient for secure multi-tenancy:

1. **It does not verify membership.** A `tenant_id` tells you where a row lives; it does not tell you whether the current user is allowed to access that tenant.
2. **It does not encode roles.** A user may be `admin` in Tenant A and `guest` in Tenant B. A single `users.role` column cannot represent this.
3. **It does not support switching.** Users with multiple memberships need a clean mechanism to switch active tenant context.
4. **It does not prevent orphaned records.** A `tenant_id` FK without membership validation can leak if the access layer is bypassed.

**Therefore:** The canonical authorization model is `user_tenants` (membership table) + RLS policies that query it.

---

## 2. MEMBERSHIP MODEL

### user_tenants

```sql
CREATE TABLE user_tenants (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('guest', 'admin', 'driver', 'operator')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  invited_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, tenant_id)
);

CREATE INDEX idx_user_tenants_tenant ON user_tenants(tenant_id);
CREATE INDEX idx_user_tenants_user ON user_tenants(user_id);
```

### users (profile extension)

```sql
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  phone text,
  full_name text,
  avatar_url text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  preferences jsonb NOT NULL DEFAULT '{}',
  metadata jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

**Key change from V1:** `users` no longer contains `tenant_id` or `role`. These live exclusively in `user_tenants`.

### super_admin Exception

`super_admin` is not a `user_tenants.role`. It is a platform-level role stored in `users.metadata` or `auth.users.raw_app_meta_data` (injected via trigger). `super_admin` bypasses tenant isolation for operational support but **must** log every access via `audit_logs.impersonation`.

---

## 3. ROLE HIERARCHY PER TENANT

| Role | Scope | Permissions |
|------|-------|-------------|
| `guest` | Tenant | Read own bookings, read own payments, read catalog, create bookings |
| `driver` | Tenant | Read assigned bookings, update booking status (in_progress, completed), read own schedule |
| `operator` | Tenant | Read/write bookings, read/write vehicles, read/write routes, read payments, read guests |
| `admin` | Tenant | Full operational control within tenant + user management |
| `super_admin` | Platform | Cross-tenant read for support, tenant provisioning, system config |

**Rules:**
- A user can have one role per tenant.
- `super_admin` is not a tenant role.
- Role escalation within a tenant requires an existing `admin` to issue an invitation.

---

## 4. ACTIVE TENANT CONTEXT

### Concept

Every authenticated request operates within an **active tenant context**. The frontend must send the active `tenant_id` (via header or claim), and the backend must validate that the user has an active membership for that tenant.

### Implementation

**Edge Functions:**
```typescript
// Extract from JWT custom claim or request header
const activeTenantId = req.headers.get('x-tenant-id');
const { data: membership } = await supabase
  .from('user_tenants')
  .select('role, status')
  .eq('user_id', user.id)
  .eq('tenant_id', activeTenantId)
  .single();

if (!membership || membership.status !== 'active') {
  return new Response('Unauthorized tenant', { status: 403 });
}
```

**RLS Policies:**
RLS policies must validate membership, not rely on a session variable:
```sql
CREATE POLICY tenant_isolation_select ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = bookings.tenant_id
        AND ut.status = 'active'
    )
  );
```

---

## 5. TENANT SWITCHING

### Flow

1. User is authenticated and has memberships in Tenant A and Tenant B.
2. User selects Tenant B from a switcher UI.
3. Frontend requests a new session token or updates the active tenant header.
4. Backend validates membership in Tenant B.
5. All subsequent requests are scoped to Tenant B.

### Security Rules

- Switching does not require re-authentication (the user is already logged in).
- Switching must be validated server-side on every request.
- The previous tenant context is immediately discarded.
- Switching events should be logged for audit.

---

## 6. RBAC STRATEGY

### Principle: Membership-Driven Authorization

All access control flows through `user_tenants`:

```
Request → Authenticate (Supabase Auth) → Resolve Memberships → Validate Role → Authorize Action
```

### RLS Policy Patterns

**Pattern A: Tenant Member Can Read**
```sql
CREATE POLICY bookings_tenant_read ON bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = bookings.tenant_id
        AND ut.status = 'active'
    )
  );
```

**Pattern B: Guest Can Only Read Own Bookings**
```sql
CREATE POLICY bookings_guest_read ON bookings
  FOR SELECT USING (
    bookings.user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = bookings.tenant_id
        AND ut.status = 'active'
    )
  );
```

**Pattern C: Admin/Operator Can Modify**
```sql
CREATE POLICY bookings_admin_modify ON bookings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = bookings.tenant_id
        AND ut.role IN ('admin', 'operator')
        AND ut.status = 'active'
    )
  );
```

**Pattern D: Driver Can Read Assigned**
```sql
CREATE POLICY bookings_driver_read ON bookings
  FOR SELECT USING (
    bookings.driver_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM user_tenants ut
      WHERE ut.user_id = auth.uid()
        AND ut.tenant_id = bookings.tenant_id
        AND ut.role = 'driver'
        AND ut.status = 'active'
    )
  );
```

---

## 7. JWT CLAIMS STRATEGY

### What NOT To Do

**DO NOT** rely on `auth.jwt() ->> 'role'` as a top-level claim.

The Supabase Auth JWT does not include custom top-level claims by default. Claims like `role`, `tenant_id`, or `admin` do not exist unless explicitly injected via database trigger or auth hook — and even then, they can become stale if membership changes while the JWT is still valid.

### What TO Do

1. **Use `auth.uid()`** for user identity. This is immutable and trustworthy.
2. **Resolve membership dynamically** via `user_tenants` in RLS or Edge Functions.
3. **Cache membership briefly** in Edge Function memory (per-request only, never in client storage).
4. **If using custom claims** (advanced), inject only a `tenant_memberships` array via `auth.users.raw_app_meta_data` updated by trigger on `user_tenants` changes. Still verify against `user_tenants` for critical writes.

### Example: Custom Claim Update Trigger (Optional)

```sql
CREATE OR REPLACE FUNCTION sync_user_app_metadata()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE auth.users
  SET raw_app_meta_data = jsonb_build_object(
    'tenant_memberships',
    (
      SELECT jsonb_agg(jsonb_build_object('tenant_id', tenant_id, 'role', role))
      FROM user_tenants
      WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        AND status = 'active'
    )
  )
  WHERE id = COALESCE(NEW.user_id, OLD.user_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Note:** Even with this cache, RLS policies for writes should still verify `user_tenants` directly.

---

## 8. service_role BOUNDARIES

### Definition

`service_role` is a Supabase admin key that bypasses RLS. It must be treated as a root credential.

### Rules

1. **Never expose `service_role` to the frontend.** Not in env vars bundled to the browser, not in API responses, not in client-side Supabase initialization.
2. **Only Edge Functions and server scripts may use `service_role`.**
3. **All `service_role` operations must be logged.** If an Edge Function uses `service_role` (e.g., for impersonation or cross-tenant analytics), the action must be recorded in `audit_logs`.
4. **Prefer RPC/RLS over `service_role`.** Only use `service_role` when RLS is technically impossible (e.g., background reaper jobs, admin analytics).

---

## 9. ADMIN / super_admin MODEL

### super_admin

- Exists at platform level, not inside `user_tenants`.
- Can read cross-tenant for support and auditing.
- Must use explicit impersonation mode when viewing a specific tenant.
- All cross-tenant reads must be logged with `impersonator_id` and `target_tenant_id`.

### Admin Impersonation

When a `super_admin` needs to act on behalf of a tenant:

1. `super_admin` selects tenant in admin UI.
2. Edge Function validates `super_admin` status.
3. Edge Function sets audit context: `impersonator_id = super_admin.id`, `target_tenant_id = tenant.id`.
4. Edge Function performs the operation using `service_role` or elevated internal logic.
5. Action is logged.

### tenant Admin

- Normal user with `role = 'admin'` in `user_tenants`.
- Cannot access other tenants.
- Can manage users, bookings, vehicles, and routes within their tenant.

---

## 10. AUDIT LOGGING REQUIREMENTS

All of the following must be recorded:

| Event | Required Fields |
|-------|-----------------|
| Login | user_id, ip, user_agent, timestamp |
| Tenant switch | user_id, from_tenant_id, to_tenant_id, timestamp |
| Role change | user_id, tenant_id, old_role, new_role, changed_by, timestamp |
| Membership invite | user_id, tenant_id, invited_by, role, timestamp |
| Impersonation | impersonator_id, target_tenant_id, reason, timestamp |
| RLS violation attempt | user_id, attempted_tenant_id, table_name, timestamp |

---

## 11. PUBLIC CATALOG ACCESS RULES

Certain data may be read without authentication (public catalog):

- Active routes (`routes.is_active = true`)
- Tenant public branding (`tenants.branding` subset)

These require **dedicated RLS policies** or a public read-only RPC. Do not disable RLS on catalog tables.

Example:
```sql
CREATE POLICY routes_public_read ON routes
  FOR SELECT USING (is_active = true);
```

---

## 12. PRIVATE OPERATIONAL ACCESS RULES

All operational tables (`bookings`, `payments`, `vehicle_slots`, `booking_holds`, `invoices`) must:

1. Have RLS enabled.
2. Have no public access policies.
3. Require authenticated user + active membership.
4. Respect role boundaries (guest vs admin vs driver).

---

## 13. SECURE EDGE FUNCTION ACCESS PATTERNS

### Pattern: Authenticated + Tenant-Validated RPC

```typescript
// Every Edge Function must implement this guard
export default async (req: Request) => {
  const supabase = createClient(req);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  const tenantId = req.headers.get('x-tenant-id');
  if (!tenantId) return new Response('Tenant required', { status: 400 });

  const { data: membership } = await supabase
    .from('user_tenants')
    .select('role, status')
    .eq('user_id', user.id)
    .eq('tenant_id', tenantId)
    .single();

  if (!membership || membership.status !== 'active') {
    return new Response('Forbidden', { status: 403 });
  }

  // Proceed with validated context
};
```

### Pattern: Idempotency Guard

All critical mutations must check `idempotency_key` before execution.

---

## 14. APPEND-ONLY LEDGER WRITERS

Tables `payment_events`, `booking_status_changes`, and `audit_logs` are append-only ledgers. They must be written exclusively by trusted server-side contexts.

### Trusted Execution Context

| Context | Allowed To Write | Mechanism |
|---------|------------------|-----------|
| Edge Functions (validated) | `payment_events`, `booking_status_changes`, `audit_logs` | `service_role` internally or SECURITY DEFINER function call |
| Database triggers | `booking_status_changes`, `audit_logs` | `SECURITY DEFINER` |
| Frontend / Authenticated users | **None** | N/A |

### Why Frontend Cannot Write Ledgers

- **Audit integrity:** If clients can write audit logs, logs become untrustworthy.
- **Idempotency:** Ledger writes must be coupled with business logic validation.
- **RLS bypass necessity:** Append-only tables may need to record events that the requesting user would not otherwise have permission to insert (e.g., webhook-generated payment events).

### Pattern: Edge Function with Internal service_role

```typescript
// Edge Function validates webhook, then uses service_role client
// internally to write payment_events and webhook_deliveries
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
await supabaseAdmin.from('payment_events').insert({ ... });
```

This is safe because:
1. The Edge Function is server-side.
2. The webhook payload was validated before writing.
3. `service_role` never leaves the server.

---

## 15. ANTI-PATTERNS (STRICTLY FORBIDDEN)

| Anti-Pattern | Why Forbidden |
|--------------|---------------|
| `auth.jwt() ->> 'role'` in RLS | Claim does not exist by default; stale JWTs may grant wrong access |
| Direct client writes to `bookings`, `payments`, `payment_events` | Bypasses business logic, idempotency, and audit |
| `service_role` in frontend/browser | Complete RLS bypass; security incident |
| Disabling RLS to fix a bug | Removes all tenant isolation; data leak guarantee |
| Trusting `tenant_id` from client without membership check | Client can send any UUID |
| Hardcoding `tenant_id` in frontend | Breaks multi-tenancy; every user sees the same tenant |
| Allowing authenticated INSERT on append-only tables | Destroys audit integrity |

---

## 15. SECURITY VALIDATION CHECKLIST

Before production:

- [ ] All tenant-scoped tables have RLS enabled
- [ ] No policy uses `auth.jwt() ->> 'role'`
- [ ] All policies verify `user_tenants` membership
- [ ] `service_role` key is not present in any frontend bundle
- [ ] `user_tenants` has appropriate indexes
- [ ] Impersonation is logged
- [ ] Public catalog access uses explicit public policies, not disabled RLS
- [ ] All Edge Functions validate tenant membership
