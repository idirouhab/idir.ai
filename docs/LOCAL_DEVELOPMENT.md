# Local Development Setup

This guide explains how to set up and use a local Supabase database for development, separate from your production database.

## Overview

The project now supports two separate database environments:

- **Local (Development)**: Uses a local Supabase instance running in Docker
- **Production**: Uses the hosted Supabase instance at cymypipxhlgjmrzonpdw.supabase.co

## Prerequisites

- Docker installed and running
- Supabase CLI installed (already done via `brew install supabase/tap/supabase`)

## Environment Files

### `.env.development.local` - Local Development
```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<local-service-role-key>
```

### `.env.production.local` - Production
```
NEXT_PUBLIC_SUPABASE_URL=https://cymypipxhlgjmrzonpdw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<prod-service-role-key>
```

### `.env.local` - Default (currently points to production)
Used by Next.js when NODE_ENV is not explicitly set.

## Starting Local Supabase

```bash
# Start local Supabase (runs Docker containers)
npm run supabase:start

# Check status and get credentials
npm run supabase:status

# Stop local Supabase
npm run supabase:stop
```

Local Supabase services:
- **API**: http://127.0.0.1:54321
- **Studio** (Database UI): http://127.0.0.1:54323
- **Mailpit** (Email testing): http://127.0.0.1:54324
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

## Running Migrations

### Local Database
```bash
# Check migration status
npm run migrate:local:status

# Run all pending migrations
npm run migrate:local

# Run one migration at a time
ENV=development node scripts/migrate.js up --step=1
```

### Production Database
```bash
# Check migration status
npm run migrate:prod:status

# Run all pending migrations (⚠️ BE CAREFUL!)
npm run migrate:prod
```

### Default (uses .env.local)
```bash
# Check status
npm run migrate:status

# Run migrations
npm run migrate
```

## Development Workflow

### 1. Start Local Supabase
```bash
npm run supabase:start
```

### 2. Run Migrations on Local Database
```bash
npm run migrate:local
```

### 3. Start Next.js Development Server
By default, `npm run dev` uses `.env.local` which currently points to production.

**To use local database for development:**

Option A: Temporarily rename files
```bash
mv .env.local .env.local.backup
mv .env.development.local .env.local
npm run dev
# When done, restore:
mv .env.local .env.development.local
mv .env.local.backup .env.local
```

Option B: Use environment variable (if supported by your setup)
```bash
ENV=development npm run dev
```

Option C: Modify Next.js to auto-detect (requires code changes)

### 4. Access Supabase Studio
Open http://127.0.0.1:54323 to view and manage your local database.

## Common Tasks

### Creating a New Migration
```bash
npm run migrate:create add_new_feature
```

### Resetting Local Database
```bash
npm run supabase:stop
npm run supabase:start
npm run migrate:local
```

### Syncing Production Schema to Local
```bash
# Stop local Supabase
npm run supabase:stop

# Pull production schema (requires Supabase project linked)
supabase db pull

# Start local with new schema
npm run supabase:start
```

## Safety Tips

✅ **DO**:
- Always test migrations on local first
- Use `npm run migrate:local` for development
- Check migration status before running: `npm run migrate:local:status`
- Commit migrations to git after testing locally

❌ **DON'T**:
- Run `npm run migrate:prod` without careful review
- Test experimental queries on production
- Forget to start local Supabase before `npm run dev`
- Commit `.env*.local` files to git (they're already gitignored)

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 54321
lsof -ti:54321

# Kill the process if needed
lsof -ti:54321 | xargs kill -9

# Restart Supabase
npm run supabase:start
```

### Migration Fails on Local
```bash
# Check local database status
npm run supabase:status

# View migration history
npm run migrate:local:status

# Reset if needed
npm run supabase:stop
npm run supabase:start
npm run migrate:local
```

### Cannot Connect to Local Database
1. Ensure Docker is running
2. Check if Supabase containers are running: `docker ps`
3. Restart Supabase: `npm run supabase:stop && npm run supabase:start`
4. Verify environment variables are loaded

## Environment Comparison

| Feature | Local (.env.development.local) | Production (.env.production.local) |
|---------|-------------------------------|-----------------------------------|
| Database | Local Docker PostgreSQL | Hosted Supabase |
| URL | http://127.0.0.1:54321 | https://cymypipxhlgjmrzonpdw.supabase.co |
| Data | Temporary, resets when stopped | Persistent, real user data |
| Migrations | Safe to test | ⚠️ Affects production |
| Studio | http://127.0.0.1:54323 | https://supabase.com/dashboard |
| Email | Mailpit (http://127.0.0.1:54324) | Real Mailgun emails |

## Next Steps

1. Consider adding seed data script for local development
2. Set up automated migration testing in CI/CD
3. Document any project-specific database setup steps
4. Create backup/restore scripts for local development data

## Questions?

If you need to modify this setup, the key files are:
- `/scripts/migrate.js` - Migration runner with environment support
- `/package.json` - NPM scripts for local/prod migrations
- `/.env*.local` - Environment-specific configuration files
