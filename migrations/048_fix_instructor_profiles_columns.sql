-- Migration: 048_fix_instructor_profiles_columns
-- Description: Fixes instructor_profiles table to match actual instructors table columns
-- Renames twitter_url to x_url, removes github_url, adds youtube_url
-- Created: 2025-12-28

-- Drop constraints that reference columns we're changing
ALTER TABLE instructor_profiles
  DROP CONSTRAINT IF EXISTS valid_twitter_url,
  DROP CONSTRAINT IF EXISTS valid_github_url;

-- Rename twitter_url to x_url if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'instructor_profiles' AND column_name = 'twitter_url'
  ) THEN
    ALTER TABLE instructor_profiles RENAME COLUMN twitter_url TO x_url;
  END IF;
END $$;

-- Drop github_url if it exists (not in original instructors table)
ALTER TABLE instructor_profiles
  DROP COLUMN IF EXISTS github_url CASCADE;

-- Add youtube_url if it doesn't exist
ALTER TABLE instructor_profiles
  ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add x_url if it doesn't exist (in case rename didn't work)
ALTER TABLE instructor_profiles
  ADD COLUMN IF NOT EXISTS x_url TEXT;

-- Add constraints for the corrected columns
DO $$
BEGIN
  -- Add x_url constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_x_url'
  ) THEN
    ALTER TABLE instructor_profiles
      ADD CONSTRAINT valid_x_url CHECK (x_url IS NULL OR x_url ~ '^https?://');
  END IF;

  -- Add youtube_url constraint if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'valid_youtube_url'
  ) THEN
    ALTER TABLE instructor_profiles
      ADD CONSTRAINT valid_youtube_url CHECK (youtube_url IS NULL OR youtube_url ~ '^https?://');
  END IF;
END $$;

-- Update comments
COMMENT ON COLUMN instructor_profiles.x_url IS 'X.com (formerly Twitter) profile URL';
COMMENT ON COLUMN instructor_profiles.youtube_url IS 'YouTube channel URL';

-- Log changes
DO $$
BEGIN
  RAISE NOTICE 'Fixed instructor_profiles columns: twitter_url→x_url, removed github_url, added youtube_url';
END $$;
