-- ============================================
-- INVOICE CONFIGURATION EVENTS TABLE (Audit trail)
-- ============================================
CREATE TABLE IF NOT EXISTS invoice_configuration_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_configuration_id UUID NOT NULL REFERENCES invoice_configurations(id) ON DELETE CASCADE,

  event_type VARCHAR(50) NOT NULL
    CHECK (event_type IN ('created', 'updated', 'sent', 'viewed', 'paid', 'voided')),

  event_data JSONB,
  triggered_by UUID REFERENCES users(id),
  triggered_by_type VARCHAR(20) CHECK (triggered_by_type IN ('user', 'system')),

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoice_config_events_config_id
  ON invoice_configuration_events(invoice_configuration_id);
CREATE INDEX IF NOT EXISTS idx_invoice_config_events_event_type
  ON invoice_configuration_events(event_type);
CREATE INDEX IF NOT EXISTS idx_invoice_config_events_created_at
  ON invoice_configuration_events(created_at DESC);

COMMENT ON TABLE invoice_configuration_events IS 'Audit trail for invoice configuration events';
