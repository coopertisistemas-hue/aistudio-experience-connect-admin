# Release v0.3.0 - Backend Foundation

> **Note:** Superseded operationally by [v0.3.1-frontend-ready](./RELEASE-v0.3.1-frontend-ready.md) for frontend phase readiness.

## Metadata
- **Release Name:** Backend Foundation Completion
- **Release Date:** 2026-05-16
- **Version:** v0.3.0-backend-foundation
- **Status:** COMPLETE
- **Phase Readiness:** FRONTEND READY

## Scope
This release marks the completion of the backend core infrastructure for the Dom Pietro Experience platform. It consolidates the architecture freeze, the full Supabase schema implementation, and the exhaustive runtime validation of security and concurrency models.

## Summary
The backend is now fully functional and secure, providing a robust multi-tenant foundation for the upcoming frontend phase (Readdy). All core operational domains (Tenants, Routes, Bookings, Payments, Auditing) are implemented with high-integrity patterns.

## Implementation Details

### Supabase Core (V2 Schema)
- **Tables Implemented (19):**
  - `tenants`, `users`, `user_tenants` (Multi-tenant core — V2 membership model)
  - `drivers`, `vehicles`, `served_lodgings` (Operational resources)
  - `route_categories`, `routes`, `partners` (Product domain)
  - `vehicle_slots` (Inventory pool — no booking_id/hold_id columns)
  - `bookings`, `booking_holds`, `booking_passengers` (Booking domain)
  - `payments`, `payment_events` (Financial domain)
  - `webhook_deliveries`, `audit_logs`, `booking_status_changes` (Observability & Integrity)
- **Key Features:**
  - Optimistic locking via `lock_version` column.
  - Soft delete strategy for sensitive operational data.
  - Append-only ledgers for financial and audit events.
  - Exclusion constraints to prevent vehicle overbooking.
  - Custom RLS via `is_tenant_member()` for secure multi-tenancy.

### Edge Functions
- `create-booking-hold`: Secure hold orchestration.
- `confirm-booking-from-payment`: Mercado Pago payment reconciliation.
- `process-mp-webhook`: Idempotent webhook processing.
- `cancel-booking`: Safe booking termination.
- `expire-booking-hold`: Automated inventory release.
- `reschedule-booking`: Complex booking modification.

### Validation & Testing
- **RLS Validation:** 49/49 security scenarios passed (includes domain table coverage + hardened users/payments policies).
- **Concurrency Test:** 10-worker race condition test completed with zero overbooking.
- **Webhook Test:** 5/5 idempotency and delivery scenarios validated.
- **Observability Test:** 7/7 audit and status change scenarios verified.

### Seed Data
- Full demo seed for "Dom Pietro" tenant.
- Realistic routes, vehicles, and booking history for immediate frontend development.

## Readiness for Readdy
- **Landing Page:** READY (Schema supports route exploration and booking initiation; CORS-enabled Edge Functions).
- **Admin Panel:** READY (Schema supports full resource and tenant management; hardened RLS for operational data).
- **Guest App:** READY (Schema supports booking status tracking and payment; guest-scoped payment visibility enforced).

## Known Limitations
- **Production Environment:** Not yet deployed to hosted Supabase project.
- **Mercado Pago:** Integration currently in Sandbox mode.
- **Load Testing:** Verified for 10 concurrent workers; 100+ worker stress test pending.
- **Operational Boundaries:** `expire-booking-hold` hardened to service_role/internal + admin/operator only.
- **RLS Validation:** Runner now explicitly applies `v2_rls_policies.sql` before test execution.
- **Edge Functions CORS:** Implemented but requires staging validation in real Supabase environment.

## Next Milestone: v0.4.0-frontend-foundation
- Readdy frontend generation (Landing, Admin, Guest).
- Connect Design System implementation.
- Supabase client integration scaffolding.
- Tenant-aware UI shell development.
