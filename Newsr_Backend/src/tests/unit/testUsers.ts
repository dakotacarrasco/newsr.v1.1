import { supabase } from '../../services/supabase';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

async function testUserOperations() {
  console.log('Testing Supabase user operations...');
  
  // Using the provided email for testing
  const testEmail = 'daktoacarrasco98@gmail.com';
  const testPassword = 'Password123!';
  const testName = 'Test User';

  console.log(`Using test email: ${testEmail}`);
  console.log('⚠️ WARNING: This will send a real confirmation email to this address');
  console.log('If this is not intended, press Ctrl+C to cancel within 5 seconds');
  
  // Wait 5 seconds to give the user time to cancel if needed
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  let userId: string | null = null;
  
  try {
    // Check if user already exists
    console.log('\nChecking if test user already exists...');
    const { data: existingUsers, error: existingError } = await supabase
      .from('users')
      .select('id')
      .eq('email', testEmail);
    
    if (existingError) {
      console.error('Error checking existing users:', existingError);
    } else if (existingUsers && existingUsers.length > 0) {
      console.log('Test user already exists. Using existing user for tests.');
      userId = existingUsers[0].id;
      
      // Skip to the profile fetching step
      console.log('\nSkipping user creation and proceeding to profile tests...');
    } else {
      // 1. Test user creation
      console.log(`\n1. Testing user signup with email: ${testEmail}`);
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            name: testName
          }
        }
      });
      
      if (signupError) {
        console.error('Signup error:', signupError);
        return;
      }
      
      if (!signupData.user) {
        console.error('No user returned from signup');
        return;
      }
      
      userId = signupData.user.id;
      console.log('User created successfully:', {
        id: userId,
        email: signupData.user.email,
        name: testName
      });
      console.log('\n⚠️ A confirmation email has been sent to your email address');
      console.log('Please check your inbox and confirm the email before continuing tests');
      
      // 2. Create user profile in users table
      console.log('\n2. Creating user profile in users table...');
      const { error: profileError } = await supabase.from('users').insert({
        id: userId,
        email: testEmail,
        name: testName,
        preferences: { topics: [], locations: [], darkMode: false }
      });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
      } else {
        console.log('User profile created successfully');
      }
    }
    
    // 3. Test user login (user must have confirmed email)
    console.log('\n3. Testing user login...');
    try {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (loginError) {
        if (loginError.message.includes('Email not confirmed')) {
          console.log('Login failed: Email not confirmed');
          console.log('Please check your email inbox and confirm before proceeding');
        } else {
          console.error('Login error:', loginError);
        }
      } else {
        console.log('User login successful');
        console.log('Session established:', !!loginData.session);
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
    }
    
    // Only continue with further tests if we have a valid userId
    if (userId) {
      // 4. Test fetching user profile
      console.log('\n4. Testing fetch user profile...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) {
        console.error('Error fetching user profile:', userError);
      } else {
        console.log('User profile fetched:', userData);
      }
      
      // 5. Test updating user preferences
      console.log('\n5. Testing update user preferences...');
      const updatedPreferences = { 
        topics: ['technology', 'science'], 
        locations: ['new-york'], 
        darkMode: true 
      };
      
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ preferences: updatedPreferences })
        .eq('id', userId)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating user preferences:', updateError);
      } else {
        console.log('User preferences updated:', updateData.preferences);
      }
    }
    
  } catch (err) {
    console.error('Unexpected error during user testing:', err);
  }
}

// Execute the test if this file is run directly
if (require.main === module) {
  testUserOperations()
    .then(() => console.log('User testing completed'))
    .catch(err => console.error('User testing failed:', err));
}

export { testUserOperations }; 