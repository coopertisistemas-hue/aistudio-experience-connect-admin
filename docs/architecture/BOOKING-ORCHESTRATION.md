# BOOKING ORCHESTRATION — Dom Pietro Experience Connect

> Complete transactional reservation lifecycle. Booking is the most critical operational domain. It must be concurrency-safe, state-machine-governed, and failure-resilient.

---

## 1. BOOKING STATE MACHINE

### States

```
          ┌─────────────────────────────────────────────────────────────┐
          │                                                             │
          ▼                                                             │
    ┌──────────┐    create_hold    ┌──────────────┐                     │
    │  draft   │ ─────────────────►│ hold_created │                     │
    └──────────┘                   └──────┬───────┘                     │
                                          │                             │
                    payment_initiated     │      hold_expired           │
                                          ▼                             │
                                   ┌──────────────┐                     │
                                   │payment_pending│ ◄──────────────────┤
                                   └──────┬───────┘    retry_payment    │
                                          │                             │
                    payment_completed     │      payment_failed         │
                    or manual_override    ▼                             │
                                   ┌──────────────┐                     │
                                   │   confirmed  │                     │
                                   └──────┬───────┘                     │
                                          │                             │
                         start_service    │      admin_cancel           │
                                          ▼                             │
                                   ┌──────────────┐                     │
                                   │ in_progress  │                     │
                                   └──────┬───────┘                     │
                                          │                             │
                         complete_service │      no_show                │
                                          ▼              ┌──────────┐   │
                                   ┌──────────────┐     │ no_show  │───┘
                                   │  completed   │     └──────────┘
                                   └──────────────┘
                                          ▲
                                          │
                                   ┌──────────────┐
                                   │  cancelled   │
                                   └──────────────┘
                                          ▲
                                          │
                                   ┌──────────────┐
                                   │  refunded    │
                                   └──────────────┘
```

### Legal Transitions

| From | To | Trigger | Actor |
|------|----|---------|-------|
| `draft` | `hold_created` | `create_booking_hold` | Guest/System |
| `hold_created` | `payment_pending` | `initiate_payment` | Guest |
| `hold_created` | `cancelled` | `cancel_booking` | Guest/Admin |
| `hold_created` | `hold_created` | `extend_hold` | System (if allowed) |
| `payment_pending` | `confirmed` | `confirm_booking_from_payment` | System (webhook) |
| `payment_pending` | `cancelled` | `cancel_booking` | Guest/Admin/System (timeout) |
| `confirmed` | `in_progress` | `start_service` | Driver/Admin |
| `confirmed` | `cancelled` | `cancel_booking` | Admin |
| `confirmed` | `no_show` | `mark_no_show` | Admin |
| `in_progress` | `completed` | `complete_service` | Driver/Admin |
| `in_progress` | `no_show` | `mark_no_show` | Admin (edge case) |
| `cancelled` | `refunded` | `process_refund` | System/Admin |
| `no_show` | `completed` | `complete_service` | Admin (if guest arrives late) |

### Invalid Transitions (Blocked)

- `draft` → `completed` (must pass through `hold_created`, `confirmed`, and `in_progress`)
- `cancelled` → `confirmed` (requires new booking flow)
- `refunded` → any state (terminal)
- `completed` → `cancelled` (terminal)

### State Change Audit

Every transition inserts into `booking_status_changes`:

```sql
CREATE TABLE booking_status_changes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id),
  tenant_id uuid NOT NULL,
  previous_status text NOT NULL,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  reason text,
  correlation_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

---

## 2. HOLD LIFECYCLE

### booking_holds Table

```sql
CREATE TABLE booking_holds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  vehicle_slot_id uuid REFERENCES vehicle_slots(id) ON DELETE RESTRICT,
  seat_count int NOT NULL DEFAULT 1 CHECK (seat_count > 0),
  hold_start timestamptz NOT NULL,
  hold_end timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'expired', 'converted')),
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_booking_holds_tenant ON booking_holds(tenant_id);
CREATE INDEX idx_booking_holds_booking ON booking_holds(booking_id);
CREATE INDEX idx_booking_holds_expires ON booking_holds(expires_at) WHERE status = 'active';
```

### Hold Rules

1. **A hold reserves temporary capacity** in a `vehicle_slot` inventory pool.
2. **Holds expire automatically** after a configurable window (default: 15 minutes for transfers, 24 hours for experiences).
3. **Expired holds release held seats** via reaper job.
4. **One active hold per booking.** Creating a new hold for the same booking cancels the previous hold.
5. **Hold conversion:** When payment is confirmed, the hold status becomes `converted`, held seats become reserved seats, and the booking remains linked to the same `vehicle_slot`.

---

## 3. VEHICLE SLOT RESERVATION

### vehicle_slots Table

```sql
CREATE TABLE vehicle_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  vehicle_id uuid NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  total_capacity int NOT NULL CHECK (total_capacity > 0),
  held_seats int NOT NULL DEFAULT 0 CHECK (held_seats >= 0),
  reserved_seats int NOT NULL DEFAULT 0 CHECK (reserved_seats >= 0),
  remaining_seats int NOT NULL DEFAULT 0 CHECK (remaining_seats >= 0),
  status text NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'held', 'reserved')),
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  lock_version int NOT NULL DEFAULT 0
);

-- Prevent overlapping reservations for the same vehicle using exclusion constraint
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE vehicle_slots
  ADD CONSTRAINT exclude_vehicle_slot_overlap
  EXCLUDE USING gist (
    vehicle_id WITH =,
    tstzrange(slot_start, slot_end) WITH &&
  )
  WHERE (status IN ('held', 'reserved'));

CREATE INDEX idx_vehicle_slots_tenant ON vehicle_slots(tenant_id);
CREATE INDEX idx_vehicle_slots_vehicle ON vehicle_slots(vehicle_id, slot_start);
```

**Constraints:**
- `CHECK (remaining_seats = total_capacity - held_seats - reserved_seats)`
- `CHECK (held_seats + reserved_seats <= total_capacity)`

### Slot States

| State | Meaning |
|-------|---------|
| `available` | No held or reserved seats |
| `held` | Some seats are temporarily held |
| `reserved` | Some seats are reserved by confirmed bookings |

### Slot Reservation Logic

`vehicle_slots` is an aggregate inventory row for a vehicle and time window. It is not the owner of a single booking or hold. Multiple bookings and multiple holds may reference the same slot pool as long as aggregate capacity remains valid.

1. **Create hold (transactional):**
   ```sql
   UPDATE vehicle_slots
   SET held_seats = held_seats + :seat_count,
       remaining_seats = total_capacity - reserved_seats - (held_seats + :seat_count),
       status = 'held',
       lock_version = lock_version + 1
   WHERE id = :vehicle_slot_id
     AND remaining_seats >= :seat_count
     AND lock_version = :expected_lock_version;
   ```
   If 0 rows updated → slot is no longer available (race condition lost).

2. **Confirm booking from hold (transactional):**
   ```sql
   UPDATE vehicle_slots
   SET held_seats = held_seats - :seat_count,
       reserved_seats = reserved_seats + :seat_count,
       remaining_seats = total_capacity - (reserved_seats + :seat_count) - (held_seats - :seat_count),
       status = CASE
         WHEN reserved_seats + :seat_count > 0 THEN 'reserved'
         WHEN held_seats - :seat_count > 0 THEN 'held'
         ELSE 'available'
       END,
       lock_version = lock_version + 1
   WHERE id = :vehicle_slot_id
     AND lock_version = :expected_lock_version;
   ```

3. **Release held seats on expiry or failed payment (transactional):**
   ```sql
   UPDATE vehicle_slots
   SET held_seats = held_seats - :seat_count,
       remaining_seats = total_capacity - reserved_seats - (held_seats - :seat_count),
       status = CASE
         WHEN reserved_seats > 0 THEN 'reserved'
         WHEN held_seats - :seat_count > 0 THEN 'held'
         ELSE 'available'
       END,
       lock_version = lock_version + 1
   WHERE id = :vehicle_slot_id
     AND lock_version = :expected_lock_version;
   ```

4. **Release reserved seats on cancellation/refund compensation (transactional):**
   ```sql
   UPDATE vehicle_slots
   SET reserved_seats = reserved_seats - :seat_count,
       remaining_seats = total_capacity - (reserved_seats - :seat_count) - held_seats,
       status = CASE
         WHEN held_seats > 0 THEN 'held'
         WHEN reserved_seats - :seat_count > 0 THEN 'reserved'
         ELSE 'available'
       END,
       lock_version = lock_version + 1
   WHERE id = :vehicle_slot_id
     AND lock_version = :expected_lock_version;
   ```

---

## 4. CAPACITY VALIDATION

### Rules

1. `vehicle_slots.remaining_seats` must never be negative (`CHECK` constraint).
2. `booking_holds.seat_count` and `bookings.seat_count` must be ≤ slot `remaining_seats` at mutation time.
3. A vehicle's total capacity is defined by `vehicles.capacity`. Slots derived from it must respect this.

### Validation Flow

```
Guest requests booking for N passengers at time T
  │
  ▼
Query vehicle_slots for vehicle V at time T
  │
  ▼
Check remaining_seats >= N
  │
  ├── NO → Reject with "insufficient capacity"
  │
  └── YES → Proceed to hold creation
```

---

## 5. HOLD EXPIRATION

### Reaper Job

Scheduled Edge Function or pg_cron job runs every 5 minutes:

```sql
SELECT id, vehicle_slot_id, seat_count
FROM booking_holds
WHERE status = 'active'
  AND expires_at < now();
```

For each expired hold:
1. Update `booking_holds.status = 'expired'`.
2. Release slot capacity (decrement `reserved_seats`).
3. If associated booking is `hold_created` or `payment_pending`, cancel it:
   - `bookings.status = 'cancelled'`
   - Record `booking_status_changes`
4. Log action in `audit_logs`.

### Race Condition Protection

The reaper must use the same optimistic locking pattern as normal operations. If a guest confirms payment exactly when the reaper runs, the `booking_holds.status` check prevents premature cancellation:

```sql
-- Only cancel if still active and expired
UPDATE booking_holds
SET status = 'expired'
WHERE id = :hold_id
  AND status = 'active'
  AND expires_at < now();
```

If status is already `converted`, the update affects 0 rows and the reaper skips cancellation.

---

## 6. PAYMENT PENDING FLOW

1. Hold is active.
2. Guest initiates payment via Payment Orchestration.
3. Booking transitions to `payment_pending`.
4. Hold `expires_at` may be extended (optional, e.g., +30 minutes for payment window).
5. If payment completes → `confirm_booking_from_payment`.
6. If payment fails or times out → `cancel_booking`.

---

## 7. BOOKING CONFIRMATION FLOW

### confirm_booking_from_payment

**Input:** `booking_id`, `payment_id`, `idempotency_key`

**Steps:**
1. Validate idempotency key (check `booking_status_changes` or `bookings` metadata).
2. Verify booking is in `payment_pending`.
3. Verify payment is `completed` or manual override exists.
4. Verify hold is still `active`.
5. **Transaction:**
   - Update `booking_holds.status = 'converted'`.
   - Update `vehicle_slots` pooled counters:
     - decrement `held_seats`
     - increment `reserved_seats`
     - recompute `remaining_seats`
   - Update `bookings.status = 'confirmed'`.
   - Insert `booking_status_changes`.
6. Send confirmation notification.
7. Return success.

**Failure handling:**
- If slot was lost (hold expired between payment and confirmation), trigger refund and notify guest.
- This is a compensating action: payment succeeded but booking cannot be fulfilled.

---

## 8. CANCELLATION FLOW

### cancel_booking

**Actors:** Guest (within policy), Admin (anytime), System (on expiry/failure)

**Steps:**
1. Validate cancellation is allowed (state machine check).
2. If booking is `confirmed` or `in_progress`:
   - Initiate refund via Payment Orchestration (if payment was completed).
3. **Transaction:**
   - Update `bookings.status = 'cancelled'`.
   - Insert `booking_status_changes`.
   - Release reserved or held seats from `vehicle_slots` pooled counters.
   - Update `booking_holds.status = 'released'`.
4. Log in `audit_logs`.
5. Send cancellation notification.

---

## 9. RESCHEDULE FLOW

### reschedule_booking

**Input:** `booking_id`, `new_vehicle_slot_id`, `reason`

**Steps:**
1. Verify booking is `confirmed` or `hold_created`.
2. Verify new slot has capacity.
3. Create new hold on new slot.
4. **Transaction:**
   - Release old slot pooled seats.
   - Update `bookings`:
      - `scheduled_at = new_slot_start`
      - `scheduled_end_at = new_slot_end`
      - `vehicle_id = new_vehicle_id`
      - `vehicle_slot_id = new_vehicle_slot_id`
   - Update `vehicle_slots` pooled counters for new slot to `held` or `reserved`.
5. Insert `booking_status_changes` with reason.
6. If payment was already completed, no new payment needed.
7. If payment was pending, may need to update preference (optional).

---

## 10. NO-SHOW FLOW

### mark_no_show

**Actor:** Admin only.

**Steps:**
1. Verify booking is `confirmed` or `in_progress`.
2. Verify current time is past `scheduled_at`.
3. Update `bookings.status = 'no_show'`.
4. Insert `booking_status_changes`.
5. Slot may be released (tenant policy-dependent).
6. Payment policy: no automatic refund for no-shows (tenant-configurable).

---

## 11. MANUAL BOOKING FLOW

Admin creates a booking on behalf of a guest (e.g., phone reservation):

1. Admin selects route, date, vehicle.
2. System creates hold (skips payment).
3. Admin records a manual payment via `record_manual_payment` Edge Function.
4. Edge Function creates `payments` row with:
   - `provider = 'manual'`
   - `status = 'completed'`
   - `manual_override_reason`, `manual_override_by`, `manual_override_at`
5. Edge Function inserts `payment_events` with `event_type = 'manual_override'`.
6. Booking confirmed without online payment.

---

## 12. ADMIN OVERRIDE POLICY

Admins can override certain rules, but every override is audited:

| Override | Required Reason | Audit |
|----------|----------------|-------|
| Confirm without payment | Yes | `audit_logs` + `payment_events` |
| Cancel after start time | Yes | `audit_logs` |
| Exceed capacity | Yes + second admin approval | `audit_logs` |
| Delete booking | **Forbidden** — soft delete only | N/A |

---

## 13. CONCURRENCY STRATEGY

### Optimistic Locking

All slot and booking updates use `lock_version`:
- Read current `lock_version`.
- Include it in `UPDATE ... WHERE lock_version = :v`.
- If 0 rows affected, retry or fail with conflict error.

### Transaction Boundaries

The following operations must execute inside a single database transaction:
- create hold: increment `held_seats` + insert `booking_holds` + update `bookings.status`
- confirm booking: convert hold + move held seats to reserved seats + update booking
- cancel booking: update booking + release pooled seats + update hold/payment side effects
- reschedule booking: release old pooled seats + reserve new pooled seats + update booking

### Retry Behavior

- Stale `lock_version` means another actor won the race.
- Guest-facing hold creation should fail fast with conflict and ask the client to refetch availability.
- System-side reaper and reconciliation jobs may retry once after reloading the current slot row.

### Database-Level Protection

- `CHECK` constraints prevent negative or inconsistent counters.
- `EXCLUDE USING gist` prevents overlapping active inventory windows for the same vehicle.

### Application-Level Protection

- Idempotency keys prevent duplicate bookings.
- Hold expiration prevents indefinite capacity blocking.

---

## 14. IDEMPOTENCY STRATEGY

- `create_booking_hold`: idempotency key stored in `booking_holds.idempotency_key`. Duplicate key returns existing hold.
- `confirm_booking_from_payment`: idempotency key checked against `booking_status_changes` or `bookings.metadata`.
- `cancel_booking`: idempotent — cancelling an already cancelled booking is a no-op.

---

## 15. FAILURE HANDLING & COMPENSATION

### Failure Scenarios

| Scenario | Compensation |
|----------|--------------|
| Payment succeeds, slot lost | Refund payment, notify guest, release any partial hold |
| Hold created, payment fails | Release hold, expire booking |
| Booking confirmed, slot double-booked (theoretical) | Alert admin, reschedule one booking, compensate |
| Webhook delayed, guest retries | Idempotency prevents duplicate payment |

### Retry Strategy

- **Slot reservation:** No retry. If slot is taken, fail immediately and offer alternatives.
- **Optimistic-lock conflict on pooled inventory:** Reload slot once; if capacity remains, retry once. Otherwise fail with conflict.
- **Payment preference creation:** Retry once with exponential backoff (MP API transient failures).
- **Webhook processing:** Provider retries only when we return 5xx after a valid accepted payload. Invalid signatures return 400 and are never retried by us.

---

## 16. SERVER-SIDE ONLY OPERATIONS

The following must NEVER be executed directly from the frontend Supabase client:

- `UPDATE bookings SET status = 'confirmed'`
- `UPDATE vehicle_slots SET status = 'reserved'`
- `INSERT INTO booking_holds` without full validation
- `DELETE FROM bookings` (forbidden entirely)
- Direct `UPDATE payments`

**All these must go through Edge Functions or RPC calls that enforce business rules.**

---

## 17. RECOMMENDED RPC / EDGE FUNCTIONS

### create_booking_hold
- Auth: guest
- Input: `route_id`, `vehicle_id`, `vehicle_slot_id`, `scheduled_at`, `seat_count`, `idempotency_key`
- Validation: membership, slot availability, capacity
- Output: `{ hold_id, expires_at }`

### expire_booking_hold
- Auth: system (reaper job)
- Input: `hold_id`
- Side effects: release held seats, cancel booking if needed

### confirm_booking_from_payment
- Auth: system (webhook handler) or admin
- Input: `booking_id`, `payment_id`, `idempotency_key`
- Validation: payment state, hold state, capacity
- Side effects: move held seats to reserved seats, confirm booking, notify

### cancel_booking
- Auth: guest (own booking), admin
- Input: `booking_id`, `reason`
- Side effects: release pooled seats, trigger refund if needed

### reschedule_booking
- Auth: admin
- Input: `booking_id`, `new_vehicle_slot_id`, `reason`
- Side effects: release old pooled seats, reserve new pooled seats

### mark_no_show
- Auth: admin
- Input: `booking_id`, `reason`
- Side effects: update status, release slot (optional)

### release_slot
- Auth: system
- Input: `vehicle_slot_id`, `hold_id`
- Side effects: decrement held or reserved seats and recompute availability

---

## 18. VALIDATION CHECKLIST

- [ ] State machine transitions are enforced by trigger or RPC
- [ ] `vehicle_slots.remaining_seats` has `CHECK >= 0`
- [ ] `vehicle_slots.held_seats + reserved_seats <= total_capacity`
- [ ] `booking_holds` has unique index on `idempotency_key`
- [ ] Reaper job runs at most every 5 minutes
- [ ] Confirm booking checks hold is still active
- [ ] Cancel booking releases slot even if notification fails
- [ ] No frontend direct writes to `bookings`, `vehicle_slots`, `booking_holds`
- [ ] All status changes logged in `booking_status_changes`
- [ ] Optimistic locking (`lock_version`) on slot updates
