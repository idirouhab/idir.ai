# Setting Up Migration Tracking in Production

## Problem

You noticed that `migrations_history` table exists in your **local** database but not in **production**. This means production doesn't have migration tracking set up yet.

## Solution: 3 Easy Steps

### Step 1: Get Your Production Database Password

You need your Supabase production database password. You can find it in:

1. **Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your project: `cymypipxhlgjmrzonpdw`
   - Go to Settings → Database
   - Look for "Connection string" or "Database password"

2. **Or check your Vercel environment variables** (if you deployed there):
   - Go to your Vercel project
   - Settings → Environment Variables
   - Look for `SUPABASE_DB_PASSWORD` or `DATABASE_PASSWORD`

Once you have it, export it:

```bash
export SUPABASE_DB_PASSWORD='your_actual_password_here'
```

---

### Step 2: Create the migrations_history Table in Production

Run this script to create the tracking table:

```bash
SUPABASE_DB_PASSWORD='your_password' ./scripts/setup-migrations-prod.sh
```

**What this does:**
- Connects to your production database
- Checks if `migrations_history` table exists
- If not, creates it using `migrations/000_migrations_history.sql`
- Shows confirmation when done

**Expected output:**
```
=== Setup Migration Tracking in Production ===
Database: aws-0-eu-central-1.pooler.supabase.com

Checking if migrations_history table exists...
migrations_history table not found

⚠ This will create the migrations_history table in PRODUCTION

Continue? (yes/no): yes

Creating migrations_history table...
✓ migrations_history table created successfully

Next steps:
  1. Check status: ./scripts/migration-status-prod.sh
  2. Mark migrations as applied: ./scripts/mark-all-applied-prod.sh
```

---

### Step 3: Mark All Existing Migrations as Applied

Since your production database already has all the migrations applied (tables exist), you need to mark them as applied in the tracking system:

```bash
SUPABASE_DB_PASSWORD='your_password' ./scripts/mark-all-applied-prod.sh
```

**What this does:**
- Goes through all 29 migration files
- Marks each one as applied in `migrations_history`
- Does NOT run the migrations (they're already applied)
- Records checksums for verification

**Expected output:**
```
=== Mark All Migrations as Applied in PRODUCTION ===
Database: aws-0-eu-central-1.pooler.supabase.com

⚠ WARNING: This will mark ALL migrations as applied WITHOUT running them
Only use this if you know all migrations have already been applied to production

Found 29 migration files

Mark all 29 migrations as applied in PRODUCTION? (type 'yes' to confirm): yes

Processing migrations...

  ✓ 001_create_users_table.sql
  ✓ 002_create_token_blacklist.sql
  ✓ 003_create_blog_posts.sql
  ... (all 29 migrations)

Done!
  Marked: 29
  Skipped: 0
```

---

### Step 4: Verify It Worked

Check the status:

```bash
SUPABASE_DB_PASSWORD='your_password' ./scripts/migration-status-prod.sh
```

**Expected output:**
```
=== PRODUCTION Migration Status ===
Database: aws-0-eu-central-1.pooler.supabase.com

✓ migrations_history table exists

Scanning migrations folder...

Summary:
  Total migrations:   29
  Applied:            29
  Pending:            0

✓ Applied Migrations:

         Migration          |     Applied At      | Duration |           User
----------------------------+--------------------+----------+---------------------------
 027_migrate_course_...sql | 2024-12-20 10:30:15 | 0ms     | postgres.cymypipxhlgjm...
 026_remove_course_...sql  | 2024-12-20 10:30:15 | 0ms     | postgres.cymypipxhlgjm...
 ... (all migrations)

⏳ Pending Migrations:

  None - all migrations are applied!
```

---

## Daily Workflow After Setup

Once tracking is set up in production:

### Check Production Status

```bash
export SUPABASE_DB_PASSWORD='your_password'
./scripts/migration-status-prod.sh
```

### Apply a New Migration to Production

```bash
# 1. Test locally first
./scripts/migrate.sh migrations/028_new_feature.sql

# 2. Deploy to production
export SUPABASE_DB_PASSWORD='your_password'
./scripts/migrate-prod.sh migrations/028_new_feature.sql
```

*(Note: I can create `migrate-prod.sh` if you need it)*

---

## Comparison: Local vs Production

### Local Database (Current)

```bash
# Already working
./scripts/migration-status.sh        # Shows status
./scripts/migrate.sh migrations/XXX  # Apply migration
./scripts/mark-all-applied.sh        # Mark all as applied
```

Uses:
- Host: `127.0.0.1`
- Port: `54322`
- User: `postgres`
- Password: `postgres`

### Production Database (New Scripts)

```bash
# New scripts for production
export SUPABASE_DB_PASSWORD='your_password'

./scripts/migration-status-prod.sh        # Shows status
./scripts/setup-migrations-prod.sh        # Create tracking table
./scripts/mark-all-applied-prod.sh        # Mark all as applied
```

Uses:
- Host: `aws-0-eu-central-1.pooler.supabase.com`
- Port: `6543`
- User: `postgres.cymypipxhlgjmrzonpdw`
- Password: From `SUPABASE_DB_PASSWORD` env var

---

## Troubleshooting

### "Error: SUPABASE_DB_PASSWORD environment variable not set"

You need to export your production password:

```bash
export SUPABASE_DB_PASSWORD='your_actual_password'
```

Or run it inline:

```bash
SUPABASE_DB_PASSWORD='your_password' ./scripts/setup-migrations-prod.sh
```

### "Connection failed: Tenant or user not found"

Your password might be wrong. Double-check it in:
- Supabase Dashboard → Settings → Database
- Vercel → Environment Variables

### "Table already exists"

Good! That means step 2 is done. Skip to step 3 (mark all as applied).

### "I want to save my password"

Add to your `.env` file (don't commit it!):

```bash
echo 'SUPABASE_DB_PASSWORD=your_password_here' >> .env
```

Then load it:

```bash
source .env
./scripts/migration-status-prod.sh
```

---

## Security Note

⚠️ **Never commit production passwords to git!**

Make sure `.env` is in your `.gitignore`:

```bash
grep -q "^\.env$" .gitignore || echo ".env" >> .gitignore
```

---

## Quick Reference

| Task | Local | Production |
|------|-------|------------|
| Check status | `./scripts/migration-status.sh` | `SUPABASE_DB_PASSWORD='...' ./scripts/migration-status-prod.sh` |
| Setup tracking | `./scripts/mark-all-applied.sh` | `SUPABASE_DB_PASSWORD='...' ./scripts/setup-migrations-prod.sh` |
| Mark all applied | `./scripts/mark-all-applied.sh` | `SUPABASE_DB_PASSWORD='...' ./scripts/mark-all-applied-prod.sh` |

---

## Next Steps

1. ✅ Get your production database password
2. ✅ Run: `./scripts/setup-migrations-prod.sh`
3. ✅ Run: `./scripts/mark-all-applied-prod.sh`
4. ✅ Verify: `./scripts/migration-status-prod.sh`
5. 🎉 Celebrate! You now have full migration tracking in both local and production

---

## Need Help?

- Local migrations guide: `docs/MIGRATION_GUIDE.md`
- Production setup: `docs/PRODUCTION_MIGRATION_SETUP.md` (this file)
- Main README: `migrations/README.md`
