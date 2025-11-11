-- Create live_events table
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS live_events (
  id BIGSERIAL PRIMARY KEY,
  is_active BOOLEAN NOT NULL DEFAULT false,
  en_title TEXT NOT NULL,
  en_date TEXT NOT NULL,
  en_time TEXT NOT NULL,
  en_platform TEXT NOT NULL,
  en_platform_url TEXT NOT NULL,
  es_title TEXT NOT NULL,
  es_date TEXT NOT NULL,
  es_time TEXT NOT NULL,
  es_platform TEXT NOT NULL,
  es_platform_url TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on is_active for faster queries
CREATE INDEX IF NOT EXISTS idx_live_events_is_active ON live_events(is_active);

-- Insert initial row (only one row should exist in this table)
INSERT INTO live_events (
  is_active,
  en_title, en_date, en_time, en_platform, en_platform_url,
  es_title, es_date, es_time, es_platform, es_platform_url
) VALUES (
  false,
  'AI & Automation Deep Dive - Live Session',
  'December 15, 2024',
  '6:00 PM CET',
  'YouTube Live',
  'https://www.youtube.com/@Prompt_and_Play',
  'IA y Automatización en Profundidad - Sesión en Vivo',
  '15 de Diciembre, 2024',
  '18:00 CET',
  'YouTube Live',
  'https://www.youtube.com/@Prompt_and_Play'
);

-- Enable Row Level Security (RLS)
ALTER TABLE live_events ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access"
  ON live_events
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated updates
-- Note: You may need to adjust this based on your auth strategy
CREATE POLICY "Allow authenticated updates"
  ON live_events
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);
