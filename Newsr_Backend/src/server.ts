import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { errorHandler } from './middleware/errorHandler';
import { trackRequest } from './utils/requestTracker';

// Routes
import authRoutes from './routes/auth';
import articleRoutes from './routes/articles';
import pollRoutes from './routes/polls';
import locationRoutes from './routes/locations';
import likeRoutes from './routes/likes';
import debugRoutes from './routes/debug';
import politicsRoutes from './politics/route';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 8000;

// Create HTTP server and Socket.io
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10kb' })); // Body parser with size limit
app.use(express.urlencoded({ extended: true }));
app.use(compression()); // Compress responses
app.use(trackRequest); // Request tracking

// Rate limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per 15 minutes
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes'
});
app.use('/api', limiter);

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/polls', pollRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/debug', debugRoutes);
app.use('/api/politics', politicsRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API server is running!',
    endpoints: {
      auth: '/api/auth',
      articles: '/api/articles',
      polls: '/api/polls',
      locations: '/api/locations',
      likes: '/api/likes',
      politics: '/api/politics'
    }
  });
});

// 404 handler
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handler
app.use(errorHandler);

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at: http://localhost:${PORT}/api`);
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

export { io }; // Export for WebSocket usage elsewhere 