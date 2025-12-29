-- Migration: 044_create_users_table
-- Description: Creates new users table for student and instructor authentication
-- This replaces the separate students and instructors tables
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  -- Basic Profile
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  country VARCHAR(10), -- Flexible length for both ISO-2 and longer codes

  -- User Type (required - must be either student or instructor)
  -- Note: Users can have both student_profile AND instructor_profile rows
  -- This field indicates their primary type at account creation
  type user_type, -- Made nullable to support dual roles via profiles

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT first_name_not_empty CHECK (first_name <> ''),
  CONSTRAINT last_name_not_empty CHECK (last_name <> '')
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_type ON users(type);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_country ON users(country);
CREATE INDEX IF NOT EXISTS idx_users_last_login_at ON users(last_login_at DESC);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Anyone can insert for signup (anonymous role)
DROP POLICY IF EXISTS "Anyone can insert for signup" ON users;
CREATE POLICY "Anyone can insert for signup"
  ON users FOR INSERT
  TO anon
  WITH CHECK (true);

-- Users can read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own data" ON users;
CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'userId')
  WITH CHECK (id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Service role (admin) can do everything
DROP POLICY IF EXISTS "Service role can manage users" ON users;
CREATE POLICY "Service role can manage users"
  ON users FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE users IS 'Unified user accounts for students and instructors with role-based profiles';
COMMENT ON COLUMN users.email IS 'Unique email address for user login';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hashed password (never store plain text)';
COMMENT ON COLUMN users.first_name IS 'User first name';
COMMENT ON COLUMN users.last_name IS 'User last name';
COMMENT ON COLUMN users.country IS 'User country (flexible format)';
COMMENT ON COLUMN users.type IS 'Primary user type at registration - users can have both profiles for dual roles';
COMMENT ON COLUMN users.is_active IS 'Account status (inactive accounts cannot log in)';
COMMENT ON COLUMN users.email_verified IS 'Whether user has verified their email address';
COMMENT ON COLUMN users.last_login_at IS 'Timestamp of last successful login';
