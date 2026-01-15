-- Migration: 069_add_link_resources_to_course_materials
-- Description: Add support for Google Drive link resources alongside file uploads
-- Created: 2026-01-14

-- Add resource_type column to distinguish between files and links
ALTER TABLE course_materials
ADD COLUMN IF NOT EXISTS resource_type VARCHAR(10) DEFAULT 'file' CHECK (resource_type IN ('file', 'link'));

-- Add external_link_url column for storing Google Drive URLs
ALTER TABLE course_materials
ADD COLUMN IF NOT EXISTS external_link_url TEXT;

-- Make file_size_bytes nullable (not applicable for links)
ALTER TABLE course_materials
ALTER COLUMN file_size_bytes DROP NOT NULL;

-- Make mime_type nullable (not applicable for links)
ALTER TABLE course_materials
ALTER COLUMN mime_type DROP NOT NULL;

-- Make original_filename nullable (links may not have original files)
ALTER TABLE course_materials
ALTER COLUMN original_filename DROP NOT NULL;

-- Update existing records to ensure resource_type is 'file'
UPDATE course_materials SET resource_type = 'file' WHERE resource_type IS NULL;

-- Add check constraint: if resource_type is 'link', external_link_url must be set
ALTER TABLE course_materials
ADD CONSTRAINT  check_link_has_url
CHECK (
  (resource_type = 'file' AND file_size_bytes IS NOT NULL) OR
  (resource_type = 'link' AND external_link_url IS NOT NULL)
);

-- Create index for filtering by resource_type
CREATE INDEX IF NOT EXISTS idx_course_materials_resource_type ON course_materials(resource_type);

-- Add comments for documentation
COMMENT ON COLUMN course_materials.resource_type IS 'Type of resource: ''file'' for uploaded files, ''link'' for external links (e.g., Google Drive)';
COMMENT ON COLUMN course_materials.external_link_url IS 'Original URL for link resources (e.g., Google Drive sharing link). NULL for uploaded files';
