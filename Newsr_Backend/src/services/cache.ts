import NodeCache from 'node-cache';

// Create a cache instance with default TTL of 10 minutes
const cache = new NodeCache({ stdTTL: 600 });

export const cacheMiddleware = (key: string, ttl?: number) => {
  return (req: any, res: any, next: any) => {
    // Generate a cache key based on the provided key and request parameters
    const cacheKey = `${key}-${JSON.stringify(req.params)}-${JSON.stringify(req.query)}`;
    
    // Check if we have a cached response
    const cachedResponse = cache.get(cacheKey);
    
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    }
    
    // Store the original send method
    const originalSend = res.send;
    
    // Override the send method to cache the response
    res.send = function(body: any) {
      // Only cache successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          const parsedBody = JSON.parse(body);
          cache.set(cacheKey, parsedBody, ttl || 600);
        } catch (error) {
          console.error('Error caching response:', error);
        }
      }
      
      // Call the original send method
      return originalSend.call(this, body);
    };
    
    next();
  };
};

export const clearCache = (pattern?: string) => {
  if (pattern) {
    const keys = cache.keys();
    const keysToDelete = keys.filter(key => key.includes(pattern));
    keysToDelete.forEach(key => cache.del(key));
    return keysToDelete.length;
  } else {
    cache.flushAll();
    return 'all';
  }
};

export default cache; 