-- Create quiz_scores table
CREATE TABLE IF NOT EXISTS quiz_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  max_streak INTEGER NOT NULL DEFAULT 0,
  language VARCHAR(10) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Add indexes for common queries
  CONSTRAINT score_check CHECK (score >= 0 AND score <= total_questions),
  CONSTRAINT username_check CHECK (LENGTH(TRIM(username)) >= 2)
);

-- Create index for faster queries
CREATE INDEX idx_quiz_scores_username ON quiz_scores(username);
CREATE INDEX idx_quiz_scores_completed_at ON quiz_scores(completed_at DESC);
CREATE INDEX idx_quiz_scores_language ON quiz_scores(language);
CREATE INDEX idx_quiz_scores_score ON quiz_scores(score DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE quiz_scores ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert their own scores
CREATE POLICY "Anyone can insert quiz scores"
  ON quiz_scores
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to read all scores (for leaderboard)
CREATE POLICY "Anyone can read quiz scores"
  ON quiz_scores
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Add comment
COMMENT ON TABLE quiz_scores IS 'Stores quiz game scores for all users';
