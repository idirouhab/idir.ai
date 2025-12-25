-- Migration: 032_create_course_checklists
-- Description: Create course checklists table for pre-course requirements
-- Created: 2025-12-25

-- Create course_checklists table
CREATE TABLE IF NOT EXISTS course_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Course relation
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Checklist info
  title TEXT NOT NULL,
  description TEXT,

  -- Checklist items stored as JSONB array
  -- Structure: [{ id, title, description, order, type }]
  items JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Configuration
  is_required BOOLEAN DEFAULT false, -- Must be completed before accessing course
  display_order INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT title_not_empty CHECK (title <> ''),
  CONSTRAINT unique_course_checklist UNIQUE(course_id) -- One checklist per course
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_course_checklists_course_id ON course_checklists(course_id);
CREATE INDEX IF NOT EXISTS idx_course_checklists_required ON course_checklists(is_required) WHERE is_required = true;
CREATE INDEX IF NOT EXISTS idx_course_checklists_items ON course_checklists USING GIN(items);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_course_checklists_updated_at ON course_checklists;
CREATE TRIGGER update_course_checklists_updated_at
  BEFORE UPDATE ON course_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE course_checklists ENABLE ROW LEVEL SECURITY;

-- Public can read checklists for published courses
CREATE POLICY "Public can read checklists for published courses"
  ON course_checklists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_checklists.course_id
      AND courses.status = 'published'
    )
  );

-- Authenticated users (admin) can manage
CREATE POLICY "Authenticated users can manage checklists"
  ON course_checklists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE course_checklists IS 'Pre-course checklists/requirements for courses';
COMMENT ON COLUMN course_checklists.items IS 'JSONB array of checklist items: [{ id, title, description, order, type }]';
COMMENT ON COLUMN course_checklists.is_required IS 'If true, students must complete before accessing course content';

/*
Expected items JSONB structure:
[
  {
    "id": "item-1",
    "title": "Install Node.js 18+",
    "description": "Download and install from nodejs.org",
    "order": 1,
    "type": "task"
  },
  {
    "id": "item-2",
    "title": "Complete pre-course survey",
    "description": "Fill out the Google Form linked below",
    "order": 2,
    "type": "task"
  }
]

Future types: "task", "link", "upload", "quiz"
*/
