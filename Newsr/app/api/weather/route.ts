import { NextResponse } from 'next/server';

// In a real app, you should store this in an environment variable
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || 'cb358392845e40a6b9e80956250203';
const API_BASE_URL = 'https://api.weatherapi.com/v1/forecast.json';

export async function GET(request: Request) {
  try {
    // Get city from query params
    const { searchParams } = new URL(request.url);
    let city = searchParams.get('city');
    
    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }
    
    // Clean up the city name (remove "TX" or state code if present)
    city = city.split(',')[0].trim();
    
    // Fetch weather data from weatherapi.com with forecast for 1 day
    const response = await fetch(
      `${API_BASE_URL}?key=${WEATHER_API_KEY}&q=${encodeURIComponent(city)}&days=1&aqi=no`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Weather API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch weather data' },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    
    // Get high and low temps from the forecast data
    const forecastDay = data.forecast.forecastday[0];
    
    // Return a simplified response with just what we need
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
    console.error('Weather API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 