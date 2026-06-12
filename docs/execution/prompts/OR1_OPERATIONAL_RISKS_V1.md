# Operational Risks Remediation — OR1

**Exec Agent:** Kimi (primary) + Codex (audit)  
**Date:** 2026-06-12  
**Type:** Code + docs + migrations

---

## Context

Resolving the 5 operational risks from `OPERATIONAL_START_RECOMMENDATION.md`.

### Verified State (reality check)

| Risk | Description | Verified Status |
|------|-------------|----------------|
| R1 | touch_updated_at() validation | **Docs misname function** — real name is `update_updated_at_column()`. Payment_preferences uses non-standard trigger. |
| R2 | Orphaned edge functions | **RESOLVED** — all 8 EFs exist (1032 lines total, 95-226 lines each). None are orphaned. |
| R3 | Duplicated edge functions | **LOW** — DB RPC seat-release logic duplicated across 3 functions. Deferrable. |
| R4 | Infrastructure visibility | **OPEN** — no CI/CD, no Docker Compose, missing Vercel configs, no Sentry |
| R5 | Security migration execution | **CRITICAL** — `private.get_current_tenant_id()` used but never defined. 11 V1 RLS anti-pattern policies active. |

---

## Scope

### 1. R5 — Security Migration: Create `private.get_current_tenant_id()`

Create migration `20260612100000_fix_private_schema.sql`:

```sql
-- 1. Create private schema if not exists
CREATE SCHEMA IF NOT EXISTS private;

-- 2. Create the missing function
CREATE OR REPLACE FUNCTION private.get_current_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE(
    current_setting('app.tenant_id', TRUE)::uuid,
    (SELECT raw_user_meta_data->>'tenant_id'::uuid FROM auth.users WHERE id = auth.uid())
  );
$$;

-- 3. Fix payment_preferences trigger to use shared function
CREATE OR REPLACE FUNCTION private.update_payment_preferences_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Note: We keep the dedicated trigger for payment_preferences
-- since it's in a different schema pattern. The function exists and works.
```

### 2. R5 — Security Migration: Drop V1 RLS anti-pattern policies

Create migration `20260612100100_drop_v1_rls_policies.sql`:

The initial migration `00000000000000_init.sql` has 11 RLS policies using `auth.jwt() ->> 'role'` which is an anti-pattern per `MULTI-TENANT-SECURITY.md`. These policies overlap with correct V2 policies and must be dropped.

For each table in the V1 init that has these policies, DROP the V1 policies. The V2 policies from `v2_rls_policies.sql` already handle access correctly using `is_tenant_member()`.

Check `00000000000000_init.sql` lines 278-365 and generate DROP POLICY statements for all policies using `auth.jwt() ->> 'role'`.

### 3. R1 — Fix doc naming

Update all governance docs that reference `touch_updated_at()` to `update_updated_at_column()`:

Files to fix:
- `docs/governance/GOVERNANCE_STATE.md` (line 61)
- `docs/governance/GOVERNANCE_TRANSITION_REPORT.md` (lines 105, 107)
- `docs/governance/OPERATIONAL_START_RECOMMENDATION.md` (line 42)
- `docs/EXECUTION/EXPERIENCE_CONNECT_FULL_INVENTORY_AND_EXEC_PLAN.md` (lines 281, 435, 457, 568, 849, 852, 860, 1565)

### 4. R4 — Infrastructure: GitHub Actions CI

Create `.github/workflows/ci.yml`:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm build
```

### 5. R4 — Infrastructure: Vercel configs

Add `vercel.json` for `apps/admin/` and `apps/landing/` following the same pattern as `apps/web/vercel.json`.

Read the existing `apps/web/vercel.json` first, then create analogous configs.

### 6. R4 — Infrastructure: Docker Compose for local dev

Create `docker-compose.yml` at repo root for Supabase local development:

```yaml
version: '3.8'
services:
  supabase:
    image: supabase/supabase-local:v2
    ports:
      - "54321:54321"
      - "54322:54322"
    environment:
      POSTGRES_PASSWORD: postgres
      JWT_SECRET: super-secret-jwt-token-with-at-least-32-characters-long
```

(Reference the existing `supabase/config.toml` for exact ports and settings.)

### 7. R1 — Standardize payment_preferences trigger

In migration `20260612100000_fix_private_schema.sql` (from item 1), also ensure the payment_preferences trigger uses the standard pattern. Read the existing trigger in `20260612010000_create_payment_preferences.sql` and either:
- Replace with `update_updated_at_column()` shared function, OR
- Keep the dedicated function but add a comment explaining why

### 8. R3 — Deferred: Add comment to backlog

Simply add a note to `NEXT_ACTIONS.md` that R3 (DB RPC seat-release duplication) is deferred to a future sprint. No code changes needed.

---

## Out of Scope

- Sentry integration (requires account setup — future sprint)
- Terraform/Pulumi IaC (too heavy for now)
- Docker Compose with all services (simplified version only)
- Production deployment config (staging only)

---

## QA Gates

1. `pnpm typecheck` — zero errors
2. `pnpm lint` — zero errors
3. `pnpm build` — zero errors
4. Codex audit before commit

---

## Delivery

Report back with:
1. Summary per risk item: RESOLVED / PARTIAL / DEFERRED
2. Files created and modified
3. Verification results
4. Any blockers encountered
