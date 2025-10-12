// Push Notification Service
// Handles server-side push notification subscriptions

const API_URL = import.meta.env.PROD 
  ? ''  // Use relative URLs in production (same domain)
  : 'http://localhost:5000/api';

class PushNotificationService {
  private vapidPublicKey: string | null = null;
  private userId: string;

  constructor() {
    // Generate or retrieve user ID
    this.userId = this.getUserId();
  }

  // Get or create user ID
  private getUserId(): string {
    let userId = localStorage.getItem('user_id');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('user_id', userId);
    }
    return userId;
  }

  // Get VAPID public key from server
  async getVapidPublicKey(): Promise<string> {
    if (this.vapidPublicKey) {
      return this.vapidPublicKey;
    }

    try {
      const response = await fetch(`${API_URL}/push/vapid-public-key`);
      const data = await response.json();
      this.vapidPublicKey = data.publicKey;
      return data.publicKey;
    } catch (error) {
      console.error('Failed to get VAPID public key:', error);
      throw error;
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Subscribe to push notifications
  async subscribe(settings: any): Promise<boolean> {
    try {
      console.log('🔔 Subscribing to server-side push notifications...');

      // Check if service worker is supported
      if (!('serviceWorker' in navigator)) {
        console.error('Service workers not supported');
        return false;
      }

      // Check if push is supported
      if (!('PushManager' in window)) {
        console.error('Push messaging not supported');
        return false;
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      console.log('✅ Service worker ready');

      // Get VAPID public key
      const vapidPublicKey = await this.getVapidPublicKey();
      console.log('✅ Got VAPID public key');

      // Check existing subscription
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        // Subscribe to push
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey) as any,
        });
        console.log('✅ Created new push subscription');
      } else {
        console.log('✅ Using existing push subscription');
      }

      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('🌍 User timezone:', userTimezone);

      // Send subscription to server with timezone
      const response = await fetch(`${API_URL}/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          subscription: subscription.toJSON(),
          settings,
          timezone: userTimezone, // Include timezone
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }

      console.log('✅ Subscribed to server-side push notifications');
      return true;
    } catch (error) {
      console.error('❌ Push subscription failed:', error);
      return false;
    }
  }

  // Update notification settings on server
  async updateSettings(settings: any): Promise<boolean> {
    try {
      console.log('🔄 Updating server settings:', settings);
      
      const response = await fetch(`${API_URL}/push/update-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          settings,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Server update failed:', response.status, errorText);
        throw new Error('Failed to update settings');
      }

      const result = await response.json();
      console.log('✅ Server update success:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to update settings:', error);
      return false;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      // Unsubscribe from push manager
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          await subscription.unsubscribe();
          console.log('✅ Unsubscribed from push manager');
        }
      }

      // Notify server
      const response = await fetch(`${API_URL}/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to unsubscribe on server');
      }

      console.log('✅ Unsubscribed from server-side push');
      return true;
    } catch (error) {
      console.error('❌ Unsubscribe failed:', error);
      return false;
    }
  }

  // Send test notification
  async sendTestNotification(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/push/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send test notification');
      }

      console.log('✅ Test notification sent from server');
      return true;
    } catch (error) {
      console.error('❌ Test notification failed:', error);
      return false;
    }
  }

  // Check if user is subscribed
  async isSubscribed(): Promise<boolean> {
    try {
      if (!('serviceWorker' in navigator)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      return subscription !== null;
    } catch (error) {
      console.error('Error checking subscription:', error);
      return false;
    }
  }

  // Validate current subscription with server
  async validateSubscription(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL}/push/validate-subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
        }),
      });

      if (!response.ok) {
        console.warn('Subscription validation failed:', response.status);
        return false;
      }

      const result = await response.json();
      console.log('Subscription validation result:', result);
      return result.valid === true;
    } catch (error) {
      console.error('Error validating subscription:', error);
      return false;
    }
  }
}

export const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
