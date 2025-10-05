import { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmationProps {
  itemType: string; // e.g., "meal", "weight", "water", "sleep"
  itemDescription: string; // e.g., "Breakfast: Oats with fruits"
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmation({ itemType, itemDescription, onConfirm, onCancel }: DeleteConfirmationProps) {
  const [confirmText, setConfirmText] = useState('');
  const CONFIRM_WORD = 'DELETE';

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText === CONFIRM_WORD) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-gray-900 dark:bg-opacity-50 flex items-center justify-center p-4 pt-12 pb-28 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-600 max-h-[78vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-rose-50 to-red-50 dark:from-rose-900/30 dark:to-red-900/30 rounded-t-3xl p-6 border-b border-rose-100 dark:border-rose-800 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 dark:bg-rose-900 p-2 rounded-xl">
                <AlertTriangle className="text-rose-600 dark:text-rose-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Delete {itemType}?</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-thin">
          <div className="bg-rose-50 dark:bg-rose-900/30 border-2 border-rose-200 dark:border-rose-700 rounded-xl p-4">
            <p className="text-sm text-rose-800 dark:text-rose-200 font-medium mb-2">
              ⚠️ You are about to delete:
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">
              {itemDescription}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Type "{CONFIRM_WORD}" to confirm:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}"`}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-xl focus:border-rose-500 dark:focus:border-rose-400 focus:outline-none"
              required
            />
          </div>
        </form>

        <div className="flex gap-3 p-6 pt-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-600 flex-shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex-1 bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold py-3 px-6 rounded-xl shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Trash2 size={20} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
