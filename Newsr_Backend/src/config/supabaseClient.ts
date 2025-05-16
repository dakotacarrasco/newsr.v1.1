import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || '';

console.log('Supabase Configuration:');
console.log('- URL:', supabaseUrl ? `${supabaseUrl.substring(0, 12)}...` : 'Missing');
console.log('- API Key Length:', supabaseServiceKey ? supabaseServiceKey.length : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials!');
  console.error('SUPABASE_URL:', supabaseUrl ? 'Set ✓' : 'Missing ✗');
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Set ✓' : 'Missing ✗');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

export const getSupabaseInfo = () => ({
  url: supabaseUrl,
  keyLength: supabaseServiceKey?.length || 0
});

export const testSupabaseConnection = async () => {
  console.log('Testing Supabase connection...');
  
  try {
    const { data: healthData, error: healthError } = await supabase.from('users').select('count', { count: 'exact' }).limit(0);
    
    if (healthError) {
      console.error('Supabase health check failed:', healthError);
      
      if (healthError.message.includes('JWT') || healthError.message.includes('key') || healthError.message.includes('apikey')) {
        console.error('This appears to be an authentication/API key issue.');
        return {
          success: false,
          error: healthError.message,
          errorType: 'auth',
          details: 'The API key may be invalid, expired, or missing required permissions.'
        };
      }
      
      if (healthError.message.includes('fetch') || healthError.message.includes('network')) {
        console.error('This appears to be a network/connection issue.');
        return {
          success: false,
          error: healthError.message,
          errorType: 'network',
          details: 'The Supabase URL may be incorrect or there might be network connectivity issues.'
        };
      }
      
      return {
        success: false,
        error: healthError.message,
        errorType: 'unknown'
      };
    }
    
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    console.log('Supabase connection successful!');
    return {
      success: true,
      healthCheck: 'passed',
      authCheck: authError ? 'failed' : 'passed',
      authError: authError?.message
    };
  } catch (err: any) {
    console.error('Supabase connection exception:', err);
    return {
      success: false,
      error: err.message,
      errorType: 'exception',
      stack: err.stack
    };
  }
}; 