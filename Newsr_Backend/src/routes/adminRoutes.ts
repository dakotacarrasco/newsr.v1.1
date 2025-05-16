import express from 'express';
import {
  getUserActivityLogs,
  getUserRegistrationStats
} from '../controllers/adminController';
import {
  triggerDigestSending,
  getDigestStats
} from '../controllers/digest/digestController';
import { authenticate } from '../middleware/authMiddleware';
import { isAdmin } from '../middleware/roleMiddleware';

const router = express.Router();

// All admin routes require authentication
router.use(authenticate);
router.use(isAdmin);

// User activity routes
router.get('/user-activity', getUserActivityLogs);
router.get('/registration-stats', getUserRegistrationStats);

// Digest management routes
router.post('/digests/trigger', triggerDigestSending);
router.get('/digests/stats', getDigestStats);

export default router; 