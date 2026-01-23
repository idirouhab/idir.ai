/**
 * Migration 076: Update Certificate ID Format Constraint
 *
 * Updates the certificate_id_format constraint to support both formats:
 * - Legacy: CERT-YYYY-UUID (e.g., CERT-2026-3F9A2C1E-8B74-4E9A-B5D2-91F8F1C3A0E4)
 * - New: IDIR-SLUG-YYYY-HASH6 (e.g., IDIR-AUTO-2026-A3F9B2)
 */

BEGIN;

-- Drop the old constraint
ALTER TABLE certificates
DROP CONSTRAINT IF EXISTS certificate_id_format;

-- Add new constraint that supports both formats
ALTER TABLE certificates
ADD CONSTRAINT certificate_id_format CHECK (
  -- Legacy format: CERT-YYYY-UUID
  certificate_id ~ '^CERT-[0-9]{4}-[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$'
  OR
  -- New format: IDIR-SLUG-YYYY-HASH6
  certificate_id ~ '^IDIR-[A-Z0-9]{1,8}-[0-9]{4}-[0-9A-F]{6}$'
);

COMMIT;
