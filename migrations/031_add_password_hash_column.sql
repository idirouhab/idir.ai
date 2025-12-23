-- ============================================================================
-- Add password_hash column to students table
-- ============================================================================
-- Run this in your Supabase SQL Editor if the column doesn't exist yet
-- ============================================================================

-- Check if password_hash column exists, if not add it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'students'
    AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE students
    ADD COLUMN password_hash TEXT;

    RAISE NOTICE 'Added password_hash column to students table';
  ELSE
    RAISE NOTICE 'password_hash column already exists';
  END IF;
END $$;

