#!/usr/bin/env node

/**
 * Local Database Migration Runner (Direct PostgreSQL Connection)
 *
 * Uses direct PostgreSQL connection to local Supabase instance
 * This allows executing DDL statements (CREATE TABLE, ALTER TABLE, etc.)
 *
 * Usage:
 *   node scripts/migrate-local-direct.js up              - Run all pending migrations
 *   node scripts/migrate-local-direct.js up --step=1     - Run next migration only
 *   node scripts/migrate-local-direct.js status          - Show migration status
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

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

// Local Supabase connection
function getDatabaseUrl() {
  // Default local Supabase connection
  return process.env.LOCAL_DATABASE_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
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
    // Table might already exist, check if we can query it
    try {
      await client.query('SELECT COUNT(*) FROM migrations_history LIMIT 0');
    } catch (checkError) {
      log('⚠ Warning: Could not create or access migrations_history table', 'yellow');
      throw error;
    }
  }
}

async function getAppliedMigrations(client) {
  try {
    const result = await client.query(
      'SELECT migration_name, checksum, applied_at FROM migrations_history ORDER BY migration_name ASC'
    );
    return result.rows;
  } catch (error) {
    if (error.code === '42P01') { // Table doesn't exist
      return [];
    }
    throw error;
  }
}

function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.startsWith('000_') && !f.includes('rollback'))
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
    // Execute the entire migration as a single statement
    await client.query(migration.content);

    const executionTime = Date.now() - startTime;

    // Record migration in history
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
  log('\nLocal Migration Status:', 'blue');
  log('=====================\n');

  const client = await getClient();

  try {
    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);
    const allMigrations = getMigrationFiles();

    const appliedNames = new Set(applied.map(m => m.migration_name));

    if (applied.length > 0) {
      log('Applied migrations:', 'green');
      applied.forEach(m => {
        log(`  ✓ ${m.migration_name} (${new Date(m.applied_at).toLocaleString()})`, 'gray');
      });
    }

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

  log('\nRunning local migrations...', 'blue');

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
    log('\nError details:', 'gray');
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
  }
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

      default:
        log('Local Database Migration Runner', 'blue');
        log('==============================\n');
        log('Usage:');
        log('  node scripts/migrate-local-direct.js up              - Run all pending migrations', 'gray');
        log('  node scripts/migrate-local-direct.js up --step=1     - Run next migration only', 'gray');
        log('  node scripts/migrate-local-direct.js status          - Show migration status', 'gray');
        log('');
    }
  } catch (error) {
    log(`Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

main();
