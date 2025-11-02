const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Load .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=:#]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('\n1. Testing connection to live_events table...');
    const { data, error } = await supabase
      .from('live_events')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error querying live_events:', error.message);
      console.error('Details:', error);
      return;
    }

    if (!data || data.length === 0) {
      console.log('⚠️  Table exists but no data found');
      console.log('You need to insert a row using the SQL from supabase-schema.sql');
      return;
    }

    console.log('✅ Successfully retrieved data:');
    console.log(JSON.stringify(data[0], null, 2));
  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
