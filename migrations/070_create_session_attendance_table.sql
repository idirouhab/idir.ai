-- Migration: Create session_attendance table
-- Purpose: Track student attendance for each course session
-- Instructor-only access via RLS policies

-- Create session_attendance table
CREATE TABLE IF NOT EXISTS session_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES course_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  signup_id UUID NOT NULL REFERENCES course_signups(id) ON DELETE CASCADE,
  attendance_status VARCHAR(20) NOT NULL DEFAULT 'absent' CHECK (attendance_status IN ('present', 'absent')),
  marked_by UUID NOT NULL REFERENCES users(id), -- Instructor who marked attendance
  marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT, -- Optional instructor notes
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Prevent duplicate entries for same student/session
  UNIQUE(session_id, student_id)
);

-- Create indexes for performance
CREATE INDEX idx_attendance_session ON session_attendance(session_id);
CREATE INDEX idx_attendance_student ON session_attendance(student_id);
CREATE INDEX idx_attendance_signup ON session_attendance(signup_id);
CREATE INDEX idx_attendance_status ON session_attendance(attendance_status);
CREATE INDEX idx_attendance_marked_by ON session_attendance(marked_by);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_attendance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_attendance_updated_at
  BEFORE UPDATE ON session_attendance
  FOR EACH ROW
  EXECUTE FUNCTION update_attendance_updated_at();

-- Add comment for documentation
COMMENT ON TABLE session_attendance IS 'Tracks student attendance for each course session. Instructor-only access via RLS.';
COMMENT ON COLUMN session_attendance.attendance_status IS 'Student attendance status: present or absent';
COMMENT ON COLUMN session_attendance.marked_by IS 'Instructor user ID who marked the attendance';
COMMENT ON COLUMN session_attendance.notes IS 'Optional notes from instructor about attendance';
