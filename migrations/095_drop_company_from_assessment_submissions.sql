-- Migration: 095_drop_company_from_assessment_submissions
-- Description: Remove company column from assessment_submissions
-- Created: 2026-02-10

ALTER TABLE assessment_submissions
  DROP COLUMN IF EXISTS company;

DROP INDEX IF EXISTS idx_assessment_submissions_company;
