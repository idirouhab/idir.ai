-- Migration: 067_add_cancelled_expired_signup_statuses
-- Description: Add 'cancelled' and 'expired' statuses to course_signups
-- Created: 2026-01-08

-- Add CHECK constraint to include the new statuses
-- First, drop the old constraint if it exists (if there was one defined in the table)
-- Note: The original migrations didn't explicitly define a CHECK constraint for signup_status,
-- so we're adding one now to enforce the valid values

-- Add a constraint to validate signup_status values
ALTER TABLE course_signups
  DROP CONSTRAINT IF EXISTS valid_signup_status;

ALTER TABLE course_signups
  ADD CONSTRAINT valid_signup_status
  CHECK (signup_status IN ('pending', 'confirmed', 'enrolled', 'cancelled', 'expired'));

-- Update comments for documentation
COMMENT ON COLUMN course_signups.signup_status IS 'Status: pending (awaiting confirmation), confirmed (spot confirmed), enrolled (active in course), cancelled (user chose to leave), expired (failed to confirm within time limit)';