import { Router } from 'express';
import { 
  voteOrChangePoll,
  getUserPollVote,
  getDetailedPollResults
} from '../controllers/polls/enhancedPollController';
import { authenticate } from '../middleware/auth';
import { cacheMiddleware } from '../services/cache';

const router = Router();

// Public routes with caching
router.get('/:id/detailed-results', cacheMiddleware('detailed-poll-results', 60), getDetailedPollResults as any);

// Protected routes
router.post('/:id/vote', authenticate, voteOrChangePoll as any);
router.get('/:id/user-vote', authenticate, getUserPollVote as any);

export default router; 