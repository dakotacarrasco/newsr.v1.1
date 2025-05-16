import { NextResponse } from 'next/server'
import { supabase } from '@/app/lib/supabase/client'

export async function GET(request: Request) {
  try {
    // Get the first 20 articles
    const { data, error, count } = await supabase
      .from('topic_articles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) {
      console.error('Error fetching articles:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Get the total count of articles
    const { count: totalCount, error: countError } = await supabase
      .from('topic_articles')
      .select('*', { count: 'exact', head: true });
    
    if (countError) {
      console.error('Error getting article count:', countError);
    }
    
    return NextResponse.json({
      articles: data,
      count: count,
      totalCount: totalCount,
      firstId: data && data.length > 0 ? data[0].id : null,
      idExamples: data?.slice(0, 5).map(a => a.id) || []
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 