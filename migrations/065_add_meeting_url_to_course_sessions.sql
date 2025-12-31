-- Add meeting_url column to course_sessions table
-- This allows instructors to add video conference links (Zoom, Google Meet, etc.) to sessions

ALTER TABLE course_sessions
ADD COLUMN meeting_url VARCHAR(500);

-- Add comment
COMMENT ON COLUMN course_sessions.meeting_url IS 'Optional video conference URL (Google Meet, Zoom, etc.)';
