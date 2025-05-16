import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';
import AppError from '../utils/appError';

export const getUserActivityLogs = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if user is admin (you'll need to implement role-based auth)
    // For now, we'll just fetch recent activities
    
    const { data, error } = await supabase
      .from('user_activity')
      .select(`
        id,
        activity_type,
        ip_address,
        user_agent,
        created_at,
        users:user_id (email, name)
      `)
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (error) {
      throw new AppError('Failed to fetch user activity logs', 500);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        activities: data
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserRegistrationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get registration stats for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data, error } = await supabase
      .from('user_activity')
      .select('created_at')
      .eq('activity_type', 'registration')
      .gte('created_at', thirtyDaysAgo.toISOString());
      
    if (error) {
      throw new AppError('Failed to fetch registration stats', 500);
    }
    
    // Group by day
    const dailyCounts = {};
    data.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        total: data.length,
        dailyCounts
      }
    });
  } catch (error) {
    next(error);
  }
}; 