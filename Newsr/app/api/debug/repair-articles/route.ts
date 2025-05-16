import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase/client'
import { generateSlug } from '@/app/lib/services/topicServices'

export async function GET(request: Request) {
  try {
    const results: any = {
      checks: [],
      repairs: [],
      status: 'started',
      timestamp: new Date().toISOString()
    };
    
    // First check if there are topic_articles
    const { data: topicArticles, error: topicArticlesError, count: topicArticlesCount } = await supabase
      .from('topic_articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (topicArticlesError) {
      return NextResponse.json({ error: topicArticlesError.message }, { status: 500 });
    }
    
    results.counts = {
      topic_articles: topicArticlesCount || 0
    };
    
    // Check if there are articles in the legacy table
    const { data: articles, error: articlesError, count: articlesCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact' })
      .limit(50);
    
    if (articlesError && articlesError.message !== 'relation "articles" does not exist') {
      results.errors = { articles: articlesError.message };
    } else {
      results.counts.articles = articlesCount || 0;
    }
    
    // 1. Fix missing slugs in topic_articles
    const articlesWithoutSlugs = topicArticles?.filter(article => !article.slug && article.title) || [];
    
    if (articlesWithoutSlugs.length > 0) {
      results.checks.push({
        check: 'missing_slugs',
        found: articlesWithoutSlugs.length,
        description: 'Articles without slugs'
      });
      
      // Update articles with missing slugs
      for (const article of articlesWithoutSlugs) {
        const titleSource = article.headline || article.title;
        if (!titleSource) continue;
        
        const slug = generateSlug(titleSource);
        
        const { error: updateError } = await supabase
          .from('topic_articles')
          .update({ slug })
          .eq('id', article.id);
        
        results.repairs.push({
          type: 'add_slug',
          article_id: article.id,
          title: titleSource,
          generated_slug: slug,
          success: !updateError,
          error: updateError?.message
        });
      }
    }
    
    // 2. Fix inconsistent URLs by standardizing categories
    const articlesWithInvalidCategories = topicArticles?.filter(article => {
      // Check for valid categories from our enum
      const validCategories = ['technology', 'health', 'business', 'science', 'politics', 'environment', 'culture'];
      return !validCategories.includes(article.category);
    }) || [];
    
    if (articlesWithInvalidCategories.length > 0) {
      results.checks.push({
        check: 'invalid_categories',
        found: articlesWithInvalidCategories.length,
        description: 'Articles with invalid categories'
      });
      
      // We could add code here to fix the categories if needed
    }
    
    // 3. Check for duplicate IDs between tables
    if (articlesCount && articlesCount > 0) {
      // Get IDs from topic_articles
      const topicArticleIds = topicArticles?.map(a => a.id) || [];
      
      // Find matching IDs in articles table
      const { data: duplicateArticles, error: dupError } = await supabase
        .from('articles')
        .select('id, title, category, section')
        .in('id', topicArticleIds)
        .limit(50);
      
      if (!dupError && duplicateArticles && duplicateArticles.length > 0) {
        results.checks.push({
          check: 'duplicate_ids',
          found: duplicateArticles.length,
          description: 'Articles with same ID in both tables',
          duplicates: duplicateArticles.map(a => ({
            id: a.id, 
            title: a.title,
            category: a.category || a.section
          }))
        });
      }
    }
    
    // 4. Check for articles that should be migrated from articles to topic_articles
    if (articlesCount && articlesCount > 0) {
      results.recommendations = [
        'You have articles in both tables. Consider migrating all data to topic_articles for consistency.'
      ];
      
      // We could add migration code here if needed
    }
    
    results.status = 'completed';
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error repairing articles:', error);
    return NextResponse.json({ 
      error: error.message || 'Unknown error',
      status: 'error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fixType = searchParams.get('fix') || 'check';
    
    // Safety check - only allow specific types of fixes
    if (!['slugs', 'categories', 'check'].includes(fixType)) {
      return NextResponse.json({ error: 'Invalid fix type' }, { status: 400 });
    }
    
    // First fetch articles that need fixing
    const { data: articles, error } = await supabase
      .from('topic_articles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);  // Limit to prevent too many operations
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    if (!articles || articles.length === 0) {
      return NextResponse.json({ message: 'No articles found to fix' });
    }
    
    const results: any = {
      fix: fixType,
      processed: articles.length,
      updated: 0,
      issues: []
    };
    
    // For check mode, just report what would be fixed
    if (fixType === 'check') {
      const needsSlugFix = articles.filter(a => !a.slug && a.title).length;
      const needsCategoryFix = articles.filter(a => !a.category).length;
      
      results.fixes = {
        slugs: needsSlugFix,
        categories: needsCategoryFix
      };
      
      results.message = `Found ${needsSlugFix} articles needing slug fixes and ${needsCategoryFix} needing category fixes.`;
      return NextResponse.json(results);
    }
    
    // Apply fixes
    let updatedCount = 0;
    const updates = [];
    
    for (const article of articles) {
      const updateData: any = {};
      let needsUpdate = false;
      
      // Fix slugs
      if (fixType === 'slugs' && !article.slug && article.title) {
        updateData.slug = generateSlug(article.title);
        needsUpdate = true;
      }
      
      // Fix categories
      if (fixType === 'categories' && !article.category) {
        updateData.category = 'general';  // Default category
        needsUpdate = true;
      }
      
      // Only update if changes are needed
      if (needsUpdate) {
        try {
          const { data, error: updateError } = await supabase
            .from('topic_articles')
            .update(updateData)
            .eq('id', article.id)
            .select();
          
          if (updateError) {
            results.issues.push({
              id: article.id,
              error: updateError.message
            });
          } else {
            updatedCount++;
            updates.push({
              id: article.id,
              changes: updateData
            });
          }
        } catch (e: any) {
          results.issues.push({
            id: article.id,
            error: e.message || 'Unknown error during update'
          });
        }
      }
    }
    
    results.updated = updatedCount;
    results.updates = updates;
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Error fixing articles:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 