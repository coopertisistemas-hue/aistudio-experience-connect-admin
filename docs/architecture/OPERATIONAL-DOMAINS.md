# OPERATIONAL DOMAINS — Dom Pietro Experience Connect

> Bounded operational domains define ownership, responsibilities, allowed dependencies, and forbidden couplings. Each domain owns its entities and critical workflows.

---

## Domain Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    DOMAINS (Bounded Contexts)                │
├─────────────────────────────────────────────────────────────┤
│  Identity & Access          │  Tenant Management            │
│  Catalog                    │  Inventory & Capacity         │
│  Booking Orchestration      │  Payment Orchestration        │
│  Operations Console         │  Guest Experience             │
│  Notifications              │  Audit & Governance           │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. IDENTITY & ACCESS

### Responsibilities
- Authentication (Supabase Auth)
- User profile management
- Tenant membership (`user_tenants`)
- Role resolution per tenant
- Session and JWT context

### Owned Entities
- `users` (profile extension of `auth.users`)
- `user_tenants`
- `auth.users` (managed by Supabase, referenced only)

### Allowed Dependencies
- `tenants` (read-only for validation)

### Forbidden Dependencies
- Must NOT depend on `bookings`, `payments`, `vehicles`, or any operational domain.
- Must NOT store tenant-specific business logic.

### Critical Workflows
- User signup → profile creation
- Tenant invitation → membership creation
- Role resolution at login

### Audit Requirements
- All membership changes logged
- All role changes logged
- Impersonation events logged

---

## 2. TENANT MANAGEMENT

### Responsibilities
- Tenant provisioning and configuration
- Tenant-level settings and branding
- Tenant status lifecycle (active, inactive, suspended)
- Billing configuration (future)

### Owned Entities
- `tenants`
- `tenant_settings` (future)
- `tenant_billing` (future)

### Allowed Dependencies
- None (root domain)

### Forbidden Dependencies
- Must NOT depend on `bookings`, `users` (beyond FK existence)
- Must NOT contain operational logic

### Critical Workflows
- Tenant onboarding
- Tenant suspension (cascade to operational domains)

### Audit Requirements
- All tenant status changes logged

---

## 3. CATALOG

### Responsibilities
- Route definitions
- Experience definitions (future)
- Pricing rules (base price)
- Availability windows (future)

### Owned Entities
- `routes`
- `experiences` (future)
- `experience_schedules` (future)

### Allowed Dependencies
- `tenants` (FK)

### Forbidden Dependencies
- Must NOT depend on `bookings`, `payments`, `vehicles`
- Catalog is read-heavy; writes are admin-only

### Critical Workflows
- CRUD routes (admin)
- Route activation/deactivation

### Audit Requirements
- Route price changes logged
- Route status changes logged

---

## 4. INVENTORY & CAPACITY

### Responsibilities
- Vehicle fleet management
- Vehicle slot generation as aggregate inventory windows
- Capacity tracking per slot pool
- Hold lifecycle management

### Owned Entities
- `vehicles`
- `vehicle_slots`
- `booking_holds`

### Allowed Dependencies
- `tenants` (FK)
- `bookings` (FK reference only, not business logic)

### Forbidden Dependencies
- Must NOT depend on `payments`
- Must NOT depend on `users` (except for `driver_id` assignment, which is operational, not identity)

### Critical Workflows
- Slot creation (admin or scheduled)
- Hold creation (booking orchestration requests temporary seats)
- Hold expiration (automated)
- Reserved capacity release (on cancellation) and held capacity release (on hold expiry)

### Audit Requirements
- Slot reservation changes logged
- Hold creation/expiry logged

---

## 5. BOOKING ORCHESTRATION

### Responsibilities
- Booking lifecycle state machine
- Hold coordination with Inventory
- Payment coordination with Payment Orchestration
- Confirmation, cancellation, reschedule, no-show
- Capacity validation before confirmation

### Owned Entities
- `bookings`
- `passengers`
- `booking_status_changes` (audit)
- `booking_holds` (co-owned with Inventory)

### Allowed Dependencies
- `tenants` (FK)
- `users` (guest reference)
- `routes` (catalog reference)
- `vehicles` (inventory reference)
- `vehicle_slots` (inventory, for reservation)
- `vehicle_slots` (inventory pool reference, for capacity reservation)
- `payments` (read-only state reference for confirmation rules)

### Forbidden Dependencies
- Must NOT write directly to `payment_events`
- Must NOT call Mercado Pago APIs directly
- Must NOT modify `auth.users`

### Critical Workflows
- Create booking hold
- Confirm booking (after payment or manual override)
- Cancel booking (release slot, trigger refund request)
- Reschedule booking (release old slot, reserve new slot)
- Mark no-show

### Audit Requirements
- Every status change recorded
- Every slot reservation/release recorded
- Every passenger modification recorded

---

## 6. PAYMENT ORCHESTRATION

### Responsibilities
- Payment creation and preference generation
- Mercado Pago webhook ingestion
- Payment event ledger (`payment_events`)
- Reconciliation
- Refund initiation
- Manual payment exception handling

### Owned Entities
- `payments`
- `payment_events`
- `webhook_deliveries`
- `refunds` (future)

### Allowed Dependencies
- `tenants` (FK)
- `bookings` (FK, read-only for context)
- `users` (payer reference)

### Forbidden Dependencies
- Must NOT modify `bookings.status` directly (must call Booking Orchestration RPC)
- Must NOT modify `vehicle_slots`
- Must NOT access `auth.users` beyond FK reference

### Critical Workflows
- Create payment preference
- Process webhook (idempotent)
- Record payment event
- Reconcile payment state against events
- Initiate refund

### Audit Requirements
- Every webhook payload stored
- Every payment event stored
- Every reconciliation run logged

---

## 7. OPERATIONS CONSOLE

### Responsibilities
- Admin dashboard and CRUD operations
- Agenda visualization
- Booking management (admin overrides)
- Fleet and route management UI
- Reporting (basic)

### Owned Entities
- None (UI domain only)

### Allowed Dependencies
- All backend domains via authorized APIs

### Forbidden Dependencies
- Must NOT bypass Edge Functions/RPC to write directly to DB
- Must NOT use service_role key
- Must NOT expose super_admin impersonation without explicit audit

### Critical Workflows
- Admin login with tenant context
- Booking override (with audit reason)
- Slot manual assignment

### Audit Requirements
- All admin actions logged via `audit_logs`

---

## 8. GUEST EXPERIENCE

### Responsibilities
- Guest-facing web app
- Booking flow UX
- Payment checkout redirect
- Booking status tracking
- Profile management

### Owned Entities
- None (UI domain only)

### Allowed Dependencies
- Catalog (read routes)
- Inventory (read available slots)
- Booking Orchestration (create holds, create bookings)
- Payment Orchestration (initiate payments)
- Identity & Access (auth, profile)

### Forbidden Dependencies
- Must NOT write directly to `bookings` without idempotency key
- Must NOT write directly to `payments`
- Must NOT access `vehicle_slots` directly for writes
- Must NOT access admin-only data

### Critical Workflows
- Browse routes
- Select date/slot
- Create hold
- Initiate payment
- Receive confirmation

---

## 9. NOTIFICATIONS

### Responsibilities
- Email, SMS, WhatsApp, and in-app notifications
- Template management
- Delivery tracking
- Notification preferences

### Owned Entities
- `messages` (in-app)
- `notification_deliveries` (future)
- `notification_templates` (future)

### Allowed Dependencies
- `tenants` (FK)
- `users` (recipient)
- `bookings` (context)

### Forbidden Dependencies
- Must NOT trigger payments
- Must NOT modify booking state

### Critical Workflows
- Send booking confirmation
- Send payment receipt
- Send reminder

---

## 10. AUDIT & GOVERNANCE

### Responsibilities
- Centralized audit logging
- RLS policy validation
- Compliance reporting
- Data retention enforcement

### Owned Entities
- `audit_logs`
- `rls_audit_results` (future)

### Allowed Dependencies
- None (all domains write to it)

### Forbidden Dependencies
- Must NOT depend on operational logic
- Must NOT be modifiable by operational domains

### Critical Workflows
- Record every destructive operation
- Periodic RLS audit
- Retention policy application

---

## CROSS-DOMAIN RULES

### Rule 1: No Circular Dependencies
If Domain A depends on Domain B, Domain B must not depend on Domain A. Example: Payment Orchestration reads `bookings`, but Booking Orchestration does not directly call Payment Orchestration APIs; instead, it reacts to payment state changes via events or RPC returns.

### Rule 2: UI Domains Are Stateless
`Operations Console` and `Guest Experience` are pure presentation domains. They never own entities. All state mutations go through Edge Functions or RPC.

### Rule 3: Financial Domain Is Isolated
`Payment Orchestration` is the only domain allowed to interact with Mercado Pago. No other domain may call payment provider APIs.

### Rule 4: Inventory Is Protected
`Inventory & Capacity` is the only domain that may mutate pooled inventory counters on `vehicle_slots`. Booking Orchestration requests holds and confirmations via explicit RPC, but `held_seats`, `reserved_seats`, and `remaining_seats` mutations are owned by Inventory.
