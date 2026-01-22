-- Migration: 074_create_certificate_events_table
-- Description: Creates audit trail for certificate lifecycle events
-- Created: 2026-01-21

-- Create ENUM type for certificate event types
DO $$ BEGIN
  CREATE TYPE certificate_event_type AS ENUM ('issued', 'verified', 'revoked', 'reissued');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create certificate_events table for audit trail
CREATE TABLE IF NOT EXISTS certificate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Certificate reference
  certificate_id TEXT NOT NULL, -- Store certificate_id (not FK to allow history after deletion)
  certificate_uuid UUID REFERENCES certificates(id) ON DELETE SET NULL,

  -- Event details
  event_type certificate_event_type NOT NULL,
  event_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Actor information (who performed the action)
  actor_type TEXT, -- 'system', 'admin', 'user', 'api', 'public'
  actor_id UUID, -- User ID if authenticated
  actor_email TEXT, -- Optional: actor email for audit

  -- Event metadata (flexible JSONB for event-specific data)
  metadata JSONB DEFAULT '{}'::jsonb,

  -- Request context
  ip_address INET,
  user_agent TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificate_events_certificate_id ON certificate_events(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificate_events_certificate_uuid ON certificate_events(certificate_uuid);
CREATE INDEX IF NOT EXISTS idx_certificate_events_event_type ON certificate_events(event_type);
CREATE INDEX IF NOT EXISTS idx_certificate_events_timestamp ON certificate_events(event_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_certificate_events_actor_id ON certificate_events(actor_id);
CREATE INDEX IF NOT EXISTS idx_certificate_events_created_at ON certificate_events(created_at DESC);

-- GIN index for metadata JSONB queries
CREATE INDEX IF NOT EXISTS idx_certificate_events_metadata ON certificate_events USING GIN(metadata);

-- Enable Row Level Security
ALTER TABLE certificate_events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Service role (admin) can do everything
CREATE POLICY "Service role can manage certificate events"
  ON certificate_events FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Authenticated users (admin) can read all events
CREATE POLICY "Authenticated users can read certificate events"
  ON certificate_events FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: System can insert events (for audit logging)
CREATE POLICY "Authenticated users can insert certificate events"
  ON certificate_events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE certificate_events IS 'Audit trail for certificate lifecycle events (issued, verified, revoked, reissued)';
COMMENT ON COLUMN certificate_events.certificate_id IS 'Certificate public ID (CERT-2026-UUID format)';
COMMENT ON COLUMN certificate_events.certificate_uuid IS 'FK to certificates.id (nullable to preserve history)';
COMMENT ON COLUMN certificate_events.event_type IS 'Type of event: issued, verified, revoked, reissued';
COMMENT ON COLUMN certificate_events.actor_type IS 'Who performed the action: system, admin, user, api, public';
COMMENT ON COLUMN certificate_events.metadata IS 'Event-specific data (reason for revocation, verification details, etc.)';
COMMENT ON COLUMN certificate_events.ip_address IS 'IP address of the request (for verification tracking)';
COMMENT ON COLUMN certificate_events.user_agent IS 'User agent string (for verification tracking)';
