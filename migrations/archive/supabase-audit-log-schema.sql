-- Audit log table for tracking sensitive data access
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User who performed the action
  user_id UUID NOT NULL,
  user_email VARCHAR(255) NOT NULL,
  user_role VARCHAR(50) NOT NULL,

  -- Action details
  action VARCHAR(100) NOT NULL,
  resource VARCHAR(100) NOT NULL,
  resource_id VARCHAR(255),

  -- Request context
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Additional metadata
  metadata JSONB,

  -- Status
  success BOOLEAN DEFAULT true,
  error_message TEXT,

  -- Timestamp
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_action CHECK (action IN (
    'view_subscribers',
    'export_subscribers',
    'view_subscriber_details',
    'update_subscriber',
    'delete_subscriber'
  ))
);

-- Indexes for efficient querying
CREATE INDEX idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_resource ON audit_logs(resource);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_user_email ON audit_logs(user_email);

-- RLS (Row Level Security) policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins and owners can read audit logs
CREATE POLICY "Admins and owners can read audit logs" ON audit_logs
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Comments for documentation
COMMENT ON TABLE audit_logs IS 'Audit trail for sensitive data access and modifications';
COMMENT ON COLUMN audit_logs.user_id IS 'ID of the user who performed the action';
COMMENT ON COLUMN audit_logs.action IS 'Type of action performed';
COMMENT ON COLUMN audit_logs.resource IS 'Resource type that was accessed';
COMMENT ON COLUMN audit_logs.metadata IS 'Additional context (filters, count, etc.)';
