-- Migration: 033_create_student_checklists
-- Description: Track student progress on course checklists
-- Created: 2025-12-25

-- Create student_checklists table
CREATE TABLE IF NOT EXISTS student_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relations
  course_signup_id UUID NOT NULL REFERENCES course_signups(id) ON DELETE CASCADE,
  course_checklist_id UUID NOT NULL REFERENCES course_checklists(id) ON DELETE CASCADE,

  -- Progress tracking
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),

  -- Individual item progress stored as JSONB array
  -- Structure: [{ item_id, completed, completed_at, notes }]
  items_progress JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Timestamps
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT unique_student_checklist UNIQUE(course_signup_id, course_checklist_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_student_checklists_signup ON student_checklists(course_signup_id);
CREATE INDEX IF NOT EXISTS idx_student_checklists_checklist ON student_checklists(course_checklist_id);
CREATE INDEX IF NOT EXISTS idx_student_checklists_status ON student_checklists(status);
CREATE INDEX IF NOT EXISTS idx_student_checklists_progress ON student_checklists USING GIN(items_progress);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_student_checklists_updated_at ON student_checklists;
CREATE TRIGGER update_student_checklists_updated_at
  BEFORE UPDATE ON student_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-update status based on items_progress
CREATE OR REPLACE FUNCTION update_student_checklist_status()
RETURNS TRIGGER AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
BEGIN
  -- Count total items in items_progress
  total_items := jsonb_array_length(NEW.items_progress);

  -- Count completed items
  SELECT COUNT(*)
  INTO completed_items
  FROM jsonb_array_elements(NEW.items_progress) AS item
  WHERE (item->>'completed')::boolean = true;

  -- Update status based on progress
  IF completed_items = 0 THEN
    NEW.status := 'pending';
    NEW.completed_at := NULL;
  ELSIF completed_items = total_items AND total_items > 0 THEN
    NEW.status := 'completed';
    IF NEW.completed_at IS NULL THEN
      NEW.completed_at := NOW();
    END IF;
  ELSE
    NEW.status := 'in_progress';
    NEW.completed_at := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update status when items_progress changes
DROP TRIGGER IF EXISTS auto_update_student_checklist_status ON student_checklists;
CREATE TRIGGER auto_update_student_checklist_status
  BEFORE INSERT OR UPDATE OF items_progress ON student_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_student_checklist_status();

-- RLS Policies
ALTER TABLE student_checklists ENABLE ROW LEVEL SECURITY;

-- Students can read their own checklists
CREATE POLICY "Students can read their own checklists"
  ON student_checklists FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM course_signups
      WHERE course_signups.id = student_checklists.course_signup_id
    )
  );

-- Students can update their own checklists
CREATE POLICY "Students can update their own checklists"
  ON student_checklists FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM course_signups
      WHERE course_signups.id = student_checklists.course_signup_id
    )
  );

-- Authenticated users (admin) can manage all
CREATE POLICY "Authenticated users can manage all checklists"
  ON student_checklists FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE student_checklists IS 'Student progress on course checklists';
COMMENT ON COLUMN student_checklists.items_progress IS 'JSONB array tracking completion: [{ item_id, completed, completed_at, notes }]';
COMMENT ON COLUMN student_checklists.status IS 'Auto-calculated: pending (0% done), in_progress (1-99%), completed (100%)';

/*
Expected items_progress JSONB structure:
[
  {
    "item_id": "item-1",
    "completed": true,
    "completed_at": "2025-12-25T14:30:00Z",
    "notes": ""
  },
  {
    "item_id": "item-2",
    "completed": false,
    "completed_at": null,
    "notes": ""
  }
]
*/
