import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testDirectConnection() {
  console.log('\n=== SUPABASE DIRECT CONNECTION TEST ===');
  
  // Get credentials from environment
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  
  console.log(`URL: ${url?.substring(0, 10)}...`);
  console.log(`Key length: ${key?.length || 0}`);
  
  if (!url || !key) {
    console.error('Missing required environment variables!');
    return;
  }
  
  // Create a fresh client instance
  const supabase = createClient(url, key);
  
  try {
    // Perform simplest possible query
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('ERROR:', error.message);
      console.error('CODE:', error.code);
      console.error('DETAILS:', error.details);
    } else {
      console.log('SUCCESS! Data:', data);
    }
  } catch (err) {
    console.error('EXCEPTION:', err);
  }
}

// Run the test
testDirectConnection()
  .then(() => console.log('Test complete'))
  .catch(err => console.error('Test failed:', err));

// Export for potential import
export { testDirectConnection }; 