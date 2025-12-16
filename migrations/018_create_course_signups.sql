-- Migration: 018_create_course_signups
-- Description: Course signup tracking with universal free access
-- Created: 2025-12-15

-- Create course_signups table
CREATE TABLE IF NOT EXISTS course_signups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- User Information
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,

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

  -- Unique constraint: one signup per email per course
  CONSTRAINT unique_email_course UNIQUE (email, course_slug)
);

-- Indexes for performance
CREATE INDEX idx_course_signups_email ON course_signups(email);
CREATE INDEX idx_course_signups_course ON course_signups(course_slug);
CREATE INDEX idx_course_signups_created ON course_signups(created_at DESC);

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
COMMENT ON COLUMN course_signups.course_slug IS 'Course identifier (e.g., automation-101)';
COMMENT ON COLUMN course_signups.signup_status IS 'Status: pending, confirmed, enrolled';
