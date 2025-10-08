import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Target, Clock, Moon, Sun, BookOpen, Download, Trash2, AlertTriangle, Database, Bell, Activity, Mail, Timer } from 'lucide-react';
import { UserSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import ExportButton from './ExportButton';
import DietPlan from './DietPlan';
import NotificationSettings from './NotificationSettings';
import HealthCalculator from './HealthCalculator';
import notificationService, { NotificationSettings as NotifSettings } from '../services/notifications';
import { emailApi, cronJobsApi, settingsApi } from '../services/api';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onCancel: () => void;
  onDeleteAllData?: () => void;
}

type SettingsTab = 'main' | 'notifications' | 'diet' | 'health' | 'data' | 'export' | 'email' | 'cron';

export default function Settings({ settings, onSave, onCancel, onDeleteAllData }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('main');
  const [formData, setFormData] = useState(settings);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(notificationService.getSettings());
  
  // Load settings from localStorage, fallback to props
  const savedSettings = JSON.parse(localStorage.getItem('settings') || '{}');
  const [emailPreferences, setEmailPreferences] = useState(savedSettings.emailPreferences || settings.emailPreferences || {
    enabled: false,
    email: '',
    daily_summary: false,
    weekly_summary: false,
    monthly_summary: false
  });
  const [emailSchedule, setEmailSchedule] = useState(savedSettings.emailSchedule || settings.emailSchedule || savedSettings.emailPreferences?.schedule || settings.emailPreferences?.schedule || {
    daily: '20:00',
    weekly: '20:00',
    monthly: '20:00'
  });
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [saveEmailStatus, setSaveEmailStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  const [cronJobsLoading, setCronJobsLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState('https://weight-tarcker.vercel.app');
  const [cronApiKey, setCronApiKey] = useState(savedSettings.cronApiKey || settings.cronApiKey || '');
  const [cronApiKeySaveTimeout, setCronApiKeySaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [editingCronJob, setEditingCronJob] = useState<any | null>(null);
  const [editCronTime, setEditCronTime] = useState<string>('20:00');
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Initialize notifications if enabled
    if (notifSettings.enabled) {
      notificationService.startAll();
    }
  }, [notifSettings.enabled]);

  // Load email preferences on mount
  useEffect(() => {
    const loadEmailPreferences = async () => {
      try {
        const preferences = await emailApi.getEmailPreferences();
        if (preferences) {
          // Extract schedule from preferences if it exists
          const { schedule, ...prefsWithoutSchedule } = preferences;
          setEmailPreferences(prefsWithoutSchedule);
          if (schedule) {
            setEmailSchedule(schedule);
          }
        }
      } catch (error) {
        console.error('Failed to load email preferences:', error);
      }
    };
    loadEmailPreferences();
  }, []);

  // Load cron API key from database on mount
  useEffect(() => {
    const loadCronApiKey = async () => {
      try {
        const settingsData = await settingsApi.getSettings();
        if (settingsData && settingsData.cron_api_key) {
          setCronApiKey(settingsData.cron_api_key);
        }
      } catch (error) {
        console.error('Failed to load cron API key:', error);
      }
    };
    loadCronApiKey();
  }, []);

  // Load cron jobs on mount
  useEffect(() => {
    const loadCronJobs = async () => {
      setCronJobsLoading(true);
      try {
        const jobs = await cronJobsApi.getCronJobs();
        if (jobs && Array.isArray(jobs)) {
          setCronJobs(jobs);
        }
      } catch (error) {
        console.error('Failed to load cron jobs:', error);
      } finally {
        setCronJobsLoading(false);
      }
    };
    loadCronJobs();
  }, []);

  // Auto-save cron API key to database (with debounce)
  const saveCronApiKey = async (apiKey: string) => {
    try {
      console.log('💾 Saving cron API key to database...', { 
        keyLength: apiKey.length,
        keyPreview: apiKey.substring(0, 10) + '...'
      });
      
      const response = await settingsApi.saveSettings({
        cron_api_key: apiKey
      });
      
      console.log('✅ Cron API key saved to database successfully', response);
      
      // Also update localStorage
      const currentSettings = JSON.parse(localStorage.getItem('settings') || '{}');
      const updatedSettings = {
        ...currentSettings,
        cronApiKey: apiKey
      };
      localStorage.setItem('settings', JSON.stringify(updatedSettings));
      console.log('✅ Cron API key saved to localStorage');
    } catch (error) {
      console.error('❌ Failed to save cron API key:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message, error.stack);
      }
    }
  };

  // Auto-save email preferences when they change (with debounce)
  const saveEmailPreferences = async (prefs?: typeof emailPreferences, schedule?: typeof emailSchedule) => {
    try {
      setSaveEmailStatus('saving');
      const prefsToSave = prefs || emailPreferences;
      const scheduleToSave = schedule || emailSchedule;
      
      // Include schedule in preferences for database storage
      const fullPreferences = {
        ...prefsToSave,
        schedule: scheduleToSave
      };
      
      console.log('💾 Saving email preferences with schedule:', fullPreferences);
      
      // Save to backend API (includes schedule)
      await emailApi.updateEmailPreferences(fullPreferences);
      
      // Save to localStorage directly without triggering navigation
      const currentSettings = JSON.parse(localStorage.getItem('settings') || '{}');
      const updatedSettings = {
        ...currentSettings,
        emailPreferences: prefsToSave,
        emailSchedule: scheduleToSave,
        cronApiKey
      };
      localStorage.setItem('settings', JSON.stringify(updatedSettings));
      
      setSaveEmailStatus('saved');
      setTimeout(() => setSaveEmailStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save email preferences:', error);
      setSaveEmailStatus('error');
      setTimeout(() => setSaveEmailStatus('idle'), 3000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Save main settings
      await onSave(formData);

      // Save email preferences
      if (emailPreferences) {
        await emailApi.updateEmailPreferences(emailPreferences);
      }

      // Show success feedback or navigate away
      console.log('Settings and email preferences saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleDeleteAllData = () => {
    if (deleteConfirmText === 'DELETE ALL DATA') {
      onDeleteAllData?.();
      setShowDeleteConfirm(false);
      setDeleteConfirmText('');
    }
  };

  const tabs = [
    { id: 'main' as SettingsTab, label: 'Settings', icon: SettingsIcon },
    { id: 'notifications' as SettingsTab, label: 'Notifications', icon: Bell },
    { id: 'email' as SettingsTab, label: 'Email', icon: Mail },
    { id: 'cron' as SettingsTab, label: 'Cron Jobs', icon: Timer },
    { id: 'diet' as SettingsTab, label: 'Diet Plan', icon: BookOpen },
    { id: 'health' as SettingsTab, label: 'Health Calculator', icon: Activity },
    { id: 'data' as SettingsTab, label: 'Data', icon: Database },
    { id: 'export' as SettingsTab, label: 'Export', icon: Download },
  ];

  return (
    <div className="space-y-5 pb-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-6 shadow-lg border border-emerald-100 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl">
            <SettingsIcon className="text-emerald-600 dark:text-emerald-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Customize your health tracking experience</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation - Improved */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-2 shadow-lg border border-gray-100 dark:border-gray-600">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-2xl text-xs font-semibold transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg transform scale-[1.05] border-2 border-emerald-600'
                    : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-700 hover:shadow-md border-2 border-transparent hover:border-emerald-300 dark:hover:border-emerald-700 transform hover:scale-[1.02] hover:-translate-y-0.5'
                }`}
              >
                <Icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'main' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Goals Section - Combined */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Target className="text-emerald-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Your Goals</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Set your health targets</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Weight Goal */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-2xl border border-emerald-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    🎯 Target Weight
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.1"
                      value={formData.goalWeight}
                      onChange={(e) => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) })}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none text-base font-semibold"
                      required
                    />
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">kg</span>
                  </div>
                </div>

                {/* Water Goal */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-2xl border border-blue-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    💧 Daily Water
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={formData.waterGoal || 8}
                      onChange={(e) => setFormData({ ...formData, waterGoal: parseInt(e.target.value) })}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none text-base font-semibold"
                    />
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">glasses</span>
                  </div>
                </div>

                {/* Sleep Goal */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-700 dark:to-gray-700 p-4 rounded-2xl border border-indigo-200 dark:border-gray-600">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    😴 Daily Sleep
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      step="0.5"
                      min="4"
                      max="12"
                      value={formData.sleepGoal || 8}
                      onChange={(e) => setFormData({ ...formData, sleepGoal: parseFloat(e.target.value) })}
                      className="flex-1 px-3 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none text-base font-semibold"
                    />
                    <span className="text-gray-600 dark:text-gray-400 font-medium text-sm">hours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Times */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Clock className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Meal Schedule</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Set your preferred meal times</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span className="text-lg">🌅</span> Breakfast
                  </label>
                  <input
                    type="text"
                    value={formData.breakfastTime}
                    onChange={(e) => setFormData({ ...formData, breakfastTime: e.target.value })}
                    placeholder="e.g., 08:00"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span className="text-lg">☀️</span> Lunch
                  </label>
                  <input
                    type="text"
                    value={formData.lunchTime}
                    onChange={(e) => setFormData({ ...formData, lunchTime: e.target.value })}
                    placeholder="e.g., 13:00"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span className="text-lg">🍵</span> Snacks
                  </label>
                  <input
                    type="text"
                    value={formData.snacksTime}
                    onChange={(e) => setFormData({ ...formData, snacksTime: e.target.value })}
                    placeholder="e.g., 18:00"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <span className="text-lg">🌙</span> Dinner
                  </label>
                  <input
                    type="text"
                    value={formData.dinnerTime}
                    onChange={(e) => setFormData({ ...formData, dinnerTime: e.target.value })}
                    placeholder="e.g., 20:00"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  {theme === 'dark' ? <Moon className="text-purple-500" size={20} /> : <Sun className="text-purple-500" size={20} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Appearance</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Choose your preferred theme</p>
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-gray-200 hover:to-gray-300 dark:hover:from-gray-600 dark:hover:to-gray-500 rounded-2xl transition-all shadow-md hover:shadow-lg transform hover:scale-[1.01]"
              >
                <span className="font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  {theme === 'dark' ? (
                    <>
                      <Sun size={18} className="text-yellow-500" />
                      Switch to Light Mode
                    </>
                  ) : (
                    <>
                      <Moon size={18} className="text-indigo-600" />
                      Switch to Dark Mode
                    </>
                  )}
                </span>
                <div className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-400'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2 sticky bottom-0 bg-gray-50 dark:bg-gray-900 p-4 rounded-2xl">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3.5 px-6 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all shadow-md hover:shadow-lg transform hover:scale-[1.01]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === 'diet' && <DietPlan />}

        {activeTab === 'health' && (
          <div className="space-y-6">
            <HealthCalculator settings={settings} onUpdateSettings={(updates) => onSave({ ...settings, ...updates })} />
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <NotificationSettings 
              settings={notifSettings}
              onUpdate={(newSettings) => {
                setNotifSettings(newSettings);
                if (newSettings.enabled) {
                  notificationService.startAll();
                }
              }}
            />
          </div>
        )}

        {activeTab === 'email' && (
          <div className="space-y-6 animate-fade-in">
            {/* Save Status Badge */}
            {saveEmailStatus !== 'idle' && (
              <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-2xl shadow-2xl font-semibold flex items-center gap-3 animate-slide-down ${
                saveEmailStatus === 'saving' ? 'bg-blue-500 text-white' :
                saveEmailStatus === 'saved' ? 'bg-green-500 text-white' :
                'bg-red-500 text-white'
              }`}>
                {saveEmailStatus === 'saving' && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Saving preferences...</span>
                  </>
                )}
                {saveEmailStatus === 'saved' && (
                  <>
                    <span className="text-xl">✅</span>
                    <span>Saved successfully!</span>
                  </>
                )}
                {saveEmailStatus === 'error' && (
                  <>
                    <span className="text-xl">❌</span>
                    <span>Failed to save</span>
                  </>
                )}
              </div>
            )}

            {/* Info Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-3xl p-5 border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500 rounded-xl">
                  <Mail className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">📬 Email Notifications</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Get beautiful, personalized health summaries delivered to your inbox! 
                    Your preferences are <span className="font-semibold text-blue-600 dark:text-blue-400">auto-saved</span> instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Email Settings Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              
              {/* Enable Toggle Section */}
              <div className="mb-6 p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border-2 border-blue-100 dark:border-blue-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">🔔</span>
                    <div>
                      <label className="text-base font-bold text-gray-800 dark:text-gray-100">
                        Enable Email Notifications
                      </label>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Turn on to receive automated health summaries
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.enabled}
                      onChange={(e) => {
                        const newPrefs = { ...emailPreferences, enabled: e.target.checked };
                        setEmailPreferences(newPrefs);
                        saveEmailPreferences(newPrefs);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-indigo-600 shadow-lg"></div>
                  </label>
                </div>
              </div>

              {/* Email Address Input */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  <span className="text-xl">📧</span>
                  Your Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={emailPreferences.email}
                    onChange={(e) => {
                      const newPrefs = { ...emailPreferences, email: e.target.value };
                      setEmailPreferences(newPrefs);
                      saveEmailPreferences(newPrefs);
                    }}
                    placeholder="your-email@example.com"
                    className="w-full px-5 py-4 pl-12 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all shadow-sm text-base"
                    disabled={!emailPreferences.enabled}
                  />
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              {/* Summary Types - Beautiful Cards */}
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Choose Your Summary Types
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Daily Summary Card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!emailPreferences.enabled) return;
                      const newPrefs = { ...emailPreferences, daily_summary: !emailPreferences.daily_summary };
                      setEmailPreferences(newPrefs);
                      saveEmailPreferences(newPrefs);
                    }}
                    disabled={!emailPreferences.enabled}
                    className={`p-5 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 cursor-pointer text-left ${
                      emailPreferences.daily_summary 
                        ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-blue-600 shadow-xl shadow-blue-500/50' 
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-700'
                    } ${!emailPreferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{emailPreferences.daily_summary ? '🌅' : '☀️'}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        emailPreferences.daily_summary 
                          ? 'bg-white border-white' 
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {emailPreferences.daily_summary && <span className="text-blue-600 text-sm font-bold">✓</span>}
                      </div>
                    </div>
                    <h5 className={`font-bold mb-1 ${
                      emailPreferences.daily_summary 
                        ? 'text-white' 
                        : 'text-gray-800 dark:text-gray-100'
                    }`}>Daily Summary</h5>
                    <p className={`text-xs ${
                      emailPreferences.daily_summary 
                        ? 'text-blue-100' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      Yesterday's activities & progress
                    </p>
                  </button>

                  {/* Weekly Summary Card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!emailPreferences.enabled) return;
                      const newPrefs = { ...emailPreferences, weekly_summary: !emailPreferences.weekly_summary };
                      setEmailPreferences(newPrefs);
                      saveEmailPreferences(newPrefs);
                    }}
                    disabled={!emailPreferences.enabled}
                    className={`p-5 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 cursor-pointer text-left ${
                      emailPreferences.weekly_summary 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-600 border-purple-600 shadow-xl shadow-purple-500/50' 
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-700'
                    } ${!emailPreferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{emailPreferences.weekly_summary ? '📈' : '📊'}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        emailPreferences.weekly_summary 
                          ? 'bg-white border-white' 
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {emailPreferences.weekly_summary && <span className="text-purple-600 text-sm font-bold">✓</span>}
                      </div>
                    </div>
                    <h5 className={`font-bold mb-1 ${
                      emailPreferences.weekly_summary 
                        ? 'text-white' 
                        : 'text-gray-800 dark:text-gray-100'
                    }`}>Weekly Summary</h5>
                    <p className={`text-xs ${
                      emailPreferences.weekly_summary 
                        ? 'text-purple-100' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      7-day trends & insights
                    </p>
                  </button>

                  {/* Monthly Summary Card */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!emailPreferences.enabled) return;
                      const newPrefs = { ...emailPreferences, monthly_summary: !emailPreferences.monthly_summary };
                      setEmailPreferences(newPrefs);
                      saveEmailPreferences(newPrefs);
                    }}
                    disabled={!emailPreferences.enabled}
                    className={`p-5 rounded-2xl border-3 transition-all duration-300 transform hover:scale-105 cursor-pointer text-left ${
                      emailPreferences.monthly_summary 
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 border-orange-600 shadow-xl shadow-orange-500/50' 
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-700'
                    } ${!emailPreferences.enabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl">{emailPreferences.monthly_summary ? '🎯' : '📅'}</span>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        emailPreferences.monthly_summary 
                          ? 'bg-white border-white' 
                          : 'border-gray-300 dark:border-gray-500'
                      }`}>
                        {emailPreferences.monthly_summary && <span className="text-orange-600 text-sm font-bold">✓</span>}
                      </div>
                    </div>
                    <h5 className={`font-bold mb-1 ${
                      emailPreferences.monthly_summary 
                        ? 'text-white' 
                        : 'text-gray-800 dark:text-gray-100'
                    }`}>Monthly Summary</h5>
                    <p className={`text-xs ${
                      emailPreferences.monthly_summary 
                        ? 'text-orange-100' 
                        : 'text-gray-600 dark:text-gray-400'
                    }`}>
                      30-day insights & achievements
                    </p>
                  </button>
                </div>
              </div>

              {/* Schedule Settings */}
              <div className="mb-6 p-5 bg-gray-50 dark:bg-gray-700/30 rounded-2xl">
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                  <span className="text-xl">⏰</span>
                  Delivery Schedule
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Daily Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Daily at
                    </label>
                    <input
                      type="time"
                      value={emailSchedule.daily}
                      onChange={(e) => {
                        const newSchedule = { ...emailSchedule, daily: e.target.value };
                        setEmailSchedule(newSchedule);
                        // Save to database with the NEW schedule
                        saveEmailPreferences(undefined, newSchedule);
                      }}
                      disabled={!emailPreferences.enabled || !emailPreferences.daily_summary}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Weekly Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Weekly at
                    </label>
                    <input
                      type="time"
                      value={emailSchedule.weekly}
                      onChange={(e) => {
                        const newSchedule = { ...emailSchedule, weekly: e.target.value };
                        setEmailSchedule(newSchedule);
                        // Save to database with the NEW schedule
                        saveEmailPreferences(undefined, newSchedule);
                      }}
                      disabled={!emailPreferences.enabled || !emailPreferences.weekly_summary}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Monthly Time */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                      Monthly at
                    </label>
                    <input
                      type="time"
                      value={emailSchedule.monthly}
                      onChange={(e) => {
                        const newSchedule = { ...emailSchedule, monthly: e.target.value };
                        setEmailSchedule(newSchedule);
                        // Save to database with the NEW schedule
                        saveEmailPreferences(undefined, newSchedule);
                      }}
                      disabled={!emailPreferences.enabled || !emailPreferences.monthly_summary}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>

              {/* Test Email Button */}
              <div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!emailPreferences.email) {
                      alert('Please enter your email address first');
                      return;
                    }

                    setTestEmailStatus('sending');
                    try {
                      await emailApi.sendTestEmail(emailPreferences.email);
                      setTestEmailStatus('success');
                      setTimeout(() => setTestEmailStatus('idle'), 3000);
                    } catch (error) {
                      setTestEmailStatus('error');
                      setTimeout(() => setTestEmailStatus('idle'), 3000);
                    }
                  }}
                  disabled={!emailPreferences.enabled || !emailPreferences.email || testEmailStatus === 'sending'}
                  className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                    testEmailStatus === 'success'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/50'
                      : testEmailStatus === 'error'
                      ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-red-500/50'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/50'
                  }`}
                >
                  {testEmailStatus === 'sending' && (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Sending Test Email...</span>
                    </>
                  )}
                  {testEmailStatus === 'success' && (
                    <>
                      <span className="text-2xl">✅</span>
                      <span>Test Email Sent Successfully!</span>
                    </>
                  )}
                  {testEmailStatus === 'error' && (
                    <>
                      <span className="text-2xl">❌</span>
                      <span>Failed to Send - Try Again</span>
                    </>
                  )}
                  {testEmailStatus === 'idle' && (
                    <>
                      <span className="text-2xl">📧</span>
                      <span>Send Test Email</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cron' && (
          <div className="space-y-6 animate-fade-in">
            {/* Info Banner */}
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-3xl p-5 border-2 border-orange-200 dark:border-orange-800 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-orange-500 rounded-xl">
                  <Timer className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-1">⚡ Automated Email Delivery</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    Set up cron jobs to automatically send your health summaries at scheduled times. 
                    Uses <span className="font-semibold text-orange-600 dark:text-orange-400">cron-job.org</span> for reliable delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Configuration Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-gray-700">
              
              {/* Backend URL Input */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  <span className="text-xl">🔗</span>
                  Backend API URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    placeholder="https://your-backend.vercel.app"
                    className="w-full px-5 py-4 pl-12 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-800 focus:outline-none transition-all shadow-sm text-base font-mono text-sm"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🌐</div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
                  💡 This is your Vercel backend URL where the email endpoints are hosted
                </p>
              </div>

              {/* Cron API Key Input */}
              <div className="mb-6">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                  <span className="text-xl">🔑</span>
                  Cron-Job.org API Key
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={cronApiKey}
                    onChange={(e) => {
                      const newKey = e.target.value;
                      console.log('🔑 API key input changed:', { length: newKey.length });
                      setCronApiKey(newKey);
                      
                      // Clear existing timeout
                      if (cronApiKeySaveTimeout) {
                        clearTimeout(cronApiKeySaveTimeout);
                      }
                      
                      // Debounce: save after 1 second of no typing
                      const timeout = setTimeout(() => {
                        console.log('⏱️ Debounce timeout triggered, saving API key...');
                        saveCronApiKey(newKey);
                      }, 1000);
                      
                      setCronApiKeySaveTimeout(timeout);
                    }}
                    placeholder="Enter your cron-job.org API key"
                    className="w-full px-5 py-4 pl-12 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-200 dark:focus:ring-orange-800 focus:outline-none transition-all shadow-sm text-base font-mono text-sm"
                  />
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔐</div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
                  💡 Get your API key from <a href="https://console.cron-job.org" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 hover:underline font-semibold">console.cron-job.org</a>
                </p>
              </div>

              {/* Setup Button */}
              <div className="mb-6">
                <button
                  type="button"
                  onClick={async () => {
                    if (!backendUrl) {
                      alert('⚠️ Please enter your backend URL first');
                      return;
                    }
                    if (!cronApiKey) {
                      alert('⚠️ Please enter your Cron-Job.org API key first');
                      return;
                    }

                    try {
                      setCronJobsLoading(true);
                      console.log('🚀 Setting up email summary cron jobs...', { backendUrl, cronApiKeyLength: cronApiKey.length });
                      const result = await cronJobsApi.setupEmailSummaryJobs(backendUrl, cronApiKey);
                      console.log('📊 Cron setup result:', result);
                      
                      if (result && result.jobs) {
                        alert(`✅ Successfully created ${result.jobs.length} email summary cron jobs!`);
                        // Refresh the jobs list
                        const jobs = await cronJobsApi.getCronJobs();
                        if (jobs && jobs.length > 0) {
                          setCronJobs(jobs);
                        }
                      } else {
                        console.error('❌ Cron setup failed: No jobs returned');
                        alert('❌ Failed to create cron jobs: No jobs returned');
                      }
                    } catch (error: any) {
                      console.error('Cron job setup error:', error);
                      const errorMsg = error?.message || error?.toString() || 'Unknown error';
                      alert(`❌ Failed to create email summary cron jobs: ${errorMsg}`);
                    } finally {
                      setCronJobsLoading(false);
                    }
                  }}
                  disabled={!backendUrl || !cronApiKey || cronJobsLoading}
                  className="w-full py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-lg transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white shadow-orange-500/50"
                >
                  {cronJobsLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Setting up cron jobs...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">⚡</span>
                      <span>Setup Email Summary Jobs</span>
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  This will create 3 cron jobs: Daily, Weekly, and Monthly summaries
                </p>
              </div>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 bg-white dark:bg-gray-800 text-sm font-bold text-gray-500 dark:text-gray-400">
                    YOUR CRON JOBS
                  </span>
                </div>
              </div>

              {/* Cron Jobs List */}
              <div className="space-y-4">
                {cronJobsLoading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 dark:border-orange-900 border-t-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">Loading cron jobs...</p>
                  </div>
                ) : cronJobs.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <div className="mb-4">
                      <Timer className="mx-auto h-16 w-16 text-gray-300 dark:text-gray-600" strokeWidth={1.5} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">No cron jobs found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      Click <span className="font-bold text-orange-600 dark:text-orange-400">"Setup Email Summary Jobs"</span> above to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cronJobs.map((job) => (
                      <div 
                        key={job.jobId} 
                        className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-700/30 rounded-2xl p-5 border-2 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-700 transition-all hover:shadow-lg"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">
                                {job.title?.toLowerCase().includes('daily') ? '🌅' : 
                                 job.title?.toLowerCase().includes('weekly') ? '📊' : 
                                 job.title?.toLowerCase().includes('monthly') ? '📅' : '⚙️'}
                              </span>
                              <h5 className="font-bold text-gray-800 dark:text-gray-100 text-base truncate">
                                {job.title || 'Unnamed Job'}
                              </h5>
                            </div>
                            <div className="space-y-1 ml-11">
                              <p className="text-xs text-gray-600 dark:text-gray-400 truncate font-mono">
                                🔗 {job.url || 'No URL'}
                              </p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                                ⏰ {job.schedule?.timezone || 'UTC'} - 
                                {job.schedule?.hours?.join(',') || 'N/A'}:{job.schedule?.minutes?.join(',') || 'N/A'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            {/* Status Badge */}
                            <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md ${
                              job.enabled
                                ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white'
                                : 'bg-gray-300 text-gray-600 dark:bg-gray-600 dark:text-gray-300'
                            }`}>
                              {job.enabled ? '✅ Active' : '⏸️ Paused'}
                            </span>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  // Open edit modal
                                  setEditingCronJob(job);
                                  // Extract time from schedule (hours:minutes)
                                  const hours = job.schedule?.hours?.[0] || 20;
                                  const minutes = job.schedule?.minutes?.[0] || 0;
                                  const timeStr = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
                                  setEditCronTime(timeStr);
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                                title="Edit schedule time"
                              >
                                ✏️ Edit
                              </button>
                              
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await cronJobsApi.toggleCronJob(job.jobId, !job.enabled);
                                    // Refresh jobs list
                                    const jobs = await cronJobsApi.getCronJobs();
                                    if (jobs && Array.isArray(jobs)) {
                                      setCronJobs(jobs);
                                    }
                                  } catch (error) {
                                    alert('❌ Failed to toggle cron job');
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105 ${
                                  job.enabled
                                    ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white'
                                }`}
                              >
                                {job.enabled ? '⏸️ Pause' : '▶️ Resume'}
                              </button>
                              
                              <button
                                type="button"
                                onClick={async () => {
                                  if (confirm(`🗑️ Are you sure you want to delete "${job.title}"?\n\nThis action cannot be undone.`)) {
                                    try {
                                      await cronJobsApi.deleteCronJob(job.jobId);
                                      // Refresh jobs list
                                      const jobs = await cronJobsApi.getCronJobs();
                                      if (jobs && Array.isArray(jobs)) {
                                        setCronJobs(jobs);
                                      }
                                      alert('✅ Cron job deleted successfully');
                                    } catch (error) {
                                      alert('❌ Failed to delete cron job');
                                    }
                                  }
                                }}
                                className="px-3 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                              >
                                🗑️
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Help Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-5 border-2 border-blue-200 dark:border-blue-800">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-3 flex items-center gap-2">
                <span className="text-xl">💡</span>
                Quick Setup Guide
              </h4>
              <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300 ml-7">
                <li className="list-decimal"><strong>Get API Key:</strong> Visit <a href="https://console.cron-job.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">console.cron-job.org</a> and create an account</li>
                <li className="list-decimal"><strong>Generate Key:</strong> Go to Account → API → Create new API key</li>
                <li className="list-decimal"><strong>Enter Details:</strong> Paste your Backend URL and API Key above</li>
                <li className="list-decimal"><strong>Setup Jobs:</strong> Click "Setup Email Summary Jobs" button</li>
                <li className="list-decimal"><strong>Done!</strong> Your emails will be sent automatically 📬</li>
              </ol>
            </div>

            {/* Edit Cron Job Modal */}
            {editingCronJob && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 max-w-md w-full shadow-2xl border-2 border-orange-200 dark:border-orange-700 transform transition-all animate-scaleIn">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                      <Clock className="text-orange-600 dark:text-orange-400" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Edit Schedule Time</h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{editingCronJob.title}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Schedule Time (Asia/Kolkata)
                      </label>
                      <input
                        type="time"
                        value={editCronTime}
                        onChange={(e) => setEditCronTime(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 dark:focus:ring-orange-800 focus:outline-none transition-all text-lg font-mono"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Current: {editingCronJob.schedule?.hours?.[0] || 'N/A'}:{String(editingCronJob.schedule?.minutes?.[0] || 0).padStart(2, '0')}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            // Parse the new time
                            const [hoursStr, minutesStr] = editCronTime.split(':');
                            const hours = parseInt(hoursStr, 10);
                            const minutes = parseInt(minutesStr, 10);

                            // Determine job type based on title
                            const jobType = editingCronJob.title?.toLowerCase().includes('daily') ? 'daily' :
                                          editingCronJob.title?.toLowerCase().includes('weekly') ? 'weekly' :
                                          editingCronJob.title?.toLowerCase().includes('monthly') ? 'monthly' : null;

                            if (!jobType) {
                              alert('❌ Cannot determine job type');
                              return;
                            }

                            // Update the schedule in email preferences
                            const newSchedule = { ...emailSchedule, [jobType]: editCronTime };
                            setEmailSchedule(newSchedule);
                            await saveEmailPreferences(undefined, newSchedule);

                            // Delete the old cron job
                            await cronJobsApi.deleteCronJob(editingCronJob.jobId);

                            // Wait a moment
                            await new Promise(resolve => setTimeout(resolve, 2000));

                            // Recreate the cron job with new time
                            await cronJobsApi.setupEmailSummaryJobs(backendUrl, cronApiKey);

                            // Refresh jobs list
                            const jobs = await cronJobsApi.getCronJobs();
                            if (jobs && Array.isArray(jobs)) {
                              setCronJobs(jobs);
                            }

                            setEditingCronJob(null);
                            alert('✅ Cron job schedule updated successfully!');
                          } catch (error) {
                            console.error('Failed to update cron job:', error);
                            alert('❌ Failed to update cron job schedule');
                          }
                        }}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-xl font-bold transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        💾 Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCronJob(null)}
                        className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-4">
            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                  <AlertTriangle className="text-red-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-red-700 dark:text-red-400">Danger Zone</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Permanently delete all your data</p>
                </div>
              </div>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-700 mb-4">
                <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                  <AlertTriangle className="text-red-500 flex-shrink-0 mt-0.5" size={16} />
                  <span><strong>Warning:</strong> This action cannot be undone. All your meals, weights, water logs, sleep records, and settings will be permanently deleted from your device.</span>
                </p>
              </div>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold transition-all shadow-md hover:shadow-lg transform hover:scale-[1.01]"
                >
                  <Trash2 size={18} />
                  Delete All Data
                </button>
              ) : (
                <div className="space-y-4 p-5 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-300 dark:border-red-700">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle size={22} />
                    <span className="font-bold text-lg">Confirm Permanent Deletion</span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Type <strong className="text-red-600 dark:text-red-400 text-base">"DELETE ALL DATA"</strong> below to confirm:
                  </p>

                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE ALL DATA"
                    className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none font-mono"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAllData}
                      disabled={deleteConfirmText !== 'DELETE ALL DATA'}
                      className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                        deleteConfirmText === 'DELETE ALL DATA'
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <Trash2 size={18} />
                      Permanently Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                <Download className="text-emerald-500" size={20} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Export Your Data</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Download all your health tracking data</p>
              </div>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-200 dark:border-emerald-700 mb-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                📊 Export your complete history including meals, weights, water intake, sleep logs, and all settings. Choose from multiple formats to use your data anywhere.
              </p>
            </div>
            
            <ExportButton />
          </div>
        )}
      </div>
    </div>
  );
}
