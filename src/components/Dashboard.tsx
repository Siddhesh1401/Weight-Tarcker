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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">{greeting}</h1>
        <p className="text-emerald-700 font-medium italic">"{getRandomQuote()}"</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onQuickLog(action.type)}
                className={`relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all transform hover:scale-[1.02] ${
                  action.done ? 'ring-2 ring-emerald-400' : ''
                }`}
              >
                {action.done && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="text-emerald-500" size={20} fill="currentColor" />
                  </div>
                )}
                <div className="flex flex-col items-center gap-2">
                  <div className={`bg-${action.color}-100 p-3 rounded-xl`}>
                    <Icon className={`text-${action.color}-600`} size={24} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{action.label}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {(todayMeals.length > 0 || todayWeight || todayWater.length > 0 || todaySleep) && (
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4">Today's Log</h3>
          <div className="space-y-3">
            {todayWeight && (
              <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale size={16} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Weight</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-600">{todayWeight.weight} kg</span>
                </div>
              </div>
            )}

            {todayWater.map((water) => (
              <div key={water.id} className="p-3 rounded-xl bg-blue-50 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets size={16} className="text-blue-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Water</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{water.glasses} glasses</span>
                </div>
              </div>
            ))}

            {todaySleep && (
              <div className="p-3 rounded-xl bg-indigo-50 border-2 border-indigo-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon size={16} className="text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">Sleep</span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-indigo-600">{todaySleep.hours}h</span>
                    <span className="text-xs text-gray-600 ml-2 capitalize">({todaySleep.quality})</span>
                  </div>
                </div>
              </div>
            )}

            {todayMeals.map((meal) => {
              const isCheat = meal.isCheatMeal;
              return (
                <div key={meal.id} className={`p-3 rounded-xl ${isCheat ? 'bg-rose-50 border-2 border-rose-200' : 'bg-gray-50'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-500 uppercase">
                          {meal.mealType}
                        </span>
                        {meal.hadTea && <Coffee size={14} className="text-amber-600" />}
                        {isCheat && <Pizza size={14} className="text-rose-500" />}
                      </div>
                      <p className="text-sm text-gray-800">{meal.description}</p>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(meal.timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Weight Summary</h2>
            <TrendingDown className="text-emerald-500" size={24} />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Current Weight</span>
              <span className="text-2xl font-bold text-gray-900">{currentWeight.toFixed(1)} kg</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Goal Weight</span>
              <span className="text-xl font-semibold text-emerald-600">{goalWeight.toFixed(1)} kg</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Difference</span>
              <span className={`text-xl font-semibold ${weightDiff > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)} kg
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Progress to Goal</h2>
            <Target className="text-emerald-500" size={24} />
          </div>

          <div className="space-y-3">
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 text-center">
              {progress.toFixed(0)}% complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
