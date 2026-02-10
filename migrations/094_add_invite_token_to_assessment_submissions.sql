-- Migration: 094_add_invite_token_to_assessment_submissions
-- Description: Store invite token on assessment submissions
-- Created: 2026-02-10

ALTER TABLE assessment_submissions
  ADD COLUMN IF NOT EXISTS invite_token VARCHAR(64);

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_invite_token
  ON assessment_submissions(invite_token);

COMMENT ON COLUMN assessment_submissions.invite_token IS 'Optional invite token used to generate assessment link.';
