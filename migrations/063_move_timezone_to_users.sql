-- Migration: 063_move_timezone_to_users
-- Description: Move timezone from instructor_profiles to users table
-- This makes timezone available for both students and instructors
-- Created: 2025-12-30

-- Step 1: Add timezone column to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'Europe/Berlin';

-- Add comment for clarity
COMMENT ON COLUMN users.timezone IS 'IANA timezone string (e.g., America/New_York, Europe/London) - used for scheduling and date display';

-- Step 2: Migrate existing timezone data from instructor_profiles to users
-- Only update users that have an instructor profile with a non-null timezone
UPDATE users u
SET timezone = ip.timezone
FROM instructor_profiles ip
WHERE u.id = ip.user_id
  AND ip.timezone IS NOT NULL
  AND ip.timezone != '';

-- Step 3: Drop timezone column from instructor_profiles
ALTER TABLE instructor_profiles
DROP COLUMN IF EXISTS timezone;

-- Create index for timezone queries (optional but useful for filtering/grouping)
CREATE INDEX IF NOT EXISTS idx_users_timezone ON users(timezone);
