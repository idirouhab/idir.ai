-- Add timezone column to instructor_profiles table
ALTER TABLE instructor_profiles
ADD COLUMN IF NOT EXISTS timezone VARCHAR(100) DEFAULT 'America/New_York';

-- Add comment for clarity
COMMENT ON COLUMN instructor_profiles.timezone IS 'IANA timezone string (e.g., America/New_York, Europe/London)';
