import { useState } from 'react';
import { Save, Droplets, X } from 'lucide-react';

interface WaterLogProps {
  onSave: (glasses: number) => void;
  onCancel: () => void;
  currentGlasses?: number;
}

export default function WaterLog({ onSave, onCancel, currentGlasses = 0 }: WaterLogProps) {
  const [glasses, setGlasses] = useState(currentGlasses);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (glasses > 0) {
      onSave(glasses);
    }
  };

  const quickAdd = (amount: number) => {
    setGlasses(Math.max(0, glasses + amount));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-t-3xl p-6 border-b border-gray-100 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-xl">
                <Droplets className="text-blue-600 dark:text-blue-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Log Water</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stay hydrated!</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              {glasses}
            </div>
            <p className="text-gray-600 dark:text-gray-400">glasses of water</p>
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => quickAdd(-1)}
              className="w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-2xl font-bold transition-colors text-gray-700 dark:text-gray-300"
            >
              −
            </button>
            <button
              type="button"
              onClick={() => quickAdd(1)}
              className="w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white text-2xl font-bold transition-colors"
            >
              +
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 4, 8].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setGlasses(num)}
                className={`py-2 px-4 rounded-lg font-semibold transition-colors ${
                  glasses === num
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Save size={20} />
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
