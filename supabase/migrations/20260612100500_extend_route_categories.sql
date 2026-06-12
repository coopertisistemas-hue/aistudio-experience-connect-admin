-- Migration: extend_route_categories
-- Adds icon, color, visibility, and tags to route_categories table
-- Forward-only + idempotent

ALTER TABLE route_categories ADD COLUMN IF NOT EXISTS icon TEXT DEFAULT 'ri-price-tag-3-line';
ALTER TABLE route_categories ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'teal';
ALTER TABLE route_categories ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'visible';
ALTER TABLE route_categories ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb;
