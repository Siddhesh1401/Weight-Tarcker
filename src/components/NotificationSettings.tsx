import { useState, useEffect } from 'react';
import { BellRing, BellOff } from 'lucide-react';
import notificationService, { NotificationSettings as NotifSettings } from '../services/notifications';

interface NotificationSettingsProps {
  settings: NotifSettings;
  onUpdate: (settings: NotifSettings) => void;
}

export default function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(settings);

  const updateSettings = async (newSettings: Partial<NotifSettings>) => {
    const updated = { ...notifSettings, ...newSettings };
    setNotifSettings(updated);
    onUpdate(updated);
    notificationService.updateSettings(updated);
    
    // Also update server-side push notification settings
    try {
      const { pushNotificationService } = await import('../services/pushNotifications');
      await pushNotificationService.updateSettings(updated);
      console.log('✅ Updated push notification settings on server');
    } catch (error) {
      console.warn('⚠️ Failed to update server settings:', error);
    }
  };

  const applyPreset = (preset: 'early' | 'standard' | 'night') => {
    const presets = {
      early: {
        breakfastTime: '06:00',
        lunchTime: '11:30',
        dinnerTime: '18:00',
        weightTime: '05:30',
        sleepTime: '21:00',
        quoteTime: '06:30'
      },
      standard: {
        breakfastTime: '08:00',
        lunchTime: '13:00',
        dinnerTime: '20:00',
        weightTime: '07:00',
        sleepTime: '22:00',
        quoteTime: '09:00'
      },
      night: {
        breakfastTime: '10:00',
        lunchTime: '14:00',
        dinnerTime: '21:00',
        weightTime: '09:00',
        sleepTime: '23:00',
        quoteTime: '11:00'
      }
    };
    updateSettings(presets[preset]);
  };

  // Auto-restart notifications when settings change
  useEffect(() => {
    if (notifSettings.enabled) {
      // Small delay to ensure settings are saved
      const timer = setTimeout(() => {
        notificationService.startAll();
        console.log('🔄 Notifications restarted with new settings');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [
    notifSettings.enabled,
    notifSettings.breakfastTime,
    notifSettings.lunchTime,
    notifSettings.dinnerTime,
    notifSettings.waterReminder,
    notifSettings.waterInterval,
    notifSettings.weightReminder,
    notifSettings.weightTime,
    notifSettings.sleepReminder,
    notifSettings.sleepTime,
    notifSettings.motivationalQuotes,
    notifSettings.quoteTime,
  ]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
            <BellRing className="text-emerald-500" size={20} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Smart Reminders</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Never miss your healthy habits</p>
          </div>
        </div>
        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer group">
          <input
            type="checkbox"
            checked={notifSettings.enabled}
            onChange={async (e) => {
              const enabled = e.target.checked;
              if (enabled) {
                const hasPermission = await notificationService.requestPermission();
                if (hasPermission) {
                  updateSettings({ enabled: true });
                  
                  // Force re-subscription to push notifications for background delivery
                  try {
                    const { pushNotificationService } = await import('../services/pushNotifications');
                    const subscribed = await pushNotificationService.subscribe(notifSettings);
                    if (subscribed) {
                      console.log('✅ Push notifications subscribed for background delivery');
                    } else {
                      console.warn('⚠️ Push subscription failed - notifications may only work when app is open');
                    }
                  } catch (error) {
                    console.warn('⚠️ Push subscription not available:', error);
                  }
                  
                  await notificationService.startAll();
                  console.log('✅ Notifications enabled and started!');
                } else {
                  alert('Please enable notifications in your browser settings');
                }
              } else {
                updateSettings({ enabled: false });
                notificationService.stopAll();
                console.log('🔕 Notifications disabled');
              }
            }}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-200 dark:peer-focus:ring-emerald-800 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner group-hover:shadow-md"></div>
        </label>
      </div>

      {notifSettings.enabled ? (
        <div className="space-y-4">
          {/* Test Buttons - Compact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={async () => {
                console.log('🧪 Testing notification system...');
                console.log('📱 Permission:', Notification.permission);
                console.log('⚙️ Settings:', notificationService.getSettings());
                console.log('🔔 Service Worker:', await navigator.serviceWorker.getRegistration());
                
                await notificationService.testNotification();
                
                console.log('⏰ Scheduling test notification for 5 seconds from now...');
                setTimeout(async () => {
                  if (Notification.permission === 'granted') {
                    try {
                      const registration = await navigator.serviceWorker.ready;
                      await registration.showNotification('⏰ 5-Second Test', {
                        body: 'This notification fired 5 seconds after test button click!',
                        icon: '/favicon.svg',
                        badge: '/favicon.svg',
                        tag: 'test-5s',
                      });
                      console.log('✅ 5-second test notification sent via Service Worker');
                    } catch (error) {
                      console.error('❌ Error showing 5-second test:', error);
                    }
                  }
                }, 5000);
              }}
              className="px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm transform hover:scale-[1.02]"
            >
              <BellRing size={16} />
              Test Now
            </button>

            <button
              type="button"
              onClick={async () => {
                console.log('🚀 Testing server-side push notification...');
                try {
                  const { pushNotificationService } = await import('../services/pushNotifications');
                  const sent = await pushNotificationService.sendTestNotification();
                  if (sent) {
                    console.log('✅ Server push test sent! Should arrive in 1-2 seconds.');
                  } else {
                    console.error('❌ Server push test failed - check backend is running');
                  }
                } catch (error) {
                  console.error('❌ Server push error:', error);
                }
              }}
              className="px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-semibold text-sm transform hover:scale-[1.02]"
            >
              <BellRing size={16} />
              Test Push
            </button>
          </div>

          {/* Quick Presets */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-2xl border border-emerald-200 dark:border-gray-600">
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
              ⚡ Quick Presets
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('early')}
                className="px-3 py-2.5 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-700 hover:scale-105 transition-all border-2 border-gray-200 dark:border-gray-500 shadow-sm"
              >
                🌅 Early
              </button>
              <button
                type="button"
                onClick={() => applyPreset('standard')}
                className="px-3 py-2.5 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-700 hover:scale-105 transition-all border-2 border-gray-200 dark:border-gray-500 shadow-sm"
              >
                ☀️ Standard
              </button>
              <button
                type="button"
                onClick={() => applyPreset('night')}
                className="px-3 py-2.5 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-700 hover:scale-105 transition-all border-2 border-gray-200 dark:border-gray-500 shadow-sm"
              >
                🌙 Night
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                // Disable all reminders except keeping times
                updateSettings({
                  waterReminder: false,
                  weightReminder: false,
                  sleepReminder: false,
                  motivationalQuotes: false
                });
              }}
              className="w-full mt-3 px-3 py-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-500 transition-all border border-gray-300 dark:border-gray-500"
            >
              🔄 Reset All Reminders
            </button>
          </div>

          {/* Meal Reminders - Grid Layout */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                🍽️ Meal Reminders
              </h4>
              <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-md">
                Always active • Custom times
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Breakfast */}
              <div className="p-3 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-2xl border-2 border-orange-200 dark:border-orange-700/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🍳</span>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm block">Breakfast</span>
                  </div>
                </div>
                <input
                  type="time"
                  value={notifSettings.breakfastTime}
                  onChange={(e) => updateSettings({ breakfastTime: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                />
              </div>

              {/* Lunch */}
              <div className="p-3 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🥗</span>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm block">Lunch</span>
                  </div>
                </div>
                <input
                  type="time"
                  value={notifSettings.lunchTime}
                  onChange={(e) => updateSettings({ lunchTime: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                />
              </div>

              {/* Dinner */}
              <div className="p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-700/50 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">🍽️</span>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm block">Dinner</span>
                  </div>
                </div>
                <input
                  type="time"
                  value={notifSettings.dinnerTime}
                  onChange={(e) => updateSettings({ dinnerTime: e.target.value })}
                  className="w-full px-3 py-2 border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Other Reminders */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                ⏰ Customize Your Reminders
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-md">
                Toggle on/off • Set times
              </span>
            </div>

            {/* Water Reminder */}
            <div className={`p-4 rounded-2xl border-2 transition-all hover:shadow-md ${
              notifSettings.waterReminder 
                ? 'bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-300 dark:border-blue-700' 
                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💧</span>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Water Intake</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Stay hydrated</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings.waterReminder}
                    onChange={(e) => updateSettings({ waterReminder: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </label>
              </div>
              {notifSettings.waterReminder && (
                <div className="space-y-2 pl-10">
                  <label className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Remind every</span>
                    <select
                      value={notifSettings.waterInterval}
                      onChange={(e) => updateSettings({ waterInterval: Number(e.target.value) })}
                      className="px-3 py-1.5 border-2 border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="1">1 hour</option>
                      <option value="1.5">1.5 hours</option>
                      <option value="2">2 hours</option>
                      <option value="2.5">2.5 hours</option>
                      <option value="3">3 hours</option>
                      <option value="4">4 hours</option>
                    </select>
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic">Active from 8 AM to 10 PM</p>
                </div>
              )}
            </div>

            {/* Weight Check */}
            <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              notifSettings.weightReminder 
                ? 'bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-300 dark:border-violet-700' 
                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚖️</span>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Weight Check</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Daily weigh-in</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings.weightReminder}
                    onChange={(e) => updateSettings({ weightReminder: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-500"></div>
                </label>
              </div>
              {notifSettings.weightReminder && (
                <div className="flex items-center justify-between pl-10">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily at</span>
                  <input
                    type="time"
                    value={notifSettings.weightTime}
                    onChange={(e) => updateSettings({ weightTime: e.target.value })}
                    className="px-3 py-1.5 border-2 border-violet-300 dark:border-violet-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-violet-400"
                  />
                </div>
              )}
            </div>

            {/* Sleep Reminder */}
            <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              notifSettings.sleepReminder 
                ? 'bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border-indigo-300 dark:border-indigo-700' 
                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">😴</span>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Sleep Log</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Bedtime reminder</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings.sleepReminder}
                    onChange={(e) => updateSettings({ sleepReminder: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
                </label>
              </div>
              {notifSettings.sleepReminder && (
                <div className="flex items-center justify-between pl-10">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bedtime at</span>
                  <input
                    type="time"
                    value={notifSettings.sleepTime}
                    onChange={(e) => updateSettings({ sleepTime: e.target.value })}
                    className="px-3 py-1.5 border-2 border-indigo-300 dark:border-indigo-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-indigo-400"
                  />
                </div>
              )}
            </div>

            {/* Daily Motivation */}
            <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
              notifSettings.motivationalQuotes 
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700' 
                : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 opacity-60'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Daily Motivation</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Inspirational quotes</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings.motivationalQuotes}
                    onChange={(e) => updateSettings({ motivationalQuotes: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-5 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
              {notifSettings.motivationalQuotes && (
                <div className="flex items-center justify-between pl-10">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Morning at</span>
                  <input
                    type="time"
                    value={notifSettings.quoteTime}
                    onChange={(e) => updateSettings({ quoteTime: e.target.value })}
                    className="px-3 py-1.5 border-2 border-amber-300 dark:border-amber-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div className="mt-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">ACTIVE REMINDERS</p>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                {[
                  'breakfast', 'lunch', 'dinner',
                  ...(notifSettings.waterReminder ? ['water'] : []),
                  ...(notifSettings.weightReminder ? ['weight'] : []),
                  ...(notifSettings.sleepReminder ? ['sleep'] : []),
                  ...(notifSettings.motivationalQuotes ? ['quotes'] : [])
                ].length} enabled
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-md">🍳 Breakfast</span>
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-md">🥗 Lunch</span>
              <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-medium rounded-md">🍽️ Dinner</span>
              {notifSettings.waterReminder && (
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-md">💧 Water</span>
              )}
              {notifSettings.weightReminder && (
                <span className="px-2 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-md">⚖️ Weight</span>
              )}
              {notifSettings.sleepReminder && (
                <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs font-medium rounded-md">😴 Sleep</span>
              )}
              {notifSettings.motivationalQuotes && (
                <span className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium rounded-md">✨ Motivation</span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 italic">
              💡 Use the toggles above to enable/disable specific reminders. Only active reminders will create cron jobs.
            </p>
          </div>
        </div>
      ) : (
        <div className="py-12 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-700 rounded-xl flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-300 dark:border-gray-600">
          <BellOff className="text-gray-400 mb-4" size={48} />
          <p className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">Reminders are disabled</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
            Turn on the toggle above to enable smart reminders and never miss tracking your progress!
          </p>
        </div>
      )}
    </div>
  );
}
