import { Request } from 'express';
import { supabase } from '../services/supabase';

export enum ActivityType {
  REGISTER = 'register',
  LOGIN = 'login',
  LOGOUT = 'logout',
  UPDATE_PROFILE = 'update_profile',
  VIEW_ARTICLE = 'view_article',
  CREATE_ARTICLE = 'create_article',
  LIKE_ARTICLE = 'like_article',
  VOTE_POLL = 'vote_poll'
}

export const logActivity = async (
  userId: string, 
  activityType: ActivityType, 
  req: Request
) => {
  try {
    // Log to console for debugging
    console.log(`Activity logged: ${userId} performed ${activityType}`);
    
    // Extract useful information from the request
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    const path = req.originalUrl || req.url;
    
    // Get resource ID if available (from params or body)
    const resourceId = req.params.id || req.body.id || null;
    
    // Create metadata object
    const metadata = {
      path,
      method: req.method,
      resourceId,
      // Include any other relevant data
      referer: req.headers.referer || null,
      queryParams: Object.keys(req.query).length > 0 ? req.query : null
    };
    
    // Insert into user_activity table
    const { data, error } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: activityType,
        ip_address: ipAddress,
        user_agent: userAgent,
        metadata
      });
      
    if (error) {
      console.error('Error logging activity to database:', error);
    }
    
    return data;
  } catch (error) {
    // Log errors but don't let activity logging failures affect the application
    console.error('Activity logging error:', error);
    return null;
  }
};

// Function to retrieve user activity
export const getUserActivity = async (userId: string, limit = 20) => {
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getUserActivity:', error);
    return [];
  }
};

// Function to get recent activity for all users (admin function)
export const getRecentActivity = async (limit = 100) => {
  try {
    const { data, error } = await supabase
      .from('user_activity')
      .select('*, users:user_id(name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching recent activity:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getRecentActivity:', error);
    return [];
  }
}; 