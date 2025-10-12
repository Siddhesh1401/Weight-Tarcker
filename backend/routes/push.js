import express from 'express';
import webpush from 'web-push';
import cron from 'node-cron';
import User from '../models/User.js';

const router = express.Router();

// VAPID keys for web push (these should be in .env in production)
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BHUxpw8ggEg1ONIp4_fKVTih4nGhpVa4NRliHMPHSIsrO-TfkpmeZRAkcNX2ysdY0ERYYcpT3Rzc00IN-TePwSk';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'rZnl2k2rB4VsDqWBxLHMXOTObUCxklfc4CWjGvewQvo';

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || 'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// In-memory storage for subscriptions (use database in production)
const subscriptions = new Map();

// Store user notification settings and timezone (use database in production)
const userSettings = new Map();
const userTimezones = new Map();

// Load notification settings from database
async function loadNotificationSettings() {
  try {
    console.log('🔄 Loading notification settings and subscriptions from database...');
    const users = await User.find({
      $or: [
        { 'push_notifications.enabled': true },
        { push_subscription: { $exists: true } }
      ]
    });

    for (const user of users) {
      // Load notification settings
      if (user.push_notifications) {
        userSettings.set(user._id, user.push_notifications);
        console.log(`✅ Loaded settings for user ${user._id}`);
      }

      // Load push subscription
      if (user.push_subscription) {
        subscriptions.set(user._id, user.push_subscription);
        console.log(`✅ Loaded subscription for user ${user._id}`);
      }
    }

    console.log(`📊 Loaded data for ${users.length} users`);
  } catch (error) {
    console.error('❌ Error loading notification settings:', error);
  }
}

// Initialize settings on startup
loadNotificationSettings();

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, userId, settings, timezone } = req.body;

    if (!subscription || !userId) {
      return res.status(400).json({ error: 'Missing subscription or userId' });
    }

    // Store subscription in memory
    subscriptions.set(userId, subscription);

    // Save subscription to database
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          push_subscription: subscription
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Store user settings in database and memory
    if (settings) {
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $set: {
            push_notifications: {
              ...settings,
              enabled: true
            }
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
      userSettings.set(userId, settings);
    }

    // Store user timezone in memory (for now - could be saved to user profile later)
    if (timezone) {
      userTimezones.set(userId, timezone);
      console.log(`🌍 Stored timezone for user ${userId}: ${timezone}`);
    } else {
      userTimezones.set(userId, 'Asia/Kolkata'); // Default to IST
      console.log(`🌍 Defaulted timezone for user ${userId} to IST`);
    }

    console.log(`✅ User ${userId} subscribed to push notifications`);

    // Send a test notification
    const payload = JSON.stringify({
      title: '🎉 Subscribed!',
      body: 'You will now receive meal and health reminders',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });

    try {
      await webpush.sendNotification(subscription, payload);
      console.log('✅ Test notification sent successfully');
    } catch (notifError) {
      // Log the error but don't fail the subscription
      console.warn('⚠️ Could not send test notification:', notifError.message);
      // If it's an FCM endpoint issue, log detailed info
      if (notifError.statusCode === 404 && subscription.endpoint?.includes('fcm.googleapis.com')) {
        console.warn('💡 FCM endpoint format may need updating. Subscription saved but test notification failed.');
      }
    }

    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});// Update user notification settings
router.post('/update-settings', async (req, res) => {
  try {
    const { userId, settings } = req.body;
    
    if (!userId || !settings) {
      return res.status(400).json({ error: 'Missing userId or settings' });
    }

    // Save to database
    const user = await User.findOneAndUpdate(
      { _id: userId },
      { 
        $set: { 
          push_notifications: {
            ...settings,
            enabled: true // Always enable if they're updating settings
          }
        }
      },
      { 
        upsert: true, 
        new: true,
        setDefaultsOnInsert: true
      }
    );

    // Also update in-memory cache for immediate effect
    userSettings.set(userId, settings);
    console.log(`✅ Updated and saved settings for user ${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Remove from memory
    subscriptions.delete(userId);
    userSettings.delete(userId);
    userTimezones.delete(userId);

    // Remove subscription from database and disable notifications
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $unset: { push_subscription: 1 },
        $set: {
          'push_notifications.enabled': false
        }
      }
    );

    console.log(`✅ User ${userId} unsubscribed and disabled push notifications`);

    res.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current notification settings for a user
router.get('/settings/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const user = await User.findOne({ _id: userId });

    if (!user || !user.push_notifications) {
      return res.json({
        enabled: false,
        breakfastTime: '08:00',
        lunchTime: '13:00',
        dinnerTime: '20:00',
        weightReminder: false,
        weightTime: '07:00',
        sleepReminder: false,
        sleepTime: '22:00',
        waterReminder: false,
        waterInterval: 2,
        motivationalQuotes: false,
        quoteTime: '09:00'
      });
    }

    res.json(user.push_notifications);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send notification to specific user
async function sendNotificationToUser(userId, notificationData) {
  let subscription = subscriptions.get(userId);

  // If not in memory, try to load from database
  if (!subscription) {
    try {
      const user = await User.findOne({ _id: userId });
      if (user && user.push_subscription) {
        subscription = user.push_subscription;
        subscriptions.set(userId, subscription); // Cache it in memory
        console.log(`📥 Loaded subscription from database for user ${userId}`);
      }
    } catch (error) {
      console.error(`❌ Error loading subscription for user ${userId}:`, error);
    }
  }

  if (!subscription) {
    console.log(`⚠️ No subscription found for user ${userId}`);
    return false;
  }

  try {
    const payload = JSON.stringify(notificationData);
    await webpush.sendNotification(subscription, payload);
    console.log(`✅ Notification sent to user ${userId}:`, notificationData.title);
    return true;
  } catch (error) {
    // Handle specific error cases
    if (error.statusCode === 410) {
      console.log(`🗑️ Removing expired subscription for user ${userId}`);
      subscriptions.delete(userId);
      userSettings.delete(userId);
      userTimezones.delete(userId);
      // Also remove from database
      await User.findOneAndUpdate(
        { _id: userId },
        { $unset: { push_subscription: 1 } }
      );
    } else if (error.statusCode === 404) {
      console.warn(`⚠️ Invalid endpoint for user ${userId} (404) - may need resubscription`);
      // Don't delete immediately, could be temporary FCM issue
    } else if (error.statusCode === 400) {
      console.warn(`⚠️ Bad request for user ${userId} (400) - check payload format`);
    } else if (error.statusCode === 413) {
      console.warn(`⚠️ Payload too large for user ${userId} (413)`);
    } else {
      console.error(`❌ Error sending notification to user ${userId}:`, error.message);
    }

    return false;
  }
}

// Send notification to all users
async function sendNotificationToAll(notificationData) {
  try {
    // Get all users with push notifications enabled
    const users = await User.find({
      'push_notifications.enabled': true,
      push_subscription: { $exists: true }
    });

    const promises = [];

    for (const user of users) {
      promises.push(sendNotificationToUser(user._id, notificationData));
    }

    await Promise.all(promises);
    console.log(`✅ Sent notification to ${users.length} users`);
  } catch (error) {
    console.error('❌ Error sending notification to all users:', error);
  }
}

// Scheduled notifications using cron
function setupScheduledNotifications() {
  console.log('⏰ Setting up scheduled push notifications...');

  // Clear existing cron jobs to avoid duplicates
  if (global.cronJobs) {
    global.cronJobs.forEach(job => job.destroy());
  }
  global.cronJobs = [];

  // Helper function to schedule user-specific notifications with timezone support
  const scheduleUserNotification = (userId, settings, timezone, type, title, body, defaultTime) => {
    const time = settings[`${type}Time`] || defaultTime;
    const [hours, minutes] = time.split(':').map(Number);

    // Calculate UTC time based on user's timezone
    // For now, we'll use a simple offset calculation
    // In production, consider using a proper timezone library like 'moment-timezone'
    let utcHours = hours;
    let utcMinutes = minutes;

    // Simple timezone offset calculation (basic implementation)
    // This could be enhanced with a proper timezone library
    if (timezone === 'Asia/Kolkata') {
      // IST (UTC+5:30)
      utcHours = (hours - 5) % 24;
      utcMinutes = (minutes - 30 + 60) % 60;
      if (utcMinutes > minutes) utcHours = (utcHours - 1 + 24) % 24;
    } else if (timezone.includes('UTC+')) {
      const offset = parseInt(timezone.split('UTC+')[1]);
      utcHours = (hours - offset) % 24;
    } else if (timezone.includes('UTC-')) {
      const offset = parseInt(timezone.split('UTC-')[1]);
      utcHours = (hours + offset) % 24;
    }
    // Add more timezone support as needed

    // Create cron schedule in UTC (minute hour * * *)
    const cronTime = `${utcMinutes} ${utcHours} * * *`;

    console.log(`📅 Scheduling ${type} for user ${userId}: ${time} (${timezone}) → ${cronTime} UTC`);

    const job = cron.schedule(cronTime, () => {
      console.log(`🔔 Sending ${type} notification to user ${userId} (${timezone})`);
      sendNotificationToUser(userId, {
        title,
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: type,
        data: { url: '/' }
      });
    });

    global.cronJobs.push(job);
  };

  // Schedule notifications for all users every hour (to catch new users/settings changes)
  cron.schedule('0 * * * *', () => {
    console.log('🔄 Checking for notification updates...');

    // Clear existing cron jobs before creating new ones to prevent memory leaks
    if (global.cronJobs) {
      console.log(`🧹 Cleaning up ${global.cronJobs.length} existing cron jobs...`);
      global.cronJobs.forEach(job => job.destroy());
      global.cronJobs = [];
    }

    userSettings.forEach((settings, userId) => {
      if (!settings.enabled) return;

      const timezone = userTimezones.get(userId) || 'Asia/Kolkata'; // Default to IST

      // Schedule meal reminders
      const breakfastTime = settings.breakfastTime || '08:00';
      const lunchTime = settings.lunchTime || '13:00';
      const dinnerTime = settings.dinnerTime || '20:00';
      scheduleUserNotification(userId, settings, timezone, 'breakfast', '🍳 Breakfast Time!', 'Don\'t forget to log your breakfast', breakfastTime);
      scheduleUserNotification(userId, settings, timezone, 'lunch', '🍽️ Lunch Time!', 'Remember to log your lunch', lunchTime);
      scheduleUserNotification(userId, settings, timezone, 'dinner', '🍲 Dinner Time!', 'Time to log your dinner', dinnerTime);

      // Schedule weight reminder
      if (settings.weightReminder) {
        const weightTime = settings.weightTime || '07:00';
        scheduleUserNotification(userId, settings, timezone, 'weight', '⚖️ Weight Check', 'Log your weight for today', weightTime);
      }

      // Schedule sleep reminder
      if (settings.sleepReminder) {
        const sleepTime = settings.sleepTime || '22:00';
        scheduleUserNotification(userId, settings, timezone, 'sleep', '😴 Sleep Reminder', 'Don\'t forget to log your sleep from yesterday', sleepTime);
      }

      // Schedule motivational quote
      if (settings.motivationalQuotes) {
        const quoteTime = settings.quoteTime || '09:00';
        scheduleUserNotification(userId, settings, timezone, 'motivation', '✨ Daily Motivation',
          [
            'Every small step counts! Keep going! 💪',
            'You\'re doing great! Stay consistent! 🌟',
            'Believe in yourself! You can do this! 🎯',
            'Progress, not perfection! 📈',
            'Your health is an investment! 💚',
          ][Math.floor(Math.random() * 5)], quoteTime);
      }
    });
  });

  // Dynamic water reminders based on user settings
  const setupWaterReminders = () => {
    // Clear existing water reminder jobs
    if (global.waterJobs) {
      global.waterJobs.forEach(job => job.destroy());
    }
    global.waterJobs = [];

    userSettings.forEach((settings, userId) => {
      if (!settings.enabled || !settings.waterReminder) return;

      const timezone = userTimezones.get(userId) || 'Asia/Kolkata';
      const interval = settings.waterInterval || 2; // hours

      // Calculate timezone-adjusted hours for waking hours (8 AM - 10 PM in user's timezone)
      let startHour = 8; // 8 AM
      let endHour = 22;  // 10 PM

      // Adjust for timezone offset (simplified)
      if (timezone === 'Asia/Kolkata') {
        // IST is UTC+5:30, so 8 AM IST = 2:30 AM UTC, 10 PM IST = 4:30 PM UTC
        // For simplicity, we'll keep the same hours but log the timezone
      }

      const cronExpression = `0 */${interval} ${startHour}-${endHour} * * *`; // Every N hours during waking hours

      console.log(`💧 Setting up water reminders for user ${userId} (${timezone}): every ${interval} hours during ${startHour}-${endHour}`);

      const job = cron.schedule(cronExpression, () => {
        console.log(`💧 Sending water reminder to user ${userId} (${timezone})`);
        sendNotificationToUser(userId, {
          title: '💧 Hydration Reminder',
          body: 'Time to drink some water!',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'water',
        });
      });

      global.waterJobs.push(job);
    });
  };

  // Set up water reminders initially
  setupWaterReminders();

  // Update water reminders when settings change (check every 30 minutes)
  cron.schedule('*/30 * * * *', setupWaterReminders);

  console.log('✅ Dynamic scheduled notifications configured');
}

// Initialize scheduled notifications
setupScheduledNotifications();

// Test endpoint to send immediate notification
router.post('/test', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const sent = await sendNotificationToUser(userId, {
      title: '🧪 Test Notification',
      body: 'Server-side push is working!',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'test',
    });

    if (sent) {
      res.json({ success: true, message: 'Test notification sent' });
    } else {
      res.status(404).json({ error: 'User not subscribed' });
    }
  } catch (error) {
    console.error('Test notification error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Validate subscription endpoint
router.post('/validate-subscription', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const subscription = subscriptions.get(userId);
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found for user' });
    }

    // Try to send a minimal test notification to validate the subscription
    try {
      const testPayload = JSON.stringify({
        title: '🔍 Subscription Check',
        body: 'Validating your subscription...',
        icon: '/favicon.svg',
        tag: 'validation',
        silent: true // Don't show to user
      });
      
      await webpush.sendNotification(subscription, testPayload);
      console.log(`✅ Subscription validated for user ${userId}`);
      res.json({ valid: true, message: 'Subscription is valid' });
    } catch (validationError) {
      console.warn(`⚠️ Subscription validation failed for user ${userId}:`, validationError.message);
      
      // If validation fails, remove the subscription
      if (validationError.statusCode === 410 || validationError.statusCode === 404) {
        subscriptions.delete(userId);
        userSettings.delete(userId);
        userTimezones.delete(userId);
        console.log(`🗑️ Removed invalid subscription for user ${userId}`);
      }
      
      res.json({ valid: false, error: validationError.message });
    }
  } catch (error) {
    console.error('Subscription validation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check user notification status
router.get('/debug/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const subscription = subscriptions.get(userId);
    const settings = userSettings.get(userId);
    const timezone = userTimezones.get(userId);
    
    res.json({
      userId,
      hasSubscription: !!subscription,
      settings,
      timezone: timezone || 'Asia/Kolkata (default)',
      serverTime: new Date().toISOString(),
      subscriptionPreview: subscription ? {
        endpoint: subscription.endpoint?.substring(0, 50) + '...',
        keys: subscription.keys ? 'present' : 'missing'
      } : null
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send scheduled reminder notifications (called by cron jobs)
router.post('/send-reminder', async (req, res) => {
  try {
    const { reminderType, userId, apiKey } = req.body;

    console.log(`🔔 Processing ${reminderType} reminder for user ${userId}`);

    if (!reminderType || !userId) {
      return res.status(400).json({ error: 'Missing reminderType or userId' });
    }

    // Verify API key if provided
    if (apiKey && apiKey !== process.env.CRON_API_KEY) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    // Get user settings from database
    const user = await User.findOne({ _id: userId });
    if (!user || !user.push_notifications) {
      console.log(`⚠️ No push notification settings found for user ${userId}`);
      return res.json({ success: false, message: 'User not found or notifications disabled' });
    }

    const settings = user.push_notifications;

    // Check if this type of reminder is enabled
    const reminderEnabled = {
      breakfast: settings.breakfastTime && settings.enabled,
      lunch: settings.lunchTime && settings.enabled,
      dinner: settings.dinnerTime && settings.enabled,
      sleep: settings.sleepReminder && settings.enabled,
      weight: settings.weightReminder && settings.enabled,
      water: settings.waterReminder && settings.enabled,
      quotes: settings.motivationalQuotes && settings.enabled
    };

    if (!reminderEnabled[reminderType]) {
      console.log(`⚠️ ${reminderType} reminder is disabled for user ${userId}`);
      return res.json({ success: false, message: `${reminderType} reminder is disabled` });
    }

    // Define reminder messages
    const reminderMessages = {
      breakfast: {
        title: '🍳 Breakfast Time!',
        body: 'Time to start your day with a healthy breakfast!'
      },
      lunch: {
        title: '🍽️ Lunch Time!',
        body: 'Fuel your body with a nutritious lunch!'
      },
      dinner: {
        title: '🍽️ Dinner Time!',
        body: 'Enjoy a balanced dinner to end your day right!'
      },
      sleep: {
        title: '😴 Bedtime Reminder',
        body: 'Time to wind down and get some rest!'
      },
      weight: {
        title: '⚖️ Weight Check',
        body: 'Don\'t forget to log your weight today!'
      },
      water: {
        title: '💧 Hydration Reminder',
        body: 'Stay hydrated! Drink some water now.'
      },
      quotes: {
        title: '💪 Stay Motivated',
        body: 'Every small step counts towards your goals!'
      }
    };

    const message = reminderMessages[reminderType];
    if (!message) {
      return res.status(400).json({ error: 'Invalid reminder type' });
    }

    // Send the notification
    const sent = await sendNotificationToUser(userId, {
      title: message.title,
      body: message.body,
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: `reminder-${reminderType}`,
      requireInteraction: false,
      actions: [
        {
          action: 'open',
          title: 'Open App'
        }
      ]
    });

    if (sent) {
      console.log(`✅ ${reminderType} reminder sent to user ${userId}`);
      res.json({ success: true, message: `${reminderType} reminder sent` });
    } else {
      console.log(`⚠️ ${reminderType} reminder failed - no subscription for user ${userId}`);
      res.json({ success: false, message: 'No subscription found' });
    }
  } catch (error) {
    console.error('Send reminder error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
