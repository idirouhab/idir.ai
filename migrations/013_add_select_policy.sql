-- Migration: Add SELECT policy for newsletter_subscribers
-- Created: 2025-01-17
-- Description: Allows the public anon role to read subscription data (needed for preferences management)

-- Drop policy if it exists (ignore errors if it doesn't exist)
DO $$
BEGIN
  DROP POLICY IF EXISTS "Anyone can view their subscription" ON newsletter_subscribers;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Add SELECT policy to allow reading subscription data
CREATE POLICY "Anyone can view their subscription"
ON newsletter_subscribers
FOR SELECT
TO public
USING (true);
