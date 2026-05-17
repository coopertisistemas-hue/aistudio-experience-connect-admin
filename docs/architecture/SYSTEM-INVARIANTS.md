# SYSTEM INVARIANTS — Dom Pietro Experience Connect

> Immutable system rules. These invariants are non-negotiable architectural constraints that every implementation, migration, policy, and Edge Function must obey.
> Violation of any invariant is a P0 incident.

---

## 1. TENANT ISOLATION

### INV-T1: No Cross-Tenant Data Access
No query, policy, RPC, Edge Function, or service_role script may return data belonging to a tenant other than the one explicitly authorized in the current request context.

### INV-T2: Tenant Context Must Be Explicit
All tenant-scoped operations must carry an explicit `tenant_id`. There is no "default tenant" fallback in production code.

### INV-T3: Membership Verification Is Mandatory
Access to any tenant-scoped resource must be validated against `user_tenants` (membership table), not inferred from a JWT claim or a single `users.tenant_id` field.

---

## 2. BOOKING CAPACITY & OVERBOOKING

### INV-B1: Capacity Cannot Become Negative
`vehicle.capacity`, `slot.remaining_seats`, and any inventory counter must never decrement below zero. All decrement operations must be guarded by `CHECK` constraints or conditional updates.

### INV-B2: No Confirmed Booking Without Reserved Capacity
A booking may only transition to `confirmed` if a corresponding `vehicle_slot` or `booking_hold` record exists and is active for the requested period.

### INV-B3: vehicle_slots Are Inventory Pools, Not Ownership Records
A `vehicle_slot` represents the inventory pool for a single vehicle and a single time window. It does not own a single booking or hold. Multiple bookings and multiple holds may reference the same `vehicle_slot` as long as pooled capacity remains valid.

### INV-B4: No Overlapping Inventory Windows for the Same Vehicle
For a given `vehicle_id`, overlapping inventory windows in active operational states are forbidden. The guarantee must be enforced by a PostgreSQL `EXCLUDE USING gist` constraint on `vehicle_id` and `tstzrange(slot_start, slot_end)`, or equivalent overlap-prevention mechanism.

### INV-B5: Held + Reserved Capacity Cannot Exceed Total Capacity
For every active `vehicle_slot`:

`held_seats + reserved_seats <= total_capacity`

and

`remaining_seats = total_capacity - held_seats - reserved_seats`

These rules must be enforced by database constraints plus conditional transactional updates.

### INV-B6: Hold Expiration Is Automatic
A `booking_hold` with `expires_at < now()` is invalid. Expired holds must not be honored for booking confirmation. A background job or Edge Function must reap expired holds and release slots.

### INV-B7: Scheduled End Must Follow Start
`bookings.scheduled_end_at` must be strictly greater than `bookings.scheduled_at`. This is enforced by a database `CHECK` constraint.

---

## 3. PAYMENT CONSISTENCY

### INV-P1: No Confirmed Booking Without Valid Payment State
A booking may only become `confirmed` if:
- A `payment` record exists with `status = 'completed'`, OR
- A manual override exists: `payments.provider = 'manual'` with `status = 'completed'`, documented via `payment_events.event_type = 'manual_override'`, and auditable with `manual_override_reason`, `manual_override_by`, and `manual_override_at`.

### INV-P2: Payment Events Are Append-Only
The `payment_events` table is an immutable ledger. Rows are never updated or deleted. Corrections are made by inserting new events.

### INV-P3: Webhook Processing Must Be Idempotent
Processing the same Mercado Pago webhook event twice must not create duplicate `payment` records, duplicate `payment_events`, or transition a booking state twice.

### INV-P4: Webhook Deliveries Are Tracked
Every incoming webhook payload must be recorded in `webhook_deliveries` before processing logic begins.

### INV-P5: Invalid Webhook Signatures Are Rejected
If webhook signature validation fails, the request is untrusted and must return HTTP `400`. The failed delivery must be logged for audit and alerting.

### INV-P6: Duplicate Valid Webhooks Are Acknowledged
If a valid webhook is a replay of an already recorded event, the handler must return HTTP `200` without reprocessing side effects.

### INV-P7: Processing Failures Must Be Retryable
If a webhook payload is valid but internal processing fails after acceptance, the handler must return HTTP `500` so the provider retries delivery.

### INV-P8: Reconciliation Is Periodic and Auditable
A scheduled reconciliation process must compare `payments` state against `payment_events` ledger. Mismatches must trigger alerts.

---

## 4. STATE MACHINE INTEGRITY

### INV-S1: Booking State Transitions Are Controlled
Only the following transitions are legal for `bookings.status`:
- `draft` → `hold_created`
- `hold_created` → `payment_pending`
- `payment_pending` → `confirmed` (on payment completion)
- `payment_pending` → `cancelled` (on timeout or user action)
- `confirmed` → `in_progress`
- `in_progress` → `completed`
- `confirmed` → `cancelled` (with compensation)
- `confirmed` → `no_show`
- `cancelled` → `refunded` (if payment was completed)
- Any state → `cancelled` (admin override, audited)

A `cancelled` booking cannot return to `confirmed` without a new booking flow (new hold + new payment).

### INV-S2: State Changes Require Audit
Every `UPDATE` to `bookings.status` must insert a row into `booking_status_changes` (or equivalent audit table) recording old state, new state, actor, timestamp, and reason.

---

## 5. AUDITABILITY

### INV-A1: All Destructive Operations Are Auditable
Any `DELETE`, `UPDATE` that changes financial or operational data, or `INSERT` into critical tables, must write to `audit_logs`.

### INV-A2: Soft Deletes Only
No `DELETE` statement may be issued directly against operational tables (`bookings`, `payments`, `invoices`, `users`, `vehicles`, `routes`). All deletions must be soft deletes (`deleted_at = now()`).

Operational tables must use `ON DELETE RESTRICT` on tenant-scoped foreign keys to prevent destructive cascade deletion. `ON DELETE CASCADE` is permitted only on junction tables (e.g., `user_tenants`) or tightly coupled child records where archival is not required (e.g., `passengers` to `bookings`).

### INV-A3: Audit Logs Cannot Be Modified
The `audit_logs` table must be append-only. No `UPDATE` or `DELETE` policies should exist on it. Writes should ideally happen via trigger or SECURITY DEFINER function.

---

## 6. SERVICE_ROLE & ADMIN BOUNDARIES

### INV-R1: service_role Must Never Be Exposed to Frontend
The `service_role` key must only exist in server-side environments (Edge Functions, CI/CD, admin scripts). Any leak of `service_role` to a browser or mobile bundle is a security incident.

### INV-R2: Admin Impersonation Is Explicit and Audited
When a super_admin or admin views data as another tenant, the action must be logged with:
- `impersonator_id`
- `target_tenant_id`
- `reason`
- `timestamp`

### INV-R3: RLS Cannot Be Disabled to Fix Bugs
If a query fails due to RLS, the fix is correcting the policy or the membership context — never disabling RLS on the table.

---

## 7. DATA INTEGRITY

### INV-D1: Optimistic Locking on Concurrent Edits
Tables subject to concurrent edits (`bookings`, `payments`, `vehicle_slots`) must use `lock_version` (integer, default 0, incremented on every update). Updates with stale `lock_version` must be rejected.

### INV-D2: Idempotency Keys Are Mandatory for Critical RPCs
Any RPC or Edge Function that creates a booking, payment, or hold must accept an `idempotency_key` (UUID v4, client-generated). The server must reject duplicate keys within a 24-hour window.

### INV-D3: Foreign Keys Must Preserve Referential Integrity
All foreign keys must declare explicit `ON DELETE` behavior. Operational tables must prefer `ON DELETE RESTRICT` on `tenant_id` references to enforce soft-delete semantics and prevent accidental data loss. `ON DELETE CASCADE` is restricted to junction tables and non-audited child records.

---

## 8. RELEASE SAFETY

### INV-REL1: Migrations Are Forward-Only in Production
No `DOWN` migration may be run in production. Rollback is performed by restoring from backup or applying a compensating forward migration.

### INV-REL2: Schema Changes Require Staging Validation
Any migration that adds a constraint, drops a column, or modifies an enum must pass through staging and be validated against the full test suite before production deployment.

### INV-REL3: No Deployment Without Passing QA Gates
Code that has not passed lint, typecheck, unit tests, and RLS audit cannot be deployed to production.

---

## INVARIANT VALIDATION CHECKLIST

Before any release, verify:

- [ ] All RLS policies respect INV-T1 through INV-T3
- [ ] All inventory decrement operations respect INV-B1 through INV-B4
- [ ] All payment flows respect INV-P1 through INV-P5
- [ ] All booking state transitions respect INV-S1 and INV-S2
- [ ] All deletes are soft deletes (INV-A2)
- [ ] service_role is not present in frontend bundles (INV-R1)
- [ ] All critical RPCs accept idempotency_key (INV-D2)
- [ ] All migrations are forward-only in prod (INV-REL1)
