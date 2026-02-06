-- Migration: Add is_private column to courses table
-- Description: Adds ability to create private courses that won't show on public website

-- Add is_private column (defaults to false for existing courses)
ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false NOT NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_is_private ON courses(is_private);

-- Update RLS policy to exclude private courses from public view
-- Drop existing policy first
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;

-- Recreate policy with private course filtering
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (status = 'published' AND is_private = false);

-- Comment for documentation
COMMENT ON COLUMN courses.is_private IS 'When true, course is only visible to authenticated users (for private/corporate courses)';
