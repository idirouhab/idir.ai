-- Migration: 042_extend_user_role_enum
-- Description: Extends user_role ENUM to support student and instructor roles
-- This prepares for consolidating students and instructors into the users table
-- Created: 2025-12-28

-- Add student and instructor values to the user_role ENUM
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'student';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'instructor';

-- Comments
COMMENT ON TYPE user_role IS 'User roles: owner (full access), admin (can publish), blogger (draft-only), student (course enrollment), instructor (teaching)';
