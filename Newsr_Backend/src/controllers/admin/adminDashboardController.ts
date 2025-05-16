import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';
import AppError from '../utils/appError';

/**
 * Get user statistics for the dashboard
 */
export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get total user count
    const { count: totalUsers, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      throw new AppError('Failed to fetch user statistics', 500);
    }

    // Get new users in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: newUsers, error: newUserError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    if (newUserError) {
      throw new AppError('Failed to fetch new user statistics', 500);
    }

    // Get active users (users who have activity in the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activeUsersData, error: activeUserError } = await supabase
      .from('user_activity')
      .select('user_id')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (activeUserError) {
      throw new AppError('Failed to fetch active user statistics', 500);
    }

    // Count unique active users
    const activeUsers = new Set(activeUsersData.map(activity => activity.user_id)).size;

    res.status(200).json({
      status: 'success',
      data: {
        totalUsers: totalUsers || 0,
        newUsers: newUsers || 0,
        activeUsers,
        conversionRate: totalUsers ? ((activeUsers / totalUsers) * 100).toFixed(2) + '%' : '0%'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent user activity for the dashboard
 */
export const getRecentActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Get recent activity with user details
    const { data, error } = await supabase
      .from('user_activity')
      .select(`
        id,
        activity_type,
        created_at,
        ip_address,
        user_agent,
        users:user_id (id, email, name)
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new AppError('Failed to fetch recent activity', 500);
    }

    res.status(200).json({
      status: 'success',
      data: {
        activities: data || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get registration trend data for the dashboard chart
 */
export const getRegistrationTrend = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    
    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all users created in the specified period
    const { data, error } = await supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      throw new AppError('Failed to fetch registration trend data', 500);
    }

    // Group by day
    const dailyCounts = {};
    const dateLabels = [];
    
    // Initialize all days with zero counts
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyCounts[dateStr] = 0;
      dateLabels.push(dateStr);
    }
    
    // Count registrations by day
    data?.forEach(item => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      if (dailyCounts[date] !== undefined) {
        dailyCounts[date]++;
      }
    });
    
    // Format for chart data
    const chartData = dateLabels.map(date => ({
      date,
      registrations: dailyCounts[date]
    }));

    res.status(200).json({
      status: 'success',
      data: {
        trend: chartData,
        total: data?.length || 0
      }
    });
  } catch (error) {
    next(error);
  }
}; 