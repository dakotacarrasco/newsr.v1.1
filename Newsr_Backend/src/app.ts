import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import pollRoutes from './routes/polls';
import locationRoutes from './routes/locations';
import likeRoutes from './routes/likes';

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(compression()); // Compress responses

// Rate limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per 15 minutes
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes'
});
app.use('/api', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/likes', likeRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use(errorHandler);

export default app;