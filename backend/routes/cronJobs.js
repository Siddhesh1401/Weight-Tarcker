import express from 'express';
import cronJobOrgService from '../services/cronJobOrgService.js';

const router = express.Router();

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

// Create email summary cron jobs (convenience endpoint)
router.post('/cron-jobs/setup-email-summaries', async (req, res) => {
  try {
    const { backendUrl, apiKey } = req.body;

    if (!backendUrl || !apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Backend URL and API key are required'
      });
    }

    const createdJobs = [];

    // Create daily summary job
    const dailyJobData = cronJobOrgService.createEmailSummaryJob('daily', backendUrl, apiKey);
    const dailyJob = await cronJobOrgService.createJob(dailyJobData);
    createdJobs.push({ type: 'daily', job: dailyJob });

    // Create weekly summary job
    const weeklyJobData = cronJobOrgService.createEmailSummaryJob('weekly', backendUrl, apiKey);
    const weeklyJob = await cronJobOrgService.createJob(weeklyJobData);
    createdJobs.push({ type: 'weekly', job: weeklyJob });

    // Create monthly summary job
    const monthlyJobData = cronJobOrgService.createEmailSummaryJob('monthly', backendUrl, apiKey);
    const monthlyJob = await cronJobOrgService.createJob(monthlyJobData);
    createdJobs.push({ type: 'monthly', job: monthlyJob });

    res.json({
      success: true,
      message: 'Email summary cron jobs created successfully',
      jobs: createdJobs
    });
  } catch (error) {
    console.error('Error setting up email summary cron jobs:', error);
    res.status(500).json({ success: false, message: 'Failed to create email summary cron jobs' });
  }
});

export default router;
