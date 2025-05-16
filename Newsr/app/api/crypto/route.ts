import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// In-memory cache
let cryptoCache: Record<string, { data: any; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Get crypto prices from CoinGecko (free API with higher rate limits)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids') || 'bitcoin,ethereum';
  
  // Check cache first
  const cacheKey = `crypto_${ids}`;
  const cachedData = cryptoCache[cacheKey];
  const now = Date.now();
  
  if (cachedData && now - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json(cachedData.data);
  }
  
  try {
    // Use CoinGecko's API which has better rate limits for crypto data
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    // Store in cache
    cryptoCache[cacheKey] = {
      data: response.data,
      timestamp: now
    };
    
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error fetching crypto data:', error);
    
    // Return fallback data if the API request fails
    const fallbackData = [
      {
        id: 'bitcoin',
        symbol: 'btc',
        name: 'Bitcoin',
        current_price: 43456.78,
        price_change_24h: 1234.56,
        price_change_percentage_24h: 2.91,
        market_cap: 845678912345
      },
      {
        id: 'ethereum',
        symbol: 'eth',
        name: 'Ethereum',
        current_price: 2345.67,
        price_change_24h: -43.67,
        price_change_percentage_24h: -1.7,
        market_cap: 276543123456
      }
    ];
    
    return NextResponse.json(fallbackData);
  }
} 