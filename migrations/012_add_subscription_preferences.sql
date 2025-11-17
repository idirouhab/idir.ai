-- Migration: Add subscription preferences
-- Description: Adds columns to track different subscription types (newsletter/AI news, podcast)
-- Author: Claude Code
-- Date: 2025-11-16

-- Drop old columns if they exist (for idempotency)
ALTER TABLE newsletter_subscribers DROP COLUMN IF EXISTS subscribe_ai_news;

-- Add subscription preference columns
ALTER TABLE newsletter_subscribers
ADD COLUMN IF NOT EXISTS subscribe_newsletter BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS subscribe_podcast BOOLEAN DEFAULT false;

-- Drop old indexes if they exist
DROP INDEX IF EXISTS idx_newsletter_preferences_ai_news;

-- Add indexes for faster filtering
CREATE INDEX IF NOT EXISTS idx_newsletter_preferences_newsletter ON newsletter_subscribers(subscribe_newsletter) WHERE subscribe_newsletter = true;
CREATE INDEX IF NOT EXISTS idx_newsletter_preferences_podcast ON newsletter_subscribers(subscribe_podcast) WHERE subscribe_podcast = true;

-- Add comments for documentation
COMMENT ON COLUMN newsletter_subscribers.subscribe_newsletter IS 'Whether user is subscribed to newsletter/AI news updates (daily AI news)';
COMMENT ON COLUMN newsletter_subscribers.subscribe_podcast IS 'Whether user is subscribed to podcast episode notifications (Spanish only)';

-- Update the is_subscribed column logic:
-- A user is considered "subscribed" if they have at least one active subscription
-- This maintains backward compatibility
COMMENT ON COLUMN newsletter_subscribers.is_subscribed IS 'Overall subscription status - true if user has at least one active subscription type';
