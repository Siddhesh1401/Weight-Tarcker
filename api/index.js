// Vercel Serverless Function - Main API Entry Point
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import routes
import logsRouter from '../backend/routes/logs.js';
import settingsRouter from '../backend/routes/settings.js';
import templatesRouter from '../backend/routes/templates.js';
import pushRouter from '../backend/routes/push-serverless.js';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Connect to database
connectDB();

// Routes
app.use('/api', logsRouter);
app.use('/api', settingsRouter);
app.use('/api', templatesRouter);
app.use('/api/push', pushRouter);

// Health check
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Weight Tracker API is running on Vercel',
    version: '1.0.0',
    database: isConnected ? 'Connected' : 'Disconnected'
  });
});

// Export for Vercel
export default app;
