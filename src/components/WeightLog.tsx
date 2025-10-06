import { useState, useEffect } from 'react';
import { Save, Scale, X } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import { WeightLog as WeightLogType } from '../types';

interface WeightLogProps {
  onSave: (weight: number, time?: string, date?: string) => void;
  onCancel: () => void;
  editData?: WeightLogType | null;
}

export default function WeightLog({ onSave, onCancel, editData }: WeightLogProps) {
  const [weight, setWeight] = useState('');
  const [logTime, setLogTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  });
  const [logDate, setLogDate] = useState(() => {
    const now = new Date();
    // Use local date instead of UTC to avoid timezone issues
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setWeight(editData.weight.toString());
      if (editData.time) {
        setLogTime(editData.time);
      }
      if (editData.date) {
        setLogDate(editData.date);
      } else if (editData.timestamp) {
        const date = new Date(editData.timestamp);
        setLogDate(date.toISOString().split('T')[0]);
        setLogTime(date.toTimeString().slice(0, 5));
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
    const weightValue = parseFloat(weight);
    // Validate that weight is a valid positive number
    if (weightValue > 0 && Number.isFinite(weightValue) && !isNaN(weightValue)) {
      onSave(weightValue, logTime, logDate);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-12 pb-28 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[78vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-t-3xl p-6 border-b border-gray-100 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-xl">
                <Scale className="text-emerald-600 dark:text-emerald-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {editData ? 'Edit Weight' : 'Log Weight'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress</p>
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

        <form id="weight-log-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Your Weight
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Enter weight"
                className="flex-1 px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none text-lg"
                required
                autoFocus
              />
              <span className="text-gray-600 dark:text-gray-400 font-medium text-lg">kg</span>
            </div>
          </div>

          <DateTimePicker
            dateValue={logDate}
            timeValue={logTime}
            onDateChange={setLogDate}
            onTimeChange={setLogTime}
            dateLabel="Date"
            timeLabel="Time of Measurement"
            className="mt-2"
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
            form="weight-log-form"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
