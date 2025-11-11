-- Migration: Add social media profiles to users
-- Description: Adds LinkedIn and Twitter URL columns to users table

-- Add social media profile URLs to users table
-- This allows each admin to share posts from their own accounts

ALTER TABLE users ADD COLUMN IF NOT EXISTS linkedin_url VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS twitter_url VARCHAR(255);

-- Add comments for documentation
COMMENT ON COLUMN users.linkedin_url IS 'User LinkedIn profile URL for sharing posts';
COMMENT ON COLUMN users.twitter_url IS 'User Twitter profile URL for sharing posts';
