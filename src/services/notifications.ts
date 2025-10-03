// Notification Service for Weight Tracker
// Handles notification permissions, scheduling, and delivery

export interface NotificationSettings {
  enabled: boolean;
  breakfastTime: string; // HH:MM format
  lunchTime: string;
  dinnerTime: string;
  waterReminder: boolean;
  waterInterval: number; // hours
  weightReminder: boolean;
  weightTime: string;
  sleepReminder: boolean;
  sleepTime: string;
  motivationalQuotes: boolean;
  quoteTime: string;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  breakfastTime: '08:00',
  lunchTime: '13:00',
  dinnerTime: '20:00',
  waterReminder: true,
  waterInterval: 2, // Every 2 hours
  weightReminder: true,
  weightTime: '07:00', // Morning is best for weight
  sleepReminder: true,
  sleepTime: '22:00', // Bedtime reminder
  motivationalQuotes: true,
  quoteTime: '09:00', // Morning motivation
};

class NotificationService {
  private settings: NotificationSettings;
  private timers: Map<string, number> = new Map();

  constructor() {
    this.settings = this.loadSettings();
  }

  // Load settings from localStorage
  private loadSettings(): NotificationSettings {
    const saved = localStorage.getItem('notification_settings');
    if (saved) {
      return { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) };
    }
    return DEFAULT_NOTIFICATION_SETTINGS;
  }

  // Save settings to localStorage
  private saveSettings() {
    localStorage.setItem('notification_settings', JSON.stringify(this.settings));
  }

  // Update settings
  updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.rescheduleAll();
  }

  // Get current settings
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.error('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  // Check if notifications are supported and permitted
  isSupported(): boolean {
    return 'Notification' in window && Notification.permission === 'granted';
  }

  // Register service worker for push notifications
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered:', registration);
        return registration;
      } catch (error) {
        console.error('Service Worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  // Show a notification immediately
  showNotification(title: string, options?: NotificationOptions) {
    console.log(`📢 Attempting to show notification: ${title}`);
    
    if (!this.isSupported()) {
      console.warn('❌ Notifications not supported or not permitted');
      console.warn('Permission status:', Notification?.permission);
      return;
    }

    const defaultOptions: NotificationOptions & { vibrate?: number[] } = {
      icon: '/icon-192.png',
      badge: '/favicon.svg',
      vibrate: [200, 100, 200],
      requireInteraction: false,
      ...options,
    };

    console.log('✅ Showing notification with options:', defaultOptions);
    new Notification(title, defaultOptions as NotificationOptions);
  }

  // Schedule a notification at a specific time
  scheduleNotification(tag: string, time: string, title: string, body: string) {
    console.log(`🔔 Scheduling ${tag} for ${time}`);
    
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If time has passed today, schedule for tomorrow
    if (scheduledTime < now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const delay = scheduledTime.getTime() - now.getTime();
    console.log(`⏰ ${tag} delay: ${delay}ms (${(delay/1000/60).toFixed(1)} minutes) - will fire at ${scheduledTime.toLocaleString()}`);

    // Clear existing timer if any
    const existingTimer = this.timers.get(tag);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Schedule new timer
    const timer = window.setTimeout(() => {
      console.log(`🔔 Firing scheduled notification: ${tag}`);
      this.showNotification(title, {
        body,
        tag,
        data: { timestamp: Date.now() },
      });
      
      // Reschedule for next day
      this.scheduleNotification(tag, time, title, body);
    }, delay);

    this.timers.set(tag, timer);
    console.log(`✅ ${tag} scheduled successfully`);
  }

  // Schedule recurring notification
  scheduleRecurring(tag: string, intervalHours: number, title: string, body: string) {
    const delay = intervalHours * 60 * 60 * 1000;

    const existingTimer = this.timers.get(tag);
    if (existingTimer) {
      clearInterval(existingTimer);
    }

    const timer = window.setInterval(() => {
      const currentHour = new Date().getHours();
      // Only show during waking hours (8 AM - 10 PM)
      if (currentHour >= 8 && currentHour < 22) {
        this.showNotification(title, { body, tag });
      }
    }, delay);

    this.timers.set(tag, timer);
    console.log(`Scheduled recurring ${tag} every ${intervalHours} hours`);
  }

  // Start all notifications based on settings
  async startAll() {
    console.log('🚀 Starting notification service...');
    console.log('Settings:', this.settings);
    
    if (!this.settings.enabled) {
      console.log('⏸️ Notifications are disabled in settings');
      return;
    }

    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.log('❌ Notification permission not granted');
      return;
    }
    console.log('✅ Permission granted');

    // Register service worker
    await this.registerServiceWorker();

    // Clear all existing timers
    this.clearAll();
    console.log('🧹 Cleared old notification timers');

    // Schedule meal reminders
    this.scheduleNotification(
      'breakfast',
      this.settings.breakfastTime,
      '🍳 Breakfast Time!',
      'Don\'t forget to log your breakfast'
    );

    this.scheduleNotification(
      'lunch',
      this.settings.lunchTime,
      '🍽️ Lunch Time!',
      'Remember to log your lunch'
    );

    this.scheduleNotification(
      'dinner',
      this.settings.dinnerTime,
      '🍲 Dinner Time!',
      'Time to log your dinner'
    );

    // Schedule water reminder
    if (this.settings.waterReminder) {
      this.scheduleRecurring(
        'water',
        this.settings.waterInterval,
        '💧 Hydration Reminder',
        'Time to drink some water!'
      );
    }

    // Schedule weight reminder
    if (this.settings.weightReminder) {
      this.scheduleNotification(
        'weight',
        this.settings.weightTime,
        '⚖️ Weight Check',
        'Log your weight for today'
      );
    }

    // Schedule sleep reminder
    if (this.settings.sleepReminder) {
      this.scheduleNotification(
        'sleep',
        this.settings.sleepTime,
        '😴 Sleep Reminder',
        'Don\'t forget to log your sleep from yesterday'
      );
    }

    // Schedule motivational quote
    if (this.settings.motivationalQuotes) {
      this.scheduleNotification(
        'motivation',
        this.settings.quoteTime,
        '✨ Daily Motivation',
        this.getRandomQuote()
      );
    }

    console.log('✨ All notifications scheduled successfully!');
    console.log(`📊 Active timers: ${this.timers.size}`);
  }

  // Stop all notifications
  stopAll() {
    this.clearAll();
    console.log('All notifications stopped');
  }

  // Clear all timers
  private clearAll() {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.timers.clear();
  }

  // Reschedule all notifications
  private rescheduleAll() {
    if (this.settings.enabled) {
      this.startAll();
    } else {
      this.stopAll();
    }
  }

  // Get random motivational quote
  private getRandomQuote(): string {
    const quotes = [
      'Every small step counts! Keep going! 💪',
      'You\'re doing great! Stay consistent! 🌟',
      'Believe in yourself! You can do this! 🎯',
      'Progress, not perfection! 📈',
      'Your health is an investment! 💚',
      'Stay focused on your goals! 🎖️',
      'One day at a time! 🌅',
      'You\'re stronger than you think! 💪',
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }

  // Show smart reminder (only if not logged yet)
  async showSmartReminder(type: 'breakfast' | 'lunch' | 'dinner' | 'weight' | 'water' | 'sleep') {
    // Check if already logged today
    const today = new Date().toISOString().split('T')[0];
    const logged = localStorage.getItem(`logged_${type}_${today}`);
    
    if (logged) {
      console.log(`${type} already logged today, skipping reminder`);
      return;
    }

    const messages = {
      breakfast: { title: '🍳 Breakfast Reminder', body: 'Haven\'t logged breakfast yet!' },
      lunch: { title: '🍽️ Lunch Reminder', body: 'Don\'t forget to log your lunch!' },
      dinner: { title: '🍲 Dinner Reminder', body: 'Time to log your dinner!' },
      weight: { title: '⚖️ Weight Reminder', body: 'Don\'t forget to weigh yourself!' },
      water: { title: '💧 Water Reminder', body: 'Stay hydrated! Track your water intake.' },
      sleep: { title: '😴 Sleep Reminder', body: 'Log your sleep from yesterday!' },
    };

    const { title, body } = messages[type];
    this.showNotification(title, { body, tag: `smart-${type}` });
  }

  // Mark something as logged (to prevent duplicate reminders)
  markAsLogged(type: string) {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`logged_${type}_${today}`, 'true');
  }

  // Test notification (for debugging)
  testNotification() {
    this.showNotification('🎉 Test Notification', {
      body: 'Your notifications are working perfectly!',
      tag: 'test',
      requireInteraction: true,
    });
  }
}

// Export singleton instance
export const notificationService = new NotificationService();
export default notificationService;
