import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../services/supabase';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';
import { logActivity, ActivityType } from '../../utils/activityLogger';

/**
 * Register a new user
 */
export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, name } = req.body;
    
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }
    
    console.log('Attempting to sign up user:', email);
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || email.split('@')[0]
        }
      }
    });
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      throw new AppError(authError.message, 400);
    }
    
    if (!authData.user) {
      throw new AppError('Registration failed, please try again', 500);
    }
    
    console.log('User created in auth:', authData.user.id);
    
    // Create user profile in users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name: name || email.split('@')[0], // Use part of email as name if not provided
        preferences: {
          topics: [],
          locations: [],
          darkMode: false
        }
      })
      .select()
      .single();
    
    if (userError) {
      // If profile creation fails, we should still return success since auth worked
      console.error('Error creating user profile:', userError);
    }
    
    // Log user activity
    await logActivity(authData.user.id, ActivityType.REGISTER, req);
    
    // Log authentication event
    const { data: logData } = await supabase
      .from('auth_events')
      .insert({
        user_id: authData.user.id,
        event_type: 'register',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        metadata: { method: 'password' }
      });
    
    res.status(201).json({
      status: 'success',
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          name: name || email.split('@')[0]
        }
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    next(error);
  }
};

// Alias for signup
export const registerUser = signup;

/**
 * Login user
 */
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }
    
    // Login with Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      throw new AppError(error.message, 401);
    }
    
    // Fetch user profile data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (userError) {
      console.error('Error fetching user profile:', userError);
      // Continue anyway as auth was successful
    }
    
    // Log user activity
    await logActivity(data.user.id, ActivityType.LOGIN, req);
    
    // Log authentication event
    const { data: logData } = await supabase
      .from('auth_events')
      .insert({
        user_id: data.user.id,
        event_type: 'login',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        metadata: { method: 'password' }
      });
    
    // Fix the date error by using a null check
    const expiresAt = data.session?.expires_at ? new Date(data.session.expires_at).toISOString() : null;
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userData || {
          id: data.user.id,
          email: data.user.email
        },
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: expiresAt
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Alias for login
export const loginUser = login;

/**
 * Logout user
 */
export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw new AppError('Error logging out', 500);
    }
    
    // Log user activity
    const authReq = req as AuthRequest;
    if (authReq.user?.id) {
      await logActivity(authReq.user.id, ActivityType.LOGOUT, req);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Alias for logout
export const logoutUser = logout;

/**
 * Get user profile
 */
export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      throw new AppError('User profile not found', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: data
      }
    });
  } catch (error) {
    next(error);
  }
};

// Aliases for getProfile
export const getUserProfile = getProfile;
export const getUserData = getProfile;

/**
 * Update user profile
 */
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { name, avatar_url, preferences } = req.body;
    
    // Build update object with only provided fields
    const updates: any = {};
    if (name !== undefined) updates.name = name;
    if (avatar_url !== undefined) updates.avatar_url = avatar_url;
    if (preferences !== undefined) updates.preferences = preferences;
    
    // Update user profile
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();
    
    if (error) {
      throw new AppError('Failed to update profile', 400);
    }
    
    // Log user activity
    await logActivity(req.user.id, ActivityType.UPDATE_PROFILE, req);
    
    res.status(200).json({
      status: 'success',
      data: {
        user: data
      }
    });
  } catch (error) {
    next(error);
  }
};

// Alias for updateProfile
export const updateUserProfile = updateProfile;

/**
 * Request password reset email
 */
export const requestPasswordReset = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      throw new AppError('Email is required', 400);
    }
    
    // Send password reset email via Supabase
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL}/reset-password`,
    });
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset instructions sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Set new password after reset
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      throw new AppError('New password is required', 400);
    }
    
    // The reset token is handled automatically by Supabase
    // when user clicks the reset link in email
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = async (
  req: Request, 
  res: Response, 
  next: NextFunction
) => {
  try {
    // User should be available from the middleware
    const authReq = req as AuthRequest;
    const user = authReq.user;
    
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Not authenticated'
      });
    }
    
    // Create a profile response with basic info
    const userProfile = {
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatar_url: user.user_metadata?.avatar_url,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at
    };
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userProfile
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

/**
 * Validate auth token
 */
export const validateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header or body
    const authHeader = req.headers.authorization;
    const tokenFromBody = req.body.token;
    
    if (!authHeader && !tokenFromBody) {
      throw new AppError('No token provided', 401);
    }
    
    // Parse token from header or use body token
    const token = authHeader ? 
      authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : authHeader 
      : tokenFromBody;
    
    // Verify token with Supabase
    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      throw new AppError('Invalid token', 401);
    }
    
    // Get user profile data
    const { data: userData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();
    
    if (profileError) {
      console.warn('User profile fetch error:', profileError);
      // Continue with basic user data even if profile fetch fails
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user: userData || {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.name || data.user.email?.split('@')[0]
        },
        isValid: true
      }
    });
  } catch (error) {
    next(error);
  }
}; 