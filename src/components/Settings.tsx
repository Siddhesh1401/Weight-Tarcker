import { useState } from 'react';
import { Settings as SettingsIcon, Save, Target, Clock, Bell, Moon, Sun, BookOpen, Download } from 'lucide-react';
import { UserSettings } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import ExportButton from './ExportButton';
import DietPlan from './DietPlan';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onCancel: () => void;
}

type SettingsTab = 'main' | 'diet' | 'export';

export default function Settings({ settings, onSave, onCancel }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('main');
  const [formData, setFormData] = useState(settings);
  const { theme, toggleTheme } = useTheme();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const tabs = [
    { id: 'main' as SettingsTab, label: 'Settings', icon: SettingsIcon },
    { id: 'diet' as SettingsTab, label: 'Diet Plan', icon: BookOpen },
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-gray-600">
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
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

            {/* Notifications */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="text-emerald-500" size={20} />
                <h3 className="font-semibold text-gray-800 dark:text-gray-200">Notifications</h3>
              </div>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">Enable Reminders</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Get notified to log your meals</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={formData.notificationsEnabled}
                    onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                </div>
              </label>
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
