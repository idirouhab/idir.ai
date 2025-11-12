-- Migration: Add translation_group_id to link bilingual posts
-- Description: Enables grouping of English/Spanish versions of the same post
-- Date: 2025-01-12

-- Add translation_group_id column
ALTER TABLE blog_posts
ADD COLUMN IF NOT EXISTS translation_group_id UUID;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_blog_posts_translation_group_id
ON blog_posts(translation_group_id);

-- Create index for querying by translation group + language
CREATE INDEX IF NOT EXISTS idx_blog_posts_translation_group_language
ON blog_posts(translation_group_id, language);

-- Comment for documentation
COMMENT ON COLUMN blog_posts.translation_group_id IS
'UUID linking translations of the same post across languages. Posts with the same translation_group_id are versions of each other.';

-- Migrate existing posts: Link EN/ES posts created on the same day with matching slugs
-- This is a best-effort migration based on creation time proximity
DO $$
DECLARE
  en_post RECORD;
  es_post RECORD;
  new_group_id UUID;
BEGIN
  -- Loop through English posts without translation_group_id
  FOR en_post IN
    SELECT id, slug, created_at, title
    FROM blog_posts
    WHERE language = 'en'
      AND translation_group_id IS NULL
    ORDER BY created_at DESC
  LOOP
    -- Try to find matching Spanish post
    -- Match criteria: created within 5 minutes of each other
    SELECT id, slug INTO es_post
    FROM blog_posts
    WHERE language = 'es'
      AND translation_group_id IS NULL
      AND ABS(EXTRACT(EPOCH FROM (created_at - en_post.created_at))) < 300 -- Within 5 minutes
    ORDER BY ABS(EXTRACT(EPOCH FROM (created_at - en_post.created_at))) ASC
    LIMIT 1;

    -- Generate new translation group ID
    new_group_id := gen_random_uuid();

    -- Update English post
    UPDATE blog_posts
    SET translation_group_id = new_group_id
    WHERE id = en_post.id;

    -- Update Spanish post if found
    IF es_post.id IS NOT NULL THEN
      UPDATE blog_posts
      SET translation_group_id = new_group_id
      WHERE id = es_post.id;

      RAISE NOTICE 'Linked posts: EN(%) <-> ES(%)', en_post.slug, es_post.slug;
    ELSE
      RAISE NOTICE 'No Spanish match for EN post: %', en_post.slug;
    END IF;
  END LOOP;

  -- Handle orphaned Spanish posts (create individual groups)
  FOR es_post IN
    SELECT id, slug
    FROM blog_posts
    WHERE language = 'es'
      AND translation_group_id IS NULL
  LOOP
    UPDATE blog_posts
    SET translation_group_id = gen_random_uuid()
    WHERE id = es_post.id;

    RAISE NOTICE 'Created individual group for orphaned ES post: %', es_post.slug;
  END LOOP;
END $$;

-- Verify migration
DO $$
DECLARE
  total_posts INTEGER;
  posts_with_group INTEGER;
  orphaned_posts INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_posts FROM blog_posts;
  SELECT COUNT(*) INTO posts_with_group FROM blog_posts WHERE translation_group_id IS NOT NULL;
  SELECT COUNT(*) INTO orphaned_posts FROM blog_posts WHERE translation_group_id IS NULL;

  RAISE NOTICE '=== Migration Summary ===';
  RAISE NOTICE 'Total posts: %', total_posts;
  RAISE NOTICE 'Posts with translation_group_id: %', posts_with_group;
  RAISE NOTICE 'Orphaned posts (no group): %', orphaned_posts;
END $$;
