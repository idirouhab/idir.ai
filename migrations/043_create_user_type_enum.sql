-- Migration: 043_create_user_type_enum
-- Description: Creates user_type ENUM for the new users table
-- This distinguishes between students and instructors
-- Created: 2025-12-28

-- Create user_type ENUM
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('student', 'instructor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Comments
COMMENT ON TYPE user_type IS 'User types for platform users: student (course enrollment), instructor (teaching)';
