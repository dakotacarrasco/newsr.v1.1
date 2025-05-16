import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const jwtAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // Decode token without verification for now
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) {
      res.status(403).json({ message: 'Invalid token format' });
      return;
    }
    
    const payload = decoded.payload as any;
    
    // Basic validation
    if (!payload.sub || payload.exp < Math.floor(Date.now() / 1000)) {
      res.status(403).json({ message: 'Invalid or expired token' });
      return;
    }
    
    // Set user info
    (req as any).user = {
      id: payload.sub,
      email: payload.email || '',
      role: payload.role || 'user',
      metadata: payload.user_metadata || {}
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Token verification failed' });
  }
}; 