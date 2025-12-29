-- Migration: 052_drop_old_students_and_instructors_tables
-- Description: Drops the old students and instructors tables after migration
-- Only run this after verifying all data has been successfully migrated
-- Created: 2025-12-28

-- Safety check: Verify that all students have been migrated
DO $$
DECLARE
  students_count INTEGER;
  users_with_student_profiles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO students_count FROM students;
  SELECT COUNT(*) INTO users_with_student_profiles_count FROM student_profiles;

  IF students_count != users_with_student_profiles_count THEN
    RAISE EXCEPTION 'Migration mismatch: % students but % student_profiles. Aborting drop.',
      students_count, users_with_student_profiles_count;
  END IF;

  RAISE NOTICE 'Student migration verified: % records', students_count;
END $$;

-- Safety check: Verify that all instructors have been migrated
DO $$
DECLARE
  instructors_count INTEGER;
  users_with_instructor_profiles_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO instructors_count FROM instructors;
  SELECT COUNT(*) INTO users_with_instructor_profiles_count FROM instructor_profiles;

  IF instructors_count != users_with_instructor_profiles_count THEN
    RAISE EXCEPTION 'Migration mismatch: % instructors but % instructor_profiles. Aborting drop.',
      instructors_count, users_with_instructor_profiles_count;
  END IF;

  RAISE NOTICE 'Instructor migration verified: % records', instructors_count;
END $$;

-- Drop the old students table
DROP TABLE IF EXISTS students CASCADE;

-- Drop the old instructors table
DROP TABLE IF EXISTS instructors CASCADE;

-- Log completion
DO $$
BEGIN
  RAISE NOTICE 'Old students and instructors tables have been dropped successfully';
  RAISE NOTICE 'Migration to unified users table with separate profiles is complete';
END $$;
