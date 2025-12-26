-- Migration: 034_create_instructors_table
-- Description: Creates instructors table to store instructor profiles and authentication
-- Created: 2025-12-25

CREATE TABLE IF NOT EXISTS instructors (
                                           id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Authentication
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email_verified BOOLEAN DEFAULT false,

    -- Profile Information
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    country VARCHAR(2), -- ISO 3166-1 alpha-2 country code
    description TEXT,
    picture_url TEXT,
    preferred_language VARCHAR(2) DEFAULT 'es',

    -- Account Status
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT first_name_not_empty CHECK (first_name <> ''),
    CONSTRAINT last_name_not_empty CHECK (last_name <> ''),
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_country_code CHECK (country IS NULL OR country ~ '^[A-Z]{2}$'),
    CONSTRAINT valid_date_of_birth CHECK (
                                             date_of_birth IS NULL OR (
                                             date_of_birth <= CURRENT_DATE AND
                                             date_of_birth >= DATE '1900-01-01'
                                                                      )
    ),
    CONSTRAINT valid_preferred_language CHECK (preferred_language IN ('en', 'es'))
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_instructors_email ON instructors(email);
CREATE INDEX IF NOT EXISTS idx_instructors_last_name ON instructors(last_name);
CREATE INDEX IF NOT EXISTS idx_instructors_country ON instructors(country);
CREATE INDEX IF NOT EXISTS idx_instructors_is_active ON instructors(is_active);
CREATE INDEX IF NOT EXISTS idx_instructors_email_verified ON instructors(email_verified);
CREATE INDEX IF NOT EXISTS idx_instructors_created_at ON instructors(created_at DESC);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_instructors_updated_at ON instructors;
CREATE TRIGGER update_instructors_updated_at
    BEFORE UPDATE ON instructors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

-- Anyone can insert for signup
DROP POLICY IF EXISTS "Anyone can insert for signup" ON instructors;
CREATE POLICY "Anyone can insert for signup"
  ON instructors FOR INSERT
  TO anon
  WITH CHECK (true);

-- Instructors can read own data
DROP POLICY IF EXISTS "Instructors can read own data" ON instructors;
CREATE POLICY "Instructors can read own data"
  ON instructors FOR SELECT
                                                 TO authenticated
                                                 USING (id::text = (current_setting('request.jwt.claims', true)::json->>'userId'));

-- Instructors can update own data
DROP POLICY IF EXISTS "Instructors can update own data" ON instructors;
CREATE POLICY "Instructors can update own data"
  ON instructors FOR UPDATE
                                     TO authenticated
                                     USING (id::text = (current_setting('request.jwt.claims', true)::json->>'userId'))
                     WITH CHECK (id::text = (current_setting('request.jwt.claims', true)::json->>'userId'));

-- Service role (admin) can do everything
DROP POLICY IF EXISTS "Service role can manage instructors" ON instructors;
CREATE POLICY "Service role can manage instructors"
  ON instructors FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Public can read active instructors (for display purposes)
DROP POLICY IF EXISTS "Active instructors are viewable by everyone" ON instructors;
CREATE POLICY "Active instructors are viewable by everyone"
  ON instructors FOR SELECT
                                                 TO anon
                                                 USING (is_active = true);

-- Comments
COMMENT ON TABLE instructors IS 'Instructor profiles for courses and content delivery with authentication';
COMMENT ON COLUMN instructors.email IS 'Instructor email address for authentication';
COMMENT ON COLUMN instructors.password_hash IS 'Hashed password for authentication';
COMMENT ON COLUMN instructors.first_name IS 'Instructor first name';
COMMENT ON COLUMN instructors.last_name IS 'Instructor last name';
COMMENT ON COLUMN instructors.date_of_birth IS 'Date of birth (validated between 1900-01-01 and today)';
COMMENT ON COLUMN instructors.country IS 'ISO 3166-1 alpha-2 country code (e.g., US, ES, FR)';
COMMENT ON COLUMN instructors.description IS 'Instructor bio/description';
COMMENT ON COLUMN instructors.picture_url IS 'URL to instructor profile picture';
COMMENT ON COLUMN instructors.is_active IS 'Whether instructor is currently active';
