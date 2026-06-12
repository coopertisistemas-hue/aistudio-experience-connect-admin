# Codex Audit — Sprint 1.3 Bookings Live Integration

**Auditor:** Codex  
**Orchestrator:** GPT-5.4 (DeepSeek)  
**Date:** 2026-06-12  
**Type:** Code review + SQL migration audit  

---

## Scope

Audit all changes from Sprint 1.3 (Bookings Live Integration) before commit.

## Files to Audit

### Source Code (new)
- `apps/web/src/services/bookings.ts`
- `apps/web/src/services/payments.ts`
- `apps/web/src/hooks/useBookings.ts`
- `apps/web/src/hooks/usePayments.ts`

### Source Code (modified)
- `apps/web/src/pages/admin/bookings/page.tsx`
- `apps/web/src/pages/admin/bookings/components/BookingsTable.tsx`
- `apps/web/src/pages/admin/bookings/components/BookingDetailDrawer.tsx`
- `apps/web/src/pages/admin/bookings/components/BookingsFilterBar.tsx`
- `apps/web/src/pages/admin/bookings/components/NovaReservaForm.tsx`
- `apps/web/src/pages/admin/payments/page.tsx`
- `apps/web/src/pages/admin/payments/components/PaymentsSummaryStrip.tsx`
- `apps/web/src/pages/admin/payments/components/PaymentsList.tsx`
- `apps/web/src/pages/admin/payments/components/PaymentDetailDrawer.tsx`
- `apps/web/src/pages/admin/payments/components/PaymentsFilterBar.tsx`
- `apps/web/src/pages/admin/payments/components/NovoPageamentoForm.tsx`
- `apps/web/src/pages/admin/dashboard/DashboardFinancialOverview.tsx`

### Edge Function (new)
- `supabase/functions/create-payment-preference/index.ts`

### Migration (new)
- `supabase/migrations/20260612010000_create_payment_preferences.sql`

---

## Audit Checklist

### 1. Type Safety
- [ ] All Supabase responses correctly typed using `@connect/core` DB types
- [ ] No `any` types introduced
- [ ] Service layer function signatures match hook expectations
- [ ] Component props correctly typed after mock→DB type migration
- [ ] Edge function input/output types properly defined

### 2. Data Flow & Tenant Isolation
- [ ] Every data query scoped to current tenant (via `withTenant` or equivalent)
- [ ] No hardcoded tenant IDs
- [ ] `tenantId` propagated correctly from URL/context to service calls
- [ ] RLS-compatible queries (no `select *` bypassing tenant scope)

### 3. Edge Function Patterns
- [ ] CORS headers present (`process-mp-webhook` pattern followed)
- [ ] Proper error handling with typed error responses
- [ ] Idempotency key support (where applicable)
- [ ] Service role usage isolated (no service_role key exposed client-side)
- [ ] Input validation present
- [ ] Follows existing edge function patterns in the repo

### 4. SQL Migration
- [ ] Forward-only (no down migration)
- [ ] Idempotent (safe to run multiple times)
- [ ] RLS policies enabled on new table
- [ ] Indexes on foreign keys and lookup columns
- [ ] `created_at` / `updated_at` triggers present
- [ ] No breaking changes to existing schema
- [ ] Migration filename matches Supabase convention

### 5. Production Readiness
- [ ] No console.log / debug statements
- [ ] Loading states present for all async operations
- [ ] Error states present (user-facing messages, not raw errors)
- [ ] Empty states present for zero-data scenarios
- [ ] No hardcoded URLs, secrets, or environment-specific values
- [ ] All imports from `@connect/core` use the package name, not relative paths

### 6. Code Quality
- [ ] Follows existing code patterns (naming, file structure, imports)
- [ ] No dead code or commented-out mock imports
- [ ] No unnecessary re-renders (stable query keys, proper memoization)
- [ ] Error boundaries or try/catch at appropriate levels

---

## Delivery

Return a structured audit report:

```markdown
## Codex Audit Report — Sprint 1.3

### Summary
- PASS / FAIL / CONDITIONAL PASS

### Checklist Results
- Type Safety: ✅ / ❌ + notes
- Tenant Isolation: ✅ / ❌ + notes
- Edge Functions: ✅ / ❌ + notes
- SQL Migration: ✅ / ❌ + notes
- Production Readiness: ✅ / ❌ + notes
- Code Quality: ✅ / ❌ + notes

### Issues Found
| # | File | Line | Severity | Description |
|---|------|------|----------|-------------|
| 1 | ... | ... | HIGH/MED/LOW | ... |

### Recommendation
- APPROVED
- APPROVED WITH CONDITIONS (list conditions)
- BLOCKED (list blockers)
```
