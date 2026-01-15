-- Migration: 071_fix_rls_performance_issues
-- Description: Fix Supabase RLS performance issues by wrapping auth functions in SELECT subqueries
-- This addresses:
-- 1. Auth RLS Initialization Plan issues (wrapping auth/current_setting functions in SELECT)
-- 2. Multiple permissive policies (consolidating duplicate policies)
-- Created: 2026-01-15

-- ============================================================================
-- PART 1: Fix Auth RLS Initialization Plan Issues
-- Wrap current_setting() and auth.<function>() in (SELECT ...) to prevent per-row re-evaluation
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: audit_logs
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Admins and owners can read audit logs" ON audit_logs;

CREATE POLICY "Admins and owners can read audit logs"
  ON audit_logs FOR SELECT
  USING ((SELECT auth.role()) = 'authenticated');

-- -----------------------------------------------------------------------------
-- Table: course_signups
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can read own signups" ON course_signups;
DROP POLICY IF EXISTS "Students can update own signups" ON course_signups;

CREATE POLICY "Students can read own signups"
  ON course_signups FOR SELECT
  USING (
    student_id IS NULL OR  -- Anonymous signups are visible to all
    student_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
  );

CREATE POLICY "Students can update own signups"
  ON course_signups FOR UPDATE
  TO authenticated
  USING (student_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'))
  WITH CHECK (student_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

-- -----------------------------------------------------------------------------
-- Table: users
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own data" ON users;
DROP POLICY IF EXISTS "Users can update own data" ON users;

CREATE POLICY "Users can read own data"
  ON users FOR SELECT
  TO authenticated
  USING (id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

CREATE POLICY "Users can update own data"
  ON users FOR UPDATE
  TO authenticated
  USING (id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'))
  WITH CHECK (id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

-- -----------------------------------------------------------------------------
-- Table: student_profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can read own profile" ON student_profiles;
DROP POLICY IF EXISTS "Students can update own profile" ON student_profiles;

CREATE POLICY "Students can read own profile"
  ON student_profiles FOR SELECT
  TO authenticated
  USING (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

CREATE POLICY "Students can update own profile"
  ON student_profiles FOR UPDATE
  TO authenticated
  USING (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'))
  WITH CHECK (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

-- -----------------------------------------------------------------------------
-- Table: instructor_profiles
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Instructors can read own profile" ON instructor_profiles;
DROP POLICY IF EXISTS "Instructors can update own profile" ON instructor_profiles;

CREATE POLICY "Instructors can read own profile"
  ON instructor_profiles FOR SELECT
  TO authenticated
  USING (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

CREATE POLICY "Instructors can update own profile"
  ON instructor_profiles FOR UPDATE
  TO authenticated
  USING (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'))
  WITH CHECK (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

-- -----------------------------------------------------------------------------
-- Table: forum_posts
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Course members can read forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Course members can create forum posts" ON forum_posts;
DROP POLICY IF EXISTS "Authors can update own forum posts" ON forum_posts;

CREATE POLICY "Course members can read forum posts"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (
    -- User is enrolled as student
    EXISTS (
      SELECT 1 FROM course_signups cs
      WHERE cs.course_id = forum_posts.course_id
        AND cs.student_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
    )
    OR
    -- User is assigned as instructor
    EXISTS (
      SELECT 1 FROM course_instructors ci
      WHERE ci.course_id = forum_posts.course_id
        AND ci.instructor_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
    )
  );

CREATE POLICY "Course members can create forum posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
    AND (
      EXISTS (
        SELECT 1 FROM course_signups cs
        WHERE cs.course_id = forum_posts.course_id
          AND cs.student_id = forum_posts.user_id
      )
      OR
      EXISTS (
        SELECT 1 FROM course_instructors ci
        WHERE ci.course_id = forum_posts.course_id
          AND ci.instructor_id = forum_posts.user_id
      )
    )
  );

CREATE POLICY "Authors can update own forum posts"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'))
  WITH CHECK (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

-- -----------------------------------------------------------------------------
-- Table: forum_answers
-- -----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Course members can read forum answers" ON forum_answers;
DROP POLICY IF EXISTS "Course members can create forum answers" ON forum_answers;
DROP POLICY IF EXISTS "Authors can update own forum answers" ON forum_answers;

CREATE POLICY "Course members can read forum answers"
  ON forum_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_signups cs
      WHERE cs.course_id = forum_answers.course_id
        AND cs.student_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
    )
    OR
    EXISTS (
      SELECT 1 FROM course_instructors ci
      WHERE ci.course_id = forum_answers.course_id
        AND ci.instructor_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
    )
  );

CREATE POLICY "Course members can create forum answers"
  ON forum_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
    AND (
      EXISTS (
        SELECT 1 FROM course_signups cs
        WHERE cs.course_id = forum_answers.course_id
          AND cs.student_id = forum_answers.user_id
      )
      OR
      EXISTS (
        SELECT 1 FROM course_instructors ci
        WHERE ci.course_id = forum_answers.course_id
          AND ci.instructor_id = forum_answers.user_id
      )
    )
  );

CREATE POLICY "Authors can update own forum answers"
  ON forum_answers FOR UPDATE
  TO authenticated
  USING (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'))
  WITH CHECK (user_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId'));

-- ============================================================================
-- PART 2: Consolidate Multiple Permissive Policies
-- Merge duplicate policies into single, comprehensive policies
-- ============================================================================

-- -----------------------------------------------------------------------------
-- Table: course_instructors (SELECT policies)
-- -----------------------------------------------------------------------------
-- Remove the three separate SELECT policies and create one consolidated policy
DROP POLICY IF EXISTS "Course instructors are viewable for published courses" ON course_instructors;
DROP POLICY IF EXISTS "Authenticated users can view all course instructors" ON course_instructors;
DROP POLICY IF EXISTS "Authenticated users can manage course instructors" ON course_instructors;

-- Single consolidated SELECT policy
CREATE POLICY "View course instructors"
  ON course_instructors FOR SELECT
  USING (
    -- Published courses are viewable by everyone (including anon)
    EXISTS (
      SELECT 1 FROM courses
      WHERE courses.id = course_instructors.course_id
      AND courses.status = 'published'
    )
    OR
    -- Authenticated users can view all
    (SELECT auth.role()) = 'authenticated'
  );

-- Separate policies for INSERT, UPDATE, DELETE operations
CREATE POLICY "Authenticated users can insert course instructors"
  ON course_instructors FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update course instructors"
  ON course_instructors FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete course instructors"
  ON course_instructors FOR DELETE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- Table: course_signups (INSERT policies)
-- -----------------------------------------------------------------------------
-- Remove duplicate INSERT policies and keep one
DROP POLICY IF EXISTS "Anyone can insert signups" ON course_signups;
DROP POLICY IF EXISTS "Anyone can signup for courses" ON course_signups;

CREATE POLICY "Anyone can signup for courses"
  ON course_signups FOR INSERT
  WITH CHECK (true); -- Allow anyone (anon or authenticated) to sign up

-- -----------------------------------------------------------------------------
-- Table: courses (SELECT policies)
-- -----------------------------------------------------------------------------
-- Consolidate the two SELECT policies
DROP POLICY IF EXISTS "Published courses are viewable by everyone" ON courses;
DROP POLICY IF EXISTS "Authenticated users can manage courses" ON courses;

-- Consolidated SELECT policy
CREATE POLICY "View courses"
  ON courses FOR SELECT
  USING (
    -- Published courses are viewable by everyone
    status = 'published'
    OR
    -- Authenticated users can view all courses
    (SELECT auth.role()) = 'authenticated'
  );

-- Separate policies for INSERT, UPDATE, DELETE operations
CREATE POLICY "Authenticated users can insert courses"
  ON courses FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update courses"
  ON courses FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete courses"
  ON courses FOR DELETE
  TO authenticated
  USING (true);

-- -----------------------------------------------------------------------------
-- Table: student_checklists (SELECT and UPDATE policies)
-- -----------------------------------------------------------------------------
-- Remove duplicate policies and consolidate
DROP POLICY IF EXISTS "Students can read their own checklists" ON student_checklists;
DROP POLICY IF EXISTS "Students can update their own checklists" ON student_checklists;
DROP POLICY IF EXISTS "Authenticated users can manage all checklists" ON student_checklists;

-- Consolidated SELECT policy
CREATE POLICY "View student checklists"
  ON student_checklists FOR SELECT
  TO authenticated
  USING (
    -- Students can view their own checklists OR authenticated users (admins/instructors) can view all
    EXISTS (
      SELECT 1 FROM course_signups cs
      WHERE cs.id = student_checklists.course_signup_id
        AND cs.student_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
    )
    OR
    -- Authenticated users can view all (admin/instructor access)
    true
  );

-- Consolidated UPDATE policy
CREATE POLICY "Update student checklists"
  ON student_checklists FOR UPDATE
  TO authenticated
  USING (
    -- Students can update their own checklists OR authenticated users (admins/instructors) can update all
    EXISTS (
      SELECT 1 FROM course_signups cs
      WHERE cs.id = student_checklists.course_signup_id
        AND cs.student_id::text = (SELECT current_setting('request.jwt.claims', true)::json->>'userId')
    )
    OR
    -- Authenticated users can update all (admin/instructor access)
    true
  );

-- Separate policies for INSERT and DELETE operations
CREATE POLICY "Authenticated users can insert checklists"
  ON student_checklists FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete checklists"
  ON student_checklists FOR DELETE
  TO authenticated
  USING (true);

-- ============================================================================
-- Summary of Changes
-- ============================================================================
-- 1. Fixed 17 RLS policies with auth function initialization issues by wrapping in SELECT
-- 2. Consolidated 6 sets of duplicate permissive policies
-- 3. All current_setting() and auth.<function>() calls now wrapped in (SELECT ...)
-- 4. Reduced total number of redundant policies for better performance
-- ============================================================================
