import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase/client'

export async function GET(request: Request) {
  try {
    const results: any = {
      tables: {}
    };
    
    // Check articles table
    try {
      const { data: articlesData, error: articlesError, count: articlesCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact' })
        .limit(5);
      
      results.tables.articles = {
        exists: !articlesError,
        count: articlesCount || 0,
        error: articlesError?.message,
        sample: articlesData && articlesData.length > 0 ? articlesData[0] : null,
        fields: articlesData && articlesData.length > 0 ? Object.keys(articlesData[0]) : []
      };
    } catch (e: any) {
      results.tables.articles = {
        exists: false,
        error: e.message
      };
    }
    
    // Check topic_articles table
    try {
      const { data: topicArticlesData, error: topicArticlesError, count: topicArticlesCount } = await supabase
        .from('topic_articles')
        .select('*', { count: 'exact' })
        .limit(5);
      
      results.tables.topic_articles = {
        exists: !topicArticlesError,
        count: topicArticlesCount || 0,
        error: topicArticlesError?.message,
        sample: topicArticlesData && topicArticlesData.length > 0 ? topicArticlesData[0] : null,
        fields: topicArticlesData && topicArticlesData.length > 0 ? Object.keys(topicArticlesData[0]) : []
      };
    } catch (e: any) {
      results.tables.topic_articles = {
        exists: false,
        error: e.message
      };
    }
    
    // Query articles table for a specific ID
    const { searchParams } = new URL(request.url);
    const idToFind = searchParams.get('id');
    
    if (idToFind) {
      results.search = {
        id: idToFind,
        results: {}
      };
      
      // Check in articles table
      try {
        const { data: foundInArticles, error: articlesSearchError } = await supabase
          .from('articles')
          .select('*')
          .eq('id', idToFind);
        
        results.search.results.articles = {
          found: foundInArticles && foundInArticles.length > 0,
          count: foundInArticles?.length || 0,
          data: foundInArticles,
          error: articlesSearchError?.message
        };
      } catch (e: any) {
        results.search.results.articles = {
          found: false,
          error: e.message
        };
      }
      
      // Check in topic_articles table
      try {
        const { data: foundInTopicArticles, error: topicArticlesSearchError } = await supabase
          .from('topic_articles')
          .select('*')
          .eq('id', idToFind);
        
        results.search.results.topic_articles = {
          found: foundInTopicArticles && foundInTopicArticles.length > 0,
          count: foundInTopicArticles?.length || 0,
          data: foundInTopicArticles,
          error: topicArticlesSearchError?.message
        };
      } catch (e: any) {
        results.search.results.topic_articles = {
          found: false,
          error: e.message
        };
      }
    }
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error checking tables:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 