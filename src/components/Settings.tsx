import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Target, Clock, Moon, Sun, BookOpen, Download, Trash2, AlertTriangle, Database, Bell, Activity, Mail, Timer } from 'lucide-react';
import { UserSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import ExportButton from './ExportButton';
import DietPlan from './DietPlan';
import NotificationSettings from './NotificationSettings';
import HealthCalculator from './HealthCalculator';
import notificationService, { NotificationSettings as NotifSettings } from '../services/notifications';
import { emailApi, cronJobsApi } from '../services/api';

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
  const [emailPreferences, setEmailPreferences] = useState(settings.emailPreferences || {
    enabled: false,
    email: '',
    daily_summary: false,
    weekly_summary: false,
    monthly_summary: false
  });
  const [testEmailStatus, setTestEmailStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  const [cronJobsLoading, setCronJobsLoading] = useState(false);
  const [backendUrl, setBackendUrl] = useState('');

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
          setEmailPreferences(preferences);
        }
      } catch (error) {
        console.error('Failed to load email preferences:', error);
      }
    };
    loadEmailPreferences();
  }, []);

  // Load cron jobs on mount
  useEffect(() => {
    const loadCronJobs = async () => {
      setCronJobsLoading(true);
      try {
        const jobs = await cronJobsApi.getCronJobs();
        if (jobs && jobs.success) {
          setCronJobs(jobs.jobs || []);
        }
      } catch (error) {
        console.error('Failed to load cron jobs:', error);
      } finally {
        setCronJobsLoading(false);
      }
    };
    loadCronJobs();
  }, []);

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
          <div className="space-y-6">
            {/* Email Settings Header */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <Mail className="text-blue-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Email Notifications</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Get personalized health summaries via email</p>
                </div>
              </div>

              {/* Email Configuration */}
              <div className="space-y-4">
                {/* Enable Email Notifications */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
                  <div>
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      Enable Email Notifications
                    </label>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Receive automated health summaries
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailPreferences.enabled}
                      onChange={(e) => setEmailPreferences({ ...emailPreferences, enabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600`}></div>
                  </label>
                </div>

                {/* Email Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={emailPreferences.email}
                    onChange={(e) => setEmailPreferences({ ...emailPreferences, email: e.target.value })}
                    placeholder="your-email@example.com"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none"
                    disabled={!emailPreferences.enabled}
                  />
                </div>

                {/* Summary Types */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-2xl border-2 transition-all ${emailPreferences.daily_summary ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailPreferences.daily_summary}
                        onChange={(e) => setEmailPreferences({ ...emailPreferences, daily_summary: e.target.checked })}
                        disabled={!emailPreferences.enabled}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Daily Summary</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Previous day's activities</div>
                      </div>
                    </label>
                  </div>

                  <div className={`p-4 rounded-2xl border-2 transition-all ${emailPreferences.weekly_summary ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailPreferences.weekly_summary}
                        onChange={(e) => setEmailPreferences({ ...emailPreferences, weekly_summary: e.target.checked })}
                        disabled={!emailPreferences.enabled}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Weekly Summary</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Weekly trends & progress</div>
                      </div>
                    </label>
                  </div>

                  <div className={`p-4 rounded-2xl border-2 transition-all ${emailPreferences.monthly_summary ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'}`}>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={emailPreferences.monthly_summary}
                        onChange={(e) => setEmailPreferences({ ...emailPreferences, monthly_summary: e.target.checked })}
                        disabled={!emailPreferences.enabled}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div>
                        <div className="font-semibold text-gray-700 dark:text-gray-300">Monthly Summary</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Monthly insights & goals</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Test Email Button */}
                <div className="pt-4">
                  <button
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
                    className={`w-full py-3 px-6 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
                      testEmailStatus === 'success'
                        ? 'bg-green-500 text-white'
                        : testEmailStatus === 'error'
                        ? 'bg-red-500 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white disabled:bg-gray-300 dark:disabled:bg-gray-600'
                    }`}
                  >
                    {testEmailStatus === 'sending' ? 'Sending...' : testEmailStatus === 'success' ? '✅ Test Email Sent!' : testEmailStatus === 'error' ? '❌ Failed to Send' : '📧 Send Test Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cron' && (
          <div className="space-y-6">
            {/* Cron Jobs Management */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Timer className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Cron Jobs Management</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Manage your automated email summaries</p>
                </div>
              </div>

              {/* Backend URL Input */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Backend URL
                </label>
                <input
                  type="url"
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="https://your-backend.vercel.app"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none"
                />
              </div>

              {/* Setup Email Summary Jobs */}
              <div className="mb-6">
                <button
                  onClick={async () => {
                    if (!backendUrl) {
                      alert('Please enter your backend URL first');
                      return;
                    }

                    try {
                      setCronJobsLoading(true);
                      const result = await cronJobsApi.setupEmailSummaryJobs(backendUrl, 'your-cron-api-key');
                      if (result && result.success) {
                        alert('Email summary cron jobs created successfully!');
                        // Refresh the jobs list
                        const jobs = await cronJobsApi.getCronJobs();
                        if (jobs && jobs.success) {
                          setCronJobs(jobs.jobs || []);
                        }
                      }
                    } catch (error) {
                      alert('Failed to create email summary cron jobs');
                    } finally {
                      setCronJobsLoading(false);
                    }
                  }}
                  disabled={!backendUrl || cronJobsLoading}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cronJobsLoading ? 'Setting up...' : '⚡ Setup Email Summary Jobs'}
                </button>
              </div>

              {/* Cron Jobs List */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Your Cron Jobs</h4>

                {cronJobsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading cron jobs...</p>
                  </div>
                ) : cronJobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Timer className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No cron jobs found</p>
                    <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                      Click "Setup Email Summary Jobs" to create automated email summaries
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cronJobs.map((job) => (
                      <div key={job.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-800 dark:text-gray-100">{job.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{job.url}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">Schedule: {job.schedule}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              job.enabled
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {job.enabled ? 'Active' : 'Disabled'}
                            </span>
                            <button
                              onClick={async () => {
                                try {
                                  await cronJobsApi.toggleCronJob(job.id, !job.enabled);
                                  // Refresh jobs list
                                  const jobs = await cronJobsApi.getCronJobs();
                                  if (jobs && jobs.success) {
                                    setCronJobs(jobs.jobs || []);
                                  }
                                } catch (error) {
                                  alert('Failed to toggle cron job');
                                }
                              }}
                              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                                job.enabled
                                  ? 'bg-red-500 hover:bg-red-600 text-white'
                                  : 'bg-green-500 hover:bg-green-600 text-white'
                              }`}
                            >
                              {job.enabled ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm('Are you sure you want to delete this cron job?')) {
                                  try {
                                    await cronJobsApi.deleteCronJob(job.id);
                                    // Refresh jobs list
                                    const jobs = await cronJobsApi.getCronJobs();
                                    if (jobs && jobs.success) {
                                      setCronJobs(jobs.jobs || []);
                                    }
                                  } catch (error) {
                                    alert('Failed to delete cron job');
                                  }
                                }
                              }}
                              className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-xl text-xs font-semibold transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
