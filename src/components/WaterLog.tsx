import { useState, useEffect } from 'react';
import { Save, Droplets, X } from 'lucide-react';
import DateTimePicker from './DateTimePicker';
import { WaterLog as WaterLogType } from '../types';

interface WaterLogProps {
  onSave: (glasses: number, time?: string, date?: string) => void;
  onCancel: () => void;
  currentGlasses?: number;
  editData?: WaterLogType | null;
}

export default function WaterLog({ onSave, onCancel, currentGlasses = 0, editData }: WaterLogProps) {
  const [glasses, setGlasses] = useState(currentGlasses);
  const [logTime, setLogTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  });
  const [logDate, setLogDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  });

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setGlasses(editData.glasses);
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
    if (glasses > 0) {
      onSave(glasses, logTime, logDate);
    }
  };

  const quickAdd = (amount: number) => {
    setGlasses(Math.max(0, glasses + amount));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-12 pb-28 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[78vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-t-3xl p-6 border-b border-gray-100 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-xl">
                <Droplets className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {editData ? 'Edit Water' : 'Log Water'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stay hydrated!</p>
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

        <form id="water-log-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {glasses}
            </div>
            <p className="text-gray-600 dark:text-gray-400">glasses of water</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => quickAdd(-1)}
              className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-2xl font-bold transition-colors text-gray-700 dark:text-gray-300"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => quickAdd(1)}
              className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-2xl font-bold transition-colors"
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 4, 8].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setGlasses(num)}
                className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
                  glasses === num
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <DateTimePicker
            dateValue={logDate}
            timeValue={logTime}
            onDateChange={setLogDate}
            onTimeChange={setLogTime}
            dateLabel="Date"
            timeLabel="Time of Entry"
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
            form="water-log-form"
            className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
