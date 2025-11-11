# Database Migrations Quick Reference

## Overview

All database migrations have been organized into a proper migration management system. No more random SQL files!

## 📁 New Structure

```
migrations/
├── 000_migrations_history.sql          # Tracking table
├── 001_create_users_table.sql         # ✓
├── 002_create_token_blacklist.sql     # ✓
├── 003_create_blog_posts.sql          # ✓
├── 004_create_newsletter_subscribers.sql  # ✓
├── 005_create_audit_logs.sql          # ✓
├── 006_create_newsletter_feedback.sql # ✓
├── 007_add_social_profiles_to_users.sql   # ✓
├── 008_add_answered_at_to_feedback.sql    # ✓
├── 009_add_sent_at_to_feedback.sql    # ✓
└── README.md                           # Full documentation
```

## 🚀 Common Commands

```bash
# Check which migrations are pending
npm run migrate:status

# Run all pending migrations
npm run migrate

# Run one migration at a time (safer)
npm run migrate:step

# Create a new migration
npm run migrate:create add_user_avatar
```

## 📝 Creating New Migrations

```bash
# 1. Create the migration file
npm run migrate:create add_user_avatar_column

# 2. Edit the new file in migrations/
# migrations/010_add_user_avatar_column.sql

# 3. Write your SQL
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

# 4. Test it
npm run migrate:step

# 5. Check status
npm run migrate:status
```

## ✅ Migration Best Practices

1. **Always use IF NOT EXISTS**
   ```sql
   CREATE TABLE IF NOT EXISTS my_table (...);
   ALTER TABLE users ADD COLUMN IF NOT EXISTS new_col TEXT;
   ```

2. **Add descriptive comments**
   ```sql
   -- Migration: Add user avatars
   -- Description: Adds avatar_url column to store user profile pictures
   ```

3. **Include indexes**
   ```sql
   CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
   ```

4. **Test locally first**
   ```bash
   npm run migrate:step  # Run one at a time
   ```

## 📦 What Changed?

### Before (messy)
```
/
├── supabase-schema.sql
├── supabase-schema-v2.sql
├── supabase-schema-v3.sql
├── supabase-blog-schema.sql
├── supabase-newsletter-schema.sql
├── supabase-add-social-profiles.sql
└── ... more random SQL files
```

### After (organized)
```
/
├── migrations/
│   ├── 001_create_users_table.sql
│   ├── 002_create_token_blacklist.sql
│   ├── 003_create_blog_posts.sql
│   └── ... (numbered and tracked)
└── scripts/
    └── migrate.js (migration runner)
```

## 🔍 Migration Tracking

The system tracks which migrations have been applied in the `migrations_history` table:

```sql
SELECT * FROM migrations_history;
```

Shows:
- Which migrations ran
- When they ran
- How long they took
- Who ran them

## 🆘 Troubleshooting

### Environment Variables Missing

```bash
# Make sure these are set in .env.local
NEXT_PUBLIC_SUPABASE_URL=your_url
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

### Migration Already Applied

If you need to re-run a migration:

```sql
DELETE FROM migrations_history WHERE migration_name = '005_my_migration.sql';
```

Then run `npm run migrate` again.

## 📚 Full Documentation

See `migrations/README.md` for complete documentation including:
- How the system works
- Writing complex migrations
- Handling RLS policies
- Troubleshooting guides
- Advanced usage

## 🗄️ Old Files

All old SQL files have been moved to `migrations/archive/` for reference. They are no longer used but kept for history.
