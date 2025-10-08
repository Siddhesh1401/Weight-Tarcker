import express from 'express';
import cronJobOrgService from '../services/cronJobOrgService.js';

const router = express.Router();

// Create email summary cron jobs (convenience endpoint)
// IMPORTANT: This must come BEFORE parameterized routes like /cron-jobs/:jobId
router.post('/cron-jobs/setup-email-summaries', async (req, res) => {
  try {
    const { backendUrl, apiKey, userId } = req.body;

    console.log('Setup email summaries request:', {
      hasBackendUrl: !!backendUrl,
      backendUrl,
      hasApiKey: !!apiKey,
      apiKeyLength: apiKey ? apiKey.length : 0,
      userId: userId || process.env.DEFAULT_USER_ID
    });

    if (!backendUrl || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Backend URL and API key are required'
      });
    }

    // Get user's email preferences to get schedule times
    const User = (await import('../models/User.js')).default;
    const user = await User.findOne({ _id: userId || process.env.DEFAULT_USER_ID });
    
    console.log('User found:', {
      userId: userId || process.env.DEFAULT_USER_ID,
      hasUser: !!user,
      hasEmailNotifications: !!(user && user.email_notifications),
      hasSchedule: !!(user && user.email_notifications && user.email_notifications.schedule)
    });
    
    let schedule = {
      daily: '20:00',
      weekly: '20:00',
      monthly: '20:00'
    };

    if (user && user.email_notifications && user.email_notifications.schedule) {
      schedule = user.email_notifications.schedule;
      console.log('Using user schedule:', schedule);
    } else {
      console.log('Using default schedule:', schedule);
    }

    const createdJobs = [];

    // Helper function to delay between requests (rate limit: 1 req/sec)
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Create daily summary job with user's schedule
    console.log('Creating daily summary job...');
    const dailyJobData = cronJobOrgService.createEmailSummaryJob('daily', backendUrl, apiKey, schedule.daily);
    const dailyJob = await cronJobOrgService.createJob(dailyJobData, apiKey);
    createdJobs.push({ type: 'daily', job: dailyJob });
    console.log('Daily job created, waiting 2 seconds before next request...');
    await delay(2000); // Wait 2 seconds to respect rate limit

    // Create weekly summary job with user's schedule
    console.log('Creating weekly summary job...');
    const weeklyJobData = cronJobOrgService.createEmailSummaryJob('weekly', backendUrl, apiKey, schedule.weekly);
    const weeklyJob = await cronJobOrgService.createJob(weeklyJobData, apiKey);
    createdJobs.push({ type: 'weekly', job: weeklyJob });
    console.log('Weekly job created, waiting 2 seconds before next request...');
    await delay(2000); // Wait 2 seconds to respect rate limit

    // Create monthly summary job with user's schedule
    console.log('Creating monthly summary job...');
    const monthlyJobData = cronJobOrgService.createEmailSummaryJob('monthly', backendUrl, apiKey, schedule.monthly);
    const monthlyJob = await cronJobOrgService.createJob(monthlyJobData, apiKey);
    createdJobs.push({ type: 'monthly', job: monthlyJob });
    console.log('All jobs created successfully!');

    res.json({
      success: true,
      message: 'Email summary cron jobs created successfully',
      jobs: createdJobs
    });
  } catch (error) {
    console.error('Error setting up email summary cron jobs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create email summary cron jobs',
      error: error.message 
    });
  }
});

// Get all cron jobs
router.get('/cron-jobs', async (req, res) => {
  try {
    const jobs = await cronJobOrgService.listJobs();
    res.json({ success: true, jobs });
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cron jobs' });
  }
});

// Create a new cron job
router.post('/cron-jobs', async (req, res) => {
  try {
    const { jobData } = req.body;

    if (!jobData) {
      return res.status(400).json({ success: false, message: 'Job data is required' });
    }

    const job = await cronJobOrgService.createJob(jobData);
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error creating cron job:', error);
    res.status(500).json({ success: false, message: 'Failed to create cron job' });
  }
});

// Update an existing cron job
router.put('/cron-jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { jobData } = req.body;

    if (!jobData) {
      return res.status(400).json({ success: false, message: 'Job data is required' });
    }

    const job = await cronJobOrgService.updateJob(jobId, jobData);
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error updating cron job:', error);
    res.status(500).json({ success: false, message: 'Failed to update cron job' });
  }
});

// Delete a cron job
router.delete('/cron-jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    await cronJobOrgService.deleteJob(jobId);
    res.json({ success: true, message: 'Cron job deleted successfully' });
  } catch (error) {
    console.error('Error deleting cron job:', error);
    res.status(500).json({ success: false, message: 'Failed to delete cron job' });
  }
});

// Toggle cron job (enable/disable)
router.post('/cron-jobs/:jobId/toggle', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { enabled } = req.body;

    const job = await cronJobOrgService.toggleJob(jobId, enabled);
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error toggling cron job:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle cron job' });
  }
});

// Get specific cron job details
router.get('/cron-jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await cronJobOrgService.getJob(jobId);
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching cron job:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch cron job' });
  }
});

// Test cron job execution
router.post('/cron-jobs/:jobId/test', async (req, res) => {
  try {
    const { jobId } = req.params;

    const result = await cronJobOrgService.testJob(jobId);
    res.json({ success: true, result });
  } catch (error) {
    console.error('Error testing cron job:', error);
    res.status(500).json({ success: false, message: 'Failed to test cron job' });
  }
});

export default router;
