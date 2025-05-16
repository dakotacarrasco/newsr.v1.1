import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { supabase } = await import('@/lib/supabase');
    
    // Get the most recent active digest for this city
    const { data: activeDigests, error } = await supabase
      .from('city_digests')
      .select('*')
      .eq('city_code', code)
      .eq('active', true)
      .order('date', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    
    // If active digest found, return it
    if (activeDigests && activeDigests.length > 0) {
      return NextResponse.json(activeDigests[0]);
    }
    
    // No active digest found - check if any digests exist for this city (active or not)
    const { data: allCityDigests, error: cityError } = await supabase
      .from('city_digests')
      .select('id, city_code, city_name, date, active')
      .eq('city_code', code)
      .order('date', { ascending: false });
      
    if (cityError) throw cityError;
    
    // Return detailed error with information about what's available
    return NextResponse.json({ 
      error: `No active digest found for ${code}`, 
      tableInfo: {
        requestedCity: code,
        cityDigestsFound: allCityDigests || [],
        message: "No active digest is available for this city"
      }
    }, { status: 404 });
  } catch (error) {
    console.error('Error fetching city digest:', error);
    return NextResponse.json({ error: 'Failed to fetch city digest' }, { status: 500 });
  }
}