import { supabase } from '../../services/supabase';
import dotenv from 'dotenv';

dotenv.config();

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', process.env.SUPABASE_URL);
  
  try {
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('Connection successful!', data);
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

testConnection(); 