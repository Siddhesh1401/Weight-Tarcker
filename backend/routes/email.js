import express from 'express';
import emailService from '../services/emailService.js';
import summaryService from '../services/summaryService.js';
import { generateDailySummaryTemplate, generateWeeklySummaryTemplate, generateMonthlySummaryTemplate } from '../services/emailTemplates.js';

const router = express.Router();

// Helper function to get local date in YYYY-MM-DD format
const getLocalDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Get email preferences for user
router.get('/email/preferences', async (req, res) => {
  try {
    const userId = req.query.user_id || process.env.DEFAULT_USER_ID;
    const preferences = await summaryService.getUserEmailPreferences(userId);
    res.json({ success: true, preferences });
  } catch (error) {
    console.error('Error getting email preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to get email preferences' });
  }
});

// Update email preferences for user
router.post('/email/preferences', async (req, res) => {
  try {
    const userId = req.body.user_id || process.env.DEFAULT_USER_ID;
    const preferences = req.body.preferences;

    if (!preferences) {
      return res.status(400).json({ success: false, message: 'Preferences are required' });
    }

    const updatedPreferences = await summaryService.updateEmailPreferences(userId, preferences);
    res.json({ success: true, preferences: updatedPreferences });
  } catch (error) {
    console.error('Error updating email preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to update email preferences' });
  }
});

// Send test email
router.post('/email/test', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required' });
    }

    const success = await emailService.sendTestEmail(email);

    if (success) {
      res.json({ success: true, message: 'Test email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send test email' });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ success: false, message: 'Failed to send test email' });
  }
});

// Debug endpoint to check today's summary data
router.get('/email/debug-daily-summary', async (req, res) => {
  try {
    const userId = req.query.user_id || process.env.DEFAULT_USER_ID;
    const targetDate = req.query.date || getLocalDate();

    console.log('🔍 Debugging daily summary for user:', userId, 'date:', targetDate);

    // Get all logs for debugging
    const allLogs = await Log.find({ user_id: userId }).sort({ date: -1 }).limit(20);
    const todaysLogs = await Log.find({ user_id: userId, date: targetDate });
    
    // Get logs from last 3 days for debugging
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const recentLogs = await Log.find({ 
      user_id: userId, 
      date: { $gte: threeDaysAgo.toISOString().split('T')[0] }
    }).sort({ date: -1, timestamp: -1 }).limit(50);
    
    // Get unique meal types and dates
    const allUserLogs = await Log.find({ user_id: userId });
    const uniqueMealTypes = [...new Set(allUserLogs.map(log => log.meal_type))];
    const uniqueDates = [...new Set(allUserLogs.map(log => log.date))].sort().reverse();

    console.log('📊 All recent logs:', allLogs.map(log => ({
      date: log.date,
      meal_type: log.meal_type,
      time: log.time,
      meal_notes: log.meal_notes?.substring(0, 30)
    })));

    console.log('📊 Today\'s logs:', todaysLogs.map(log => ({
      date: log.date,
      meal_type: log.meal_type,
      time: log.time,
      meal_notes: log.meal_notes?.substring(0, 30)
    })));

    console.log('📊 Unique meal types:', uniqueMealTypes);
    console.log('📊 Unique dates:', uniqueDates);

    // Generate daily summary data
    const summaryData = await summaryService.generateDailySummary(userId, targetDate);

    res.json({
      success: true,
      debug: {
        userId,
        targetDate,
        serverTime: new Date().toISOString(),
        localTime: new Date().toLocaleString(),
        serverTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        clientTimezone: 'IST (assumed)', // Frontend uses IST
        totalLogsInDB: await Log.countDocuments({ user_id: userId }),
        uniqueMealTypes,
        uniqueDates,
        recentLogs: recentLogs.map(log => ({
          id: log._id,
          date: log.date,
          meal_type: log.meal_type,
          time: log.time,
          meal_notes: log.meal_notes?.substring(0, 50)
        })),
        todaysLogs: todaysLogs.map(log => ({
          id: log._id,
          date: log.date,
          meal_type: log.meal_type,
          time: log.time,
          meal_notes: log.meal_notes?.substring(0, 50)
        })),
        summaryData,
        hasData: summaryData.totalMeals > 0 || summaryData.weight || summaryData.water || summaryData.sleep
      }
    });
  } catch (error) {
    console.error('Error debugging daily summary:', error);
    res.status(500).json({ success: false, message: 'Failed to debug daily summary', error: error.message });
  }
});

// Simple debug endpoint for date calculations
router.get('/debug-date', async (req, res) => {
  try {
    const now = new Date();
    const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    
    // Calculate IST time (UTC+5:30)
    const istOffset = 5.5 * 60 * 60 * 1000;
    const istTime = new Date(now.getTime() + istOffset);
    
    res.json({
      server: {
        timezone: serverTimezone,
        currentTime: now.toISOString(),
        localTime: now.toLocaleString(),
        dateString: getLocalDate()
      },
      ist: {
        currentTime: istTime.toISOString(),
        localTime: istTime.toLocaleString(),
        dateString: `${istTime.getUTCFullYear()}-${String(istTime.getUTCMonth() + 1).padStart(2, '0')}-${String(istTime.getUTCDate()).padStart(2, '0')}`
      },
      explanation: "Frontend saves dates in IST, backend should query using same timezone logic"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send daily summary email (for cron job)
router.post('/email/send-daily-summary', async (req, res) => {
  try {
    // Allow cron-job.org to call this endpoint
    // Note: In production, you might want to add IP whitelisting or a secret token
    const apiKey = req.headers['x-api-key'];

    // Only check API key if it's provided (optional for backward compatibility)
    if (apiKey && apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    const { user_id, date } = req.body;
    const userId = user_id || process.env.DEFAULT_USER_ID;
    let targetDate = date || getLocalDate();

    console.log('📧 Starting daily summary for user:', userId, 'initial date:', targetDate);

    // Get user email preferences FIRST
    let preferences;
    try {
      preferences = await summaryService.getUserEmailPreferences(userId);
    } catch (error) {
      console.error('❌ Error getting email preferences:', error);
      return res.status(500).json({ success: false, message: 'Error getting email preferences', error: error.message });
    }

    // If no data found for today, try yesterday (timezone issues)
    let summaryData;
    try {
      summaryData = await summaryService.generateDailySummary(userId, targetDate);
    } catch (error) {
      console.error('❌ Error generating daily summary:', error);
      return res.status(500).json({ success: false, message: 'Error generating daily summary', error: error.message });
    }
    
    if (summaryData.totalMeals === 0 && !summaryData.weight && !summaryData.water && !summaryData.sleep) {
      console.log('📭 No data for today, trying yesterday...');
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
      console.log('📧 Trying yesterday:', yesterdayStr);
      
      try {
        const yesterdayData = await summaryService.generateDailySummary(userId, yesterdayStr);
        if (yesterdayData.totalMeals > 0 || yesterdayData.weight || yesterdayData.water || yesterdayData.sleep) {
          summaryData = yesterdayData;
          targetDate = yesterdayStr;
          console.log('📧 Found data for yesterday, using that date');
        }
      } catch (error) {
        console.error('❌ Error generating yesterday summary:', error);
        // Continue with today's data
      }
    }

    if (!preferences.enabled || !preferences.email || !preferences.daily_summary) {
      console.log('⏸️ Daily summary disabled for user');
      return res.json({ success: true, message: 'Daily summary disabled for user' });
    }

    console.log('📧 Daily summary result:', {
      targetDate,
      totalMeals: summaryData.totalMeals,
      hasWeight: !!summaryData.weight,
      hasWater: !!summaryData.water,
      hasSleep: !!summaryData.sleep,
      hasData: summaryData.totalMeals > 0 || summaryData.weight || summaryData.water || summaryData.sleep
    });

    if (summaryData.totalMeals === 0 && !summaryData.weight && !summaryData.water && !summaryData.sleep) {
      console.log('📭 No data to summarize for the day');
      return res.json({ success: true, message: 'No data to summarize for the day' });
    }

    // Generate email HTML
    const emailHtml = generateDailySummaryTemplate(summaryData);

    // Send email
    const success = await emailService.sendEmail(
      preferences.email,
      `Daily Health Summary - ${new Date(targetDate).toLocaleDateString()}`,
      emailHtml
    );

    if (success) {
      console.log('✅ Daily summary email sent successfully to:', preferences.email);
      res.json({ success: true, message: 'Daily summary email sent successfully' });
    } else {
      console.error('❌ Failed to send daily summary email');
      res.status(500).json({ success: false, message: 'Failed to send daily summary email' });
    }
  } catch (error) {
    console.error('Error sending daily summary email:', error);
    res.status(500).json({ success: false, message: 'Failed to send daily summary email', error: error.message });
  }
});

// Send weekly summary email (for cron job)
router.post('/email/send-weekly-summary', async (req, res) => {
  try {
    // Allow cron-job.org to call this endpoint
    const apiKey = req.headers['x-api-key'];

    // Only check API key if it's provided (optional for backward compatibility)
    if (apiKey && apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    const { user_id, week_start } = req.body;
    const userId = user_id || process.env.DEFAULT_USER_ID;

    console.log('📧 Sending weekly summary email for user:', userId);

    // Calculate week start (Monday of current week)
    const now = new Date();
    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1); // Get Monday of current week
    const weekStart = week_start || monday.toISOString().split('T')[0];

    // Get user email preferences
    const preferences = await summaryService.getUserEmailPreferences(userId);

    if (!preferences.enabled || !preferences.email || !preferences.weekly_summary) {
      return res.json({ success: true, message: 'Weekly summary disabled for user' });
    }

    // Generate weekly summary data
    const summaryData = await summaryService.generateWeeklySummary(userId, weekStart);

    // Generate email HTML
    const emailHtml = generateWeeklySummaryTemplate(summaryData);

    // Send email
    const success = await emailService.sendEmail(
      preferences.email,
      `Weekly Health Report - Week of ${new Date(weekStart).toLocaleDateString()}`,
      emailHtml
    );

    if (success) {
      res.json({ success: true, message: 'Weekly summary email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send weekly summary email' });
    }
  } catch (error) {
    console.error('Error sending weekly summary email:', error);
    res.status(500).json({ success: false, message: 'Failed to send weekly summary email' });
  }
});

// Send monthly summary email (for cron job)
router.post('/email/send-monthly-summary', async (req, res) => {
  try {
    // Allow cron-job.org to call this endpoint
    const apiKey = req.headers['x-api-key'];

    // Only check API key if it's provided (optional for backward compatibility)
    if (apiKey && apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ success: false, message: 'Invalid API key' });
    }

    const { user_id, month, year } = req.body;
    const userId = user_id || process.env.DEFAULT_USER_ID;

    console.log('📧 Sending monthly summary email for user:', userId);

    // Get current month/year if not provided
    const now = new Date();
    const targetMonth = month || (now.getMonth() + 1);
    const targetYear = year || now.getFullYear();

    // Get user email preferences
    const preferences = await summaryService.getUserEmailPreferences(userId);

    if (!preferences.enabled || !preferences.email || !preferences.monthly_summary) {
      return res.json({ success: true, message: 'Monthly summary disabled for user' });
    }

    // Generate monthly summary data
    const summaryData = await summaryService.generateMonthlySummary(userId, targetMonth, targetYear);

    // Generate email HTML
    const emailHtml = generateMonthlySummaryTemplate(summaryData);

    // Send email
    const success = await emailService.sendEmail(
      preferences.email,
      `Monthly Health Report - ${new Date(targetYear, targetMonth - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`,
      emailHtml
    );

    if (success) {
      res.json({ success: true, message: 'Monthly summary email sent successfully' });
    } else {
      res.status(500).json({ success: false, message: 'Failed to send monthly summary email' });
    }
  } catch (error) {
    console.error('Error sending monthly summary email:', error);
    res.status(500).json({ success: false, message: 'Failed to send monthly summary email' });
  }
});

export default router;
