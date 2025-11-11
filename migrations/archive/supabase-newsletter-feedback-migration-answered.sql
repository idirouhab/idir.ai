-- Add answered_at column to newsletter_feedback table
-- Run this migration to add tracking for when feedback was answered

ALTER TABLE newsletter_feedback
ADD COLUMN IF NOT EXISTS answered_at TIMESTAMPTZ;

-- Create index for faster queries on answered status
CREATE INDEX IF NOT EXISTS idx_newsletter_feedback_answered ON newsletter_feedback(answered_at);

-- Add comment
COMMENT ON COLUMN newsletter_feedback.answered_at IS 'Timestamp when the feedback was answered/responded to by admin';
