#!/usr/bin/env node
import { DigestSendingService } from '../../services/digestSendingService';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

async function main() {
  const args = process.argv.slice(2);
  const cityCode = args[0];
  const frequency = (args[1] || 'daily') as 'daily' | 'weekly';
  const email = args[2];
  
  if (!cityCode) {
    console.error('Please provide a city code');
    process.exit(1);
  }
  
  if (!email) {
    console.error('Please provide an email address');
    process.exit(1);
  }
  
  try {
    // Find user by email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();
    
    if (userError || !user) {
      console.error('User not found:', email);
      process.exit(1);
    }
    
    // Send test digest
    console.log(`Sending test ${frequency} digest for ${cityCode} to ${email}...`);
    const campaignId = await DigestSendingService.sendTestDigest(user.id, cityCode, frequency);
    
    if (campaignId) {
      console.log(`Success! Campaign ID: ${campaignId}`);
    } else {
      console.error('Failed to send test digest');
      process.exit(1);
    }
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main(); 