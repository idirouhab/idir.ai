-- Migration: 087_flatten_profiles_into_users
-- Description: Move student/instructor profile fields into users and prepare to drop profile tables
-- Created: 2026-02-08

-- Add student-specific columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS student_birth_year SMALLINT,
  ADD COLUMN IF NOT EXISTS student_preferred_language VARCHAR(2) CHECK (student_preferred_language IN ('en', 'es'));

-- Add instructor-specific columns
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS instructor_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS instructor_description TEXT,
  ADD COLUMN IF NOT EXISTS instructor_picture_url TEXT,
  ADD COLUMN IF NOT EXISTS instructor_linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS instructor_x_url TEXT,
  ADD COLUMN IF NOT EXISTS instructor_youtube_url TEXT,
  ADD COLUMN IF NOT EXISTS instructor_website_url TEXT,
  ADD COLUMN IF NOT EXISTS instructor_role instructor_role,
  ADD COLUMN IF NOT EXISTS instructor_preferred_language VARCHAR(2) CHECK (instructor_preferred_language IN ('en', 'es'));

-- Migrate student profile data (birth_year may not exist in some schemas)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'student_profiles' AND column_name = 'birth_year'
  ) THEN
    EXECUTE '
      UPDATE users u
      SET
        student_birth_year = COALESCE(u.student_birth_year, sp.birth_year),
        student_preferred_language = COALESCE(u.student_preferred_language, sp.preferred_language)
      FROM student_profiles sp
      WHERE sp.user_id = u.id
    ';
  ELSE
    EXECUTE '
      UPDATE users u
      SET student_preferred_language = COALESCE(u.student_preferred_language, sp.preferred_language)
      FROM student_profiles sp
      WHERE sp.user_id = u.id
    ';
  END IF;
END$$;

-- Migrate instructor profile data
UPDATE users u
SET
  instructor_title = COALESCE(u.instructor_title, ip.title),
  instructor_description = COALESCE(u.instructor_description, ip.description),
  instructor_picture_url = COALESCE(u.instructor_picture_url, ip.picture_url),
  instructor_linkedin_url = COALESCE(u.instructor_linkedin_url, ip.linkedin_url),
  instructor_x_url = COALESCE(u.instructor_x_url, ip.x_url),
  instructor_youtube_url = COALESCE(u.instructor_youtube_url, ip.youtube_url),
  instructor_website_url = COALESCE(u.instructor_website_url, ip.website_url),
  instructor_role = COALESCE(u.instructor_role, ip.role),
  instructor_preferred_language = COALESCE(u.instructor_preferred_language, ip.preferred_language)
FROM instructor_profiles ip
WHERE ip.user_id = u.id;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_student_preferred_language ON users(student_preferred_language);
CREATE INDEX IF NOT EXISTS idx_users_instructor_preferred_language ON users(instructor_preferred_language);
CREATE INDEX IF NOT EXISTS idx_users_instructor_role ON users(instructor_role);

-- Comments
COMMENT ON COLUMN users.student_birth_year IS 'Student birth year (migrated from student_profiles.birth_year)';
COMMENT ON COLUMN users.student_preferred_language IS 'Student preferred language (en or es)';
COMMENT ON COLUMN users.instructor_title IS 'Instructor professional title or credential';
COMMENT ON COLUMN users.instructor_description IS 'Instructor bio/description';
COMMENT ON COLUMN users.instructor_picture_url IS 'Instructor profile picture URL';
COMMENT ON COLUMN users.instructor_linkedin_url IS 'Instructor LinkedIn profile URL';
COMMENT ON COLUMN users.instructor_x_url IS 'Instructor X.com profile URL';
COMMENT ON COLUMN users.instructor_youtube_url IS 'Instructor YouTube channel URL';
COMMENT ON COLUMN users.instructor_website_url IS 'Instructor personal website URL';
COMMENT ON COLUMN users.instructor_role IS 'Instructor role: admin or instructor';
COMMENT ON COLUMN users.instructor_preferred_language IS 'Instructor preferred language (en or es)';
