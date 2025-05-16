import { createClient } from '@supabase/supabase-js'
import { config } from '../../lib/config'

// Debug logging
console.log('Initializing Supabase client with:')
console.log('URL:', config.supabase.url.substring(0, 10) + '...')
console.log('Key length:', config.supabase.anonKey.length)

// Create a single instance of the Supabase client
export const supabase = createClient(config.supabase.url, config.supabase.anonKey)

// Test function to verify connection with more detailed logging
export async function testDatabaseConnection() {
  try {
    console.log('Testing database connection...');
    console.log('Supabase URL:', config.supabase.url);
    console.log('Anon key length:', config.supabase.anonKey.length);
    
    // First, test a simple health check
    const { data: healthData, error: healthError } = await supabase.from('_health').select('*').limit(1);
    
    if (healthError) {
      console.error('Health check failed:', healthError);
    } else {
      console.log('Health check passed');
    }
    
    // Now try the articles table
    const { data, error } = await supabase
      .from('articles')
      .select('count(*)', { count: 'exact', head: true });
    
    if (error) {
      console.error('Database connection error:', error);
      return { 
        success: false, 
        error: error.message,
        details: {
          code: error.code,
          hint: error.hint,
          details: error.details
        }
      };
    }
    
    return { 
      success: true, 
      data,
      message: 'Successfully connected to the database'
    };
  } catch (err) {
    console.error('Unexpected error testing database connection:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error connecting to database',
      stack: err instanceof Error ? err.stack : undefined
    };
  }
}

export type Article = {
  id: string
  title: string
  content: string
  description: string | null
  category: string
  author_id: string
  published_at: string
  image_url: string | null
  keywords: string[] | null
  views: number
  likes: number
  location_id: string | null
  featured?: boolean
  position?: number
  section?: string
  topic_tags?: string[]
}

// Using direct table access instead of RPC call
export async function getLatestArticles(): Promise<Article[]> {
  try {
    console.log('Executing getLatestArticles query...');
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .order('published_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to fetch articles: ${error.message}`);
    }

    console.log('Total articles in response:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    throw error;
  }
}

export interface GetArticlesParams {
  category?: string
  author_id?: string
  keywords?: string[]
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
  orderBy?: string
  location_id?: string
}

// Use this same interface for ArticleFilters
export type ArticleFilters = GetArticlesParams

export async function getFilteredArticles({ 
  page = 1, 
  limit = 10,
  orderBy = 'published_at:desc',
  category,
  author_id,
  keywords,
  startDate,
  endDate,
  search,
  location_id
}: GetArticlesParams = {}): Promise<Article[]> {
  try {
    const [field, direction] = orderBy.split(':')
    const offset = (page - 1) * limit

    let query = supabase
      .from('articles')
      .select('*')
      
    // Apply filters
    if (category) {
      query = query.eq('category', category)
    }
    
    if (author_id) {
      query = query.eq('author_id', author_id)
    }
    
    if (location_id) {
      query = query.eq('location_id', location_id)
    }
    
    if (keywords && keywords.length > 0) {
      // For array overlap
      query = query.overlaps('keywords', keywords)
    }
    
    if (startDate) {
      query = query.gte('published_at', startDate)
    }
    
    if (endDate) {
      query = query.lte('published_at', endDate)
    }
    
    if (search) {
      // Full text search if your database supports it
      // This assumes you have a text search index on title and content
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply ordering and pagination
    const { data, error } = await query
      .order(field, { ascending: direction === 'asc' })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []

  } catch (error) {
    console.error('Failed to fetch articles:', error)
    throw error
  }
}

// Add this function to check if the articles table exists
export async function checkArticlesTable() {
  try {
    // Try to get the table definition
    const { data, error } = await supabase
      .from('articles')
      .select('id')
      .limit(1);
    
    if (error) {
      if (error.code === '42P01') { // PostgreSQL code for undefined_table
        return {
          exists: false,
          error: 'The articles table does not exist in the database'
        };
      }
      
      return {
        exists: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      exists: true,
      message: 'The articles table exists',
      sample: data
    };
  } catch (err) {
    return {
      exists: false,
      error: err instanceof Error ? err.message : 'Unknown error checking articles table',
      details: err
    };
  }
}

// Add this function to insert sample content into an article
export async function updateArticleContent(articleId: string, sampleContent: string) {
  try {
    const { data, error } = await supabase
      .from('articles')
      .update({ content: sampleContent })
      .eq('id', articleId)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating article content:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error updating article content:', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error updating article content' 
    };
  }
}

/**
 * Fetches a single article by ID from Supabase
 */
export async function getArticleById(id: string): Promise<Article | null> {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }
  
  return data;
}

/**
 * Increments the view count for an article
 */
export async function incrementArticleViews(id: string): Promise<void> {
  const { error } = await supabase.rpc('increment_article_views', { article_id: id });
  
  if (error) {
    console.error('Error incrementing views:', error);
  }
}

/**
 * Toggles like status for an article
 */
export async function toggleArticleLike(id: string, liked: boolean): Promise<boolean> {
  const { error } = await supabase
    .from('articles')
    .update({ 
      likes: liked ? supabase.rpc('increment_likes', { row_id: id }) : supabase.rpc('decrement_likes', { row_id: id }) 
    })
    .eq('id', id);
  
  if (error) {
    console.error('Error updating like status:', error);
    return false;
  }
  
  return true;
}