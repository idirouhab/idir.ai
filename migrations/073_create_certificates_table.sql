-- Migration: 073_create_certificates_table
-- Description: Creates certificates table with deterministic hashing, integrity protection, and revocation support
-- Created: 2026-01-21

-- Enable pgcrypto extension for gen_random_uuid() if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create ENUM type for certificate status
DO $$ BEGIN
  CREATE TYPE certificate_status AS ENUM ('valid', 'revoked', 'reissued');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Public certificate identifier (printed on PDF + QR code)
  -- Format: CERT-2026-<UUID>
  certificate_id TEXT UNIQUE NOT NULL,

  -- Foreign key to course_signups
  course_signup_id UUID NOT NULL REFERENCES course_signups(id) ON DELETE RESTRICT,

  -- Issuance and validity
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status certificate_status NOT NULL DEFAULT 'valid',
  revoked_at TIMESTAMPTZ,
  revoked_reason TEXT,

  -- Deterministic hashing for integrity verification
  hash_algorithm TEXT NOT NULL DEFAULT 'sha256',
  payload_hash TEXT NOT NULL, -- Hex string of SHA-256 hash
  snapshot_payload JSONB NOT NULL, -- Exact payload used to compute hash

  -- Verification tracking
  verification_count BIGINT NOT NULL DEFAULT 0,
  last_verified_at TIMESTAMPTZ,

  -- PDF storage (optional, can be generated on-the-fly)
  pdf_url TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Constraints
  CONSTRAINT certificate_id_format CHECK (
    certificate_id ~ '^CERT-[0-9]{4}-[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$'
  ),
  CONSTRAINT revoked_fields_consistency CHECK (
    (status = 'revoked' AND revoked_at IS NOT NULL) OR
    (status != 'revoked' AND revoked_at IS NULL)
  ),
  CONSTRAINT valid_hash_algorithm CHECK (hash_algorithm IN ('sha256'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_id ON certificates(certificate_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course_signup_id ON certificates(course_signup_id);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);
CREATE INDEX IF NOT EXISTS idx_certificates_issued_at ON certificates(issued_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at DESC);

-- Partial unique index: only ONE valid certificate per signup
-- This enforces business rule that a signup can only have one active certificate
CREATE UNIQUE INDEX IF NOT EXISTS idx_certificates_one_valid_per_signup
  ON certificates(course_signup_id)
  WHERE status = 'valid';

-- Trigger to auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_certificates_updated_at ON certificates;
CREATE TRIGGER update_certificates_updated_at
  BEFORE UPDATE ON certificates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Public can read certificates for verification
-- Note: This is for the verification endpoint - we'll filter sensitive data in the API
CREATE POLICY "Public can read certificates for verification"
  ON certificates FOR SELECT
  USING (true);

-- RLS Policy: Service role (admin) can do everything
CREATE POLICY "Service role can manage certificates"
  ON certificates FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- RLS Policy: Authenticated users (admin) can manage certificates
CREATE POLICY "Authenticated users can manage certificates"
  ON certificates FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments for documentation
COMMENT ON TABLE certificates IS 'Certificate issuance and verification with integrity protection via SHA-256 hashing';
COMMENT ON COLUMN certificates.certificate_id IS 'Public identifier printed on PDF (format: CERT-2026-UUID)';
COMMENT ON COLUMN certificates.course_signup_id IS 'Foreign key to course_signups table';
COMMENT ON COLUMN certificates.status IS 'Certificate status: valid, revoked, or reissued';
COMMENT ON COLUMN certificates.payload_hash IS 'SHA-256 hash of snapshot_payload (hex string) for integrity verification';
COMMENT ON COLUMN certificates.snapshot_payload IS 'Deterministic JSON snapshot of certificate data at issuance time';
COMMENT ON COLUMN certificates.verification_count IS 'Number of times this certificate has been verified publicly';
COMMENT ON COLUMN certificates.last_verified_at IS 'Timestamp of most recent verification';
COMMENT ON COLUMN certificates.pdf_url IS 'Optional: Public URL to generated PDF certificate';
