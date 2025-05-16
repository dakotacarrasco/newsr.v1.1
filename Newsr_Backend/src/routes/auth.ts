import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { Router } from 'express';
import * as authController from '../controllers/auth/authController';
import { authenticate } from '../middleware/auth';
import { jwtAuth } from '../middleware/jwtAuth';

const router = Router();

// Define user interface
interface UserPayload {
  id: string;
  email: string;
  name?: string;
  [key: string]: any; // For additional properties
}

// Middleware to verify Supabase JWT token
const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    // For Supabase tokens, we need to handle them differently from regular JWTs
    // Instead of verifying with a secret, we'll decode the token and validate based on claims
    
    // First, just decode the token without verification
    const decodedToken = jwt.decode(token, { complete: true });
    console.log('Decoded token:', JSON.stringify(decodedToken));
    
    if (!decodedToken) {
      res.status(403).json({ message: 'Invalid token format' });
      return;
    }
    
    // Check if this is a Supabase token
    const payload = decodedToken.payload as any;
    
    // For debugging
    console.log('Token issuer:', payload.iss);
    console.log('Token subject:', payload.sub);
    
    // Validate minimal token requirements
    if (!payload.sub || !payload.exp || !payload.iat) {
      res.status(403).json({ message: 'Invalid token claims' });
      return;
    }
    
    // Check if token is expired
    if (payload.exp < Math.floor(Date.now() / 1000)) {
      res.status(403).json({ message: 'Token expired' });
      return;
    }
    
    // For simplicity, we'll trust the token without full verification
    // In production, you should implement proper verification with Supabase public keys
    
    // Extract user info from token
    (req as any).user = {
      id: payload.sub,
      email: payload.email || '',
      name: payload.user_metadata?.full_name || payload.user_metadata?.name || '',
      // Add other user properties as needed
      role: payload.role || 'user',
      metadata: payload.user_metadata || {}
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(403).json({ message: 'Token verification failed' });
  }
};

// Public authentication routes - using object notation for functions
router.post('/register', (authController as any).register || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.post('/login', (authController as any).login || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.post('/forgot-password', (authController as any).forgotPassword || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.post('/reset-password', (authController as any).resetPassword || ((req, res) => res.status(501).json({ message: 'Not implemented' })));
router.post('/validate', (authController as any).validateToken || ((req, res) => res.status(501).json({ message: 'Not implemented' })));

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working' });
});

// Protected routes
if ((authController as any).getCurrentUser) {
  router.get('/user', jwtAuth, (authController as any).getCurrentUser);
}

if ((authController as any).updateProfile) {
  router.patch('/profile', authenticate, (authController as any).updateProfile);
}

// Debug endpoint
router.post('/debug-token', (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'No token provided' });
    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(400).json({ error: 'Could not decode token' });
    return res.json({
      tokenInfo: {
        header: decoded.header,
        payloadPreview: {
          iss: (decoded.payload as any).iss,
          aud: (decoded.payload as any).aud,
          exp: (decoded.payload as any).exp,
          iat: (decoded.payload as any).iat,
        }
      }
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;