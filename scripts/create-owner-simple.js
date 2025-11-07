/**
 * Simple script to create an initial owner account
 * Run with: node scripts/create-owner-simple.js
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createOwnerAccount() {
  console.log('\n========================================');
  console.log('   CREATE OWNER ACCOUNT');
  console.log('========================================\n');

  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('❌ Error: Missing Supabase environment variables');
      console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
      rl.close();
      process.exit(1);
    }

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

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Hash password
    console.log('\n⏳ Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create owner account
    console.log('⏳ Creating owner account in database...');

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: email.toLowerCase().trim(),
          password_hash: passwordHash,
          name: name,
          role: 'owner',
          is_active: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('\n❌ Error creating account:', error.message);

      if (error.code === '23505') {
        console.error('This email is already registered.');
      }

      rl.close();
      process.exit(1);
    }

    console.log('\n✅ Owner account created successfully!');
    console.log('\nAccount Details:');
    console.log(`  Name:  ${data.name}`);
    console.log(`  Email: ${data.email}`);
    console.log(`  Role:  ${data.role}`);
    console.log(`  ID:    ${data.id}`);
    console.log('\n🎉 You can now login at /admin/login with your email and password.\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createOwnerAccount();
