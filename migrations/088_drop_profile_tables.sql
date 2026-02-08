-- Migration: 088_drop_profile_tables
-- Description: Remove legacy student/instructor profile tables and helpers after flattening into users
-- Created: 2026-02-08

-- Safety check: ensure profile data was migrated into users
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'student_profiles'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'birth_year'
    ) THEN
      IF EXISTS (
        SELECT 1
        FROM student_profiles sp
        JOIN users u ON u.id = sp.user_id
        WHERE (sp.birth_year IS NOT NULL AND u.student_birth_year IS NULL)
           OR (sp.preferred_language IS NOT NULL AND u.student_preferred_language IS NULL)
      ) THEN
        RAISE EXCEPTION 'Cannot drop student_profiles: unmigrated data detected in users';
      END IF;
    ELSE
      IF EXISTS (
        SELECT 1
        FROM student_profiles sp
        JOIN users u ON u.id = sp.user_id
        WHERE sp.preferred_language IS NOT NULL AND u.student_preferred_language IS NULL
      ) THEN
        RAISE EXCEPTION 'Cannot drop student_profiles: unmigrated data detected in users';
      END IF;
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'instructor_profiles'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM instructor_profiles ip
      JOIN users u ON u.id = ip.user_id
      WHERE (ip.title IS NOT NULL AND u.instructor_title IS NULL)
         OR (ip.description IS NOT NULL AND u.instructor_description IS NULL)
         OR (ip.picture_url IS NOT NULL AND u.instructor_picture_url IS NULL)
         OR (ip.linkedin_url IS NOT NULL AND u.instructor_linkedin_url IS NULL)
         OR (ip.x_url IS NOT NULL AND u.instructor_x_url IS NULL)
         OR (ip.youtube_url IS NOT NULL AND u.instructor_youtube_url IS NULL)
         OR (ip.website_url IS NOT NULL AND u.instructor_website_url IS NULL)
         OR (ip.role IS NOT NULL AND u.instructor_role IS NULL)
         OR (ip.preferred_language IS NOT NULL AND u.instructor_preferred_language IS NULL)
    ) THEN
      RAISE EXCEPTION 'Cannot drop instructor_profiles: unmigrated data detected in users';
    END IF;
  END IF;
END$$;

-- Drop legacy triggers
DROP TRIGGER IF EXISTS ensure_student_profile_not_last ON student_profiles;
DROP TRIGGER IF EXISTS ensure_instructor_profile_not_last ON instructor_profiles;

-- Drop helper functions tied to legacy profile tables
DROP FUNCTION IF EXISTS check_user_has_profile();
DROP FUNCTION IF EXISTS get_user_roles(UUID);
DROP FUNCTION IF EXISTS user_exists_by_email(TEXT);

-- Drop legacy profile tables (policies, indexes, and triggers will be removed with CASCADE)
DROP TABLE IF EXISTS student_profiles CASCADE;
DROP TABLE IF EXISTS instructor_profiles CASCADE;

-- Update users table comment to reflect new RBAC system
COMMENT ON TABLE users IS 'Unified users table for all platform users. Authorization is managed via user_roles (app_role).';
