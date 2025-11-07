/**
 * Script to create an initial owner account
 *
 * Usage:
 *   npx ts-node scripts/create-owner.ts
 *
 * You'll be prompted for:
 * - Name
 * - Email
 * - Password
 */

import * as readline from 'readline';
import { createUser } from '../lib/users';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createOwnerAccount() {
  console.log('\n========================================');
  console.log('   CREATE OWNER ACCOUNT');
  console.log('========================================\n');

  try {
    // Get user input
    const name = await question('Enter owner name: ');
    const email = await question('Enter owner email: ');
    const password = await question('Enter password (min 8 characters): ');
    const confirmPassword = await question('Confirm password: ');

    // Validation
    if (!name || !email || !password) {
      console.error('\n❌ Error: All fields are required');
      rl.close();
      process.exit(1);
    }

    if (password !== confirmPassword) {
      console.error('\n❌ Error: Passwords do not match');
      rl.close();
      process.exit(1);
    }

    if (password.length < 8) {
      console.error('\n❌ Error: Password must be at least 8 characters');
      rl.close();
      process.exit(1);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error('\n❌ Error: Invalid email format');
      rl.close();
      process.exit(1);
    }

    // Create owner account
    console.log('\n⏳ Creating owner account...');

    const user = await createUser(
      {
        email,
        password,
        name,
        role: 'owner',
      },
      true // active by default
    );

    console.log('\n✅ Owner account created successfully!');
    console.log('\nAccount Details:');
    console.log(`  Name:  ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Role:  ${user.role}`);
    console.log(`  ID:    ${user.id}`);
    console.log('\nYou can now login at /admin/login with your email and password.\n');

    rl.close();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error creating owner account:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createOwnerAccount();
