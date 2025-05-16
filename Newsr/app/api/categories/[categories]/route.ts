import { NextRequest, NextResponse } from 'next/server';
import { getFilteredArticles } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const { category } = params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const page = parseInt(searchParams.get('page') || '1');
    
    // Get articles for this category
    const articles = await getFilteredArticles({
      category,
      limit,
      page,
      orderBy: 'published_at:desc'
    });
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error(`Error fetching ${params.category} articles:`, error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}