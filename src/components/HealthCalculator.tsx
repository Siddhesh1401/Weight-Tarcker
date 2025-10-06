import { useState, useEffect } from 'react';
import { Calculator, Ruler, Weight, User, Activity, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { UserSettings } from '../types';

interface HealthCalculatorProps {
  settings: UserSettings;
  onUpdateSettings: (updates: Partial<UserSettings>) => void;
  className?: string;
}

interface BMICategory {
  range: [number, number];
  category: string;
  color: string;
  description: string;
  healthRisk: string;
}

interface BodyFatResult {
  percentage: number;
  category: string;
  color: string;
  description: string;
  method: string;
}

const BMI_CATEGORIES: BMICategory[] = [
  { range: [0, 18.5], category: 'Underweight', color: 'text-blue-600', description: 'Below normal weight', healthRisk: 'Increased risk of nutritional deficiencies' },
  { range: [18.5, 24.9], category: 'Normal', color: 'text-green-600', description: 'Healthy weight range', healthRisk: 'Lowest health risk' },
  { range: [25, 29.9], category: 'Overweight', color: 'text-yellow-600', description: 'Above normal weight', healthRisk: 'Moderate health risk' },
  { range: [30, 34.9], category: 'Obese Class I', color: 'text-orange-600', description: 'Significantly above normal', healthRisk: 'High health risk' },
  { range: [35, 39.9], category: 'Obese Class II', color: 'text-red-600', description: 'Severely above normal', healthRisk: 'Very high health risk' },
  { range: [40, 100], category: 'Obese Class III', color: 'text-red-800', description: 'Extremely above normal', healthRisk: 'Extremely high health risk' }
];

const BODY_FAT_CATEGORIES = {
  male: [
    { range: [0, 6], category: 'Essential Fat', color: 'text-blue-600', description: 'Critical for basic physiological function' },
    { range: [6, 13], category: 'Athletes', color: 'text-green-600', description: 'Typical for athletes and fitness enthusiasts' },
    { range: [13, 17], category: 'Fitness', color: 'text-emerald-600', description: 'Good fitness level' },
    { range: [17, 25], category: 'Average', color: 'text-yellow-600', description: 'Average body fat for males' },
    { range: [25, 100], category: 'Obese', color: 'text-red-600', description: 'Above healthy range' }
  ],
  female: [
    { range: [0, 10], category: 'Essential Fat', color: 'text-blue-600', description: 'Critical for basic physiological function' },
    { range: [10, 20], category: 'Athletes', color: 'text-green-600', description: 'Typical for athletes and fitness enthusiasts' },
    { range: [20, 24], category: 'Fitness', color: 'text-emerald-600', description: 'Good fitness level' },
    { range: [24, 32], category: 'Average', color: 'text-yellow-600', description: 'Average body fat for females' },
    { range: [32, 100], category: 'Obese', color: 'text-red-600', description: 'Above healthy range' }
  ]
};

export default function HealthCalculator({ settings, onUpdateSettings, className = '' }: HealthCalculatorProps) {
  const [activeTab, setActiveTab] = useState<'bmi' | 'bodyfat'>('bmi');
  const [bmiResult, setBmiResult] = useState<{
    bmi: number;
    category: BMICategory;
    idealWeightRange: [number, number];
  } | null>(null);
  const [bodyFatResult, setBodyFatResult] = useState<BodyFatResult | null>(null);

  // Measurements for body fat calculations
  const [measurements, setMeasurements] = useState({
    neck: '', // cm
    waist: '', // cm
    hip: '', // cm (for females)
    height: settings.height?.toString() || '',
    weight: settings.currentWeight?.toString() || '',
    age: settings.age?.toString() || '',
    gender: settings.gender || 'male' as 'male' | 'female'
  });

  // Calculate BMI
  const calculateBMI = () => {
    const height = parseFloat(measurements.height);
    const weight = parseFloat(measurements.weight);

    if (!height || !weight || height <= 0 || weight <= 0) {
      return;
    }

    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);

    const category = BMI_CATEGORIES.find(cat => bmi >= cat.range[0] && bmi < cat.range[1]) || BMI_CATEGORIES[BMI_CATEGORIES.length - 1];

    // Calculate ideal weight range (BMI 18.5-24.9)
    const idealWeightMin = 18.5 * (heightInMeters * heightInMeters);
    const idealWeightMax = 24.9 * (heightInMeters * heightInMeters);

    setBmiResult({
      bmi: Math.round(bmi * 10) / 10,
      category,
      idealWeightRange: [Math.round(idealWeightMin * 10) / 10, Math.round(idealWeightMax * 10) / 10]
    });
  };

  // Calculate Body Fat Percentage using Navy Method
  const calculateBodyFatNavy = () => {
    const height = parseFloat(measurements.height);
    const weight = parseFloat(measurements.weight);
    const neck = parseFloat(measurements.neck);
    const waist = parseFloat(measurements.waist);
    const hip = parseFloat(measurements.hip);

    if (!height || !weight || !neck || !waist) {
      return null;
    }

    let bodyFatPercentage = 0;

    if (measurements.gender === 'male') {
      // Navy Method for males: 86.010 * log10(abdomen - neck) - 70.041 * log10(height) + 36.76
      const abdomenNeckDiff = waist - neck;
      bodyFatPercentage = 86.010 * Math.log10(abdomenNeckDiff) - 70.041 * Math.log10(height) + 36.76;
    } else {
      // Navy Method for females: 163.205 * log10(abdomen + hip - neck) - 97.684 * log10(height) - 78.387
      const abdomenHipNeck = waist + hip - neck;
      bodyFatPercentage = 163.205 * Math.log10(abdomenHipNeck) - 97.684 * Math.log10(height) - 78.387;
    }

    bodyFatPercentage = Math.max(0, Math.min(50, bodyFatPercentage)); // Clamp between 0-50%

    const categories = BODY_FAT_CATEGORIES[measurements.gender];
    const category = categories.find(cat => bodyFatPercentage >= cat.range[0] && bodyFatPercentage < cat.range[1]) || categories[categories.length - 1];

    return {
      percentage: Math.round(bodyFatPercentage * 10) / 10,
      category: category.category,
      color: category.color,
      description: category.description,
      method: 'U.S. Navy Method'
    };
  };

  // Calculate Body Fat using Boer Formula
  const calculateBodyFatBoer = () => {
    const age = parseFloat(measurements.age);
    const bmi = bmiResult?.bmi;

    if (!age || !bmi) {
      return null;
    }

    let bodyFatPercentage = 0;

    if (measurements.gender === 'male') {
      bodyFatPercentage = (1.20 * bmi) + (0.23 * age) - 16.2;
    } else {
      bodyFatPercentage = (1.20 * bmi) + (0.23 * age) - 5.4;
    }

    bodyFatPercentage = Math.max(0, Math.min(50, bodyFatPercentage));

    const categories = BODY_FAT_CATEGORIES[measurements.gender];
    const category = categories.find(cat => bodyFatPercentage >= cat.range[0] && bodyFatPercentage < cat.range[1]) || categories[categories.length - 1];

    return {
      percentage: Math.round(bodyFatPercentage * 10) / 10,
      category: category.category,
      color: category.color,
      description: category.description,
      method: 'Boer Formula'
    };
  };

  // Calculate body fat based on selected method
  const calculateBodyFat = () => {
    const method = settings.bodyFatMethod || 'navy';

    let result: BodyFatResult | null = null;

    switch (method) {
      case 'navy':
        result = calculateBodyFatNavy();
        break;
      case 'boer':
        result = calculateBodyFatBoer();
        break;
      default:
        result = calculateBodyFatNavy();
    }

    setBodyFatResult(result);
  };

  // Auto-calculate when inputs change
  useEffect(() => {
    if (measurements.height && measurements.weight) {
      calculateBMI();
    }
  }, [measurements.height, measurements.weight]);

  useEffect(() => {
    if (bmiResult && measurements.age) {
      calculateBodyFat();
    }
  }, [bmiResult, measurements, settings.bodyFatMethod]);

  const updateMeasurements = (field: string, value: string) => {
    setMeasurements(prev => ({ ...prev, [field]: value }));

    // Update settings if it's a core field
    if (['height', 'age', 'gender'].includes(field)) {
      onUpdateSettings({ [field]: field === 'gender' ? value : parseFloat(value) || undefined });
    }
  };

  const getBMIDescription = (bmi: number) => {
    if (bmi < 18.5) return "Your BMI indicates you're underweight. Consider consulting a healthcare professional.";
    if (bmi < 25) return "Your BMI is in the healthy range. Keep up the good work!";
    if (bmi < 30) return "Your BMI indicates you're overweight. Consider lifestyle changes.";
    return "Your BMI indicates obesity. Please consult a healthcare professional.";
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-600 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Calculator className="text-emerald-600 dark:text-emerald-400" size={28} />
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Health Calculators</h2>
          <p className="text-gray-600 dark:text-gray-400">Calculate BMI and body fat percentage</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
        <button
          onClick={() => setActiveTab('bmi')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'bmi'
              ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Target size={16} />
          BMI Calculator
        </button>
        <button
          onClick={() => setActiveTab('bodyfat')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
            activeTab === 'bodyfat'
              ? 'bg-white dark:bg-gray-600 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <Activity size={16} />
          Body Fat
        </button>
      </div>

      {/* BMI Calculator */}
      {activeTab === 'bmi' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Measurements</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Height (cm)
                </label>
                <div className="relative">
                  <Ruler className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    value={measurements.height}
                    onChange={(e) => updateMeasurements('height', e.target.value)}
                    placeholder="170"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Weight (kg)
                </label>
                <div className="relative">
                  <Weight className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    value={measurements.weight}
                    onChange={(e) => updateMeasurements('weight', e.target.value)}
                    placeholder="70"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">BMI Results</h3>

              {bmiResult ? (
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                      {bmiResult.bmi}
                    </div>
                    <div className={`text-lg font-semibold ${bmiResult.category.color}`}>
                      {bmiResult.category.category}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Category:</span>
                      <span className="font-medium">{bmiResult.category.description}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Ideal Weight:</span>
                      <span className="font-medium">{bmiResult.idealWeightRange[0]} - {bmiResult.idealWeightRange[1]} kg</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Health Risk:</span>
                      <span className="font-medium">{bmiResult.category.healthRisk}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {getBMIDescription(bmiResult.bmi)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                  <Target className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-600 dark:text-gray-400">
                    Enter your height and weight to calculate BMI
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Body Fat Calculator */}
      {activeTab === 'bodyfat' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Body Measurements</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="number"
                    value={measurements.age}
                    onChange={(e) => updateMeasurements('age', e.target.value)}
                    placeholder="30"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    value={measurements.gender}
                    onChange={(e) => updateMeasurements('gender', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Neck Circumference (cm)
                </label>
                <input
                  type="number"
                  value={measurements.neck}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, neck: e.target.value }))}
                  placeholder="38"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waist Circumference (cm)
                </label>
                <input
                  type="number"
                  value={measurements.waist}
                  onChange={(e) => setMeasurements(prev => ({ ...prev, waist: e.target.value }))}
                  placeholder="85"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              {measurements.gender === 'female' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Hip Circumference (cm)
                  </label>
                  <input
                    type="number"
                    value={measurements.hip}
                    onChange={(e) => setMeasurements(prev => ({ ...prev, hip: e.target.value }))}
                    placeholder="95"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Calculation Method
                </label>
                <select
                  value={settings.bodyFatMethod || 'navy'}
                  onChange={(e) => onUpdateSettings({ bodyFatMethod: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="navy">U.S. Navy Method</option>
                  <option value="boer">Boer Formula (BMI-based)</option>
                </select>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Body Fat Results</h3>

              {bodyFatResult ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6">
                  <div className="text-center mb-4">
                    <div className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                      {bodyFatResult.percentage}%
                    </div>
                    <div className={`text-lg font-semibold ${bodyFatResult.color}`}>
                      {bodyFatResult.category}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {bodyFatResult.method}
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Description:</span>
                      <span className="font-medium text-right">{bodyFatResult.description}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="text-amber-500 mt-0.5 flex-shrink-0" size={16} />
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        Body fat percentage calculations are estimates. For accurate measurements, consult a healthcare professional.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 text-center">
                  <Activity className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-600 dark:text-gray-400">
                    Complete your measurements to calculate body fat percentage
                  </p>
                </div>
              )}

              {/* Method Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">About {settings.bodyFatMethod === 'navy' ? 'U.S. Navy Method' : 'Boer Formula'}</h4>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {settings.bodyFatMethod === 'navy'
                    ? 'Uses neck and waist measurements (plus hip for females) for accurate body fat estimation.'
                    : 'Uses BMI and age for a quick body fat estimation when detailed measurements aren\'t available.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}