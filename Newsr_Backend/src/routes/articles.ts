import { Router } from 'express';
import { 
  getAllArticles, 
  getArticle, 
  createArticle, 
  updateArticle, 
  deleteArticle 
} from '../controllers/content/articleController';
import { authenticate } from '../middleware/auth';
import { cacheMiddleware } from '../services/cache';

const router = Router();

// Public routes (with caching for GET requests)
router.get('/', cacheMiddleware('articles-list', 300), getAllArticles);
router.get('/:id', cacheMiddleware('article', 300), getArticle);

// Protected routes - cast the middleware functions to correct Express type
router.post('/', authenticate, createArticle as any);
router.patch('/:id', authenticate, updateArticle as any);
router.delete('/:id', authenticate, deleteArticle as any);

export default router; 