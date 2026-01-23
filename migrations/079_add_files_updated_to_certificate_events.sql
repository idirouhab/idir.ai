-- Migration: 079_add_files_updated_to_certificate_events
-- Description: Adds 'files_updated' type to certificate_event_type enum

-- Add the new value to the existing ENUM type
-- PostgreSQL does not support 'IF NOT EXISTS' for ADD VALUE until version 12+
-- The following block safely handles the addition.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname = 'certificate_event_type' 
    AND e.enumlabel = 'files_updated'
  ) THEN
    ALTER TYPE certificate_event_type ADD VALUE 'files_updated';
  END IF;
END
$$;

-- Update the table comment to reflect the new state
COMMENT ON TABLE certificate_events IS 'Audit trail for certificate lifecycle events (issued, verified, revoked, reissued, files_updated)';
COMMENT ON COLUMN certificate_events.event_type IS 'Type of event: issued, verified, revoked, reissued, files_updated';