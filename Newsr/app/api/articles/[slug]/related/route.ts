import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { supabase } = await import('@/lib/supabase');
    
    // First get the article's category and keywords from the slug
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, category, keywords')
      .eq('slug', slug)
      .single();
    
    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Now get related articles based on category and keywords
    let query = supabase
      .from('articles')
      .select('*')
      .neq('id', article.id) // Exclude the current article
      .eq('category', article.category)
      .order('published_at', { ascending: false })
      .limit(3);
    
    // If the article has keywords, we can use them to find more relevant articles
    if (article.keywords && article.keywords.length > 0) {
      query = query.or(article.keywords.map((k: string) => `keywords.cs.{${k}}`).join(','));
    }
    
    const { data: relatedArticles, error } = await query;
    
    if (error) throw error;
    
    return NextResponse.json(relatedArticles);
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return NextResponse.json({ error: 'Failed to fetch related articles' }, { status: 500 });
  }
}
