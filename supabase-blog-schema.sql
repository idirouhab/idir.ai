-- Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown content
  cover_image TEXT,

  -- SEO
  meta_description TEXT,
  meta_keywords TEXT[],

  -- Organization
  category TEXT NOT NULL CHECK (category IN ('insights', 'learnings', 'opinion')),
  tags TEXT[] DEFAULT '{}',

  -- Internationalization
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es')),

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at TIMESTAMPTZ,

  -- Stats
  view_count INTEGER DEFAULT 0,
  read_time_minutes INTEGER,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT slug_not_empty CHECK (slug <> ''),
  CONSTRAINT title_not_empty CHECK (title <> ''),
  CONSTRAINT valid_published_date CHECK (
    (status = 'published' AND published_at IS NOT NULL) OR
    (status = 'draft')
  )
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_language ON blog_posts(language);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_blog_posts_updated_at ON blog_posts;
CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-generate slug from title
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '-+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (Row Level Security)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Published posts are viewable by everyone"
  ON blog_posts FOR SELECT
  USING (status = 'published');

-- Authenticated users (admin) can do everything
CREATE POLICY "Authenticated users can manage posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Function to increment post view count
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE blog_posts
  SET view_count = view_count + 1
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to anon users (public can view posts)
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO anon;

-- Comments for documentation
COMMENT ON TABLE blog_posts IS 'Blog posts with markdown content, categories: insights, learnings, opinion';
COMMENT ON COLUMN blog_posts.slug IS 'URL-friendly identifier, e.g., why-ai-browsers-matter';
COMMENT ON COLUMN blog_posts.content IS 'Markdown formatted content';
COMMENT ON COLUMN blog_posts.category IS 'One of: insights, learnings, opinion';
COMMENT ON COLUMN blog_posts.status IS 'draft or published';
COMMENT ON COLUMN blog_posts.read_time_minutes IS 'Auto-calculated based on word count';
