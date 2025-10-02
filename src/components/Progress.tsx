import { TrendingDown, Calendar, Pizza } from 'lucide-react';
import { MealEntry, WeightLog } from '../types';

interface ProgressProps {
  meals: MealEntry[];
  weights: WeightLog[];
}

export default function Progress({ meals, weights }: ProgressProps) {
  const sortedWeights = [...weights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();
  const cheatMealsThisMonth = meals.filter(meal => {
    const mealDate = new Date(meal.date);
    return meal.isCheatMeal &&
           mealDate.getMonth() === thisMonth &&
           mealDate.getFullYear() === thisYear;
  }).length;

  const recentWeights = sortedWeights.slice(-7);
  const weightChange = recentWeights.length >= 2
    ? recentWeights[recentWeights.length - 1].weight - recentWeights[0].weight
    : 0;
  const avgWeeklyLoss = recentWeights.length >= 2 ? Math.abs(weightChange) : 0;

  const maxWeight = Math.max(...sortedWeights.map(e => e.weight), 80);
  const minWeight = Math.min(...sortedWeights.map(e => e.weight), 70);
  const range = maxWeight - minWeight;

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-6 shadow-lg border border-emerald-100 dark:border-gray-600">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Your Progress</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Track your journey</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="text-emerald-500 dark:text-emerald-400" size={22} />
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Weekly Change</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {weightChange >= 0 ? '+' : '-'}{avgWeeklyLoss.toFixed(1)} kg
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
          <div className="flex items-center gap-2 mb-3">
            <Pizza className="text-rose-500 dark:text-rose-400" size={22} />
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Cheat Meals</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">{cheatMealsThisMonth}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">This month</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-emerald-500 dark:text-emerald-400" size={22} />
          <h3 className="font-bold text-gray-800 dark:text-gray-100">Weight Trend</h3>
        </div>

        <div className="relative h-64 mb-4">
          <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
            {recentWeights.map((weight, index) => {
              const heightPercent = range > 0 ? ((weight.weight - minWeight) / range) * 100 : 50;
              return (
                <div key={weight.id} className="flex flex-col items-center flex-1">
                  <div className="relative group">
                    <div
                      className="bg-gradient-to-t from-emerald-500 to-teal-400 dark:from-emerald-600 dark:to-teal-500 rounded-t-lg w-8 transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${Math.max(heightPercent * 2, 20)}px` }}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 dark:bg-gray-800 text-white dark:text-gray-100 text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {weight.weight.toFixed(1)} kg
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                    {new Date(weight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200 dark:bg-gray-600" />
        </div>

        <div className="text-center text-sm text-gray-500 dark:text-gray-400">
          Last 7 entries
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
        <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-5">Recent Weight Logs</h3>
        <div className="space-y-4">
          {sortedWeights.slice(-5).reverse().map((weight) => {
            const dayMeals = meals.filter(m => m.date === weight.date);
            const hasCheat = dayMeals.some(m => m.isCheatMeal);
            return (
              <div key={weight.id} className="flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-700/50 rounded-2xl border border-gray-200 dark:border-gray-600">
                <div>
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(weight.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                  {hasCheat && (
                    <div className="flex items-center gap-1 mt-1">
                      <Pizza size={14} className="text-rose-500 dark:text-rose-400" />
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-medium">Cheat Day</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{weight.weight.toFixed(1)} kg</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
