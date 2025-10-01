import { useState } from 'react';
import { Save, Pizza, X } from 'lucide-react';
import { MealType } from '../types';

interface CheatMealLogProps {
  mealType: MealType;
  onSave: (description: string, hadTea?: boolean) => void;
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

  const config = mealConfig[mealType as keyof typeof mealConfig];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim()) {
      onSave(description, false); // No tea option
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-t-3xl p-6 border-b border-rose-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-xl">
                <Pizza className="text-rose-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Cheat Meal!</h2>
                <p className="text-sm text-gray-600">Enjoy your {config.title.toLowerCase()}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4 mb-4">
            <p className="text-sm text-rose-800 font-medium">
              🎉 It's okay to treat yourself! What did you have?
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              What's your cheat meal?
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Pizza, Burger, Ice cream, Biryani..."
              rows={4}
              className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:border-rose-500 focus:outline-none resize-none text-base"
              required
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
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
