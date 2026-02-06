-- Migration: 082_add_course_student_to_invoice_configurations
-- Description: Adds optional course/student association and recipient type
-- Created: 2026-02-06

DO $$ BEGIN
  CREATE TYPE invoice_recipient_type AS ENUM ('manual', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE invoice_configurations
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES courses(id),
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS recipient_type invoice_recipient_type NOT NULL DEFAULT 'manual';

CREATE INDEX IF NOT EXISTS idx_invoice_configurations_course_id
  ON invoice_configurations(course_id);
CREATE INDEX IF NOT EXISTS idx_invoice_configurations_student_id
  ON invoice_configurations(student_id);
CREATE INDEX IF NOT EXISTS idx_invoice_configurations_recipient_type
  ON invoice_configurations(recipient_type);

COMMENT ON COLUMN invoice_configurations.course_id IS 'Optional course association for the invoice configuration';
COMMENT ON COLUMN invoice_configurations.student_id IS 'Optional student association for the invoice configuration';
COMMENT ON COLUMN invoice_configurations.recipient_type IS 'Recipient source: manual or student';
