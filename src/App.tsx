import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import History from './components/History';
import ProgressDashboard from './components/ProgressDashboard';
import Settings from './components/Settings';
import BottomNav from './components/BottomNav';
import MealLog from './components/MealLog';
import CheatMealLog from './components/CheatMealLog';
import MealTypeSelector from './components/MealTypeSelector';
import WeightLog from './components/WeightLog';
import WaterLog from './components/WaterLog';
import SleepLog from './components/SleepLog';
import Toast from './components/Toast';
import DarkModeToggle from './components/DarkModeToggle';
import { MealEntry, WeightLog as WeightLogType, WaterLog as WaterLogType, SleepLog as SleepLogType, UserSettings, MealType } from './types';
import { mockMeals, mockWeights, defaultSettings } from './data/mockData';
import { logApi, settingsApi } from './services/api';
import notificationService from './services/notifications';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [meals, setMeals] = useState<MealEntry[]>(mockMeals);
  const [weights, setWeights] = useState<WeightLogType[]>(mockWeights);
  const [waterLogs, setWaterLogs] = useState<WaterLogType[]>([]);
  const [sleepLogs, setSleepLogs] = useState<SleepLogType[]>([]);
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [activeLogType, setActiveLogType] = useState<MealType | null>(null);
  const [showMealTypeSelector, setShowMealTypeSelector] = useState(false);
  const [showRegularMeal, setShowRegularMeal] = useState(false);
  const [showCheatMeal, setShowCheatMeal] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Edit states
  const [editingMeal, setEditingMeal] = useState<MealEntry | null>(null);
  const [editingWeight, setEditingWeight] = useState<WeightLogType | null>(null);
  const [editingWater, setEditingWater] = useState<WaterLogType | null>(null);
  const [editingSleep, setEditingSleep] = useState<SleepLogType | null>(null);

  // Auto-start notifications on app load
  useEffect(() => {
    // Give the app time to fully initialize
    const timer = setTimeout(() => {
      notificationService.startAll().catch(err => {
        console.log('Notification auto-start skipped:', err);
      });
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // Load data from backend on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Try to fetch from backend
        const [logsData, settingsData] = await Promise.all([
          logApi.getLogs().catch(() => null),
          settingsApi.getSettings().catch(() => null),
        ]);

        if (logsData) {
          setIsOnline(true);
          
          // Transform backend logs to frontend format
          const mealLogs: MealEntry[] = logsData
            .filter((log: any) => log.meal_type !== 'weight')
            .map((log: any) => ({
              id: log._id,
              date: log.date,
              mealType: log.meal_type,
              description: log.meal_notes,
              hadTea: log.tea_biscuit,
              isCheatMeal: log.cheat_meal,
              timestamp: log.timestamp,
            }));

          const weightLogs: WeightLogType[] = logsData
            .filter((log: any) => log.weight !== null && log.weight > 0)
            .map((log: any) => ({
              id: log._id,
              date: log.date,
              weight: log.weight,
              timestamp: log.timestamp,
            }));

          setMeals(mealLogs);
          setWeights(weightLogs);
        } else {
          // Backend not available, use mock data
          setIsOnline(false);
          console.log('Backend not available, using mock data');
        }

        if (settingsData) {
          setSettings({
            goalWeight: settingsData.goal_weight,
            breakfastTime: defaultSettings.breakfastTime,
            lunchTime: defaultSettings.lunchTime,
            snacksTime: defaultSettings.snacksTime,
            dinnerTime: defaultSettings.dinnerTime,
            notificationsEnabled: defaultSettings.notificationsEnabled,
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setIsOnline(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleQuickLog = (type: MealType) => {
    setActiveLogType(type);
    
    // For meals, show the type selector (Regular vs Cheat)
    if (['breakfast', 'lunch', 'snacks', 'dinner', 'other'].includes(type)) {
      setShowMealTypeSelector(true);
    }
    // For weight, water, sleep - show directly
  };

  const handleSaveMeal = async (description: string, hadTea?: boolean, isCheatMeal?: boolean, time?: string, date?: string) => {
    if (!activeLogType || activeLogType === 'weight') return;

    const now = new Date();
    const selectedDate = date || now.toISOString().split('T')[0];
    const selectedTime = time || now.toTimeString().slice(0, 5);
    
    // Create timestamp from selected date and time
    const timestamp = new Date(`${selectedDate}T${selectedTime}`).toISOString();

    // Check if we're editing
    if (editingMeal) {
      const updatedMeal: MealEntry = {
        ...editingMeal,
        description,
        hadTea,
        isCheatMeal,
        date: selectedDate,
        time: selectedTime,
        timestamp,
      };

      setMeals(meals.map(m => m.id === editingMeal.id ? updatedMeal : m));
      setActiveLogType(null);
      setShowRegularMeal(false);
      setShowCheatMeal(false);
      setEditingMeal(null);
      setToastMessage('✅ Meal updated successfully!');

      // Update backend if online
      if (isOnline) {
        try {
          await logApi.saveLog({
            date: updatedMeal.date,
            meal_type: updatedMeal.mealType,
            meal_notes: description,
            tea_biscuit: hadTea,
            cheat_meal: isCheatMeal,
            time: selectedTime,
          });
        } catch (error) {
          console.error('Failed to update meal on backend:', error);
        }
      }
      return;
    }

    // Creating new meal
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      mealType: activeLogType,
      description,
      hadTea,
      isCheatMeal,
      timestamp,
      time: selectedTime,
    };

    // Optimistically update UI
    setMeals([...meals, newMeal]);
    setActiveLogType(null);
    setToastMessage('🍽️ Meal logged successfully!');

    // Save to backend if online
    if (isOnline) {
      try {
        await logApi.saveLog({
          date: newMeal.date,
          meal_type: newMeal.mealType,
          meal_notes: description,
          tea_biscuit: hadTea,
          cheat_meal: isCheatMeal,
          time: time || now.toTimeString().slice(0, 5),
        });
        console.log('✅ Meal saved to backend');
      } catch (error) {
        console.error('Failed to save meal to backend:', error);
      }
    }
  };

  const handleSaveWeight = async (weight: number, time?: string, date?: string) => {
    // Validate weight input
    if (!Number.isFinite(weight) || isNaN(weight) || weight <= 0) {
      setToastMessage('❌ Invalid weight value');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const now = new Date();
    const selectedDate = date || now.toISOString().split('T')[0];
    const selectedTime = time || now.toTimeString().slice(0, 5);
    
    // Create timestamp from selected date and time
    const timestamp = new Date(`${selectedDate}T${selectedTime}`).toISOString();

    // Check if we're editing
    if (editingWeight) {
      const updatedWeight: WeightLogType = {
        ...editingWeight,
        weight,
        date: selectedDate,
        time: selectedTime,
        timestamp,
      };

      setWeights(weights.map(w => w.id === editingWeight.id ? updatedWeight : w));
      setActiveLogType(null);
      setEditingWeight(null);
      setToastMessage('✅ Weight updated successfully!');

      // Update backend if online
      if (isOnline) {
        try {
          await logApi.saveLog({
            date: updatedWeight.date,
            meal_type: 'weight',
            weight: weight,
            time: selectedTime,
          });
        } catch (error) {
          console.error('Failed to update weight on backend:', error);
        }
      }
      return;
    }

    // Creating new weight log
    const newWeight: WeightLogType = {
      id: Date.now().toString(),
      date: selectedDate,
      weight,
      timestamp,
      time: selectedTime,
    };

    // Optimistically update UI
    setWeights([...weights, newWeight]);
    setActiveLogType(null);
    setToastMessage('⚖️ Weight logged successfully!');

    // Save to backend if online
    if (isOnline) {
      try {
        await logApi.saveLog({
          date: newWeight.date,
          meal_type: 'weight',
          weight: weight,
          time: time || now.toTimeString().slice(0, 5),
        });
        console.log('✅ Weight saved to backend');
      } catch (error) {
        console.error('Failed to save weight to backend:', error);
      }
    }
  };

  const handleSaveWater = async (glasses: number, time?: string, date?: string) => {
    const now = new Date();
    const selectedDate = date || now.toISOString().split('T')[0];
    const selectedTime = time || now.toTimeString().slice(0, 5);
    
    // Validate glasses is a valid number
    if (!Number.isFinite(glasses) || isNaN(glasses) || glasses <= 0) {
      setToastMessage('❌ Invalid water amount');
      return;
    }
    
    // Create timestamp from selected date and time
    const timestamp = new Date(`${selectedDate}T${selectedTime}`).toISOString();

    // Check if we're editing
    if (editingWater) {
      const updatedWater: WaterLogType = {
        ...editingWater,
        glasses,
        date: selectedDate,
        time: selectedTime,
        timestamp,
      };

      setWaterLogs(waterLogs.map(w => w.id === editingWater.id ? updatedWater : w));
      setActiveLogType(null);
      setEditingWater(null);
      setToastMessage('✅ Water log updated successfully!');

      // Update backend if online
      if (isOnline) {
        try {
          await logApi.saveLog({
            date: updatedWater.date,
            meal_type: 'water',
            water_glasses: glasses,
            time: selectedTime,
          });
        } catch (error) {
          console.error('Failed to update water log on backend:', error);
        }
      }
      return;
    }

    // Creating new water log
    const newWater: WaterLogType = {
      id: Date.now().toString(),
      date: selectedDate,
      glasses,
      timestamp,
      time: selectedTime,
    };

    setWaterLogs([...waterLogs, newWater]);
    setActiveLogType(null);
    setToastMessage('💧 Water logged successfully!');

    if (isOnline) {
      try {
        await logApi.saveLog({
          date: newWater.date,
          meal_type: 'water',
          water_glasses: glasses,
          time: time || now.toTimeString().slice(0, 5),
        });
        console.log('✅ Water saved to backend');
      } catch (error) {
        console.error('Failed to save water to backend:', error);
      }
    }
  };

  const handleSaveSleep = async (hours: number, quality: 'poor' | 'fair' | 'good' | 'excellent', time?: string, date?: string) => {
    // Validate hours input
    if (!Number.isFinite(hours) || isNaN(hours) || hours <= 0) {
      setToastMessage('❌ Invalid sleep hours');
      setTimeout(() => setToastMessage(''), 3000);
      return;
    }

    const now = new Date();
    const selectedDate = date || now.toISOString().split('T')[0];
    const selectedTime = time || now.toTimeString().slice(0, 5);
    
    // Create timestamp from selected date and time
    const timestamp = new Date(`${selectedDate}T${selectedTime}`).toISOString();

    // Check if we're editing
    if (editingSleep) {
      const updatedSleep: SleepLogType = {
        ...editingSleep,
        hours,
        quality,
        date: selectedDate,
        time: selectedTime,
        timestamp,
      };

      setSleepLogs(sleepLogs.map(s => s.id === editingSleep.id ? updatedSleep : s));
      setActiveLogType(null);
      setEditingSleep(null);
      setToastMessage('✅ Sleep log updated successfully!');

      // Update backend if online
      if (isOnline) {
        try {
          await logApi.saveLog({
            date: updatedSleep.date,
            meal_type: 'sleep',
            sleep_hours: hours,
            sleep_quality: quality,
            time: selectedTime,
          });
        } catch (error) {
          console.error('Failed to update sleep log on backend:', error);
        }
      }
      return;
    }

    // Creating new sleep log
    const newSleep: SleepLogType = {
      id: Date.now().toString(),
      date: selectedDate,
      hours,
      quality,
      timestamp,
      time: selectedTime,
    };

    setSleepLogs([...sleepLogs, newSleep]);
    setActiveLogType(null);
    setToastMessage('😴 Sleep logged successfully!');

    if (isOnline) {
      try {
        await logApi.saveLog({
          date: newSleep.date,
          meal_type: 'sleep',
          sleep_hours: hours,
          sleep_quality: quality,
          time: time || now.toTimeString().slice(0, 5),
        });
        console.log('✅ Sleep saved to backend');
      } catch (error) {
        console.error('Failed to save sleep to backend:', error);
      }
    }
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    setSettings(newSettings);
    setCurrentPage('dashboard');
    setToastMessage('⚙️ Settings saved successfully!');

    // Save to backend if online
    if (isOnline) {
      try {
        await settingsApi.saveSettings({
          goal_weight: newSettings.goalWeight,
          height: newSettings.height,
          current_weight: newSettings.currentWeight,
          water_goal: newSettings.waterGoal,
          sleep_goal: newSettings.sleepGoal,
        });
        console.log('✅ Settings saved to backend');
      } catch (error) {
        console.error('Failed to save settings to backend:', error);
      }
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      if (isOnline) {
        await logApi.deleteLog(id);
      }
      setMeals(meals.filter(m => m.id !== id));
      setToastMessage('🗑️ Meal deleted');
    } catch (error) {
      console.error('Failed to delete meal:', error);
      setToastMessage('❌ Failed to delete meal');
    }
  };

  const handleDeleteWeight = async (id: string) => {
    try {
      if (isOnline) {
        await logApi.deleteLog(id);
      }
      setWeights(weights.filter(w => w.id !== id));
      setToastMessage('🗑️ Weight deleted');
    } catch (error) {
      console.error('Failed to delete weight:', error);
      setToastMessage('❌ Failed to delete weight');
    }
  };

  const handleDeleteWater = async (id: string) => {
    try {
      if (isOnline) {
        await logApi.deleteLog(id);
      }
      setWaterLogs(waterLogs.filter(w => w.id !== id));
      setToastMessage('🗑️ Water log deleted');
    } catch (error) {
      console.error('Failed to delete water log:', error);
      setToastMessage('❌ Failed to delete water log');
    }
  };

  const handleDeleteSleep = async (id: string) => {
    try {
      if (isOnline) {
        await logApi.deleteLog(id);
      }
      setSleepLogs(sleepLogs.filter(s => s.id !== id));
      setToastMessage('🗑️ Sleep log deleted');
    } catch (error) {
      console.error('Failed to delete sleep log:', error);
      setToastMessage('❌ Failed to delete sleep log');
    }
  };

  // Edit handlers
  const handleEditMeal = (meal: MealEntry) => {
    setEditingMeal(meal);
    if (meal.isCheatMeal) {
      setShowCheatMeal(true);
    } else {
      setShowRegularMeal(true);
    }
    setActiveLogType(meal.mealType);
  };

  const handleEditWeight = (weight: WeightLogType) => {
    setEditingWeight(weight);
    setActiveLogType('weight');
  };

  const handleEditWater = (water: WaterLogType) => {
    setEditingWater(water);
    setActiveLogType('water');
  };

  const handleEditSleep = (sleep: SleepLogType) => {
    setEditingSleep(sleep);
    setActiveLogType('sleep');
  };

  const handleDeleteAllData = async () => {
    try {
      if (isOnline) {
        await logApi.deleteAllLogs();
      }
      setMeals([]);
      setWeights([]);
      setWaterLogs([]);
      setSleepLogs([]);
      setToastMessage('🗑️ All data deleted');
    } catch (error) {
      console.error('Failed to delete all data:', error);
      setToastMessage('❌ Failed to delete all data');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex items-center justify-center">
        <div className="text-center animate-fadeIn">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-emerald-400 mx-auto mb-4"></div>
          <p className="text-gray-300 font-medium">Loading your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pb-24 transition-colors bg-gray-50 dark:bg-gray-900`}>
      {/* Dark Mode Toggle - Top Right Corner */}
      <div className="fixed top-4 right-4 z-50">
        <DarkModeToggle className="animate-fadeIn" />
      </div>

      {/* Connection Status Indicator */}
      {!isOnline && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 text-center animate-slideDown dark:bg-yellow-900/30 dark:border-yellow-700 dark:text-yellow-200">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⚠️ Offline mode - Changes won't be saved to server
          </p>
        </div>
      )}
      
      <div className="max-w-md mx-auto px-4 py-6 animate-fadeIn bg-white dark:bg-gray-800 rounded-2xl shadow-xl mx-4 mb-4 border border-gray-100 dark:border-gray-700">
        {currentPage === 'dashboard' && (
          <Dashboard
            meals={meals}
            weights={weights}
            waterLogs={waterLogs}
            sleepLogs={sleepLogs}
            settings={settings}
            onQuickLog={handleQuickLog}
          />
        )}

        {currentPage === 'history' && (
          <History 
            meals={meals} 
            weights={weights}
            waterLogs={waterLogs}
            sleepLogs={sleepLogs}
            onDeleteMeal={handleDeleteMeal}
            onDeleteWeight={handleDeleteWeight}
            onDeleteWater={handleDeleteWater}
            onDeleteSleep={handleDeleteSleep}
            onEditMeal={handleEditMeal}
            onEditWeight={handleEditWeight}
            onEditWater={handleEditWater}
            onEditSleep={handleEditSleep}
          />
        )}

        {currentPage === 'progress' && (
          <ProgressDashboard meals={meals} weights={weights} />
        )}

        {currentPage === 'settings' && (
          <Settings
            settings={settings}
            onSave={handleSaveSettings}
            onCancel={() => setCurrentPage('dashboard')}
            onDeleteAllData={handleDeleteAllData}
          />
        )}
      </div>

      {showMealTypeSelector && activeLogType && ['breakfast', 'lunch', 'snacks', 'dinner', 'other'].includes(activeLogType) && (
        <MealTypeSelector
          mealType={activeLogType}
          onSelectRegular={() => {
            setShowMealTypeSelector(false);
            setShowRegularMeal(true);
          }}
          onSelectCheat={() => {
            setShowMealTypeSelector(false);
            setShowCheatMeal(true);
          }}
          onCancel={() => {
            setShowMealTypeSelector(false);
            setActiveLogType(null);
          }}
        />
      )}

      {showRegularMeal && activeLogType && ['breakfast', 'lunch', 'snacks', 'dinner', 'other'].includes(activeLogType) && (
        <MealLog
          mealType={activeLogType}
          onSave={handleSaveMeal}
          onCancel={() => {
            setShowRegularMeal(false);
            setActiveLogType(null);
            setEditingMeal(null);
          }}
          isOnline={isOnline}
          editData={editingMeal}
        />
      )}

      {showCheatMeal && activeLogType && ['breakfast', 'lunch', 'snacks', 'dinner', 'other'].includes(activeLogType) && (
        <CheatMealLog
          mealType={activeLogType}
          onSave={(description, hadTea, time, date) => {
            handleSaveMeal(description, hadTea, true, time, date); // Always mark as cheat meal, pass time and date
            setShowCheatMeal(false);
          }}
          onCancel={() => {
            setShowCheatMeal(false);
            setActiveLogType(null);
            setEditingMeal(null);
          }}
          editData={editingMeal}
        />
      )}

      {activeLogType === 'weight' && (
        <WeightLog
          onSave={handleSaveWeight}
          onCancel={() => {
            setActiveLogType(null);
            setEditingWeight(null);
          }}
          editData={editingWeight}
        />
      )}

      {activeLogType === 'water' && (
        <WaterLog
          onSave={handleSaveWater}
          onCancel={() => {
            setActiveLogType(null);
            setEditingWater(null);
          }}
          editData={editingWater}
        />
      )}

      {activeLogType === 'sleep' && (
        <SleepLog
          onSave={handleSaveSleep}
          onCancel={() => {
            setActiveLogType(null);
            setEditingSleep(null);
          }}
          editData={editingSleep}
        />
      )}

      {toastMessage && (
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      )}

      <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
    </div>
  );
}

export default App;
