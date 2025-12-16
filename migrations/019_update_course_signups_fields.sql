-- Migration: 019_update_course_signups_fields
-- Description: Update course_signups to split name and add statistical fields
-- Created: 2025-12-16

-- Add new columns
ALTER TABLE course_signups
  ADD COLUMN first_name VARCHAR(255),
  ADD COLUMN last_name VARCHAR(255),
  ADD COLUMN country VARCHAR(10),
  ADD COLUMN birth_year VARCHAR(4);

-- Migrate existing data (split full_name into first_name/last_name)
-- This assumes full_name format is "FirstName LastName"
UPDATE course_signups
SET
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE
    WHEN full_name LIKE '% %' THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL;

-- Make new columns NOT NULL after migration
ALTER TABLE course_signups
  ALTER COLUMN first_name SET NOT NULL,
  ALTER COLUMN last_name SET NOT NULL;

-- Drop old column
ALTER TABLE course_signups
  DROP COLUMN full_name;

-- Add constraints for new fields
ALTER TABLE course_signups
  ADD CONSTRAINT valid_birth_year CHECK (birth_year ~ '^\d{4}$' AND birth_year::INTEGER >= 1900 AND birth_year::INTEGER <= EXTRACT(YEAR FROM CURRENT_DATE));

-- Add indexes for analytics queries
CREATE INDEX idx_course_signups_country ON course_signups(country);
CREATE INDEX idx_course_signups_birth_year ON course_signups(birth_year);

-- Update comments
COMMENT ON COLUMN course_signups.first_name IS 'Student first name';
COMMENT ON COLUMN course_signups.last_name IS 'Student last name';
COMMENT ON COLUMN course_signups.country IS 'Country code (ISO 3166-1 alpha-2) - for statistical purposes';
COMMENT ON COLUMN course_signups.birth_year IS 'Year of birth (YYYY format) - for statistical purposes';
