-- Migration: 022_add_full_name_keep_analytics
-- Description: Add full_name column while keeping all analytics fields (first_name, last_name, birth_year, country)
-- Created: 2025-12-18

-- Add full_name column if it doesn't exist
ALTER TABLE course_signups
  ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- Add first_name if it doesn't exist
ALTER TABLE course_signups
  ADD COLUMN IF NOT EXISTS first_name VARCHAR(255);

-- Add last_name if it doesn't exist
ALTER TABLE course_signups
  ADD COLUMN IF NOT EXISTS last_name VARCHAR(255);

-- Add birth_year if it doesn't exist
ALTER TABLE course_signups
  ADD COLUMN IF NOT EXISTS birth_year VARCHAR(4);

-- Add country if it doesn't exist
ALTER TABLE course_signups
  ADD COLUMN IF NOT EXISTS country VARCHAR(10);

-- Populate full_name from first_name + last_name if full_name is empty
UPDATE course_signups
SET full_name = TRIM(CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')))
WHERE (full_name IS NULL OR full_name = '')
  AND (first_name IS NOT NULL OR last_name IS NOT NULL);

-- Populate first_name and last_name from full_name if they are empty
UPDATE course_signups
SET
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = CASE
    WHEN full_name LIKE '% %' THEN SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
    ELSE ''
  END
WHERE (first_name IS NULL OR first_name = '')
  AND full_name IS NOT NULL
  AND full_name != '';

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_course_signups_country ON course_signups(country);
CREATE INDEX IF NOT EXISTS idx_course_signups_birth_year ON course_signups(birth_year);

-- Add constraint for birth_year format
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_birth_year'
  ) THEN
    ALTER TABLE course_signups
      ADD CONSTRAINT valid_birth_year CHECK (
        birth_year IS NULL OR
        (birth_year ~ '^\d{4}$' AND birth_year::INTEGER >= 1900 AND birth_year::INTEGER <= EXTRACT(YEAR FROM CURRENT_DATE))
      );
  END IF;
END $$;

-- Update comments
COMMENT ON COLUMN course_signups.full_name IS 'Student full name (for display and certificates)';
COMMENT ON COLUMN course_signups.first_name IS 'Student first name (for analytics)';
COMMENT ON COLUMN course_signups.last_name IS 'Student last name (for analytics)';
COMMENT ON COLUMN course_signups.country IS 'Country code (ISO 3166-1 alpha-2) - for statistical purposes';
COMMENT ON COLUMN course_signups.birth_year IS 'Year of birth (YYYY format) - for statistical purposes';
