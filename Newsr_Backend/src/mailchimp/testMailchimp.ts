import { MailchimpService } from './mailchimpService';
import dotenv from 'dotenv';
import readline from 'readline';

// Load environment variables
dotenv.config();

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Create MailchimpService instance
const mailchimpService = new MailchimpService();

/**
 * Main menu function
 */
async function showMainMenu(): Promise<void> {
  console.clear();
  console.log('=== Mailchimp Test Utility ===\n');
  console.log('1. Test API connection');
  console.log('2. Diagnose configuration');
  console.log('3. List audiences');
  console.log('4. Add/update a contact');
  console.log('5. Send a test email');
  console.log('6. Send a test city digest');
  console.log('7. Debug Mailchimp issues');
  console.log('0. Exit\n');
  
  rl.question('Enter your choice: ', async (choice) => {
    switch (choice) {
      case '1':
        await testConnection();
        break;
      case '2':
        await diagnoseConfiguration();
        break;
      case '3':
        await listAudiences();
        break;
      case '4':
        await addOrUpdateContact();
        break;
      case '5':
        await sendTestEmail();
        break;
      case '6':
        await sendTestDigest();
        break;
      case '7':
        await debugMailchimpIssues();
        break;
      case '0':
        console.log('Exiting...');
        rl.close();
        return;
      default:
        console.log('Invalid choice, please try again');
        await waitForKey();
        showMainMenu();
        break;
    }
  });
}

/**
 * Test API connection
 */
async function testConnection(): Promise<void> {
  console.clear();
  console.log('=== Testing Mailchimp API Connection ===\n');
  
  const result = await mailchimpService.testConnection();
  
  if (result.success) {
    console.log('✅ ' + result.message);
  } else {
    console.log('❌ ' + result.message);
  }
  
  await waitForKey();
  showMainMenu();
}

/**
 * Diagnose configuration issues
 */
async function diagnoseConfiguration(): Promise<void> {
  console.clear();
  console.log('=== Diagnosing Mailchimp Configuration ===\n');
  
  console.log('Checking configuration...');
  const diagnosis = await mailchimpService.diagnoseConfiguration();
  
  console.log('\nAPI Key: ' + (diagnosis.apiKey.valid ? '✅ ' : '❌ ') + diagnosis.apiKey.message);
  console.log('Server: ' + (diagnosis.server.valid ? '✅ ' : '❌ ') + diagnosis.server.message);
  console.log('Connection: ' + (diagnosis.connection.valid ? '✅ ' : '❌ ') + diagnosis.connection.message);
  console.log('Audience: ' + (diagnosis.audience.valid ? '✅ ' : '❌ ') + diagnosis.audience.message);
  
  if (!diagnosis.apiKey.valid || !diagnosis.server.valid || !diagnosis.connection.valid || !diagnosis.audience.valid) {
    console.log('\nRecommended actions:');
    if (!diagnosis.apiKey.valid) {
      console.log('- Set MAILCHIMP_API_KEY in your .env file');
    }
    if (!diagnosis.server.valid) {
      console.log('- Set MAILCHIMP_SERVER_PREFIX in your .env file (format: us1, us2, etc.)');
    }
    if (!diagnosis.audience.valid) {
      console.log('- Set MAILCHIMP_AUDIENCE_ID in your .env file');
      console.log('- Or create an audience in your Mailchimp account');
    }
  }
  
  await waitForKey();
  showMainMenu();
}

/**
 * List all audiences
 */
async function listAudiences(): Promise<void> {
  console.clear();
  console.log('=== Listing Mailchimp Audiences ===\n');
  
  console.log('Fetching audiences...');
  const audiences = await mailchimpService.getAudiences();
  
  if (audiences.length === 0) {
    console.log('No audiences found. Please create an audience in your Mailchimp account.');
  } else {
    console.log(`\nFound ${audiences.length} audiences:`);
    audiences.forEach((audience, index) => {
      console.log(`${index + 1}. ${audience.name} (ID: ${audience.id})`);
      console.log(`   - Member count: ${audience.stats.member_count}`);
      console.log(`   - Created: ${new Date(audience.date_created).toLocaleDateString()}`);
    });
    
    console.log('\nRecommended .env configuration:');
    console.log(`MAILCHIMP_AUDIENCE_ID=${audiences[0].id}`);
  }
  
  await waitForKey();
  showMainMenu();
}

/**
 * Add or update a contact
 */
async function addOrUpdateContact(): Promise<void> {
  console.clear();
  console.log('=== Add/Update a Contact ===\n');
  
  rl.question('Enter email address: ', (email) => {
    rl.question('Enter first name: ', (firstName) => {
      rl.question('Enter last name (optional): ', async (lastName) => {
        console.log(`\nAdding/updating contact: ${email}...`);
        
        const result = await mailchimpService.addOrUpdateContact(
          email,
          firstName,
          lastName
        );
        
        if (result.success) {
          console.log('✅ ' + result.message);
          console.log(`Contact ID: ${result.id}`);
        } else {
          console.log('❌ ' + result.message);
        }
        
        await waitForKey();
        showMainMenu();
      });
    });
  });
}

/**
 * Send a test email
 */
async function sendTestEmail(): Promise<void> {
  console.clear();
  console.log('=== Send Test Email ===\n');
  
  rl.question('Enter recipient email: ', (email) => {
    rl.question('Enter recipient name: ', async (name) => {
      console.log(`\nSending test email to ${email}...`);
      
      const result = await mailchimpService.sendTestEmail(email, name);
      
      if (result.success) {
        console.log('✅ ' + result.message);
        console.log(`Campaign ID: ${result.campaignId}`);
        console.log('Check your inbox (and spam folder) for the test email.');
      } else {
        console.log('❌ ' + result.message);
      }
      
      await waitForKey();
      showMainMenu();
    });
  });
}

/**
 * Send a test city digest
 */
async function sendTestDigest(): Promise<void> {
  console.clear();
  console.log('=== Send Test City Digest ===\n');
  
  console.log('Available cities:');
  Object.entries({
    'seattle': 'Seattle',
    'portland': 'Portland',
    'sanfrancisco': 'San Francisco',
    'losangeles': 'Los Angeles',
    'newyork': 'New York',
    'chicago': 'Chicago',
  }).forEach(([code, name]) => {
    console.log(`- ${code}: ${name}`);
  });
  
  rl.question('\nEnter city code: ', (cityCode) => {
    rl.question('Enter recipient email: ', (email) => {
      rl.question('Enter recipient name: ', async (name) => {
        console.log(`\nSending test digest for ${cityCode} to ${email}...`);
        
        const result = await mailchimpService.sendTestDigestEmail(email, cityCode, { name });
        
        if (result.success) {
          console.log('✅ ' + result.message);
          console.log(`Campaign ID: ${result.campaignId}`);
          console.log('Check your inbox (and spam folder) for the test digest.');
        } else {
          console.log('❌ ' + result.message);
        }
        
        await waitForKey();
        showMainMenu();
      });
    });
  });
}

/**
 * Debug Mailchimp issues
 */
async function debugMailchimpIssues(): Promise<void> {
  console.clear();
  console.log('=== Debug Mailchimp Issues ===\n');
  
  // 1. Test connection
  console.log('1. Testing API connection...');
  const connectionResult = await mailchimpService.testConnection();
  console.log(connectionResult.success ? '✅ Connection successful' : '❌ Connection failed');
  console.log(connectionResult.message);
  
  // 2. Check audience
  console.log('\n2. Checking audience...');
  const audiences = await mailchimpService.getAudiences();
  if (audiences.length === 0) {
    console.log('❌ No audiences found - you need to create one in Mailchimp');
  } else {
    console.log(`✅ Found ${audiences.length} audiences`);
    audiences.forEach((audience, i) => {
      console.log(`   ${i+1}. ${audience.name} (${audience.id})`);
    });
    
    const currentAudienceId = process.env.MAILCHIMP_AUDIENCE_ID || '';
    const foundAudience = audiences.find(a => a.id === currentAudienceId);
    if (foundAudience) {
      console.log(`✅ Your configured audience ID ${currentAudienceId} is valid`);
    } else {
      console.log(`❌ Your configured audience ID ${currentAudienceId} was NOT found!`);
      console.log('   Update your .env file with one of the audience IDs listed above');
    }
  }
  
  await waitForKey();
  showMainMenu();
}

/**
 * Wait for key press
 */
async function waitForKey(): Promise<void> {
  return new Promise((resolve) => {
    console.log('\nPress any key to continue...');
    process.stdin.once('data', () => {
      resolve();
    });
  });
}

// Start the application
showMainMenu(); 