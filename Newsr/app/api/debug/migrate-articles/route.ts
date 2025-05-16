import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase/client'
import { generateSlug } from '@/app/lib/services/topicServices'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const execute = searchParams.get('execute') === 'true';
    
    const results: any = {
      status: execute ? 'migrating' : 'preview',
      timestamp: new Date().toISOString(),
      operation: execute ? 'execute' : 'preview',
      articles_to_migrate: [],
      migrated: [],
      errors: []
    };
    
    // Check if legacy articles table exists
    const { data: articles, error: articlesError, count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .limit(100);
    
    if (articlesError) {
      if (articlesError.message === 'relation "articles" does not exist') {
        return NextResponse.json({
          status: 'skipped',
          message: 'Legacy articles table does not exist',
          timestamp: new Date().toISOString()
        });
      } else {
        throw articlesError;
      }
    }
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({
        status: 'skipped',
        message: 'No articles to migrate in the legacy table',
        timestamp: new Date().toISOString()
      });
    }
    
    results.source_count = articlesCount || 0;
    
    // Check which articles are not already in topic_articles
    const articleIds = articles.map(a => a.id);
    
    const { data: existingTopicArticles, error: existingError } = await supabase
      .from('topic_articles')
      .select('id')
      .in('id', articleIds);
    
    if (existingError) {
      throw existingError;
    }
    
    // Create a set of existing IDs for faster lookup
    const existingIds = new Set(existingTopicArticles?.map(a => a.id) || []);
    
    // Filter out articles that already exist in topic_articles
    const articlesToMigrate = articles.filter(a => !existingIds.has(a.id));
    
    results.articles_to_migrate = articlesToMigrate.map(a => ({
      id: a.id,
      title: a.title,
      category: a.category || a.section || 'general'
    }));
    
    if (articlesToMigrate.length === 0) {
      results.status = 'skipped';
      results.message = 'All articles already exist in topic_articles';
      return NextResponse.json(results);
    }
    
    // If not executing, just return the preview
    if (!execute) {
      results.message = `Found ${articlesToMigrate.length} articles to migrate. Add ?execute=true to perform the migration.`;
      return NextResponse.json(results);
    }
    
    // Perform the migration
    for (const article of articlesToMigrate) {
      try {
        // Map the legacy article schema to topic_articles schema
        const mappedArticle = {
          id: article.id,
          title: article.title,
          category: article.category || article.section || 'general',
          topic: Array.isArray(article.keywords) && article.keywords.length > 0 
            ? article.keywords[0] 
            : (article.category || article.section || 'general'),
          content: article.content || '',
          summary: article.description || null,
          headline: article.title,
          image_url: article.image_url || null,
          publication_date: article.published_at || new Date().toISOString(),
          slug: article.slug || generateSlug(article.title),
          source_url: null,
          source_name: null,
          is_generated: false,
          requires_subscription: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        // Insert into topic_articles
        const { error: insertError } = await supabase
          .from('topic_articles')
          .insert(mappedArticle);
        
        if (insertError) {
          results.errors.push({
            article_id: article.id,
            error: insertError.message
          });
        } else {
          results.migrated.push({
            id: article.id,
            title: article.title,
            slug: mappedArticle.slug,
            category: mappedArticle.category
          });
        }
      } catch (error: any) {
        results.errors.push({
          article_id: article.id,
          error: error.message || 'Unknown error during migration'
        });
      }
    }
    
    results.status = 'completed';
    results.summary = {
      total_to_migrate: articlesToMigrate.length,
      successfully_migrated: results.migrated.length,
      errors: results.errors.length
    };
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error migrating articles:', error);
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
} 