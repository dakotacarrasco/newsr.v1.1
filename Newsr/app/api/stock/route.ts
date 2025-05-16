import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// In a real app, you'd store this in an environment variable
const ALPHA_VANTAGE_API_KEY = 'demo';

// In-memory cache for stock data with expiration time
let stockCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');
  const function_type = searchParams.get('function') || 'GLOBAL_QUOTE';
  
  if (!symbol) {
    return NextResponse.json({ error: 'Symbol parameter is required' }, { status: 400 });
  }
  
  // Check cache first
  const cacheKey = `${function_type}_${symbol}`;
  const cachedData = stockCache[cacheKey];
  const now = Date.now();
  
  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData.data);
  }
  
  try {
    // Fetch from Alpha Vantage
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=${function_type}&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    // Store in cache
    stockCache[cacheKey] = {
      data: response.data,
      timestamp: now
    };
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stock data' },
      { status: 500 }
    );
  }
}

// Add this route handler to clean the cache periodically (once a day)
export async function POST() {
  // Clear cache older than 1 day
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  
  Object.keys(stockCache).forEach(key => {
    if (now - stockCache[key].timestamp > oneDayMs) {
      delete stockCache[key];
    }
  });
  
  return NextResponse.json({ message: 'Cache cleaned successfully' });
} 