-- Migration: 036_add_role_to_instructors_table
-- Description: Adds role column to instructors table
-- Created: 2025-12-25

BEGIN;

-- 1) Add role column (default instructor)
ALTER TABLE instructors
    ADD COLUMN IF NOT EXISTS role VARCHAR(50) NOT NULL DEFAULT 'instructor';

-- 2) Add constraint for valid roles
-- (adjust roles depending on your needs)
ALTER TABLE instructors
DROP CONSTRAINT IF EXISTS valid_instructor_role;

ALTER TABLE instructors
    ADD CONSTRAINT valid_instructor_role
        CHECK (role IN ('instructor', 'admin'));

-- 3) Index for performance
CREATE INDEX IF NOT EXISTS idx_instructors_role ON instructors(role);

-- 4) Comment
COMMENT ON COLUMN instructors.role IS 'Instructor role (e.g., instructor, admin)';

COMMIT;
