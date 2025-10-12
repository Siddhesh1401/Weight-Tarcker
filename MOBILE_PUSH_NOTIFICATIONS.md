# Mobile Push Notification System Documentation

## Overview

The Weight Tracker app implements a comprehensive push notification system that delivers reminders to users even when the Progressive Web App (PWA) is closed or running in the background. The system combines local notifications (when the app is open) with server-side cron jobs (when the app is closed) to ensure reliable delivery.

## Architecture

### Components

1. **Frontend (React/TypeScript)**
   - `NotificationSettings.tsx` - UI for managing notification preferences
   - `pushNotifications.ts` - Client-side push notification service
   - `notifications.ts` - Local notification service
   - Service Worker (`sw.js`) - Handles push events and background notifications

2. **Backend (Node.js/Express)**
   - `routes/push.js` - Push notification subscription and sending
   - `routes/cronJobs.js` - Cron job management for background delivery
   - `services/cronJobOrgService.js` - Integration with cron-job.org API
   - `models/User.js` - Database schema for notification settings

3. **External Services**
   - **cron-job.org** - Scheduled task execution for background notifications
   - **Web Push API** - Browser push notification delivery
   - **VAPID** - Voluntary Application Server Identification for Web Push

4. **Database (MongoDB)**
   - User notification settings storage
   - Push subscription management
   - Email notification preferences (separate system)

## Notification Types

### 1. Meal Reminders
- **Breakfast** - Default: 08:00
- **Lunch** - Default: 13:00
- **Dinner** - Default: 20:00
- **Enabled by**: `mealReminders: true` setting

### 2. Health Reminders
- **Weight Check** - Default: 07:00, enabled by `weightReminder: true`
- **Sleep Log** - Default: 22:00, enabled by `sleepReminder: true`
- **Water Intake** - Every 2 hours (configurable), enabled by `waterReminder: true`

### 3. Motivational Content
- **Daily Quotes** - Default: 09:00, enabled by `motivationalQuotes: true`

## How It Works

### Dual Notification System

The app uses a **hybrid approach** combining local and server-side notifications:

#### Local Notifications (App Open)
- Uses browser `Notification` API
- Scheduled via `setTimeout` and `setInterval`
- Works only when app is running
- Immediate delivery, no external dependencies

#### Server-Side Cron Jobs (App Closed)
- Uses cron-job.org for scheduled execution
- Makes HTTP requests to backend API
- Delivers push notifications via Web Push API
- Works when app is closed or backgrounded

### Notification Flow

```
1. User enables notifications in settings
2. Browser permission requested
3. Push subscription created with VAPID keys
4. Subscription sent to server and stored in database
5. Cron jobs created for enabled reminders
6. When app is closed: cron-job.org calls backend API
7. Backend sends push notification via Web Push API
8. Service Worker receives push event and shows notification
9. User clicks notification → app opens to relevant page
```

## Configuration

### Environment Variables

```bash
# VAPID Keys for Web Push
VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here

# Cron-Job.org API
CRON_JOB_ORG_API_KEY=your_api_key_here
CRON_JOB_ORG_EMAIL=your_email@example.com

# Backend URL (for cron job callbacks)
BACKEND_URL=https://your-app.vercel.app
```

### VAPID Key Generation

```bash
# Install web-push library
npm install -g web-push

# Generate VAPID keys
web-push generate-vapid-keys
```

### Cron-Job.org Setup

1. Sign up at [cron-job.org](https://cron-job.org)
2. Get API key from account settings
3. Set API key in environment variables
4. Ensure backend URL is accessible from cron-job.org

## API Endpoints

### Push Notification Endpoints

#### `GET /api/push/vapid-public-key`
Returns the VAPID public key for client-side subscription.

#### `POST /api/push/subscribe`
Subscribes a user to push notifications.
```json
{
  "subscription": { /* Web Push subscription object */ },
  "userId": "user_123",
  "settings": { /* notification settings */ },
  "timezone": "Asia/Kolkata"
}
```

#### `POST /api/push/update-settings`
Updates user notification settings.
```json
{
  "userId": "user_123",
  "settings": { /* updated settings */ }
}
```

#### `POST /api/push/test`
Sends a test push notification to verify the system.

#### `POST /api/push/send-reminder`
Endpoint called by cron jobs to send reminders.
```json
{
  "reminderType": "breakfast",
  "userId": "user_123"
}
```

### Cron Job Management Endpoints

#### `POST /api/cron-jobs/setup-push-reminders`
Creates cron jobs for all enabled push notification reminders.
```json
{
  "backendUrl": "https://your-app.vercel.app",
  "apiKey": "cron-job-org-api-key",
  "userId": "user_123"
}
```

#### `GET /api/cron-jobs`
Lists all cron jobs for the authenticated user.

#### `DELETE /api/cron-jobs/:jobId`
Deletes a specific cron job.

## Database Schema

### User Model (MongoDB)

```javascript
{
  _id: "user_123",
  push_notifications: {
    enabled: true,
    breakfastTime: "08:00",
    lunchTime: "13:00",
    dinnerTime: "20:00",
    weightReminder: false,
    weightTime: "07:00",
    sleepReminder: true,
    sleepTime: "22:00",
    waterReminder: false,
    waterInterval: 2,
    motivationalQuotes: false,
    quoteTime: "09:00"
  },
  push_subscription: {
    endpoint: "https://fcm.googleapis.com/fcm/send/...",
    keys: {
      p256dh: "...",
      auth: "..."
    }
  }
}
```

## Client-Side Implementation

### NotificationSettings Component

The main UI for managing notifications includes:

- **Master Toggle**: Enables/disables all notifications
- **Quick Presets**: Early (06:00-21:00), Standard (08:00-22:00), Night (10:00-23:00)
- **Individual Toggles**: For each reminder type
- **Time Pickers**: Custom scheduling for each reminder
- **Test Buttons**: Local and server-side notification testing

### Push Notification Service

Handles:
- VAPID key retrieval
- Push subscription creation
- Settings synchronization with server
- Test notification sending

### Local Notification Service

Manages:
- Browser permission requests
- Local notification scheduling
- Notification display when app is open

### Service Worker

Handles background push notifications:

```javascript
// Push event handler
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    vibrate: [200, 100, 200],
    tag: data.tag,
    actions: [
      { action: 'open', title: 'Open App' },
      { action: 'close', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
```

## Server-Side Implementation

### Push Route Handler

Manages:
- VAPID key distribution
- Subscription storage
- Settings updates
- Notification sending via web-push library

### Cron Job Creation

The system creates cron jobs for each enabled reminder:

```javascript
// Example cron job creation for sleep reminder
const jobData = {
  url: `${backendUrl}/api/push/send-reminder`,
  enabled: true,
  title: 'Weight Tracker - Sleep Reminder',
  schedule: {
    timezone: 'Asia/Kolkata',
    hours: [22],    // 10 PM
    minutes: [0],   // :00
    mdays: [-1],    // Every day
    months: [-1],   // Every month
    wdays: [-1]     // Every weekday
  },
  headers: [{ key: 'Content-Type', value: 'application/json' }],
  body: JSON.stringify({
    reminderType: 'sleep',
    userId: userId
  })
};
```

## Timezone Handling

The system supports timezone-aware scheduling:

- **Client**: Detects user timezone via `Intl.DateTimeFormat().resolvedOptions().timeZone`
- **Server**: Stores timezone with user settings
- **Cron Jobs**: Uses user's timezone for accurate scheduling

Currently optimized for `Asia/Kolkata` (IST) but extensible to other timezones.

## Troubleshooting

### Common Issues

#### 1. Notifications Not Working When App is Closed

**Symptoms**: Local notifications work, but no notifications when app is closed.

**Causes**:
- Cron jobs not created
- Push subscription failed
- VAPID keys incorrect
- Service worker not registered

**Solutions**:
1. Check cron-job.org dashboard for job status
2. Verify push subscription in browser dev tools
3. Test VAPID keys with web-push library
4. Ensure service worker is active

#### 2. Cron Jobs Return 0 Created

**Symptoms**: `setup-push-reminders` endpoint returns empty jobs array.

**Debug Steps**:
1. Check server logs for settings retrieval
2. Verify user has push notifications enabled in database
3. Ensure individual reminder toggles are enabled
4. Check cron-job.org API key validity

#### 3. Push Notifications Not Delivered

**Symptoms**: Cron jobs run but no notifications appear.

**Causes**:
- Push subscription expired
- FCM endpoint issues (Android)
- Service worker not handling push events
- Notification permission revoked

**Solutions**:
1. Re-subscribe to push notifications
2. Check service worker registration
3. Verify notification permissions
4. Test with direct push endpoint

### Debug Commands

#### Check Push Subscription
```javascript
// In browser console
navigator.serviceWorker.ready.then(registration => {
  return registration.pushManager.getSubscription();
}).then(subscription => {
  console.log('Push subscription:', subscription);
});
```

#### Test Local Notifications
```javascript
// Request permission and show test notification
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    new Notification('Test', {
      body: 'This is a test notification',
      icon: '/favicon.svg'
    });
  }
});
```

#### Check Service Worker
```javascript
// Check if service worker is active
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service workers:', registrations);
});
```

## Deployment Considerations

### Vercel Deployment

1. **Environment Variables**: Set all required VAPID and cron-job.org keys
2. **Build Settings**: Ensure service worker is included in build
3. **API Routes**: Verify all `/api/push/*` and `/api/cron-jobs/*` routes work
4. **Database**: Ensure MongoDB connection string is set

### HTTPS Requirement

Web Push API requires HTTPS in production. Ensure:
- SSL certificate is valid
- All HTTP traffic redirects to HTTPS
- Service worker served over HTTPS

### Rate Limiting

cron-job.org has rate limits:
- 1 request per second for job creation
- Implement delays between API calls
- Handle rate limit errors gracefully

## Future Enhancements

### Planned Features

1. **Advanced Scheduling**
   - Custom cron expressions
   - Multiple timezones support
   - Recurring patterns (every other day, etc.)

2. **Notification Analytics**
   - Delivery tracking
   - Click-through rates
   - User engagement metrics

3. **Smart Reminders**
   - AI-based timing optimization
   - Habit-based scheduling
   - Contextual reminders

4. **Multi-Device Sync**
   - Sync settings across devices
   - Device-specific subscriptions
   - Unified notification management

### Technical Improvements

1. **Enhanced Error Handling**
   - Retry mechanisms for failed deliveries
   - Better error reporting
   - Fallback notification methods

2. **Performance Optimization**
   - Batch notification sending
   - Efficient cron job management
   - Reduced API calls

3. **Security Enhancements**
   - Encrypted push payloads
   - User authentication for cron jobs
   - Rate limiting and abuse prevention

## Maintenance

### Regular Tasks

1. **Monitor Cron Jobs**: Check cron-job.org dashboard weekly
2. **Update VAPID Keys**: Rotate keys periodically for security
3. **Clean Expired Subscriptions**: Remove old push subscriptions
4. **Update Dependencies**: Keep web-push and related libraries updated

### Monitoring

- **Server Logs**: Monitor for push notification errors
- **Cron Job Status**: Check execution history on cron-job.org
- **User Feedback**: Track notification delivery issues
- **Performance Metrics**: Monitor API response times

## Support

For issues with the notification system:

1. Check this documentation first
2. Review server and client logs
3. Test individual components
4. Check external service status (cron-job.org, FCM)
5. Create detailed bug reports with logs and reproduction steps

---

*Last Updated: October 12, 2025*
*Version: 1.0*