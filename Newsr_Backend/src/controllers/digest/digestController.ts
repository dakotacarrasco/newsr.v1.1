import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../config/supabaseClient';
import AppError from '../../utils/appError';
import { sendDigestToSubscribers } from '../utils/sendDigestToSubscribers';
import logger from '../../utils/logger';
import { DigestSubscriptionService } from '../../services/digestSubscriptionService';
import { DigestSendingService } from '../../services/digestSendingService';

/**
 * Manually trigger sending digests (admin only)
 */
export const triggerDigestSending = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { frequency, cityCode } = req.body;
    
    if (!frequency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required field: frequency' 
      });
    }
    
    if (!['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Frequency must be either "daily" or "weekly"' 
      });
    }
    
    // If cityCode is provided, send digest for just that city
    if (cityCode) {
      const campaignId = await DigestSendingService.sendDigests(frequency as 'daily' | 'weekly');
      
      return res.status(200).json({ 
        success: true, 
        message: `Digest sending triggered for ${cityCode}`, 
        results: campaignId 
      });
    } else {
      // Send digests for all cities
      const results = await DigestSendingService.sendDigests(frequency as 'daily' | 'weekly');
      
      return res.status(200).json({ 
        success: true, 
        message: `Digest sending triggered for all cities`, 
        results 
      });
    }
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while triggering digest sending' 
    });
  }
};

/**
 * Get digest delivery statistics
 */
export const getDigestStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get counts by status
    const { data: statusCounts, error: statusError } = await supabase
      .from('digest_delivery_logs')
      .select('status, count(*)')
      .group('status');
    
    if (statusError) {
      throw new AppError(`Error fetching status counts: ${statusError.message}`, 500);
    }
    
    // Get counts by city
    const { data: cityCounts, error: cityError } = await supabase
      .from('digest_delivery_logs')
      .select('city_code, count(*)')
      .eq('status', 'sent')
      .group('city_code');
    
    if (cityError) {
      throw new AppError(`Error fetching city counts: ${cityError.message}`, 500);
    }
    
    // Get recent deliveries
    const { data: recentDeliveries, error: recentError } = await supabase
      .from('digest_delivery_logs')
      .select(`
        id,
        email,
        city_code,
        frequency,
        status,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (recentError) {
      throw new AppError(`Error fetching recent deliveries: ${recentError.message}`, 500);
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        statusCounts: statusCounts || [],
        cityCounts: cityCounts || [],
        recentDeliveries: recentDeliveries || []
      }
    });
    
  } catch (error) {
    next(error);
  }
};

export const subscribeToDigest = async (req: Request, res: Response) => {
  try {
    const { userId, cityCode, frequency } = req.body;
    
    if (!userId || !cityCode || !frequency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userId, cityCode, frequency' 
      });
    }
    
    if (!['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Frequency must be either "daily" or "weekly"' 
      });
    }
    
    const success = await DigestSubscriptionService.subscribeToDigest(
      userId, 
      cityCode, 
      frequency as 'daily' | 'weekly'
    );
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: `Successfully subscribed to ${frequency} digest for ${cityCode}` 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to subscribe to digest' 
      });
    }
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while subscribing to digest' 
    });
  }
};

export const unsubscribeFromDigest = async (req: Request, res: Response) => {
  try {
    const { userId, cityCode, frequency } = req.body;
    
    if (!userId || !cityCode || !frequency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userId, cityCode, frequency' 
      });
    }
    
    const success = await DigestSubscriptionService.unsubscribeFromDigest(
      userId, 
      cityCode, 
      frequency as 'daily' | 'weekly'
    );
    
    if (success) {
      return res.status(200).json({ 
        success: true, 
        message: `Successfully unsubscribed from ${frequency} digest for ${cityCode}` 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to unsubscribe from digest' 
      });
    }
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while unsubscribing from digest' 
    });
  }
};

export const getUserSubscriptions = async (req: Request, res: Response) => {
  try {
    const userId = req.params.userId;
    
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required parameter: userId' 
      });
    }
    
    const subscriptions = await DigestSubscriptionService.getUserSubscriptions(userId);
    
    return res.status(200).json({ 
      success: true, 
      data: subscriptions 
    });
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while getting user subscriptions' 
    });
  }
};

export const sendTestDigest = async (req: Request, res: Response) => {
  try {
    const { userId, cityCode, frequency } = req.body;
    
    if (!userId || !cityCode || !frequency) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userId, cityCode, frequency' 
      });
    }
    
    if (!['daily', 'weekly'].includes(frequency)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Frequency must be either "daily" or "weekly"' 
      });
    }
    
    const campaignId = await DigestSendingService.sendTestDigest(
      userId, 
      cityCode, 
      frequency as 'daily' | 'weekly'
    );
    
    if (campaignId) {
      return res.status(200).json({ 
        success: true, 
        message: `Test digest sent successfully`, 
        campaignId 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send test digest' 
      });
    }
  } catch (error: any) {
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'An error occurred while sending test digest' 
    });
  }
}; 