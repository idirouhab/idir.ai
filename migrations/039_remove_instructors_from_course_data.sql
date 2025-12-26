-- Migration: 039_remove_instructors_from_course_data
-- Description: Removes the instructors field from course_data JSONB as we now use course_instructors table
-- Created: 2025-12-26

BEGIN;

-- Remove the 'instructors' key from course_data JSONB column for all courses
UPDATE courses
SET course_data = course_data - 'instructors'
WHERE course_data ? 'instructors';

-- Add a comment to document this change
COMMENT ON COLUMN courses.course_data IS 'JSON data for course content (benefits, curriculum, pricing, etc). Instructors are managed via course_instructors table.';

COMMIT;
