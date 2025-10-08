// Vercel Serverless Function - Main API Entry Point
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import logsRouter from '../backend/routes/logs.js';
import settingsRouter from '../backend/routes/settings.js';
// import templatesRouter from '../backend/routes/templates.js';
// import pushRouter from '../backend/routes/push-serverless.js';
// import emailRouter from '../backend/routes/email.js';
// import cronJobsRouter from '../backend/routes/cronJobs.js';

console.log('✅ All imports loaded successfully');

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  console.log('URL:', req.url);
  console.log('Original URL:', req.originalUrl);
  next();
});

// MongoDB Connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }

  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    
    if (!MONGODB_URI) {
      console.log('MongoDB URI not found, running without database');
      return;
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};

// Connect to database (non-blocking)
connectDB().catch(err => console.error('DB connection failed:', err));

// Routes
// Test route first
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!', timestamp: new Date().toISOString() });
});

console.log('✅ Mounting logs router...');
app.use('/api', logsRouter);
console.log('✅ Mounting settings router...');
app.use('/api', settingsRouter);
// app.use('/', templatesRouter);
// app.use('/push', pushRouter);
// app.use('/', emailRouter);
// app.use('/', cronJobsRouter);

console.log('✅ All routes mounted successfully');

// Health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Weight Tracker API is running on Vercel',
    version: '1.0.0',
    database: isConnected ? 'Connected' : 'Disconnected',
    endpoints: {
      logs: {
        'POST /api/log': 'Save a meal/weight entry',
        'GET /api/logs': 'Get user logs',
        'PUT /api/logs/:id': 'Update a log entry',
        'DELETE /api/logs/:id': 'Delete a log entry'
      },
      settings: {
        'POST /api/settings': 'Save/update user settings',
        'GET /api/settings': 'Get user settings'
      },
      email: {
        'GET /api/email/preferences': 'Get email notification preferences',
        'POST /api/email/preferences': 'Update email notification preferences',
        'POST /api/email/test': 'Send test email',
        'POST /api/email/send-daily-summary': 'Send daily summary email (cron)',
        'POST /api/email/send-weekly-summary': 'Send weekly summary email (cron)',
        'POST /api/email/send-monthly-summary': 'Send monthly summary email (cron)'
      },
      cronJobs: {
        'GET /api/cron-jobs': 'List all cron jobs',
        'POST /api/cron-jobs': 'Create a new cron job',
        'PUT /api/cron-jobs/:jobId': 'Update a cron job',
        'DELETE /api/cron-jobs/:jobId': 'Delete a cron job',
        'POST /api/cron-jobs/:jobId/toggle': 'Enable/disable a cron job',
        'GET /api/cron-jobs/:jobId': 'Get cron job details',
        'POST /api/cron-jobs/:jobId/test': 'Test cron job execution',
        'POST /api/cron-jobs/setup-email-summaries': 'Create email summary cron jobs'
      }
    }
  });
});

// Export for Vercel
export default (req, res) => {
  return app(req, res);
};
