-- Create course_sessions table
-- This table stores scheduled sessions/classes for courses
-- Sessions are optional - courses can have zero or many sessions

CREATE TABLE IF NOT EXISTS course_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_date TIMESTAMPTZ NOT NULL,  -- Stored in UTC
  duration_minutes INTEGER NOT NULL,   -- Duration in minutes (e.g., 120 for 2 hours)
  display_order INTEGER DEFAULT 0,     -- For ordering sessions
  timezone VARCHAR(100) NOT NULL,      -- IANA timezone (e.g., 'America/New_York')
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT fk_course FOREIGN KEY (course_id)
    REFERENCES courses(id) ON DELETE CASCADE,

  CONSTRAINT positive_duration CHECK (duration_minutes > 0)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_sessions_course_id ON course_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_course_sessions_date ON course_sessions(session_date);

-- Add comment
COMMENT ON TABLE course_sessions IS 'Stores scheduled sessions/classes for courses. Sessions are optional.';
COMMENT ON COLUMN course_sessions.session_date IS 'Session start date/time stored in UTC';
COMMENT ON COLUMN course_sessions.timezone IS 'IANA timezone for display purposes (e.g., America/New_York)';
COMMENT ON COLUMN course_sessions.duration_minutes IS 'Session duration in minutes';
