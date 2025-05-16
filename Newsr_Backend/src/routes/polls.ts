import { Router } from 'express';
import {
  getPolls,
  getPoll,
  createPoll,
  votePoll,
  deletePoll
} from '../controllers/polls/pollController';
import { authenticate } from '../middleware/auth';
import { cacheMiddleware } from '../services/cache';

const router = Router();

// Public routes
router.get('/', cacheMiddleware('polls-list', 300), getPolls);
router.get('/:id', cacheMiddleware('poll', 300), getPoll);

// Protected routes
router.post('/', authenticate, createPoll as any);
router.post('/:id/vote', authenticate, votePoll as any);
router.delete('/:id', authenticate, deletePoll as any);

export default router; 