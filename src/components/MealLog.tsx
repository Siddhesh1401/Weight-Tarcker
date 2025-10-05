import { useState, useEffect } from 'react';
import { Save, Utensils, X, Settings } from 'lucide-react';
import { MealType } from '../types';
import { mealPresets } from '../data/mealPresets';
import MealPresetManager from './MealPresetManager';
import DateTimePicker from './DateTimePicker';
import { templatesApi, settingsApi } from '../services/api';

interface MealLogProps {
  mealType: MealType;
  onSave: (description: string, hadTea?: boolean, isCheatMeal?: boolean, time?: string, date?: string) => void;
  onCancel: () => void;
  isOnline?: boolean;
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

export default function MealLog({ mealType, onSave, onCancel, isOnline = false }: MealLogProps) {
  const [selectedPresets, setSelectedPresets] = useState<string[]>([]);
  const [presetDetails, setPresetDetails] = useState<Record<string, string>>({}); // Store details for each preset
  const [customMeal, setCustomMeal] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [customPresets, setCustomPresets] = useState<string[]>([]);
  const [logTime, setLogTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM format
  });
  const [logDate, setLogDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD format
  });

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const config = mealConfig[mealType as keyof typeof mealConfig];
  const Icon = config.icon;
  const defaultPresets = mealPresets[mealType as keyof typeof mealPresets] || [];
  
  // Load custom presets and hidden defaults
  useEffect(() => {
    const loadPresets = async () => {
      if (!isOnline) {
        // Load from localStorage if offline
        const savedCustom = localStorage.getItem(`custom_presets_${mealType}`);
        const savedHidden = localStorage.getItem(`hidden_defaults_${mealType}`);
        const hiddenDefaults: string[] = savedHidden ? JSON.parse(savedHidden) : [];
        
        // Filter out hidden defaults
        const visibleDefaults = defaultPresets.filter(p => !hiddenDefaults.includes(p));
        const customList = savedCustom ? JSON.parse(savedCustom) : [];
        
        // Combine visible defaults with custom presets
        setCustomPresets([...visibleDefaults, ...customList]);
        return;
      }

      try {
        // Load from backend
        const templates = await templatesApi.getTemplates(mealType);
        const templateNames = templates.map((template: any) => template.name);
        
        // Load hidden defaults from backend
        let hiddenDefaults: string[] = [];
        try {
          const userSettings: any = await settingsApi.getSettings();
          if (userSettings?.hidden_presets?.[mealType]) {
            hiddenDefaults = userSettings.hidden_presets[mealType];
          }
        } catch (err) {
          console.error('Failed to load hidden presets from backend:', err);
          // Fallback to localStorage
          const savedHidden = localStorage.getItem(`hidden_defaults_${mealType}`);
          if (savedHidden) {
            hiddenDefaults = JSON.parse(savedHidden);
          }
        }
        
        const visibleDefaults = defaultPresets.filter(p => !hiddenDefaults.includes(p));
        
        // Combine visible defaults with backend templates
        setCustomPresets([...visibleDefaults, ...templateNames]);
      } catch (error) {
        console.error('Failed to load presets:', error);
        // Fallback to localStorage
        const savedCustom = localStorage.getItem(`custom_presets_${mealType}`);
        const savedHidden = localStorage.getItem(`hidden_defaults_${mealType}`);
        const hiddenDefaults: string[] = savedHidden ? JSON.parse(savedHidden) : [];
        const visibleDefaults = defaultPresets.filter(p => !hiddenDefaults.includes(p));
        const customList = savedCustom ? JSON.parse(savedCustom) : [];
        setCustomPresets([...visibleDefaults, ...customList]);
      }
    };

    loadPresets();
  }, [mealType, showPresetManager, defaultPresets, isOnline]); // Reload when manager closes or online status changes
  
  const allPresets = customPresets;

  const togglePreset = (preset: string) => {
    setSelectedPresets(prev => {
      const isRemoving = prev.includes(preset);
      if (isRemoving) {
        // Remove details when unchecking preset
        setPresetDetails(prevDetails => {
          const newDetails = { ...prevDetails };
          delete newDetails[preset];
          return newDetails;
        });
        return prev.filter(p => p !== preset);
      } else {
        return [...prev, preset];
      }
    });
  };

  // Get smart placeholder based on preset name
  const getPlaceholderForPreset = (preset: string): string => {
    const lowerPreset = preset.toLowerCase();
    
    // Sabji/Bhaji related
    if (lowerPreset.includes('bhaji') || lowerPreset.includes('sabji') || lowerPreset.includes('sabzi')) {
      return 'which sabji?';
    }
    
    // Dal related
    if (lowerPreset.includes('dal')) {
      return 'which dal?';
    }
    
    // Rice related
    if (lowerPreset.includes('rice') && !lowerPreset.includes('dal')) {
      return 'type?';
    }
    
    // Roti/Chapati related
    if (lowerPreset.includes('roti') || lowerPreset.includes('chapati')) {
      return 'with what?';
    }
    
    // Drink related
    if (lowerPreset.includes('drink') || lowerPreset.includes('juice') || lowerPreset.includes('shake')) {
      return 'which one?';
    }
    
    // Coldrink/Soda
    if (lowerPreset.includes('coldrink') || lowerPreset.includes('cold drink') || lowerPreset.includes('soda')) {
      return 'which drink?';
    }
    
    // Tea/Coffee
    if (lowerPreset.includes('tea') || lowerPreset.includes('chai')) {
      return 'type?';
    }
    
    if (lowerPreset.includes('coffee')) {
      return 'type?';
    }
    
    // Curry related
    if (lowerPreset.includes('curry')) {
      return 'which curry?';
    }
    
    // Snacks
    if (lowerPreset.includes('samosa') || lowerPreset.includes('pakora')) {
      return 'type?';
    }
    
    // Bread
    if (lowerPreset.includes('bread')) {
      return 'type?';
    }
    
    // Paratha
    if (lowerPreset.includes('paratha')) {
      return 'type?';
    }
    
    // Default
    return 'add details...';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalDescription = '';
    
    if (selectedPresets.length > 0) {
      // Add details to presets if available
      const presetsWithDetails = selectedPresets.map(preset => {
        const detail = presetDetails[preset];
        return detail ? `${preset} (${detail})` : preset;
      });
      finalDescription = presetsWithDetails.join(', ');
    }
    
    if (showCustomInput && customMeal.trim()) {
      finalDescription = finalDescription 
        ? `${finalDescription}, ${customMeal.trim()}`
        : customMeal.trim();
    }
    
    if (finalDescription) {
      onSave(finalDescription, false, false, logTime, logDate); // Pass time and date to parent
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 pt-12 pb-28 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[78vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-t-3xl p-6 border-b border-gray-100 dark:border-gray-600 flex-shrink-0">
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

        <form id="meal-log-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
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
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {allPresets.map((preset) => (
                <div key={preset} className="flex flex-col gap-1.5">
                  <label
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
                  
                  {/* Show detail input when preset is selected */}
                  {selectedPresets.includes(preset) && (
                    <input
                      type="text"
                      value={presetDetails[preset] || ''}
                      onChange={(e) => setPresetDetails(prev => ({
                        ...prev,
                        [preset]: e.target.value
                      }))}
                      placeholder={getPlaceholderForPreset(preset)}
                      className="w-full px-3 py-2 text-sm border-2 border-emerald-400 dark:border-emerald-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                    />
                  )}
                </div>
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

          <DateTimePicker
            dateValue={logDate}
            timeValue={logTime}
            onDateChange={setLogDate}
            onTimeChange={setLogTime}
            dateLabel="Date of Meal"
            timeLabel="Time of Meal"
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
            form="meal-log-form"
            className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Save
          </button>
        </div>
      </div>

      {showPresetManager && (
        <MealPresetManager
          mealType={mealType as 'breakfast' | 'lunch' | 'snacks' | 'dinner'}
          onClose={() => setShowPresetManager(false)}
          isOnline={isOnline}
        />
      )}
    </div>
  );
}
