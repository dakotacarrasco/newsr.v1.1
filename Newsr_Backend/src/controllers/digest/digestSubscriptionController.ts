import { Request, Response, NextFunction } from 'express';
import { supabase } from '../services/supabase';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

/**
 * Subscribe to city digest
 */
export const subscribeToDigest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { cityCode } = req.params;
    const { deliveryEmail = true, deliveryPush = false, frequency = 'daily' } = req.body;
    const userId = req.user.id;
    
    // Validate frequency
    if (!['daily', 'weekly'].includes(frequency)) {
      throw new AppError('Frequency must be either "daily" or "weekly"', 400);
    }
    
    // Check if city exists
    const { data: city, error: cityError } = await supabase
      .from('cities')
      .select('city_code')
      .eq('city_code', cityCode)
      .single();
    
    if (cityError || !city) {
      throw new AppError('City not found', 404);
    }
    
    // Check if subscription already exists
    const { data: existingSub, error: subError } = await supabase
      .from('digest_subscriptions')
      .select('id')
      .eq('user_id', userId)
      .eq('city_code', cityCode)
      .single();
    
    if (existingSub) {
      // Update existing subscription
      const { data, error } = await supabase
        .from('digest_subscriptions')
        .update({
          delivery_email: deliveryEmail,
          delivery_push: deliveryPush,
          frequency
        })
        .eq('id', existingSub.id)
        .select()
        .single();
      
      if (error) {
        throw new AppError(error.message, 400);
      }
      
      res.status(200).json({
        status: 'success',
        data: {
          subscription: data,
          message: 'Subscription updated'
        }
      });
    } else {
      // Create new subscription
      const { data, error } = await supabase
        .from('digest_subscriptions')
        .insert({
          user_id: userId,
          city_code: cityCode,
          delivery_email: deliveryEmail,
          delivery_push: deliveryPush,
          frequency
        })
        .select()
        .single();
      
      if (error) {
        throw new AppError(error.message, 400);
      }
      
      // Update user preferences to include this location
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('preferences')
        .eq('id', userId)
        .single();
      
      if (!userError && userData) {
        const preferences = userData.preferences || {};
        const locations = preferences.locations || [];
        
        if (!locations.includes(cityCode)) {
          preferences.locations = [...locations, cityCode];
          
          await supabase
            .from('users')
            .update({ preferences })
            .eq('id', userId);
        }
      }
      
      res.status(201).json({
        status: 'success',
        data: {
          subscription: data,
          message: 'Successfully subscribed to digest'
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Unsubscribe from city digest
 */
export const unsubscribeFromDigest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { cityCode } = req.params;
    const userId = req.user.id;
    
    // Delete subscription
    const { error } = await supabase
      .from('digest_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('city_code', cityCode);
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        message: 'Successfully unsubscribed from digest'
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's digest subscriptions
 */
export const getUserDigestSubscriptions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const userId = req.user.id;
    
    // Get subscriptions with city information
    const { data, error } = await supabase
      .from('digest_subscriptions')
      .select(`
        id,
        city_code,
        delivery_email,
        delivery_push,
        frequency,
        created_at,
        cities (
          name,
          region
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        subscriptions: data || []
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update digest subscription preferences
 */
export const updateDigestSubscription = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      throw new AppError('Unauthorized', 401);
    }
    
    const { cityCode } = req.params;
    const { deliveryEmail, deliveryPush, frequency } = req.body;
    const userId = req.user.id;
    
    // Validate frequency if provided
    if (frequency && !['daily', 'weekly'].includes(frequency)) {
      throw new AppError('Frequency must be either "daily" or "weekly"', 400);
    }
    
    // Prepare update data
    const updateData: any = {};
    if (deliveryEmail !== undefined) updateData.delivery_email = deliveryEmail;
    if (deliveryPush !== undefined) updateData.delivery_push = deliveryPush;
    if (frequency) updateData.frequency = frequency;
    
    // Update subscription
    const { data, error } = await supabase
      .from('digest_subscriptions')
      .update(updateData)
      .eq('user_id', userId)
      .eq('city_code', cityCode)
      .select()
      .single();
    
    if (error) {
      throw new AppError(error.message, 400);
    }
    
    if (!data) {
      throw new AppError('Subscription not found', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        subscription: data
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get latest digest for a city
 */
export const getLatestCityDigest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cityCode } = req.params;
    
    // Get latest digest for the city
    const { data, error } = await supabase
      .from('city_digests')
      .select('*')
      .eq('city_code', cityCode)
      .eq('status', 'active')
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      throw new AppError('No active digest found for this city', 404);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        digest: data
      }
    });
  } catch (error) {
    next(error);
  }
}; 