-- Add session_id column to course_materials table
-- This allows materials to be attached to either:
-- 1. The entire course (session_id = NULL)
-- 2. A specific session (session_id = UUID)

-- Add nullable session_id column
ALTER TABLE course_materials
ADD COLUMN IF NOT EXISTS session_id UUID;

-- Add foreign key constraint with CASCADE delete
-- When a session is deleted, its materials are also deleted
ALTER TABLE course_materials
ADD CONSTRAINT fk_session FOREIGN KEY (session_id)
  REFERENCES course_sessions(id) ON DELETE CASCADE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_course_materials_session_id ON course_materials(session_id);

-- Add comment for clarity
COMMENT ON COLUMN course_materials.session_id IS 'NULL = course-level material, NOT NULL = session-specific material';
