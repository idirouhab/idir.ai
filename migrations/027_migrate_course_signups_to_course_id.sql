-- Migration: 027_migrate_course_signups_to_course_id
-- Description: Replace course_slug with course_id (UUID foreign key to courses table)
-- Created: 2025-12-20
-- This ensures referential integrity and simplifies queries

-- Step 1: Add the new course_id column (nullable for now during migration)
ALTER TABLE course_signups
ADD COLUMN course_id UUID;

-- Step 2: Migrate existing data - populate course_id based on course_slug
-- This updates course_signups by looking up the course ID from the courses table
UPDATE course_signups cs
SET course_id = c.id
FROM courses c
WHERE cs.course_slug = c.slug
  AND cs.language = c.language;

-- Step 3: For any signups that couldn't be matched (shouldn't happen in production)
-- Log them and optionally handle them (delete or keep with NULL)
-- In production, verify there are no NULL course_id values before proceeding
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM course_signups WHERE course_id IS NULL) THEN
    RAISE WARNING 'Found course_signups with NULL course_id - these will need manual review';
  END IF;
END $$;

-- Step 4: Make course_id NOT NULL now that data is migrated
-- Only proceed if all signups have a course_id
ALTER TABLE course_signups
ALTER COLUMN course_id SET NOT NULL;

-- Step 5: Add foreign key constraint to courses table
ALTER TABLE course_signups
ADD CONSTRAINT fk_course_signups_course_id
FOREIGN KEY (course_id)
REFERENCES courses(id)
ON DELETE CASCADE;

-- Step 6: Drop the old unique constraint that used course_slug
ALTER TABLE course_signups
DROP CONSTRAINT IF EXISTS unique_email_course;

-- Step 7: Add new unique constraint using course_id
ALTER TABLE course_signups
ADD CONSTRAINT unique_email_course_id UNIQUE (email, course_id);

-- Step 8: Drop indexes related to course_slug
DROP INDEX IF EXISTS idx_course_signups_course;

-- Step 9: Create index on course_id for performance
CREATE INDEX idx_course_signups_course_id ON course_signups(course_id);

-- Step 10: Drop the old course_slug column
ALTER TABLE course_signups
DROP COLUMN course_slug;

-- Step 11: Drop the old constraint that was checking course_slug
ALTER TABLE course_signups
DROP CONSTRAINT IF EXISTS valid_course_slug;

-- Update comment
COMMENT ON COLUMN course_signups.course_id IS 'Foreign key to courses table - references the specific course this signup is for';

-- Verify migration
DO $$
DECLARE
  signup_count INTEGER;
  orphan_count INTEGER;
BEGIN
  -- Count total signups
  SELECT COUNT(*) INTO signup_count FROM course_signups;

  -- Check for any orphaned signups (shouldn't exist with FK constraint)
  SELECT COUNT(*) INTO orphan_count
  FROM course_signups cs
  LEFT JOIN courses c ON cs.course_id = c.id
  WHERE c.id IS NULL;

  RAISE NOTICE 'Migration complete: % signups migrated, % orphans found', signup_count, orphan_count;
END $$;
