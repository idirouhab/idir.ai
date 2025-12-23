-- Migration: Remove full_name from course_signups
-- Description: Removes full_name column as student data is now normalized in students table
-- Related: 029_add_student_id_to_course_signups.sql (normalized student data)

-- Remove full_name column (student names are now in students table)
ALTER TABLE course_signups
  DROP COLUMN IF EXISTS full_name CASCADE;

-- Update table comment to reflect current structure
COMMENT ON TABLE course_signups IS 'Course signup records - links students to courses via student_id foreign key';
