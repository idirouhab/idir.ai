-- Migration: Drop live_events table and related objects
-- Date: 2024-12-19
-- Description: Remove live events functionality completely

-- Drop the table (this will automatically drop dependent triggers)
DROP TABLE IF EXISTS live_events CASCADE;

-- Drop the trigger function if it exists
DROP FUNCTION IF EXISTS ensure_single_active_event() CASCADE;
