-- Migration: 035_add_social_media_to_instructors
-- Description: Adds social media link columns to instructors table
-- Created: 2025-12-25

-- Add social media link columns
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS x_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT;

-- Add comments for new columns
COMMENT ON COLUMN instructors.linkedin_url IS 'LinkedIn profile URL';
COMMENT ON COLUMN instructors.website_url IS 'Personal or professional website URL';
COMMENT ON COLUMN instructors.x_url IS 'X.com (formerly Twitter) profile URL';
COMMENT ON COLUMN instructors.youtube_url IS 'YouTube channel URL';
