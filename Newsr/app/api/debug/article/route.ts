import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase/client'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const slug = searchParams.get('slug')
  
  if (!id && !slug) {
    return NextResponse.json({ error: 'Either ID or slug parameter is required' }, { status: 400 })
  }
  
  const results: any = {
    query: { id, slug },
    status: 'searching',
    timestamp: new Date().toISOString(),
    tables: {}
  }
  
  try {
    // Check topic_articles table first (primary)
    if (id) {
      const { data: topicArticleById, error: topicArticleError } = await supabase
        .from('topic_articles')
        .select('*')
        .eq('id', id)
      
      results.tables.topic_articles = {
        found: topicArticleById && topicArticleById.length > 0,
        count: topicArticleById?.length || 0,
        error: topicArticleError?.message,
        data: topicArticleById,
        fields: topicArticleById && topicArticleById.length > 0 ? Object.keys(topicArticleById[0]) : []
      }
    }
    
    // Check by slug in topic_articles if provided
    if (slug) {
      const { data: topicArticleBySlug, error: topicArticleSlugError } = await supabase
        .from('topic_articles')
        .select('*')
        .eq('slug', slug)
      
      results.tables.topic_articles_by_slug = {
        found: topicArticleBySlug && topicArticleBySlug.length > 0,
        count: topicArticleBySlug?.length || 0,
        error: topicArticleSlugError?.message,
        data: topicArticleBySlug,
        fields: topicArticleBySlug && topicArticleBySlug.length > 0 ? Object.keys(topicArticleBySlug[0]) : []
      }
    }
    
    // Check articles table (secondary)
    if (id) {
      const { data: articleById, error: articleError } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
      
      results.tables.articles = {
        found: articleById && articleById.length > 0,
        count: articleById?.length || 0,
        error: articleError?.message,
        data: articleById,
        fields: articleById && articleById.length > 0 ? Object.keys(articleById[0]) : []
      }
    }
    
    // Check by slug in articles if provided
    if (slug) {
      const { data: articleBySlug, error: articleSlugError } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
      
      results.tables.articles_by_slug = {
        found: articleBySlug && articleBySlug.length > 0,
        count: articleBySlug?.length || 0,
        error: articleSlugError?.message,
        data: articleBySlug,
        fields: articleBySlug && articleBySlug.length > 0 ? Object.keys(articleBySlug[0]) : []
      }
    }
    
    // Determine overall status
    const foundInTopicArticles = results.tables.topic_articles?.found || results.tables.topic_articles_by_slug?.found || false;
    const foundInArticles = results.tables.articles?.found || results.tables.articles_by_slug?.found || false;
    
    results.status = foundInTopicArticles ? 
      'found_in_topic_articles' : 
      (foundInArticles ? 'found_in_articles' : 'not_found');
    
    // Add recommendations
    results.recommendations = [];
    
    if (!foundInTopicArticles && !foundInArticles) {
      results.recommendations.push('Article not found in any table. Check if the ID/slug is correct.');
    } else if (foundInArticles && !foundInTopicArticles) {
      results.recommendations.push('Article found only in the legacy articles table. Consider migrating to topic_articles.');
    }
    
    return NextResponse.json(results)
  } catch (error: any) {
    console.error('Unexpected error:', error)
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      query: { id, slug },
      status: 'error'
    }, { status: 500 })
  }
} 