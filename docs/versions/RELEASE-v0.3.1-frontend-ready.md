# Release v0.3.1 - Frontend Ready

## Metadata
- **Release Name:** Frontend Contracts Stabilization
- **Release Date:** 2026-05-16
- **Version:** v0.3.1-frontend-ready
- **Status:** COMPLETE
- **Phase Readiness:** APPROVED FOR READDY
- **Production Status:** NOT READY

## Summary
This release marks the final stabilization of backend contracts before the frontend phase begins. It follows a micro-patch sprint focused on hardening operational boundaries and ensuring that security validation (RLS) is fully auditable and aligned with production-grade migrations.

## Scope
Consolidation of final backend hardening, stabilization of database schemas for frontend generation, and validation of the entire core operational flow.

## Implementation Details & Fixes
- **Edge Function Boundary Hardening:** The `expire-booking-hold` function was updated to strictly validate `service_role` keys or check user memberships for `admin`/`operator` roles, preventing unauthorized inventory manipulation.
- **Auditable RLS Runner:** `scripts/test-rls.sh` was refactored to initialize a fresh local PostgreSQL instance, apply real project migrations (Schema V2, Functions, RLS Policies), and then execute the test suite. This ensures the 100% pass rate is validated against the actual codebase.
- **Schema Stability:** Verified all 17+ tables against Readdy requirements (Tenant awareness, inventory locking, ledger consistency).

## Validation Results
- **RLS Security:** 49/49 scenarios passing (Isolation, Permissions, Append-only protection).
- **Webhook Validation:** 5/5 idempotency and delivery scenarios passing.
- **Observability Validation:** 7/7 audit logging and state change scenarios verified.
- **Runtime Hardening:** All critical paths (Booking, Payment, Inventory) validated.

## Readiness for Readdy
- **Landing Page:** APPROVED.
- **Admin Panel:** APPROVED (Operational contracts stable).
- **Guest App:** APPROVED (Checkout and tracking flows stable).

## Known Limitations
- **Environment:** Staging CORS validation still required for browser-based Edge Function calls.
- **Mercado Pago:** Sandbox webhook validation pending (manual test completed, production-like automation pending).
- **Scalability:** 100+ concurrent worker load test pending.

## Recommended Commands

### Commit
```bash
git add .
git commit -m "chore: prepare frontend-ready release v0.3.1" -m "Consolidates final backend hardening, auditable RLS validation, Edge Function boundary fixes, and release documentation for Readdy frontend readiness."
```

### Tag
```bash
git tag -a v0.3.1-frontend-ready -m "Frontend contracts stabilized and approved for Readdy"
```

## Next Milestone: v0.4.0-frontend-foundation
- Connect Design System implementation.
- Tenant-aware frontend shell.
- Supabase integration scaffolding.
