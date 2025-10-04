import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import logsRouter from './routes/logs.js';
import settingsRouter from './routes/settings.js';
import templatesRouter from './routes/templates.js';
import pushRouter from './routes/push.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for Vercel deployment
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', logsRouter);
app.use('/api', settingsRouter);
app.use('/api', templatesRouter);
app.use('/api/push', pushRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Weight Tracker API is running',
    version: '1.0.0',
    endpoints: {
      logs: {
        'POST /api/log': 'Save a meal/weight entry',
        'GET /api/logs': 'Get all logs for a user (with optional filters)',
        'GET /api/progress': 'Get weight history and statistics'
      },
      settings: {
        'POST /api/settings': 'Save/update user settings',
        'GET /api/settings': 'Get user settings'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}\n`);
});
