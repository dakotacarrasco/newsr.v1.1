import { NextRequest, NextResponse } from 'next/server';
import { getFilteredArticles } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const orderBy = searchParams.get('orderBy') || 'published_at:desc';
    
    // Get articles based on query parameters
    const articles = await getFilteredArticles({
      category: category || undefined,
      page,
      limit,
      search: search || undefined,
      orderBy,
    });
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const articleData = await request.json();
    const { supabase } = await import('@/lib/supabase');
    
    // Basic validation
    if (!articleData.title || !articleData.content) {
      return NextResponse.json({ 
        error: 'Title and content are required' 
      }, { status: 400 });
    }
    
    // Add a slug if not provided
    if (!articleData.slug) {
      articleData.slug = articleData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
    }
    
    // Insert article
    const { data, error } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single();
    
    if (error) throw error;
    
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}