-- Migration: 075_allow_manual_certificates
-- Description: Allow NULL course_signup_id for manually issued certificates
-- Created: 2026-01-22

-- Make course_signup_id nullable to support manual certificate issuance
ALTER TABLE certificates
  ALTER COLUMN course_signup_id DROP NOT NULL;

-- Update the foreign key constraint to be more flexible
ALTER TABLE certificates
  DROP CONSTRAINT IF EXISTS certificates_course_signup_id_fkey;

-- Add back with ON DELETE SET NULL instead of RESTRICT
ALTER TABLE certificates
  ADD CONSTRAINT certificates_course_signup_id_fkey
    FOREIGN KEY (course_signup_id)
    REFERENCES course_signups(id)
    ON DELETE SET NULL;

-- Update comments to clarify manual certificates
COMMENT ON COLUMN certificates.course_signup_id IS 'Foreign key to course_signups table (NULL for manually issued certificates from external sources)';

-- Update partial unique index to handle NULL values
-- The existing index will still work, but let's make it clearer
DROP INDEX IF EXISTS idx_certificates_one_valid_per_signup;

CREATE UNIQUE INDEX idx_certificates_one_valid_per_signup
  ON certificates(course_signup_id)
  WHERE status = 'valid' AND course_signup_id IS NOT NULL;

-- Create index for manual certificates (where course_signup_id IS NULL)
CREATE INDEX IF NOT EXISTS idx_certificates_manual
  ON certificates(certificate_id)
  WHERE course_signup_id IS NULL;

-- Add comment explaining the change
COMMENT ON TABLE certificates IS 'Certificate issuance and verification with integrity protection via SHA-256 hashing. Supports both automated (via course_signups) and manual issuance (for external/third-party completions)';
