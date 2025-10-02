import { useState, useEffect } from 'react';
import { Save, Utensils, X, Settings } from 'lucide-react';
import { MealType } from '../types';
import { mealPresets } from '../data/mealPresets';
import MealPresetManager from './MealPresetManager';

interface MealLogProps {
  mealType: MealType;
  onSave: (description: string, hadTea?: boolean, isCheatMeal?: boolean) => void;
  onCancel: () => void;
}

const mealConfig = {
  breakfast: {
    title: 'Breakfast',
    icon: Utensils,
    color: 'amber',
    showTea: true,
  },
  lunch: {
    title: 'Lunch',
    icon: Utensils,
    color: 'orange',
    showTea: false,
  },
  snacks: {
    title: 'Snacks',
    icon: Utensils,
    color: 'teal',
    showTea: false,
  },
  dinner: {
    title: 'Dinner',
    icon: Utensils,
    color: 'indigo',
    showTea: false,
  },
  other: {
    title: 'Other',
    icon: Utensils,
    color: 'rose',
    showTea: false,
  },
};

export default function MealLog({ mealType, onSave, onCancel }: MealLogProps) {
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [customMeal, setCustomMeal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [customPresets, setCustomPresets] = useState<string[]>([]);

  const config = mealConfig[mealType as keyof typeof mealConfig];
  const Icon = config.icon;
  const defaultPresets = mealPresets[mealType as keyof typeof mealPresets] || [];
  
  // Load custom presets and hidden defaults from localStorage
  useEffect(() => {
    const savedCustom = localStorage.getItem(`custom_presets_${mealType}`);
    const savedHidden = localStorage.getItem(`hidden_defaults_${mealType}`);
    const hiddenDefaults: string[] = savedHidden ? JSON.parse(savedHidden) : [];
    
    // Filter out hidden defaults
    const visibleDefaults = defaultPresets.filter(p => !hiddenDefaults.includes(p));
    const customList = savedCustom ? JSON.parse(savedCustom) : [];
    
    // Combine visible defaults with custom presets
    setCustomPresets([...visibleDefaults, ...customList]);
  }, [mealType, showPresetManager, defaultPresets]); // Reload when manager closes
  
  const allPresets = customPresets;

  const togglePreset = (preset: string) => {
    setSelectedPresets(prev =>
      prev.includes(preset)
        ? prev.filter(p => p !== preset)
        : [...prev, preset]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDescription = '';
    
    if (selectedPresets.length > 0) {
      finalDescription = selectedPresets.join(', ');
    }
    
    if (showCustomInput && customMeal.trim()) {
      finalDescription = finalDescription 
        ? `${finalDescription}, ${customMeal.trim()}`
        : customMeal.trim();
    }
    
    if (finalDescription) {
      onSave(finalDescription, false, false); // Regular meal, not cheat
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-600">
        <div className="sticky top-0 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-t-3xl p-6 border-b border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`bg-${config.color}-100 dark:bg-${config.color}-900 p-2 rounded-xl`}>
                <Icon className={`text-${config.color}-600 dark:text-${config.color}-400`} size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Log {config.title}</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">What did you have?</p>
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
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Select Your {config.title}
              </label>
              <button
                type="button"
                onClick={() => setShowPresetManager(true)}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
              >
                <Settings size={14} />
                Manage
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {allPresets.map((preset) => (
                <label
                  key={preset}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedPresets.includes(preset)
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPresets.includes(preset)}
                    onChange={() => togglePreset(preset)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-200">{preset}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={() => setShowCustomInput(!showCustomInput)}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 mb-2"
            >
              {showCustomInput ? '- Hide Custom Input' : '+ Add Other/Custom Meal'}
            </button>
            
            {showCustomInput && (
              <textarea
                value={customMeal}
                onChange={(e) => setCustomMeal(e.target.value)}
                placeholder="Describe your custom meal..."
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none resize-none text-base"
              />
            )}
          </div>

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
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save
            </button>
          </div>
        </form>
      </div>

      {showPresetManager && (
        <MealPresetManager
          mealType={mealType as 'breakfast' | 'lunch' | 'snacks' | 'dinner'}
          onClose={() => setShowPresetManager(false)}
        />
      )}
    </div>
  );
}
