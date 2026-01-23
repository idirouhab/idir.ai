/**
 * Migration 078: Add JPG URL to certificates
 *
 * Adds jpg_url field to certificates table for storing
 * Cloudflare R2 URL of certificate image
 */

BEGIN;

-- Add jpg_url column
ALTER TABLE certificates
ADD COLUMN IF NOT EXISTS jpg_url TEXT;

-- Add comment
COMMENT ON COLUMN certificates.jpg_url IS 'Public URL to generated JPG certificate image (stored in Cloudflare R2)';

COMMIT;
