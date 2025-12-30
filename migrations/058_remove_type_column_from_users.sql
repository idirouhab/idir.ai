-- Migration: 058_remove_type_column_from_users
-- Description: Removes type column from users table
-- User roles are now determined by presence of records in student_profiles and/or instructor_profiles
-- A user can be both student and instructor, so the single 'type' column is obsolete
-- Created: 2025-12-30

-- Step 1: Drop index on type column
DROP INDEX IF EXISTS idx_users_type;

-- Step 2: Drop the type column
ALTER TABLE users DROP COLUMN IF EXISTS type;

-- Step 3: Drop the user_type enum (since it's no longer used)
DROP TYPE IF EXISTS user_type;

-- Step 4: Update table comment
COMMENT ON TABLE users IS 'Unified users table for all platform users. User roles (student/instructor) are determined by presence of records in student_profiles and/or instructor_profiles tables.';

-- Migration summary
DO $$
DECLARE
  total_users INTEGER;
  users_with_student_profile INTEGER;
  users_with_instructor_profile INTEGER;
  users_with_both_profiles INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;

  SELECT COUNT(*) INTO users_with_student_profile
  FROM users u
  INNER JOIN student_profiles sp ON u.id = sp.user_id;

  SELECT COUNT(*) INTO users_with_instructor_profile
  FROM users u
  INNER JOIN instructor_profiles ip ON u.id = ip.user_id;

  SELECT COUNT(*) INTO users_with_both_profiles
  FROM users u
  INNER JOIN student_profiles sp ON u.id = sp.user_id
  INNER JOIN instructor_profiles ip ON u.id = ip.user_id;

  RAISE NOTICE '=== User Type Column Removal ===';
  RAISE NOTICE 'Removed type column from users table';
  RAISE NOTICE 'Dropped user_type enum';
  RAISE NOTICE '';
  RAISE NOTICE 'Current user distribution:';
  RAISE NOTICE '  Total users: %', total_users;
  RAISE NOTICE '  Students: %', users_with_student_profile;
  RAISE NOTICE '  Instructors: %', users_with_instructor_profile;
  RAISE NOTICE '  Dual-role (both): %', users_with_both_profiles;
  RAISE NOTICE '';
  RAISE NOTICE 'Roles are now determined by profile tables';
  RAISE NOTICE '=================================';
END $$;
