# OBSERVABILITY — Dom Pietro Experience Connect

> Monitoring, logging, and operational visibility strategy. If you cannot observe it, you cannot operate it.

---

## 1. STRUCTURED LOGGING STRATEGY

### Principle

All logs must be structured (JSON) and include correlation IDs. Unstructured logs are unacceptable in production.

### Required Fields

Every log entry must include:

```json
{
  "timestamp": "2026-05-16T14:30:00.000Z",
  "level": "info|warn|error|fatal",
  "service": "edge-function|web-app|admin-app|db-trigger",
  "correlation_id": "uuid",
  "tenant_id": "uuid|null",
  "user_id": "uuid|null",
  "action": "create_booking_hold|process_webhook|...",
  "message": "Human-readable description",
  "context": { "booking_id": "...", "payment_id": "..." }
}
```

### Log Levels

| Level | Usage |
|-------|-------|
| `info` | Normal operations (booking created, payment confirmed) |
| `warn` | Recoverable issues (webhook retry, hold expiry approaching) |
| `error` | Failures requiring attention (payment reconciliation mismatch, RLS violation) |
| `fatal` | System-level failures (database unreachable, auth service down) |

---

## 2. CORRELATION IDs

### Definition

A `correlation_id` (UUID v4) is generated at the entry point of a request and propagated through all subsequent services, Edge Functions, and database triggers.

### Propagation

1. **Frontend** generates `x-correlation-id` header for every API call. If missing, Edge Function generates one.
2. **Edge Function** passes `correlation_id` to all internal calls.
3. **Database triggers** receive `correlation_id` via `current_setting('app.correlation_id', true)`.
4. **Webhook handlers** generate new `correlation_id` for webhook processing, but log the provider's event ID alongside it.

### Implementation

```typescript
// Edge Function
const correlationId = req.headers.get('x-correlation-id') || crypto.randomUUID();
// Include in all Supabase calls and external API calls
```

```sql
-- Trigger or function
PERFORM set_config('app.correlation_id', correlation_uuid::text, false);
```

---

## 3. ENTITY CORRELATION

### tenant_id Correlation

Every log must include `tenant_id` when operating in a tenant context. Cross-tenant operations (super_admin) must log both `tenant_id` and `impersonator_id`.

### booking_id Correlation

All logs related to a booking lifecycle must include `booking_id`:
- Hold creation
- Payment initiation
- Webhook processing
- Confirmation
- Cancellation
- Slot release

### payment_id Correlation

All logs related to a payment must include `payment_id`:
- Preference creation
- Webhook receipt
- Status update
- Reconciliation
- Refund

### webhook_event Correlation

All webhook logs must include:
- `provider` (e.g., `mercado_pago`)
- `provider_event_id`
- `webhook_delivery_id`

---

## 4. ERROR TRACKING

### Tool: Sentry

Sentry is the primary error tracking tool for:
- Frontend crashes (React error boundaries)
- Edge Function unhandled exceptions
- Database trigger failures (logged to Sentry via Edge Function or log drain)

### Required Sentry Context

Every Sentry event must include:
- `tenant_id`
- `user_id`
- `correlation_id`
- `booking_id` (if applicable)
- `payment_id` (if applicable)

### Error Classification

| Category | Examples | Alert Priority |
|----------|----------|----------------|
| Booking failure | Hold creation failed, slot reservation failed | P1 |
| Payment failure | Webhook processing error, refund failed | P1 |
| Auth failure | RLS violation, unauthorized access attempt | P2 |
| Performance | API latency > 2s, DB query > 1s | P2 |
| Infrastructure | Edge Function timeout, deployment failure | P1 |

---

## 5. AUDIT LOGGING

### audit_logs Table

Already defined in schema. Requirements:

- Append-only (no UPDATE/DELETE)
- Written by triggers or SECURITY DEFINER functions
- Includes `correlation_id` where possible

### Critical Audit Events

| Event | Table | Action | Required Context |
|-------|-------|--------|------------------|
| Booking created | bookings | INSERT | user_id, tenant_id, booking_id, hold_id |
| Booking confirmed | bookings | UPDATE | user_id, tenant_id, booking_id, payment_id |
| Booking cancelled | bookings | UPDATE | user_id, tenant_id, booking_id, reason |
| Payment processed | payments | UPDATE | user_id, tenant_id, payment_id, provider_event_id |
| Refund issued | payments | UPDATE | admin_id, tenant_id, payment_id, reason |
| Manual override | payments | INSERT | admin_id, tenant_id, booking_id, reason |
| Role changed | user_tenants | UPDATE | admin_id, tenant_id, user_id, old_role, new_role |
| Tenant suspended | tenants | UPDATE | super_admin_id, tenant_id, reason |
| Impersonation | audit_logs | INSERT | impersonator_id, target_tenant_id, reason |

---

## 6. OPERATIONAL ALERTS

### Alert Definitions

#### ALERT-B1: Failed Bookings
**Condition:** `booking_status_changes` has `new_status = 'cancelled'` with `reason = 'system_failure'` in the last 5 minutes.
**Threshold:** > 0
**Action:** P1 alert to on-call. Investigate hold/slot system.

#### ALERT-B2: Expired Holds Not Releasing Slots
**Condition:** `booking_holds` with `expires_at < now() - interval '10 minutes'` and `status = 'active'`.
**Threshold:** > 0
**Action:** P1 alert. Reaper job may be down.

#### ALERT-P1: Payment Mismatch
**Condition:** Reconciliation job finds `payments.status` != derived status from `payment_events`.
**Threshold:** > 0
**Action:** P1 alert. Investigate webhook loss or processing bug.

#### ALERT-P2: Webhook Conflict Rate
**Condition:** `webhook_deliveries` inserts resulting in `ON CONFLICT` (duplicate event_id) in last hour.
**Threshold:** > 10 per hour
**Action:** P2 alert. May indicate MP retry storm or idempotency check misconfiguration.

#### ALERT-P2b: Duplicate Webhook Drops
**Condition:** `webhook_deliveries` rows with `status = 'received'` where the same `(provider, event_id)` already existed (detected via `ON CONFLICT` metrics or application logs) in last hour.
**Threshold:** > 5
**Action:** P2 alert. Webhooks are being received but dropped as duplicates. Verify `ON CONFLICT` behavior and MP retry frequency.

#### ALERT-P2c: Webhook Replay Attempts
**Condition:** `webhook_deliveries` with `status = 'received'` but no matching `status = 'processed'` within 5 minutes.
**Threshold:** > 0
**Action:** P2 alert. Webhook was recorded but not processed. Handler may be stuck.

#### ALERT-P2d: Invalid Webhook Signatures
**Condition:** `webhook_deliveries` with `status = 'failed'` and signature validation error in last hour.
**Threshold:** > 0
**Action:** P2 alert. Investigate spoofed payloads or webhook secret drift.

#### ALERT-B3: Booking Stuck in Payment Pending
**Condition:** `bookings` with `status = 'payment_pending'` and `updated_at < now() - interval '2 hours'`.
**Threshold:** > 0
**Action:** P2 alert. Payment may have failed silently.

#### ALERT-T1: Tenant Access Violation
**Condition:** `audit_logs` has `action = 'RLS_VIOLATION_ATTEMPT'` in last 15 minutes.
**Threshold:** > 0
**Action:** P2 alert. Possible attack or misconfigured client.

#### ALERT-I1: High API Latency
**Condition:** Edge Function execution time p95 > 2000ms in last 10 minutes.
**Threshold:** p95 > 2s
**Action:** P2 alert. Investigate DB query performance.

#### ALERT-I2: Failed Migrations
**Condition:** `supabase_migration_status` (or CI log) shows failure.
**Threshold:** Any failure
**Action:** P1 alert. Block production deploy.

#### ALERT-I3: Failed Deployments
**Condition:** Vercel or Supabase deploy status = failed.
**Threshold:** Any failure
**Action:** P1 alert.

---

## 7. DASHBOARDS

### Booking Operations Dashboard

Metrics:
- Bookings created (last 24h, by tenant)
- Confirmation rate (%)
- Cancellation rate (%)
- Average time from hold to confirmation
- Slots utilization %
- Holds expired vs converted

### Payment Operations Dashboard

Metrics:
- Payments initiated vs completed
- Webhook processing latency (p50, p95, p99)
- Failed payment rate (%)
- Refund volume
- Reconciliation mismatches (must be 0)

### Security Dashboard

Metrics:
- Unauthorized access attempts (by IP, by tenant)
- RLS violations
- Impersonation events
- Failed login attempts

### Infrastructure Dashboard

Metrics:
- Edge Function error rate
- Edge Function cold start frequency
- Database connection pool utilization
- API response time (p50, p95, p99)

---

## 8. RUNBOOKS

### RUNBOOK-001: Overbooking Detected

1. Identify the conflicting bookings.
2. Check `vehicle_slots` for double reservation.
3. Determine which booking was confirmed first (by `created_at`).
4. Contact guest of later booking to reschedule or refund.
5. Log incident in `audit_logs`.
6. Investigate how concurrency check failed. Fix and deploy.

### RUNBOOK-002: Webhook Not Processing

1. Check `webhook_deliveries` for recent entries.
2. If empty: verify MP notification URL is correct and SSL cert is valid.
3. If entries exist with `status = 'failed'`: check Edge Function logs for errors.
4. If MP sent webhook but we missed it: run reconciliation job.
5. If idempotency bug suspected: inspect `payment_events` for gaps.
6. If signature mismatches are present: verify webhook secret and confirm invalid payloads are returning 400.

### RUNBOOK-003: Payment Stuck in Pending

1. Query `payments` where `status = 'pending'` and `created_at` is old.
2. Call MP API directly to check payment status.
3. If MP says `approved`: manually trigger reconciliation or update.
4. If MP says `rejected`: cancel booking and release slot.
5. Record all actions in `audit_logs`.

### RUNBOOK-004: RLS Violation Alert

1. Identify user and tenant from `audit_logs`.
2. Determine if violation was accidental (bug) or malicious.
3. If malicious: suspend user membership, notify admin.
4. If bug: identify client code path, fix, deploy hotfix.

### RUNBOOK-005: Database Migration Failure

1. Do NOT retry blindly.
2. Check Supabase logs for exact error.
3. If migration is non-idempotent: restore staging from backup, fix migration, re-test.
4. If production: block deploy, escalate to architect.

---

## 9. RECOMMENDED TOOLS

| Tool | Purpose | Environment |
|------|---------|-------------|
| **Sentry** | Error tracking, crash reporting | All |
| **PostHog** | Product analytics, funnel tracking | Production |
| **Supabase Logs** | Database query logs, auth logs | All |
| **Vercel Analytics** | Web Vitals, frontend performance | Production |
| **GitHub Actions Logs** | CI/CD pipeline visibility | CI |
| **Better Stack / Uptime** | Uptime monitoring, status page | Production (optional) |

---

## 10. OBSERVABILITY VALIDATION CHECKLIST

- [ ] All Edge Functions log structured JSON with `correlation_id`
- [ ] All critical paths emit at least one `info` log on success
- [ ] All failures emit `error` logs with full context
- [ ] Sentry is configured with `tenant_id`, `user_id`, `correlation_id` tags
- [ ] `audit_logs` table has appropriate indexes for querying
- [ ] Alerts are configured for all P1 conditions
- [ ] Runbooks exist for all P1 alert scenarios
- [ ] Dashboards are accessible to on-call engineers
- [ ] Log retention policy defined (e.g., 30 days hot, 1 year cold)
