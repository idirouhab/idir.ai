-- Migration: 091_add_blog_editor_role
-- Description: Adds blog_editor to app_role enum
-- Created: 2026-02-09

DO $$ BEGIN
  ALTER TYPE app_role ADD VALUE 'blog_editor';
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

