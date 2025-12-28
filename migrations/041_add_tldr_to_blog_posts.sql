-- Migration: 041_add_tldr_to_blog_posts
-- Description: Adds tldr (TL;DR/key takeaways) field to blog_posts table for LLM-friendly summaries
-- Created: 2025-12-28

-- Add tldr column to blog_posts table
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS tldr TEXT;

-- Add comment
COMMENT ON COLUMN blog_posts.tldr IS 'TL;DR summary / key takeaways for the blog post (3-5 bullet points). LLM-friendly "Answer Kit" for AI search engines.';

-- Create index for full-text search on tldr if needed in future
-- CREATE INDEX IF NOT EXISTS idx_blog_posts_tldr ON blog_posts USING gin(to_tsvector('english', tldr));
