-- Migration: 064_create_password_reset_tokens
-- Description: Create table for password reset tokens
-- Created: 2025-12-30

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT token_not_empty CHECK (token <> '')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- Comments
COMMENT ON TABLE password_reset_tokens IS 'Tokens for password reset requests';
COMMENT ON COLUMN password_reset_tokens.user_id IS 'User who requested password reset';
COMMENT ON COLUMN password_reset_tokens.token IS 'Unique token for password reset (hashed)';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'When the token expires (typically 1 hour)';
COMMENT ON COLUMN password_reset_tokens.used IS 'Whether the token has been used';
