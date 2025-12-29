-- Migration: 049_migrate_instructors_to_users
-- Description: Migrates existing instructors to the new users table and instructor_profiles
-- Preserves all instructor data and maintains referential integrity
-- Created: 2025-12-28

-- Step 1: Migrate instructors to users table
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
  'instructor'::user_type,
  is_active,
  email_verified,
  created_at,
  updated_at,
  last_login_at
FROM instructors
ON CONFLICT (id) DO NOTHING; -- Skip if already exists (e.g., someone who is both student and instructor)

-- Step 2: Create instructor_profiles for all migrated instructors
INSERT INTO instructor_profiles (
  user_id,
  title,
  description,
  picture_url,
  linkedin_url,
  x_url,
  youtube_url,
  website_url,
  role,
  preferred_language,
  created_at,
  updated_at
)
SELECT
  id,
  title,
  description,
  picture_url,
  linkedin_url,
  x_url,
  youtube_url,
  website_url,
  -- Map old role column if it exists, otherwise default to 'instructor'
  COALESCE(
    CASE
      WHEN role = 'admin' THEN 'admin'::instructor_role
      ELSE 'instructor'::instructor_role
    END,
    'instructor'::instructor_role
  ),
  preferred_language,
  created_at,
  updated_at
FROM instructors
ON CONFLICT (user_id) DO NOTHING; -- Skip if already exists

-- Log the migration results
DO $$
DECLARE
  users_count INTEGER;
  profiles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_count FROM users WHERE type = 'instructor';
  SELECT COUNT(*) INTO profiles_count FROM instructor_profiles;

  RAISE NOTICE 'Migration completed: % users (instructors), % instructor profiles created',
    users_count, profiles_count;
END $$;
