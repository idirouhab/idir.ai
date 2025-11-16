# Docker-Based Local Development

This guide explains how to use Docker Compose for local development with a separate database from production.

## Overview

The project uses Docker Compose to run local development services:
- **PostgreSQL** with Supabase extensions (port 5432)
- **PostgREST** RESTful API for PostgreSQL (port 3001)
- **Adminer** Database management UI (port 8080)
- **MailHog** Email testing (ports 1025, 8025)

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

```bash
# Start all services
npm run docker:up

# Run migrations on local database
npm run migrate:local

# Start Next.js development server
npm run dev
```

## Docker Commands

### Starting Services

```bash
# Start all services in background
npm run docker:up

# Start only the database
npm run db:up

# Start with logs visible
docker-compose up
```

### Stopping Services

```bash
# Stop all services
npm run docker:down

# Stop only database
npm run db:down

# Stop but keep data
docker-compose stop
```

### Viewing Logs

```bash
# View all service logs
npm run docker:logs

# View only database logs
npm run db:logs

# View specific service
docker-compose logs -f postgrest
```

### Database Access

```bash
# Open PostgreSQL shell
npm run db:shell

# Or directly
docker-compose exec postgres psql -U postgres

# Check running services
npm run docker:ps
```

## Services

### PostgreSQL (port 5432)
- Image: `supabase/postgres:17.6.1.043`
- User: `postgres`
- Password: `postgres`
- Database: `postgres`
- Connection: `postgresql://postgres:postgres@localhost:5432/postgres`

### PostgREST (port 3001)
- Provides RESTful API to PostgreSQL
- Used by Supabase client library
- Endpoint: `http://localhost:3001`

### Adminer (port 8080)
- Database management UI
- Access: http://localhost:8080
- Server: `postgres`
- Username: `postgres`
- Password: `postgres`

### MailHog (ports 1025, 8025)
- Email testing tool
- SMTP: `localhost:1025`
- Web UI: http://localhost:8025
- Catches all outgoing emails for testing

## Environment Configuration

The project uses different `.env*.local` files for different environments:

### `.env.development.local` - Local Development
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres
```

### `.env.production.local` - Production
```bash
NEXT_PUBLIC_SUPABASE_URL=https://cymypipxhlgjmrzonpdw.supabase.co
```

### `.env.local` - Default
Currently points to production. To use local:
```bash
mv .env.local .env.local.backup
mv .env.development.local .env.local
npm run dev
```

## Running Migrations

### Local Database
```bash
# Check status
npm run migrate:local:status

# Run all pending migrations
npm run migrate:local

# Create new migration
npm run migrate:create add_new_feature
```

### Production Database
```bash
# Check status (safe)
npm run migrate:prod:status

# Run migrations (⚠️ CAREFUL!)
npm run migrate:prod
```

## Development Workflow

### 1. Start Docker Services
```bash
npm run docker:up
```

Wait for services to be healthy (~10-30 seconds).

### 2. Initialize Database
```bash
# Run migrations
npm run migrate:local

# Or manually if needed
npm run db:shell
\i /docker-entrypoint-initdb.d/01-init.sql
```

### 3. Start Development Server
```bash
# Make sure .env.local points to local database
npm run dev
```

### 4. Access Services
- **Next.js App**: http://localhost:3000
- **Adminer (DB UI)**: http://localhost:8080
- **MailHog (Email)**: http://localhost:8025
- **PostgREST API**: http://localhost:3001

## Resetting Local Database

### Soft Reset (Keep containers, wipe data)
```bash
docker-compose down
docker volume rm idir_postgres_dev_data
npm run docker:up
npm run migrate:local
```

### Hard Reset (Remove everything)
```bash
docker-compose down -v
docker volume prune
npm run docker:up
npm run migrate:local
```

## Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -ti:5432
lsof -ti:3001

# Stop conflicting services
brew services stop postgresql
supabase stop
```

### Cannot Connect to Database

1. Check if Docker is running
2. Check if containers are up: `npm run docker:ps`
3. View logs: `npm run docker:logs`
4. Restart services: `npm run docker:restart`

### Migrations Fail

```bash
# Check migration status
npm run migrate:local:status

# Try running migrations manually
npm run db:shell
\i migrations/001_create_users_table.sql
```

### PostgREST Not Responding

```bash
# Check PostgREST logs
docker-compose logs postgrest

# Restart PostgREST
docker-compose restart postgrest
```

### Database Roles Missing

```bash
# Run init script manually
npm run db:shell
\i /docker-entrypoint-initdb.d/01-init.sql
```

## Data Persistence

- Database data is stored in Docker volume: `idir_postgres_dev_data`
- Data persists across container restarts
- To wipe data: `docker volume rm idir_postgres_dev_data`

## Testing Emails

All emails sent in development go to MailHog:

1. Open http://localhost:8025
2. Trigger email action in your app
3. View email in MailHog UI

## Comparing with Production

| Feature | Local (Docker) | Production |
|---------|---------------|------------|
| Database | Local PostgreSQL | Hosted Supabase |
| URL | http://localhost:3001 | https://cymypipxhlgjmrzonpdw.supabase.co |
| Data | Temporary | Persistent |
| Migrations | Safe to test | ⚠️ Affects users |
| UI | Adminer (port 8080) | Supabase Dashboard |
| Email | MailHog (port 8025) | Real Mailgun |

## Docker Compose Files

### Main Configuration: `docker-compose.yml`
Defines all services and their configuration.

### Init Script: `docker/init-db.sql`
Runs automatically on first start:
- Creates database roles (anon, authenticated, service_role)
- Sets up permissions
- Creates helper functions

## Best Practices

1. **Always test migrations locally first**
   ```bash
   npm run migrate:local
   # Test thoroughly
   npm run migrate:prod
   ```

2. **Keep services running**
   - No need to stop/start constantly
   - Just restart when changing config

3. **Use Adminer for database inspection**
   - http://localhost:8080
   - Better than CLI for exploring data

4. **Monitor logs**
   ```bash
   npm run docker:logs
   ```

5. **Backup before major changes**
   ```bash
   docker-compose exec postgres pg_dump -U postgres postgres > backup.sql
   ```

## Advanced Usage

### Custom PostgreSQL Configuration

Edit `docker-compose.yml`:
```yaml
postgres:
  command:
    - postgres
    - -c
    - wal_level=logical
    - -c
    - max_connections=200
```

### Connect from External Tools

- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `postgres`
- **User**: `postgres`
- **Password**: `postgres`

Works with:
- TablePlus
- DataGrip
- pgAdmin
- DBeaver

### Running Multiple Projects

Change ports in `docker-compose.yml`:
```yaml
ports:
  - "5433:5432"  # Different port
  - "3002:3000"  # Different PostgREST port
```

## Cleanup

### Remove All Project Containers
```bash
docker-compose down -v
```

### Remove All Unused Docker Resources
```bash
docker system prune -a --volumes
```

## Next Steps

1. Set up seed data script for local development
2. Configure CI/CD to use Docker for testing
3. Add Redis container if needed for caching
4. Consider adding pgAdmin as alternative to Adminer

## Questions?

- Check running services: `npm run docker:ps`
- View logs: `npm run docker:logs`
- Access database: `npm run db:shell`
- See all commands: `npm run` (lists all available scripts)
