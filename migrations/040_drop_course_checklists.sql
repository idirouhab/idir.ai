-- Migration: 040_drop_course_checklists
-- Description: Removes course_checklists table and all related objects
-- Created: 2025-12-28
-- Note: This drops all data in course_checklists table

-- Drop the table with CASCADE to remove all dependent objects
-- This will automatically drop:
-- - All indexes on the table
-- - All triggers on the table
-- - All RLS policies on the table
-- - All foreign key constraints referencing this table
-- - All comments on the table/columns
DROP TABLE IF EXISTS course_checklists CASCADE;
