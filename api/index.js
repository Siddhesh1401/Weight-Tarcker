// Vercel Serverless Function Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from '../backend/config/db.js';
import logsRouter from '../backend/routes/logs.js';
import settingsRouter from '../backend/routes/settings.js';
import templatesRouter from '../backend/routes/templates.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', logsRouter);
app.use('/api', settingsRouter);
app.use('/api', templatesRouter);

// Health check
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Weight Tracker API is running',
    version: '1.0.0'
  });
});

// Export for Vercel
export default app;
