import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ComposedChart,
  Bar,
  Area,
  AreaChart
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Droplets,
  Moon,
  Scale,
  BarChart3,
  ScatterChart as ScatterIcon,
  Calendar,
  Zap
} from 'lucide-react';
import { MealEntry, WeightLog, WaterLog, SleepLog } from '../types';

interface HealthTrendsChartProps {
  meals: MealEntry[];
  weights: WeightLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  className?: string;
  timeRange?: 'week' | 'month' | '3months' | '6months' | 'year';
  chartType?: 'trends' | 'correlation' | 'distribution';
}

interface TrendData {
  date: string;
  weight?: number;
  water?: number;
  sleep?: number;
  meals?: number;
  energy?: number; // Calculated from meals and sleep
  formattedDate: string;
}

interface CorrelationData {
  sleep: number;
  weight: number;
  water: number;
  date: string;
}

export default function HealthTrendsChart({
  meals,
  weights,
  waterLogs,
  sleepLogs,
  className = '',
  timeRange = 'month',
  chartType = 'trends'
}: HealthTrendsChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['weight', 'water', 'sleep']);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Calculate date range based on timeRange
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();

    switch (timeRange) {
      case 'week':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(endDate.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      case '6months':
        startDate.setMonth(endDate.getMonth() - 6);
        break;
      case 'year':
        startDate.setFullYear(endDate.getFullYear() - 1);
        break;
    }

    return { startDate, endDate };
  }, [timeRange]);

  // Process and aggregate data based on view mode
  const processedData = useMemo(() => {
    const { startDate, endDate } = dateRange;
    const data: TrendData[] = [];

    if (viewMode === 'daily') {
      // Daily view - one data point per day
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const dayMeals = meals.filter(m => m.date === dateStr);
        const dayWeight = weights.find(w => w.date === dateStr);
        const dayWater = waterLogs.filter(w => w.date === dateStr);
        const daySleep = sleepLogs.find(s => s.date === dateStr);

        data.push({
          date: dateStr,
          weight: dayWeight?.weight,
          water: dayWater.reduce((sum, w) => sum + w.glasses, 0),
          sleep: daySleep?.hours,
          meals: dayMeals.length,
          energy: calculateEnergyScore(dayMeals, daySleep),
          formattedDate: new Date(dateStr).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })
        });
      }
    } else if (viewMode === 'weekly') {
      // Weekly aggregation
      const weeks: { [key: string]: TrendData[] } = {};

      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const weekStart = new Date(d);
        weekStart.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
        const weekKey = weekStart.toISOString().split('T')[0];

        if (!weeks[weekKey]) {
          weeks[weekKey] = [];
        }

        const dayMeals = meals.filter(m => m.date === dateStr);
        const dayWeight = weights.find(w => w.date === dateStr);
        const dayWater = waterLogs.filter(w => w.date === dateStr);
        const daySleep = sleepLogs.find(s => s.date === dateStr);

        weeks[weekKey].push({
          date: dateStr,
          weight: dayWeight?.weight,
          water: dayWater.reduce((sum, w) => sum + w.glasses, 0),
          sleep: daySleep?.hours,
          meals: dayMeals.length,
          energy: calculateEnergyScore(dayMeals, daySleep),
          formattedDate: ''
        });
      }

      // Aggregate weekly data
      Object.keys(weeks).sort().forEach(weekKey => {
        const weekData = weeks[weekKey];
        const avgWeight = weekData.filter(d => d.weight).reduce((sum, d) => sum + (d.weight || 0), 0) /
                         weekData.filter(d => d.weight).length || undefined;
        const totalWater = weekData.reduce((sum, d) => sum + (d.water || 0), 0);
        const avgSleep = weekData.filter(d => d.sleep).reduce((sum, d) => sum + (d.sleep || 0), 0) /
                        weekData.filter(d => d.sleep).length || undefined;
        const totalMeals = weekData.reduce((sum, d) => sum + (d.meals || 0), 0);
        const avgEnergy = weekData.filter(d => d.energy).reduce((sum, d) => sum + (d.energy || 0), 0) /
                         weekData.filter(d => d.energy).length || undefined;

        data.push({
          date: weekKey,
          weight: avgWeight,
          water: totalWater,
          sleep: avgSleep,
          meals: totalMeals,
          energy: avgEnergy,
          formattedDate: `Week of ${new Date(weekKey).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          })}`
        });
      });
    }

    return data;
  }, [meals, weights, waterLogs, sleepLogs, dateRange, viewMode]);

  // Calculate energy score based on meals and sleep
  function calculateEnergyScore(dayMeals: MealEntry[], daySleep?: SleepLog): number {
    let score = 0;

    // Meals contribute to energy (more meals = more energy, but balanced is best)
    const mealCount = dayMeals.length;
    if (mealCount >= 3 && mealCount <= 5) score += 40;
    else if (mealCount >= 1 && mealCount <= 6) score += 20;

    // Sleep quality contributes to energy
    if (daySleep) {
      const qualityScore = { 'poor': 10, 'fair': 25, 'good': 40, 'excellent': 50 };
      score += qualityScore[daySleep.quality] || 20;

      // Sleep duration
      if (daySleep.hours >= 7 && daySleep.hours <= 9) score += 30;
      else if (daySleep.hours >= 5 && daySleep.hours <= 10) score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  // Calculate correlations
  const correlationData = useMemo(() => {
    const correlations: CorrelationData[] = [];

    // Get data points where we have both sleep and weight
    processedData.forEach(day => {
      if (day.sleep && day.weight && day.water) {
        correlations.push({
          sleep: day.sleep,
          weight: day.weight,
          water: day.water,
          date: day.formattedDate
        });
      }
    });

    return correlations;
  }, [processedData]);

  // Calculate trend statistics
  const trendStats = useMemo(() => {
    const stats = {
      weight: { trend: 0, change: 0, direction: 'stable' as 'up' | 'down' | 'stable' },
      water: { trend: 0, change: 0, direction: 'stable' as 'up' | 'down' | 'stable' },
      sleep: { trend: 0, change: 0, direction: 'stable' as 'up' | 'down' | 'stable' },
      energy: { trend: 0, change: 0, direction: 'stable' as 'up' | 'down' | 'stable' }
    };

    const validData = processedData.filter(d => d.weight || d.water || d.sleep || d.energy);

    if (validData.length >= 2) {
      const first = validData[0];
      const last = validData[validData.length - 1];

      // Weight trend
      if (first.weight && last.weight) {
        stats.weight.change = last.weight - first.weight;
        stats.weight.trend = (last.weight - first.weight) / first.weight * 100;
        stats.weight.direction = stats.weight.change > 0.1 ? 'up' :
                               stats.weight.change < -0.1 ? 'down' : 'stable';
      }

      // Water trend (total over period)
      const totalWater = validData.reduce((sum, d) => sum + (d.water || 0), 0);
      const avgWater = totalWater / validData.length;
      stats.water.trend = avgWater;
      stats.water.direction = avgWater > 6 ? 'up' : avgWater < 4 ? 'down' : 'stable';

      // Sleep trend
      if (first.sleep && last.sleep) {
        stats.sleep.change = last.sleep - first.sleep;
        stats.sleep.trend = last.sleep;
        stats.sleep.direction = stats.sleep.change > 0.2 ? 'up' :
                               stats.sleep.change < -0.2 ? 'down' : 'stable';
      }

      // Energy trend
      if (first.energy && last.energy) {
        stats.energy.change = last.energy - first.energy;
        stats.energy.trend = last.energy;
        stats.energy.direction = stats.energy.change > 5 ? 'up' :
                               stats.energy.change < -5 ? 'down' : 'stable';
      }
    }

    return stats;
  }, [processedData]);

  const renderTrendsChart = () => (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: 'weight', label: 'Weight', color: '#3b82f6', icon: Scale },
          { key: 'water', label: 'Water', color: '#06b6d4', icon: Droplets },
          { key: 'sleep', label: 'Sleep', color: '#8b5cf6', icon: Moon },
          { key: 'energy', label: 'Energy', color: '#f59e0b', icon: Zap }
        ].map(({ key, label, color, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setSelectedMetrics(prev =>
              prev.includes(key)
                ? prev.filter(m => m !== key)
                : [...prev, key]
            )}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedMetrics.includes(key)
                ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={processedData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis yAxisId="left" orientation="left" tick={{ fontSize: 12 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}
          />

          {selectedMetrics.includes('weight') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="weight"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              name="Weight (kg)"
            />
          )}

          {selectedMetrics.includes('water') && (
            <Bar
              yAxisId="right"
              dataKey="water"
              fill="#06b6d4"
              opacity={0.7}
              name="Water (glasses)"
            />
          )}

          {selectedMetrics.includes('sleep') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="sleep"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 3 }}
              name="Sleep (hours)"
            />
          )}

          {selectedMetrics.includes('energy') && (
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="energy"
              fill="#f59e0b"
              stroke="#f59e0b"
              fillOpacity={0.3}
              name="Energy Score"
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );

  const renderCorrelationChart = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sleep vs Weight Correlation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ScatterIcon size={20} />
            Sleep vs Weight Correlation
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                type="number"
                dataKey="sleep"
                name="Sleep Hours"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="weight"
                name="Weight"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Scatter
                dataKey="weight"
                fill="#8b5cf6"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Water vs Energy Correlation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity size={20} />
            Water vs Energy Correlation
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart data={correlationData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                type="number"
                dataKey="water"
                name="Water Intake"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="energy"
                name="Energy Score"
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '8px'
                }}
              />
              <Scatter
                dataKey="energy"
                fill="#06b6d4"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderDistributionChart = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sleep Quality Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Sleep Quality</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { quality: 'Poor', count: sleepLogs.filter(s => s.quality === 'poor').length, color: '#ef4444' },
              { quality: 'Fair', count: sleepLogs.filter(s => s.quality === 'fair').length, color: '#f97316' },
              { quality: 'Good', count: sleepLogs.filter(s => s.quality === 'good').length, color: '#eab308' },
              { quality: 'Excellent', count: sleepLogs.filter(s => s.quality === 'excellent').length, color: '#22c55e' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="quality" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Meal Type Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Meal Types</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { type: 'Breakfast', count: meals.filter(m => m.mealType === 'breakfast').length, color: '#fbbf24' },
              { type: 'Lunch', count: meals.filter(m => m.mealType === 'lunch').length, color: '#f59e0b' },
              { type: 'Dinner', count: meals.filter(m => m.mealType === 'dinner').length, color: '#d97706' },
              { type: 'Snacks', count: meals.filter(m => m.mealType === 'snacks').length, color: '#b45309' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="type" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Water Intake Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Water Intake</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={processedData.filter(d => d.water !== undefined)}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="formattedDate" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="water"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-600 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={28} />
            Health Trends & Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your progress and discover correlations in your health data
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={timeRange}
            onChange={(e) => {/* timeRange change handler */}}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="year">Last Year</option>
          </select>

          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { key: 'trends', label: 'Trends', icon: TrendingUp },
              { key: 'correlation', label: 'Correlations', icon: ScatterIcon },
              { key: 'distribution', label: 'Distribution', icon: BarChart3 }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => {/* chartType change handler */}}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  chartType === key
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Trend Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(trendStats).map(([metric, stats]) => {
          const icons = { weight: Scale, water: Droplets, sleep: Moon, energy: Zap };
          const colors = {
            weight: stats.direction === 'down' ? 'text-green-600' : stats.direction === 'up' ? 'text-red-600' : 'text-gray-600',
            water: stats.direction === 'up' ? 'text-blue-600' : 'text-gray-600',
            sleep: stats.direction === 'up' ? 'text-purple-600' : 'text-gray-600',
            energy: stats.direction === 'up' ? 'text-yellow-600' : 'text-gray-600'
          };
          const Icon = icons[metric as keyof typeof icons];

          return (
            <div key={metric} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={20} className={colors[metric as keyof typeof colors]} />
                  <span className="text-sm font-medium capitalize">{metric}</span>
                </div>
                {stats.direction !== 'stable' && (
                  stats.direction === 'up' ?
                    <TrendingUp size={16} className={colors[metric as keyof typeof colors]} /> :
                    <TrendingDown size={16} className={colors[metric as keyof typeof colors]} />
                )}
              </div>
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {metric === 'weight' ? `${stats.trend.toFixed(1)}kg` :
                   metric === 'water' ? `${stats.trend.toFixed(1)}` :
                   metric === 'sleep' ? `${stats.trend.toFixed(1)}h` :
                   `${stats.trend.toFixed(0)}%`}
                </div>
                {stats.change !== 0 && (
                  <div className={`text-sm ${colors[metric as keyof typeof colors]}`}>
                    {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}
                    {metric === 'weight' ? 'kg' : metric === 'sleep' ? 'h' : ''}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Content */}
      {chartType === 'trends' && renderTrendsChart()}
      {chartType === 'correlation' && renderCorrelationChart()}
      {chartType === 'distribution' && renderDistributionChart()}
    </div>
  );
}