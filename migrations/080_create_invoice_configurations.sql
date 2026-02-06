-- Migration: 080_create_invoice_configurations
-- Description: Stores invoice configuration snapshots (independent of courses)
-- Created: 2026-02-06

CREATE TABLE IF NOT EXISTS invoice_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  snapshot_data JSONB NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_configurations_invoice_number
  ON invoice_configurations(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoice_configurations_created_by
  ON invoice_configurations(created_by);
CREATE INDEX IF NOT EXISTS idx_invoice_configurations_created_at
  ON invoice_configurations(created_at DESC);

DROP TRIGGER IF EXISTS update_invoice_configurations_updated_at ON invoice_configurations;
CREATE TRIGGER update_invoice_configurations_updated_at
  BEFORE UPDATE ON invoice_configurations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE invoice_configurations IS 'Stores invoice configuration snapshots (no PDF files)';
COMMENT ON COLUMN invoice_configurations.snapshot_data IS 'Full invoice data snapshot for later editing/regeneration';
