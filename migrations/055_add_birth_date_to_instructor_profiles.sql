-- Migration: 055_add_birth_date_to_instructor_profiles
-- Description: Adds birth_date field to instructor_profiles table
-- Created: 2025-12-29

ALTER TABLE instructor_profiles
  ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add constraint to validate birth_date is reasonable
ALTER TABLE instructor_profiles
  ADD CONSTRAINT valid_birth_date CHECK (
    birth_date IS NULL OR (
      birth_date >= '1900-01-01'::date AND
      birth_date <= CURRENT_DATE
    )
  );

-- Create index for potential queries by birth date
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_birth_date ON instructor_profiles(birth_date);

-- Update comments
COMMENT ON COLUMN instructor_profiles.birth_date IS 'Instructor date of birth (validated 1900-01-01 to current date)';
