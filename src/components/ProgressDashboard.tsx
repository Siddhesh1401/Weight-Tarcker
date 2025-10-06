import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { Activity, Droplets, Moon, TrendingUp, Award } from 'lucide-react';
import WeightChart from './WeightChart';
import { MealEntry, WeightLog as WeightLogType, WaterLog, SleepLog, UserSettings } from '../types';

interface ProgressData {
  totalMeals: number;
  totalWater: number;
  totalSleep: number;
  avgSleep: number;
  weightProgress: number;
  weeklyGoal: {
    meals: number;
    water: number;
    sleep: number;
  };
  recentWeights: Array<{
    date: string;
    weight: number;
  }>;
  mealDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  waterTrend: Array<{
    date: string;
    glasses: number;
  }>;
  sleepTrend: Array<{
    date: string;
    hours: number;
    quality: string;
  }>;
}

interface ProgressDashboardProps {
  className?: string;
  meals?: MealEntry[];
  weights?: WeightLogType[];
  waterLogs?: WaterLog[];
  sleepLogs?: SleepLog[];
  settings?: UserSettings;
}

export default function ProgressDashboard({ className = '', meals = [], weights = [], waterLogs = [], sleepLogs = [], settings }: ProgressDashboardProps) {
  const [progressData, setProgressData] = useState<ProgressData>({
    totalMeals: 0,
    totalWater: 0,
    totalSleep: 0,
    avgSleep: 0,
    weightProgress: 0,
    weeklyGoal: {
      meals: 21, // 3 meals/day
      water: 56, // 8 glasses/day
      sleep: 56, // 8 hours/day
    },
    recentWeights: [],
    mealDistribution: [
      { name: 'Breakfast', value: 0, color: '#8884d8' },
      { name: 'Lunch', value: 0, color: '#82ca9d' },
      { name: 'Dinner', value: 0, color: '#ffc658' },
      { name: 'Snacks', value: 0, color: '#ff7c7c' },
    ],
    waterTrend: [],
    sleepTrend: [],
  });

  useEffect(() => {
    calculateProgressData();
  }, [meals, weights, waterLogs, sleepLogs]);

  const calculateProgressData = () => {
    // Get current week data (last 7 days)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const weekMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= weekAgo && mealDate <= now;
    });

    const weekWeights = weights.filter(weight => {
      const weightDate = new Date(weight.date);
      return weightDate >= weekAgo && weightDate <= now;
    });

    // Calculate totals
    const totalMeals = weekMeals.length;

    // For water, we need to handle the case where water is logged as a meal type
    // In the current implementation, water might be logged differently
    const totalWater = 0; // Will need to be calculated from water logs when available

    const weekSleepEntries = meals.filter(meal =>
      meal.mealType === 'sleep' &&
      new Date(meal.date) >= weekAgo &&
      new Date(meal.date) <= now
    );

    const totalSleep = weekSleepEntries.reduce((sum, meal) => {
      const match = meal.description.match(/(\d+)/);
      return sum + (match ? parseInt(match[1]) : 0);
    }, 0);

    const avgSleep = weekSleepEntries.length > 0 ? totalSleep / weekSleepEntries.length : 0;

    // Weight progress (latest - oldest in the week)
    const sortedWeights = [...weekWeights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const weightProgress = sortedWeights.length >= 2
      ? sortedWeights[sortedWeights.length - 1].weight - sortedWeights[0].weight
      : 0;

    // Recent weights for chart (last 7 entries)
    const recentWeights = sortedWeights.slice(-7).map(weight => ({
      date: weight.date,
      weight: weight.weight
    }));

    // Meal distribution
    const mealTypes = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const mealDistribution = mealTypes.map((type, index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: weekMeals.filter(meal => meal.mealType === type).length,
      color: ['#fbbf24', '#f59e0b', '#d97706', '#b45309'][index]
    }));

    // Water trend (last 7 days)
    const waterTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayWater = (waterLogs || []).filter((log: WaterLog) => log.date === dateStr).reduce((sum: number, log: WaterLog) => sum + log.glasses, 0);
      return { date: dateStr, glasses: dayWater };
    });

    // Sleep trend (last 7 days)
    const sleepTrend = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      const daySleep = (sleepLogs || []).filter((log: SleepLog) => log.date === dateStr);
      const totalSleep = daySleep.reduce((sum: number, log: SleepLog) => sum + log.hours, 0);
      const qualityMap = { 'poor': 1, 'fair': 2, 'good': 3, 'excellent': 4 };
      const avgQuality = daySleep.length > 0 ? daySleep.reduce((sum: number, log: SleepLog) => sum + (qualityMap[log.quality] || 3), 0) / daySleep.length : 3;
      return { date: dateStr, hours: totalSleep, quality: ['Poor', 'Fair', 'Good', 'Excellent'][Math.round(avgQuality) - 1] || 'Good' };
    });

    setProgressData({
      totalMeals,
      totalWater,
      totalSleep,
      avgSleep: Math.round(avgSleep * 10) / 10,
      weightProgress,
      weeklyGoal: {
        meals: 21, // 3 meals/day * 7 days
        water: 56, // 8 glasses/day * 7 days
        sleep: 56  // 8 hours/day * 7 days
      },
      recentWeights,
      mealDistribution,
      waterTrend,
      sleepTrend
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-6 shadow-xl border border-emerald-100 dark:border-gray-600 animate-fadeIn">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-2xl smooth-hover hover:bg-emerald-200 dark:hover:bg-emerald-800">
              <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Progress Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Track your health journey</p>
            </div>
          </div>
          <Award className="text-emerald-500 dark:text-emerald-400 animate-bounce" size={32} />
        </div>
      </div>

      {/* Weight Chart */}
      <div className="animate-slideUp">
        <WeightChart data={progressData.recentWeights} />
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Meals */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-orange-200 dark:border-orange-300 animate-slideUp stagger-item smooth-hover hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-xl">
              <Activity className="text-orange-600 dark:text-orange-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Meals</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">This week</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-orange-600 dark:text-orange-400">
              {progressData.totalMeals}
            </span>
          </div>
          <div className="w-full bg-orange-100 dark:bg-orange-900 rounded-full h-2 mb-3">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((progressData.totalMeals / progressData.weeklyGoal.meals) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight text-center">
            {Math.max(0, progressData.weeklyGoal.meals - progressData.totalMeals)} more to reach goal
          </p>
        </div>

        {/* Water */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-blue-200 dark:border-blue-300 animate-slideUp stagger-item smooth-hover hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-xl">
              <Droplets className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Water</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Glasses this week</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">
              {progressData.totalWater}
            </span>
          </div>
          <div className="w-full bg-blue-100 dark:bg-blue-900 rounded-full h-2 mb-3">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((progressData.totalWater / progressData.weeklyGoal.water) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight text-center">
            {Math.max(0, progressData.weeklyGoal.water - progressData.totalWater)} more glasses to reach goal
          </p>
        </div>

        {/* Sleep */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border-2 border-indigo-200 dark:border-indigo-300 animate-slideUp stagger-item smooth-hover hover:shadow-lg hover:-translate-y-1">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-xl">
              <Moon className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">Sleep</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Hours this week</p>
            </div>
          </div>
          <div className="text-center mb-4">
            <span className="text-5xl font-bold text-indigo-600 dark:text-indigo-400">
              {progressData.totalSleep}h
            </span>
          </div>
          <div className="w-full bg-indigo-100 dark:bg-indigo-900 rounded-full h-2 mb-3">
            <div
              className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min((progressData.totalSleep / progressData.weeklyGoal.sleep) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-tight text-center">
            Avg: {progressData.avgSleep}h/night
          </p>
        </div>
      </div>

      {/* Meal Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm animate-slideUp">
        <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Meal Distribution</h3>
        <div className="h-64">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-6xl mb-4">
                {progressData.mealDistribution.some(item => item.value > 0) ? '🥗' : '📊'}
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                {progressData.totalMeals > 0
                  ? 'Your meal distribution will appear here'
                  : 'Log some meals to see your distribution'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {progressData.mealDistribution.map((item, index) => (
            <div key={index} className="flex items-center gap-2 animate-fadeIn">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{item.name}</span>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">({item.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900 dark:to-emerald-800 rounded-xl p-4 text-center animate-slideUp stagger-item smooth-hover hover:scale-105 transition-transform duration-200">
          <p className="text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wide font-semibold">Avg Sleep</p>
          <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">{progressData.avgSleep}h</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-xl p-4 text-center animate-slideUp stagger-item smooth-hover hover:scale-105 transition-transform duration-200">
          <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide font-semibold">Water/Day</p>
          <p className="text-xl font-bold text-blue-700 dark:text-blue-300">{(progressData.totalWater / 7).toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900 dark:to-orange-800 rounded-xl p-4 text-center animate-slideUp stagger-item smooth-hover hover:scale-105 transition-transform duration-200">
          <p className="text-xs text-orange-600 dark:text-orange-400 uppercase tracking-wide font-semibold">Meals/Day</p>
          <p className="text-xl font-bold text-orange-700 dark:text-orange-300">{(progressData.totalMeals / 7).toFixed(1)}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 rounded-xl p-4 text-center animate-slideUp stagger-item smooth-hover hover:scale-105 transition-transform duration-200">
          <p className="text-xs text-purple-600 dark:text-purple-400 uppercase tracking-wide font-semibold">Weight Change</p>
          <p className={`text-xl font-bold ${progressData.weightProgress < 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
            {progressData.weightProgress > 0 ? '+' : ''}{progressData.weightProgress}kg
          </p>
        </div>
      </div>
    </div>
  );
}
