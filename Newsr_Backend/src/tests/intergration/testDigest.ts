import { supabase } from '../../services/supabase';
import dotenv from 'dotenv';

// Load environment variables if not already loaded
dotenv.config();

async function testDigestSystem() {
  console.log('Testing Digest Subscription System...');
  
  // Use the specific user ID provided instead of login
  const userId = '54956f0f-b750-490a-82a9-ff76d93838cd';
  const cityCode = 'seattle';
  
  try {
    console.log(`\nUsing user ID: ${userId}`);
    
    // 1. Verify user exists
    console.log('\n1. Verifying user exists...');
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, name, preferences')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error fetching user:', userError);
      return;
    }
    
    console.log('User found:', {
      id: userId,
      email: userData.email,
      name: userData.name
    });
    
    // 2. Check existing digest subscriptions
    console.log('\n2. Checking existing digest subscriptions...');
    const { data: existingSubs, error: subsError } = await supabase
      .from('digest_subscriptions')
      .select('*')
      .eq('user_id', userId);
    
    if (subsError) {
      console.error('Error checking existing subscriptions:', subsError);
      return;
    }
    
    console.log(`Found ${existingSubs?.length || 0} existing subscriptions`);
    if (existingSubs && existingSubs.length > 0) {
      console.log('Existing subscriptions:', existingSubs);
    }
    
    // 3. Create a test digest subscription
    console.log('\n3. Creating a test digest subscription...');
    const testSubscription = {
      user_id: userId,
      city_code: cityCode,
      delivery_email: true,
      delivery_push: false,
      frequency: 'daily'
    };
    
    const { data: newSub, error: createError } = await supabase
      .from('digest_subscriptions')
      .upsert(testSubscription)
      .select()
      .single();
    
    if (createError) {
      console.error('Error creating subscription:', createError);
      return;
    }
    
    console.log('Test subscription created successfully:', newSub);
    
    // 4. Verify user preferences were updated
    console.log('\n4. Verifying user preferences were updated...');
    const { data: updatedUserData, error: updatedUserError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', userId)
      .single();
    
    if (updatedUserError) {
      console.error('Error fetching user preferences:', updatedUserError);
    } else {
      console.log('User preferences:', updatedUserData.preferences);
      const locationAdded = updatedUserData.preferences.locations.includes(cityCode);
      console.log(`Location added to preferences: ${locationAdded ? 'Yes' : 'No'}`);
      
      // If location not added, we'll update preferences manually
      if (!locationAdded) {
        console.log('Location not automatically added to preferences, updating manually...');
        const updatedPreferences = {
          ...updatedUserData.preferences,
          locations: [...(updatedUserData.preferences.locations || []), cityCode]
        };
        
        const { error: prefUpdateError } = await supabase
          .from('users')
          .update({ preferences: updatedPreferences })
          .eq('id', userId);
          
        if (prefUpdateError) {
          console.error('Error updating preferences:', prefUpdateError);
        } else {
          console.log('Preferences updated manually to include:', cityCode);
        }
      }
    }
    
    // 5. Update subscription preferences
    console.log('\n5. Testing subscription update...');
    const updatedSettings = {
      frequency: 'weekly',
      delivery_push: true
    };
    
    const { data: updatedSub, error: updateError } = await supabase
      .from('digest_subscriptions')
      .update(updatedSettings)
      .eq('id', newSub.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating subscription:', updateError);
    } else {
      console.log('Subscription updated successfully:', updatedSub);
    }
    
    // 6. Test triggering a digest manually (if possible)
    console.log('\n6. Testing manual digest generation (simulation)...');
    console.log('Note: This is a simulation as the actual digest generation logic is not accessible');
    
    // Fetch recent articles for the subscribed location
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('id, title, description, category')
      .limit(5);
    
    if (articlesError) {
      console.error('Error fetching articles for digest:', articlesError);
    } else {
      console.log('Articles that would be included in digest:');
      if (articles && articles.length > 0) {
        articles.forEach(article => {
          console.log(`- ${article.title} (${article.category || 'uncategorized'})`);
        });
      } else {
        console.log('No articles found. Digest would be empty.');
      }
      
      console.log('\nIn a real system, these articles would be formatted and sent to:');
      console.log(`Email: ${userData.email}`);
      
      if (updatedSub.delivery_push) {
        console.log('Push notification: Enabled');
      }
    }
    
    // Optional: Clean up by deleting the test subscription
    if (process.env.DELETE_TEST_SUBSCRIPTION === 'true') {
      console.log('\nCleaning up test subscription...');
      const { error: deleteError } = await supabase
        .from('digest_subscriptions')
        .delete()
        .eq('id', newSub.id);
      
      if (deleteError) {
        console.error('Error deleting test subscription:', deleteError);
      } else {
        console.log('Test subscription deleted successfully');
      }
    } else {
      console.log('\nTest subscription remains in the database for inspection');
    }
    
  } catch (err) {
    console.error('Unexpected error during digest testing:', err);
  }
}

// Execute the test if this file is run directly
if (require.main === module) {
  testDigestSystem()
    .then(() => console.log('Digest testing completed'))
    .catch(err => console.error('Digest testing failed:', err));
}

export { testDigestSystem }; 