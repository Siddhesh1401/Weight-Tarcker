import { useState, useEffect } from 'react';
import { Save, Pizza, X } from 'lucide-react';
import { MealType, MealEntry } from '../types';
import DateTimePicker from './DateTimePicker';

interface CheatMealLogProps {
  mealType: MealType;
  onSave: (description: string, hadTea?: boolean, time?: string, date?: string) => void;
  onCancel: () => void;
  editData?: MealEntry | null;
}

const mealConfig = {
  breakfast: { title: 'Breakfast', color: 'amber', showTea: true },
  lunch: { title: 'Lunch', color: 'orange', showTea: false },
  snacks: { title: 'Snacks', color: 'teal', showTea: true },
  dinner: { title: 'Dinner', color: 'indigo', showTea: false },
  other: { title: 'Other', color: 'rose', showTea: false },
};

export default function CheatMealLog({ mealType, onSave, onCancel, editData }: CheatMealLogProps) {
  const [description, setDescription] = useState('');
  const [logTime, setLogTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  });
  const [logDate, setLogDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  });

  const config = mealConfig[mealType as keyof typeof mealConfig];

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Populate form if editing
  useEffect(() => {
    if (editData) {
      setDescription(editData.description);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSave(description, false, logTime, logDate); // Pass time and date
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-12 pb-28 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[78vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded-t-3xl p-6 border-b border-rose-100 dark:border-rose-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 dark:bg-rose-900 p-2 rounded-xl">
                <Pizza className="text-rose-600 dark:text-rose-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {editData ? 'Edit Cheat Meal!' : 'Cheat Meal!'}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Enjoy your {config.title.toLowerCase()}</p>
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

        <form id="cheat-meal-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div className="bg-rose-50 dark:bg-rose-900/30 border-2 border-rose-200 dark:border-rose-700 rounded-xl p-4 mb-4">
            <p className="text-sm text-rose-800 dark:text-rose-200 font-medium">
              🎉 It's okay to treat yourself! What did you have?
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              What's your cheat meal?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Pizza, Burger, Ice cream, Biryani..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-rose-200 dark:border-rose-700 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-rose-500 dark:focus:border-rose-400 focus:outline-none resize-none text-base"
              required
              autoFocus
            />
          </div>

                    <DateTimePicker
            dateValue={logDate}
            timeValue={logTime}
            onDateChange={setLogDate}
            onTimeChange={setLogTime}
            dateLabel="Date of Cheat Meal"
            timeLabel="Time of Cheat Meal"
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
            form="cheat-meal-form"
            className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
