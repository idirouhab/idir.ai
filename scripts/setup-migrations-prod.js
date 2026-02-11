#!/usr/bin/env node

/**
 * Setup Migration Tracking in Production
 * Creates the migrations_history table in production database
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const readline = require('readline');

// Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
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
  log('\n=== Setup Migration Tracking in Production ===', 'blue');

  const client = await getClient();

  try {
    log('Checking if migrations_history table exists...', 'blue');
    await client.query('SELECT 1 FROM migrations_history LIMIT 1');
    log('✓ migrations_history table already exists', 'green');
    log('');
    log('Run this to see current status:', 'blue');
    log('  node scripts/migration-status-prod.js', 'blue');
    return;
  } catch (error) {
    if (error.code !== '42P01') {
      log(`Unexpected error checking table: ${error.message}`, 'red');
      process.exit(1);
    }
  }

  log('migrations_history table not found', 'yellow');
  log('');
  log('⚠ This will create the migrations_history table in PRODUCTION', 'yellow');
  log('');

  const confirmed = await askConfirmation('Continue? (yes/no): ');

  if (!confirmed) {
    log('Cancelled', 'yellow');
    process.exit(0);
  }

  const migrationSQL = fs.readFileSync(
    path.join(MIGRATIONS_DIR, '000_migrations_history.sql'),
    'utf8'
  );

  log('');
  log('Creating migrations_history table...', 'blue');
  log('');

  await client.query(migrationSQL);

  log('✓ migrations_history table created', 'green');
  log('');
  log('Next steps:', 'blue');
  log('  - Check status: node scripts/migration-status-prod.js', 'blue');
  log('');
}

main()
  .catch(error => {
    log(`Unexpected error: ${error.message}`, 'red');
    process.exit(1);
  });
