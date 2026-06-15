-- Migration: create_reconciliations
-- Payment reconciliation tracking
-- Forward-only + idempotent

CREATE TABLE IF NOT EXISTS reconciliations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  booking_id uuid REFERENCES bookings(id) ON DELETE SET NULL,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  provider text NOT NULL,
  provider_payment_id text,
  reference text NOT NULL,
  amount_expected decimal(10,2) NOT NULL CHECK (amount_expected >= 0),
  amount_received decimal(10,2) NOT NULL DEFAULT 0 CHECK (amount_received >= 0),
  difference decimal(10,2) GENERATED ALWAYS AS (amount_expected - amount_received) STORED,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('reconciled', 'pending', 'divergent', 'reversed', 'in_review')),
  method text CHECK (method IN ('pix', 'credit_card', 'debit_card', 'bank_transfer', 'cash', 'invoice')),
  settlement_date date,
  gateway_ref text,
  divergence_reason text,
  processed_at timestamptz,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reconciliations ENABLE ROW LEVEL SECURITY;
CREATE INDEX IF NOT EXISTS idx_reconciliations_tenant ON reconciliations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_booking ON reconciliations(booking_id);
CREATE INDEX IF NOT EXISTS idx_reconciliations_status ON reconciliations(tenant_id, status);

DO $trig$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_reconciliations_updated_at') THEN
    CREATE TRIGGER trg_reconciliations_updated_at BEFORE UPDATE ON reconciliations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $trig$;

DO $pol$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reconciliations_select' AND tablename = 'reconciliations') THEN
    CREATE POLICY reconciliations_select ON reconciliations
      FOR SELECT USING (is_tenant_member(tenant_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'reconciliations_modify' AND tablename = 'reconciliations') THEN
    CREATE POLICY reconciliations_modify ON reconciliations
      FOR ALL USING (is_tenant_member(tenant_id, ARRAY['admin', 'operator']));
  END IF;
END $pol$;
