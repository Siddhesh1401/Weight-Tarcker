import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Target, Clock, Moon, Sun, BookOpen, Download, Trash2, AlertTriangle, Database, Bell } from 'lucide-react';
import { UserSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import ExportButton from './ExportButton';
import DietPlan from './DietPlan';
import NotificationSettings from './NotificationSettings';
import notificationService, { NotificationSettings as NotifSettings } from '../services/notifications';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onCancel: () => void;
  onDeleteAllData?: () => void;
}

type SettingsTab = 'main' | 'notifications' | 'diet' | 'data' | 'export';

export default function Settings({ settings, onSave, onCancel, onDeleteAllData }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('main');
  const [formData, setFormData] = useState(settings);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(notificationService.getSettings());
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    // Initialize notifications if enabled
    if (notifSettings.enabled) {
      notificationService.startAll();
    }
  }, [notifSettings.enabled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
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
    { id: 'diet' as SettingsTab, label: 'Diet Plan', icon: BookOpen },
    { id: 'data' as SettingsTab, label: 'Data', icon: Database },
    { id: 'export' as SettingsTab, label: 'Export', icon: Download },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-emerald-600 dark:text-emerald-400" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Settings</h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">Customize your experience</p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-3 shadow-sm border border-gray-200 dark:border-gray-600">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border-2 flex-1 min-w-[140px] ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg border-emerald-400 transform scale-[1.02]'
                    : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600 border-gray-300 dark:border-gray-600 hover:shadow-md'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {activeTab === 'main' && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Weight */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="text-emerald-500" size={20} />
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Goal Weight</h3>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.1"
                  value={formData.goalWeight}
                  onChange={(e) => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) })}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
                  required
                />
                <span className="text-gray-600 dark:text-gray-400 font-medium">kg</span>
              </div>
            </div>

            {/* Meal Times */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="text-emerald-500" size={20} />
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Meal Times</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Breakfast</label>
                  <input
                    type="text"
                    value={formData.breakfastTime}
                    onChange={(e) => setFormData({ ...formData, breakfastTime: e.target.value })}
                    placeholder="e.g., 11:00 AM"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Lunch</label>
                  <input
                    type="text"
                    value={formData.lunchTime}
                    onChange={(e) => setFormData({ ...formData, lunchTime: e.target.value })}
                    placeholder="e.g., 1:00 PM"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Snacks</label>
                  <input
                    type="text"
                    value={formData.snacksTime}
                    onChange={(e) => setFormData({ ...formData, snacksTime: e.target.value })}
                    placeholder="e.g., 6:00 PM"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Dinner</label>
                  <input
                    type="text"
                    value={formData.dinnerTime}
                    onChange={(e) => setFormData({ ...formData, dinnerTime: e.target.value })}
                    placeholder="e.g., 11:00 PM"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                {theme === 'dark' ? <Moon className="text-emerald-500" size={20} /> : <Sun className="text-emerald-500" size={20} />}
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Appearance</h3>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors"
              >
                <span className="font-medium text-gray-800 dark:text-gray-200">
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </span>
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? <Sun size={20} className="text-gray-600 dark:text-gray-400" /> : <Moon size={20} className="text-gray-600 dark:text-gray-400" />}
                </div>
              </button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-4 px-6 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-4 px-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Settings
              </button>
            </div>
          </form>
        )}

        {activeTab === 'diet' && <DietPlan />}

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

        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="text-red-500" size={20} />
                <h3 className="font-semibold text-red-700 dark:text-red-400">Danger Zone</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                ⚠️ This action cannot be undone. All your data will be permanently deleted.
              </p>

              {!showDeleteConfirm ? (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-colors shadow-md hover:shadow-lg"
                >
                  <Trash2 size={18} />
                  Delete All Data
                </button>
              ) : (
                <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border-2 border-red-200 dark:border-red-700">
                  <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                    <AlertTriangle size={20} />
                    <span className="font-semibold">Confirm Deletion</span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Type <strong className="text-red-600 dark:text-red-400">"DELETE ALL DATA"</strong> to confirm:
                  </p>

                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE ALL DATA"
                    className="w-full px-4 py-3 border-2 border-red-300 dark:border-red-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-red-500 focus:outline-none"
                  />

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setDeleteConfirmText('');
                      }}
                      className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteAllData}
                      disabled={deleteConfirmText !== 'DELETE ALL DATA'}
                      className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                        deleteConfirmText === 'DELETE ALL DATA'
                          ? 'bg-red-500 hover:bg-red-600 text-white shadow-md hover:shadow-lg'
                          : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Trash2 size={18} />
                      Delete Everything
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'export' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Download className="text-emerald-500" size={20} />
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Export Your Data</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Download all your logs and progress data</p>
            <ExportButton />
          </div>
        )}
      </div>
    </div>
  );
}
