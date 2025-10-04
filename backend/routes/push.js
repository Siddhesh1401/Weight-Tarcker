import express from 'express';
import webpush from 'web-push';
import cron from 'node-cron';

const router = express.Router();

// VAPID keys for web push (these should be in .env in production)
const VAPID_PUBLIC_KEY = 'BHUxpw8ggEg1ONIp4_fKVTih4nGhpVa4NRliHMPHSIsrO-TfkpmeZRAkcNX2ysdY0ERYYcpT3Rzc00IN-TePwSk';
const VAPID_PRIVATE_KEY = 'rZnl2k2rB4VsDqWBxLHMXOTObUCxklfc4CWjGvewQvo';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// In-memory storage for subscriptions (use database in production)
const subscriptions = new Map();

// Store user notification settings (use database in production)
const userSettings = new Map();

// Get VAPID public key
router.get('/vapid-public-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// Subscribe to push notifications
router.post('/subscribe', async (req, res) => {
  try {
    const { subscription, userId, settings } = req.body;
    
    if (!subscription || !userId) {
      return res.status(400).json({ error: 'Missing subscription or userId' });
    }

    // Store subscription
    subscriptions.set(userId, subscription);
    
    // Store user settings if provided
    if (settings) {
      userSettings.set(userId, settings);
    }

    console.log(`✅ User ${userId} subscribed to push notifications`);
    
    // Send a test notification
    const payload = JSON.stringify({
      title: '🎉 Subscribed!',
      body: 'You will now receive meal and health reminders',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
    });

    await webpush.sendNotification(subscription, payload);
    
    res.json({ success: true, message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user notification settings
router.post('/update-settings', (req, res) => {
  try {
    const { userId, settings } = req.body;
    
    if (!userId || !settings) {
      return res.status(400).json({ error: 'Missing userId or settings' });
    }

    userSettings.set(userId, settings);
    console.log(`✅ Updated settings for user ${userId}`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Unsubscribe from push notifications
router.post('/unsubscribe', (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    subscriptions.delete(userId);
    userSettings.delete(userId);
    
    console.log(`✅ User ${userId} unsubscribed`);
    
    res.json({ success: true });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Send notification to specific user
async function sendNotificationToUser(userId, notificationData) {
  const subscription = subscriptions.get(userId);
  
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
    console.error(`❌ Error sending notification to user ${userId}:`, error);
    
    // Remove invalid subscription
    if (error.statusCode === 410) {
      console.log(`🗑️ Removing expired subscription for user ${userId}`);
      subscriptions.delete(userId);
    }
    
    return false;
  }
}

// Send notification to all users
async function sendNotificationToAll(notificationData) {
  const promises = [];
  
  for (const [userId, subscription] of subscriptions.entries()) {
    promises.push(sendNotificationToUser(userId, notificationData));
  }
  
  await Promise.all(promises);
}

// Scheduled notifications using cron
function setupScheduledNotifications() {
  console.log('⏰ Setting up scheduled push notifications...');

  // Helper function to send scheduled notification
  const sendScheduledNotification = (type, defaultTime, title, body) => {
    userSettings.forEach((settings, userId) => {
      if (settings.enabled) {
        const time = settings[`${type}Time`] || defaultTime;
        const [hours, minutes] = time.split(':');
        
        // Create cron schedule (minute hour * * *)
        const cronTime = `${minutes} ${hours} * * *`;
        
        cron.schedule(cronTime, () => {
          sendNotificationToUser(userId, {
            title,
            body,
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: type,
          });
        });
      }
    });
  };

  // Breakfast reminder (default 8:00 AM)
  cron.schedule('0 8 * * *', () => {
    userSettings.forEach((settings, userId) => {
      if (settings.enabled) {
        const time = settings.breakfastTime || '08:00';
        const [hours, minutes] = time.split(':');
        const now = new Date();
        
        if (now.getHours() === parseInt(hours) && now.getMinutes() === parseInt(minutes)) {
          sendNotificationToUser(userId, {
            title: '🍳 Breakfast Time!',
            body: 'Don\'t forget to log your breakfast',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: 'breakfast',
            data: { url: '/' }
          });
        }
      }
    });
  });

  // Lunch reminder (default 1:00 PM)
  cron.schedule('0 13 * * *', () => {
    userSettings.forEach((settings, userId) => {
      if (settings.enabled) {
        const time = settings.lunchTime || '13:00';
        const [hours, minutes] = time.split(':');
        const now = new Date();
        
        if (now.getHours() === parseInt(hours) && now.getMinutes() === parseInt(minutes)) {
          sendNotificationToUser(userId, {
            title: '🍽️ Lunch Time!',
            body: 'Remember to log your lunch',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: 'lunch',
            data: { url: '/' }
          });
        }
      }
    });
  });

  // Dinner reminder (default 8:00 PM)
  cron.schedule('0 20 * * *', () => {
    userSettings.forEach((settings, userId) => {
      if (settings.enabled) {
        const time = settings.dinnerTime || '20:00';
        const [hours, minutes] = time.split(':');
        const now = new Date();
        
        if (now.getHours() === parseInt(hours) && now.getMinutes() === parseInt(minutes)) {
          sendNotificationToUser(userId, {
            title: '🍲 Dinner Time!',
            body: 'Time to log your dinner',
            icon: '/favicon.svg',
            badge: '/favicon.svg',
            tag: 'dinner',
            data: { url: '/' }
          });
        }
      }
    });
  });

  // Weight reminder (default 7:00 AM)
  cron.schedule('0 7 * * *', () => {
    userSettings.forEach((settings, userId) => {
      if (settings.enabled && settings.weightReminder) {
        sendNotificationToUser(userId, {
          title: '⚖️ Weight Check',
          body: 'Log your weight for today',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'weight',
          data: { url: '/' }
        });
      }
    });
  });

  // Sleep reminder (default 10:00 PM)
  cron.schedule('0 22 * * *', () => {
    userSettings.forEach((settings, userId) => {
      if (settings.enabled && settings.sleepReminder) {
        sendNotificationToUser(userId, {
          title: '😴 Sleep Reminder',
          body: 'Don\'t forget to log your sleep from yesterday',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'sleep',
          data: { url: '/' }
        });
      }
    });
  });

  // Motivational quote (default 9:00 AM)
  cron.schedule('0 9 * * *', () => {
    const quotes = [
      'Every small step counts! Keep going! 💪',
      'You\'re doing great! Stay consistent! 🌟',
      'Believe in yourself! You can do this! 🎯',
      'Progress, not perfection! 📈',
      'Your health is an investment! 💚',
    ];
    
    userSettings.forEach((settings, userId) => {
      if (settings.enabled && settings.motivationalQuotes) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        sendNotificationToUser(userId, {
          title: '✨ Daily Motivation',
          body: randomQuote,
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'motivation',
        });
      }
    });
  });

  // Water reminder (every 2 hours during waking hours)
  cron.schedule('0 */2 8-22 * * *', () => {
    userSettings.forEach((settings, userId) => {
      if (settings.enabled && settings.waterReminder) {
        sendNotificationToUser(userId, {
          title: '💧 Hydration Reminder',
          body: 'Time to drink some water!',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'water',
        });
      }
    });
  });

  console.log('✅ Scheduled notifications configured');
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

export default router;
