import { Router } from 'express';
import { 
  toggleArticleLike, 
  checkArticleLike, 
  getLikedArticles 
} from '../controllers/likes/likeController';
import { authenticate } from '../middleware/auth';
import { cacheMiddleware } from '../services/cache';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Toggle like status for an article
router.post('/articles/:articleId', toggleArticleLike as any);

// Check if user has liked an article
router.get('/articles/:articleId', checkArticleLike as any);

// Get all articles liked by the user
router.get('/articles', cacheMiddleware('user-liked-articles', 60), getLikedArticles as any);

export default router; 