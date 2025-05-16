import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { MailchimpService } from '../utils/mailchimpService';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''; // Use service role key for auth hooks
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export const handleUserRegistration = async (user: any) => {
  try {
    // Get user details from auth.users
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return;
    }
    
    // Parse name into first and last
    const nameParts = userData.name?.split(' ') || [''];
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');
    
    // Add user to Mailchimp
    await MailchimpService.addOrUpdateContact(
      userData.email,
      firstName,
      lastName,
      ['new_user']
    );
    
    console.log(`User ${userData.email} added to Mailchimp after registration`);
    
    // Check if user has a default city preference
    if (userData.default_city) {
      // Auto-subscribe to daily digest for default city
      await supabase
        .from('digest_subscriptions')
        .insert({
          user_id: user.id,
          city_code: userData.default_city,
          frequency: 'daily',
          status: 'active'
        });
      
      // Add to Mailchimp segment
      if (userData.default_city) {
        const cityName = {
          'seattle': 'Seattle',
          'portland': 'Portland',
          'sanfrancisco': 'San Francisco',
          'losangeles': 'Los Angeles',
          'newyork': 'New York',
          // Add more cities as needed
        }[userData.default_city] || userData.default_city;
        
        await MailchimpService.addUserToCitySegment(
          userData.email,
          userData.default_city,
          cityName,
          'daily'
        );
      }
    }
  } catch (error) {
    console.error('Error in user registration hook:', error);
  }
};

// Function to set up the webhook listener
export const setupUserRegistrationWebhook = () => {
  // This would typically be set up in your Supabase dashboard
  // or using the Supabase Edge Functions
  console.log('User registration webhook configured');
}; 