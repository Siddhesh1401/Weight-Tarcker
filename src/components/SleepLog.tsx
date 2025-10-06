import { useState, useEffect } from 'react';
import { Save, Moon, X, Clock, Bed, Zap, Coffee, Smartphone } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import { SleepLog as SleepLogType } from '../types';

interface SleepLogProps {
  onSave: (hours: number, quality: 'poor' | 'fair' | 'good' | 'excellent', bedTime?: string, wakeTime?: string, date?: string, notes?: string) => void;
  onCancel: () => void;
  editData?: SleepLogType | null;
}

export default function SleepLog({ onSave, onCancel, editData }: SleepLogProps) {
  const [hours, setHours] = useState('8');
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [bedTime, setBedTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() - 8); // Default to 8 hours ago
    return now.toTimeString().slice(0, 5);
  });
  const [wakeTime, setWakeTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5);
  });
  const [logDate, setLogDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState('');
  const [useTimeRange, setUseTimeRange] = useState(true);

  // Calculate hours when bed time or wake time changes
  useEffect(() => {
    if (useTimeRange) {
      const bed = new Date(`${logDate}T${bedTime}`);
      const wake = new Date(`${logDate}T${wakeTime}`);
      
      // Handle next day wake up
      if (wake < bed) {
        wake.setDate(wake.getDate() + 1);
      }
      
      const diffMs = wake.getTime() - bed.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      setHours(diffHours.toFixed(1));
    }
  }, [bedTime, wakeTime, logDate, useTimeRange]);

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setHours(editData.hours.toString());
      setQuality(editData.quality);
      setNotes(editData.notes || '');
      
      if (editData.bedTime) {
        setBedTime(editData.bedTime);
        setUseTimeRange(true);
      }
      
      if (editData.time) {
        setWakeTime(editData.time);
      }
      
      if (editData.date) {
        setLogDate(editData.date);
      } else if (editData.timestamp) {
        const date = new Date(editData.timestamp);
        setLogDate(date.toISOString().split('T')[0]);
        if (!editData.bedTime) {
          setWakeTime(date.toTimeString().slice(0, 5));
        }
      }
    }
  }, [editData]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hoursValue = parseFloat(hours);
    if (hoursValue > 0 && Number.isFinite(hoursValue) && !isNaN(hoursValue)) {
      onSave(hoursValue, quality, useTimeRange ? bedTime : undefined, wakeTime, logDate, notes.trim() || undefined);
    }
  };

  const quickDurations = [
    { label: '6h', hours: '6.0' },
    { label: '7h', hours: '7.0' },
    { label: '8h', hours: '8.0' },
    { label: '9h', hours: '9.0' },
  ];

  const qualities: Array<{ 
    value: 'poor' | 'fair' | 'good' | 'excellent'; 
    label: string; 
    emoji: string;
    description: string;
  }> = [
    { value: 'poor', label: 'Poor', emoji: '😴', description: 'Restless, tired' },
    { value: 'fair', label: 'Fair', emoji: '😐', description: 'Some interruptions' },
    { value: 'good', label: 'Good', emoji: '😊', description: 'Mostly restful' },
    { value: 'excellent', label: 'Excellent', emoji: '😄', description: 'Very refreshing' },
  ];

  const sleepFactors = [
    { icon: Coffee, label: 'Caffeine', color: 'amber' },
    { icon: Smartphone, label: 'Screen time', color: 'blue' },
    { icon: Zap, label: 'Exercise', color: 'green' },
    { icon: Bed, label: 'Bed quality', color: 'purple' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-12 pb-28 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[85vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-t-3xl p-6 border-b border-gray-100 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-xl">
                <Moon className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {editData ? 'Edit Sleep' : 'Log Sleep'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your rest quality</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form id="sleep-log-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Sleep Duration Input Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Sleep Duration
            </label>
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setUseTimeRange(true)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  useTimeRange 
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Time Range
              </button>
              <button
                type="button"
                onClick={() => setUseTimeRange(false)}
                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                  !useTimeRange 
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                Manual Hours
              </button>
            </div>

            {useTimeRange ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Bed size={18} className="text-indigo-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bedtime</label>
                </div>
                <input
                  type="time"
                  value={bedTime}
                  onChange={(e) => setBedTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                />
                
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-orange-500" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Wake time</label>
                </div>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
                />
                
                <div className="flex items-center justify-center py-2 px-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <span className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                    Duration: {hours} hours
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Enter hours"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-lg"
                    required
                    autoFocus
                  />
                  <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">hours</span>
                </div>
                
                <div className="flex gap-2">
                  {quickDurations.map((duration) => (
                    <button
                      key={duration.hours}
                      type="button"
                      onClick={() => setHours(duration.hours)}
                      className="flex-1 py-2 px-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sleep Quality */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Sleep Quality
            </label>
            <div className="grid grid-cols-2 gap-3">
              {qualities.map((q) => (
                <button
                  key={q.value}
                  type="button"
                  onClick={() => setQuality(q.value)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    quality === q.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-2xl mb-1">{q.emoji}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{q.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{q.description}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none"
            />
          </div>

          {/* Sleep Factors Reminder */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Sleep Factors (Optional Notes)
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {sleepFactors.map((factor) => (
                <button
                  key={factor.label}
                  type="button"
                  onClick={() => setNotes(prev => prev ? `${prev}, ${factor.label.toLowerCase()}` : factor.label.toLowerCase())}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${factor.color}-100 dark:bg-${factor.color}-900/30 text-${factor.color}-700 dark:text-${factor.color}-300 hover:bg-${factor.color}-200 dark:hover:bg-${factor.color}-900/50 transition-colors`}
                >
                  <factor.icon size={12} />
                  {factor.label}
                </button>
              ))}
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about your sleep (caffeine, screen time, stress, etc.)"
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none resize-none"
              rows={2}
            />
          </div>
        </form>

        {/* Sticky Footer Buttons */}
        <div className="flex gap-3 p-6 pt-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-600 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="sleep-log-form"
            className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
