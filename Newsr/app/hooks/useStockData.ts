'use client'

import { useState, useEffect } from 'react'
import { StockData, fetchMultipleStocks, getFallbackStockData } from '@/app/lib/services/stockServices'

// Improved cache that stores stocks individually for better reuse
interface StockCache {
  [symbol: string]: {
    data: StockData;
    timestamp: number;
  }
}

// Global cache to prevent repeated fetches across components
const stockDataCache: StockCache = {};

interface UseStockDataOptions {
  symbols: string[];
  refreshInterval?: number;
  forceRefresh?: boolean;
}

export function useStockData({ 
  symbols,
  refreshInterval = 5 * 60 * 1000, // 5 minutes by default
  forceRefresh = false
}: UseStockDataOptions) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let isMounted = true;
    let refreshTimer: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        
        const now = Date.now();
        const expireTime = now - refreshInterval;
        
        // Check which symbols need updating and which can come from cache
        const symbolsToFetch: string[] = [];
        const cachedResults: StockData[] = [];
        
        symbols.forEach(symbol => {
          const cachedItem = stockDataCache[symbol];
          
          // Use cached version if fresh enough and not forcing refresh
          if (
            !forceRefresh && 
            cachedItem && 
            cachedItem.timestamp > expireTime
          ) {
            cachedResults.push(cachedItem.data);
          } else {
            symbolsToFetch.push(symbol);
          }
        });
        
        // If all data is already in cache, use it
        if (symbolsToFetch.length === 0) {
          setStocks(cachedResults);
          const oldestTimestamp = Math.min(
            ...cachedResults.map(stock => stockDataCache[stock.symbol].timestamp)
          );
          setLastUpdated(new Date(oldestTimestamp));
          setLoading(false);
          return;
        }
        
        // Fetch only the symbols we need
        const freshData = await fetchMultipleStocks(symbolsToFetch);
        
        if (!isMounted) return;
        
        if (freshData && freshData.length > 0) {
          // Update the cache with new data
          freshData.forEach(stock => {
            stockDataCache[stock.symbol] = {
              data: stock,
              timestamp: now
            };
          });
          
          // Combine fresh data with cached data
          const combinedData = [...cachedResults, ...freshData];
          
          // Sort by symbol to maintain consistent order
          combinedData.sort((a, b) => a.symbol.localeCompare(b.symbol));
          
          setStocks(combinedData);
          setLastUpdated(new Date(now));
        } else if (cachedResults.length > 0) {
          // If we have some cached results but fresh fetch failed, use cache
          setStocks(cachedResults);
          const oldestTimestamp = Math.min(
            ...cachedResults.map(stock => stockDataCache[stock.symbol].timestamp)
          );
          setLastUpdated(new Date(oldestTimestamp));
        } else {
          // If all else fails, use fallback data
          const fallbackData = getFallbackStockData();
          setStocks(fallbackData);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Error fetching stock data:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        
        // Try to use cache even if refresh failed
        const cachedStocks = symbols
          .map(symbol => stockDataCache[symbol]?.data)
          .filter(Boolean) as StockData[];
        
        if (cachedStocks.length > 0) {
          setStocks(cachedStocks);
        } else {
          // Use fallback data on error
          const fallbackData = getFallbackStockData();
          setStocks(fallbackData);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Fetch immediately
    fetchData();
    
    // Set up periodic refresh if interval is provided
    if (refreshInterval > 0) {
      refreshTimer = setInterval(fetchData, refreshInterval);
    }
    
    // Cleanup on unmount
    return () => {
      isMounted = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [symbols, refreshInterval, forceRefresh]);

  return {
    stocks,
    loading,
    error,
    lastUpdated,
    refetch: () => useStockData({ symbols, refreshInterval, forceRefresh: true })
  };
} 