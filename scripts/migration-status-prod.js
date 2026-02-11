#!/usr/bin/env node

/**
 * Check Production Migration Status
 * Shows which migrations are applied and which are pending
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  gray: '\x1b[90m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Load production environment
function loadProductionEnv() {
  const envFile = '.env.production.local';
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
    log(`Using environment: ${envFile}`, 'blue');
  } else {
    log(`Error: ${envFile} not found`, 'red');
    log('Please create .env.production.local with your production credentials', 'yellow');
    process.exit(1);
  }
}

loadProductionEnv();

const MIGRATIONS_DIR = path.join(__dirname, '../migrations');

function calculateChecksum(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getMigrationFiles() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql') && !f.startsWith('000_'))
    .sort();

  return files.map(filename => {
    const content = fs.readFileSync(path.join(MIGRATIONS_DIR, filename), 'utf8');
    return {
      filename,
      checksum: calculateChecksum(content)
    };
  });
}

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  const dbHost = process.env.SUPABASE_DB_HOST;
  const dbPort = process.env.SUPABASE_DB_PORT || '6543';

  if (!supabaseUrl || !dbPassword || !dbHost) {
    log('Error: Missing database credentials in .env.production.local', 'red');
    log('Required variables:', 'yellow');
    log('  - DATABASE_URL (recommended)', 'yellow');
    log('  - OR NEXT_PUBLIC_SUPABASE_URL + SUPABASE_DB_PASSWORD + SUPABASE_DB_HOST', 'yellow');
    process.exit(1);
  }

  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  if (!projectRef) {
    throw new Error('Could not extract project reference from NEXT_PUBLIC_SUPABASE_URL');
  }

  return `postgresql://postgres.${projectRef}:${dbPassword}@${dbHost}:${dbPort}/postgres`;
}

async function getClient() {
  const connectionString = getDatabaseUrl();
  const client = new Client({ connectionString });
  await client.connect();
  return client;
}

async function main() {
  log('\n=== PRODUCTION Migration Status ===', 'blue');

  const client = await getClient();

  try {
    log('Checking migrations_history table...', 'blue');
    await client.query('SELECT 1 FROM migrations_history LIMIT 1');
    log('✓ migrations_history table exists', 'green');
    log('');

    log('Scanning migrations folder...', 'blue');
    const allMigrations = getMigrationFiles();

    const result = await client.query(
      'SELECT migration_name, checksum, applied_at, execution_time_ms, applied_by FROM migrations_history ORDER BY applied_at DESC'
    );

    const appliedMigrations = result.rows || [];

    const appliedNames = new Set(appliedMigrations.map(m => m.migration_name));
    const appliedMap = new Map(
      appliedMigrations.map(m => [m.migration_name, m])
    );

    const applied = allMigrations.filter(m => appliedNames.has(m.filename));
    const pending = allMigrations.filter(m => !appliedNames.has(m.filename));

    log('');
    log('Summary:', 'blue');
    log(`  Total migrations:   ${allMigrations.length}`, 'blue');
    log(`  Applied:            ${applied.length}`, applied.length > 0 ? 'green' : 'gray');
    log(`  Pending:            ${pending.length}`, pending.length > 0 ? 'yellow' : 'gray');
    log('');

    if (applied.length > 0) {
      log('✓ Applied Migrations:', 'green');
      log('');

      log('         Migration          |     Applied At      | Duration |           User', 'gray');
      log('----------------------------+--------------------+----------+---------------------------', 'gray');

      applied.forEach(migration => {
        const info = appliedMap.get(migration.filename);
        const date = new Date(info.applied_at);
        const dateStr = date.toISOString().replace('T', ' ').substring(0, 19);
        const duration = info.execution_time_ms || 0;
        const user = (info.applied_by || 'unknown').substring(0, 25);

        const name = migration.filename.length > 24
          ? migration.filename.substring(0, 21) + '...'
          : migration.filename;

        log(
          ` ${name.padEnd(26)} | ${dateStr} | ${String(duration).padStart(4)}ms${duration === 0 ? '    ' : ''} | ${user}`,
          'gray'
        );
      });
      log('');
    }

    if (pending.length > 0) {
      log('⏳ Pending Migrations:', 'yellow');
      log('');
      pending.forEach(m => {
        log(`  ○ ${m.filename}`, 'gray');
      });
      log('');
      log('To apply pending migrations:', 'blue');
      log('  ENV=production node scripts/migrate.js up', 'blue');
    } else {
      log('  None - all migrations are applied!', 'green');
    }

    log('');

    const mismatches = applied.filter(m => {
      const info = appliedMap.get(m.filename);
      return info && info.checksum && info.checksum !== m.checksum;
    });

    if (mismatches.length > 0) {
      log('⚠ WARNING: Checksum Mismatches Detected!', 'yellow');
      log('');
      log('These migrations have been modified after being applied:', 'yellow');
      mismatches.forEach(m => {
        log(`  ⚠ ${m.filename}`, 'red');
      });
      log('');
      log('This could indicate:', 'yellow');
      log('  - The migration file was edited after deployment', 'gray');
      log('  - Local and production files are out of sync', 'gray');
      log('');
    }
  } catch (error) {
    if (error.code === '42P01') {
      log('✗ migrations_history table does not exist', 'red');
      log('');
      log('Run this to create the tracking table:', 'yellow');
      log('  node scripts/setup-migrations-prod.js', 'yellow');
      process.exit(1);
    }

    log(`Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
