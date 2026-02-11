#!/usr/bin/env node

/**
 * Mark All Migrations as Applied in Production
 * Use this when migrations have already been applied manually
 * and you want to record them in the tracking system
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { Client } = require('pg');
const readline = require('readline');

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

async function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes');
    });
  });
}

async function main() {
  log('\n=== Mark All Migrations as Applied in PRODUCTION ===', 'blue');

  const client = await getClient();

  try {
    await client.query('SELECT 1 FROM migrations_history LIMIT 1');
  } catch (error) {
    if (error.code === '42P01') {
      log('✗ migrations_history table does not exist', 'red');
      log('');
      log('Run this first to create the table:', 'yellow');
      log('  node scripts/setup-migrations-prod.js', 'yellow');
      process.exit(1);
    }
    log(`Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  }

  const migrations = getMigrationFiles();

  const appliedResult = await client.query(
    'SELECT migration_name FROM migrations_history ORDER BY migration_name'
  );

  const appliedNames = new Set((appliedResult.rows || []).map(m => m.migration_name));
  const pendingMigrations = migrations.filter(m => !appliedNames.has(m.filename));

  log('⚠ WARNING: This will mark ALL migrations as applied WITHOUT running them', 'yellow');
  log('Only use this if you know all migrations have already been applied to production', 'yellow');
  log('');

  log(`Found ${migrations.length} migration files`, 'blue');
  log(`  Already applied: ${appliedNames.size}`, appliedNames.size > 0 ? 'green' : 'gray');
  log(`  To be marked: ${pendingMigrations.length}`, pendingMigrations.length > 0 ? 'yellow' : 'gray');
  log('');

  if (pendingMigrations.length === 0) {
    log('✓ All migrations are already marked as applied!', 'green');
    process.exit(0);
  }

  log('Migrations to be marked as applied:', 'blue');
  pendingMigrations.forEach(m => {
    log(`  ${m.filename}`, 'gray');
  });
  log('');

  const confirmed = await askConfirmation(
    `Mark ${pendingMigrations.length} migrations as applied in PRODUCTION? (type 'yes' to confirm): `
  );

  if (!confirmed) {
    log('Cancelled', 'yellow');
    process.exit(0);
  }

  log('');
  log('Processing migrations...', 'blue');
  log('');

  let markedCount = 0;
  let skippedCount = 0;

  for (const migration of pendingMigrations) {
    try {
      const result = await client.query(
        `INSERT INTO migrations_history (migration_name, checksum, execution_time_ms)
         VALUES ($1, $2, 0)
         ON CONFLICT (migration_name) DO NOTHING`,
        [migration.filename, migration.checksum]
      );

      if (result.rowCount === 0) {
        log(`  ⊘ ${migration.filename} (already exists)`, 'gray');
        skippedCount++;
      } else {
        log(`  ✓ ${migration.filename}`, 'green');
        markedCount++;
      }
    } catch (error) {
      log(`  ✗ ${migration.filename} - ${error.message}`, 'red');
      skippedCount++;
    }
  }

  log('');
  log('Done!', 'green');
  log(`  Marked: ${markedCount}`, 'green');
  if (skippedCount > 0) {
    log(`  Skipped: ${skippedCount}`, 'yellow');
  }
  log('');
  log('Next steps:', 'blue');
  log('  - Check status: node scripts/migration-status-prod.js', 'blue');
  log('');
}

main().catch(error => {
  log(`Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});
