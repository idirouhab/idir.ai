-- Migration: 093_create_assessment_invites
-- Description: Store assessment invite tokens for company tracking
-- Created: 2026-02-10

CREATE TABLE IF NOT EXISTS assessment_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(64) NOT NULL UNIQUE,
  company VARCHAR(255) NOT NULL,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessment_invites_company ON assessment_invites(company);
CREATE INDEX IF NOT EXISTS idx_assessment_invites_created_at ON assessment_invites(created_at DESC);

ALTER TABLE assessment_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can manage assessment invites" ON assessment_invites;
CREATE POLICY "Super admins can manage assessment invites"
  ON assessment_invites
  FOR ALL
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

COMMENT ON TABLE assessment_invites IS 'Assessment invite tokens for company-specific assessment URLs.';
