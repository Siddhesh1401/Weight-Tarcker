import { TrendingDown, Target, Coffee, Utensils, Scale, Pizza, CheckCircle2, Droplets, Moon, Trash2 } from 'lucide-react';
import { MealEntry, WeightLog, WaterLog, SleepLog, UserSettings, MealType } from '../types';
import { getRandomQuote } from '../data/quotes';

interface DashboardProps {
  meals: MealEntry[];
  weights: WeightLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  settings: UserSettings;
  onQuickLog: (type: MealType) => void;
  onDeleteLog?: (id: string, type: 'meal' | 'weight' | 'water' | 'sleep') => void;
}

export default function Dashboard({ meals, weights, waterLogs, sleepLogs, settings, onQuickLog }: DashboardProps) {
  const currentWeight = weights.length > 0 ? weights[weights.length - 1].weight : 0;
  const goalWeight = settings.goalWeight;
  const weightDiff = currentWeight - goalWeight;
  const progress = currentWeight > 0 ? Math.max(0, Math.min(100, ((80 - currentWeight) / (80 - goalWeight)) * 100)) : 0;

  const today = new Date().toISOString().split('T')[0];
  const todayMeals = meals.filter(m => m.date === today);
  const todayWeight = weights.find(w => w.date === today);
  const todayWater = waterLogs.filter(w => w.date === today);
  const todaySleep = sleepLogs.find(s => s.date === today);

  const greeting = `Hello, ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;

  const hasBreakfast = todayMeals.some(m => m.mealType === 'breakfast');
  const hasLunch = todayMeals.some(m => m.mealType === 'lunch');
  const hasSnacks = todayMeals.some(m => m.mealType === 'snacks');
  const hasDinner = todayMeals.some(m => m.mealType === 'dinner');

  const quickActions = [
    { id: 'breakfast', type: 'breakfast' as MealType, label: 'Breakfast', icon: Utensils, color: 'amber', done: hasBreakfast },
    { id: 'lunch', type: 'lunch' as MealType, label: 'Lunch', icon: Utensils, color: 'orange', done: hasLunch },
    { id: 'snacks', type: 'snacks' as MealType, label: 'Snacks', icon: Coffee, color: 'teal', done: hasSnacks },
    { id: 'dinner', type: 'dinner' as MealType, label: 'Dinner', icon: Utensils, color: 'indigo', done: hasDinner },
    { id: 'other', type: 'other' as MealType, label: 'Other', icon: Pizza, color: 'rose', done: false },
    { id: 'water', type: 'water' as MealType, label: 'Log Water', icon: Droplets, color: 'blue', done: false },
    { id: 'sleep', type: 'sleep' as MealType, label: 'Log Sleep', icon: Moon, color: 'purple', done: false },
    { id: 'weight', type: 'weight' as MealType, label: 'Log Weight', icon: Scale, color: 'emerald', done: !!todayWeight },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-6 shadow-xl border border-emerald-100 dark:border-gray-600">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">{greeting}</h1>
        <p className="text-emerald-700 dark:text-emerald-400 font-medium italic text-lg">"{getRandomQuote()}"</p>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onQuickLog(action.type)}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] border-2 ${
                  action.done
                    ? 'ring-2 ring-emerald-400 border-emerald-300 dark:border-emerald-600'
                    : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                }`}
              >
                {action.done && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="text-emerald-500 dark:text-emerald-400" size={20} fill="currentColor" />
                  </div>
                )}
                <div className="flex flex-col items-center gap-3">
                  <div className={`bg-${action.color}-100 dark:bg-${action.color}-900 p-4 rounded-2xl border border-${action.color}-200 dark:border-${action.color}-700`}>
                    <Icon className={`text-${action.color}-600 dark:text-${action.color}-400`} size={28} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 text-center">{action.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(todayMeals.length > 0 || todayWeight || todayWater.length > 0 || todaySleep) && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
          <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-5 text-lg">Today's Log</h3>
          <div className="space-y-4">
            {todayWeight && (
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-200 dark:border-emerald-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Scale size={18} className="text-emerald-600 dark:text-emerald-400" />
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Weight</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{todayWeight.weight} kg</span>
                </div>
              </div>
            )}

            {todayWater.map((water) => (
              <div key={water.id} className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Droplets size={18} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Water</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{water.glasses} glasses</span>
                </div>
              </div>
            ))}

            {todaySleep && (
              <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-200 dark:border-indigo-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Moon size={18} className="text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">Sleep</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{todaySleep.hours}h</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 capitalize">({todaySleep.quality})</span>
                  </div>
                </div>
              </div>
            )}

            {todayMeals.map((meal) => {
              const isCheat = meal.isCheatMeal;
              return (
                <div key={meal.id} className={`p-4 rounded-2xl border-2 ${
                  isCheat
                    ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700'
                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          {meal.mealType}
                        </span>
                        {meal.hadTea && <Coffee size={16} className="text-amber-600 dark:text-amber-400" />}
                        {isCheat && <Pizza size={16} className="text-rose-500 dark:text-rose-400" />}
                      </div>
                      <p className="text-sm text-gray-800 dark:text-gray-200">{meal.description}</p>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(meal.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Weight Summary</h2>
            <TrendingDown className="text-emerald-500 dark:text-emerald-400" size={28} />
          </div>

          <div className="space-y-5">
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Current Weight</span>
              <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">{currentWeight.toFixed(1)} kg</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-700">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Goal Weight</span>
              <span className="text-2xl font-semibold text-emerald-600 dark:text-emerald-400">{goalWeight.toFixed(1)} kg</span>
            </div>

            <div className="flex justify-between items-center p-4 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Difference</span>
              <span className={`text-2xl font-semibold ${weightDiff > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Progress to Goal</h2>
            <Target className="text-emerald-500 dark:text-emerald-400" size={28} />
          </div>

          <div className="space-y-5">
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-5 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {progress.toFixed(0)}% complete
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {weightDiff > 0 ? `${Math.abs(weightDiff).toFixed(1)} kg to go` : 'Goal achieved! 🎉'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
