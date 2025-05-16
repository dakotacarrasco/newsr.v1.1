import { NextRequest, NextResponse } from 'next/server';

// Weather API key should be stored in environment variables
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'cb358392845e40a6b9e80956250203';
const API_BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;
    const { supabase } = await import('@/lib/supabase');
    
    // First get the city name from our database
    const { data: city, error } = await supabase
      .from('city_digests')
      .select('city_name')
      .eq('city_code', code)
      .limit(1)
      .single();
    
    if (error || !city) {
      return NextResponse.json({ error: 'City not found' }, { status: 404 });
    }
    
    const cityName = city.city_name;
    
    // Fetch weather data from the weather API
    const response = await fetch(
      `${API_BASE_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(cityName)}&days=1&aqi=no`
    );
    
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Extract and format the weather data
    const forecastDay = data.forecast.forecastday[0];
    
    return NextResponse.json({
      current: {
        temp: data.current.temp_f,
        condition: data.current.condition.text,
        icon: data.current.condition.icon,
        uv: data.current.uv,
        wind_mph: data.current.wind_mph,
        wind_dir: data.current.wind_dir,
        precipChance: forecastDay.day.daily_chance_of_rain
      },
      location: {
        name: data.location.name,
        region: data.location.region
      },
      forecast: {
        high: forecastDay.day.maxtemp_f,
        low: forecastDay.day.mintemp_f
      }
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    return NextResponse.json({ error: 'Failed to fetch weather data' }, { status: 500 });
  }
}