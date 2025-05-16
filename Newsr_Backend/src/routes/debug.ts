import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Force reload environment variables
dotenv.config();

const router = express.Router();

router.get('/env', (req: Request, res: Response) => {
  // Check all possible environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const supabaseKey = process.env.SUPABASE_KEY;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  
  res.json({
    supabaseUrl: supabaseUrl ? `Set (${supabaseUrl})` : 'Not set',
    supabaseServiceKeySet: supabaseServiceKey ? `Set (length: ${supabaseServiceKey.length})` : 'Not set',
    supabaseKeySet: supabaseKey ? `Set (length: ${supabaseKey.length})` : 'Not set',
    supabaseAnonKeySet: supabaseAnonKey ? `Set (length: ${supabaseAnonKey.length})` : 'Not set',
    nodeEnv: process.env.NODE_ENV || 'not set',
    allEnvVars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
  });
});

router.get('/supabase-test', async (req: Request, res: Response) => {
  try {
    // Create a fresh Supabase client for this test
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase credentials',
        supabaseUrl: !!supabaseUrl,
        supabaseKey: !!supabaseKey
      });
    }
    
    // Create a new client instance for testing
    const testClient = createClient(supabaseUrl, supabaseKey);
    
    // Test with a simple query
    const { data, error } = await testClient.from('users').select('count(*)', { count: 'exact' }).limit(1);
    
    if (error) {
      console.error('Supabase test error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      });
    }
    
    return res.json({
      success: true,
      message: 'Supabase connection successful',
      data
    });
  } catch (error) {
    console.error('Unexpected error in Supabase test:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
  }
});

// Try with anon key instead
router.get('/supabase-anon-test', async (req: Request, res: Response) => {
  try {
    // Create a fresh Supabase client with anon key
    const supabaseUrl = process.env.SUPABASE_URL;
    // Try both possible environment variable names
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase credentials',
        supabaseUrl: !!supabaseUrl,
        supabaseAnonKey: !!supabaseAnonKey,
        supabaseKey: !!process.env.SUPABASE_KEY,
        envVars: Object.keys(process.env).filter(key => key.includes('SUPABASE'))
      });
    }
    
    // Create a new client instance for testing
    const testClient = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test with a simple public query
    const { data, error } = await testClient.from('users').select('count(*)', { count: 'exact' }).limit(1);
    
    if (error) {
      console.error('Supabase anon test error:', error);
      return res.status(500).json({
        success: false,
        error: error.message,
        hint: error.hint,
        details: error.details,
        code: error.code
      });
    }
    
    return res.json({
      success: true,
      message: 'Supabase anon connection successful',
      data
    });
  } catch (error) {
    console.error('Unexpected error in Supabase anon test:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router; 