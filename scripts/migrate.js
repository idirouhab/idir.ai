#!/usr/bin/env node

/**
 * Database Migration Runner
 *
 * Usage:
 *   node scripts/migrate.js up              - Run all pending migrations (uses .env.local)
 *   node scripts/migrate.js up --step=1     - Run next migration only
 *   node scripts/migrate.js status          - Show migration status
 *   node scripts/migrate.js create <name>   - Create a new migration file
 *   ENV=development node scripts/migrate.js up    - Run migrations on local database
 *   ENV=production node scripts/migrate.js up     - Run migrations on production database
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

// Load environment-specific .env file
function loadEnv() {
  const env = process.env.ENV || 'local';
  const envFile = env === 'development'
    ? '.env.development.local'
    : env === 'production'
    ? '.env.production.local'
    : '.env.local';

  const envPath = path.join(__dirname, '..', envFile);

  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    console.log(`\x1b[34mUsing environment: ${envFile}\x1b[0m`);
  } else {
    console.log(`\x1b[33mWarning: ${envFile} not found, using existing environment variables\x1b[0m`);
  }
}

loadEnv();

// Configuration
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const env = process.env.ENV || 'local';
  if (env === 'local') {
    return 'postgresql://postgres:postgres@127.0.0.1:5432/postgres';
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  const dbHost = process.env.SUPABASE_DB_HOST;
  const dbPort = process.env.SUPABASE_DB_PORT || '6543';

  if (!supabaseUrl || !dbPassword || !dbHost) {
    log('\n⚠️  Missing database credentials!', 'yellow');
    log('\nProvide one of the following:\n', 'yellow');
    log('Option 1 (Recommended): Set DATABASE_URL', 'blue');
    log('  DATABASE_URL=postgresql://user:pass@host:port/db\n', 'gray');
    log('Option 2: Set Supabase database variables', 'blue');
    log('  NEXT_PUBLIC_SUPABASE_URL, SUPABASE_DB_PASSWORD, SUPABASE_DB_HOST', 'gray');
    throw new Error('Missing database credentials.');
  }

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    throw new Error('Could not extract project reference from NEXT_PUBLIC_SUPABASE_URL');
  }

  const connectionString = `postgresql://postgres.${projectRef}:${dbPassword}@${dbHost}:${dbPort}/postgres`;

  log(`\nConnecting to: postgres.${projectRef}@${dbHost}:${dbPort}`, 'gray');

  return connectionString;
}

async function getClient() {
  const connectionString = getDatabaseUrl();
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

async function ensureMigrationsTable(client) {
  const migrationTableSQL = fs.readFileSync(
    path.join(MIGRATIONS_DIR, '000_migrations_history.sql'),
    'utf8'
  );

  try {
    await client.query(migrationTableSQL);
  } catch (error) {
    try {
      await client.query('SELECT COUNT(*) FROM migrations_history LIMIT 0');
    } catch (checkError) {
      log('⚠ Warning: Could not create migrations_history table automatically', 'yellow');
      log('Please run migrations/000_migrations_history.sql manually first', 'yellow');
      throw error;
    }
  }
}

async function getAppliedMigrations(client) {
  try {
    const result = await client.query(
      'SELECT migration_name, checksum, applied_at FROM migrations_history ORDER BY migration_name ASC'
    );
    return result.rows || [];
  } catch (error) {
    if (error.code === '42P01') {
      return [];
    }
    throw error;
  }
}

function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.startsWith('000_'))
    .sort();

  return files.map(filename => {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');
    return {
      filename,
      content,
      checksum: calculateChecksum(content)
    };
  });
}

async function runMigration(client, migration) {
  log(`Running migration: ${migration.filename}`, 'blue');

  const startTime = Date.now();

  try {
    await client.query(migration.content);

    const executionTime = Date.now() - startTime;

    await client.query(
      `INSERT INTO migrations_history (migration_name, checksum, execution_time_ms)
       VALUES ($1, $2, $3)
       ON CONFLICT (migration_name) DO NOTHING`,
      [migration.filename, migration.checksum, executionTime]
    );

    log(`✓ Migration ${migration.filename} completed in ${executionTime}ms`, 'green');
    return true;
  } catch (error) {
    log(`✗ Migration ${migration.filename} failed: ${error.message}`, 'red');
    throw error;
  }
}

async function status() {
  log('\nMigration Status:', 'blue');
  log('================\n');

  const client = await getClient();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);
    const allMigrations = getMigrationFiles();

    const appliedNames = new Set(applied.map(m => m.migration_name));

    log('Applied migrations:', 'green');
    applied.forEach(m => {
      log(`  ✓ ${m.migration_name} (${new Date(m.applied_at).toLocaleString()})`, 'gray');
    });

    const pending = allMigrations.filter(m => !appliedNames.has(m.filename));

    if (pending.length > 0) {
      log('\nPending migrations:', 'yellow');
      pending.forEach(m => {
        log(`  ○ ${m.filename}`, 'gray');
      });
    } else {
      log('\n✓ All migrations applied!', 'green');
    }

    log(`\nTotal: ${applied.length} applied, ${pending.length} pending\n`);
  } catch (error) {
    log(`Error checking status: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function up(options = {}) {
  const { step } = options;

  log('\nRunning migrations...', 'blue');

  const client = await getClient();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);
    const allMigrations = getMigrationFiles();

    const appliedNames = new Set(applied.map(m => m.migration_name));
    const pending = allMigrations.filter(m => !appliedNames.has(m.filename));

    if (pending.length === 0) {
      log('✓ No pending migrations', 'green');
      return;
    }

    const toRun = step ? pending.slice(0, parseInt(step)) : pending;

    log(`Found ${toRun.length} migration(s) to run\n`);

    for (const migration of toRun) {
      await runMigration(client, migration);
    }

    log('\n✓ All migrations completed successfully!', 'green');
  } catch (error) {
    log(`\n✗ Migration failed: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

async function create(name) {
  if (!name) {
    log('Error: Migration name is required', 'red');
    log('Usage: node scripts/migrate.js create <name>', 'gray');
    process.exit(1);
  }

  // Get next migration number
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  const lastNumber = files.length > 0
    ? parseInt(files[files.length - 1].split('_')[0])
    : 0;

  const nextNumber = String(lastNumber + 1).padStart(3, '0');
  const filename = `${nextNumber}_${name.replace(/\s+/g, '_')}.sql`;
  const filepath = path.join(MIGRATIONS_DIR, filename);

  const template = `-- Migration: ${name}
-- Created: ${new Date().toISOString()}
-- Description: Add description here

-- Add your SQL migration here

`;

  fs.writeFileSync(filepath, template);
  log(`✓ Created migration: ${filename}`, 'green');
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'up':
        const stepArg = args.find(a => a.startsWith('--step='));
        const step = stepArg ? parseInt(stepArg.split('=')[1]) : null;
        await up({ step });
        break;

      case 'status':
        await status();
        break;

      case 'create':
        await create(args[1]);
        break;

      default:
        log('Database Migration Runner', 'blue');
        log('========================\n');
        log('Usage:');
        log('  node scripts/migrate.js up              - Run all pending migrations', 'gray');
        log('  node scripts/migrate.js up --step=1     - Run next migration only', 'gray');
        log('  node scripts/migrate.js status          - Show migration status', 'gray');
        log('  node scripts/migrate.js create <name>   - Create a new migration file', 'gray');
        log('\nExamples:');
        log('  node scripts/migrate.js create add_user_avatar_column', 'gray');
        log('  node scripts/migrate.js status', 'gray');
        log('  node scripts/migrate.js up', 'gray');
        log('');
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
