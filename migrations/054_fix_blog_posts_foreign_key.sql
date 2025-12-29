-- Migration: 054_fix_blog_posts_foreign_key
-- Description: Updates blog_posts.author_id to reference admin_users instead of users
-- Since users table was renamed to admin_users for platform administrators
-- Created: 2025-12-28

-- Drop the old foreign key constraint
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;

-- Add new foreign key constraint pointing to admin_users table
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES admin_users(id)
    ON DELETE SET NULL;

-- Update comments
COMMENT ON COLUMN blog_posts.author_id IS 'Foreign key to admin_users table (blog post author)';

-- Verify the constraint
DO $$
DECLARE
  invalid_count INTEGER;
BEGIN
  -- Check for any orphaned records (author_id not in admin_users)
  SELECT COUNT(*)
  INTO invalid_count
  FROM blog_posts
  WHERE author_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM admin_users WHERE id = blog_posts.author_id);

  IF invalid_count > 0 THEN
    RAISE WARNING 'Found % blog_posts with invalid author_id references', invalid_count;
  ELSE
    RAISE NOTICE 'All blog_posts.author_id references are valid';
  END IF;
END $$;
