-- Migration: 037_create_course_instructors_table
-- Description: Creates junction table to assign one or multiple instructors to courses
-- Created: 2025-12-25

CREATE TABLE IF NOT EXISTS course_instructors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Foreign Keys
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID NOT NULL REFERENCES instructors(id) ON DELETE CASCADE,

    -- Order/Position (for displaying instructors in a specific order)
    display_order INTEGER DEFAULT 0,

    -- Role/Type (optional: lead instructor, teaching assistant, etc.)
    instructor_role VARCHAR(50) DEFAULT 'instructor',

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Constraints
    CONSTRAINT unique_course_instructor UNIQUE (course_id, instructor_id),
    CONSTRAINT valid_display_order CHECK (display_order >= 0),
    CONSTRAINT valid_instructor_role CHECK (instructor_role IN ('instructor', 'lead_instructor', 'teaching_assistant', 'guest_instructor'))
    );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_course_instructors_course_id ON course_instructors(course_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_instructor_id ON course_instructors(instructor_id);
CREATE INDEX IF NOT EXISTS idx_course_instructors_display_order ON course_instructors(course_id, display_order);

-- Updated at trigger
DROP TRIGGER IF EXISTS update_course_instructors_updated_at ON course_instructors;
CREATE TRIGGER update_course_instructors_updated_at
    BEFORE UPDATE ON course_instructors
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security
ALTER TABLE course_instructors ENABLE ROW LEVEL SECURITY;

-- Public can read course-instructor assignments for published courses
DROP POLICY IF EXISTS "Course instructors are viewable for published courses" ON course_instructors;
CREATE POLICY "Course instructors are viewable for published courses"
    ON course_instructors FOR SELECT
                                              USING (
                                              EXISTS (
                                              SELECT 1 FROM courses
                                              WHERE courses.id = course_instructors.course_id
                                              AND courses.status = 'published'
                                              )
                                              );

-- Authenticated users can read all assignments
DROP POLICY IF EXISTS "Authenticated users can view all course instructors" ON course_instructors;
CREATE POLICY "Authenticated users can view all course instructors"
    ON course_instructors FOR SELECT
                                              TO authenticated
                                              USING (true);

-- Authenticated users (admins) can manage assignments
DROP POLICY IF EXISTS "Authenticated users can manage course instructors" ON course_instructors;
CREATE POLICY "Authenticated users can manage course instructors"
    ON course_instructors FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Service role can do everything
DROP POLICY IF EXISTS "Service role can manage course instructors" ON course_instructors;
CREATE POLICY "Service role can manage course instructors"
    ON course_instructors FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Comments
COMMENT ON TABLE course_instructors IS 'Junction table linking courses to one or multiple instructors';
COMMENT ON COLUMN course_instructors.course_id IS 'Reference to the course';
COMMENT ON COLUMN course_instructors.instructor_id IS 'Reference to the instructor';
COMMENT ON COLUMN course_instructors.display_order IS 'Order in which instructors should be displayed (0-based)';
COMMENT ON COLUMN course_instructors.instructor_role IS 'Role of instructor in this course (instructor, lead_instructor, teaching_assistant, guest_instructor)';
