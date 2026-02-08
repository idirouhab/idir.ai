-- Migration: 086_remove_legacy_admin_users
-- Description: Removes legacy admin_users system and points blog_posts to users
-- Created: 2026-02-08

-- Drop legacy FK first to allow cleanup when author_id is not in admin_users
ALTER TABLE blog_posts
  DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;

-- If an admin_user email already exists in users, re-point blog_posts.author_id to that user id
UPDATE blog_posts bp
SET author_id = u.id
FROM admin_users au
JOIN users u ON u.email = au.email
WHERE bp.author_id = au.id
  AND u.id <> au.id;

-- Ensure all blog_posts authors exist in users (migrate from admin_users if needed)
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  is_active,
  email_verified,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  au.password_hash,
  COALESCE(NULLIF(split_part(au.name, ' ', 1), ''), 'Admin'),
  COALESCE(NULLIF(TRIM(regexp_replace(au.name, '^\\S+\\s*', '')), ''), 'User'),
  au.is_active,
  true,
  au.created_at,
  au.updated_at
FROM admin_users au
WHERE au.id IN (SELECT DISTINCT author_id FROM blog_posts WHERE author_id IS NOT NULL)
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.email = au.email);

-- Null any remaining orphaned author_id values
UPDATE blog_posts
SET author_id = NULL
WHERE author_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM users u WHERE u.id = blog_posts.author_id);

-- Re-point blog_posts.author_id to users table
ALTER TABLE blog_posts
  ADD CONSTRAINT blog_posts_author_id_fkey
    FOREIGN KEY (author_id)
    REFERENCES users(id)
    ON DELETE SET NULL;

COMMENT ON COLUMN blog_posts.author_id IS 'Foreign key to users table (blog post author)';

-- Drop legacy admin_users table (if exists)
DROP TABLE IF EXISTS admin_users CASCADE;

-- Drop legacy user_role enum (if unused)
DO $$ BEGIN
  DROP TYPE IF EXISTS user_role;
EXCEPTION
  WHEN dependent_objects_still_exist THEN
    -- Leave the type if any dependency remains
    NULL;
END $$;
