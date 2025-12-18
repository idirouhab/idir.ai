-- Migration: Create courses table
-- Description: Creates courses table with multilingual support, draft/publish functionality, and RLS policies

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL, -- Short description/excerpt
  content TEXT NOT NULL, -- Full markdown course content
  cover_image TEXT,

  -- SEO
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Organization
  category TEXT NOT NULL CHECK (category IN ('automation', 'ai', 'productivity', 'business', 'other')),
  tags TEXT[] DEFAULT '{}',

  -- Course Details
  level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
  duration_hours INTEGER, -- Estimated duration in hours
  prerequisites TEXT[], -- Array of prerequisite courses or skills
  course_type TEXT DEFAULT 'free' CHECK (course_type IN ('free', 'paid', 'waitlist')),

  -- Internationalization
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),
  translation_group_id UUID, -- Links translated versions of the same course

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,
  scheduled_publish_at TIMESTAMPTZ,

  -- Stats
  enrollment_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,

  -- Author
  author_id UUID,
  author_name TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT slug_not_empty CHECK (slug <> ''),
  CONSTRAINT title_not_empty CHECK (title <> ''),
  CONSTRAINT description_not_empty CHECK (description <> ''),
  CONSTRAINT valid_published_date CHECK (
    (status = 'published' AND published_at IS NOT NULL) OR
    (status = 'draft')
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_courses_published_at ON courses(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_language ON courses(language);
CREATE INDEX IF NOT EXISTS idx_courses_slug ON courses(slug);
CREATE INDEX IF NOT EXISTS idx_courses_translation_group ON courses(translation_group_id);
CREATE INDEX IF NOT EXISTS idx_courses_tags ON courses USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_courses_course_type ON courses(course_type);

-- Trigger to auto-update updated_at (reuse existing function)
DROP TRIGGER IF EXISTS update_courses_updated_at ON courses;
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies (Row Level Security)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;

-- Public can read published courses
CREATE POLICY "Published courses are viewable by everyone"
  ON courses FOR SELECT
  USING (status = 'published');

-- Authenticated users (admin) can do everything
CREATE POLICY "Authenticated users can manage courses"
  ON courses FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to increment course view count
CREATE OR REPLACE FUNCTION increment_course_views(course_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE courses
  SET view_count = view_count + 1
  WHERE id = course_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon users (public can view courses)
GRANT EXECUTE ON FUNCTION increment_course_views(UUID) TO anon;

-- Update course_signups table to add foreign key reference
-- First, remove the old constraint if it exists
ALTER TABLE course_signups DROP CONSTRAINT IF EXISTS valid_course;

-- Add foreign key relationship (optional - allows orphaned signups if course deleted)
-- We'll keep it optional for now to maintain backward compatibility with 'automation-101'
-- Future: Add foreign key constraint after migrating existing data

-- Comments for documentation
COMMENT ON TABLE courses IS 'Course content with markdown, categories: automation, ai, productivity, business, other';
COMMENT ON COLUMN courses.slug IS 'URL-friendly identifier, e.g., automation-101';
COMMENT ON COLUMN courses.content IS 'Markdown formatted course content';
COMMENT ON COLUMN courses.category IS 'One of: automation, ai, productivity, business, other';
COMMENT ON COLUMN courses.status IS 'draft or published';
COMMENT ON COLUMN courses.translation_group_id IS 'Groups courses that are translations of each other';
COMMENT ON COLUMN courses.course_type IS 'free, paid, or waitlist - determines signup flow';
