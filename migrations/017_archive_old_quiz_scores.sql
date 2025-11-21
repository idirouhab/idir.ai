-- Archive old quiz scores and reset for new game rules
-- This ensures fair competition with the new 8-question, millisecond-precision system

-- Create archive table to preserve old scores
CREATE TABLE IF NOT EXISTS quiz_scores_archive (
  id UUID PRIMARY KEY,
  username VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  max_streak INTEGER NOT NULL DEFAULT 0,
  language VARCHAR(10) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  final_score INTEGER DEFAULT 0,
  total_time_seconds INTEGER DEFAULT 0,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archive_reason VARCHAR(100) DEFAULT 'v1_to_v2_migration'
);

-- Copy all existing scores to archive
INSERT INTO quiz_scores_archive (
  id,
  username,
  score,
  total_questions,
  max_streak,
  language,
  completed_at,
  final_score,
  total_time_seconds,
  archived_at,
  archive_reason
)
SELECT
  id,
  username,
  score,
  total_questions,
  max_streak,
  language,
  completed_at,
  final_score,
  total_time_seconds,
  NOW(),
  'v1_to_v2_migration'
FROM quiz_scores;

-- Clear all current scores to start fresh with new rules
TRUNCATE TABLE quiz_scores;

-- Add comment
COMMENT ON TABLE quiz_scores_archive IS 'Archive of quiz scores before v2 update (8 questions, millisecond precision)';
