import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../services/supabase';
import { AppError } from '../../middleware/errorHandler';
import { AuthRequest } from '../../middleware/auth';

/**
 * Get all locations
 */
export const getLocations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .order('name');
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        locations: data || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get location by ID or code
 */
export const getLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .or(`id.eq.${id},code.eq.${id}`)
      .single();
    
    if (error) {
      throw new AppError('Location not found', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        location: data
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get articles by location ID
 */
export const getArticlesByLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { locationId } = req.params;
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        articles: data || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's location preferences
 */
export const getUserLocationPreferences = async (
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
      .select('preferences')
      .eq('id', req.user.id)
      .single();
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    const locationPreferences = data?.preferences?.locations || [];
    
    res.status(200).json({
      status: 'success',
      data: {
        locations: locationPreferences
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user's location preferences
 */
export const updateUserLocationPreferences = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { locations } = req.body;
    
    if (!Array.isArray(locations)) {
      throw new AppError('Locations must be an array', 400);
    }
    
    // Get current user preferences
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('preferences')
      .eq('id', req.user.id)
      .single();
    
    if (fetchError) {
      throw new AppError(fetchError.message, 400);
    }
    
    // Update locations in preferences
    const preferences = {
      ...(userData?.preferences || {}),
      locations
    };
    
    // Save updated preferences
    const { data, error } = await supabase
      .from('users')
      .update({ preferences })
      .eq('id', req.user.id)
      .select('preferences')
      .single();
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        locations: data.preferences.locations
      }
    });
  } catch (error) {
    next(error);
  }
};