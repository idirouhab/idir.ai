#!/usr/bin/env node

/**
 * Mark All Migrations as Applied in Production
 * Use this when migrations have already been applied manually
 * and you want to record them in the tracking system
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
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

  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    log('Error: Missing SUPABASE credentials in .env.production.local', 'red');
    log('Required variables:', 'yellow');
    log('  - NEXT_PUBLIC_SUPABASE_URL', 'yellow');
    log('  - SUPABASE_SERVICE_ROLE_KEY', 'yellow');
    process.exit(1);
  }

  log(`Database: ${SUPABASE_URL}`, 'yellow');
  log('');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // Check if migrations_history table exists
  const { error: tableCheckError } = await supabase
    .from('migrations_history')
    .select('count')
    .limit(0);

  if (tableCheckError) {
    const isTableNotFoundError =
      tableCheckError.code === 'PGRST116' ||
      tableCheckError.code === '42P01' ||
      tableCheckError.message.includes('not find the table') ||
      tableCheckError.message.includes('does not exist');

    if (isTableNotFoundError) {
      log('✗ migrations_history table does not exist', 'red');
      log('');
      log('Run this first to create the table:', 'yellow');
      log('  node scripts/setup-migrations-prod.js', 'yellow');
    } else {
      log(`Unexpected error: ${tableCheckError.message}`, 'red');
    }
    process.exit(1);
  }

  // Get all migration files
  const migrations = getMigrationFiles();

  // Get already applied migrations
  const { data: appliedMigrations, error: fetchError } = await supabase
    .from('migrations_history')
    .select('migration_name')
    .order('migration_name');

  if (fetchError) {
    log(`Error fetching applied migrations: ${fetchError.message}`, 'red');
    process.exit(1);
  }

  const appliedNames = new Set((appliedMigrations || []).map(m => m.migration_name));
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
      const { error } = await supabase
        .from('migrations_history')
        .insert({
          migration_name: migration.filename,
          checksum: migration.checksum,
          execution_time_ms: 0
        });

      if (error) {
        if (error.code === '23505') { // Duplicate key
          log(`  ⊘ ${migration.filename} (already exists)`, 'gray');
          skippedCount++;
        } else {
          throw error;
        }
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

main();
