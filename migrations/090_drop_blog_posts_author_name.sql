-- Migration: Drop author_name from blog_posts
-- Description: author_name is derived via join with users; no longer stored

ALTER TABLE blog_posts
  DROP COLUMN IF EXISTS author_name;

