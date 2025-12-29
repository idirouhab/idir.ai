-- Migration: 042_rename_users_to_admin_users
-- Description: Renames existing users table to admin_users to distinguish
-- platform administrators from students/instructors
-- Created: 2025-12-28

-- Rename the table
ALTER TABLE users RENAME TO admin_users;

-- Rename the sequence (if it exists)
ALTER SEQUENCE IF EXISTS users_id_seq RENAME TO admin_users_id_seq;

-- Update indexes (they are automatically renamed with the table, but we'll be explicit)
-- The indexes should have been renamed automatically, but let's verify names
ALTER INDEX IF EXISTS idx_users_email RENAME TO idx_admin_users_email;
ALTER INDEX IF EXISTS idx_users_role RENAME TO idx_admin_users_role;

-- Note: Foreign key constraints and triggers are automatically updated
-- but RLS policies need to be recreated

-- Recreate RLS policies with new table name
DROP POLICY IF EXISTS "Service role can do everything on users" ON admin_users;
DROP POLICY IF EXISTS "Users can read their own data" ON admin_users;

CREATE POLICY "Service role can do everything on admin_users"
  ON admin_users
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admin users can read their own data"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Update table comment
COMMENT ON TABLE admin_users IS 'Platform administrator accounts for admin panel access control (owner, admin, blogger)';

-- Note: Foreign keys (like blog_posts.author_id) automatically update to point to admin_users
