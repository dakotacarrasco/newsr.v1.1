import { createUser, addCitySubscription } from '../tests/scripts/createUser';
import fs from 'fs';
import path from 'path';

interface UserData {
  email: string;
  password: string;
  name: string;
  topics?: string[];
  locations?: string[];
  subscriptions?: string[];
}

async function createUsersFromJson(filePath: string) {
  try {
    // Read the JSON file
    const fullPath = path.resolve(process.cwd(), filePath);
    console.log(`Reading users from ${fullPath}...`);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return;
    }
    
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const userData: UserData[] = JSON.parse(fileContent);
    
    console.log(`Found ${userData.length} users to create`);
    
    // Create each user
    const results = [];
    for (const user of userData) {
      console.log(`\nCreating user: ${user.name} (${user.email})`);
      
      const createdUser = await createUser(
        user.email, 
        user.password, 
        user.name,
        user.topics || [],
        user.locations || []
      );
      
      if (createdUser) {
        // Add subscriptions if specified
        if (user.subscriptions && user.subscriptions.length > 0) {
          console.log(`Adding ${user.subscriptions.length} subscriptions...`);
          
          for (const cityCode of user.subscriptions) {
            await addCitySubscription(createdUser.id, cityCode);
          }
        }
        
        results.push({
          id: createdUser.id,
          email: user.email,
          status: 'created'
        });
      } else {
        results.push({
          email: user.email,
          status: 'failed'
        });
      }
    }
    
    // Output summary
    console.log('\n--- User Creation Summary ---');
    console.log(`Total attempted: ${userData.length}`);
    console.log(`Successfully created: ${results.filter(r => r.status === 'created').length}`);
    console.log(`Failed: ${results.filter(r => r.status === 'failed').length}`);
    
    // Write results to file
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const outputPath = path.join(process.cwd(), `user_creation_results_${timestamp}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
    console.log(`Results written to: ${outputPath}`);
    
  } catch (error) {
    console.error('Error in batch creation:', error);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const filePath = args[0];
  
  if (!filePath) {
    console.log('Usage: npm run batch:users -- <path-to-users-json>');
    console.log('Example: npm run batch:users -- users.json');
    console.log('\nJSON format:');
    console.log(`[
  {
    "email": "user1@example.com",
    "password": "Password123!",
    "name": "User One",
    "topics": ["local", "politics"],
    "locations": ["denver", "seattle"],
    "subscriptions": ["denver", "seattle"]
  },
  ...
]`);
    return;
  }
  
  await createUsersFromJson(filePath);
}

// Run if called directly
if (require.main === module) {
  main().then(() => process.exit(0)).catch(err => {
    console.error('Error in main function:', err);
    process.exit(1);
  });
} 