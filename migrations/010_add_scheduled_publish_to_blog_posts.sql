-- Migration: Add scheduled_publish_at to blog_posts
-- Description: Allows scheduling posts to be published at a future date/time
-- Author: Claude Code
-- Date: 2025-11-12

-- Add scheduled_publish_at column
ALTER TABLE blog_posts
ADD COLUMN scheduled_publish_at TIMESTAMP WITH TIME ZONE NULL;

-- Add index for efficient querying of scheduled posts
CREATE INDEX idx_blog_posts_scheduled_publish
ON blog_posts(scheduled_publish_at)
WHERE scheduled_publish_at IS NOT NULL AND status = 'draft';

-- Add comment explaining the field
COMMENT ON COLUMN blog_posts.scheduled_publish_at IS 'When set with status=draft, post will be auto-published at this time. NULL means no scheduling.';
