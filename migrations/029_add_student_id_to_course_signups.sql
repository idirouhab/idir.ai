-- Migration: Add student_id foreign key to course_signups
-- Description: Normalizes course_signups by linking to students table
-- Migrates existing student data from course_signups to students table
-- Then removes inline student data fields

-- Step 1: Add student_id foreign key column (nullable for now)
ALTER TABLE course_signups
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES students(id) ON DELETE SET NULL;

-- Step 2: Migrate existing course_signups data to students table
-- Create student accounts from existing signups (only if columns exist)
DO $$
DECLARE
  has_first_name BOOLEAN;
  has_last_name BOOLEAN;
  has_email BOOLEAN;
BEGIN
  -- Check if the columns exist
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_signups' AND column_name = 'first_name'
  ) INTO has_first_name;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'course_signups' AND column_name = 'email'
  ) INTO has_email;

  -- Only migrate if columns exist
  IF has_first_name AND has_email THEN
    -- Create students from existing course_signups
    -- Use email as unique identifier, skip duplicates
    INSERT INTO students (email, first_name, last_name, country, birth_year, password_hash, is_active, email_verified, preferred_language)
    SELECT DISTINCT ON (cs.email)
      cs.email,
      COALESCE(cs.first_name, SPLIT_PART(cs.full_name, ' ', 1), 'Student'),
      COALESCE(cs.last_name,
        CASE
          WHEN cs.full_name LIKE '% %' THEN SUBSTRING(cs.full_name FROM POSITION(' ' IN cs.full_name) + 1)
          ELSE ''
        END,
        ''
      ),
      cs.country,
      cs.birth_year,
      'CHANGE_PASSWORD', -- Placeholder - students need to set password via password reset
      false, -- Mark as inactive until they verify email and set password
      false, -- Email not verified yet
      COALESCE(cs.language, 'es')
    FROM course_signups cs
    WHERE cs.email IS NOT NULL
      AND cs.email != ''
      AND cs.email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' -- Valid email format
    ORDER BY cs.email, cs.created_at ASC -- Take the earliest signup for each email
    ON CONFLICT (email) DO NOTHING;

    -- Step 3: Link course_signups to newly created students
    UPDATE course_signups cs
    SET student_id = s.id
    FROM students s
    WHERE cs.email = s.email
      AND cs.student_id IS NULL;

    RAISE NOTICE 'Migrated % students from course_signups',
      (SELECT COUNT(DISTINCT email) FROM course_signups WHERE email IS NOT NULL);
  ELSE
    RAISE NOTICE 'Columns do not exist, skipping data migration';
  END IF;
END $$;

-- Step 4: Handle duplicate signups (same student_id + course_id)
-- Keep only the earliest signup for each (student_id, course_id) pair
DELETE FROM course_signups cs
WHERE cs.id IN (
  SELECT id
  FROM (
    SELECT id, ROW_NUMBER() OVER (
      PARTITION BY student_id, course_id
      ORDER BY created_at ASC
    ) as rn
    FROM course_signups
    WHERE student_id IS NOT NULL
  ) sub
  WHERE rn > 1
);

-- Step 5: Remove student data columns (now stored in students table)
-- Keep only: id, course_id, student_id, signup_status, language, created_at, updated_at
ALTER TABLE course_signups
  DROP COLUMN IF EXISTS first_name CASCADE,
  DROP COLUMN IF EXISTS last_name CASCADE,
  DROP COLUMN IF EXISTS email CASCADE,
  DROP COLUMN IF EXISTS country CASCADE,
  DROP COLUMN IF EXISTS birth_year CASCADE;

-- Step 6: Update unique constraint
-- Old: (email, course_id) → New: (student_id, course_id)
ALTER TABLE course_signups
  DROP CONSTRAINT IF EXISTS course_signups_email_course_id_key;

-- Note: Allow NULL student_id for anonymous signups, but prevent duplicate (student_id, course_id)
-- We'll add a partial unique index that only applies when student_id is NOT NULL
DROP INDEX IF EXISTS unique_student_course;
CREATE UNIQUE INDEX unique_student_course
  ON course_signups(student_id, course_id)
  WHERE student_id IS NOT NULL;

-- Step 4: Create index on student_id for foreign key performance
CREATE INDEX IF NOT EXISTS idx_course_signups_student_id ON course_signups(student_id);

-- Step 5: Update RLS policies
-- Drop old policies
DROP POLICY IF EXISTS "Anyone can signup" ON course_signups;
DROP POLICY IF EXISTS "Public can read signups" ON course_signups;
DROP POLICY IF EXISTS "Students can read own signups" ON course_signups;
DROP POLICY IF EXISTS "Anyone can insert signups" ON course_signups;
DROP POLICY IF EXISTS "Service role can manage signups" ON course_signups;

-- Ensure RLS is enabled
ALTER TABLE course_signups ENABLE ROW LEVEL SECURITY;

-- Students can read their own signups (or public anonymous signups)
CREATE POLICY "Students can read own signups"
  ON course_signups FOR SELECT
  USING (
    student_id IS NULL OR  -- Anonymous signups are visible to all
    student_id::text = current_setting('request.jwt.claims', true)::json->>'userId'
  );

-- Anyone (authenticated or anonymous) can insert signups
CREATE POLICY "Anyone can insert signups"
  ON course_signups FOR INSERT
  WITH CHECK (true);

-- Students can update their own signups
CREATE POLICY "Students can update own signups"
  ON course_signups FOR UPDATE
  TO authenticated
  USING (student_id::text = current_setting('request.jwt.claims', true)::json->>'userId')
  WITH CHECK (student_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Service role (admin) can manage all signups
CREATE POLICY "Service role can manage signups"
  ON course_signups FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON COLUMN course_signups.student_id IS 'Foreign key to students table (nullable for anonymous signups)';
COMMENT ON TABLE course_signups IS 'Course signup records - links students to courses or tracks anonymous signups';
