-- Migration: 051_update_course_instructors_foreign_key
-- Description: Updates course_instructors.instructor_id to reference users table instead of instructors
-- Maintains data integrity during the migration
-- Created: 2025-12-28

-- Step 1: Drop the old foreign key constraint
ALTER TABLE course_instructors
  DROP CONSTRAINT IF EXISTS course_instructors_instructor_id_fkey;

-- Step 2: Add new foreign key constraint pointing to users table
ALTER TABLE course_instructors
  ADD CONSTRAINT course_instructors_instructor_id_fkey
    FOREIGN KEY (instructor_id)
    REFERENCES users(id)
    ON DELETE CASCADE; -- Preserve behavior from original migration

-- Step 3: Update comments
COMMENT ON COLUMN course_instructors.instructor_id IS 'Foreign key to users table (reference to instructor)';

-- Verify the constraint
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  -- Check for any orphaned records (instructor_id not in users)
  SELECT COUNT(*)
  INTO invalid_count
  FROM course_instructors
  WHERE instructor_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM users WHERE id = course_instructors.instructor_id);

  IF invalid_count > 0 THEN
    RAISE WARNING 'Found % course_instructors with invalid instructor_id references', invalid_count;
  ELSE
    RAISE NOTICE 'All course_instructors.instructor_id references are valid';
  END IF;
END $$;
