-- Migration: 018_create_course_signups_v2
-- Description: Course signup tracking with universal free access (Updated schema)
-- Created: 2025-12-16
-- Note: Use this if starting fresh. For existing databases, use migration 019 to update.

-- Create course_signups table
CREATE TABLE IF NOT EXISTS course_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User Information
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,

  -- Statistical Information (optional for analytics)
  country VARCHAR(10),
  birth_year VARCHAR(4),

  -- Course Information
  course_slug VARCHAR(100) NOT NULL DEFAULT 'automation-101',

  -- Status & Metadata
  signup_status VARCHAR(50) DEFAULT 'pending',
  language VARCHAR(2) NOT NULL DEFAULT 'es',

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT valid_language CHECK (language IN ('en', 'es')),
  CONSTRAINT valid_course CHECK (course_slug IN ('automation-101')),
  CONSTRAINT valid_birth_year CHECK (
    birth_year IS NULL OR
    (birth_year ~ '^\d{4}$' AND
     birth_year::INTEGER >= 1900 AND
     birth_year::INTEGER <= EXTRACT(YEAR FROM CURRENT_DATE))
  ),

  -- Unique constraint: one signup per email per course
  CONSTRAINT unique_email_course UNIQUE (email, course_slug)
);

-- Indexes for performance
CREATE INDEX idx_course_signups_email ON course_signups(email);
CREATE INDEX idx_course_signups_course ON course_signups(course_slug);
CREATE INDEX idx_course_signups_created ON course_signups(created_at DESC);
CREATE INDEX idx_course_signups_country ON course_signups(country);
CREATE INDEX idx_course_signups_birth_year ON course_signups(birth_year);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_course_signups_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_course_signups_updated_at
  BEFORE UPDATE ON course_signups
  FOR EACH ROW
  EXECUTE FUNCTION update_course_signups_updated_at();

-- Enable Row Level Security
ALTER TABLE course_signups ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can signup (insert)
CREATE POLICY "Anyone can signup for courses" ON course_signups
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Public can read (for now - tighten in production)
CREATE POLICY "Public can read signups" ON course_signups
  FOR SELECT
  USING (true);

-- Comments for documentation
COMMENT ON TABLE course_signups IS 'Course signup tracking with universal free access';
COMMENT ON COLUMN course_signups.first_name IS 'Student first name';
COMMENT ON COLUMN course_signups.last_name IS 'Student last name';
COMMENT ON COLUMN course_signups.email IS 'Student email address';
COMMENT ON COLUMN course_signups.country IS 'Country code (ISO 3166-1 alpha-2) - for statistical purposes';
COMMENT ON COLUMN course_signups.birth_year IS 'Year of birth (YYYY format) - for statistical purposes';
COMMENT ON COLUMN course_signups.course_slug IS 'Course identifier (e.g., automation-101)';
COMMENT ON COLUMN course_signups.signup_status IS 'Status: pending, confirmed, enrolled';
COMMENT ON COLUMN course_signups.language IS 'Preferred language: en or es';
