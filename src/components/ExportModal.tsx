import { useState } from 'react';
import { Download, FileText, FileJson, FileType, X, Calendar } from 'lucide-react';

interface ExportModalProps {
  onExport: (format: 'csv' | 'json' | 'pdf', startDate?: string, endDate?: string) => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  isSingleDay?: boolean;
}

export default function ExportModal({ onExport, onCancel, title = 'Export Data', description = 'Choose your preferred format', isSingleDay = false }: ExportModalProps) {
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [useDateRange, setUseDateRange] = useState(false);

  const handleExport = () => {
    if (useDateRange && startDate && endDate) {
      onExport(format, startDate, endDate);
    } else {
      onExport(format);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md my-8">
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-t-3xl p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl">
                <Download className="text-emerald-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Date Range Toggle - Only show for "Export All" */}
          {!isSingleDay && (
            <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useDateRange}
                  onChange={(e) => setUseDateRange(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-blue-600" />
                  <div>
                    <span className="text-gray-800 font-semibold block">Export Date Range</span>
                    <span className="text-xs text-gray-600">Export only logs from specific dates</span>
                  </div>
                </div>
              </label>
            </div>
          )}

          {/* Date Range Inputs */}
          {!isSingleDay && useDateRange && (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          )}

          <p className="text-center text-gray-600 mb-4">
            Select the format for your export
          </p>

          <div className="space-y-3">
            <button
              onClick={() => setFormat('csv')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                format === 'csv'
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText size={24} className={format === 'csv' ? 'text-emerald-600' : 'text-gray-600'} />
                <div className="text-left">
                  <div className={`text-lg font-semibold ${format === 'csv' ? 'text-emerald-600' : 'text-gray-800'}`}>
                    CSV Format
                  </div>
                  <div className="text-sm text-gray-600">Open in Excel, Google Sheets</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormat('json')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                format === 'json'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileJson size={24} className={format === 'json' ? 'text-blue-600' : 'text-gray-600'} />
                <div className="text-left">
                  <div className={`text-lg font-semibold ${format === 'json' ? 'text-blue-600' : 'text-gray-800'}`}>
                    JSON Format
                  </div>
                  <div className="text-sm text-gray-600">For developers, data backup</div>
                </div>
              </div>
            </button>

            <button
              onClick={() => setFormat('pdf')}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                format === 'pdf'
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileType size={24} className={format === 'pdf' ? 'text-rose-600' : 'text-gray-600'} />
                <div className="text-left">
                  <div className={`text-lg font-semibold ${format === 'pdf' ? 'text-rose-600' : 'text-gray-800'}`}>
                    PDF Format
                  </div>
                  <div className="text-sm text-gray-600">Printable, shareable document</div>
                </div>
              </div>
            </button>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={useDateRange && (!startDate || !endDate)}
              className={`flex-1 font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                useDateRange && (!startDate || !endDate)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg transform hover:scale-[1.02]'
              }`}
            >
              <Download size={20} />
              Export
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
