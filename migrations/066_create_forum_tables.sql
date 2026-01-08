-- Migration: 066_create_forum_tables
-- Description: Creates forum_posts and forum_answers tables for course Q&A
-- Created: 2026-01-08

-- ============================================
-- FORUM POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS forum_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Course reference
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  -- Author (student or instructor)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,

  -- Metadata
  is_pinned BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT title_not_empty CHECK (title <> ''),
  CONSTRAINT body_not_empty CHECK (body <> '')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forum_posts_course_id ON forum_posts(course_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_user_id ON forum_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_posts_created_at ON forum_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_forum_posts_is_pinned ON forum_posts(course_id, is_pinned, created_at DESC);

-- ============================================
-- FORUM ANSWERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS forum_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  post_id UUID NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE, -- Denormalized for performance

  -- Author (student or instructor)
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Content
  body TEXT NOT NULL,

  -- Verification (auto-set by trigger if author is instructor)
  is_verified BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT body_not_empty CHECK (body <> '')
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_forum_answers_post_id ON forum_answers(post_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_forum_answers_course_id ON forum_answers(course_id);
CREATE INDEX IF NOT EXISTS idx_forum_answers_user_id ON forum_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_forum_answers_is_verified ON forum_answers(post_id, is_verified);

-- ============================================
-- AUTO-UPDATE TRIGGERS
-- ============================================

-- Function to update updated_at timestamp (create if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Updated at trigger for posts
DROP TRIGGER IF EXISTS update_forum_posts_updated_at ON forum_posts;
CREATE TRIGGER update_forum_posts_updated_at
  BEFORE UPDATE ON forum_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Updated at trigger for answers
DROP TRIGGER IF EXISTS update_forum_answers_updated_at ON forum_answers;
CREATE TRIGGER update_forum_answers_updated_at
  BEFORE UPDATE ON forum_answers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- AUTO-VERIFICATION TRIGGER
-- ============================================

-- Function to auto-verify answers from instructors
CREATE OR REPLACE FUNCTION auto_verify_instructor_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the answer author is an instructor for this course
  IF EXISTS (
    SELECT 1
    FROM course_instructors ci
    WHERE ci.course_id = NEW.course_id
      AND ci.instructor_id = NEW.user_id
  ) THEN
    NEW.is_verified := true;
  ELSE
    NEW.is_verified := false;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-verify on insert
DROP TRIGGER IF EXISTS auto_verify_instructor_answer_trigger ON forum_answers;
CREATE TRIGGER auto_verify_instructor_answer_trigger
  BEFORE INSERT ON forum_answers
  FOR EACH ROW
  EXECUTE FUNCTION auto_verify_instructor_answer();

-- ============================================
-- ROW LEVEL SECURITY (Defense-in-depth)
-- ============================================

ALTER TABLE forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_answers ENABLE ROW LEVEL SECURITY;

-- NOTE: Current app uses direct postgres connections, not Supabase client
-- These policies serve as defense-in-depth but won't be the primary access control
-- Primary access control happens in API routes

-- Forum Posts: Read access for course members
DROP POLICY IF EXISTS "Course members can read forum posts" ON forum_posts;
CREATE POLICY "Course members can read forum posts"
  ON forum_posts FOR SELECT
  TO authenticated
  USING (
    -- User is enrolled as student
    EXISTS (
      SELECT 1 FROM course_signups cs
      WHERE cs.course_id = forum_posts.course_id
        AND cs.student_id::text = current_setting('request.jwt.claims', true)::json->>'userId'
    )
    OR
    -- User is assigned as instructor
    EXISTS (
      SELECT 1 FROM course_instructors ci
      WHERE ci.course_id = forum_posts.course_id
        AND ci.instructor_id::text = current_setting('request.jwt.claims', true)::json->>'userId'
    )
  );

-- Forum Posts: Write access for course members
DROP POLICY IF EXISTS "Course members can create forum posts" ON forum_posts;
CREATE POLICY "Course members can create forum posts"
  ON forum_posts FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'userId'
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

-- Forum Posts: Authors can update their own posts
DROP POLICY IF EXISTS "Authors can update own forum posts" ON forum_posts;
CREATE POLICY "Authors can update own forum posts"
  ON forum_posts FOR UPDATE
  TO authenticated
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId')
  WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Forum Answers: Read access for course members
DROP POLICY IF EXISTS "Course members can read forum answers" ON forum_answers;
CREATE POLICY "Course members can read forum answers"
  ON forum_answers FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM course_signups cs
      WHERE cs.course_id = forum_answers.course_id
        AND cs.student_id::text = current_setting('request.jwt.claims', true)::json->>'userId'
    )
    OR
    EXISTS (
      SELECT 1 FROM course_instructors ci
      WHERE ci.course_id = forum_answers.course_id
        AND ci.instructor_id::text = current_setting('request.jwt.claims', true)::json->>'userId'
    )
  );

-- Forum Answers: Write access for course members
DROP POLICY IF EXISTS "Course members can create forum answers" ON forum_answers;
CREATE POLICY "Course members can create forum answers"
  ON forum_answers FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id::text = current_setting('request.jwt.claims', true)::json->>'userId'
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

-- Forum Answers: Authors can update their own answers
DROP POLICY IF EXISTS "Authors can update own forum answers" ON forum_answers;
CREATE POLICY "Authors can update own forum answers"
  ON forum_answers FOR UPDATE
  TO authenticated
  USING (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId')
  WITH CHECK (user_id::text = current_setting('request.jwt.claims', true)::json->>'userId');

-- Service role can do everything (for admin operations)
DROP POLICY IF EXISTS "Service role can manage forum posts" ON forum_posts;
CREATE POLICY "Service role can manage forum posts"
  ON forum_posts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can manage forum answers" ON forum_answers;
CREATE POLICY "Service role can manage forum answers"
  ON forum_answers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE forum_posts IS 'Public Q&A forum posts for courses';
COMMENT ON TABLE forum_answers IS 'Answers to forum posts';
COMMENT ON COLUMN forum_answers.is_verified IS 'Auto-set to true if answer author is a course instructor';
COMMENT ON FUNCTION auto_verify_instructor_answer() IS 'Automatically verifies answers from course instructors';
