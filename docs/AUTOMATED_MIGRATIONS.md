# Automated Production Database Migrations

This guide explains how to run database migrations automatically using GitHub Actions.

## Overview

Database migrations now run automatically when you push changes to the `main` branch. The system uses direct PostgreSQL connections instead of the Supabase JavaScript client, which allows executing DDL statements (CREATE TABLE, ALTER TABLE, etc.).

## How It Works

### Automatic Trigger

When you push to `main` branch and the changes include:
- New or modified migration files in `migrations/`
- Changes to `scripts/migrate-prod-direct.js`
- Changes to the workflow file itself

The GitHub Action will automatically:
1. Check current migration status
2. Run pending migrations
3. Verify migrations completed successfully

### Manual Trigger

You can also manually trigger migrations from GitHub:
1. Go to **Actions** tab in your repository
2. Select **Database Migrations** workflow
3. Click **Run workflow**
4. Choose whether to run all migrations or just one at a time

## Setup Instructions

### 1. Add GitHub Secrets

Go to your repository → **Settings** → **Secrets and variables** → **Actions**

Add these secrets:

#### `SUPABASE_DB_PASSWORD`
Your Supabase database password.

**Where to find it:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Look for **Database password** in the Connection string section

#### `NEXT_PUBLIC_SUPABASE_URL` (if not already set)
Your Supabase project URL (e.g., `https://cymypipxhlgjmrzonpdw.supabase.co`)

### 2. Test Locally First

Before pushing to production, always test migrations locally:

```bash
# Check status
npm run migrate:prod:status

# Run all pending migrations
npm run migrate:prod

# Or run one at a time
npm run migrate:prod:step
```

**Note:** You need to add `SUPABASE_DB_PASSWORD` to your `.env.production.local` file:

```bash
echo 'SUPABASE_DB_PASSWORD=your_password_here' >> .env.production.local
```

### 3. Create a New Migration

```bash
npm run migrate:create add_new_feature
```

This creates a new file like `migrations/030_add_new_feature.sql`

### 4. Commit and Push

```bash
git add migrations/030_add_new_feature.sql
git commit -m "Add new feature migration"
git push origin main
```

The migration will run automatically via GitHub Actions! 🚀

## Migration Scripts

### Local Development (Docker)
```bash
npm run migrate              # Run all pending migrations
npm run migrate:status       # Check status
npm run migrate:step         # Run one migration at a time
```

### Production (Direct PostgreSQL)
```bash
npm run migrate:prod         # Run all pending migrations
npm run migrate:prod:status  # Check status
npm run migrate:prod:step    # Run one migration at a time
```

## Connection Methods

### Local Script (`scripts/migrate.js`)
- Uses Supabase JavaScript client
- Works for most operations
- **Cannot** execute DDL statements (CREATE TABLE, ALTER TABLE)

### Production Script (`scripts/migrate-prod-direct.js`)
- Uses direct PostgreSQL connection (pg library)
- **Can** execute all SQL statements including DDL
- Requires database password

## Environment Variables

### `.env.local` (Local development)
```bash
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_local_key
```

### `.env.production.local` (Production testing)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_DB_PASSWORD=your_database_password
```

### GitHub Secrets (GitHub Actions)
- `SUPABASE_DB_PASSWORD` - Database password
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL

## Workflow File

Location: `.github/workflows/database-migrations.yml`

The workflow:
1. Triggers on push to `main` when migration files change
2. Can be manually triggered from GitHub Actions UI
3. Installs dependencies
4. Checks migration status
5. Runs pending migrations
6. Verifies success
7. Comments on commit if migration fails

## Troubleshooting

### "Missing database credentials" Error

Make sure you have set `SUPABASE_DB_PASSWORD` in:
- `.env.production.local` (for local testing)
- GitHub Secrets (for GitHub Actions)

### "Could not connect to database" Error

Check that:
1. Database password is correct
2. Your IP is not blocked by Supabase (database should allow connections from GitHub Actions)
3. The connection string format is correct

### Migration Failed

If a migration fails:
1. Check the GitHub Actions logs for error details
2. Fix the migration file
3. Test locally: `npm run migrate:prod:status`
4. Commit and push the fix

### Reset Migration (Danger!)

If you need to re-run a failed migration:

```sql
-- In Supabase SQL Editor
DELETE FROM migrations_history WHERE migration_name = '030_your_migration.sql';
```

Then push again to trigger the workflow.

## Best Practices

1. **Always test locally first** before pushing to production
2. **One migration per feature** - keep migrations focused
3. **Never modify applied migrations** - create a new one instead
4. **Use transactions** when possible (most DDL statements auto-commit in PostgreSQL)
5. **Add rollback instructions** in migration comments
6. **Check status before and after** running migrations

## Migration Naming Convention

```
NNN_descriptive_name.sql
```

Where:
- `NNN` is a sequential number (001, 002, etc.)
- `descriptive_name` describes what the migration does
- Use snake_case for the description

Examples:
- `028_create_students_table.sql`
- `029_add_student_id_to_course_signups.sql`
- `030_add_email_verification_tokens.sql`

## Security Notes

- Database password is stored as a GitHub Secret (encrypted)
- Never commit passwords to git
- `.env.production.local` is in `.gitignore`
- Migrations run with full database access (be careful!)

## Monitoring

You can monitor migrations:
1. **GitHub Actions** - See workflow runs in the Actions tab
2. **Supabase Dashboard** - Check tables and data in the dashboard
3. **Local status** - Run `npm run migrate:prod:status` anytime

## Need Help?

- Check migration logs: `npm run migrate:prod:status`
- View GitHub Actions logs: Repository → Actions → Latest workflow run
- Check Supabase logs: Dashboard → Logs
