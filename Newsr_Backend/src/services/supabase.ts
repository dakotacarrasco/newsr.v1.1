import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials. Please check your .env file.');
}

console.log('Initializing Supabase with:');
console.log('URL:', supabaseUrl);
console.log('Service Key (first 10 chars):', supabaseKey?.substring(0, 10) + '...');

// Create Supabase client with explicit options
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

// For public operations (if needed)
export const supabasePublic = createClient(
  supabaseUrl || 'https://ckywgfnaaiapiyrztgdp.supabase.co',
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || 'fallback-anon-key'
);

// User statistics functions
export async function getUserStats() {
  try {
    // Check if Supabase is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return {
        error: 'Supabase not configured',
        totalUsers: 0,
        newUsers: 0,
        activeUsers: 0,
        conversionRate: '0%',
        growthData: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          totalUsers: [0, 0, 0, 0, 0, 0],
          activeUsers: [0, 0, 0, 0, 0, 0]
        }
      };
    }

    // Get total users count
    const { count: totalUsers, error: countError } = await supabase
      .from('user')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error fetching total users:', countError);
      throw countError;
    }
    
    // Get new users in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { count: newUsers, error: newUsersError } = await supabase
      .from('user')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());
    
    if (newUsersError) {
      console.error('Error fetching new users:', newUsersError);
      throw newUsersError;
    }
    
    // Get active users (users who have a name set)
    const { count: activeUsers, error: activeUsersError } = await supabase
      .from('user')
      .select('*', { count: 'exact', head: true })
      .not('name', 'is', null);
    
    if (activeUsersError) {
      console.error('Error fetching active users:', activeUsersError);
      throw activeUsersError;
    }
    
    // Calculate conversion rate (percentage of users who have preferences set)
    const { count: completedProfiles, error: profilesError } = await supabase
      .from('user')
      .select('*', { count: 'exact', head: true })
      .not('preferences', 'is', null);
    
    if (profilesError) {
      console.error('Error fetching completed profiles:', profilesError);
      throw profilesError;
    }
    
    const conversionRate = totalUsers ? ((completedProfiles || 0) / totalUsers * 100).toFixed(1) + '%' : '0%';
    
    // Get monthly growth data for the past 6 months
    const growthData = await getMonthlyGrowthData();
    
    return {
      totalUsers: totalUsers || 0,
      newUsers: newUsers || 0,
      activeUsers: activeUsers || 0,
      conversionRate,
      growthData
    };
  } catch (error) {
    console.error('Error fetching user stats:', error);
    throw error;
  }
}

// Get monthly growth data for charts
async function getMonthlyGrowthData() {
  try {
    // Check if Supabase is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        totalUsers: [0, 0, 0, 0, 0, 0],
        activeUsers: [0, 0, 0, 0, 0, 0]
      };
    }

    const months = [];
    const totalUsersData = [];
    const activeUsersData = [];
    
    // Get data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      
      const monthName = date.toLocaleString('default', { month: 'short' });
      months.push(monthName);
      
      // Get total users up to this month
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const { count: totalUsers, error: totalError } = await supabase
        .from('user')
        .select('*', { count: 'exact', head: true })
        .lte('created_at', endOfMonth.toISOString());
      
      if (totalError) {
        console.error('Error fetching total users for month:', totalError);
        totalUsersData.push(0);
      } else {
        totalUsersData.push(totalUsers || 0);
      }
      
      // Get active users for this month (users with name set)
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      
      const { count: activeUsers, error: activeError } = await supabase
        .from('user')
        .select('*', { count: 'exact', head: true })
        .not('name', 'is', null)
        .gte('created_at', startOfMonth.toISOString())
        .lte('created_at', endOfMonth.toISOString());
      
      if (activeError) {
        console.error('Error fetching active users for month:', activeError);
        activeUsersData.push(0);
      } else {
        activeUsersData.push(activeUsers || 0);
      }
    }
    
    return {
      labels: months,
      totalUsers: totalUsersData,
      activeUsers: activeUsersData
    };
  } catch (error) {
    console.error('Error getting monthly growth data:', error);
    return {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      totalUsers: [0, 0, 0, 0, 0, 0],
      activeUsers: [0, 0, 0, 0, 0, 0]
    };
  }
}

// Get recent user activity - simplified since we don't have a user_activity table
export async function getUserActivity(limit = 10) {
  try {
    // Check if Supabase is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return { 
        activities: [],
        error: 'Supabase not configured'
      };
    }

    // Just get the most recent users instead
    const { data, error } = await supabase
      .from('user')
      .select(`
        id,
        email,
        name,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching recent users:', error);
      throw error;
    }
    
    // Transform user data into activity format
    const activities = data?.map(user => ({
      id: user.id,
      user_id: user.id,
      activity_type: 'signup',
      created_at: user.created_at,
      users: {
        id: user.id,
        email: user.email,
        full_name: user.name
      }
    })) || [];
    
    return { activities };
  } catch (error) {
    console.error('Error fetching user activity:', error);
    return { 
      activities: [],
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Get digest statistics
export async function getDigestStats() {
  try {
    // Check if Supabase is properly configured
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return {
        error: 'Supabase not configured',
        totalSubscribers: 0,
        openRate: '0%',
        clickRate: '0%',
        topArticles: [],
        recentDigests: []
      };
    }

    // Get total subscribers
    const { count: totalSubscribers, error: countError } = await supabase
      .from('digest_subscribers')
      .select('*', { count: 'exact', head: true })
      .eq('subscribed', true);
    
    if (countError) {
      console.error('Error fetching total subscribers:', countError);
      throw countError;
    }
    
    // Get recent digests with open/click data
    const { data: recentDigests, error: digestsError } = await supabase
      .from('digests')
      .select(`
        id,
        subject,
        sent_date,
        opens,
        clicks
      `)
      .order('sent_date', { ascending: false })
      .limit(5);
    
    if (digestsError) {
      console.error('Error fetching recent digests:', digestsError);
      throw digestsError;
    }
    
    // Calculate open and click rates
    let totalOpens = 0;
    let totalClicks = 0;
    
    recentDigests?.forEach(digest => {
      totalOpens += digest.opens || 0;
      totalClicks += digest.clicks || 0;
    });
    
    // Estimate total sent as 100 per digest if sent_count is not available
    const estimatedTotalSent = (recentDigests?.length || 0) * 100;
    
    const openRate = estimatedTotalSent ? ((totalOpens / estimatedTotalSent) * 100).toFixed(1) + '%' : '0%';
    const clickRate = totalOpens ? ((totalClicks / totalOpens) * 100).toFixed(1) + '%' : '0%';
    
    // Get top articles by clicks
    const { data: topArticles, error: articlesError } = await supabase
      .from('digest_articles')
      .select(`
        id,
        title,
        clicks
      `)
      .order('clicks', { ascending: false })
      .limit(3);
    
    if (articlesError) {
      console.error('Error fetching top articles:', articlesError);
      throw articlesError;
    }
    
    return {
      totalSubscribers: totalSubscribers || 0,
      openRate,
      clickRate,
      topArticles: topArticles || [],
      recentDigests: recentDigests || []
    };
  } catch (error) {
    console.error('Error fetching digest stats:', error);
    return {
      error: error instanceof Error ? error.message : String(error),
      totalSubscribers: 0,
      openRate: '0%',
      clickRate: '0%',
      topArticles: [],
      recentDigests: []
    };
  }
}

// Helper function to check if a record exists
export async function recordExists(table: string, column: string, value: any): Promise<boolean> {
  const { data, error } = await supabase
    .from(table)
    .select('id')
    .eq(column, value)
    .single();
    
  if (error) {
    return false;
  }
  
  return !!data;
} 