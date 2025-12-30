-- Migration: 059_create_course_materials_table
-- Description: Add support for course materials (PDF, DOCX, PPTX) uploads
-- Created: 2025-12-30

-- Create course_materials table
CREATE TABLE IF NOT EXISTS course_materials (
                                                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES users(id),
    original_filename VARCHAR(255) NOT NULL,
    display_filename VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'pdf', 'docx', 'pptx', etc.
    file_size_bytes INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_materials_course_id ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_course_materials_uploaded_by ON course_materials(uploaded_by);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_course_materials_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS course_materials_updated_at_trigger ON course_materials;
CREATE TRIGGER course_materials_updated_at_trigger
    BEFORE UPDATE ON course_materials
    FOR EACH ROW
    EXECUTE FUNCTION update_course_materials_updated_at();

-- Add comment to table
COMMENT ON TABLE course_materials IS 'Stores course materials (PDF, DOCX, PPTX) uploaded by instructors';
COMMENT ON COLUMN course_materials.file_type IS 'Type of file: pdf, docx, pptx, etc.';
COMMENT ON COLUMN course_materials.display_order IS 'Order for displaying materials, lower numbers appear first';
