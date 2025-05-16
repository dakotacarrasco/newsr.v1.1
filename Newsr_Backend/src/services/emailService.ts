import nodemailer from 'nodemailer';
import mailchimp from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';
import { supabase } from './supabase';
import logger from '../utils/logger';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import cron from 'node-cron';
import { generateDigestEmailTemplate } from '../../src/mailchimp/tests/generateEmailTemplate';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Initialize Mailchimp
mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY || '',
  server: process.env.MAILCHIMP_SERVER_PREFIX || '',
});

const audienceId = process.env.MAILCHIMP_AUDIENCE_ID || '';

// Map of city codes to names
const CITY_NAMES: Record<string, string> = {
  'seattle': 'Seattle',
  'portland': 'Portland',
  'sanfrancisco': 'San Francisco',
  'losangeles': 'Los Angeles',
  'newyork': 'New York',
  'chicago': 'Chicago',
  // Add more cities as needed
};

export class EmailService {
  // Scheduler properties
  private static dailyJob: cron.ScheduledTask | null = null;
  private static weeklyJob: cron.ScheduledTask | null = null;

  // ====================================
  // CORE EMAIL FUNCTIONALITY
  // ====================================
  
  /**
   * Send direct email using nodemailer
   */
  static async sendDirectEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"City Digest" <digest@example.com>',
        to,
        subject,
        html: htmlContent,
      });

      logger.info('Email sent successfully', { messageId: info.messageId });
      return true;
    } catch (error) {
      logger.error('Failed to send email', { error });
      return false;
    }
  }
  
  /**
   * Send email via Mailchimp
   */
  static async sendViaMailchimp(to: string, subject: string, htmlContent: string): Promise<string | null> {
    try {
      // Generate subscriber hash
      const subscriberHash = crypto
        .createHash('md5')
        .update(to.toLowerCase())
        .digest('hex');
      
      // Create a campaign
      const campaignData = {
        type: 'regular',
        recipients: {
          list_id: audienceId,
          segment_opts: {
            match: 'all',
            conditions: [{
              condition_type: 'EmailAddress',
              op: 'is',
              field: 'EMAIL',
              value: to
            }]
          }
        },
        settings: {
          subject_line: subject,
          title: `Email to ${to}`,
          from_name: 'City Digest',
          reply_to: process.env.EMAIL_REPLY_TO || 'noreply@example.com'
        }
      };
      
      const campaign = await mailchimp.campaigns.create(campaignData as any);
      const campaignId = (campaign as any).id;
      
      // Set content
      await mailchimp.campaigns.setContent(campaignId, {
        html: htmlContent
      });
      
      // Send the campaign
      await mailchimp.campaigns.send(campaignId);
      
      logger.info('Mailchimp email sent successfully', { campaignId });
      return campaignId;
    } catch (error) {
      logger.error('Failed to send email via Mailchimp', { error });
      return null;
    }
  }

  // ====================================
  // CONTACT/SUBSCRIBER MANAGEMENT
  // ====================================
  
  /**
   * Add or update a contact in Mailchimp
   */
  static async addOrUpdateContact(
    email: string,
    firstName: string,
    lastName: string,
    tags: string[] = []
  ): Promise<boolean> {
    try {
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');
      
      try {
        // Check if the contact already exists
        await mailchimp.lists.getListMember(audienceId, subscriberHash);
        
        // Update the existing contact
        await mailchimp.lists.updateListMember(audienceId, subscriberHash, {
          email_address: email,
          merge_fields: {
            FNAME: firstName,
            LNAME: lastName
          },
          tags: tags
        });
      } catch (error: any) {
        if (error.status === 404) {
          // Contact doesn't exist, add them
          await mailchimp.lists.addListMember(audienceId, {
            email_address: email,
            status: "subscribed",
            merge_fields: {
              FNAME: firstName,
              LNAME: lastName
            },
            tags: tags
          });
        } else {
          throw error;
        }
      }
      
      return true;
    } catch (error) {
      logger.error('Error adding/updating contact', { email, error });
      return false;
    }
  }
  
  /**
   * Add user to city segment in Mailchimp
   */
  static async addUserToCitySegment(
    email: string,
    cityCode: string,
    cityName: string,
    frequency: 'daily' | 'weekly'
  ): Promise<boolean> {
    try {
      // Create segment if it doesn't exist
      const segmentName = `${cityName} ${frequency} digest`;
      
      // Find or create segment
      const response = await mailchimp.lists.segments.list(audienceId);
      let segment = (response.segments as any[]).find(s => s.name === segmentName);
      
      if (!segment) {
        // Create new segment
        const newSegment = await mailchimp.lists.segments.create(audienceId, {
          name: segmentName,
          static_segment: []
        });
        segment = newSegment;
      }
      
      // Add user to segment
      await mailchimp.lists.updateListMember(
        audienceId,
        segment.id,
        {
          email_address: email
        }
      );
      
      return true;
    } catch (error) {
      logger.error('Error adding user to city segment', { email, cityCode, error });
      return false;
    }
  }
  
  /**
   * Remove user from city segment in Mailchimp
   */
  static async removeUserFromCitySegment(
    email: string,
    cityCode: string,
    cityName: string,
    frequency: 'daily' | 'weekly'
  ): Promise<boolean> {
    try {
      const segmentName = `${cityName} ${frequency} digest`;
      
      // Find segment
      const response = await mailchimp.lists.segments.list(audienceId);
      const segment = (response.segments as any[]).find(s => s.name === segmentName);
      
      if (!segment) {
        return true; // Nothing to remove from
      }
      
      // Remove user from segment
      await mailchimp.lists.removeListMember(
        audienceId,
        segment.id,
        {
          email_address: email
        }
      );
      
      return true;
    } catch (error) {
      logger.error('Error removing user from city segment', { email, cityCode, error });
      return false;
    }
  }
  
  // ====================================
  // SUBSCRIPTION MANAGEMENT
  // ====================================
  
  /**
   * Subscribe a user to a city digest
   */
  static async subscribeToDigest(
    userId: string,
    cityCode: string,
    frequency: 'daily' | 'weekly'
  ): Promise<boolean> {
    try {
      // Validate city code
      if (!CITY_NAMES[cityCode]) {
        throw new Error(`Invalid city code: ${cityCode}`);
      }
      
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();
      
      if (userError || !user) {
        throw new Error(`User not found: ${userError?.message}`);
      }
      
      // Parse name into first and last
      const nameParts = user.name?.split(' ') || [''];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      // Add or update user in Mailchimp
      const mailchimpSuccess = await this.addOrUpdateContact(
        user.email,
        firstName,
        lastName,
        [`city:${cityCode}`, `frequency:${frequency}`]
      );
      
      if (!mailchimpSuccess) {
        logger.warn(`Could not add/update user ${user.email} in Mailchimp`);
        // Continue anyway to add the subscription in our database
      }
      
      // Add user to city segment in Mailchimp
      await this.addUserToCitySegment(
        user.email,
        cityCode,
        CITY_NAMES[cityCode],
        frequency
      );
      
      // Check if subscription already exists
      const { data: existingSub } = await supabase
        .from('digest_subscriptions')
        .select('id')
        .eq('user_id', userId)
        .eq('city_code', cityCode)
        .eq('frequency', frequency)
        .single();
      
      if (existingSub) {
        // Subscription already exists, update status if needed
        await supabase
          .from('digest_subscriptions')
          .update({ status: 'active' })
          .eq('id', existingSub.id);
      } else {
        // Create new subscription
        await supabase
          .from('digest_subscriptions')
          .insert({
            user_id: userId,
            city_code: cityCode,
            frequency: frequency,
            status: 'active'
          });
      }
      
      return true;
    } catch (error) {
      logger.error('Error subscribing to digest', { userId, cityCode, frequency, error });
      return false;
    }
  }
  
  /**
   * Unsubscribe a user from a city digest
   */
  static async unsubscribeFromDigest(
    userId: string,
    cityCode: string,
    frequency: 'daily' | 'weekly'
  ): Promise<boolean> {
    try {
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email')
        .eq('id', userId)
        .single();
      
      if (userError || !user) {
        throw new Error(`User not found: ${userError?.message}`);
      }
      
      // Remove user from city segment in Mailchimp
      if (CITY_NAMES[cityCode]) {
        await this.removeUserFromCitySegment(
          user.email,
          cityCode,
          CITY_NAMES[cityCode],
          frequency
        );
      }
      
      // Update subscription status
      await supabase
        .from('digest_subscriptions')
        .update({ status: 'inactive' })
        .eq('user_id', userId)
        .eq('city_code', cityCode)
        .eq('frequency', frequency);
      
      return true;
    } catch (error) {
      logger.error('Error unsubscribing from digest', { userId, cityCode, frequency, error });
      return false;
    }
  }
  
  /**
   * Get all active subscriptions for a user
   */
  static async getUserSubscriptions(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('digest_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active');
      
      if (error) {
        throw error;
      }
      
      return data || [];
    } catch (error) {
      logger.error('Error getting user subscriptions', { userId, error });
      return [];
    }
  }
  
  // ====================================
  // DIGEST SENDING
  // ====================================
  
  /**
   * Send city digest to subscribers
   */
  static async sendCityDigest(
    cityCode: string,
    cityName: string,
    content: any,
    frequency: 'daily' | 'weekly',
    options: any = {}
  ): Promise<string | null> {
    try {
      // Create the template for this digest
      const htmlContent = generateDigestEmailTemplate(
        cityName,
        content,
        {
          date: options.date || new Date().toLocaleDateString(),
          headline: options.headline || `${cityName} ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Digest`
        }
      );
      
      // Find the segment for this city and frequency
      const segmentName = `${cityName} ${frequency} digest`;
      
      const response = await mailchimp.lists.segments.list(audienceId);
      const segment = (response.segments as any[]).find(s => s.name === segmentName);
      
      if (!segment) {
        logger.warn(`No segment found for ${segmentName}`);
        return null;
      }
      
      // Create the campaign
      const campaignData = {
        type: 'regular',
        recipients: {
          list_id: audienceId,
          segment_opts: {
            saved_segment_id: segment.id
          }
        },
        settings: {
          subject_line: options.headline || `${cityName} ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Digest`,
          title: `${cityName} ${frequency} digest - ${new Date().toLocaleDateString()}`,
          from_name: 'City Digest',
          reply_to: process.env.EMAIL_REPLY_TO || 'noreply@example.com'
        }
      };
      
      const campaign = await mailchimp.campaigns.create(campaignData as any);
      const campaignId = (campaign as any).id;
      
      // Set campaign content
      await mailchimp.campaigns.setContent(campaignId, {
        html: htmlContent
      });
      
      // Send the campaign
      await mailchimp.campaigns.send(campaignId);
      
      return campaignId;
    } catch (error) {
      logger.error('Error sending city digest', { cityCode, frequency, error });
      return null;
    }
  }
  
  /**
   * Send digests for all cities with the specified frequency
   */
  static async sendDigests(frequency: 'daily' | 'weekly'): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};
    
    try {
      // Get all cities with active digests
      const { data: cityDigests, error } = await supabase
        .from('city_digests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Group digests by city
      const digestsByCity: Record<string, any> = {};
      
      cityDigests?.forEach(digest => {
        if (!digestsByCity[digest.city_code] || 
            new Date(digest.created_at) > new Date(digestsByCity[digest.city_code].created_at)) {
          digestsByCity[digest.city_code] = digest;
        }
      });
      
      // Send digest for each city
      for (const cityCode of Object.keys(digestsByCity)) {
        if (!CITY_NAMES[cityCode]) continue;
        
        const digest = digestsByCity[cityCode];
        const cityName = CITY_NAMES[cityCode];
        
        // Check if there are subscribers for this city and frequency
        const { count, error: countError } = await supabase
          .from('digest_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('city_code', cityCode)
          .eq('frequency', frequency)
          .eq('status', 'active');
        
        if (countError) {
          logger.error(`Error checking subscribers for ${cityCode}:`, { error: countError });
          results[cityCode] = null;
          continue;
        }
        
        if (!count || count === 0) {
          logger.info(`No subscribers for ${cityName} ${frequency} digest, skipping`);
          results[cityCode] = 'no_subscribers';
          continue;
        }
        
        // Send the digest
        const campaignId = await this.sendCityDigest(
          cityCode,
          cityName,
          digest.content,
          frequency,
          {
            headline: digest.headline,
            date: new Date(digest.date).toLocaleDateString('en-US', {
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })
          }
        );
        
        results[cityCode] = campaignId;
        
        if (campaignId) {
          // Log successful delivery
          await supabase.from('digest_delivery_logs').insert({
            city_code: cityCode,
            digest_id: digest.id,
            campaign_id: campaignId,
            frequency: frequency,
            status: 'sent'
          });
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error sending digests', { error });
      return results;
    }
  }
  
  /**
   * Send a test digest to a specific user
   */
  static async sendTestDigest(
    userId: string,
    cityCode: string,
    frequency: 'daily' | 'weekly'
  ): Promise<string | null> {
    try {
      // Get user details
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('email, name')
        .eq('id', userId)
        .single();
      
      if (userError || !user) {
        throw new Error(`User not found: ${userError?.message}`);
      }
      
      // Get the latest digest for this city
      const { data: cityDigest, error: digestError } = await supabase
        .from('city_digests')
        .select('*')
        .eq('city_code', cityCode)
        .eq('status', 'active')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      if (digestError) {
        logger.error('Error fetching digest', { error: digestError });
        return null;
      }
      
      if (!CITY_NAMES[cityCode]) {
        throw new Error(`Invalid city code: ${cityCode}`);
      }
      
      // Parse name into first and last
      const nameParts = user.name?.split(' ') || [''];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');
      
      // Add or update user in Mailchimp
      await this.addOrUpdateContact(
        user.email,
        firstName,
        lastName
      );
      
      // Create a test campaign just for this user
      const campaignData = {
        type: 'regular',
        recipients: {
          list_id: audienceId,
          segment_opts: {
            match: 'all',
            conditions: [{
              condition_type: 'EmailAddress',
              op: 'is',
              field: 'EMAIL',
              value: user.email
            }]
          }
        },
        settings: {
          subject_line: cityDigest.headline || `[TEST] ${CITY_NAMES[cityCode]} ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Digest`,
          title: `Test ${CITY_NAMES[cityCode]} digest for ${user.email}`,
          from_name: 'City Digest',
          reply_to: 'dakota@newsr.io'
        }
      };
      
      const campaign = await mailchimp.campaigns.create(campaignData as any);
      const campaignId = (campaign as any).id;
      
      // Set campaign content BEFORE sending
      await mailchimp.campaigns.setContent(campaignId, {
        html: generateDigestEmailTemplate(CITY_NAMES[cityCode], cityDigest.content, {
          userName: firstName,
          date: new Date(cityDigest.date).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          headline: cityDigest.headline || `${CITY_NAMES[cityCode]} ${frequency.charAt(0).toUpperCase() + frequency.slice(1)} Digest`
        })
      });
      
      // Send the campaign AFTER setting content
      await mailchimp.campaigns.send(campaignId);
      
      // Log test delivery
      await supabase.from('digest_delivery_logs').insert({
        user_id: userId,
        city_code: cityCode,
        digest_id: cityDigest.id,
        email: user.email,
        campaign_id: campaignId,
        frequency: frequency,
        status: 'test_sent'
      });
      
      return campaignId;
    } catch (error) {
      logger.error('Error sending test digest', { error });
      return null;
    }
  }

  /**
   * Production testing workflow - sends test digests to team members before sending to subscribers
   */
  static async runProductionTestSequence(
    cityCode: string,
    frequency: 'daily' | 'weekly'
  ): Promise<boolean> {
    try {
      // 1. Get the latest digest for this city
      const { data: cityDigest, error: digestError } = await supabase
        .from('city_digests')
        .select('*')
        .eq('city_code', cityCode)
        .eq('status', 'active')
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      if (digestError || !cityDigest) {
        logger.error('No active digest found', { cityCode });
        return false;
      }
      
      // 2. Send test digest to internal team members
      const testTeamIds = process.env.TEST_TEAM_USER_IDS?.split(',') || [];
      const testResults = await Promise.all(
        testTeamIds.map(userId => 
          this.sendTestDigest(userId, cityCode, frequency)
        )
      );
      
      // 3. Log results
      const allTestsSucceeded = testResults.every(result => result !== null);
      logger.info(`Test digests for ${CITY_NAMES[cityCode]}`, { success: allTestsSucceeded });
      
      return allTestsSucceeded;
    } catch (error) {
      logger.error('Error running production test sequence', { error });
      return false;
    }
  }

  /**
   * Enhanced digest sending process with testing
   */
  static async sendDigestsWithTesting(frequency: 'daily' | 'weekly'): Promise<Record<string, string | null>> {
    const results: Record<string, string | null> = {};
    
    try {
      // Get all cities with active digests
      const { data: cityDigests, error } = await supabase
        .from('city_digests')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Group digests by city
      const digestsByCity: Record<string, any> = {};
      
      cityDigests?.forEach(digest => {
        if (!digestsByCity[digest.city_code] || 
            new Date(digest.created_at) > new Date(digestsByCity[digest.city_code].created_at)) {
          digestsByCity[digest.city_code] = digest;
        }
      });
      
      // Process each city
      for (const cityCode of Object.keys(digestsByCity)) {
        if (!CITY_NAMES[cityCode]) continue;
        
        logger.info(`Processing ${CITY_NAMES[cityCode]} ${frequency} digest...`);
        
        // 1. Run test sequence first
        const testsPassed = await this.runProductionTestSequence(cityCode, frequency);
        
        if (!testsPassed) {
          logger.error(`Tests failed for ${CITY_NAMES[cityCode]}, skipping send`);
          results[cityCode] = 'test_failed';
          continue;
        }
        
        // 2. Check if there are subscribers
        const { count, error: countError } = await supabase
          .from('digest_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('city_code', cityCode)
          .eq('frequency', frequency)
          .eq('status', 'active');
        
        if (countError || !count || count === 0) {
          logger.info(`No subscribers for ${CITY_NAMES[cityCode]} ${frequency} digest, skipping`);
          results[cityCode] = 'no_subscribers';
          continue;
        }
        
        // 3. Now proceed with the actual send
        const digest = digestsByCity[cityCode];
        const campaignId = await this.sendCityDigest(
          cityCode,
          CITY_NAMES[cityCode],
          digest.content,
          frequency,
          {
            headline: digest.headline,
            date: new Date(digest.date).toLocaleDateString('en-US', {
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric'
            })
          }
        );
        
        results[cityCode] = campaignId;
        
        if (campaignId) {
          // Log successful delivery
          await supabase.from('digest_delivery_logs').insert({
            city_code: cityCode,
            digest_id: digest.id,
            campaign_id: campaignId,
            frequency: frequency,
            status: 'sent'
          });
        }
      }
      
      return results;
    } catch (error) {
      logger.error('Error sending digests with testing', { error });
      return results;
    }
  }
  
  // ====================================
  // SCHEDULING
  // ====================================
  
  /**
   * Start the digest scheduler
   */
  static startScheduler(): void {
    // Schedule daily digests at 7:00 AM
    this.dailyJob = cron.schedule('0 7 * * *', async () => {
      logger.info('Running scheduled daily digest job');
      try {
        const results = await this.sendDigests('daily');
        logger.info('Daily digest job completed', { results });
      } catch (error) {
        logger.error('Error in daily digest job', { error });
      }
    });
    
    // Schedule weekly digests at 8:00 AM on Sundays
    this.weeklyJob = cron.schedule('0 8 * * 0', async () => {
      logger.info('Running scheduled weekly digest job');
      try {
        const results = await this.sendDigests('weekly');
        logger.info('Weekly digest job completed', { results });
      } catch (error) {
        logger.error('Error in weekly digest job', { error });
      }
    });
    
    logger.info('Digest scheduler started');
  }
  
  /**
   * Stop the digest scheduler
   */
  static stopScheduler(): void {
    if (this.dailyJob) {
      this.dailyJob.stop();
      this.dailyJob = null;
    }
    
    if (this.weeklyJob) {
      this.weeklyJob.stop();
      this.weeklyJob = null;
    }
    
    logger.info('Digest scheduler stopped');
  }
  
  /**
   * Check if the scheduler is running
   */
  static isSchedulerRunning(): boolean {
    return !!(this.dailyJob || this.weeklyJob);
  }
}

// CLI script exports for direct execution
export const cliHandlers = {
  sendTestEmail: async (to: string, subject: string, content: string) => {
    return EmailService.sendDirectEmail(to, subject, content);
  },
  
  sendTestDigest: async (userId: string, cityCode: string, frequency: 'daily' | 'weekly') => {
    return EmailService.sendTestDigest(userId, cityCode, frequency);
  },
  
  sendDigests: async (frequency: 'daily' | 'weekly') => {
    return EmailService.sendDigests(frequency);
  },
  
  sendDigestsWithTesting: async (frequency: 'daily' | 'weekly') => {
    return EmailService.sendDigestsWithTesting(frequency);
  }
};

// Export a standalone function for the digest scheduler
export function initializeDigestScheduler(): void {
  EmailService.startScheduler();
}
