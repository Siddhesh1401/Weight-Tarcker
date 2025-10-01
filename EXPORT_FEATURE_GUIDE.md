# 📊 Export Feature Implementation Guide

## ✅ What's Been Created

I've created the `ExportModal` component that lets users choose between CSV and JSON formats.

## 🎯 What Still Needs to Be Added

### 1. Export Functions in History.tsx

Add these helper functions after the `formatDate` function:

```typescript
const handleExport = (format: 'csv' | 'json') => {
  if (exportType === 'all') {
    exportAllData(format);
  } else if (exportType === 'single' && selectedDate) {
    exportSingleDay(selectedDate, format);
  }
  setShowExportModal(false);
  setExportType(null);
};

const exportAllData = (format: 'csv' | 'json') => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const url = `${API_BASE_URL.replace('/api', '')}/api/export?user_id=user_001&format=${format}`;
  window.open(url, '_blank');
};

const exportSingleDay = (date: string, format: 'csv' | 'json') => {
  const logs = getLogsForDate(date);
  
  if (format === 'csv') {
    const csvData = generateCSV(logs, date);
    downloadFile(csvData, `weight-tracker-${date}.csv`, 'text/csv');
  } else {
    const jsonData = JSON.stringify({ date, ...logs }, null, 2);
    downloadFile(jsonData, `weight-tracker-${date}.json`, 'application/json');
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
```

### 2. Add Export Buttons to UI

**In the main header (after the title):**
```tsx
<div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 shadow-sm">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <Calendar className="text-emerald-600" size={28} />
      <div>
        <h1 className="text-2xl font-bold text-gray-800">History</h1>
        <p className="text-gray-600 text-sm">View your past logs</p>
      </div>
    </div>
    <button
      onClick={() => {
        setExportType('all');
        setShowExportModal(true);
      }}
      className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
    >
      <Download size={18} />
      Export All
    </button>
  </div>
</div>
```

**In the selected date view (after the back button):**
```tsx
<div className="flex items-center justify-between">
  <button
    onClick={() => setSelectedDate(null)}
    className="flex items-center gap-2 text-emerald-600 font-semibold hover:text-emerald-700"
  >
    <ChevronLeft size={20} />
    Back to dates
  </button>
  
  <button
    onClick={() => {
      setExportType('single');
      setShowExportModal(true);
    }}
    className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
  >
    <Download size={18} />
    Export Day
  </button>
</div>
```

### 3. Add Filter Dropdown

**Before the date list:**
```tsx
<div className="flex items-center justify-between mb-4">
  <h2 className="text-lg font-semibold text-gray-800">Select a Date</h2>
  <div className="relative">
    <select
      value={filterType}
      onChange={(e) => setFilterType(e.target.value as any)}
      className="appearance-none bg-white border-2 border-gray-200 rounded-lg px-4 py-2 pr-8 font-semibold text-gray-700 hover:border-emerald-500 focus:border-emerald-500 focus:outline-none"
    >
      <option value="all">All Logs</option>
      <option value="meals">Meals Only</option>
      <option value="weight">Weight Only</option>
      <option value="water">Water Only</option>
      <option value="sleep">Sleep Only</option>
    </select>
    <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
  </div>
</div>
```

### 4. Apply Filter Logic

Update the `sortedDates` to filter based on `filterType`:

```typescript
const filteredDates = sortedDates.filter(date => {
  if (filterType === 'all') return true;
  
  const logs = getLogsForDate(date);
  if (filterType === 'meals') return logs.meals.length > 0;
  if (filterType === 'weight') return !!logs.weight;
  if (filterType === 'water') return logs.water.length > 0;
  if (filterType === 'sleep') return !!logs.sleep;
  
  return true;
});
```

Then use `filteredDates` instead of `sortedDates` in the map.

### 5. Add Export Modal at the End

```tsx
{showExportModal && (
  <ExportModal
    onExport={handleExport}
    onCancel={() => {
      setShowExportModal(false);
      setExportType(null);
    }}
    title={exportType === 'all' ? 'Export All Data' : `Export ${selectedDate}`}
    description={exportType === 'all' ? 'Export all your logs' : 'Export this day\'s logs'}
  />
)}
```

## 🎯 Features Summary

✅ **Export All Data** - Button in header  
✅ **Export Single Day** - Button when viewing a date  
✅ **Format Selection** - CSV or JSON modal  
✅ **Filter by Type** - Dropdown to filter dates  
✅ **CSV Format** - Human-readable, Excel-compatible  
✅ **JSON Format** - Developer-friendly, complete data  

## 📝 User Flow

1. Click "Export All" → Choose format → Download
2. Click a date → Click "Export Day" → Choose format → Download
3. Use filter dropdown to show only specific log types
4. Export creates downloadable file with all data

This gives complete control over data export! 🎉
