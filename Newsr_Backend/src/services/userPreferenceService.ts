import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { MailchimpService } from '../utils/mailchimpService';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export interface DigestPreferences {
  frequency: 'daily' | 'weekly';
  categories?: string[];
  deliveryTime?: 'morning' | 'afternoon' | 'evening';
  includeWeather?: boolean;
  includeEvents?: boolean;
  includeNews?: boolean;
}

export class UserPreferenceService {
  /**
   * Get user's digest preferences
   */
  static async getUserPreferences(userId: string, cityCode: string): Promise<DigestPreferences | null> {
    try {
      // Get subscription
      const { data: subscription, error } = await supabase
        .from('digest_subscriptions')
        .select('*, preferences')
        .eq('user_id', userId)
        .eq('city_code', cityCode)
        .eq('status', 'active')
        .single();
      
      if (error || !subscription) {
        return null;
      }
      
      // Return preferences with defaults
      return {
        frequency: subscription.frequency || 'daily',
        categories: subscription.preferences?.categories || [],
        deliveryTime: subscription.preferences?.deliveryTime || 'morning',
        includeWeather: subscription.preferences?.includeWeather !== false,
        includeEvents: subscription.preferences?.includeEvents !== false,
        includeNews: subscription.preferences?.includeNews !== false
      };
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }
  
  /**
   * Update user's digest preferences
   */
  static async updateUserPreferences(
    userId: string, 
    cityCode: string, 
    preferences: Partial<DigestPreferences>
  ): Promise<boolean> {
    try {
      // Get user details for Mailchimp
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();
      
      if (userError || !user) {
        throw new Error(`User not found: ${userError?.message}`);
      }
      
      // Get existing subscription
      const { data: subscription, error: subError } = await supabase
        .from('digest_subscriptions')
        .select('id, frequency, preferences')
        .eq('user_id', userId)
        .eq('city_code', cityCode)
        .eq('status', 'active')
        .single();
      
      if (subError && subError.code !== 'PGRST116') { // Not found error
        throw new Error(`Error fetching subscription: ${subError.message}`);
      }
      
      // If changing frequency, update Mailchimp segments
      if (preferences.frequency && subscription && preferences.frequency !== subscription.frequency) {
        const cityName = this.getCityName(cityCode);
        
        // Remove from old frequency segment
        await MailchimpService.removeUserFromCitySegment(
          user.email,
          cityCode,
          cityName,
          subscription.frequency
        );
        
        // Add to new frequency segment
        await MailchimpService.addUserToCitySegment(
          user.email,
          cityCode,
          cityName,
          preferences.frequency
        );
      }
      
      // Update or create subscription with new preferences
      if (subscription) {
        // Merge existing preferences with new ones
        const mergedPreferences = {
          ...subscription.preferences,
          ...preferences
        };
        
        // Update existing subscription
        await supabase
          .from('digest_subscriptions')
          .update({ 
            frequency: preferences.frequency || subscription.frequency,
            preferences: mergedPreferences
          })
          .eq('id', subscription.id);
      } else {
        // Create new subscription
        await supabase
          .from('digest_subscriptions')
          .insert({
            user_id: userId,
            city_code: cityCode,
            frequency: preferences.frequency || 'daily',
            status: 'active',
            preferences
          });
        
        // Add to Mailchimp segment
        const cityName = this.getCityName(cityCode);
        await MailchimpService.addUserToCitySegment(
          user.email,
          cityCode,
          cityName,
          preferences.frequency || 'daily'
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  }
  
  /**
   * Get city name from city code
   */
  private static getCityName(cityCode: string): string {
    const CITY_NAMES: Record<string, string> = {
      'seattle': 'Seattle',
      'portland': 'Portland',
      'sanfrancisco': 'San Francisco',
      'losangeles': 'Los Angeles',
      'newyork': 'New York',
      'chicago': 'Chicago',
    };
    
    return CITY_NAMES[cityCode] || cityCode.charAt(0).toUpperCase() + cityCode.slice(1);
  }
} 