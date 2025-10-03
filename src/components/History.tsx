import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Scale, Droplets, Moon, Coffee, Pizza, Trash2, Download, Filter } from 'lucide-react';
import { MealEntry, WeightLog, WaterLog, SleepLog } from '../types';
import DeleteConfirmation from './DeleteConfirmation';
import ExportModal from './ExportModal';

interface HistoryProps {
  meals: MealEntry[];
  weights: WeightLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  onDeleteMeal: (id: string) => void;
  onDeleteWeight: (id: string) => void;
  onDeleteWater: (id: string) => void;
  onDeleteSleep: (id: string) => void;
}

export default function History({ meals, weights, waterLogs, sleepLogs, onDeleteMeal, onDeleteWeight, onDeleteWater, onDeleteSleep }: HistoryProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: string; id: string; description: string } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'single' | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'meals' | 'weight' | 'water' | 'sleep'>('all');

  // Get unique dates from all logs
  const allDates = new Set<string>();
  meals.forEach(m => allDates.add(m.date));
  weights.forEach(w => allDates.add(w.date));
  waterLogs.forEach(w => allDates.add(w.date));
  sleepLogs.forEach(s => allDates.add(s.date));

  const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a)); // Most recent first

  const getLogsForDate = (date: string) => {
    return {
      meals: meals.filter(m => m.date === date),
      weight: weights.find(w => w.date === date),
      water: waterLogs.filter(w => w.date === date),
      sleep: sleepLogs.find(s => s.date === date),
    };
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    if (dateStr === today) return 'Today';
    if (dateStr === yesterday) return 'Yesterday';
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (time?: string, timestamp?: string) => {
    if (time) {
      // Convert HH:MM to 12-hour format
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    if (timestamp) {
      return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    }
    return '';
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    if (exportType === 'all') {
      exportAllData(format);
    } else if (exportType === 'single' && selectedDate) {
      exportSingleDay(selectedDate, format);
    }
    setShowExportModal(false);
    setExportType(null);
  };

  const exportAllData = (format: 'csv' | 'json' | 'pdf') => {
    const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const url = `${API_BASE_URL.replace('/api', '')}/api/export?user_id=user_001&format=${format}`;
    window.open(url, '_blank');
  };

  const exportSingleDay = (date: string, format: 'csv' | 'json' | 'pdf') => {
    const logs = getLogsForDate(date);

    if (format === 'csv') {
      const csvData = generateCSV(logs, date);
      downloadFile(csvData, `weight-tracker-${date}.csv`, 'text/csv');
    } else if (format === 'json') {
      const jsonData = JSON.stringify({ date, ...logs }, null, 2);
      downloadFile(jsonData, `weight-tracker-${date}.json`, 'application/json');
    } else if (format === 'pdf') {
      exportPDF(logs, date);
    }
  };

  const generateCSV = (logs: any, date: string) => {
    let csv = `Weight Tracker Export - ${date}\n\n`;

    if (logs.weight) {
      csv += `Weight,${logs.weight.weight} kg\n`;
    }

    if (logs.water.length > 0) {
      csv += `\nWater Intake\n`;
      logs.water.forEach((w: any) => csv += `${w.glasses} glasses\n`);
    }

    if (logs.sleep) {
      csv += `\nSleep\n`;
      csv += `${logs.sleep.hours} hours,${logs.sleep.quality}\n`;
    }

    if (logs.meals.length > 0) {
      csv += `\nMeals\n`;
      csv += `Type,Description,Cheat Meal,Time\n`;
      logs.meals.forEach((m: any) => {
        csv += `${m.mealType},"${m.description}",${m.isCheatMeal ? 'Yes' : 'No'},${new Date(m.timestamp).toLocaleTimeString()}\n`;
      });
    }

    return csv;
  };

  const exportPDF = (logs: any, date: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Weight Tracker - ${date}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
            h1 { color: #10b981; border-bottom: 2px solid #10b981; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .data-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { font-weight: bold; color: #374151; }
            .value { color: #10b981; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #10b981; color: white; }
          </style>
        </head>
        <body>
          <h1>Weight Tracker Export</h1>
          <p><strong>Date:</strong> ${date}</p>

          ${logs.weight ? `
            <div class="section">
              <h2>Weight</h2>
              <div class="data-row">
                <span class="label">Weight:</span>
                <span class="value">${logs.weight.weight} kg</span>
              </div>
            </div>
          ` : ''}

          ${logs.water.length > 0 ? `
            <div class="section">
              <h2>Water Intake</h2>
              ${logs.water.map((w: any) => `
                <div class="data-row">
                  <span class="label">Water:</span>
                  <span class="value">${w.glasses} glasses</span>
                </div>
              `).join('')}
            </div>
          ` : ''}

          ${logs.sleep ? `
            <div class="section">
              <h2>Sleep</h2>
              <div class="data-row">
                <span class="label">Duration:</span>
                <span class="value">${logs.sleep.hours} hours</span>
              </div>
              <div class="data-row">
                <span class="label">Quality:</span>
                <span class="value">${logs.sleep.quality}</span>
              </div>
            </div>
          ` : ''}

          ${logs.meals.length > 0 ? `
            <div class="section">
              <h2>Meals</h2>
              <table>
                <tr><th>Type</th><th>Description</th><th>Cheat Meal</th></tr>
                ${logs.meals.map((m: any) => `
                  <tr>
                    <td>${m.mealType}</td>
                    <td>${m.description}</td>
                    <td>${m.isCheatMeal ? 'Yes' : 'No'}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          ` : ''}

          ${logs.meals.length === 0 && !logs.weight && logs.water.length === 0 && !logs.sleep ? `
            <p>No logs recorded for this date.</p>
          ` : ''}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-6 animate-fadeIn">
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-3xl p-6 shadow-lg border border-emerald-100 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="text-emerald-600 dark:text-emerald-400" size={28} />
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">History</h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">View your past logs</p>
            </div>
          </div>
          <button
            onClick={() => {
              setExportType('all');
              setShowExportModal(true);
            }}
            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg"
          >
            <Download size={18} />
            Export All
          </button>
        </div>
      </div>

      {sortedDates.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg border border-gray-100 dark:border-gray-600 text-center">
          <Calendar className="mx-auto text-gray-400 dark:text-gray-500 mb-4" size={48} />
          <p className="text-gray-600 dark:text-gray-400">No logs yet. Start tracking!</p>
        </div>
      ) : (
        <>
          {/* Filter Dropdown */}
          {!selectedDate && (
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Select a Date</h2>
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as any)}
                    className="appearance-none bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-2xl px-5 py-3 pr-10 font-semibold text-gray-700 dark:text-gray-200 hover:border-emerald-500 dark:hover:border-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 focus:outline-none transition-colors"
                  >
                    <option value="all">All Logs</option>
                    <option value="meals">Meals Only</option>
                    <option value="weight">Weight Only</option>
                    <option value="water">Water Only</option>
                    <option value="sleep">Sleep Only</option>
                  </select>
                  <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          )}

          {/* Date List */}
          {!selectedDate && (
            <div className="space-y-4">
              {sortedDates.filter(date => {
                if (filterType === 'all') return true;

                const logs = getLogsForDate(date);
                if (filterType === 'meals') return logs.meals.length > 0;
                if (filterType === 'weight') return !!logs.weight;
                if (filterType === 'water') return logs.water.length > 0;
                if (filterType === 'sleep') return !!logs.sleep;

                return true;
              }).map((date) => {
                const logs = getLogsForDate(date);
                const logCount = logs.meals.length + (logs.weight ? 1 : 0) + logs.water.length + (logs.sleep ? 1 : 0);

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className="w-full bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all text-left border border-gray-100 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-700"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">{formatDate(date)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 rounded-full">{logCount} logs</span>
                        <ChevronRight size={20} className="text-gray-400 dark:text-gray-500" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Selected Date Details */}
          {selectedDate && (() => {
            const selectedLogs = getLogsForDate(selectedDate);
            return (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedDate(null)}
                    className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                  >
                    <ChevronLeft size={20} />
                    Back to dates
                  </button>

                  <button
                    onClick={() => {
                      setExportType('single');
                      setShowExportModal(true);
                    }}
                    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg"
                  >
                    <Download size={18} />
                    Export Day
                  </button>
                </div>

                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-5 border border-emerald-100 dark:border-gray-600">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatDate(selectedDate)}</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{selectedDate}</p>
                </div>

                {/* Weight */}
                {selectedLogs.weight && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border-2 border-emerald-200 dark:border-emerald-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Scale size={22} className="text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-200">Weight</span>
                          {selectedLogs.weight.time && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(selectedLogs.weight.time, selectedLogs.weight.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{selectedLogs.weight!.weight} kg</span>
                        <button
                          onClick={() => setDeleteItem({ 
                            type: 'Weight', 
                            id: selectedLogs.weight!.id, 
                            description: `${selectedLogs.weight!.weight} kg` 
                          })}
                          className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Water */}
                {selectedLogs.water.map((water) => (
                  <div key={water.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border-2 border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Droplets size={22} className="text-blue-600 dark:text-blue-400" />
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-200">Water</span>
                          {water.time && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(water.time, water.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{water.glasses} glasses</span>
                        <button
                          onClick={() => setDeleteItem({ 
                            type: 'Water', 
                            id: water.id, 
                            description: `${water.glasses} glasses` 
                          })}
                          className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Sleep */}
                {selectedLogs.sleep && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-lg border-2 border-indigo-200 dark:border-indigo-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Moon size={22} className="text-indigo-600 dark:text-indigo-400" />
                        <div>
                          <span className="font-semibold text-gray-700 dark:text-gray-200">Sleep</span>
                          {selectedLogs.sleep.time && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {formatTime(selectedLogs.sleep.time, selectedLogs.sleep.timestamp)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{selectedLogs.sleep!.hours}h</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 ml-2 capitalize">({selectedLogs.sleep!.quality})</span>
                        </div>
                        <button
                          onClick={() => setDeleteItem({ 
                            type: 'Sleep', 
                            id: selectedLogs.sleep!.id, 
                            description: `${selectedLogs.sleep!.hours}h (${selectedLogs.sleep!.quality})` 
                          })}
                          className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meals */}
                {selectedLogs.meals.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Meals</h3>
                    {selectedLogs.meals.map((meal) => {
                      const isCheat = meal.isCheatMeal;
                      return (
                        <div 
                          key={meal.id} 
                          className={`rounded-2xl p-5 shadow-lg border-2 transition-all ${
                            isCheat 
                              ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700' 
                              : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                  {meal.mealType}
                                </span>
                                {meal.hadTea && <Coffee size={16} className="text-amber-600 dark:text-amber-400" />}
                                {isCheat && <Pizza size={16} className="text-rose-500 dark:text-rose-400" />}
                              </div>
                              <p className="text-sm text-gray-800 dark:text-gray-200">{meal.description}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {formatTime(meal.time, meal.timestamp)}
                              </span>
                              <button
                                onClick={() => setDeleteItem({ 
                                  type: 'Meal', 
                                  id: meal.id, 
                                  description: `${meal.mealType}: ${meal.description}` 
                                })}
                                className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {selectedLogs.meals.length === 0 && !selectedLogs.weight && selectedLogs.water.length === 0 && !selectedLogs.sleep && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-600 text-center">
                    <p className="text-gray-600 dark:text-gray-400">No logs for this date</p>
                  </div>
                )}
              </div>
            );
          })()}
        </>
      )}

      {deleteItem && (
        <DeleteConfirmation
          itemType={deleteItem.type}
          itemDescription={deleteItem.description}
          onConfirm={() => {
            if (deleteItem.type === 'Weight') onDeleteWeight(deleteItem.id);
            else if (deleteItem.type === 'Water') onDeleteWater(deleteItem.id);
            else if (deleteItem.type === 'Sleep') onDeleteSleep(deleteItem.id);
            else onDeleteMeal(deleteItem.id);
            setDeleteItem(null);
            setSelectedDate(null); // Go back to date list
          }}
          onCancel={() => setDeleteItem(null)}
        />
      )}

      {showExportModal && (
        <ExportModal
          onExport={handleExport}
          onCancel={() => {
            setShowExportModal(false);
            setExportType(null);
          }}
          title={exportType === 'all' ? 'Export All Data' : `Export ${selectedDate}`}
          description={exportType === 'all' ? 'Export all your logs' : 'Export this day\'s logs'}
          isSingleDay={exportType === 'single'}
        />
      )}
    </div>
  );
}
