#!/usr/bin/env node

/**
 * Setup Migration Tracking in Production
 * Creates the migrations_history table in production database
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
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

  // Check if table already exists
  log('Checking if migrations_history table exists...', 'blue');

  const { data: existingTable, error: checkError } = await supabase
    .from('migrations_history')
    .select('count')
    .limit(0);

  if (!checkError) {
    log('✓ migrations_history table already exists', 'green');
    log('');
    log('Run this to see current status:', 'blue');
    log('  node scripts/migration-status-prod.js', 'blue');
    process.exit(0);
  }

  // Check if it's an expected "table not found" error
  const isTableNotFoundError = checkError && (
    checkError.code === 'PGRST116' ||
    checkError.code === '42P01' ||
    checkError.message.includes('not find the table') ||
    checkError.message.includes('does not exist')
  );

  if (checkError && !isTableNotFoundError) {
    log(`Unexpected error checking table: ${checkError.message}`, 'red');
    log(`Error code: ${checkError.code}`, 'gray');
    process.exit(1);
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

  // Read the migration SQL
  const migrationSQL = fs.readFileSync(
    path.join(MIGRATIONS_DIR, '000_migrations_history.sql'),
    'utf8'
  );

  log('');
  log('Creating migrations_history table...', 'blue');
  log('');

  log('Please run this SQL in your Supabase Dashboard:', 'yellow');
  log('');
  log('1. Go to: https://supabase.com/dashboard/project/cymypipxhlgjmrzonpdw/sql/new', 'blue');
  log('2. Copy and paste the following SQL:', 'blue');
  log('');
  log('─'.repeat(60), 'gray');
  log(migrationSQL, 'gray');
  log('─'.repeat(60), 'gray');
  log('');
  log('3. Click "Run" to execute', 'blue');
  log('4. After running, verify with: node scripts/migration-status-prod.js', 'blue');
  log('');

  const copyToClipboard = await askConfirmation('Would you like to copy the SQL to clipboard? (yes/no): ');

  if (copyToClipboard) {
    try {
      // Try to copy to clipboard (macOS)
      const { exec } = require('child_process');
      exec('pbcopy', (error, stdin) => {
        if (error) {
          log('Could not copy to clipboard automatically', 'yellow');
          return;
        }
      }).stdin.end(migrationSQL);

      log('✓ SQL copied to clipboard!', 'green');
      log('Now paste it in the Supabase SQL Editor', 'blue');
    } catch (error) {
      log('Could not copy to clipboard', 'yellow');
      log('Please copy the SQL manually from above', 'yellow');
    }
  }

  log('');
  log('Why manual SQL execution?', 'gray');
  log('  The Supabase JavaScript client cannot execute DDL statements directly.', 'gray');
  log('  This is a one-time setup - future migrations can be tracked automatically.', 'gray');
  log('');
}

main();
