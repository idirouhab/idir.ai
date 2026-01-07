-- Migration: Remove newsletter feedback functionality
-- Description: Drops the newsletter_feedback table and all related objects

-- Drop the newsletter_feedback table and all its dependencies
DROP TABLE IF EXISTS newsletter_feedback CASCADE;

-- Note: This will remove:
-- - The newsletter_feedback table
-- - All indexes: idx_newsletter_feedback_email, idx_newsletter_feedback_date,
--   idx_newsletter_feedback_type, idx_newsletter_feedback_answered, idx_newsletter_feedback_sent
-- - All RLS policies
-- - All data in the table (irreversible)

COMMENT ON SCHEMA public IS 'Newsletter feedback functionality removed';
