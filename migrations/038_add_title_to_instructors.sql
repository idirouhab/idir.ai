-- Migration: 038_add_title_to_instructors
-- Description: Adds a flexible title field to instructors table for professional titles
-- Created: 2025-12-26

BEGIN;

-- Add title column (free text for professional title like "PhD in Computer Science", "Senior Developer", etc.)
ALTER TABLE instructors
ADD COLUMN IF NOT EXISTS title TEXT;

-- Add comment
COMMENT ON COLUMN instructors.title IS 'Professional title or credentials (e.g., "PhD in Computer Science", "Senior Developer")';

COMMIT;
