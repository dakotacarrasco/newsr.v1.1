import { Router } from 'express';
import { 
  getLocations, 
  getArticlesByLocation, 
  getUserLocationPreferences, 
  updateUserLocationPreferences 
} from '../controllers/location/locationController';
import { authenticate } from '../middleware/auth';
import { cacheMiddleware } from '../services/cache';

const router = Router();

// Public routes with caching
router.get('/', cacheMiddleware('locations-list', 3600), getLocations);
router.get('/:locationId/articles', cacheMiddleware('location-articles', 300), getArticlesByLocation);

// Protected routes with type assertions
router.get('/preferences', authenticate, getUserLocationPreferences as any);
router.put('/preferences', authenticate, updateUserLocationPreferences as any);

export default router; 