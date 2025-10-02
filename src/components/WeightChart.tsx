import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';

interface WeightData {
  date: string;
  weight: number;
  target?: number;
}

interface WeightChartProps {
  data: WeightData[];
  className?: string;
}

export default function WeightChart({ data, className = '' }: WeightChartProps) {
  const [chartData, setChartData] = useState<WeightData[]>([]);

  useEffect(() => {
    if (data.length > 0) {
      // Sort by date and prepare chart data
      const sortedData = [...data]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          }),
          weight: item.weight,
          target: item.target || 70 // Default target weight
        }));

      setChartData(sortedData);
    }
  }, [data]);

  if (chartData.length === 0) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-600 ${className}`}>
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          <Target size={48} className="mx-auto mb-2 opacity-50" />
          <p>No weight data yet</p>
          <p className="text-sm">Start logging your weight to see trends!</p>
        </div>
      </div>
    );
  }

  // Calculate trend
  const getTrend = () => {
    if (chartData.length < 2) return 'stable';

    const first = chartData[0].weight;
    const last = chartData[chartData.length - 1].weight;
    const diff = last - first;

    if (Math.abs(diff) < 0.5) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  const trend = getTrend();
  const totalChange = chartData.length > 1 ?
    chartData[chartData.length - 1].weight - chartData[0].weight : 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-xl">
            <Target className="text-emerald-600 dark:text-emerald-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Weight Trends</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track your progress over time</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {trend === 'up' && <TrendingUp className="text-red-500 dark:text-red-400" size={20} />}
          {trend === 'down' && <TrendingDown className="text-green-500 dark:text-green-400" size={20} />}
          {trend === 'stable' && <Minus className="text-gray-500 dark:text-gray-400" size={20} />}

          <span className={`text-sm font-semibold ${
            trend === 'up' ? 'text-red-500 dark:text-red-400' :
            trend === 'down' ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}kg
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb dark:#374151" />
            <XAxis
              dataKey="date"
              stroke="#6b7280 dark:#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#6b7280 dark:#9ca3af"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={['dataMin - 2', 'dataMax + 2']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-2xl shadow-xl">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{label}</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        {data.weight} kg
                      </p>
                      {data.target && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Target: {data.target} kg
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
            {/* Target weight line */}
            <Line
              type="monotone"
              dataKey="target"
              stroke="#ef4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-gray-600">
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current</p>
          <p className="text-lg font-bold text-gray-800 dark:text-gray-100">
            {chartData[chartData.length - 1]?.weight || 0} kg
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Target</p>
          <p className="text-lg font-bold text-red-500 dark:text-red-400">
            {chartData[0]?.target || 70} kg
          </p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Progress</p>
          <p className={`text-lg font-bold ${
            trend === 'down' ? 'text-green-500 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'
          }`}>
            {Math.abs(totalChange).toFixed(1)} kg
          </p>
        </div>
      </div>
    </div>
  );
}
