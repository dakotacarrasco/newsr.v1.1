// Request tracking utility
export const requestTracker = {
  totalRequests: 0,
  requestsByEndpoint: new Map<string, number>(),
  startTime: Date.now()
};

import { Request, Response, NextFunction } from 'express';

// Track all incoming requests for monitoring
export const trackRequest = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  
  // Log basic request info
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  
  // When response finishes, log the response time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  
  next();
}; 