import { supabase } from '../../services/supabase';

// Helper function to wait between operations
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const seedPollsData = async () => {
  console.log('Creating sample polls and votes...');
  
  // First, get some user IDs to use for votes
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')
    .limit(10);
  
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  // If no users exist, we can't create votes
  if (!users || users.length === 0) {
    console.log('No users found. Creating polls without votes.');
  }
  
  // Sample polls with more engaging questions
  const pollsData = [
    {
      question: 'What is the most pressing issue in our community today?',
      options: { 
        'Housing affordability': 0, 
        'Public safety': 0, 
        'Education quality': 0, 
        'Environmental concerns': 0, 
        'Economic development': 0 
      },
      category: 'local',
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
      total_votes: 0
    },
    {
      question: 'Which technology will have the biggest impact in the next decade?',
      options: { 
        'Artificial Intelligence': 0, 
        'Renewable Energy': 0, 
        'Quantum Computing': 0, 
        'Biotechnology': 0, 
        'Space Technology': 0 
      },
      category: 'technology',
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      total_votes: 0
    },
    {
      question: 'What type of news content would you like to see more of?',
      options: { 
        'In-depth investigative reporting': 0, 
        'Local community stories': 0, 
        'International news': 0, 
        'Science and technology updates': 0, 
        'Economic analysis': 0 
      },
      category: 'feedback',
      end_date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
      total_votes: 0
    },
    {
      question: 'How do you primarily consume news?',
      options: { 
        'Social media': 0, 
        'News websites': 0, 
        'Mobile apps': 0, 
        'Television': 0, 
        'Print newspapers': 0, 
        'Podcasts': 0 
      },
      category: 'media',
      end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      total_votes: 0
    },
    {
      question: 'What should be the top priority for local government spending?',
      options: { 
        'Infrastructure': 0, 
        'Education': 0, 
        'Public safety': 0, 
        'Healthcare': 0, 
        'Environmental protection': 0, 
        'Economic development': 0 
      },
      category: 'politics',
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      total_votes: 0
    },
    
    // New Business Polls
    {
      question: 'Which economic factor most impacts your business decisions?',
      options: {
        'Interest rates': 0,
        'Inflation': 0,
        'Labor market': 0,
        'Supply chain issues': 0,
        'Consumer spending': 0,
        'Government regulations': 0
      },
      category: 'business',
      end_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    {
      question: 'What is the most important skill for business leaders today?',
      options: {
        'Strategic thinking': 0,
        'Adaptability': 0,
        'Communication': 0,
        'Technical knowledge': 0,
        'Emotional intelligence': 0,
        'Crisis management': 0
      },
      category: 'business',
      end_date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    {
      question: 'Which business model do you think is most sustainable long-term?',
      options: {
        'Subscription-based': 0,
        'E-commerce': 0,
        'Sharing economy': 0,
        'Freemium': 0,
        'Direct-to-consumer': 0,
        'Platform/marketplace': 0
      },
      category: 'business',
      end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    {
      question: 'What is your company\'s biggest challenge in 2023?',
      options: {
        'Talent acquisition': 0,
        'Digital transformation': 0,
        'Cost management': 0,
        'Supply chain disruptions': 0,
        'Cybersecurity': 0,
        'Regulatory compliance': 0
      },
      category: 'business',
      end_date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    {
      question: 'Which investment area offers the best opportunity right now?',
      options: {
        'Technology stocks': 0,
        'Real estate': 0,
        'Cryptocurrency': 0,
        'Green energy': 0,
        'Healthcare': 0,
        'Government bonds': 0
      },
      category: 'business',
      end_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    
    // New Political Polls
    {
      question: 'What is the most important issue for the next election?',
      options: {
        'Economy': 0,
        'Healthcare': 0,
        'Climate change': 0,
        'Immigration': 0,
        'National security': 0,
        'Education': 0
      },
      category: 'politics',
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    {
      question: 'Which policy approach would best address income inequality?',
      options: {
        'Tax reform': 0,
        'Higher minimum wage': 0,
        'Universal basic income': 0,
        'Job training programs': 0,
        'Education investment': 0,
        'Corporate regulation': 0
      },
      category: 'politics',
      end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    {
      question: 'What should be the government\'s role in healthcare?',
      options: {
        'Universal public healthcare': 0,
        'Public-private partnership': 0,
        'Market-based solutions': 0,
        'Expanded Medicare/Medicaid': 0,
        'Focus on preventative care': 0,
        'Regulate drug prices': 0
      },
      category: 'politics',
      end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    {
      question: 'Which approach to climate change do you support most?',
      options: {
        'Carbon tax': 0,
        'Green energy investment': 0,
        'International agreements': 0,
        'Nuclear power expansion': 0,
        'Corporate emissions regulations': 0,
        'Consumer incentives for green choices': 0
      },
      category: 'politics',
      end_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    },
    {
      question: 'What is your view on government surveillance and privacy?',
      options: {
        'Security requires some surveillance': 0,
        'Privacy should be prioritized': 0,
        'Need better oversight of agencies': 0,
        'Current balance is appropriate': 0,
        'More transparency needed': 0,
        'Depends on the specific threat': 0
      },
      category: 'politics',
      end_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
      total_votes: 0
    }
  ];
  
  // Insert polls and track their IDs
  const pollIds = [];
  for (const pollData of pollsData) {
    const { data: poll, error: pollError } = await supabase
      .from('polls')
      .insert(pollData)
      .select('id')
      .single();
    
    if (pollError) {
      console.error('Error creating poll:', pollError);
      continue;
    }
    
    console.log(`Created poll: ${pollData.question} with ID: ${poll.id}`);
    pollIds.push(poll.id);
  }
  
  // If we have users and polls, create some votes
  if (users && users.length > 0 && pollIds.length > 0) {
    console.log('Creating sample votes...');
    
    // For each poll, create some votes
    for (const pollId of pollIds) {
      // Get the poll to access its options
      const { data: poll, error: pollError } = await supabase
        .from('polls')
        .select('options')
        .eq('id', pollId)
        .single();
      
      if (pollError || !poll) {
        console.error(`Error fetching poll ${pollId}:`, pollError);
        continue;
      }
      
      const optionKeys = Object.keys(poll.options);
      const updatedOptions = { ...poll.options };
      let totalVotes = 0;
      
      // Create votes for some users (not all, to keep it realistic)
      const votingUsers = users.slice(0, Math.floor(Math.random() * users.length) + 1);
      
      for (const user of votingUsers) {
        // Randomly select an option
        const selectedOption = optionKeys[Math.floor(Math.random() * optionKeys.length)];
        
        // Record the vote
        const { error: voteError } = await supabase
          .from('poll_votes')
          .insert({
            poll_id: pollId,
            user_id: user.id,
            option: selectedOption
          });
        
        if (voteError) {
          console.error(`Error creating vote for user ${user.id} on poll ${pollId}:`, voteError);
          continue;
        }
        
        // Update the count for this option
        updatedOptions[selectedOption] += 1;
        totalVotes += 1;
      }
      
      // Update the poll with the new vote counts
      const { error: updateError } = await supabase
        .from('polls')
        .update({
          options: updatedOptions,
          total_votes: totalVotes
        })
        .eq('id', pollId);
      
      if (updateError) {
        console.error(`Error updating poll ${pollId} with votes:`, updateError);
      } else {
        console.log(`Added ${totalVotes} votes to poll ${pollId}`);
      }
    }
  }
  
  console.log('Finished creating polls and votes');
};

const seedArticlesData = async () => {
  console.log('Creating sample articles...');
  
  // Get a user ID to use as author
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id')
    .limit(1);
  
  if (usersError || !users || users.length === 0) {
    console.error('Error fetching users for articles:', usersError);
    return;
  }
  
  const authorId = users[0].id;
  
  // Sample articles
  const articlesData = [
    {
      title: 'The Future of Renewable Energy',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.',
      description: 'An exploration of emerging renewable energy technologies and their potential impact.',
      category: 'technology',
      author_id: authorId,
      keywords: ['renewable', 'energy', 'solar', 'wind', 'sustainability'],
      image_url: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d'
    },
    {
      title: 'Local Community Garden Thrives',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.',
      description: 'How a neighborhood initiative transformed an empty lot into a flourishing garden.',
      category: 'local',
      author_id: authorId,
      keywords: ['community', 'garden', 'local', 'sustainability'],
      image_url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae'
    },
    {
      title: 'Understanding the New Economic Policies',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies nisl nisl eget nisl.',
      description: 'An analysis of recent economic policy changes and their potential effects on different sectors.',
      category: 'politics',
      author_id: authorId,
      keywords: ['economy', 'policy', 'government', 'finance'],
      image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e'
    }
  ];
  
  // Insert articles
  for (const articleData of articlesData) {
    const { error: articleError } = await supabase
      .from('articles')
      .insert(articleData);
    
    if (articleError) {
      console.error('Error creating article:', articleError);
    } else {
      console.log(`Created article: ${articleData.title}`);
    }
  }
  
  console.log('Finished creating articles');
};

const seedLocationsData = async () => {
  console.log('Creating sample locations...');
  
  // Sample locations
  const locationsData = [
    {
      name: 'New York City',
      state: 'NY',
      country: 'USA',
      latitude: 40.7128,
      longitude: -74.0060
    },
    {
      name: 'Los Angeles',
      state: 'CA',
      country: 'USA',
      latitude: 34.0522,
      longitude: -118.2437
    },
    {
      name: 'Chicago',
      state: 'IL',
      country: 'USA',
      latitude: 41.8781,
      longitude: -87.6298
    }
  ];
  
  // Insert locations
  for (const locationData of locationsData) {
    const { error: locationError } = await supabase
      .from('locations')
      .insert(locationData);
    
    if (locationError) {
      console.error('Error creating location:', locationError);
    } else {
      console.log(`Created location: ${locationData.name}`);
    }
  }
  
  console.log('Finished creating locations');
};

// Main seed function
const seedDatabase = async () => {
  console.log('Starting database seed...');
  
  try {
    // Check connection
    const { error: connectionError } = await supabase.from('users').select('count');
    if (connectionError) throw new Error(`Connection failed: ${connectionError.message}`);
    console.log('Connected to Supabase');

    // Get existing users to use for seeding
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.warn('Warning: Could not fetch users:', usersError.message);
      console.log('Will proceed with seeding without user-specific data');
    } else if (!existingUsers || existingUsers.length === 0) {
      console.warn('Warning: No existing users found in the database');
      console.log('Will proceed with seeding without user-specific data');
    } else {
      console.log(`Found ${existingUsers.length} existing users to use for seeding`);
    }

    // Seed locations
    await seedLocationsData();
    
    // Seed articles (will use existing users if available)
    await seedArticlesData();
    
    // Seed polls and votes (will use existing users if available)
    await seedPollsData();
    
    console.log('Database seed completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

// Execute the seed function if this file is run directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Fatal error during seeding:', error);
      process.exit(1);
    });
}

export { seedDatabase };