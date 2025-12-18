-- Migration: Add certificate completion tracking
-- Description: Adds completion and certificate fields to course_signups table
-- Created: 2025-12-18

-- Add new columns to course_signups table
ALTER TABLE course_signups
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS certificate_id UUID UNIQUE,
ADD COLUMN IF NOT EXISTS certificate_url TEXT;

-- Create index for certificate lookups
CREATE INDEX IF NOT EXISTS idx_course_signups_certificate_id
  ON course_signups(certificate_id)
  WHERE certificate_id IS NOT NULL;

-- Create index for completed signups
CREATE INDEX IF NOT EXISTS idx_course_signups_completed
  ON course_signups(completed_at)
  WHERE completed_at IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN course_signups.completed_at IS 'Timestamp when admin marked course as completed';
COMMENT ON COLUMN course_signups.certificate_id IS 'Unique UUID for certificate identification and public access';
COMMENT ON COLUMN course_signups.certificate_url IS 'Public URL to generated certificate image in Supabase storage';

-- Add constraint to ensure certificate_id is set when completed
ALTER TABLE course_signups
ADD CONSTRAINT certificate_requires_completion
  CHECK (
    (completed_at IS NULL AND certificate_id IS NULL) OR
    (completed_at IS NOT NULL)
  );
