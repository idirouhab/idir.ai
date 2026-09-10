-- Migration: 100_retire_campus_tables
-- Description: Retire database objects used only by the discontinued campus.
-- The website, blog, newsletter, authentication, certificates, courses,
-- course signups, billing configuration, and migration history remain intact.

BEGIN;

SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

-- Drop dependent campus tables before the tables they reference.
DROP TABLE IF EXISTS public.forum_answers;
DROP TABLE IF EXISTS public.forum_posts;
DROP TABLE IF EXISTS public.course_materials;
DROP TABLE IF EXISTS public.session_attendance;
DROP TABLE IF EXISTS public.student_checklists;
DROP TABLE IF EXISTS public.course_instructors;
DROP TABLE IF EXISTS public.course_sessions;

-- Independent campus tables.
DROP TABLE IF EXISTS public.assessment_invites;
DROP TABLE IF EXISTS public.assessment_submissions;
DROP TABLE IF EXISTS public.audit_logs;
DROP TABLE IF EXISTS public.email_verification_tokens;
DROP TABLE IF EXISTS public.password_reset_tokens;
DROP TABLE IF EXISTS public.quiz_scores;

-- Trigger functions that were used exclusively by the retired tables.
DROP FUNCTION IF EXISTS public.auto_verify_instructor_answer();
DROP FUNCTION IF EXISTS public.update_attendance_updated_at();
DROP FUNCTION IF EXISTS public.update_course_materials_updated_at();
DROP FUNCTION IF EXISTS public.update_student_checklist_status();

-- Fail the migration if a protected retained table is unexpectedly absent.
DO $postcheck$
BEGIN
  IF to_regclass('public.blog_posts') IS NULL
     OR to_regclass('public.newsletter_subscribers') IS NULL
     OR to_regclass('public.users') IS NULL
     OR to_regclass('public.certificates') IS NULL
     OR to_regclass('public.courses') IS NULL
     OR to_regclass('public.course_signups') IS NULL
     OR to_regclass('public.invoice_configurations') IS NULL
     OR to_regclass('public.invoice_configuration_events') IS NULL
     OR to_regclass('public.migrations_history') IS NULL THEN
    RAISE EXCEPTION 'Campus retirement post-check failed: a protected table is missing';
  END IF;

  IF to_regprocedure('public.update_updated_at_column()') IS NULL THEN
    RAISE EXCEPTION 'Campus retirement post-check failed: shared update function is missing';
  END IF;
END
$postcheck$;

COMMIT;
