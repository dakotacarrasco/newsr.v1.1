import mailchimp from '@mailchimp/mailchimp_marketing';
import crypto from 'crypto';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// City codes and names mapping
const CITY_NAMES: Record<string, string> = {
  'seattle': 'Seattle',
  'portland': 'Portland',
  'sanfrancisco': 'San Francisco',
  'losangeles': 'Los Angeles',
  'newyork': 'New York',
  'chicago': 'Chicago',
};

/**
 * Service class that handles all Mailchimp operations
 */
export class MailchimpService {
  private apiKey: string;
  private serverPrefix: string;
  private audienceId: string;
  private replyTo: string;

  /**
   * Initialize the Mailchimp service with credentials
   */
  constructor(options?: {
    apiKey?: string;
    serverPrefix?: string;
    audienceId?: string;
    replyTo?: string;
  }) {
    this.apiKey = options?.apiKey || process.env.MAILCHIMP_API_KEY || '';
    this.serverPrefix = options?.serverPrefix || process.env.MAILCHIMP_SERVER_PREFIX || '';
    this.audienceId = options?.audienceId || process.env.MAILCHIMP_AUDIENCE_ID || '';
    this.replyTo = options?.replyTo || process.env.MAILCHIMP_REPLY_TO || 'dakota@newsr.io';

    // Configure Mailchimp client
    mailchimp.setConfig({
      apiKey: this.apiKey,
      server: this.serverPrefix,
    });
  }

  /**
   * Test the API connection
   */
  async testConnection(): Promise<{success: boolean, message: string}> {
    try {
      const response = await mailchimp.ping.get();
      return {
        success: true,
        message: `Connected to Mailchimp API: ${JSON.stringify(response)}`
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Failed to connect to Mailchimp: ${error.message}`
      };
    }
  }

  /**
   * Get all audiences (lists) in the account
   */
  async getAudiences(): Promise<any[]> {
    try {
      const response = await mailchimp.lists.getAllLists();
      return (response as any).lists;
    } catch (error) {
      console.error('Error fetching audiences:', error);
      return [];
    }
  }

  /**
   * Add or update a contact in Mailchimp
   */
  async addOrUpdateContact(
    email: string,
    firstName: string,
    lastName: string = '',
    tags: string[] = []
  ): Promise<{success: boolean, id?: string, message: string}> {
    try {
      // Calculate MD5 hash of lowercase email for subscriber hash
      const subscriberHash = crypto
        .createHash('md5')
        .update(email.toLowerCase())
        .digest('hex');
      
      try {
        // Check if the contact already exists
        const existingMember = await mailchimp.lists.getListMember(
          this.audienceId,
          subscriberHash
        );
        
        // Update the existing contact
        await mailchimp.lists.updateListMember(
          this.audienceId,
          subscriberHash,
          {
            merge_fields: {
              FNAME: firstName,
              LNAME: lastName
            }
          }
        );
        
        // Update tags if provided
        if (tags.length > 0) {
          await this.updateContactTags(subscriberHash, tags);
        }
        
        return {
          success: true,
          id: (existingMember as any).id,
          message: 'Contact updated successfully'
        };
      } catch (error: any) {
        if (error.status === 404) {
          // Contact doesn't exist, add them
          try {
            const addResponse = await mailchimp.lists.addListMember(this.audienceId, {
              email_address: email,
              status: "subscribed",
              merge_fields: {
                FNAME: firstName,
                LNAME: lastName
              }
            });
            
            // Add tags if provided
            if (tags.length > 0) {
              await this.updateContactTags(subscriberHash, tags);
            }
            
            return {
              success: true,
              id: (addResponse as any).id,
              message: 'Contact added successfully'
            };
          } catch (addError: any) {
            // Handle "Forgotten Email" error - user was previously unsubscribed
            if (addError.status === 400 && 
                addError.response?.body?.title === 'Forgotten Email Not Subscribed') {
              return {
                success: false,
                message: `User ${email} was previously unsubscribed and cannot be re-added automatically`
              };
            }
            throw addError;
          }
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Error managing contact: ${error.message}`
      };
    }
  }

  /**
   * Update tags for a contact
   */
  async updateContactTags(subscriberHash: string, tags: string[]): Promise<boolean> {
    try {
      const tagObjects = tags.map(tag => ({
        name: tag,
        status: 'active'
      }));
      
      await mailchimp.lists.updateListMemberTags(
        this.audienceId,
        subscriberHash,
        { tags: tagObjects }
      );
      return true;
    } catch (error) {
      console.error('Error updating contact tags:', error);
      return false;
    }
  }

  /**
   * Create and send a campaign to a specific email
   */
  async createAndSendCampaign(
    email: string,
    subject: string,
    html: string,
    options: {
      fromName?: string;
      title?: string;
    } = {}
  ): Promise<{success: boolean, campaignId?: string, message: string}> {
    try {
      // Create the campaign
      const campaignData = {
        type: 'regular',
        recipients: {
          list_id: this.audienceId,
          segment_opts: {
            match: 'all',
            conditions: [{
              condition_type: 'EmailAddress',
              op: 'is',
              field: 'EMAIL',
              value: email
            }]
          }
        },
        settings: {
          subject_line: subject,
          title: options.title || `Email to ${email}`,
          from_name: options.fromName || 'City Digest',
          reply_to: this.replyTo
        }
      };
      
      // Create the campaign
      const campaign = await mailchimp.campaigns.create(campaignData as any);
      const campaignId = (campaign as any).id;
      
      // Set campaign content
      await mailchimp.campaigns.setContent(campaignId, {
        html: html
      });
      
      // Send the campaign
      await mailchimp.campaigns.send(campaignId);
      
      return {
        success: true,
        campaignId,
        message: 'Campaign sent successfully'
      };
    } catch (error: any) {
      // Extract more detailed error information
      const errorDetail = error.response?.body?.detail || error.response?.text || error.message;
      const errorTitle = error.response?.body?.title || '';
      const errorStatus = error.status || '';
      
      // Extract field-specific errors if available
      let fieldErrors = '';
      if (error.response?.body?.errors) {
        fieldErrors = '\nField errors:\n' + JSON.stringify(error.response.body.errors, null, 2);
      }
      
      console.log('Full error response:', JSON.stringify(error.response?.body || {}, null, 2));
      
      return {
        success: false,
        message: `Failed to create and send campaign: ${errorStatus} ${errorTitle} - ${errorDetail}${fieldErrors}`
      };
    }
  }

  /**
   * Send a test email
   */
  async sendTestEmail(
    email: string,
    name: string = 'User'
  ): Promise<{success: boolean, campaignId?: string, message: string}> {
    try {
      // First ensure the contact exists
      const contactResult = await this.addOrUpdateContact(
        email, 
        name.split(' ')[0], 
        name.split(' ').slice(1).join(' ') || ''
      );
      
      if (!contactResult.success) {
        return contactResult;
      }
      
      // Create a simple HTML email - using same structure as digest email
      const simpleHtml = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
              h1 { color: #0066cc; }
              h2 { color: #0066cc; font-size: 20px; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
              .highlight { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0066cc; }
              .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
            </style>
          </head>
          <body>
            <h1>Test Email</h1>
            <p>Hello ${name},</p>
            <p>This is a test email sent at ${new Date().toLocaleString()}.</p>
            
            <div class="highlight">
              <h2>Success!</h2>
              <p>If you're seeing this email, the Mailchimp integration is working correctly!</p>
              <p>Your email feature is set up properly.</p>
            </div>
            
            <p>This email was sent via Mailchimp's API.</p>
            
            <div class="footer">
              <p>This is a test email for your system.</p>
              <p>No action is required.</p>
            </div>
          </body>
        </html>
      `;
      
      // Send the campaign - use exactly the same parameters as digest
      return await this.createAndSendCampaign(
        email,
        `Test Email - ${new Date().toLocaleDateString()}`,
        simpleHtml,
        { 
          fromName: 'City Digest', // Same as digest
          title: `Test Email for ${email}` // Similar format to digest
        }
      );
    } catch (error: any) {
      return {
        success: false,
        message: `Error sending test email: ${error.message}`
      };
    }
  }

  /**
   * Send a test digest to a specific city
   */
  async sendTestDigestEmail(
    email: string,
    cityCode: string,
    options: {
      name?: string;
      content?: string;
    } = {}
  ): Promise<{success: boolean, campaignId?: string, message: string}> {
    try {
      const cityName = CITY_NAMES[cityCode] || cityCode;
      const userName = options.name || 'User';
      
      // First ensure the contact exists
      const contactResult = await this.addOrUpdateContact(
        email,
        userName.split(' ')[0],
        userName.split(' ').slice(1).join(' ') || ''
      );
      
      if (!contactResult.success) {
        return contactResult;
      }
      
      // Use provided content or generate sample content
      const content = options.content || this.generateSampleDigestContent(cityName, userName);
      
      // Send the campaign
      return await this.createAndSendCampaign(
        email,
        `${cityName} Daily Digest - ${new Date().toLocaleDateString()}`,
        content,
        { 
          fromName: 'City Digest',
          title: `${cityName} Test Digest for ${email}`
        }
      );
    } catch (error: any) {
      return {
        success: false,
        message: `Error sending test digest: ${error.message}`
      };
    }
  }

  /**
   * Generate sample digest content for testing
   */
  private generateSampleDigestContent(cityName: string, userName: string): string {
    return `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #0066cc; }
            h2 { color: #0066cc; font-size: 20px; margin-top: 20px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .highlight { background-color: #f8f9fa; padding: 15px; border-left: 4px solid #0066cc; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${cityName} Daily Digest</h1>
          <p>Hello ${userName},</p>
          <p>Here's your daily digest for ${cityName} on ${new Date().toLocaleDateString()}.</p>
          
          <div class="highlight">
            <h2>Today's Highlights</h2>
            <p>This is a test digest email sent from our Mailchimp integration.</p>
            <p>If you're seeing this, the email service is working correctly!</p>
          </div>
          
          <h2>Weather Update</h2>
          <p>Today's forecast: Partly cloudy with a high of 68°F.</p>
          
          <h2>Local News</h2>
          <p>New park opening downtown next week.</p>
          <p>City council approves budget for road improvements.</p>
          
          <h2>Events</h2>
          <p>Community festival this weekend at Central Park.</p>
          <p>Farmers market open on Saturday from 9am to 2pm.</p>
          
          <div class="footer">
            <p>This is a test email for the City Digest system.</p>
            <p>You're receiving this because you requested a test email.</p>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Diagnose configuration issues
   */
  async diagnoseConfiguration(): Promise<{
    apiKey: {valid: boolean, message: string},
    server: {valid: boolean, message: string},
    audience: {valid: boolean, message: string},
    connection: {valid: boolean, message: string}
  }> {
    const result = {
      apiKey: {valid: false, message: ''},
      server: {valid: false, message: ''},
      audience: {valid: false, message: ''},
      connection: {valid: false, message: ''}
    };
    
    // Check API key
    if (!this.apiKey) {
      result.apiKey.message = 'API key is missing';
    } else {
      result.apiKey.valid = true;
      result.apiKey.message = `API key configured (ending in ${this.apiKey.slice(-4)})`;
    }
    
    // Check server prefix
    if (!this.serverPrefix) {
      result.server.message = 'Server prefix is missing';
    } else if (!this.serverPrefix.match(/^us\d+$/)) {
      result.server.valid = false;
      result.server.message = `Server prefix format may be incorrect: ${this.serverPrefix}. It should be something like "us17"`;
    } else {
      result.server.valid = true;
      result.server.message = `Server prefix configured: ${this.serverPrefix}`;
    }
    
    // Test connection
    try {
      const pingResponse = await mailchimp.ping.get();
      result.connection.valid = true;
      result.connection.message = `API connection successful: ${JSON.stringify(pingResponse)}`;
    } catch (error: any) {
      result.connection.message = `Failed to connect: ${error.message}`;
    }
    
    // Check audience ID
    if (!this.audienceId) {
      result.audience.message = 'Audience ID is missing';
    } else {
      try {
        // Try to get audience details
        const audienceInfo = await (mailchimp.lists as any).getList(this.audienceId);
        result.audience.valid = true;
        result.audience.message = `Audience found: ${audienceInfo.name} (${audienceInfo.id})`;
      } catch (error: any) {
        result.audience.message = `Could not verify audience ID: ${error.message}`;
      }
    }
    
    return result;
  }
} 