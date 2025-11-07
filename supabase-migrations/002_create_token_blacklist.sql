-- Create token_blacklist table for session revocation
-- This table stores revoked JWT tokens to prevent their use after logout
CREATE TABLE IF NOT EXISTS token_blacklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token_jti VARCHAR(255) UNIQUE NOT NULL,  -- JWT ID (unique identifier for each token)
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  revoked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,  -- When the token would naturally expire
  revocation_reason VARCHAR(50) DEFAULT 'logout'  -- 'logout', 'security', 'admin_action'
);

-- Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(token_jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON token_blacklist(user_id);

-- Create a function to automatically clean up expired tokens
-- This keeps the table size manageable
CREATE OR REPLACE FUNCTION cleanup_expired_blacklist_tokens()
RETURNS void AS $$
BEGIN
  DELETE FROM token_blacklist
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled job to run cleanup daily (if using pg_cron extension)
-- SELECT cron.schedule('cleanup-blacklist', '0 2 * * *', 'SELECT cleanup_expired_blacklist_tokens()');

-- Enable Row Level Security
ALTER TABLE token_blacklist ENABLE ROW LEVEL SECURITY;

-- Create policies for token_blacklist table
-- Allow service role (admin) to do everything
CREATE POLICY "Service role can do everything on token_blacklist"
  ON token_blacklist
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE token_blacklist IS 'Stores revoked JWT tokens to prevent use after logout or security events';
COMMENT ON COLUMN token_blacklist.token_jti IS 'JWT ID - unique identifier from the jti claim in the token';
COMMENT ON COLUMN token_blacklist.expires_at IS 'Original expiration time of the token - used for automatic cleanup';
COMMENT ON COLUMN token_blacklist.revocation_reason IS 'Why the token was revoked: logout, security breach, or admin action';
