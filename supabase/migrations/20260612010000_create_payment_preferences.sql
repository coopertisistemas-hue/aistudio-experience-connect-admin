-- Create payment_preferences table for Mercado Pago checkout storage
-- This enables idempotency and tracking of payment preference creation

CREATE TABLE IF NOT EXISTS public.payment_preferences (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     UUID NOT NULL REFERENCES public.tenants(id),
  booking_hold_id TEXT NOT NULL,
  preference_id TEXT NOT NULL,
  init_point    TEXT NOT NULL,
  amount        NUMERIC(10,2) NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  payer_email   TEXT,
  idempotency_key TEXT NOT NULL UNIQUE,
  status        TEXT NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_payment_preferences_tenant
  ON public.payment_preferences(tenant_id);

CREATE INDEX IF NOT EXISTS idx_payment_preferences_booking_hold
  ON public.payment_preferences(booking_hold_id);

CREATE INDEX IF NOT EXISTS idx_payment_preferences_idempotency
  ON public.payment_preferences(idempotency_key);

-- Add payment_preferences to the Database type definitions
COMMENT ON TABLE public.payment_preferences IS 'Stores Mercado Pago checkout preferences for idempotency and tracking';
COMMENT ON COLUMN public.payment_preferences.booking_hold_id IS 'References the booking_hold this preference was created for';
COMMENT ON COLUMN public.payment_preferences.preference_id IS 'Mercado Pago preference ID';
COMMENT ON COLUMN public.payment_preferences.init_point IS 'Checkout URL for redirecting the payer';
COMMENT ON COLUMN public.payment_preferences.idempotency_key IS 'Unique key to prevent duplicate preference creation';

-- Enable RLS
ALTER TABLE public.payment_preferences ENABLE ROW LEVEL SECURITY;

-- Tenant isolation policies
CREATE POLICY payment_preferences_tenant_select
  ON public.payment_preferences
  FOR SELECT
  USING (tenant_id = (SELECT private.get_current_tenant_id()));

CREATE POLICY payment_preferences_tenant_insert
  ON public.payment_preferences
  FOR INSERT
  WITH CHECK (tenant_id = (SELECT private.get_current_tenant_id()));

CREATE POLICY payment_preferences_tenant_update
  ON public.payment_preferences
  FOR UPDATE
  USING (tenant_id = (SELECT private.get_current_tenant_id()))
  WITH CHECK (tenant_id = (SELECT private.get_current_tenant_id()));

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION private.update_payment_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_preferences_updated_at
  BEFORE UPDATE ON public.payment_preferences
  FOR EACH ROW
  EXECUTE FUNCTION private.update_payment_preferences_updated_at();
