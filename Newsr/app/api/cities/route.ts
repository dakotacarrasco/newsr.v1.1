import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    // Query the database to get all unique cities
    const { data, error } = await supabase
      .from('city_digests')
      .select('city_code, city_name, region')
      .order('city_name');
    
    if (error) throw error;
    
    // Process to remove duplicates
    const cityMap = new Map();
    data.forEach(item => {
      if (!cityMap.has(item.city_code)) {
        cityMap.set(item.city_code, {
          name: item.city_name,
          code: item.city_code,
          state: item.region || 'TX' // Default to TX if region not present
        });
      }
    });
    
    // Convert Map to array
    const cities = Array.from(cityMap.values());
    
    return NextResponse.json(cities);
  } catch (error) {
    console.error('Error fetching cities:', error);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}