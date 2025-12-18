-- Migration: 022_revert_course_signups_name_split
-- Description: Revert migration 019 - restore full_name column and remove split fields
-- Created: 2025-12-18

-- Add back full_name column
ALTER TABLE course_signups
  ADD COLUMN full_name VARCHAR(255);

-- Migrate data back (combine first_name and last_name)
UPDATE course_signups
SET full_name = TRIM(CONCAT(first_name, ' ', last_name))
WHERE full_name IS NULL;

-- Make full_name NOT NULL
ALTER TABLE course_signups
  ALTER COLUMN full_name SET NOT NULL;

-- Drop the split name columns (but keep country for analytics)
ALTER TABLE course_signups
  DROP COLUMN IF EXISTS first_name,
  DROP COLUMN IF EXISTS last_name,
  DROP COLUMN IF EXISTS birth_year;

-- Keep country column and its index for analytics
-- DROP INDEX IF EXISTS idx_course_signups_birth_year;

-- Update comment
COMMENT ON COLUMN course_signups.full_name IS 'Student full name';
