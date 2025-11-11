-- Migration: Add sent_at to newsletter feedback
-- Description: Adds sent_at column to track when feedback emails were sent to subscribers

-- Simple feedback tracking: track when we last sent feedback email
-- Allows resending after X days

-- Step 1: Add sent_at column to track last time we sent feedback email
ALTER TABLE newsletter_feedback
ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

-- Step 2: Update sent_at for existing records (set to responded_at if exists)
UPDATE newsletter_feedback
SET sent_at = responded_at
WHERE sent_at IS NULL AND responded_at IS NOT NULL;

-- Step 3: Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_newsletter_feedback_sent ON newsletter_feedback(sent_at);

-- Step 4: Add comment
COMMENT ON COLUMN newsletter_feedback.sent_at IS 'Timestamp when the feedback email was last sent to the subscriber';

-- Migration Notes:
-- After this migration:
-- - sent_at tracks the LAST TIME we sent feedback email
-- - We can resend to the same user after X days by checking sent_at
-- - When user responds: responded_at and feedback_type are set
-- - When admin marks answered: answered_at is set
