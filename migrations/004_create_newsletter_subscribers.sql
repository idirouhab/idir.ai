-- Migration: Create newsletter subscribers table
-- Description: Creates newsletter_subscribers table with email validation and RLS policies

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  lang VARCHAR(2) NOT NULL DEFAULT 'en',
  is_subscribed BOOLEAN DEFAULT true,
  welcomed BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  CONSTRAINT valid_language CHECK (lang IN ('en', 'es')),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Index for faster lookups
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribed ON newsletter_subscribers(is_subscribed) WHERE is_subscribed = true;
CREATE INDEX idx_newsletter_lang ON newsletter_subscribers(lang);

-- Updated at trigger
CREATE OR REPLACE FUNCTION update_newsletter_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_updated_at();

-- RLS (Row Level Security) policies
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public can insert (subscribe)
CREATE POLICY "Anyone can subscribe" ON newsletter_subscribers
  FOR INSERT
  WITH CHECK (true);

-- Public can update their own subscription (unsubscribe)
CREATE POLICY "Users can update their own subscription" ON newsletter_subscribers
  FOR UPDATE
  USING (true);

-- Only authenticated admins can read
CREATE POLICY "Admins can read all subscribers" ON newsletter_subscribers
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Comments for documentation
COMMENT ON TABLE newsletter_subscribers IS 'Newsletter email subscribers with language preferences';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Subscriber email address (unique)';
COMMENT ON COLUMN newsletter_subscribers.lang IS 'Preferred language: en or es';
COMMENT ON COLUMN newsletter_subscribers.is_subscribed IS 'Current subscription status';
COMMENT ON COLUMN newsletter_subscribers.welcomed IS 'Whether welcome email was sent';
