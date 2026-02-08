-- Migration: 089_unify_user_profile_fields
-- Description: Unify instructor/student profile fields into generic users columns
-- Created: 2026-02-08

-- Rename instructor profile columns to generic names
ALTER TABLE users
  RENAME COLUMN instructor_title TO title;

ALTER TABLE users
  RENAME COLUMN instructor_description TO description;

ALTER TABLE users
  RENAME COLUMN instructor_picture_url TO picture_url;

ALTER TABLE users
  RENAME COLUMN instructor_linkedin_url TO linkedin_url;

ALTER TABLE users
  RENAME COLUMN instructor_x_url TO x_url;

ALTER TABLE users
  RENAME COLUMN instructor_youtube_url TO youtube_url;

ALTER TABLE users
  RENAME COLUMN instructor_website_url TO website_url;

ALTER TABLE users
  RENAME COLUMN instructor_role TO role;

ALTER TABLE users
  RENAME COLUMN instructor_preferred_language TO preferred_language;

-- Rename student profile columns to generic names
ALTER TABLE users
  RENAME COLUMN student_birth_year TO birth_year;

-- Merge student preferred language into generic column, then drop legacy column
UPDATE users
SET preferred_language = COALESCE(preferred_language, student_preferred_language)
WHERE student_preferred_language IS NOT NULL;

ALTER TABLE users
  DROP COLUMN IF EXISTS student_preferred_language;

-- Update indexes
DROP INDEX IF EXISTS idx_users_student_preferred_language;
DROP INDEX IF EXISTS idx_users_instructor_preferred_language;
DROP INDEX IF EXISTS idx_users_instructor_role;

CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Update comments
COMMENT ON COLUMN users.birth_year IS 'User birth year (migrated from student_profiles.birth_year)';
COMMENT ON COLUMN users.preferred_language IS 'User preferred language (en or es)';
COMMENT ON COLUMN users.title IS 'User professional title or credential';
COMMENT ON COLUMN users.description IS 'User bio/description';
COMMENT ON COLUMN users.picture_url IS 'User profile picture URL';
COMMENT ON COLUMN users.linkedin_url IS 'User LinkedIn profile URL';
COMMENT ON COLUMN users.x_url IS 'User X.com profile URL';
COMMENT ON COLUMN users.youtube_url IS 'User YouTube channel URL';
COMMENT ON COLUMN users.website_url IS 'User personal website URL';
COMMENT ON COLUMN users.role IS 'User role (formerly instructor role)';
