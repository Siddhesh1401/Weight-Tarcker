import { BookOpen } from 'lucide-react';

interface DietPlanProps {
  className?: string;
}

export default function DietPlan({ className = '' }: DietPlanProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-3 rounded-2xl">
            <BookOpen className="text-emerald-600 dark:text-emerald-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">🥗 My Personalized Diet Plan</h2>
            <p className="text-gray-600 dark:text-gray-400">Your complete daily meal guide</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Morning Section */}
          <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-700">
            <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-2">
              🌅 Morning (7:00–10:30 AM)
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Just water after waking up (500 ml)</li>
              <li>• If hungry: 5–6 soaked almonds OR 1 fruit (apple/banana)</li>
              <li>• No tea yet</li>
            </ul>
          </div>

          {/* Breakfast Section */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border border-amber-200 dark:border-amber-700">
            <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
              ☕ Breakfast / First Tea (11:00 AM)
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• 1 tea (50 ml, as you like)</li>
              <li>• Biscuit/Toast (2–3 small Marie-type biscuits or 1 toast)</li>
              <li>• Idli/Dosa/Upma/Poha (keep it light)</li>
              <li>• If medu vada → max 1 piece + 1 idli</li>
            </ul>
          </div>

          {/* Lunch Section */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-4 border border-orange-200 dark:border-orange-700">
            <h3 className="text-lg font-bold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-2">
              🍛 Lunch (1:00–2:00 PM)
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• 2–3 chapatis</li>
              <li>• 1 sabji (vegetable curry/dry bhaji)</li>
              <li>• Small salad (cucumber/tomato if available)</li>
              <li className="text-rose-600 dark:text-rose-400 font-semibold">• 🚫 No coldrink (replace with water or buttermilk)</li>
            </ul>
          </div>

          {/* Evening Snack Section */}
          <div className="bg-teal-50 dark:bg-teal-900/20 rounded-2xl p-4 border border-teal-200 dark:border-teal-700">
            <h3 className="text-lg font-bold text-teal-700 dark:text-teal-400 mb-2 flex items-center gap-2">
              🍵 Evening Snack + Tea (6:00 PM)
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• 1 tea (50 ml)</li>
              <li>• 2 biscuits / 1 toast (limit)</li>
              <li>• Healthy option: roasted chana / sprouts / fruit / makhana</li>
              <li className="text-rose-600 dark:text-rose-400 font-semibold">• 🚫 Avoid chips, samosa, heavy fried snacks</li>
            </ul>
          </div>

          {/* Dinner Section */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-700">
            <h3 className="text-lg font-bold text-indigo-700 dark:text-indigo-400 mb-3 flex items-center gap-2">
              🌙 Dinner (10:30–11:00 PM)
            </h3>
            <div className="mb-3">
              <p className="font-semibold text-indigo-600 dark:text-indigo-300 mb-1">Option A (Regular):</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                <li>• 2 chapatis + sabji + dal OR curd + salad</li>
                <li>• Skip rice on most days</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-indigo-600 dark:text-indigo-300 mb-1">Option B (Light Dinner):</p>
              <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1 ml-4">
                <li>• 1 bowl curd + little rice OR 2 chapatis + sabji</li>
                <li>• Or dal soup / khichdi on lighter days</li>
              </ul>
            </div>
          </div>

          {/* Before Bed Section */}
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 border border-purple-200 dark:border-purple-700">
            <h3 className="text-lg font-bold text-purple-700 dark:text-purple-400 mb-2 flex items-center gap-2">
              🌙 Before Bed (optional)
            </h3>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• 1 fruit (apple/papaya)</li>
              <li>• OR small bowl curd (plain, no sugar)</li>
            </ul>
          </div>

          {/* Rules Section */}
          <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-4 border border-rose-200 dark:border-rose-700">
            <h3 className="text-lg font-bold text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
              🚀 Rules to Follow
            </h3>
            <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>1. Cheat Meal: Only once a week (pizza, burger, sweets)</li>
              <li>2. Compensate Cheat Meal: Next meal = very light (curd + salad)</li>
              <li>3. Water: At least 2.5–3 liters/day</li>
              <li>4. Weight Tracking: Log daily in your website</li>
              <li>5. Small Activity: 20–30 min evening walk helps digestion</li>
            </ol>
          </div>

          {/* Goals Section */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-700 text-center">
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center justify-center gap-2">
              🎯 Your Goals
            </h3>
            <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <p>👉 First Goal: From 90 → 85 kg in 2 months</p>
              <p>👉 Long Goal: 78–80 kg (ideal for 6'1")</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
