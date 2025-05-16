import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { supabase } = await import('@/lib/supabase');
    
    // Get the city details
    const { data: city, error } = await supabase
      .from('city_digests')
      .select('*')
      .eq('city_code', code)
      .order('date', { ascending: false })
      .limit(1)
      .single();
    
    if (error) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }
    
    // Get articles for this city
    const { data: articles } = await supabase
      .from('articles')
      .select('*')
      .eq('location_id', code)
      .order('published_at', { ascending: false })
      .limit(5);
    
    return NextResponse.json({
      city,
      articles: articles || []
    });
  } catch (error) {
    console.error('Error fetching city data:', error);
    return NextResponse.json({ error: 'Failed to fetch city data' }, { status: 500 });
  }
}