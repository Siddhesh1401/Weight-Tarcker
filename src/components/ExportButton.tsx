import { Download } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DEFAULT_USER_ID = 'user_001';

export default function ExportButton() {
  const handleExport = (format: 'csv' | 'json') => {
    const url = `${API_BASE_URL.replace('/api', '')}/api/export?user_id=${DEFAULT_USER_ID}&format=${format}`;
    window.open(url, '_blank');
  };

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleExport('csv')}
        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
      >
        <Download size={18} />
        Export CSV
      </button>
      <button
        onClick={() => handleExport('json')}
        className="flex items-center gap-2 px-4 py-2 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
      >
        <Download size={18} />
        Export JSON
      </button>
    </div>
  );
}
