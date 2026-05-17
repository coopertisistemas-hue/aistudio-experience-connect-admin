# QA-GATES.md — Dom Pietro Experience Connect

> Continuous QA governance for the Connect ecosystem.
> QA is NOT a final phase. QA is a continuous governance process integrated into every development phase.

---

## PURPOSE

Ensure that:

- No unstable code reaches production
- No unsafe architecture is merged
- No multi-tenant leakage occurs
- No overbooking scenario becomes possible
- All critical flows are validated continuously
- The platform evolves with enterprise-grade reliability

---

## CORE PRINCIPLES

### 1. Continuous Validation
Every phase must validate its own integrity before progressing.

### 2. Zero Trust
Never assume:
- RLS works
- Payments reconcile correctly
- Booking concurrency is safe
- Tenant isolation is correct

Everything must be tested explicitly.

### 3. Production-Oriented QA
All tests must reflect real operational conditions.

### 4. Critical Flow Protection
The following flows are mission-critical and require mandatory validation gates:

- Tenant isolation
- Booking orchestration
- Vehicle capacity control
- Payment orchestration
- Webhook processing
- Reservation confirmation

### 5. No Merge Without Validation
No pull request may be merged without:

- Lint clean
- Typecheck clean
- Tests passing
- Review approval
- CI passing

---

## QA GOVERNANCE MODEL

### Layer 1 — Developer Validation
Performed before commit.

Required:
- `pnpm lint` clean
- `pnpm typecheck` clean
- Unit tests for changed code passing
- Local Supabase tests passing

### Layer 2 — CI/CD Validation
Performed automatically on pull requests.

**Tools:**
- **GitHub Actions** for CI orchestration
- **Vitest** for unit and integration tests
- **Playwright** for E2E tests
- **Supabase CLI** (`supabase test db`) for database tests
- **k6** for load tests (triggered manually or nightly)

**Pipeline:**
```
PR opened
  → Lint (ESLint + Prettier)
  → Typecheck (TypeScript strict)
  → Unit Tests (Vitest, coverage > 70%)
  → Integration Tests (Supabase local, Edge Functions)
  → Build (all apps)
  → Deploy Preview (Vercel)
  → E2E Smoke Tests (Playwright against preview)
```

### Layer 3 — Architecture Review
Performed on critical infrastructure changes.

Triggers:
- New RLS policy
- New migration
- New Edge Function on critical path
- Changes to `user_tenants`, `bookings`, `payments`, `vehicle_slots`

Required:
- Security review by senior engineer
- Schema diff review
- RLS audit script run

### Layer 4 — Operational Validation
Performed on staging environment.

Required:
- Smoke tests (automated + manual)
- Concurrency tests
- Webhook idempotency tests
- RLS penetration tests

### Layer 5 — Production Hardening
Performed before release.

Required:
- Full E2E suite passing
- Load tests passing
- Security checklist complete
- Rollback procedure validated
- Monitoring and alerts active

---

## CONCRETE TOOLING STACK

| Purpose | Tool | Configuration |
|---------|------|---------------|
| Unit / Integration Tests | Vitest | `vitest.config.ts` in each package/app |
| E2E Tests | Playwright | `playwright.config.ts` at repo root |
| Load / Concurrency Tests | k6 | `tests/load/` directory |
| Lint | ESLint (flat config) | `packages/config/eslint/` |
| Format | Prettier | Root `package.json` config |
| Typecheck | TypeScript strict | `tsconfig.json` strict mode |
| CI/CD | GitHub Actions | `.github/workflows/ci.yml` |
| DB Testing | Supabase CLI + `pgTAP` (optional) | `supabase test db` |
| Coverage | Vitest + c8 | Report in CI artifacts |

### Coverage Targets

| Test Type | Minimum Coverage | Critical Paths |
|-----------|------------------|----------------|
| Unit tests | 70% | 100% for state transitions, utilities |
| Integration tests | 60% | 100% for booking hold, payment webhook, RLS |
| E2E tests | N/A (path-based) | 100% for guest booking flow, admin workflow |

---

## GLOBAL QUALITY RULES

### Code Quality
- TypeScript strict mode enabled
- `no any` allowed (enforced by ESLint)
- ESLint clean (zero warnings in CI)
- Prettier enforced (pre-commit hook)
- No dead code
- No duplicated logic
- No inline business rules in UI components

### Security
- All tenant-scoped tables must use RLS
- No direct `service_role` exposure in frontend
- No cross-tenant queries without explicit audit
- Secrets must never be stored in plain text
- No `auth.jwt() ->> 'role'` in policies

### Architecture
- Transactional logic must stay server-side (Edge Functions / RPC)
- Booking orchestration must not run in frontend
- Payment confirmation must be idempotent
- Critical operations must be auditable

### UX
- Loading states mandatory
- Empty states mandatory
- Error handling mandatory
- Mobile-first mandatory
- Responsive validation mandatory

---

## PHASE QA GATES

### PHASE 0 — FOUNDATION & GOVERNANCE

#### Required Validation

**Monorepo**
- Packages resolve correctly
- Shared configs work
- Turbo cache works
- PNPM workspace stable

**CI/CD**
- Lint pipeline works
- Typecheck pipeline works
- Build pipeline works
- Preview deploy works

**Environment**
- Env validation implemented (`zod` schema)
- Staging env configured
- Production env configured

**Supabase**
- Migrations execute successfully
- Rollback validated (restore from backup)
- Seed consistency validated

#### Mandatory Tests
- Build tests (all apps)
- Lint tests
- Typecheck tests
- Migration execution tests (`supabase db reset`)

#### Acceptance Criteria
- All apps build successfully
- No TypeScript errors
- No ESLint errors
- Migrations reproducible
- Seed data deterministic

---

### PHASE 1 — IDENTITY & ACCESS

#### Required Validation

**Multi-Tenant**
- Tenant isolation validated
- Membership validation validated
- Role hierarchy validated
- Impersonation rules validated

**RLS**
- SELECT policies validated for all tenant-scoped tables
- INSERT policies validated
- UPDATE policies validated
- DELETE policies validated (should be soft-delete only)

**JWT**
- Claims do not contain role as top-level claim
- Session validation works
- Role resolution queries `user_tenants`

#### Mandatory Tests
- Cross-tenant access tests (must return empty or 403)
- Unauthorized access tests (anonymous → 401)
- Role escalation tests (guest trying admin action → 403)
- RLS automated tests (one per tenant-scoped table)

#### Acceptance Criteria
- Zero tenant leakage across all tables
- Zero unauthorized access to admin operations
- RLS validated for 100% of tenant-scoped tables
- Impersonation events logged in `audit_logs`

---

### PHASE 2 — CATALOG & INVENTORY

#### Required Validation

**Inventory**
- Vehicle capacity consistency (`capacity > 0`)
- Schedule consistency (`slot_end > slot_start`)
- Slot integrity (no overlaps for reserved slots)
- Inventory reconciliation (`remaining_seats` math correct)

**Catalog**
- Route consistency (active/inactive)
- Price validation (`base_price >= 0`)
- Operational availability (slots generated correctly)

#### Mandatory Tests
- Slot conflict tests (two reservations on same slot)
- Capacity boundary tests (0, 1, max, max+1)
- Invalid inventory state tests (negative remaining_seats)

#### Acceptance Criteria
- Inventory consistency guaranteed by DB constraints
- No invalid capacity states possible
- Overlap index prevents double reservation

---

### PHASE 3 — BOOKING ORCHESTRATION

> **Critical Phase.** Highest operational risk.

#### Required Validation

**Booking Flow**
- Hold creation works
- Hold expiration works (reaper)
- Booking confirmation works
- Cancellation works
- Reschedule works
- No-show flow works

**Concurrency**
- Simultaneous reservations handled correctly
- Race condition handling (one wins, one fails)
- Lock consistency (optimistic locking)
- Transactional integrity (hold + slot update atomic)

**State Machine**
- Invalid transitions blocked (e.g., cancelled → confirmed)
- Timeout handling validated (payment_pending → cancelled)
- Rollback logic validated (payment succeeds, slot lost)

#### Mandatory Tests
- Concurrency tests: 50 simultaneous reservation attempts on last seat
- Load tests: 100 holds/minute sustained
- Race condition tests: automated script hitting same slot
- Hold expiration tests: verify reaper releases slot and cancels booking
- Cancellation tests: slot released, audit logged
- State machine tests: every invalid transition attempted and blocked

#### Acceptance Criteria
- Zero overbooking (0% in load tests)
- Zero race-condition inconsistency
- Booking states always valid (no illegal transitions in DB)
- Expired holds always release slots within 10 minutes

---

### PHASE 4 — PAYMENT ORCHESTRATION

#### Required Validation

**Mercado Pago**
- Checkout consistency (preference → URL)
- Webhook validation (signature or idempotency)
- Idempotency validation (duplicate webhooks ignored)
- Reconciliation validation (mismatches detected and fixed)

**Financial Integrity**
- Payment consistency (payments matches payment_events)
- Refund consistency (refund triggers MP API + status update)
- Failed payment recovery (booking cancelled, slot released)
- Duplicate event protection (webhook_deliveries uniqueness)

#### Mandatory Tests
- Duplicated webhook tests: send same payload twice, verify single processing
- Failed payment tests: MP rejects, booking cancels
- Refund tests: refund initiated, status updated, event logged
- Reconciliation tests: manual mismatch injection, verify detection
- Idempotency key tests: duplicate payment creation rejected

#### Acceptance Criteria
- No duplicated payment processing
- No booking/payment inconsistency after reconciliation
- All webhooks idempotent (replay-safe)
- Manual payments require audit reason

---

### PHASE 5 — OPERATIONS CONSOLE

#### Required Validation

**Admin Operations**
- Reservation management (CRUD, status changes)
- Operational workflows (assign driver, mark no-show)
- Agenda visibility (real-time slot occupancy)
- Dashboard consistency (KPIs match DB state)

**UX**
- Responsive admin validation (tablet + desktop)
- Operational usability (workflow completion time < 2 minutes)
- Fast interaction flows (page load < 2s, API response < 500ms)

#### Mandatory Tests
- Admin smoke tests (login → view bookings → cancel booking)
- Responsive tests (Playwright at 1280x720 and 768x1024)
- Operational workflow E2E tests

#### Acceptance Criteria
- Operators can complete core workflows without manual DB intervention
- All admin actions are logged in `audit_logs`
- Cross-tenant data is never visible in admin UI

---

### PHASE 6 — GUEST EXPERIENCE

#### Required Validation

**Booking UX**
- Mobile flow (viewport 375x812)
- Checkout flow (redirect to MP and back)
- Confirmation flow (email/notification)
- Validation feedback (clear error messages)

**Performance**
- Page load < 3s on mobile (Lighthouse)
- API response time p95 < 1s
- Responsive layout (no horizontal scroll)

#### Mandatory Tests
- Mobile device tests (Playwright mobile emulation)
- End-to-end booking tests (browse → hold → pay → confirm)
- Checkout tests (MP redirect flow)

#### Acceptance Criteria
- Complete booking flow works on mobile devices
- Booking confirmation reliable (99.9% success rate in tests)
- Guest cannot access admin data or other tenants' data

---

### PHASE 7 — HARDENING & RELEASE

#### Required Validation

**Security**
- Penetration review (RLS, auth, secrets)
- RLS audit (automated script: cross-tenant query attempts)
- Secret validation (no service_role in frontend bundles)

**Performance**
- Load tests (k6: 50 concurrent bookings)
- Stress tests (k6: 200 req/s for 5 minutes)
- Query analysis (pg_stat_statements review)

**Infrastructure**
- Backups validated (restore drill)
- Rollback validated (Vercel rollback + DB point-in-time)
- Deployment validation (smoke tests on production)

#### Mandatory Tests
- Staging smoke tests (automated Playwright)
- Production smoke tests (manual + automated)
- Rollback tests (simulate bad deploy, verify recovery)
- Security scan (dependencies, secrets leak detection)

#### Acceptance Criteria
- Production deployment approved by at least 2 engineers
- Rollback validated and documented
- Monitoring active (Sentry, Supabase logs, alerts)
- All P1 alerts have runbooks
- Zero open P1/P2 bugs

---

## TEST TYPES & RESPONSIBILITIES

### Unit Tests (Vitest)
Required for:
- Utilities and helpers
- Business rules and state transition logic
- Zod schema validations
- Date/currency formatting

Target: > 70% coverage

### Integration Tests (Vitest + Supabase local)
Required for:
- Edge Functions
- Supabase flows (RPC, triggers)
- Booking orchestration (hold → confirm)
- Payments (webhook simulation)

Target: > 60% coverage, 100% for critical paths

### End-to-End Tests (Playwright)
Required for:
- Guest booking flow
- Admin workflow
- Checkout redirect flow

Target: 100% coverage of critical user journeys

### Load / Concurrency Tests (k6)
Required for:
- Booking concurrency (same slot)
- Webhook processing throughput
- Agenda query load

Target:
- 50 concurrent bookings → 0 overbooking
- 100 webhooks/minute → all processed, 0 duplicates
- API p95 latency < 2s under load

### RLS Audit Tests (Custom script)
Required for:
- Every tenant-scoped table

Target: Zero cross-tenant data leakage

---

## BRANCH PROTECTION RULES

### Pull Requests
- Minimum 1 approval (approver cannot be author)
- CI passing required (lint, typecheck, unit tests, build)
- No direct push to `main`

### Merge Conditions
- Lint passing
- Typecheck passing
- Unit tests passing
- Build passing
- E2E smoke tests passing (for PRs touching critical paths)
- Migration review completed (for PRs with migrations)
- RLS review completed (for PRs with policy changes)

---

## RELEASE GOVERNANCE

### Required Before Production

**Database**
- Migration review completed
- Rollback strategy documented
- Schema diff between staging and production reviewed

**Infrastructure**
- Secrets validated
- Monitoring validated (alerts firing in test)
- Backups validated (restore tested this month)

**Operational**
- Smoke tests passed
- Payment flow validated end-to-end in staging
- Booking flow validated end-to-end in staging
- RLS audit passed

---

## OBSERVABILITY REQUIREMENTS

### Mandatory Monitoring

**Booking**
- Booking failures (Sentry + log alert)
- Overbooking attempts (log alert → P1)
- Failed holds (log alert)

**Payments**
- Failed payments (log alert)
- Duplicated webhooks (log alert)
- Reconciliation failures (log alert → P1)

**Security**
- Unauthorized access attempts (log alert)
- Tenant violations (log alert → P2)
- RLS violations (log alert → P2)

**Infrastructure**
- Deployment failures (CI alert)
- API latency p95 > 2s (metric alert)
- Database latency > 500ms (metric alert)

---

## FAILURE POLICY

Any critical QA failure blocks release.

Critical failures include:
- Tenant leakage
- Overbooking possibility
- Payment inconsistency
- Failed rollback
- Failed migrations
- Broken RLS
- Duplicated payment processing
- Service_role exposure in frontend

---

## CONNECT ENTERPRISE STANDARD

The platform must never prioritize:
- Speed over consistency
- Features over operational integrity
- UI over transactional safety

The foundation must always be:
- Secure
- Scalable
- Auditable
- Maintainable
- Operationally reliable

before advanced features are introduced.
