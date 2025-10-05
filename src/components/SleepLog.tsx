import { useState, useEffect } from 'react';
import { Save, Moon, X } from 'lucide-react';
import TimePicker from './TimePicker';

interface SleepLogProps {
  onSave: (hours: number, quality: 'poor' | 'fair' | 'good' | 'excellent', time?: string) => void;
  onCancel: () => void;
}

export default function SleepLog({ onSave, onCancel }: SleepLogProps) {
  const [hours, setHours] = useState('8');
  const [quality, setQuality] = useState<'poor' | 'fair' | 'good' | 'excellent'>('good');
  const [logTime, setLogTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  });

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
    if (hoursValue > 0) {
      onSave(hoursValue, quality, logTime);
    }
  };

  const qualities: Array<{ value: 'poor' | 'fair' | 'good' | 'excellent'; label: string; emoji: string }> = [
    { value: 'poor', label: 'Poor', emoji: '😴' },
    { value: 'fair', label: 'Fair', emoji: '😐' },
    { value: 'good', label: 'Good', emoji: '😊' },
    { value: 'excellent', label: 'Excellent', emoji: '😄' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-12 pb-28 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[78vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-t-3xl p-6 border-b border-gray-100 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-xl">
                <Moon className="text-indigo-600 dark:text-indigo-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Log Sleep</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your rest</p>
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
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Hours of Sleep
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="Enter hours"
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-indigo-500 dark:focus:border-indigo-400 focus:outline-none text-lg"
                required
                autoFocus
              />
              <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">hours</span>
            </div>
          </div>

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
                  className={`p-4 rounded-xl border-2 transition-all ${
                    quality === q.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <div className="text-3xl mb-1">{q.emoji}</div>
                  <div className="text-sm font-semibold text-gray-700 dark:text-gray-200">{q.label}</div>
                </button>
              ))}
            </div>
          </div>

          <TimePicker
            value={logTime}
            onChange={setLogTime}
            label="Wake Up Time"
          />
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
