import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testSupabaseConnection() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  console.log('Testing Supabase connection with:');
  console.log('URL:', supabaseUrl);
  console.log('Key (first 10 chars):', supabaseKey?.substring(0, 10) + '...');
  
  try {
    // Make a direct REST API call to Supabase
    const response = await fetch(`${supabaseUrl}/rest/v1/users?select=count`, {
      headers: {
        'apikey': supabaseKey || '',
        'Authorization': `Bearer ${supabaseKey}`
      }
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('Error response from Supabase');
    } else {
      console.log('Supabase connection successful!');
    }
  } catch (error) {
    console.error('Error testing Supabase connection:', error);
  }
}

// Run the test
testSupabaseConnection(); 