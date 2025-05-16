import express from 'express';
import * as digestController from '../controllers/digest/digestController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// User routes (require authentication)
router.post('/subscribe', authenticate, digestController.subscribeToDigest);
router.post('/unsubscribe', authenticate, digestController.unsubscribeFromDigest);
router.get('/subscriptions/:userId', authenticate, digestController.getUserSubscriptions);
router.post('/test', authenticate, digestController.sendTestDigest);

// Admin routes (require admin privileges)
router.post('/admin/trigger', authenticate, (req, res, next) => {
  // Check if user has admin role
  if ((req as any).user?.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required' });
  }
}, digestController.triggerDigestSending);

export default router; 