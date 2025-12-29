-- Migration: 053_add_schema_improvements
-- Description: Optional improvements to the schema based on best practices
-- Adds ENUMs for status fields, timestamps to course_signups, and course metadata
-- Created: 2025-12-28

-- Create ENUM types for better data integrity
DO $$ BEGIN
  CREATE TYPE course_status AS ENUM ('draft', 'published', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE signup_status AS ENUM ('pending', 'confirmed', 'enrolled', 'completed', 'dropped');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Update courses table with ENUM type (if TEXT currently)
-- This will fail if there are values not in the ENUM, which is expected
-- Uncomment and adjust if you want to use this
-- ALTER TABLE courses
--   ALTER COLUMN status TYPE course_status USING status::course_status;

-- Add additional timestamps to course_signups
ALTER TABLE course_signups
  ADD COLUMN IF NOT EXISTS enrolled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100);

-- Add course metadata if not exists
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS duration_hours INTEGER CHECK (duration_hours > 0);

-- Create index on course_signups for progress tracking
CREATE INDEX IF NOT EXISTS idx_course_signups_progress ON course_signups(progress_percentage);
CREATE INDEX IF NOT EXISTS idx_course_signups_enrolled_at ON course_signups(enrolled_at DESC);
CREATE INDEX IF NOT EXISTS idx_course_signups_last_accessed ON course_signups(last_accessed_at DESC);

-- Update comments
COMMENT ON COLUMN course_signups.enrolled_at IS 'Timestamp when student was enrolled in the course';
COMMENT ON COLUMN course_signups.completed_at IS 'Timestamp when student completed the course';
COMMENT ON COLUMN course_signups.last_accessed_at IS 'Timestamp of last course access by student';
COMMENT ON COLUMN course_signups.progress_percentage IS 'Course completion progress (0-100)';
COMMENT ON COLUMN courses.description IS 'Detailed course description';
COMMENT ON COLUMN courses.duration_hours IS 'Estimated duration in hours';

COMMENT ON TYPE course_status IS 'Course publication status: draft, published, archived';
COMMENT ON TYPE signup_status IS 'Student enrollment status: pending, confirmed, enrolled, completed, dropped';
