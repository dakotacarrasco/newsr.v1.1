import { NextRequest, NextResponse } from 'next/server';
import { getFilteredArticles } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Get featured articles
    const articles = await getFilteredArticles({ 
      limit: 5,
      orderBy: 'published_at:desc',
      // Assuming you have a 'featured' boolean field in your database
      // If not, you might need to adjust this to your actual data model
      // For example, maybe articles with a certain tag are featured
    });
    
    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching featured articles:', error);
    return NextResponse.json({ error: 'Failed to fetch featured articles' }, { status: 500 });
  }
}