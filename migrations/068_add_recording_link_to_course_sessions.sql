-- Add recording_link column to course_sessions table
-- This allows instructors to add links to recorded sessions for students to access later

ALTER TABLE course_sessions
ADD COLUMN recording_link VARCHAR(500);

-- Add comment
COMMENT ON COLUMN course_sessions.recording_link IS 'Optional link to recorded session (e.g., YouTube, Vimeo, Google Drive)';