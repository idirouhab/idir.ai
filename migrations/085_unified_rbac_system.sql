-- Migration: 085_unified_rbac_system
-- Description: Introduces app_role enum and user_roles table with unified RBAC
-- Created: 2026-02-07

-- Remove legacy view to avoid name conflict with new user_roles table
DROP VIEW IF EXISTS user_roles;

-- Create app_role enum
DO $$ BEGIN
  CREATE TYPE app_role AS ENUM ('super_admin', 'billing_admin', 'instructor', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own roles" ON user_roles;
CREATE POLICY "Users can read own roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

DROP POLICY IF EXISTS "Super admins can manage roles" ON user_roles;
CREATE POLICY "Super admins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
        AND ur.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      WHERE ur.user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
        AND ur.role = 'super_admin'
    )
  );

-- Data migration
-- 1) Insert admin_users into users if they do not already exist (by email)
INSERT INTO users (
  id,
  email,
  password_hash,
  first_name,
  last_name,
  country,
  is_active,
  email_verified,
  created_at,
  updated_at,
  last_login_at
)
SELECT
  au.id,
  au.email,
  au.password_hash,
  COALESCE(NULLIF(split_part(au.name, ' ', 1), ''), 'Admin'),
  COALESCE(NULLIF(TRIM(regexp_replace(au.name, '^\\S+\\s*', '')), ''), 'User'),
  NULL,
  au.is_active,
  true,
  au.created_at,
  au.updated_at,
  NULL
FROM admin_users au
WHERE NOT EXISTS (
  SELECT 1 FROM users u WHERE u.email = au.email
);

-- 2) Map admin_users owner/admin to super_admin
INSERT INTO user_roles (user_id, role, created_at)
SELECT
  u.id,
  'super_admin'::app_role,
  NOW()
FROM admin_users au
JOIN users u ON u.email = au.email
WHERE au.role::text IN ('owner', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;

-- 3) Map instructor_profiles role=admin to billing_admin
INSERT INTO user_roles (user_id, role, created_at)
SELECT
  ip.user_id,
  'billing_admin'::app_role,
  COALESCE(ip.created_at, NOW())
FROM instructor_profiles ip
WHERE ip.role = 'admin'
ON CONFLICT (user_id, role) DO NOTHING;

-- 4) Map all instructor_profiles to instructor
INSERT INTO user_roles (user_id, role, created_at)
SELECT
  ip.user_id,
  'instructor'::app_role,
  COALESCE(ip.created_at, NOW())
FROM instructor_profiles ip
ON CONFLICT (user_id, role) DO NOTHING;

-- 5) Map all student_profiles to student
INSERT INTO user_roles (user_id, role, created_at)
SELECT
  sp.user_id,
  'student'::app_role,
  COALESCE(sp.created_at, NOW())
FROM student_profiles sp
ON CONFLICT (user_id, role) DO NOTHING;

-- Deprecate admin_users
COMMENT ON TABLE admin_users IS
'REPRECATED: legacy admin panel accounts. Identity is unified in users and authorization is managed via user_roles (app_role).';

-- Comments
COMMENT ON TABLE user_roles IS 'Role assignments for unified RBAC across the platform.';
COMMENT ON COLUMN user_roles.user_id IS 'Foreign key to users table (role owner).';
COMMENT ON COLUMN user_roles.role IS 'Application role granted to the user.';
