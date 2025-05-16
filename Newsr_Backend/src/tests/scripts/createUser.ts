import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

dotenv.config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL as string;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Create a new user with Supabase Auth + add to users table
 */
async function createUser(email: string, password: string, name: string, topics: string[] = [], locations: string[] = []) {
  try {
    console.log(`Creating user with email: ${email}...`);
    
    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
    });
    
    if (authError) {
      console.error('Error creating auth user:', authError);
      return null;
    }
    
    const userId = authData.user.id;
    console.log(`✅ Auth user created with ID: ${userId}`);
    
    // 2. Create record in public users table with additional info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        name,
        preferences: {
          topics,
          locations,
          darkMode: false
        }
      })
      .select()
      .single();
    
    if (userError) {
      console.error('Error inserting user data:', userError);
      // Consider cleaning up the auth user if this fails
      return null;
    }
    
    console.log(`✅ User profile created successfully for ${name}`);
    return {
      id: userId,
      email,
      name,
      preferences: userData.preferences
    };
  } catch (error) {
    console.error('Unexpected error creating user:', error);
    return null;
  }
}

/**
 * Add city subscription for user
 */
async function addCitySubscription(userId: string, cityCode: string) {
  try {
    console.log(`Adding subscription to ${cityCode} for user ${userId}...`);
    
    const { data, error } = await supabase
      .from('digest_subscriptions')
      .insert({
        user_id: userId,
        city_code: cityCode,
        delivery_email: true,
        delivery_push: false,
        frequency: 'daily'
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error adding subscription:', error);
      return false;
    }
    
    console.log(`✅ Subscription added: ${data.id}`);
    return true;
  } catch (error) {
    console.error('Unexpected error adding subscription:', error);
    return false;
  }
}

// Command-line script functionality
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (command === 'create') {
    const email = args[1] || `test${randomUUID().slice(0,6)}@example.com`;
    const password = args[2] || 'Test123456!';
    const name = args[3] || 'Test User';
    
    const user = await createUser(email, password, name, ['local', 'politics'], ['denver', 'seattle']);
    
    if (user) {
      console.log('\nUser created successfully:');
      console.log(JSON.stringify(user, null, 2));
      
      // Add a subscription for the user
      await addCitySubscription(user.id, 'denver');
      
      console.log('\nLogin credentials:');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
    }
  } else {
    console.log('Usage:');
    console.log('npm run create:user -- create [email] [password] [name]');
    console.log('\nExample:');
    console.log('npm run create:user -- create john@example.com Password123! "John Smith"');
    console.log('\nOmitting parameters will generate random values');
  }
}

// Run if called directly
if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error('Error in main function:', err);
    process.exit(1);
  });
}

// Export for use as a module
export { createUser, addCitySubscription }; 