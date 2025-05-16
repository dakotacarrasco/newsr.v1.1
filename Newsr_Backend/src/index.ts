import express, { Express } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Load environment variables
dotenv.config();

// Create Express app
const app: Express = express();
const PORT: number = 8000; // Explicitly set port to 8000

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(express.json());

// Configure CORS to allow requests from your frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Debug routes
app.get('/debug', (req, res) => {
  res.json({ status: 'OK', message: 'Debug endpoint working' });
});

// Routes
app.use('/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Backend API is running');
});

// Log all routes for debugging
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(`Route: ${r.route.path}`);
  } else if (r.name === 'router') {
    r.handle.stack.forEach((layer: any) => {
      console.log(`${layer.route?.stack[0].method?.toUpperCase() || 'MIDDLEWARE'} ${r.regexp.source}${layer.route?.path || ''}`);
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Auth endpoint: http://localhost:${PORT}/auth/user`);
}); 