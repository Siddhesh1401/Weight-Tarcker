import { useState } from 'react';
import { Save, Pizza, X } from 'lucide-react';
import { MealType } from '../types';
import TimePicker from './TimePicker';

interface CheatMealLogProps {
  mealType: MealType;
  onSave: (description: string, hadTea?: boolean, time?: string) => void;
  onCancel: () => void;
}

const mealConfig = {
  breakfast: { title: 'Breakfast', color: 'amber', showTea: true },
  lunch: { title: 'Lunch', color: 'orange', showTea: false },
  snacks: { title: 'Snacks', color: 'teal', showTea: true },
  dinner: { title: 'Dinner', color: 'indigo', showTea: false },
  other: { title: 'Other', color: 'rose', showTea: false },
};

export default function CheatMealLog({ mealType, onSave, onCancel }: CheatMealLogProps) {
  const [description, setDescription] = useState('');
  const [logTime, setLogTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  });

  const config = mealConfig[mealType as keyof typeof mealConfig];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSave(description, false, logTime); // Pass time
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-900/30 dark:to-pink-900/30 rounded-t-3xl p-6 border-b border-rose-100 dark:border-rose-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 dark:bg-rose-900 p-2 rounded-xl">
                <Pizza className="text-rose-600 dark:text-rose-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Cheat Meal!</h2>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
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

          <TimePicker
            value={logTime}
            onChange={setLogTime}
            label="Time of Meal"
          />

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
