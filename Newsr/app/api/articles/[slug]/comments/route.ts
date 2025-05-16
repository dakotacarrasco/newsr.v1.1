import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { supabase } = await import('@/lib/supabase');
    
    // First get the article ID from the slug
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Now get the comments for this article
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*, users:user_id(name, avatar_url)')
      .eq('article_id', article.id)
      .order('created_at', { ascending: false });
    
    if (commentsError) throw commentsError;
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    const { content } = await request.json();
    const { supabase } = await import('@/lib/supabase');
    
    // Get article ID from slug
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id')
      .eq('slug', slug)
      .single();
    
    if (articleError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
    
    // Get the current user
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Insert comment
    const { data, error } = await supabase
      .from('comments')
      .insert({
        article_id: article.id,
        user_id: user.id,
        content,
        created_at: new Date().toISOString()
      })
      .select('*, users:user_id(name, avatar_url)')
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
  }
}