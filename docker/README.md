# Docker Configuration

This directory contains Docker-related configuration files for local development.

## Files

### `init-db.sql`
Database initialization script that runs automatically when the PostgreSQL container starts for the first time.

**What it does:**
- Creates database roles (anon, authenticated, service_role) required by PostgREST
- Sets up permissions for each role
- Creates the `exec_sql()` function used by migration scripts
- Configures default privileges for future tables

**When it runs:**
- Automatically on first container start
- Only runs if the database is empty
- Mounted to `/docker-entrypoint-initdb.d/01-init.sql` in the container

**Manual execution:**
If you need to run it again:
```bash
npm run db:shell
\i /docker-entrypoint-initdb.d/01-init.sql
```

## Adding New Init Scripts

To add more initialization scripts:

1. Create a new `.sql` file in this directory
2. Add it to `docker-compose.yml`:
   ```yaml
   volumes:
     - ./docker/init-db.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
     - ./docker/your-script.sql:/docker-entrypoint-initdb.d/02-your-script.sql:ro
   ```

Scripts run in alphanumeric order (01, 02, 03, etc.).

## Modifying Existing Scripts

If you modify `init-db.sql` after the database is already initialized:

1. Remove the existing volume:
   ```bash
   docker-compose down -v
   ```

2. Start fresh:
   ```bash
   docker-compose up -d
   npm run migrate:local
   ```

## Data Directory

This directory may also contain (gitignored):
- `/data` - Database data files (if using bind mounts instead of volumes)

Docker volumes are preferred and stored in Docker's internal storage.
