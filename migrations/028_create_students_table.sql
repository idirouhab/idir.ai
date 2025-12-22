-- Migration: Create students table for authentication
-- Description: Creates a separate students table for student authentication
-- Moving student data out of course_signups to normalize the schema

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,

  -- Profile (moved from course_signups)
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  country VARCHAR(10),
  birth_year VARCHAR(4),

  -- Account Status
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,

  -- Preferences
  preferred_language VARCHAR(2) DEFAULT 'es' CHECK (preferred_language IN ('en', 'es')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_birth_year CHECK (
    birth_year IS NULL OR
    (birth_year ~ '^\d{4}$' AND
     birth_year::INTEGER >= 1900 AND
     birth_year::INTEGER <= EXTRACT(YEAR FROM CURRENT_DATE))
  )
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_email ON students(email);
CREATE INDEX IF NOT EXISTS idx_students_is_active ON students(is_active);
CREATE INDEX IF NOT EXISTS idx_students_created_at ON students(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_students_email_verified ON students(email_verified);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

-- Students can read their own data
DROP POLICY IF EXISTS "Students can read own data" ON students;
CREATE POLICY "Students can read own data"
  ON students FOR SELECT
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Students can update their own profile
DROP POLICY IF EXISTS "Students can update own data" ON students;
CREATE POLICY "Students can update own data"
  ON students FOR UPDATE
  TO authenticated
  USING (id::text = current_setting('request.jwt.claims', true)::json->>'userId')
  WITH CHECK (id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Service role (admin) can do everything
DROP POLICY IF EXISTS "Service role can manage students" ON students;
CREATE POLICY "Service role can manage students"
  ON students FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Anyone can insert for signup (anonymous role)
DROP POLICY IF EXISTS "Anyone can insert for signup" ON students;
CREATE POLICY "Anyone can insert for signup"
  ON students FOR INSERT
  TO anon
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE students IS 'Student accounts for course enrollment and authentication';
COMMENT ON COLUMN students.email IS 'Unique email address for student login';
COMMENT ON COLUMN students.password_hash IS 'bcrypt hashed password (never store plain text)';
COMMENT ON COLUMN students.first_name IS 'Student first name';
COMMENT ON COLUMN students.last_name IS 'Student last name';
COMMENT ON COLUMN students.birth_year IS 'Birth year for analytics (validated 1900-current year)';
COMMENT ON COLUMN students.is_active IS 'Account status (inactive accounts cannot log in)';
COMMENT ON COLUMN students.email_verified IS 'Whether student has verified their email address';
COMMENT ON COLUMN students.preferred_language IS 'Preferred language (en or es)';
COMMENT ON COLUMN students.last_login_at IS 'Timestamp of last successful login';
