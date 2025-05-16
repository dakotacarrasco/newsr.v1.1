import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient<Database>(supabaseUrl, supabaseKey);

export class AnalyticsService {
  /**
   * Add tracking parameters to links in HTML content
   */
  static addTrackingToLinks(html: string, params: Record<string, string>): string {
    // Create URL parameters string
    const urlParams = Object.entries(params)
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Replace links with tracked versions
    return html.replace(
      /<a\s+(?:[^>]*?\s+)?href=["']([^"']*)["']/gi,
      (match, url) => {
        // Skip mailto: links and anchor links
        if (url.startsWith('mailto:') || url.startsWith('#') || url.includes('*|UNSUB|*')) {
          return match;
        }
        
        // Add parameters to URL
        const separator = url.includes('?') ? '&' : '?';
        return `<a href="${url}${separator}${urlParams}"`;
      }
    );
  }
  
  /**
   * Prepare HTML content with tracking
   */
  static prepareTrackedContent(
    html: string, 
    campaignId: string, 
    cityCode: string, 
    frequency: string
  ): string {
    return this.addTrackingToLinks(html, {
      utm_source: 'city_digest',
      utm_medium: 'email',
      utm_campaign: `${cityCode}_${frequency}`,
      utm_content: campaignId
    });
  }
  
  /**
   * Log email open event
   */
  static async logEmailOpen(
    campaignId: string,
    userId?: string,
    email?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await supabase.from('email_analytics').insert({
      campaign_id: campaignId,
      user_id: userId,
      email: email,
      event_type: 'open',
      metadata
    });
  }
  
  /**
   * Log email click event
   */
  static async logEmailClick(
    campaignId: string,
    linkUrl: string,
    userId?: string,
    email?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    await supabase.from('email_analytics').insert({
      campaign_id: campaignId,
      user_id: userId,
      email: email,
      event_type: 'click',
      metadata: {
        ...metadata,
        link_url: linkUrl
      }
    });
  }
  
  /**
   * Get campaign analytics summary
   */
  static async getCampaignAnalytics(campaignId: string): Promise<any> {
    // Get open count
    const { count: openCount } = await supabase
      .from('email_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('event_type', 'open');
    
    // Get click count
    const { count: clickCount } = await supabase
      .from('email_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('campaign_id', campaignId)
      .eq('event_type', 'click');
    
    // Get unique users who opened
    const { data: uniqueOpens } = await supabase
      .from('email_analytics')
      .select('user_id')
      .eq('campaign_id', campaignId)
      .eq('event_type', 'open')
      .is('user_id', 'not.null');
    
    const uniqueOpenCount = new Set(uniqueOpens?.map(item => item.user_id)).size;
    
    return {
      campaignId,
      totalOpens: openCount || 0,
      uniqueOpens: uniqueOpenCount,
      totalClicks: clickCount || 0,
      clickToOpenRate: openCount ? (clickCount || 0) / openCount : 0
    };
  }
} 