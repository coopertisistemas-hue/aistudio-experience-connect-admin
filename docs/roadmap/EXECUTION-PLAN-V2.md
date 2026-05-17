# EXECUTION PLAN V2 — Dom Pietro Experience Connect

> Official execution plan for the Architecture Hardening Sprint and V1 Operational Foundation.
> This document replaces EXECUTION-PLAN-V1 and ROADMAP-V1 as the source of truth for delivery.

---

## EXECUTIVE SUMMARY

V2 reorganizes delivery around **operational domains**, not UI modules. The goal is to build a production-grade SaaS foundation before feature development accelerates.

**Timeline:** 12–14 weeks for a team of 2 senior full-stack engineers.
**Approach:** Backend-first, transactional core stabilizes before frontend implementation.

---

## PHASE ORGANIZATION

| Phase | Name | Duration | Goal |
|-------|------|----------|------|
| 0 | Foundation & Governance | Weeks 1–2 | Repo, CI/CD, schema V2, seed data |
| 1 | Identity & Access | Weeks 2–3 | Auth, memberships, RLS, tenant switching |
| 2 | Catalog & Inventory | Weeks 3–4 | Routes, vehicles, slot model, capacity |
| 3 | Booking Orchestration | Weeks 4–6 | Holds, state machine, confirmation, cancellation |
| 4 | Payment Orchestration | Weeks 6–7 | MP integration, webhooks, idempotency, reconciliation |
| 5 | Operations Console | Weeks 7–9 | Admin dashboard, agenda, booking CRUD, overrides |
| 6 | Guest Experience | Weeks 9–11 | Guest app, booking flow, checkout, tracking |
| 7 | Hardening & Release | Weeks 11–14 | E2E tests, load tests, security audit, production deploy |

---

## PHASE 0 — FOUNDATION & GOVERNANCE

### Deliverables

- [x] Monorepo packages finalized (`packages/ui`, `packages/core`, `packages/config`)
- [x] CI/CD pipeline (GitHub Actions): lint, typecheck, unit tests, build
- [x] Supabase local environment (Docker) with seed data
- [x] DATABASE-V2 schema implemented as migration
- [x] All V2 architecture documents published in `docs/`
- [x] Branch protection enabled on `main`

### Acceptance Criteria

- `pnpm dev` starts all apps concurrently
- `pnpm test:ci` passes with zero failures
- `supabase db reset` produces a consistent local database
- Migration files are forward-only and idempotent
- No TypeScript `any` in committed code

### QA Gates

- Build pipeline green
- Migration execution test passing
- Seed data reproducible

---

## PHASE 1 — IDENTITY & ACCESS

### Deliverables

- [x] `auth.users` + `users` profile sync trigger
- [x] `user_tenants` CRUD (invite, accept, suspend, remove)
- [x] Role resolution per tenant
- [x] Tenant switching API
- [x] RLS policies using `is_tenant_member()` on all tenant-scoped tables
- [ ] Super admin impersonation with audit logging
- [ ] Login/logout in `apps/admin` and `apps/web`

### Acceptance Criteria

- A user can be `guest` in Tenant A and `admin` in Tenant B
- Cross-tenant queries return zero rows for unauthorized users
- Impersonation events appear in `audit_logs`
- JWT does not contain role as top-level claim

### QA Gates

- Cross-tenant access tests (must fail)
- RLS automated tests for SELECT/INSERT/UPDATE/DELETE on every tenant-scoped table
- Unauthorized access tests
- Role escalation tests

### Dependencies

- Phase 0 (schema, CI/CD)

---

## PHASE 2 — CATALOG & INVENTORY

### Deliverables

- [x] Route CRUD (admin)
- [x] Vehicle CRUD (admin)
- [x] `vehicle_slots` generation logic (admin-scheduled or automated)
- [x] Capacity validation queries
- [x] Slot availability API for guest

### Acceptance Criteria

- Admin can create a route with origin, destination, price, duration
- Admin can create a vehicle with capacity
- Slots can be generated for a date range
- Querying available slots for a date returns only slots with `remaining_seats > 0`
- `EXCLUDE USING gist` prevents overlapping inventory windows at DB level

### QA Gates

- Slot conflict tests
- Capacity boundary tests (0 seats, exactly full, over-capacity rejected)
- Invalid inventory state tests

### Dependencies

- Phase 1 (auth, RLS)

---

## PHASE 3 — BOOKING ORCHESTRATION

### Deliverables

- [x] `create_booking_hold` Edge Function
- [x] `confirm_booking_from_payment` RPC
- [x] `cancel_booking` Edge Function
- [x] `reschedule_booking` Edge Function
- [x] `mark_no_show` Edge Function
- [x] Hold expiration reaper (scheduled Edge Function or pg_cron)
- [x] Booking state machine enforcement (trigger or RPC)
- [x] `booking_status_changes` logging
- [x] Optimistic locking on slot operations

### Acceptance Criteria

- Guest can create a hold on an available slot
- Hold expires automatically and releases slot
- Two simultaneous holds on last seat → one succeeds, one fails with conflict
- Confirmed booking has reserved slot
- Cancelled booking releases slot
- Rescheduled booking moves to new slot and releases old
- No invalid state transitions possible

### QA Gates

- Concurrency tests (50 simultaneous reservation attempts on same slot)
- Load tests (100 holds/minute)
- Race condition tests
- Hold expiration tests
- Cancellation tests
- State machine invalid-transition tests

### Dependencies

- Phase 2 (slots, inventory)

---

## PHASE 4 — PAYMENT ORCHESTRATION

### Deliverables

- [ ] `create_payment_preference` Edge Function (Mercado Pago)
- [x] `process_mp_webhook` Edge Function
- [x] `webhook_deliveries` tracking
- [x] `payment_events` ledger writes
- [x] Idempotency on payment creation and webhook processing
- [ ] Reconciliation job (scheduled)
- [ ] `refund_payment` Edge Function
- [x] `record_manual_payment` Edge Function

### Acceptance Criteria

- Guest can initiate payment and receive checkout URL
- Mercado Pago webhook updates payment status and triggers booking confirmation
- Duplicate webhook does not create duplicate payment or double-confirm booking
- Reconciliation job detects and fixes mismatches
- Admin can record manual payment with reason
- Refund initiates MP refund API and updates status

### QA Gates

- Duplicated webhook tests
- Failed payment tests
- Refund tests
- Reconciliation tests
- Idempotency key collision tests

### Dependencies

- Phase 3 (booking confirmation flow)

---

## PHASE 5 — OPERATIONS CONSOLE

### Deliverables

- [ ] Admin login with tenant context
- [ ] Dashboard with KPIs (reservations today, revenue, occupancy)
- [ ] Booking list with filters and search
- [ ] Booking detail view (edit status, assign driver, notes)
- [ ] Agenda VAN view (calendar/grid of slots and bookings)
- [ ] Vehicle and route CRUD
- [ ] Admin override actions (manual confirm, manual payment, cancel with reason)
- [ ] Audit log viewer (read-only)

### Acceptance Criteria

- Operator can complete a full booking workflow without manual DB intervention
- Agenda shows real-time slot occupancy
- Admin override requires reason and is logged
- Cross-tenant data is never visible

### QA Gates

- Admin smoke tests
- Responsive tests (tablet/desktop)
- Operational workflow E2E tests
- RLS tests from admin context

### Dependencies

- Phase 4 (payment flows stable)

---

## PHASE 6 — GUEST EXPERIENCE

### Deliverables

- [ ] Guest login/signup (OTP or OAuth)
- [ ] Browse routes and available slots
- [ ] Create booking hold
- [ ] Checkout redirect to Mercado Pago
- [ ] Booking confirmation page
- [ ] Booking history and status tracking
- [ ] Profile management

### Acceptance Criteria

- Guest can complete a booking end-to-end on mobile
- Payment failure shows clear message and allows retry
- Confirmed booking appears in history with status
- Guest cannot see other tenants' data

### QA Gates

- Mobile device tests (Playwright mobile viewport)
- End-to-end booking flow tests
- Checkout flow tests
- Cross-tenant isolation tests from guest context

### Dependencies

- Phase 5 (admin stable, APIs stable)

---

## PHASE 7 — HARDENING & RELEASE

### Deliverables

- [ ] Playwright E2E test suite covering critical paths
- [ ] k6 load tests (booking concurrency, webhook throughput)
- [ ] RLS penetration tests
- [ ] Performance audit (Lighthouse > 90)
- [ ] Security review (secrets validation, service_role isolation)
- [ ] Production environment provisioning (Vercel + Supabase)
- [ ] Monitoring and alerts active (Sentry, Supabase logs)
- [ ] Runbooks documented
- [ ] Backup restoration drill completed
- [ ] Release notes for V1.0.0

### Acceptance Criteria

- Zero open P1/P2 bugs
- E2E tests pass against staging
- Load test: 50 concurrent bookings, 0% overbooking
- RLS audit: zero leakage across all tables
- Production smoke tests pass
- Rollback procedure validated

### QA Gates

- Staging smoke tests
- Production smoke tests
- Rollback test
- Security audit sign-off
- Performance benchmark report

### Dependencies

- All previous phases

---

## SPRINT CALENDAR (Illustrative)

| Week | Phase | Focus |
|------|-------|-------|
| 1 | 0 | Repo, CI/CD, schema migration V2 |
| 2 | 0–1 | Seed data, auth triggers, memberships |
| 3 | 1–2 | RLS policies, route/vehicle CRUD |
| 4 | 2–3 | Slot generation, hold creation |
| 5 | 3 | State machine, confirmation, cancellation |
| 6 | 3–4 | Reaper, MP preference, webhook handler |
| 7 | 4 | Reconciliation, refund, manual payment |
| 8 | 5 | Admin dashboard, booking list |
| 9 | 5 | Agenda VAN, overrides, audit viewer |
| 10 | 6 | Guest app shell, browse, hold |
| 11 | 6 | Checkout, confirmation, history |
| 12 | 7 | E2E tests, load tests, bug fixes |
| 13 | 7 | Security audit, performance tuning |
| 14 | 7 | Production deploy, monitoring, go-live |

---

## SCOPE BOUNDARIES

### In V1

- Multi-tenant auth and membership
- Transfer booking (origin → destination)
- Vehicle slot scheduling
- Mercado Pago checkout (single payment)
- Admin operations console
- Guest web app (responsive, not PWA)
- Basic landing page (Vite acceptable for MVP; Next.js migration planned for V2)
- Email notifications (transactional)

### Out of V1 (Future Phases)

- AI / route recommendations
- Real-time concierge chat
- Split payments / marketplace MP
- Push notifications
- PWA offline capability
- Advanced financial reports
- Review system
- Partner/commission model
- White-label custom domains
- Automated tenant onboarding (beyond seed script)

---

## RISK MITIGATION

| Risk | Mitigation |
|------|------------|
| Schema migration complexity | Forward-only migrations; staging validation; backup before prod |
| Mercado Pago integration delays | Use MP sandbox from day 1; build mock webhook handler for local dev |
| Booking concurrency bugs | Load tests mandatory before Phase 3 sign-off |
| RLS misconfiguration | Automated RLS tests in CI; penetration test in Phase 7 |
| Scope creep | Feature freeze at Week 10; only bugs and hardening after |

---

## SUCCESS CRITERIA

At the end of Phase 7, the platform must demonstrate:

1. A guest can browse routes, select a slot, pay via Mercado Pago, and receive confirmation.
2. An admin can view the day's agenda, see the booking, assign a driver, and mark completion.
3. Two guests cannot book the same last seat simultaneously.
4. A duplicate webhook does not double-charge or double-confirm.
5. No user can see data from a tenant they do not belong to.
6. All destructive actions are auditable.
7. Deployment to production is reversible within 15 minutes.
