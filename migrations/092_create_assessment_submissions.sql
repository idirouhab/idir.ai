-- Migration: 092_create_assessment_submissions
-- Description: Store assessment results from campus/assessment
-- Created: 2026-02-10

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS assessment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  locale VARCHAR(10),
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  level VARCHAR(40),
  failed_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT assessment_score_check CHECK (score >= 0 AND score <= total_questions),
  CONSTRAINT assessment_name_check CHECK (LENGTH(TRIM(name)) >= 2)
);

CREATE INDEX IF NOT EXISTS idx_assessment_submissions_email ON assessment_submissions(email);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_company ON assessment_submissions(company);
CREATE INDEX IF NOT EXISTS idx_assessment_submissions_created_at ON assessment_submissions(created_at DESC);

ALTER TABLE assessment_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert assessment submissions" ON assessment_submissions;
CREATE POLICY "Anyone can insert assessment submissions"
  ON assessment_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON TABLE assessment_submissions IS 'Stores campus assessment submissions for tracking.';
COMMENT ON COLUMN assessment_submissions.failed_questions IS 'JSON payload of failed question details.';
