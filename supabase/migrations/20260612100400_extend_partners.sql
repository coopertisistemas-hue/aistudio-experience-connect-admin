-- Migration: extend_partners
-- Adds address/location and contact fields to partners table
-- Forward-only + idempotent

ALTER TABLE partners ADD COLUMN IF NOT EXISTS city TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS state TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS country TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS contact_email TEXT DEFAULT '';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
