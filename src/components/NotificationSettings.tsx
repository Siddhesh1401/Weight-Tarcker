import { useState } from 'react';
import { BellRing, BellOff } from 'lucide-react';
import notificationService, { NotificationSettings as NotifSettings } from '../services/notifications';

interface NotificationSettingsProps {
  settings: NotifSettings;
  onUpdate: (settings: NotifSettings) => void;
}

export default function NotificationSettings({ settings, onUpdate }: NotificationSettingsProps) {
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(settings);

  const updateSettings = (newSettings: Partial<NotifSettings>) => {
    const updated = { ...notifSettings, ...newSettings };
    setNotifSettings(updated);
    onUpdate(updated);
    notificationService.updateSettings(updated);
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-600">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BellRing className="text-emerald-500" size={20} />
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Smart Reminders</h3>
        </div>
        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={notifSettings.enabled}
            onChange={async (e) => {
              const enabled = e.target.checked;
              if (enabled) {
                const hasPermission = await notificationService.requestPermission();
                if (hasPermission) {
                  updateSettings({ enabled: true });
                } else {
                  alert('Please enable notifications in your browser settings');
                }
              } else {
                updateSettings({ enabled: false });
              }
            }}
            className="sr-only peer"
          />
          <div className="w-14 h-8 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {notifSettings.enabled ? (
        <div className="space-y-4">
          {/* Test Notification Button */}
          <button
            type="button"
            onClick={() => notificationService.testNotification()}
            className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
          >
            <BellRing size={18} />
            Test Notification
          </button>

          {/* Quick Presets */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-xl border border-emerald-200 dark:border-gray-600">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <span>⚡</span> Quick Presets
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => applyPreset('early')}
                className="px-3 py-2.5 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-700 hover:scale-105 transition-all border border-gray-200 dark:border-gray-500 shadow-sm"
              >
                🌅 Early Bird
              </button>
              <button
                type="button"
                onClick={() => applyPreset('standard')}
                className="px-3 py-2.5 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-700 hover:scale-105 transition-all border border-gray-200 dark:border-gray-500 shadow-sm"
              >
                ☀️ Standard
              </button>
              <button
                type="button"
                onClick={() => applyPreset('night')}
                className="px-3 py-2.5 bg-white dark:bg-gray-600 text-gray-700 dark:text-gray-200 text-xs font-medium rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-700 hover:scale-105 transition-all border border-gray-200 dark:border-gray-500 shadow-sm"
              >
                🌙 Night Owl
              </button>
            </div>
          </div>

          {/* Individual Reminder Controls */}
          <div className="space-y-3">
            {/* Breakfast */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl border-2 border-orange-200 dark:border-orange-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍳</span>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Breakfast</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Morning meal reminder</p>
                  </div>
                </div>
                <input
                  type="time"
                  value={notifSettings.breakfastTime}
                  onChange={(e) => updateSettings({ breakfastTime: e.target.value })}
                  className="px-3 py-2 border-2 border-orange-300 dark:border-orange-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-all"
                />
              </div>
            </div>

            {/* Lunch */}
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🥗</span>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Lunch</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Midday meal reminder</p>
                  </div>
                </div>
                <input
                  type="time"
                  value={notifSettings.lunchTime}
                  onChange={(e) => updateSettings({ lunchTime: e.target.value })}
                  className="px-3 py-2 border-2 border-emerald-300 dark:border-emerald-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all"
                />
              </div>
            </div>

            {/* Dinner */}
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-700 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🍽️</span>
                  <div>
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Dinner</span>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Evening meal reminder</p>
                  </div>
                </div>
                <input
                  type="time"
                  value={notifSettings.dinnerTime}
                  onChange={(e) => updateSettings({ dinnerTime: e.target.value })}
                  className="px-3 py-2 border-2 border-purple-300 dark:border-purple-600 bg-white dark:bg-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all"
                />
              </div>
            </div>

            {/* Water Reminder */}
            <div className={`p-4 rounded-xl border-2 transition-all hover:shadow-md ${
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
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">ACTIVE REMINDERS</p>
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
