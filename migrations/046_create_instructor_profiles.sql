-- Migration: 046_create_instructor_profiles
-- Description: Creates instructor_profiles table for instructor-specific data
-- Links to users table via user_id (one-to-one optional relationship)
-- Created: 2025-12-28

-- Create instructor_role ENUM for role field
DO $$ BEGIN
  CREATE TYPE instructor_role AS ENUM ('admin', 'instructor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS instructor_profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

  -- Instructor-specific fields
  title VARCHAR(255), -- e.g., "PhD in Computer Science", "Senior Engineer"
  description TEXT, -- Bio/description
  picture_url TEXT, -- Profile picture URL

  -- Social Media
  linkedin_url TEXT,
  x_url TEXT,
  youtube_url TEXT,
  website_url TEXT,

  -- Role within instructor context (admin instructor vs regular instructor)
  role instructor_role DEFAULT 'instructor',

  -- Preferences
  preferred_language VARCHAR(2) DEFAULT 'es' CHECK (preferred_language IN ('en', 'es')),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_linkedin_url CHECK (linkedin_url IS NULL OR linkedin_url ~ '^https?://'),
  CONSTRAINT valid_x_url CHECK (x_url IS NULL OR x_url ~ '^https?://'),
  CONSTRAINT valid_youtube_url CHECK (youtube_url IS NULL OR youtube_url ~ '^https?://'),
  CONSTRAINT valid_website_url CHECK (website_url IS NULL OR website_url ~ '^https?://')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_role ON instructor_profiles(role);
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_preferred_language ON instructor_profiles(preferred_language);
CREATE INDEX IF NOT EXISTS idx_instructor_profiles_created_at ON instructor_profiles(created_at DESC);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_instructor_profiles_updated_at ON instructor_profiles;
CREATE TRIGGER update_instructor_profiles_updated_at
  BEFORE UPDATE ON instructor_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;

-- Instructors can read their own profile
DROP POLICY IF EXISTS "Instructors can read own profile" ON instructor_profiles;
CREATE POLICY "Instructors can read own profile"
  ON instructor_profiles FOR SELECT
  TO authenticated
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Instructors can update their own profile
DROP POLICY IF EXISTS "Instructors can update own profile" ON instructor_profiles;
CREATE POLICY "Instructors can update own profile"
  ON instructor_profiles FOR UPDATE
  TO authenticated
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId')
  WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Public can view active instructor profiles (for course pages)
DROP POLICY IF EXISTS "Public can view instructor profiles" ON instructor_profiles;
CREATE POLICY "Public can view instructor profiles"
  ON instructor_profiles FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = instructor_profiles.user_id
      AND users.is_active = true
    )
  );

-- Service role can manage all instructor profiles
DROP POLICY IF EXISTS "Service role can manage instructor profiles" ON instructor_profiles;
CREATE POLICY "Service role can manage instructor profiles"
  ON instructor_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE instructor_profiles IS 'Instructor-specific profile data (linked to users table)';
COMMENT ON COLUMN instructor_profiles.user_id IS 'Foreign key to users table (primary key)';
COMMENT ON COLUMN instructor_profiles.title IS 'Professional title or credential';
COMMENT ON COLUMN instructor_profiles.description IS 'Instructor bio/description';
COMMENT ON COLUMN instructor_profiles.picture_url IS 'URL to instructor profile picture';
COMMENT ON COLUMN instructor_profiles.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN instructor_profiles.x_url IS 'X.com (formerly Twitter) profile URL';
COMMENT ON COLUMN instructor_profiles.youtube_url IS 'YouTube channel URL';
COMMENT ON COLUMN instructor_profiles.website_url IS 'Personal website URL';
COMMENT ON COLUMN instructor_profiles.role IS 'Instructor role: admin (can manage courses) or instructor (teaches only)';
COMMENT ON COLUMN instructor_profiles.preferred_language IS 'Preferred language for teaching (en or es)';
