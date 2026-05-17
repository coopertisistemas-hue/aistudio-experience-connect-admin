# ARCHITECTURE V2 — Dom Pietro Experience Connect

> Central architecture document and source of truth. Replaces ARCHITECTURE-V1.
> All implementation decisions must align with this document and its domain-specific children.

---

## 1. OPERATIONAL DOMAINS

The platform is organized into 10 bounded operational domains:

1. **Identity & Access** — Auth, profiles, memberships, roles
2. **Tenant Management** — Tenant provisioning, configuration, lifecycle
3. **Catalog** — Routes, experiences, pricing
4. **Inventory & Capacity** — Vehicles, slots, holds, capacity tracking
5. **Booking Orchestration** — Reservation lifecycle, state machine, confirmation
6. **Payment Orchestration** — Mercado Pago, webhooks, reconciliation, refunds
7. **Operations Console** — Admin dashboard, agenda, overrides
8. **Guest Experience** — Guest web app, booking flow, tracking
9. **Notifications** — Email, SMS, WhatsApp, in-app
10. **Audit & Governance** — Audit logs, RLS validation, compliance

See `OPERATIONAL-DOMAINS.md` for full definitions of responsibilities, owned entities, allowed/forbidden dependencies, and critical workflows.

---

## 2. SYSTEM BOUNDARIES

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Landing    │  │  Guest App   │  │  Operations Console  │  │
│  │   (Vite)     │  │  (Vite)      │  │  (Vite)              │  │
│  │  Static/SEO  │  │  React Router│  │  React Router        │  │
│  │  (Future:    │  │  TanStack Q  │  │  TanStack Q          │  │
│  │   Next.js)   │  │  Zustand     │  │  Zustand             │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
└─────────┼─────────────────┼─────────────────────┼───────────────┘
          │                 │                     │
          │                 ▼                     │
          │      ┌────────────────────┐           │
          │      │   SUPABASE AUTH    │           │
          │      │  (OAuth / OTP)     │           │
          │      └─────────┬──────────┘           │
          │                │                      │
          ▼                ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (Edge Functions)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Booking    │  │  Payment    │  │  Notifications          │  │
│  │  Orchestr.  │  │  Orchestr.  │  │  (email/SMS/WhatsApp)   │  │
│  │             │  │             │  │                         │  │
│  │  create_hold│  │  preference │  │  send_confirmation      │  │
│  │  confirm    │  │  webhook    │  │  send_reminder          │  │
│  │  cancel     │  │  reconcile  │  │                         │  │
│  │  reschedule │  │  refund     │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Identity   │  │  Inventory  │  │  Reaper / Cron          │  │
│  │  (members)  │  │  (slots)    │  │  (hold expiry, recon)   │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  PostgreSQL 16 + Row Level Security                         ││
│  │  ─────────────────────────────────────────────────────────  ││
│  │  tenants | users | user_tenants | vehicles | routes         ││
│  │  vehicle_slots | booking_holds | bookings | passengers      ││
│  │  payments | payment_events | webhook_deliveries | invoices  ││
│  │  messages | audit_logs | booking_status_changes             ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Storage   │  │  Realtime   │  │      (future)           │  │
│  │  (Images)   │  │ (optional)  │  │  pgvector / AI          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ MercadoPago │  │   Resend    │  │    (future)             │  │
│  │  (Payments) │  │  (Email)    │  │  WhatsApp API           │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. MULTI-TENANT SECURITY

- Isolation is **membership-based**, not claim-based.
- `user_tenants` is the source of truth for who belongs to which tenant and with what role.
- RLS policies query `user_tenants`, not `auth.jwt() ->> 'role'`.
- `service_role` is server-side only. Exposure to frontend is a security incident.
- Super admin impersonation is explicit, scoped, and audited.

See `MULTI-TENANT-SECURITY.md` for full model, RLS patterns, JWT strategy, and anti-patterns.

---

## 4. BOOKING & PAYMENT ORCHESTRATION

### Booking

- State machine governs all transitions.
- `vehicle_slots` are aggregate inventory pools, not ownership records.
- Holds reserve temporary capacity inside `vehicle_slots`.
- Confirmed bookings consume reserved capacity inside `vehicle_slots`.
- Holds expire automatically; reaper releases slots.
- Multiple bookings may reference the same `vehicle_slot` as long as pooled capacity remains available.
- Confirmation requires valid payment or explicit manual override.
- Optimistic locking (`lock_version`) prevents race conditions.
- Idempotency keys prevent duplicate operations.

### Payment

- `payment_events` is the immutable audit ledger.
- `payments` is the current state snapshot.
- Webhooks are tracked in `webhook_deliveries` and processed idempotently.
- Reconciliation job detects drift between our state and Mercado Pago.
- Manual overrides (for business cases such as cash, courtesy, or waived payment) are audited and require reason.

See `BOOKING-ORCHESTRATION.md` and `PAYMENT-ORCHESTRATION.md` for full lifecycle definitions.

---

## 5. DATA FLOW CRITICAL PATHS

### Guest Booking Flow

```
Guest App
  → Browse routes (Catalog, read-only)
  → Query available slots (Inventory, read-only)
  → Create hold (Booking Orchestration, Edge Function)
  → Initiate payment (Payment Orchestration, Edge Function)
  → Redirect to Mercado Pago
  → Webhook received (Payment Orchestration, Edge Function)
  → Confirm booking (Booking Orchestration, triggered by payment)
  → Send confirmation (Notifications)
  → Update agenda (Operations Console, Realtime optional)
```

### Admin Operational Flow

```
Operations Console
  → Login + tenant resolution (Identity & Access)
  → View agenda (Inventory + Booking, read via Edge Function)
  → Assign driver (Booking Orchestration, admin override)
  → Mark complete (Booking Orchestration, state transition)
  → View audit logs (Audit & Governance, read-only)
```

---

## 6. QA GATES

QA is continuous, not a final phase.

- **Lint + Typecheck + Unit Tests** on every PR
- **Integration Tests** for Edge Functions and DB triggers
- **E2E Tests** (Playwright) for critical user journeys
- **Load Tests** (k6) for booking concurrency
- **RLS Audit** for every policy change

See `QA-GATES.md` for phase-specific gates, tooling, coverage targets, and branch protection rules.

---

## 7. RELEASE GOVERNANCE

- **Environments:** local → preview → staging → production
- **Migrations:** forward-only in production
- **Rollback:** application via Vercel rollback; database via point-in-time recovery or compensating forward migration
- **Hotfixes:** fast-track PR, 1 approver, staging validation, production deploy
- **Secrets:** stored in Supabase Vault or Edge Function secrets; never in frontend

See `RELEASE-GOVERNANCE.md` for full environment matrix, deployment checklist, incident response, and runbooks.

---

## 8. OBSERVABILITY

- **Structured logging** with `correlation_id`, `tenant_id`, `booking_id`, `payment_id`
- **Sentry** for error tracking
- **Supabase logs** for database performance
- **Vercel Analytics** for frontend performance
- **Alerts** for failed bookings, payment mismatches, webhook issues, RLS violations, high latency

See `OBSERVABILITY.md` for logging strategy, correlation propagation, alert definitions, dashboards, and runbooks.

---

## 9. SYSTEM INVARIANTS

Immutable rules that govern all implementation:

- No cross-tenant access without membership.
- No confirmed booking without valid capacity.
- No confirmed booking without valid payment or manual override.
- Payment events are append-only.
- Webhook processing is idempotent.
- Capacity cannot become negative.
- All destructive operations are auditable.
- Soft deletes only — no physical deletion of operational data.
- service_role never exposed to frontend.
- Migrations are forward-only in production.

See `SYSTEM-INVARIANTS.md` for complete invariant list and validation checklist.

---

## 10. IMPLEMENTATION PRIORITIES

### Priority 1 (Foundation — Must Have)
- Schema V2 migration
- `user_tenants` and RLS policies
- `vehicle_slots` and `booking_holds`
- Booking state machine
- Mercado Pago webhook handler with idempotency
- Admin login and booking CRUD
- Guest booking flow end-to-end

### Priority 2 (Operational Excellence — Should Have)
- Reconciliation job
- Refund flow
- Manual payment exceptions
- Audit log viewer
- Email notifications
- Load tests and RLS penetration tests

### Priority 3 (Polish — Nice to Have)
- Real-time agenda updates (Supabase Realtime)
- Advanced dashboard KPIs
- WhatsApp notifications
- Performance optimizations (materialized views, caching)

### Out of Scope for V1
- AI recommendations
- Real-time concierge chat
- Split payments / marketplace
- PWA offline capability
- Push notifications
- White-label custom domains
- Automated tenant onboarding

---

## 11. DOCUMENTATION INDEX

| Document | Purpose |
|----------|---------|
| `SYSTEM-INVARIANTS.md` | Immutable system rules |
| `MULTI-TENANT-SECURITY.md` | Tenant isolation, RLS, JWT, membership |
| `BOOKING-ORCHESTRATION.md` | Booking lifecycle, state machine, concurrency |
| `PAYMENT-ORCHESTRATION.md` | MP integration, webhooks, reconciliation |
| `OPERATIONAL-DOMAINS.md` | Bounded contexts, responsibilities, dependencies |
| `RELEASE-GOVERNANCE.md` | Environments, deployments, rollback, incident response |
| `OBSERVABILITY.md` | Logging, alerts, dashboards, runbooks |
| `DATABASE-V2.md` | Schema, indexes, constraints, migrations |
| `QA-GATES.md` | Continuous QA, testing strategy, branch protection |
| `EXECUTION-PLAN-V2.md` | Phases, sprints, deliverables, acceptance criteria |

---

## 12. ARCHITECTURE DECISION RECORDS

### ADR-V2-001: Membership-Based Multi-Tenancy
**Context:** V1 used `users.tenant_id` and JWT claims for isolation. This broke with multi-role users and was insecure.
**Decision:** Authorization flows through `user_tenants`. RLS policies query the membership table.
**Consequences:** More complex policies, but correct and scalable.

### ADR-V2-002: Optimistic Locking on Inventory
**Context:** Concurrent bookings on the same slot require race-condition protection.
**Decision:** `vehicle_slots` uses `lock_version`. Updates are conditional.
**Consequences:** Application must handle conflict errors and retry or offer alternatives.

### ADR-V2-003: Payment Event Ledger
**Context:** V1 had only `payments` table, making reconciliation and audit impossible.
**Decision:** `payment_events` is an append-only ledger. `payments` is a derived current state.
**Consequences:** Higher storage use, but complete audit trail and reconciliation capability.

### ADR-V2-004: Edge Functions for Critical Orchestration
**Context:** Booking and payment flows require transactional safety and external API calls.
**Decision:** All state mutations on bookings, payments, and slots go through Edge Functions or RPC. No direct client writes.
**Consequences:** Frontend is thinner; backend owns all business rules.

---

*Version: 2.0*
*Status: Active*
*Supersedes: ARCHITECTURE-V1.md*
