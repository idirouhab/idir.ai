-- Migration: 050_update_course_signups_foreign_key
-- Description: Updates course_signups.student_id to reference users table instead of students
-- Maintains data integrity during the migration
-- Created: 2025-12-28

-- Step 1: Drop the old foreign key constraint
ALTER TABLE course_signups
  DROP CONSTRAINT IF EXISTS course_signups_student_id_fkey;

-- Step 2: Add new foreign key constraint pointing to users table
ALTER TABLE course_signups
  ADD CONSTRAINT course_signups_student_id_fkey
    FOREIGN KEY (student_id)
    REFERENCES users(id)
    ON DELETE SET NULL; -- Preserve behavior from original migration

-- Step 3: Update comments
COMMENT ON COLUMN course_signups.student_id IS 'Foreign key to users table (nullable for anonymous signups)';

-- Verify the constraint
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  -- Check for any orphaned records (student_id not in users)
  SELECT COUNT(*)
  INTO invalid_count
  FROM course_signups
  WHERE student_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM users WHERE id = course_signups.student_id);

  IF invalid_count > 0 THEN
    RAISE WARNING 'Found % course_signups with invalid student_id references', invalid_count;
  ELSE
    RAISE NOTICE 'All course_signups.student_id references are valid';
  END IF;
END $$;
