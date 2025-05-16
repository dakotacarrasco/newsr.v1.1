import { Request, Response, NextFunction } from 'express';

// Simple admin authentication middleware for the dashboard
export function dashboardAuth(req: Request, res: Response, next: NextFunction) {
  // Skip auth for static assets
  if (req.path.includes('.js') || req.path.includes('.css') || req.path.includes('.ico')) {
    return next();
  }
  
  // Get authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
    return res.status(401).send('Authentication required');
  }
  
  // Decode the Base64 credentials
  try {
    // Extract the base64 encoded credentials
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');
    
    // Check if credentials match environment variables
    const expectedUsername = process.env.DASHBOARD_USERNAME || 'admin';
    const expectedPassword = process.env.DASHBOARD_PASSWORD || 'admin';
    
    if (username !== expectedUsername || password !== expectedPassword) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
      return res.status(401).send('Invalid credentials');
    }
    
    // Authentication successful
    next();
  } catch (error) {
    console.error('Error parsing authentication:', error);
    res.setHeader('WWW-Authenticate', 'Basic realm="Admin Dashboard"');
    return res.status(401).send('Authentication error');
  }
} 