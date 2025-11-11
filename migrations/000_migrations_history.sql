-- Migration tracking table
-- This table keeps track of which migrations have been applied

CREATE TABLE IF NOT EXISTS migrations_history (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64),
  execution_time_ms INTEGER,
  applied_by VARCHAR(255) DEFAULT current_user
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_migrations_history_name ON migrations_history(migration_name);
CREATE INDEX IF NOT EXISTS idx_migrations_history_applied_at ON migrations_history(applied_at);

-- Comment on table
COMMENT ON TABLE migrations_history IS 'Tracks which database migrations have been applied';
COMMENT ON COLUMN migrations_history.migration_name IS 'Unique name/number of the migration file';
COMMENT ON COLUMN migrations_history.checksum IS 'SHA-256 checksum of the migration file to detect modifications';
COMMENT ON COLUMN migrations_history.execution_time_ms IS 'How long the migration took to execute in milliseconds';
