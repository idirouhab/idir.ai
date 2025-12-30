-- Migration: 057_remove_old_birthday_columns
-- Description: Removes birth_date and birth_year columns from profile tables
-- Birthday data is now consolidated in users.birthday (migration 056)
-- Created: 2025-12-29

-- IMPORTANT: This migration removes data columns
-- Ensure migration 056 has been successfully applied in production first

-- Step 1: Drop constraints
ALTER TABLE instructor_profiles DROP CONSTRAINT IF EXISTS valid_birth_date;
ALTER TABLE student_profiles DROP CONSTRAINT IF EXISTS valid_birth_year;

-- Step 2: Drop indexes
DROP INDEX IF EXISTS idx_instructor_profiles_birth_date;

-- Step 3: Drop columns
ALTER TABLE instructor_profiles DROP COLUMN IF EXISTS birth_date;
ALTER TABLE student_profiles DROP COLUMN IF EXISTS birth_year;

-- Step 4: Update table comments
COMMENT ON TABLE student_profiles IS 'Student-specific profile data (linked to users table). Birthday stored in users.birthday.';
COMMENT ON TABLE instructor_profiles IS 'Instructor-specific profile data (linked to users table). Birthday stored in users.birthday.';

-- Migration summary
DO $$
DECLARE
  users_with_birthday INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_with_birthday FROM users WHERE birthday IS NOT NULL;

  RAISE NOTICE '=== Birthday Columns Cleanup ===';
  RAISE NOTICE 'Removed birth_date from instructor_profiles';
  RAISE NOTICE 'Removed birth_year from student_profiles';
  RAISE NOTICE 'Users with birthday in users table: %', users_with_birthday;
  RAISE NOTICE 'Birthday data is now in users.birthday';
  RAISE NOTICE '=================================';
END $$;
