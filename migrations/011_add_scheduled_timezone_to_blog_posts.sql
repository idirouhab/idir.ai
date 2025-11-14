-- Migration: Add scheduled_timezone to blog_posts
-- Description: Stores the timezone used when scheduling a post
-- Author: Claude Code
-- Date: 2025-11-14

-- Add scheduled_timezone column
ALTER TABLE blog_posts
ADD COLUMN scheduled_timezone VARCHAR(100) DEFAULT 'Europe/Berlin';

-- Add comment explaining the field
COMMENT ON COLUMN blog_posts.scheduled_timezone IS 'IANA timezone identifier (e.g., "America/New_York") used when scheduling the post. Defaults to Europe/Berlin.';
