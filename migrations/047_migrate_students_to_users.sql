-- Migration: 047_migrate_students_to_users
-- Description: Migrates existing students to the new users table and student_profiles
-- Preserves all student data and maintains referential integrity
-- Created: 2025-12-28

-- Step 1: Migrate students to users table
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  country,
  type,
  is_active,
  email_verified,
  created_at,
  updated_at,
  last_login_at
)
SELECT
  id,
  email,
  password_hash,
  first_name,
  last_name,
  country,
  'student'::user_type,
  is_active,
  email_verified,
  created_at,
  updated_at,
  last_login_at
FROM students
ON CONFLICT (id) DO NOTHING; -- Skip if already exists

-- Step 2: Create student_profiles for all migrated students
INSERT INTO student_profiles (
  user_id,
  birth_year,
  preferred_language,
  created_at,
  updated_at
)
SELECT
  id,
  -- Convert birth_year from VARCHAR to SMALLINT
  CASE
    WHEN birth_year ~ '^\d{4}$' THEN birth_year::SMALLINT
    ELSE NULL
  END,
  preferred_language,
  created_at,
  updated_at
FROM students
ON CONFLICT (user_id) DO NOTHING; -- Skip if already exists

-- Log the migration results
DO $$
DECLARE
  users_count INTEGER;
  profiles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_count FROM users WHERE type = 'student';
  SELECT COUNT(*) INTO profiles_count FROM student_profiles;

  RAISE NOTICE 'Migration completed: % users (students), % student profiles created',
    users_count, profiles_count;
END $$;
