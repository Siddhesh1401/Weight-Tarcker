import express from 'express';
import webpush from 'web-push';

const router = express.Router();

// VAPID keys for web push
// TODO: Move these to environment variables in Vercel dashboard
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BHUxpw8ggEg1ONIp4_fKVTih4nGhpVa4NRliHMPHSIsrO-TfkpmeZRAkcNX2ysdY0ERYYcpT3Rzc00IN-TePwSk';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'rZnl2k2rB4VsDqWBxLHMXOTObUCxklfc4CWjGvewQvo';

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

// In-memory storage for subscriptions
// NOTE: In serverless, this will reset on each cold start
// For production, use a database (MongoDB, Redis, etc.)
const subscriptions = new Map();
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
    
    // Send a welcome notification
    const payload = JSON.stringify({
      title: '🎉 Subscribed!',
      body: 'Push notifications are now enabled. You can test them from the settings page.',
      icon: '/favicon.svg',
      badge: '/favicon.svg'
    });

    try {
      await webpush.sendNotification(subscription, payload);
    } catch (error) {
      console.log('Failed to send welcome notification:', error.message);
      // Don't fail the subscription if welcome notification fails
    }

    res.json({ 
      success: true,
      message: 'Subscribed successfully',
      note: 'Serverless deployment: scheduled notifications run via client-side timers'
    });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
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

    console.log(`✅ User ${userId} unsubscribed from push notifications`);

    res.json({ success: true, message: 'Unsubscribed successfully' });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({ error: 'Failed to unsubscribe' });
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

    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Test notification endpoint
router.post('/test', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    const subscription = subscriptions.get(userId);
    
    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found for this user' });
    }

    const payload = JSON.stringify({
      title: '🧪 Test Notification',
      body: 'Server push is working! This notification was sent from your backend.',
      icon: '/favicon.svg',
      badge: '/favicon.svg',
      tag: 'test-notification'
    });

    await webpush.sendNotification(subscription, payload);

    console.log(`✅ Test notification sent to user ${userId}`);

    res.json({ 
      success: true, 
      message: 'Test notification sent',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test notification error:', error);
    
    // If subscription is invalid, remove it
    if (error.statusCode === 410) {
      const { userId } = req.body;
      subscriptions.delete(userId);
      return res.status(410).json({ error: 'Subscription expired' });
    }
    
    res.status(500).json({ 
      error: 'Failed to send test notification',
      details: error.message 
    });
  }
});

// Get subscription status
router.get('/status/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const hasSubscription = subscriptions.has(userId);
    const settings = userSettings.get(userId);

    res.json({
      subscribed: hasSubscription,
      settings: settings || null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check status' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Push notification service is running (serverless)',
    activeSubscriptions: subscriptions.size,
    vapidConfigured: !!VAPID_PUBLIC_KEY && !!VAPID_PRIVATE_KEY,
    note: 'Scheduled notifications handled by client-side service worker'
  });
});

export default router;
