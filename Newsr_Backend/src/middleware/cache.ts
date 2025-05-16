import NodeCache from 'node-cache';

// Create cache instance with default TTL of 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Cache middleware for Express routes
 * @param key The base cache key (will be combined with request params/query)
 * @param ttl Time to live in seconds
 */
export const cacheMiddleware = (key: string, ttl: number = 300) => {
  return (req: any, res: any, next: any) => {
    // Create a unique cache key based on the route and query parameters
    const cacheKey = `${key}:${req.originalUrl}`;
    
    // Check if we have a cached response
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      return res.json(cachedResponse);
    }
    
    // Override send method to cache the response before sending
    const originalSend = res.send;
    
    res.send = function(body: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const parsedBody = typeof body === 'string' ? JSON.parse(body) : body;
          cache.set(cacheKey, parsedBody, ttl);
        } catch (error) {
          console.error('Error caching response:', error);
        }
      }
      
      // Call the original send method
      originalSend.call(this, body);
    };
    
    next();
  };
};

// Function to manually clear cache
export const clearCache = (keyPattern: string = '') => {
  if (!keyPattern) {
    cache.flushAll();
    return;
  }
  
  const keys = cache.keys();
  const matchingKeys = keys.filter(key => key.includes(keyPattern));
  
  if (matchingKeys.length > 0) {
    cache.del(matchingKeys);
  }
};

export default { cacheMiddleware, clearCache }; 