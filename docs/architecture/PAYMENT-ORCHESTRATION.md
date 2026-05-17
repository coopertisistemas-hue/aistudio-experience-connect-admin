# PAYMENT ORCHESTRATION — Dom Pietro Experience Connect

> Mercado Pago transactional architecture. Every payment flow must be idempotent, auditable, and reconcilable.

---

## 1. PAYMENT ENTITIES

### payments (current state)

Single source of truth for the current status of a payment attempt.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | Internal ID |
| tenant_id | uuid FK | Isolation |
| booking_id | uuid FK | Related booking |
| user_id | uuid FK | Payer |
| provider | text | `mercado_pago` |
| provider_payment_id | text | MP payment ID |
| preference_id | text | MP preference ID (checkout) |
| amount | decimal(10,2) | BRL |
| currency | text | `BRL` |
| status | text | `pending`, `processing`, `completed`, `failed`, `refunded`, `cancelled` |
| method | text | `credit_card`, `debit_card`, `pix`, `boleto`, `manual` |
| idempotency_key | text | Client-generated, unique per attempt |
| metadata | jsonb | Provider raw response snapshot |
| paid_at | timestamptz | Set when status → completed |
| refunded_at | timestamptz | Set when status → refunded |
| manual_override_reason | text | Reason for manual payment |
| manual_override_by | uuid | Admin who authorized manual payment |
| manual_override_at | timestamptz | Timestamp of manual override |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| lock_version | int | Optimistic locking |

**Constraint:** `CHECK (amount > 0)`

**Index:** `CREATE UNIQUE INDEX idx_payments_idempotency ON payments(idempotency_key);`

### payment_events (immutable ledger)

Append-only audit log of every payment-related event.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| payment_id | uuid FK | |
| tenant_id | uuid FK | |
| booking_id | uuid FK | |
| event_type | text | `created`, `preference_generated`, `webhook_received`, `confirmed`, `failed`, `refunded`, `reconciled`, `manual_override` |
| provider_event_id | text | MP event/payment ID |
| payload | jsonb | Raw event data |
| processed_by | text | `webhook`, `rpc`, `admin`, `reconciliation_job` |
| correlation_id | text | Tracing ID |
| created_at | timestamptz | |

**Rules:**
- Never updated.
- Never deleted.
- All financial state transitions must have a corresponding event.

### webhook_deliveries (webhook tracking)

Tracks every incoming webhook payload before processing.

| Column | Type | Notes |
|--------|------|-------|
| id | uuid PK | |
| provider | text | `mercado_pago` |
| event_id | text | MP event ID (x-idempotency-key or payment ID) |
| payload_signature | text | HMAC/signature header for validation |
| payload_hash | text | SHA-256 of raw body |
| status | text | `received`, `validated`, `processed`, `failed`, `ignored` |
| processed_at | timestamptz | |
| error_message | text | |
| created_at | timestamptz | |

**Index:** `CREATE UNIQUE INDEX idx_webhook_deliveries_event ON webhook_deliveries(provider, event_id);`

---

## 2. PAYMENT LIFECYCLE

### 2.1 Payment Creation

1. **Guest selects slot** and proceeds to checkout.
2. **Frontend generates** `idempotency_key` (UUID v4).
3. **Frontend calls** `POST /payment-orchestration/create-preference` with:
   - `booking_id`
   - `idempotency_key`
   - `tenant_id`
4. **Edge Function validates:**
   - User is authenticated.
   - User has active membership in `tenant_id`.
   - `booking_id` belongs to user and is in `hold_created` or `payment_pending` state.
   - `idempotency_key` is unique (check `payments`).
5. **Edge Function creates** `payments` row:
   - `status = 'pending'`
   - `idempotency_key = provided_key`
6. **Edge Function calls** Mercado Pago API to create a preference:
   - `external_reference = payments.id`
   - `notification_url = https://api.domain.com/webhooks/mercado-pago`
7. **Edge Function records** `payment_events` row:
   - `event_type = 'preference_generated'`
   - `payload = MP preference response`
8. **Edge Function returns** checkout URL to frontend.
9. **Frontend redirects** guest to Mercado Pago.

### 2.2 Webhook Handling

1. **Mercado Pago sends** webhook to `POST /webhooks/mercado-pago`.
2. **Edge Function immediately records** raw payload in `webhook_deliveries`:
   - `status = 'received'`
   - `payload_hash = sha256(body)`
3. **Edge Function validates** signature (if MP provides signature verification) or `x-idempotency-key`.
4. **Edge Function attempts INSERT into `webhook_deliveries`:**
   ```sql
   INSERT INTO webhook_deliveries (provider, event_id, payload_signature, payload_hash, status)
   VALUES (:provider, :event_id, :signature, :hash, 'received')
   ON CONFLICT (provider, event_id) DO NOTHING
   RETURNING id;
   ```
   - If 0 rows returned, the webhook is a duplicate. Return 200 immediately.
   - If row inserted, proceed with processing.
   ```
5. **Edge Function updates** `webhook_deliveries.status = 'validated'`.
6. **Edge Function extracts** `external_reference` (our `payments.id`) and MP `payment_id`.
7. **Edge Function processes** the event:
   - Fetch `payments` row.
   - Validate `tenant_id` matches.
   - Record `payment_events` row.
   - Update `payments` status based on MP event type.
8. **Edge Function calls** `confirm_booking_from_payment` RPC (Booking Orchestration) if payment is `completed`.
9. **Edge Function updates** `webhook_deliveries.status = 'processed'`.

### 2.3 Idempotency Guarantee

The combination of:
- `idempotency_key` uniqueness on `payments`
- `webhook_deliveries` uniqueness on `(provider, event_id)` with `ON CONFLICT DO NOTHING`
- `payment_events` append-only ledger

ensures that duplicate processing is impossible.

**Duplicate scenarios handled:**
- Guest clicks "pay" twice → `idempotency_key` blocks second `payments` row.
- MP sends webhook twice → `ON CONFLICT` on `webhook_deliveries` blocks second processing; first insert wins.
- MP sends `payment.updated` after `payment.completed` → `payment_events` records both; `payments.status` stays `completed` (no regression).

---

## 3. WEBHOOK SIGNATURE VALIDATION

Mercado Pago webhooks may not always provide HMAC signatures in all configurations. When available:

1. Store `MP_WEBHOOK_SECRET` in Supabase Vault or Edge Function secrets.
2. Compute HMAC-SHA256 of raw request body.
3. Compare with `x-signature` header.
4. If mismatch, record `webhook_deliveries.status = 'failed'` with error, return 400.

### Final Webhook Response Contract

| Scenario | HTTP | Meaning |
|----------|------|---------|
| Invalid signature / untrusted payload | `400` | Reject payload; do not process |
| Duplicate valid event | `200` | Event already accepted; no-op replay |
| Valid payload + successful processing | `200` | Event accepted and processed |
| Valid payload + internal processing failure | `500` | Provider retry required |

If signature is not available:
1. Rely on `idempotency_key` / `event_id` uniqueness.
2. Rely on `external_reference` validation.
3. Rely on idempotency of `payments` update logic.

---

## 4. RECONCILIATION FLOWS

### 4.1 Why Reconciliation Is Necessary

Webhooks can be lost. MP status can diverge from our database if a webhook was missed or processed partially.

### 4.2 Reconciliation Job

Scheduled Edge Function (daily or hourly):

1. Query `payments` where `status IN ('pending', 'processing')` and `created_at < now() - interval '30 minutes'`.
2. For each payment, call Mercado Pago API `GET /v1/payments/{provider_payment_id}`.
3. Compare MP status with our `payments.status`.
4. If mismatch:
   - Record `payment_events` with `event_type = 'reconciled'`.
   - Update `payments.status` to match truth.
   - If MP says `approved` and we say `pending`, trigger booking confirmation.
   - If MP says `rejected` and we say `pending`, trigger booking cancellation.
5. Log reconciliation run in `audit_logs`.

### 4.3 Manual Reconciliation

Admin dashboard provides a "Reconcile Payment" button for individual payments. This:
1. Fetches fresh status from MP.
2. Records `payment_events`.
3. Updates `payments`.
4. Logs admin action in `audit_logs`.

---

## 5. FAILED PAYMENT HANDLING

### 5.1 Guest-Facing Failure

If MP returns `rejected` or guest cancels checkout:

1. Webhook or redirect handler updates `payments.status = 'failed'`.
2. Record `payment_events` with `event_type = 'failed'`.
3. Booking Orchestration receives notification.
4. Booking transitions to `cancelled` (or remains in `hold_created` if retry is allowed).
5. Slot is released if booking is cancelled.
6. Guest sees failure message with option to retry (new `idempotency_key`).

### 5.2 Retry Policy

- Guest may retry payment within hold expiration window.
- Each retry generates a new `payments` row with new `idempotency_key`.
- Old failed payment remains for audit.

---

## 6. REFUND HANDLING

### 6.1 Automated Refund

When admin cancels a `confirmed` booking with `completed` payment:

1. Admin UI calls `POST /payment-orchestration/refund`.
2. Edge Function validates admin membership.
3. Edge Function calls MP API `POST /v1/payments/{id}/refunds`.
4. On success:
   - Update `payments.status = 'refunded'`.
   - Record `payment_events` with `event_type = 'refunded'`.
5. On failure:
   - Record `payment_events` with `event_type = 'refund_failed'`.
   - Alert admin for manual intervention.

### 6.2 Partial Refund

Future capability. For V1, only full refunds.

---

## 7. MANUAL PAYMENT EXCEPTIONS

Real-world operations require manual payment recording:

- **Paid at reception:** Guest pays in cash at the pousada.
- **Courtesy:** Booking is complimentary.
- **Waived:** Admin waives payment for operational reasons.

### Handling

1. Admin UI provides "Record Manual Payment" action.
2. Action requires reason text and admin password re-entry.
3. Edge Function creates `payments` row:
   - `provider = 'manual'`
   - `status = 'completed'`
   - `method = 'manual'`
   - `manual_override_reason = provided_reason`
   - `manual_override_by = admin_id`
   - `manual_override_at = now()`
4. Record `payment_events` with `event_type = 'manual_override'`.
5. Log admin action in `audit_logs`.
6. Trigger booking confirmation.

**Invariant:** Manual overrides are audited and require explicit admin approval.

---

## 8. BOOKING/PAYMENT CONSISTENCY RULES

### Rule 1: Single Payment per Booking (V1)
For V1, a booking has at most one active payment. Future versions may support partial payments.

### Rule 2: Source of Truth Hierarchy
1. **Payment truth:** `payment_events` ledger
2. **Current state:** `payments` table
3. **Booking confirmation:** Derived from `payments.status = 'completed'` OR `payments.provider = 'manual'` with `status = 'completed'`

### Rule 3: No Direct Booking Status Update from Payment
Payment Orchestration must not directly `UPDATE bookings SET status = 'confirmed'`.
It must call `confirm_booking_from_payment` RPC (Booking Orchestration domain), which validates capacity and slot before confirming.

### Rule 4: webhook_replay Safety
Every webhook is tracked in `webhook_deliveries`. Replays are detected and ignored.

---

## 9. EDGE FUNCTIONS

### create_payment_preference
- Auth: required
- Input: `booking_id`, `idempotency_key`, `tenant_id`
- Output: `{ preference_id, checkout_url, payment_id }`
- Side effects: Creates `payments` and `payment_events`

### process_mp_webhook
- Auth: none (MP server-to-server)
- Input: raw MP webhook payload
- Output:
  - `200` for successful processing or duplicate valid replay
  - `400` for invalid signature / untrusted payload
  - `500` for valid payloads that fail during internal processing
- Side effects: Inserts `webhook_deliveries` (with `ON CONFLICT DO NOTHING`), `payment_events`, may call Booking Orchestration
- **Trusted context:** This Edge Function runs in a trusted server context. It may use `service_role` internally to write to append-only tables (`payment_events`, `webhook_deliveries`) after validating the webhook payload, or it may invoke SECURITY DEFINER functions for those writes.

### reconcile_payment
- Auth: admin
- Input: `payment_id`
- Output: `{ previous_status, current_status, action_taken }`
- Side effects: Creates `payment_events`, may trigger booking state change

### refund_payment
- Auth: admin
- Input: `payment_id`, `reason`
- Output: `{ refund_id, status }`
- Side effects: Creates `payment_events`, updates `payments`

### record_manual_payment
- Auth: admin
- Input: `booking_id`, `amount`, `method`, `reason`
- Output: `{ payment_id }`
- Side effects: Creates `payments` and `payment_events`, triggers booking confirmation

---

## 10. VALIDATION CHECKLIST

- [ ] `payments.idempotency_key` has unique index
- [ ] `webhook_deliveries` has unique index on `(provider, event_id)`
- [ ] `payment_events` is append-only (no UPDATE/DELETE policies)
- [ ] Invalid signatures return 400 and are logged
- [ ] Duplicate valid events return 200 with no side effects
- [ ] Valid processing failures return 500 so provider retries
- [ ] Reconciliation job runs on schedule
- [ ] Manual payments require audit reason
- [ ] Refund failures alert admin
- [ ] `service_role` is not used in webhook handler (use anon with validation)
