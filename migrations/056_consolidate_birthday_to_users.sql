-- Migration: 056_consolidate_birthday_to_users
-- Description: Moves birthday data from student_profiles and instructor_profiles to users table
-- Migrates birth_year from student_profiles as January 1st of that year
-- Migrates birth_date from instructor_profiles directly
-- Created: 2025-12-29

-- Step 1: Add birthday column to users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS birthday DATE;

-- Add constraint to validate birthday is reasonable (drop first if exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_birthday' AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users
      ADD CONSTRAINT valid_birthday CHECK (
        birthday IS NULL OR (
          birthday >= '1900-01-01'::date AND
          birthday <= CURRENT_DATE
        )
      );
  END IF;
END $$;

-- Step 2: Migrate birth_date from instructor_profiles to users.birthday
UPDATE users u
SET birthday = ip.birth_date
FROM instructor_profiles ip
WHERE u.id = ip.user_id
  AND ip.birth_date IS NOT NULL
  AND u.birthday IS NULL; -- Only update if not already set

-- Step 3: Migrate birth_year from student_profiles to users.birthday (as January 1st)
UPDATE users u
SET birthday = make_date(sp.birth_year, 1, 1)
FROM student_profiles sp
WHERE u.id = sp.user_id
  AND sp.birth_year IS NOT NULL
  AND u.birthday IS NULL; -- Only update if not already set (instructor takes precedence)

-- Step 4: Handle users with both instructor and student profiles
-- If instructor has birth_date, it takes precedence (already done above)
-- If instructor doesn't have birth_date but student has birth_year, use student's
-- This query is actually redundant since Step 3 already handles this case
-- But we keep it for clarity and to catch any edge cases
UPDATE users u
SET birthday = make_date(sp.birth_year, 1, 1)
FROM student_profiles sp
WHERE u.id = sp.user_id
  AND sp.birth_year IS NOT NULL
  AND u.birthday IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM instructor_profiles ip
    WHERE ip.user_id = u.id AND ip.birth_date IS NOT NULL
  );

-- Step 5: Create index for potential queries by birthday
CREATE INDEX IF NOT EXISTS idx_users_birthday ON users(birthday);

-- Step 6: Drop old columns from profile tables
-- Keep them commented out for now in case we need to rollback
-- Uncomment these after verifying the migration in production:

-- ALTER TABLE instructor_profiles DROP COLUMN IF EXISTS birth_date;
-- ALTER TABLE student_profiles DROP COLUMN IF EXISTS birth_year;

-- Update comments
COMMENT ON COLUMN users.birthday IS 'User date of birth (migrated from student_profiles.birth_year and instructor_profiles.birth_date)';

-- Migration summary
DO $$
DECLARE
  total_users INTEGER;
  users_with_birthday INTEGER;
  migrated_from_instructors INTEGER;
  migrated_from_students INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_users FROM users;
  SELECT COUNT(*) INTO users_with_birthday FROM users WHERE birthday IS NOT NULL;

  SELECT COUNT(*) INTO migrated_from_instructors
  FROM users u
  INNER JOIN instructor_profiles ip ON u.id = ip.user_id
  WHERE u.birthday IS NOT NULL AND ip.birth_date IS NOT NULL;

  SELECT COUNT(*) INTO migrated_from_students
  FROM users u
  INNER JOIN student_profiles sp ON u.id = sp.user_id
  WHERE u.birthday IS NOT NULL AND sp.birth_year IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM instructor_profiles ip2
      WHERE ip2.user_id = u.id AND ip2.birth_date IS NOT NULL
    );

  RAISE NOTICE '=== Birthday Migration Summary ===';
  RAISE NOTICE 'Total users: %', total_users;
  RAISE NOTICE 'Users with birthday after migration: %', users_with_birthday;
  RAISE NOTICE 'Migrated from instructor_profiles: %', migrated_from_instructors;
  RAISE NOTICE 'Migrated from student_profiles: %', migrated_from_students;
  RAISE NOTICE '===================================';
END $$;
