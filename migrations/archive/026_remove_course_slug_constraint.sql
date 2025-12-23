-- Migration: 026_remove_course_slug_constraint
-- Description: Remove the constraint that limits course_slug to only 'automation-101'
-- Created: 2025-12-19
-- This allows any course to use the course_signups table

-- Drop the constraint that limits course slugs
ALTER TABLE course_signups
DROP CONSTRAINT IF EXISTS valid_course;

-- Add a simple check to ensure course_slug is not empty
ALTER TABLE course_signups
ADD CONSTRAINT valid_course_slug CHECK (course_slug IS NOT NULL AND LENGTH(course_slug) > 0);

-- Update comment
COMMENT ON COLUMN course_signups.course_slug IS 'Course identifier (any valid course slug)';
