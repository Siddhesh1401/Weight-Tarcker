import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Scale, Droplets, Moon, Coffee, Pizza, Trash2, Download, Filter, Edit2, BarChart3 } from 'lucide-react';
import { MealEntry, WeightLog, WaterLog, SleepLog } from '../types';
import DeleteConfirmation from './DeleteConfirmation';
import ExportModal from './ExportModal';
import HealthTrendsChart from './HealthTrendsChart';

interface HistoryProps {
  meals: MealEntry[];
  weights: WeightLog[];
  waterLogs: WaterLog[];
  sleepLogs: SleepLog[];
  onDeleteMeal: (id: string) => void;
  onDeleteWeight: (id: string) => void;
  onDeleteWater: (id: string) => void;
  onDeleteSleep: (id: string) => void;
  onEditMeal?: (meal: MealEntry) => void;
  onEditWeight?: (weight: WeightLog) => void;
  onEditWater?: (water: WaterLog) => void;
  onEditSleep?: (sleep: SleepLog) => void;
}

export default function History({ 
  meals, 
  weights, 
  waterLogs, 
  sleepLogs, 
  onDeleteMeal, 
  onDeleteWeight, 
  onDeleteWater, 
  onDeleteSleep,
  onEditMeal,
  onEditWeight,
  onEditWater,
  onEditSleep
}: HistoryProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [deleteItem, setDeleteItem] = useState<{ type: string; id: string; description: string } | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'all' | 'single' | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'meals' | 'weight' | 'water' | 'sleep'>('all');
  const [showTrends, setShowTrends] = useState(false);

  // Get unique dates from all logs
  const allDates = new Set<string>();
  meals.forEach(m => allDates.add(m.date));
  weights.forEach(w => allDates.add(w.date));
  waterLogs.forEach(w => allDates.add(w.date));
  sleepLogs.forEach(s => allDates.add(s.date));

  const sortedDates = Array.from(allDates).sort((a, b) => b.localeCompare(a)); // Most recent first

  // Group meals that are the same type and logged within TIME_WINDOW minutes
  const groupNearbyMeals = (mealList: MealEntry[]) => {
    const TIME_WINDOW = 5; // minutes
    
    // Sort meals by timestamp
    const sorted = [...mealList].sort((a, b) => {
      const timeA = a.timestamp || `${a.date}T${a.time || '00:00'}:00`;
      const timeB = b.timestamp || `${b.date}T${b.time || '00:00'}:00`;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });

    const groups: Array<{
      meals: MealEntry[];
      mealType: string;
      time: string;
      timestamp: string;
      isCheatMeal: boolean;
      hadTea: boolean;
      combinedDescription: string;
      ids: string[];
    }> = [];

    sorted.forEach(meal => {
      const mealTime = new Date(meal.timestamp || `${meal.date}T${meal.time || '00:00'}:00`).getTime();
      
      // Find if there's a group with the same meal type within TIME_WINDOW minutes
      const existingGroup = groups.find(group => {
        const groupTime = new Date(group.timestamp).getTime();
        const timeDiff = Math.abs(mealTime - groupTime) / (1000 * 60); // difference in minutes
        return group.mealType === meal.mealType && timeDiff <= TIME_WINDOW;
      });

      if (existingGroup) {
        // Add to existing group
        existingGroup.meals.push(meal);
        existingGroup.ids.push(meal.id);
        existingGroup.combinedDescription += ', ' + meal.description;
        existingGroup.isCheatMeal = existingGroup.isCheatMeal || (meal.isCheatMeal ?? false);
        existingGroup.hadTea = existingGroup.hadTea || (meal.hadTea ?? false);
      } else {
        // Create new group
        groups.push({
          meals: [meal],
          mealType: meal.mealType,
          time: meal.time || '00:00',
          timestamp: meal.timestamp || `${meal.date}T${meal.time || '00:00'}:00`,
          isCheatMeal: meal.isCheatMeal ?? false,
          hadTea: meal.hadTea ?? false,
          combinedDescription: meal.description,
          ids: [meal.id]
        });
      }
    });

    return groups;
  };

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
    // Use local date instead of UTC to avoid timezone issues
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yesterdayDate = new Date(now);
    yesterdayDate.setDate(yesterdayDate.getDate() - 1);
    const yesterday = `${yesterdayDate.getFullYear()}-${String(yesterdayDate.getMonth() + 1).padStart(2, '0')}-${String(yesterdayDate.getDate()).padStart(2, '0')}`;

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
    // Always prioritize the 'time' field if available
    if (time) {
      // Convert HH:MM to 12-hour format
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
    
    // Fallback to timestamp only if time is not available
    if (timestamp) {
      // Check if timestamp is in ISO format (with timezone) or local format
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }
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
    if (format === 'csv') {
      const csvData = generateAllCSV();
      downloadFile(csvData, `weight-tracker-all-data-${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
    } else if (format === 'json') {
      const jsonData = {
        exportDate: new Date().toISOString(),
        meals,
        weights,
        waterLogs,
        sleepLogs
      };
      downloadFile(JSON.stringify(jsonData, null, 2), `weight-tracker-all-data-${new Date().toISOString().split('T')[0]}.json`, 'application/json');
    } else if (format === 'pdf') {
      exportAllPDF();
    }
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
    const exportDate = new Date().toLocaleString();
    let csv = `# WEIGHT TRACKER - SINGLE DAY ANALYSIS EXPORT\n`;
    csv += `# Date Analyzed: ${formatDate(date)}\n`;
    csv += `# Export Generated: ${exportDate}\n`;
    csv += `# Purpose: AI Analysis of Daily Health & Diet Patterns\n`;
    csv += `# App: Weight Tracker\n\n`;

    // Daily Summary Section
    const totalMeals = logs.meals.length;
    const totalWater = logs.water.reduce((sum: number, w: any) => sum + w.glasses, 0);
    const cheatMeals = logs.meals.filter((m: any) => m.isCheatMeal).length;
    const breakfastMeals = logs.meals.filter((m: any) => m.mealType.toLowerCase().includes('breakfast')).length;
    const lunchMeals = logs.meals.filter((m: any) => m.mealType.toLowerCase().includes('lunch')).length;
    const dinnerMeals = logs.meals.filter((m: any) => m.mealType.toLowerCase().includes('dinner')).length;
    const snackMeals = logs.meals.filter((m: any) => m.mealType.toLowerCase().includes('snack')).length;

    csv += `# DAILY SUMMARY\n`;
    csv += `# Total Meals: ${totalMeals}\n`;
    csv += `# Breakfast Items: ${breakfastMeals}\n`;
    csv += `# Lunch Items: ${lunchMeals}\n`;
    csv += `# Dinner Items: ${dinnerMeals}\n`;
    csv += `# Snacks: ${snackMeals}\n`;
    csv += `# Cheat Meals: ${cheatMeals}\n`;
    csv += `# Total Water Intake: ${totalWater} glasses\n`;
    if (logs.weight) csv += `# Weight Recorded: ${logs.weight.weight} kg\n`;
    if (logs.sleep) csv += `# Sleep Duration: ${logs.sleep.hours} hours\n`;
    if (logs.sleep) csv += `# Sleep Quality: ${logs.sleep.quality}\n\n`;

    // Main Data Table
    csv += `Date,Entry_Type,Meal_Type,Food_Description,Is_Cheat_Meal,Time_Logged,Weight_kg,Water_Glasses,Sleep_Hours,Sleep_Quality,Health_Category,Analysis_Notes\n`;

    // Weight entry
    if (logs.weight) {
      const timeStr = logs.weight.time ? formatTime(logs.weight.time, logs.weight.timestamp) : '';
      csv += `${date},Weight_Tracking,Weight_Log,,No,${timeStr},${logs.weight.weight},,,,"Weight Management","Daily weight measurement"\n`;
    }

    // Water entries
    logs.water.forEach((w: any, index: number) => {
      const timeStr = w.time ? formatTime(w.time, w.timestamp) : '';
      csv += `${date},Hydration,Water_Intake,,No,${timeStr},,,${w.glasses},,"Hydration","Water consumption tracking - ${w.glasses} glasses"\n`;
    });

    // Sleep entry
    if (logs.sleep) {
      const timeStr = logs.sleep.time ? formatTime(logs.sleep.time, logs.sleep.timestamp) : '';
      const qualityNote = logs.sleep.quality.toLowerCase().includes('good') ? 'Good sleep quality' :
                         logs.sleep.quality.toLowerCase().includes('poor') ? 'Poor sleep quality' : 'Average sleep quality';
      csv += `${date},Sleep_Tracking,Sleep_Log,,No,${timeStr},,,${logs.sleep.hours},${logs.sleep.quality},"Sleep Health","${qualityNote} - ${logs.sleep.hours} hours"\n`;
    }

    // Meal entries with enhanced analysis context
    logs.meals.forEach((m: any, index: number) => {
      const timeStr = formatTime(m.time, m.timestamp);
      const mealCategory = m.mealType.toLowerCase();
      let healthCategory = 'General Nutrition';
      let analysisNotes = '';

      if (mealCategory.includes('breakfast')) {
        healthCategory = 'Breakfast Nutrition';
        analysisNotes = 'Morning meal - energy source';
      } else if (mealCategory.includes('lunch')) {
        healthCategory = 'Lunch Nutrition';
        analysisNotes = 'Midday meal - sustained energy';
      } else if (mealCategory.includes('dinner')) {
        healthCategory = 'Dinner Nutrition';
        analysisNotes = 'Evening meal - recovery focus';
      } else if (mealCategory.includes('snack')) {
        healthCategory = 'Snacking Habits';
        analysisNotes = 'Between-meal nutrition';
      }

      if (m.isCheatMeal) {
        healthCategory = 'Treat/Cheat Meal';
        analysisNotes += ' - Indulgence meal (marked as cheat)';
      }

      csv += `${date},Meal_Logging,${m.mealType},"${m.description.replace(/"/g, '""')}",${m.isCheatMeal ? 'Yes' : 'No'},${timeStr},,,,,${healthCategory},"${analysisNotes}"\n`;
    });

    // AI Analysis Helper Section
    csv += `\n# AI ANALYSIS INSTRUCTIONS\n`;
    csv += `# This CSV contains daily health tracking data for AI analysis\n`;
    csv += `# Key columns for analysis:\n`;
    csv += `# - Entry_Type: Categorizes the type of health data\n`;
    csv += `# - Meal_Type: Breakfast/Lunch/Dinner/Snack categorization\n`;
    csv += `# - Is_Cheat_Meal: Identifies indulgent eating patterns\n`;
    csv += `# - Health_Category: Groups data for health analysis\n`;
    csv += `# - Analysis_Notes: Context for AI interpretation\n`;
    csv += `# \n`;
    csv += `# Suggested AI Analysis Questions:\n`;
    csv += `# 1. What are the eating patterns and meal timing?\n`;
    csv += `# 2. How consistent is water intake throughout the day?\n`;
    csv += `# 3. Are there correlations between sleep quality and meal choices?\n`;
    csv += `# 4. What percentage of meals are marked as "cheat" meals?\n`;
    csv += `# 5. How do meal types vary throughout the day?\n`;

    return csv;
  };

  const generateAllCSV = () => {
    const exportDate = new Date().toLocaleString();
    let csv = `# WEIGHT TRACKER - COMPLETE HEALTH DATA EXPORT\n`;
    csv += `# Export Generated: ${exportDate}\n`;
    csv += `# Contains meals, weight, water, and sleep tracking data\n\n`;

    csv += `Date,Time,Type,Details,Value,Bed_Time,Quality,Notes\n`;

    // Collect all dates
    const allDates = new Set<string>();
    meals.forEach(m => allDates.add(m.date));
    weights.forEach(w => allDates.add(w.date));
    waterLogs.forEach(w => allDates.add(w.date));
    sleepLogs.forEach(s => allDates.add(s.date));

    const sortedDates = Array.from(allDates).sort();

    sortedDates.forEach(date => {
      const dayLogs = getLogsForDate(date);

      // Weight entries
      if (dayLogs.weight) {
        const timeStr = dayLogs.weight.time ? formatTime(dayLogs.weight.time, dayLogs.weight.timestamp) : '';
        csv += `${date},${timeStr},Weight,Weight Log,${dayLogs.weight.weight} kg,,,\n`;
      }

      // Water entries
      dayLogs.water.forEach((w: any) => {
        const timeStr = w.time ? formatTime(w.time, w.timestamp) : '';
        csv += `${date},${timeStr},Water,Water Intake,${w.glasses} glasses,,,\n`;
      });

      // Sleep entries
      if (dayLogs.sleep) {
        const timeStr = dayLogs.sleep.time ? formatTime(dayLogs.sleep.time, dayLogs.sleep.timestamp) : '';
        const bedTimeStr = dayLogs.sleep.bedTime ? formatTime(dayLogs.sleep.bedTime) : '';
        const notesStr = dayLogs.sleep.notes || '';
        csv += `${date},${timeStr},Sleep,Sleep Log,${dayLogs.sleep.hours} hours,${bedTimeStr},${dayLogs.sleep.quality},${notesStr}\n`;
      }

      // Meal entries
      dayLogs.meals.forEach((m: any) => {
        const timeStr = formatTime(m.time, m.timestamp);
        const notes = [];
        if (m.isCheatMeal) notes.push('Cheat meal');
        if (m.hadTea) notes.push('Had tea');
        const notesStr = notes.length > 0 ? notes.join(', ') : '';
        csv += `${date},${timeStr},Meal,${m.mealType},"${m.description.replace(/"/g, '""')}",,,${notesStr}\n`;
      });
    });

    // Summary
    csv += `\n# SUMMARY\n`;
    csv += `# Total Meals: ${meals.length}\n`;
    csv += `# Total Weight Logs: ${weights.length}\n`;
    csv += `# Total Water Logs: ${waterLogs.length}\n`;
    csv += `# Total Sleep Logs: ${sleepLogs.length}\n`;
    csv += `# Tracking Days: ${allDates.size}\n`;

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
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              max-width: 800px;
              margin: 0 auto;
              background: #ffffff;
              color: #374151;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 4px solid #059669;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #059669;
              font-size: 28px;
              margin: 0;
              font-weight: 700;
            }
            .header .meta {
              color: #6b7280;
              font-size: 14px;
              margin-top: 8px;
            }
            .section {
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 20px;
              margin-bottom: 20px;
              box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            .section h2 {
              color: #059669;
              margin: 0 0 15px 0;
              font-size: 18px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            .data-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 12px;
            }
            .data-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 8px 12px;
              background: #f9fafb;
              border-radius: 6px;
            }
            .data-list {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .label {
              font-weight: 600;
              color: #374151;
              font-size: 14px;
            }
            .value {
              color: #059669;
              font-weight: 600;
              font-size: 14px;
            }
            .meals-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .meal-item {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 12px;
              background: #fafafa;
            }
            .meal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 8px;
            }
            .meal-type {
              font-weight: bold;
              color: #059669;
              font-size: 16px;
            }
            .meal-time {
              color: #6b7280;
              font-size: 12px;
            }
            .meal-description {
              color: #374151;
              line-height: 1.4;
            }
            .cheat-badge {
              background: #fef2f2;
              color: #dc2626;
              padding: 2px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
            }
            .summary {
              background: #ecfdf5;
              border: 1px solid #059669;
              border-radius: 6px;
              padding: 12px;
              margin-top: 15px;
            }
            .no-data {
              text-align: center;
              color: #6b7280;
              font-style: italic;
              padding: 40px;
              background: #f9fafb;
              border-radius: 8px;
            }
            @media print {
              body { padding: 15px; }
              .section { page-break-inside: avoid; }
            }
            @media (max-width: 600px) {
              .data-grid { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Weight Tracker Export</h1>
            <div class="meta">
              ${formatDate(date)} - Generated on ${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          ${logs.weight ? `
            <div class="section">
              <h2>⚖️ Weight</h2>
              <div class="data-grid">
                <div class="data-item">
                  <span class="label">Weight:</span>
                  <span class="value">${logs.weight.weight} kg</span>
                </div>
                ${logs.weight.time ? `
                  <div class="data-item">
                    <span class="label">Time:</span>
                    <span class="value">${formatTime(logs.weight.time, logs.weight.timestamp)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${logs.water.length > 0 ? `
            <div class="section">
              <h2>💧 Water Intake</h2>
              <div class="data-list">
                ${logs.water.map((w: any) => `
                  <div class="data-item">
                    <span class="label">${w.glasses} glasses</span>
                    ${w.time ? `<span class="value">at ${formatTime(w.time, w.timestamp)}</span>` : ''}
                  </div>
                `).join('')}
              </div>
              <div class="summary">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span class="label">Daily Total:</span>
                  <span class="value">${logs.water.reduce((sum: number, w: any) => sum + w.glasses, 0)} glasses</span>
                </div>
              </div>
            </div>
          ` : ''}

          ${logs.sleep ? `
            <div class="section">
              <h2>🌙 Sleep</h2>
              <div class="data-grid">
                <div class="data-item">
                  <span class="label">Duration:</span>
                  <span class="value">${logs.sleep.hours} hours</span>
                </div>
                <div class="data-item">
                  <span class="label">Quality:</span>
                  <span class="value">${logs.sleep.quality}</span>
                </div>
                ${logs.sleep.time ? `
                  <div class="data-item">
                    <span class="label">Time:</span>
                    <span class="value">${formatTime(logs.sleep.time, logs.sleep.timestamp)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${logs.meals.length > 0 ? `
            <div class="section">
              <h2>🍽️ Meals (${logs.meals.length})</h2>
              <div class="meals-list">
                ${logs.meals.map((m: any) => `
                  <div class="meal-item">
                    <div class="meal-header">
                      <div>
                        <span class="meal-type">${m.mealType}</span>
                        ${m.isCheatMeal ? '<span class="cheat-badge">🍕 Cheat Meal</span>' : ''}
                      </div>
                      ${m.time ? `<span class="meal-time">${formatTime(m.time, m.timestamp)}</span>` : ''}
                    </div>
                    <div class="meal-description">${m.description}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${logs.meals.length === 0 && !logs.weight && logs.water.length === 0 && !logs.sleep ? `
            <div class="no-data">
              No logs recorded for this date
            </div>
          ` : ''}
        </body>
      </html>
    `);

    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const exportAllPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Collect all dates
    const allDates = new Set<string>();
    meals.forEach(m => allDates.add(m.date));
    weights.forEach(w => allDates.add(w.date));
    waterLogs.forEach(w => allDates.add(w.date));
    sleepLogs.forEach(s => allDates.add(s.date));

    const sortedDates = Array.from(allDates).sort();

    // Calculate summary statistics
    const totalMeals = meals.length;
    const totalWeightLogs = weights.length;
    const totalSleepLogs = sleepLogs.length;
    const cheatMeals = meals.filter(m => m.isCheatMeal).length;
    const totalWaterGlasses = waterLogs.reduce((sum, w) => sum + w.glasses, 0);

    const content = sortedDates.map(date => {
      const dayLogs = getLogsForDate(date);
      return `
        <div class="date-section" style="page-break-inside: avoid; margin-bottom: 40px; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; background: #fafafa;">
          <h2 style="color: #059669; border-bottom: 3px solid #059669; padding-bottom: 8px; margin-bottom: 15px; font-size: 18px;">${formatDate(date)}</h2>

          ${dayLogs.weight ? `
            <div class="section" style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
              <h3 style="color: #374151; margin-bottom: 8px; font-size: 14px;">⚖️ Weight</h3>
              <div class="data-grid">
                <div class="data-item">
                  <span class="label">Weight:</span>
                  <span class="value">${dayLogs.weight.weight} kg</span>
                </div>
                ${dayLogs.weight.time ? `
                  <div class="data-item">
                    <span class="label">Time:</span>
                    <span class="value">${formatTime(dayLogs.weight.time, dayLogs.weight.timestamp)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${dayLogs.water.length > 0 ? `
            <div class="section" style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
              <h3 style="color: #374151; margin-bottom: 8px; font-size: 14px;">💧 Water Intake</h3>
              <div class="data-list">
                ${dayLogs.water.map((w: any) => `
                  <div class="data-item">
                    <span class="label">${w.glasses} glasses</span>
                    ${w.time ? `<span class="value">at ${formatTime(w.time, w.timestamp)}</span>` : ''}
                  </div>
                `).join('')}
              </div>
              <div class="summary" style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb;">
                <span class="label">Daily Total:</span>
                <span class="value">${dayLogs.water.reduce((sum, w) => sum + w.glasses, 0)} glasses</span>
              </div>
            </div>
          ` : ''}

          ${dayLogs.sleep ? `
            <div class="section" style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
              <h3 style="color: #374151; margin-bottom: 8px; font-size: 14px;">🌙 Sleep</h3>
              <div class="data-grid">
                <div class="data-item">
                  <span class="label">Duration:</span>
                  <span class="value">${dayLogs.sleep.hours} hours</span>
                </div>
                <div class="data-item">
                  <span class="label">Quality:</span>
                  <span class="value">${dayLogs.sleep.quality}</span>
                </div>
                ${dayLogs.sleep.time ? `
                  <div class="data-item">
                    <span class="label">Time:</span>
                    <span class="value">${formatTime(dayLogs.sleep.time, dayLogs.sleep.timestamp)}</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          ${dayLogs.meals.length > 0 ? `
            <div class="section" style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 10px;">
              <h3 style="color: #374151; margin-bottom: 8px; font-size: 14px;">🍽️ Meals (${dayLogs.meals.length})</h3>
              <div class="meals-list">
                ${dayLogs.meals.map((m: any) => `
                  <div class="meal-item" style="border: 1px solid #e5e7eb; border-radius: 4px; padding: 8px; margin-bottom: 6px; background: ${m.isCheatMeal ? '#fef2f2' : '#f0fdf4'};">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <div>
                        <span class="meal-type" style="font-weight: bold; color: #059669;">${m.mealType}</span>
                        ${m.isCheatMeal ? '<span style="color: #dc2626; font-size: 12px; margin-left: 8px;">🍕 Cheat Meal</span>' : ''}
                      </div>
                      ${m.time ? `<span class="meal-time" style="color: #6b7280; font-size: 12px;">${formatTime(m.time, m.timestamp)}</span>` : ''}
                    </div>
                    <div class="meal-description" style="margin-top: 4px; color: #374151;">${m.description}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          ${dayLogs.meals.length === 0 && !dayLogs.weight && dayLogs.water.length === 0 && !dayLogs.sleep ? `
            <div class="no-data" style="text-align: center; color: #6b7280; font-style: italic; padding: 20px;">
              No logs recorded for this date
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>Weight Tracker - Complete Data Export</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              padding: 20px;
              max-width: 850px;
              margin: 0 auto;
              background: #ffffff;
              color: #374151;
              line-height: 1.5;
            }
            .header {
              text-align: center;
              border-bottom: 4px solid #059669;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #059669;
              font-size: 28px;
              margin: 0;
              font-weight: 700;
            }
            .header .meta {
              color: #6b7280;
              font-size: 14px;
              margin-top: 8px;
            }
            .summary {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              border: 2px solid #059669;
              border-radius: 12px;
              padding: 20px;
              margin-bottom: 30px;
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
              gap: 15px;
            }
            .summary-item {
              text-align: center;
            }
            .summary-value {
              font-size: 24px;
              font-weight: bold;
              color: #059669;
              display: block;
            }
            .summary-label {
              font-size: 12px;
              color: #374151;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .data-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
            }
            .data-item {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 4px 0;
            }
            .data-list {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .label {
              font-weight: 600;
              color: #374151;
              font-size: 13px;
            }
            .value {
              color: #059669;
              font-weight: 600;
              font-size: 13px;
            }
            .meals-list {
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            @media print {
              body { padding: 15px; }
              .no-print { display: none; }
              .date-section { page-break-inside: avoid; }
            }
            @media (max-width: 600px) {
              .data-grid { grid-template-columns: 1fr; }
              .summary { grid-template-columns: 1fr; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Weight Tracker - Complete Data Export</h1>
            <div class="meta">
              Generated on: ${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>

          <div class="summary">
            <div class="summary-item">
              <span class="summary-value">${sortedDates.length}</span>
              <span class="summary-label">Total Days</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">${totalMeals}</span>
              <span class="summary-label">Total Meals</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">${totalWeightLogs}</span>
              <span class="summary-label">Weight Logs</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">${totalWaterGlasses}</span>
              <span class="summary-label">Water Glasses</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">${totalSleepLogs}</span>
              <span class="summary-label">Sleep Logs</span>
            </div>
            <div class="summary-item">
              <span class="summary-value">${cheatMeals}</span>
              <span class="summary-label">Cheat Meals</span>
            </div>
          </div>

          ${content}
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
            {showTrends ? (
              <BarChart3 className="text-emerald-600 dark:text-emerald-400" size={28} />
            ) : (
              <Calendar className="text-emerald-600 dark:text-emerald-400" size={28} />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                {showTrends ? 'Health Trends & Analytics' : 'History'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {showTrends ? 'Track your progress and discover correlations' : 'View your past logs'}
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowTrends(!showTrends)}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-3 rounded-2xl font-semibold transition-all transform hover:scale-[1.02] shadow-lg"
            >
              {showTrends ? <Calendar size={18} /> : <BarChart3 size={18} />}
              {showTrends ? 'History' : 'Trends'}
            </button>
            {!showTrends && (
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
            )}
          </div>
        </div>
      </div>

      {showTrends ? (
        <HealthTrendsChart
          key={`trends-${meals.length}-${weights.length}-${waterLogs.length}-${sleepLogs.length}`}
          meals={meals}
          weights={weights}
          waterLogs={waterLogs}
          sleepLogs={sleepLogs}
        />
      ) : (
        <>
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
                            <div className="flex gap-2">
                              {onEditWeight && (
                                <button
                                  onClick={() => onEditWeight(selectedLogs.weight!)}
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                  <Edit2 size={18} />
                                </button>
                              )}
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
                            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {typeof water.glasses === 'number' && Number.isFinite(water.glasses)
                                ? `${water.glasses} glasses`
                                : '⚠️ Invalid data'}
                            </span>
                            <div className="flex gap-2">
                              {onEditWater && typeof water.glasses === 'number' && Number.isFinite(water.glasses) && (
                                <button
                                  onClick={() => onEditWater(water)}
                                  className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                >
                                  <Edit2 size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => setDeleteItem({
                                  type: 'Water',
                                  id: water.id,
                                  description: typeof water.glasses === 'number' ? `${water.glasses} glasses` : 'Invalid water log'
                                })}
                                className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Sleep */}
                    {selectedLogs.sleep && (
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-5 shadow-lg border-2 border-indigo-200 dark:border-indigo-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-xl">
                              <Moon size={22} className="text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                              <span className="font-bold text-gray-800 dark:text-gray-100 text-lg">Sleep Log</span>
                              {selectedLogs.sleep.time && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                                  <span>⏰</span> Woke up at {formatTime(selectedLogs.sleep.time, selectedLogs.sleep.timestamp)}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {onEditSleep && (
                              <button
                                onClick={() => onEditSleep(selectedLogs.sleep!)}
                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                              >
                                <Edit2 size={18} />
                              </button>
                            )}
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

                        {/* Sleep Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {/* Duration */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-indigo-200 dark:border-indigo-700">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Duration</div>
                            <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{selectedLogs.sleep!.hours}h</div>
                          </div>

                          {/* Quality */}
                          <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-indigo-200 dark:border-indigo-700">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Quality</div>
                            <div className={`text-sm font-semibold capitalize ${
                              selectedLogs.sleep!.quality === 'excellent' ? 'text-green-600 dark:text-green-400' :
                              selectedLogs.sleep!.quality === 'good' ? 'text-blue-600 dark:text-blue-400' :
                              selectedLogs.sleep!.quality === 'fair' ? 'text-yellow-600 dark:text-yellow-400' :
                              'text-red-600 dark:text-red-400'
                            }`}>
                              {selectedLogs.sleep!.quality === 'excellent' ? '😴 Excellent' :
                               selectedLogs.sleep!.quality === 'good' ? '😊 Good' :
                               selectedLogs.sleep!.quality === 'fair' ? '😐 Fair' :
                               '😞 Poor'}
                            </div>
                          </div>

                          {/* Bed Time */}
                          {selectedLogs.sleep.bedTime && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-indigo-200 dark:border-indigo-700">
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Bed Time</div>
                              <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                🌙 {formatTime(selectedLogs.sleep.bedTime)}
                              </div>
                            </div>
                          )}

                          {/* Wake Time */}
                          {selectedLogs.sleep.time && (
                            <div className="bg-white dark:bg-gray-800 rounded-xl p-3 border border-indigo-200 dark:border-indigo-700">
                              <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Wake Time</div>
                              <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                                ☀️ {formatTime(selectedLogs.sleep.time, selectedLogs.sleep.timestamp)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Notes */}
                        {selectedLogs.sleep.notes && (
                          <div className="mt-3 bg-white dark:bg-gray-800 rounded-xl p-3 border border-indigo-200 dark:border-indigo-700">
                            <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">📝 Notes</div>
                            <div className="text-sm text-gray-700 dark:text-gray-300">{selectedLogs.sleep.notes}</div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Meals */}
                    {selectedLogs.meals.length > 0 && (() => {
                      const groupedMeals = groupNearbyMeals(selectedLogs.meals);
                      
                      return (
                        <div className="space-y-4">
                          <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Meals</h3>
                          {groupedMeals.map((group) => {
                            const isCheat = group.isCheatMeal;
                            // Split description by commas to format as chips
                            const formatDescription = (desc: string) => {
                              const parts = desc.split(',').map(part => part.trim()).filter(p => p.length > 0);
                              return parts;
                            };
                            const descriptionParts = formatDescription(group.combinedDescription);
                            const isGrouped = group.meals.length > 1;

                            return (
                              <div
                                key={group.ids.join('-')}
                                className={`rounded-2xl p-5 shadow-lg border-2 transition-all ${
                                  isCheat
                                    ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700'
                                    : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                        {group.mealType}
                                      </span>
                                      {group.hadTea && <Coffee size={16} className="text-amber-600 dark:text-amber-400" />}
                                      {isCheat && <Pizza size={16} className="text-rose-500 dark:text-rose-400" />}
                                      {isGrouped && (
                                        <span className="text-xs bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                                          {group.meals.length} entries combined
                                        </span>
                                      )}
                                    </div>
                                    {/* Display description items as tags/chips */}
                                    <div className="flex flex-wrap gap-2">
                                      {descriptionParts.map((part, index) => (
                                        <span
                                          key={index}
                                          className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-500 shadow-sm"
                                        >
                                          {part}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {formatTime(group.time, group.timestamp)}
                                    </span>
                                    <div className="flex gap-2">
                                      {onEditMeal && group.meals.length === 1 && (
                                        <button
                                          onClick={() => onEditMeal(group.meals[0])}
                                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                        >
                                          <Edit2 size={18} />
                                        </button>
                                      )}
                                      {group.meals.length === 1 ? (
                                        <button
                                          onClick={() => setDeleteItem({
                                            type: 'Meal',
                                            id: group.meals[0].id,
                                            description: `${group.mealType}: ${group.meals[0].description}`
                                          })}
                                          className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                                        >
                                          <Trash2 size={18} />
                                        </button>
                                      ) : (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 italic pt-2">
                                          Delete items individually
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                {/* Show individual entries if grouped */}
                                {isGrouped && (
                                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">Individual entries:</p>
                                    <div className="space-y-2">
                                      {group.meals.map((meal, idx) => (
                                        <div key={meal.id} className="flex items-center justify-between text-xs bg-white/50 dark:bg-gray-800/50 rounded-lg p-2">
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-600 dark:text-gray-400">#{idx + 1}</span>
                                            <span className="text-gray-700 dark:text-gray-300">{meal.description}</span>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-gray-500 dark:text-gray-400">
                                              {formatTime(meal.time, meal.timestamp)}
                                            </span>
                                            {onEditMeal && (
                                              <button
                                                onClick={() => onEditMeal(meal)}
                                                className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                              >
                                                <Edit2 size={14} />
                                              </button>
                                            )}
                                            <button
                                              onClick={() => setDeleteItem({
                                                type: 'Meal',
                                                id: meal.id,
                                                description: `${meal.mealType}: ${meal.description}`
                                              })}
                                              className="text-rose-500 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors"
                                            >
                                              <Trash2 size={14} />
                                            </button>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

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
