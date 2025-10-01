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
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-800">Your Progress</h1>
        <p className="text-gray-600 mt-1">Track your journey</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-emerald-500" size={20} />
            <h3 className="text-sm font-semibold text-gray-600">Weekly Change</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {weightChange >= 0 ? '+' : '-'}{avgWeeklyLoss.toFixed(1)} kg
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Pizza className="text-rose-500" size={20} />
            <h3 className="text-sm font-semibold text-gray-600">Cheat Meals</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">{cheatMealsThisMonth}</p>
          <p className="text-xs text-gray-500 mt-1">This month</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-emerald-500" size={20} />
          <h3 className="font-semibold text-gray-800">Weight Trend</h3>
        </div>

        <div className="relative h-64 mb-4">
          <div className="absolute inset-0 flex items-end justify-between px-2 pb-8">
            {recentWeights.map((weight, index) => {
              const heightPercent = range > 0 ? ((weight.weight - minWeight) / range) * 100 : 50;
              return (
                <div key={weight.id} className="flex flex-col items-center flex-1">
                  <div className="relative group">
                    <div
                      className="bg-gradient-to-t from-emerald-500 to-teal-400 rounded-t-lg w-8 transition-all hover:opacity-80 cursor-pointer"
                      style={{ height: `${Math.max(heightPercent * 2, 20)}px` }}
                    />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {weight.weight.toFixed(1)} kg
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-500 text-center">
                    {new Date(weight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gray-200" />
        </div>

        <div className="text-center text-sm text-gray-500">
          Last 7 entries
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">Recent Weight Logs</h3>
        <div className="space-y-3">
          {sortedWeights.slice(-5).reverse().map((weight) => {
            const dayMeals = meals.filter(m => m.date === weight.date);
            const hasCheat = dayMeals.some(m => m.isCheatMeal);
            return (
              <div key={weight.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-semibold text-gray-800">
                    {new Date(weight.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                  </p>
                  {hasCheat && (
                    <div className="flex items-center gap-1 mt-1">
                      <Pizza size={14} className="text-rose-500" />
                      <span className="text-xs text-rose-600 font-medium">Cheat Day</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{weight.weight.toFixed(1)} kg</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
