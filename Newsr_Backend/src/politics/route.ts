import { Router } from 'express';
import { 
  getAllPoliticalArticles,
  getPoliticalArticle,
  createPoliticalArticle,
  updatePoliticalArticle,
  deletePoliticalArticle,
  scrapeAndProcessPoliticalNews,
  getAllPolls,
  getPoll,
  createPoll,
  updatePoll,
  deletePoll
} from './controllers/politicsController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.status(200).json({ message: 'Politics module is working!' });
});

// Public routes for articles
router.get('/articles', getAllPoliticalArticles);
router.get('/articles/:id', getPoliticalArticle);

// Protected routes for articles
router.post('/articles', authenticate, createPoliticalArticle);
router.post('/articles/scrape', authenticate, scrapeAndProcessPoliticalNews);
router.patch('/articles/:id', authenticate, updatePoliticalArticle);
router.delete('/articles/:id', authenticate, deletePoliticalArticle);

// Public routes for polls
router.get('/polls', getAllPolls);
router.get('/polls/:id', getPoll);

// Protected routes for polls
router.post('/polls', authenticate, createPoll);
router.patch('/polls/:id', authenticate, updatePoll);
router.delete('/polls/:id', authenticate, deletePoll);

export default router;
