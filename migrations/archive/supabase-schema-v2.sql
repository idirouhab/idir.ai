-- Updated live_events table schema with shared fields
-- This migration updates the schema to have shared platform, date, time fields

-- Drop the old table and start fresh (WARNING: This deletes all data)
DROP TABLE IF EXISTS live_events CASCADE;

-- Create updated live_events table
CREATE TABLE IF NOT EXISTS live_events (
  id BIGSERIAL PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT false,

  -- Event details
  title TEXT NOT NULL,
  event_language TEXT NOT NULL, -- 'English', 'Spanish', 'English & Spanish', etc.
  event_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
  timezone TEXT NOT NULL,
  platform TEXT NOT NULL,
  platform_url TEXT NOT NULL,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_live_events_is_active ON live_events(is_active);

-- Create an index on event_datetime for sorting
CREATE INDEX IF NOT EXISTS idx_live_events_datetime ON live_events(event_datetime);

-- Enable Row Level Security (RLS)
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
DROP POLICY IF EXISTS "Allow public read access" ON live_events;
CREATE POLICY "Allow public read access"
  ON live_events
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated updates
DROP POLICY IF EXISTS "Allow authenticated updates" ON live_events;
CREATE POLICY "Allow authenticated updates"
  ON live_events
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policy to allow authenticated inserts
DROP POLICY IF EXISTS "Allow authenticated inserts" ON live_events;
CREATE POLICY "Allow authenticated inserts"
  ON live_events
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create policy to allow authenticated deletes
DROP POLICY IF EXISTS "Allow authenticated deletes" ON live_events;
CREATE POLICY "Allow authenticated deletes"
  ON live_events
  FOR DELETE
  TO public
  USING (true);


-- Function to ensure only one event can be active at a time
CREATE OR REPLACE FUNCTION ensure_single_active_event()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new/updated row is being set to active
  IF NEW.is_active = true THEN
    -- Deactivate all other events
    UPDATE live_events
    SET is_active = false
    WHERE id != NEW.id AND is_active = true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to enforce single active event
DROP TRIGGER IF EXISTS trigger_single_active_event ON live_events;
CREATE TRIGGER trigger_single_active_event
  BEFORE INSERT OR UPDATE ON live_events
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_active_event();

-- Update the updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_timestamp ON live_events;
CREATE TRIGGER trigger_update_timestamp
  BEFORE UPDATE ON live_events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample event
INSERT INTO live_events (
  is_active,
  title,
  event_language,
  event_datetime,
  timezone,
  platform,
  platform_url
) VALUES (
  false,
  'AI & Automation Deep Dive - Live Session',
  'English & Spanish',
  '2024-12-15 18:00:00+01:00',  -- 6 PM CET
  'Europe/Madrid',
  'YouTube Live',
  'https://www.youtube.com/@Prompt_and_Play'
);
