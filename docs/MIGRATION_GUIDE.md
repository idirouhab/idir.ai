# Migration Tracking System Guide

## Problem You Had

Your `migrations_history` table was empty, making it impossible to know which migrations were already applied to your database. This meant:
- ❌ No way to track which migrations ran
- ❌ Risk of re-running migrations accidentally
- ❌ Difficult to coordinate between local and production
- ❌ Hard to know which migrations need to run

## Solution: New Migration Management Scripts

I've created 4 new scripts to help you manage migrations properly:

### 1. Check Status: `migration-status.sh`

```bash
./scripts/migration-status.sh
```

**What it shows:**
- Total migrations count
- How many are applied
- How many are pending
- Full list of each with timestamps
- Execution times for applied migrations

**Use this:** Anytime you want to see what's going on with your migrations.

---

### 2. Apply Migration: `migrate.sh`

```bash
./scripts/migrate.sh migrations/027_migrate_course_signups_to_course_id.sql
```

**What it does:**
1. ✅ Checks if migration was already applied
2. ✅ Calculates checksum for verification
3. ✅ Asks for confirmation before running
4. ✅ Applies the migration
5. ✅ Records in `migrations_history` table
6. ✅ Tracks execution time

**Use this:** When you want to apply a new migration properly.

---

### 3. Mark as Applied: `mark-applied.sh`

```bash
./scripts/mark-applied.sh migrations/027_migrate_course_signups_to_course_id.sql
```

**What it does:**
- Marks a migration as applied WITHOUT running it
- Records checksum
- Adds to migrations_history

**Use this:** When you already ran a migration manually and want to track it.

---

### 4. Mark All Applied: `mark-all-applied.sh`

```bash
./scripts/mark-all-applied.sh
```

**What it does:**
- Marks ALL 29 migrations as applied in one go
- Does NOT run any migrations
- Just updates the tracking table

**Use this:** ONCE to initialize tracking for your existing database.

⚠️ **IMPORTANT**: Only use this if you know all migrations have been run!

---

## Recommended Setup Process

Since your database already has migrations applied but the tracking is empty, here's what I recommend:

### Option 1: Mark All as Applied (Recommended)

If you're confident all migrations have been run:

```bash
# 1. Check current status
./scripts/migration-status.sh

# 2. Mark all as applied
./scripts/mark-all-applied.sh

# 3. Verify
./scripts/migration-status.sh
```

This will show all 29 migrations as applied.

### Option 2: Mark Individual Migrations

If you only want to mark specific migrations:

```bash
# Mark migrations 001-027 one by one
./scripts/mark-applied.sh migrations/001_create_users_table.sql
./scripts/mark-applied.sh migrations/002_create_token_blacklist.sql
# ... etc
```

### Option 3: Fresh Start (Nuclear Option)

If you want to start completely fresh:

```bash
# 1. Backup your database first!
# 2. Drop all tables
# 3. Run all migrations from scratch using migrate.sh
./scripts/migrate.sh migrations/001_create_users_table.sql
./scripts/migrate.sh migrations/002_create_token_blacklist.sql
# ... etc
```

---

## Daily Workflow

Once you've initialized tracking:

### Creating a New Migration

```bash
# 1. Create your migration file
touch migrations/028_add_new_feature.sql

# 2. Write your SQL in that file
# ... edit the file ...

# 3. Check status
./scripts/migration-status.sh

# 4. Apply the migration
./scripts/migrate.sh migrations/028_add_new_feature.sql

# 5. Verify it worked
./scripts/migration-status.sh
```

### Checking What Needs to Run

```bash
./scripts/migration-status.sh
```

This will show:
- ✅ Applied migrations (in green)
- ⏳ Pending migrations (in yellow)

---

## Migration History Table

The `migrations_history` table tracks:

| Column | Description |
|--------|-------------|
| `id` | Auto-increment ID |
| `migration_name` | File name (e.g., "027_migrate_course_signups_to_course_id.sql") |
| `applied_at` | Timestamp when applied |
| `checksum` | SHA-256 hash of the file (detects changes) |
| `execution_time_ms` | How long it took to run |
| `applied_by` | Database user who ran it |

You can query it directly:

```sql
SELECT * FROM migrations_history ORDER BY applied_at DESC;
```

---

## Production vs Local

### Local Database (Supabase Local)
- Host: `127.0.0.1`
- Port: `54322`
- Default scripts connect here

### Production Database
Set environment variables:

```bash
export DB_HOST=aws-0-eu-central-1.pooler.supabase.com
export DB_PORT=6543
export DB_USER=postgres.cymypipxhlgjmrzonpdw
export DB_PASSWORD=your_password
export DB_NAME=postgres

# Then run scripts
./scripts/migration-status.sh
./scripts/migrate.sh migrations/028_new_feature.sql
```

---

## Tips & Best Practices

### ✅ DO:
- Always check status before applying: `./scripts/migration-status.sh`
- Use `migrate.sh` for new migrations
- Keep migration files small and focused
- Test migrations on local before production
- Backup production database before major migrations

### ❌ DON'T:
- Don't modify migration files after they've been applied (checksum will change)
- Don't skip migrations
- Don't run migrations directly with psql (use scripts)
- Don't delete from migrations_history table manually

---

## Troubleshooting

### "Migration already applied" but you need to re-run it

```bash
# Delete from history (be careful!)
psql -c "DELETE FROM migrations_history WHERE migration_name = '027_migrate_course_signups_to_course_id.sql';"

# Then run again
./scripts/migrate.sh migrations/027_migrate_course_signups_to_course_id.sql
```

### Check if a specific migration ran

```bash
psql -c "SELECT * FROM migrations_history WHERE migration_name = '027_migrate_course_signups_to_course_id.sql';"
```

### See execution times

```bash
psql -c "SELECT migration_name, execution_time_ms, applied_at FROM migrations_history ORDER BY execution_time_ms DESC;"
```

---

## Next Steps

1. **Initialize tracking** (choose one option above)
2. **Verify status**: `./scripts/migration-status.sh`
3. **Use scripts for all future migrations**
4. **Add to your workflow**: Check status before/after deployments

---

## Questions?

- Check status: `./scripts/migration-status.sh`
- Read the migrations README: `migrations/README.md`
- Check this guide: `docs/MIGRATION_GUIDE.md`
