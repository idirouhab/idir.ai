-- Add time tracking fields to quiz_scores table
ALTER TABLE quiz_scores
  ADD COLUMN total_time_seconds INTEGER DEFAULT 0,
  ADD COLUMN final_score INTEGER DEFAULT 0;

-- Add comment
COMMENT ON COLUMN quiz_scores.total_time_seconds IS 'Total time taken to complete the quiz in seconds';
COMMENT ON COLUMN quiz_scores.final_score IS 'Final calculated score including time bonus (higher is better)';

-- Update existing records to have a final_score based on their current score
-- This assumes 1000 points per correct answer for backwards compatibility
UPDATE quiz_scores
SET final_score = score * 1000
WHERE final_score = 0;

-- Create index for faster leaderboard queries
CREATE INDEX idx_quiz_scores_final_score ON quiz_scores(final_score DESC);
