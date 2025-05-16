import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabaseClient';
import AppError from '../utils/appError';

export const isAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError('Not authenticated', 401));
    }

    // Check if user has admin role
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', req.user.id)
      .single();

    if (error || !data) {
      return next(new AppError('User not found', 404));
    }

    if (data.role !== 'admin') {
      return next(new AppError('Not authorized to access admin dashboard', 403));
    }

    next();
  } catch (error) {
    next(new AppError('Role verification failed', 500));
  }
}; 