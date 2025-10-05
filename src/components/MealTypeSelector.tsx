import { Utensils, Pizza, X } from 'lucide-react';
import { MealType } from '../types';
import { useEffect } from 'react';

interface MealTypeSelectorProps {
  mealType: MealType;
  onSelectRegular: () => void;
  onSelectCheat: () => void;
  onCancel: () => void;
}

const mealConfig = {
  breakfast: { title: 'Breakfast', color: 'amber' },
  lunch: { title: 'Lunch', color: 'orange' },
  snacks: { title: 'Snacks', color: 'teal' },
  dinner: { title: 'Dinner', color: 'indigo' },
  other: { title: 'Other', color: 'rose' },
};

export default function MealTypeSelector({ mealType, onSelectRegular, onSelectCheat, onCancel }: MealTypeSelectorProps) {
  const config = mealConfig[mealType as keyof typeof mealConfig];

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pb-24 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[70vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-t-3xl p-6 border-b border-gray-100 dark:border-gray-600 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Log {config.title}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Choose meal type</p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            Is this a regular meal or a cheat meal?
          </p>

          <button
            onClick={onSelectRegular}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 dark:from-emerald-600 dark:to-emerald-700 text-white font-bold py-6 px-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Utensils size={28} />
            <div className="text-left">
              <div className="text-xl">Regular Meal</div>
              <div className="text-sm opacity-90">Select from your usual options</div>
            </div>
          </button>

          <button
            onClick={onSelectCheat}
            className="w-full bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 dark:from-rose-600 dark:to-pink-700 text-white font-bold py-6 px-6 rounded-2xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-3"
          >
            <Pizza size={28} />
            <div className="text-left">
              <div className="text-xl">Cheat Meal</div>
              <div className="text-sm opacity-90">Something special today!</div>
            </div>
          </button>
        </div>

        {/* Sticky Footer */}
        <div className="p-6 pt-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-600 flex-shrink-0">
          <button
            onClick={onCancel}
            className="w-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
