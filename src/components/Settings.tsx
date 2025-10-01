import { useState } from 'react';
import { Settings as SettingsIcon, Save, Target, Clock, Bell, Moon, Sun } from 'lucide-react';
import { UserSettings } from '../types';
import { useDarkMode } from '../contexts/DarkModeContext';
import ExportButton from './ExportButton';

interface SettingsProps {
  settings: UserSettings;
  onSave: (settings: UserSettings) => void;
  onCancel: () => void;
}

export default function Settings({ settings, onSave, onCancel }: SettingsProps) {
  const [formData, setFormData] = useState(settings);
  const { darkMode, toggleDarkMode } = useDarkMode();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <SettingsIcon className="text-emerald-600" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600 text-sm">Customize your experience</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Target className="text-emerald-500" size={20} />
            <h3 className="font-semibold text-gray-800">Goal Weight</h3>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              step="0.1"
              value={formData.goalWeight}
              onChange={(e) => setFormData({ ...formData, goalWeight: parseFloat(e.target.value) })}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none text-lg"
              required
            />
            <span className="text-gray-600 font-medium">kg</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="text-emerald-500" size={20} />
            <h3 className="font-semibold text-gray-800">Meal Times</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Breakfast</label>
              <input
                type="text"
                value={formData.breakfastTime}
                onChange={(e) => setFormData({ ...formData, breakfastTime: e.target.value })}
                placeholder="e.g., 11:00 AM"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Lunch</label>
              <input
                type="text"
                value={formData.lunchTime}
                onChange={(e) => setFormData({ ...formData, lunchTime: e.target.value })}
                placeholder="e.g., 1:00 PM"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Snacks</label>
              <input
                type="text"
                value={formData.snacksTime}
                onChange={(e) => setFormData({ ...formData, snacksTime: e.target.value })}
                placeholder="e.g., 6:00 PM"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Dinner</label>
              <input
                type="text"
                value={formData.dinnerTime}
                onChange={(e) => setFormData({ ...formData, dinnerTime: e.target.value })}
                placeholder="e.g., 11:00 PM"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="text-emerald-500" size={20} />
            <h3 className="font-semibold text-gray-800">Notifications</h3>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <p className="font-medium text-gray-800">Enable Reminders</p>
              <p className="text-sm text-gray-500">Get notified to log your meals</p>
            </div>
            <div className="relative">
              <input
                type="checkbox"
                checked={formData.notificationsEnabled}
                onChange={(e) => setFormData({ ...formData, notificationsEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
          </label>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            {darkMode ? <Moon className="text-emerald-500" size={20} /> : <Sun className="text-emerald-500" size={20} />}
            <h3 className="font-semibold text-gray-800">Appearance</h3>
          </div>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="w-full flex items-center justify-between p-4 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
          >
            <span className="font-medium text-gray-800">
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className="flex items-center gap-2">
              {darkMode ? <Sun size={20} className="text-gray-600" /> : <Moon size={20} className="text-gray-600" />}
            </div>
          </button>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Export Your Data</h3>
          <p className="text-sm text-gray-600 mb-4">Download all your logs and progress data</p>
          <ExportButton />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 text-gray-700 font-semibold py-4 px-6 rounded-2xl hover:bg-gray-300 transition-colors"
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
    </div>
  );
}
