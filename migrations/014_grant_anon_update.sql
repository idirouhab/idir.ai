-- Migration: Grant UPDATE permission to anon role
-- Created: 2025-01-17
-- Description: Allows the anon role to update newsletter_subscribers table (required for preferences management)

-- Grant UPDATE permission to anon role
GRANT UPDATE ON newsletter_subscribers TO anon;
