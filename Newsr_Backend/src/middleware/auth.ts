import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    user_metadata?: any;
    [key: string]: any;
  };
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token'
      });
    }
    
    // Add user to request
    (req as AuthRequest).user = {
      id: data.user.id,
      email: data.user.email || '',
      name: data.user.user_metadata?.name,
      role: data.user.user_metadata?.role || 'user',
      metadata: data.user.user_metadata
    };
    
    next();
  } catch (error) {
    res.status(401).json({
      status: 'fail',
      message: 'Authentication error'
    });
  }
}; 