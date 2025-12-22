# Database Migrations

This directory contains all database migrations for the idir.ai project. Migrations are managed using a custom migration runner that tracks which migrations have been applied.

## Directory Structure

```
migrations/
├── README.md                           # This file
├── 000_migrations_history.sql          # Migration tracking table (run automatically)
├── 001_create_users_table.sql         # User accounts and RBAC
├── 002_create_token_blacklist.sql     # JWT token revocation
├── 003_create_blog_posts.sql          # Blog posts with i18n
├── 004_create_newsletter_subscribers.sql  # Newsletter subscribers
├── 005_create_audit_logs.sql          # Audit logging
├── 006_create_newsletter_feedback.sql # Newsletter feedback
├── 007_add_social_profiles_to_users.sql   # Social media URLs
├── 008_add_answered_at_to_feedback.sql    # Feedback tracking
├── 009_add_sent_at_to_feedback.sql    # Email tracking
├── applied/                            # (Future) Applied migrations backup
└── archive/                            # Old/deprecated migration files
```

## Quick Start

### NEW: Migration Management Scripts 🚀

We now have dedicated scripts for better migration tracking:

#### Check Migration Status

```bash
./scripts/migration-status.sh
```

Shows:
- Total migrations (applied + pending)
- List of applied migrations with timestamps
- List of pending migrations
- Execution times

#### Apply a Single Migration

```bash
./scripts/migrate.sh migrations/027_migrate_course_signups_to_course_id.sql
```

Features:
- Checks if already applied
- Shows checksum for verification
- Confirms before applying
- Records execution time
- Tracks in migrations_history table

#### Mark Migration as Applied (Without Running)

```bash
./scripts/mark-applied.sh migrations/027_migrate_course_signups_to_course_id.sql
```

Use this if you already ran a migration manually and want to mark it in the tracking system.

#### Mark All Migrations as Applied (Bulk)

```bash
./scripts/mark-all-applied.sh
```

Use this ONCE to initialize tracking for an existing database where all migrations were already run manually.

⚠️ **WARNING**: Only use this if your database already has all migrations applied!

---

### Old npm Scripts (Still Work)

```bash
npm run migrate:status  # Check status
npm run migrate         # Run all pending
npm run migrate:step    # Run one at a time
```

### Create a New Migration

```bash
npm run migrate:create add_user_avatar_column
```

This creates a new migration file with the next number and your specified name.

## Migration Naming Convention

Migrations follow this format: `NNN_description.sql`

- `NNN`: Three-digit number (001, 002, etc.)
- `description`: Snake_case description of what the migration does

Examples:
- `001_create_users_table.sql`
- `007_add_social_profiles_to_users.sql`
- `012_add_index_to_blog_posts.sql`

## Writing Migrations

### Best Practices

1. **Use IF NOT EXISTS**: Always use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, etc.
   ```sql
   CREATE TABLE IF NOT EXISTS my_table (...);
   ```

2. **Add Comments**: Document your migrations with SQL comments
   ```sql
   -- Migration: Add user avatar support
   -- Description: Adds avatar_url column to users table

   ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
   ```

3. **Use ADD COLUMN IF NOT EXISTS**: When altering tables
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
   ```

4. **Include Indexes**: Create necessary indexes in the same migration
   ```sql
   CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
   ```

5. **Add Constraints**: Include all necessary constraints
   ```sql
   ALTER TABLE posts
   ADD CONSTRAINT fk_author
   FOREIGN KEY (author_id) REFERENCES users(id);
   ```

6. **RLS Policies**: Set up Row Level Security policies
   ```sql
   ALTER TABLE my_table ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "policy_name" ON my_table
     FOR SELECT
     USING (auth.uid() = user_id);
   ```

### Migration Template

```sql
-- Migration: [Short description]
-- Description: [Detailed description of what this migration does]

-- Your SQL here

-- Add comments for documentation
COMMENT ON TABLE my_table IS 'Description of the table';
COMMENT ON COLUMN my_table.my_column IS 'Description of the column';
```

## How It Works

### Migration Tracking

The system uses a `migrations_history` table to track which migrations have been applied:

```sql
CREATE TABLE migrations_history (
  id SERIAL PRIMARY KEY,
  migration_name VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checksum VARCHAR(64),
  execution_time_ms INTEGER,
  applied_by VARCHAR(255)
);
```

### Migration Process

1. The runner reads all `.sql` files in the `migrations/` directory
2. It checks the `migrations_history` table to see which have been applied
3. It runs pending migrations in order (by filename)
4. After each successful migration, it records it in `migrations_history`
5. If a migration fails, the process stops and reports the error

### Checksums

Each migration's content is hashed to detect modifications. If you modify a migration that has already been applied, the system will warn you.

## Environment Variables

Make sure these are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Troubleshooting

### "Missing SUPABASE_URL" Error

Make sure your environment variables are set. Load them before running migrations:

```bash
# If using dotenv
node -r dotenv/config scripts/migrate.js status

# Or export them
export NEXT_PUBLIC_SUPABASE_URL=your_url
export SUPABASE_SERVICE_ROLE_KEY=your_key
npm run migrate:status
```

### "Table already exists" Error

This is usually fine! Our migrations use `IF NOT EXISTS` clauses, so they're idempotent. The migration will be marked as applied even if some objects already exist.

### Migration Failed Mid-Way

If a migration fails partway through:

1. Check what was created:
   ```bash
   npm run migrate:status
   ```

2. Manually fix the database state if needed

3. Update the migration file to handle the partial state

4. Re-run the migration

### Need to Re-run a Migration

If you absolutely need to re-run a migration that failed:

1. Remove it from migrations_history:
   ```sql
   DELETE FROM migrations_history
   WHERE migration_name = '005_my_migration.sql';
   ```

2. Fix the migration file

3. Re-run migrations:
   ```bash
   npm run migrate
   ```

## Manual Migration (Without Runner)

If you need to run a migration manually in Supabase Dashboard:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of the migration file
3. Run the SQL
4. Manually insert into migrations_history:
   ```sql
   INSERT INTO migrations_history (migration_name, checksum)
   VALUES ('005_my_migration.sql', 'checksum_here');
   ```

## Advanced Usage

### Run Specific Migration

```bash
# Run the migration script directly
node scripts/migrate.js up --step=1
```

### Get Detailed Status

```bash
node scripts/migrate.js status
```

### Create Migration with Custom Number

Manually create a file following the naming convention:
```bash
touch migrations/010_my_custom_migration.sql
```

## Migration History

All old SQL files have been moved to `migrations/archive/` for reference. The new numbered migrations in the root `migrations/` directory are the source of truth.

## Contributing

When adding new database features:

1. Create a new migration using `npm run migrate:create`
2. Write your SQL following the best practices above
3. Test locally using `npm run migrate:step`
4. Commit the migration file
5. Document any breaking changes in the migration comments
