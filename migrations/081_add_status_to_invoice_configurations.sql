-- Migration: 081_add_status_to_invoice_configurations
-- Description: Adds status tracking to invoice configurations
-- Created: 2026-02-06

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'voided');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE invoice_configurations
  ADD COLUMN IF NOT EXISTS status invoice_status NOT NULL DEFAULT 'draft';

CREATE INDEX IF NOT EXISTS idx_invoice_configurations_status
  ON invoice_configurations(status);

COMMENT ON COLUMN invoice_configurations.status IS 'Invoice lifecycle status: draft, sent, paid, voided';
