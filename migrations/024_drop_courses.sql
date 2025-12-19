-- Migration: Drop courses table
-- Description: Removes courses table and all related objects (not needed, using static pages)

-- Drop policies first
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Authenticated users can manage courses" ON courses;

-- Drop function
DROP FUNCTION IF EXISTS increment_course_views(UUID);

-- Drop indexes (they'll be dropped with the table, but listing for clarity)
DROP INDEX IF EXISTS idx_courses_status;
DROP INDEX IF EXISTS idx_courses_published_at;
DROP INDEX IF EXISTS idx_courses_category;
DROP INDEX IF EXISTS idx_courses_language;
DROP INDEX IF EXISTS idx_courses_slug;
DROP INDEX IF EXISTS idx_courses_translation_group;
DROP INDEX IF EXISTS idx_courses_tags;
DROP INDEX IF EXISTS idx_courses_course_type;

-- Drop trigger
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;

-- Drop the table
DROP TABLE IF EXISTS courses CASCADE;

-- Note: course_signups table is preserved as it's still used for static course pages
