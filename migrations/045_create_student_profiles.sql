-- Migration: 045_create_student_profiles
-- Description: Creates student_profiles table for student-specific data
-- Links to users table via user_id (one-to-one optional relationship)
-- Created: 2025-12-28

CREATE TABLE IF NOT EXISTS student_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Student-specific fields
  birth_year SMALLINT, -- Changed from VARCHAR to SMALLINT for proper data type
  preferred_language VARCHAR(2) DEFAULT 'es' CHECK (preferred_language IN ('en', 'es')),

  -- Progress tracking (optional fields for future use)
  -- Can be used to track overall student progress across courses

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_birth_year CHECK (
    birth_year IS NULL OR (
      birth_year >= 1900 AND
      birth_year <= EXTRACT(YEAR FROM CURRENT_DATE)
    )
  )
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_profiles_preferred_language ON student_profiles(preferred_language);
CREATE INDEX IF NOT EXISTS idx_student_profiles_created_at ON student_profiles(created_at DESC);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_student_profiles_updated_at ON student_profiles;
CREATE TRIGGER update_student_profiles_updated_at
  BEFORE UPDATE ON student_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- Students can read their own profile
DROP POLICY IF EXISTS "Students can read own profile" ON student_profiles;
CREATE POLICY "Students can read own profile"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Students can update their own profile
DROP POLICY IF EXISTS "Students can update own profile" ON student_profiles;
CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId')
  WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Service role can manage all student profiles
DROP POLICY IF EXISTS "Service role can manage student profiles" ON student_profiles;
CREATE POLICY "Service role can manage student profiles"
  ON student_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE student_profiles IS 'Student-specific profile data (linked to users table)';
COMMENT ON COLUMN student_profiles.user_id IS 'Foreign key to users table (primary key)';
COMMENT ON COLUMN student_profiles.birth_year IS 'Birth year for analytics (validated 1900-current year)';
COMMENT ON COLUMN student_profiles.preferred_language IS 'Preferred language for course content (en or es)';
