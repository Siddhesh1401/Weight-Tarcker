import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Scale, Droplets, Moon, Coffee, Pizza, Trash2, Download, Filter, Edit2 } from 'lucide-react';
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
    let csv = `# Weight Tracker Export - ${formatDate(date)}\n`;
    csv += `# Generated on: ${exportDate}\n`;
    csv += `# App: Weight Tracker\n\n`;

    csv += 'Date,Category,Type,Description,Cheat Meal,Time,Weight (kg),Water (glasses),Sleep Hours,Sleep Quality\n';

    // Weight row
    if (logs.weight) {
      csv += `${date},Weight,Weight Log,,,${
        logs.weight.time ? formatTime(logs.weight.time, logs.weight.timestamp) : ''
      },${logs.weight.weight},,,\n`;
    }

    // Water rows
    logs.water.forEach((w: any, index: number) => {
      csv += `${date},Water,Water Intake ${index + 1},,${
        w.time ? formatTime(w.time, w.timestamp) : ''
      },,,${w.glasses},,\n`;
    });

    // Sleep row
    if (logs.sleep) {
      csv += `${date},Sleep,Sleep Log,,,${
        logs.sleep.time ? formatTime(logs.sleep.time, logs.sleep.timestamp) : ''
      },,,${logs.sleep.hours},${logs.sleep.quality}\n`;
    }

    // Meal rows
    logs.meals.forEach((m: any, index: number) => {
      csv += `${date},Meal,${m.mealType},"${m.description.replace(/"/g, '""')}",${m.isCheatMeal ? 'Yes' : 'No'},${
        formatTime(m.time, m.timestamp)
      },,,,\n`;
    });

    // Summary row
    const totalMeals = logs.meals.length;
    const totalWater = logs.water.reduce((sum: number, w: any) => sum + w.glasses, 0);
    const cheatMeals = logs.meals.filter((m: any) => m.isCheatMeal).length;

    csv += `\n# Summary for ${formatDate(date)}\n`;
    csv += `# Total Meals: ${totalMeals}\n`;
    csv += `# Cheat Meals: ${cheatMeals}\n`;
    csv += `# Total Water: ${totalWater} glasses\n`;
    if (logs.weight) csv += `# Weight: ${logs.weight.weight} kg\n`;
    if (logs.sleep) csv += `# Sleep: ${logs.sleep.hours} hours (${logs.sleep.quality})\n`;

    return csv;
  };

  const generateAllCSV = () => {
    const exportDate = new Date().toLocaleString();
    let csv = `# Weight Tracker - Complete Data Export\n`;
    csv += `# Generated on: ${exportDate}\n`;
    csv += `# App: Weight Tracker\n`;
    csv += `# Exported by: User\n\n`;

    // Summary statistics
    const totalDates = new Set();
    meals.forEach(m => totalDates.add(m.date));
    weights.forEach(w => totalDates.add(w.date));
    waterLogs.forEach(w => totalDates.add(w.date));
    sleepLogs.forEach(s => totalDates.add(s.date));

    const totalMeals = meals.length;
    const totalWeights = weights.length;
    const totalWaterLogs = waterLogs.length;
    const totalSleepLogs = sleepLogs.length;
    const totalWaterGlasses = waterLogs.reduce((sum: number, w: any) => sum + w.glasses, 0);
    const cheatMeals = meals.filter(m => m.isCheatMeal).length;

    csv += `# SUMMARY STATISTICS\n`;
    csv += `# Total Days Tracked: ${totalDates.size}\n`;
    csv += `# Total Meals Logged: ${totalMeals}\n`;
    csv += `# Total Weight Logs: ${totalWeights}\n`;
    csv += `# Total Water Logs: ${totalWaterLogs}\n`;
    csv += `# Total Water Glasses: ${totalWaterGlasses}\n`;
    csv += `# Total Sleep Logs: ${totalSleepLogs}\n`;
    csv += `# Cheat Meals: ${cheatMeals}\n\n`;

    csv += 'Date,Category,Type,Description,Cheat Meal,Time,Weight (kg),Water (glasses),Sleep Hours,Sleep Quality,Entry ID\n';

    // Collect all dates
    const allDates = new Set<string>();
    meals.forEach(m => allDates.add(m.date));
    weights.forEach(w => allDates.add(w.date));
    waterLogs.forEach(w => allDates.add(w.date));
    sleepLogs.forEach(s => allDates.add(s.date));

    const sortedDates = Array.from(allDates).sort();

    sortedDates.forEach(date => {
      const dayLogs = getLogsForDate(date);

      // Weight row
      if (dayLogs.weight) {
        csv += `${date},Weight,Weight Log,,,${
          dayLogs.weight.time ? formatTime(dayLogs.weight.time, dayLogs.weight.timestamp) : ''
        },${dayLogs.weight.weight},,,,\n`;
      }

      // Water rows
      dayLogs.water.forEach((w: any) => {
        csv += `${date},Water,Water Intake,,,${
          w.time ? formatTime(w.time, w.timestamp) : ''
        },,,${w.glasses},,\n`;
      });

      // Sleep row
      if (dayLogs.sleep) {
        csv += `${date},Sleep,Sleep Log,,,${
          dayLogs.sleep.time ? formatTime(dayLogs.sleep.time, dayLogs.sleep.timestamp) : ''
        },,,${dayLogs.sleep.hours},${dayLogs.sleep.quality},\n`;
      }

      // Meal rows
      dayLogs.meals.forEach((m: any) => {
        csv += `${date},Meal,${m.mealType},"${m.description.replace(/"/g, '""')}",${m.isCheatMeal ? 'Yes' : 'No'},${
          formatTime(m.time, m.timestamp)
        },,,,,${m.id || ''}\n`;
      });
    });

    // Final summary
    csv += `\n# END OF EXPORT\n`;
    csv += `# This file contains all your weight tracking data\n`;
    csv += `# Import this CSV into Excel, Google Sheets, or any spreadsheet application\n`;

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
    const totalWaterLogs = waterLogs.length;
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
                    </div>
                  </div>
                )}

                {/* Meals */}
                {selectedLogs.meals.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Meals</h3>
                    {selectedLogs.meals.map((meal) => {
                      const isCheat = meal.isCheatMeal;
                      // Split description by commas to format as chips
                      const formatDescription = (desc: string) => {
                        const parts = desc.split(',').map(part => part.trim());
                        return parts;
                      };
                      const descriptionParts = formatDescription(meal.description);
                      
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
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase">
                                  {meal.mealType}
                                </span>
                                {meal.hadTea && <Coffee size={16} className="text-amber-600 dark:text-amber-400" />}
                                {isCheat && <Pizza size={16} className="text-rose-500 dark:text-rose-400" />}
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
                                {formatTime(meal.time, meal.timestamp)}
                              </span>
                              <div className="flex gap-2">
                                {onEditMeal && (
                                  <button
                                    onClick={() => onEditMeal(meal)}
                                    className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                                  >
                                    <Edit2 size={18} />
                                  </button>
                                )}
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
