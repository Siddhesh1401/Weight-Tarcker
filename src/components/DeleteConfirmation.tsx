import { useState } from 'react';
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmText === CONFIRM_WORD) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
        <div className="bg-gradient-to-r from-rose-50 to-red-50 rounded-t-3xl p-6 border-b border-rose-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-rose-100 p-2 rounded-xl">
                <AlertTriangle className="text-rose-600" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Delete {itemType}?</h2>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="bg-rose-50 border-2 border-rose-200 rounded-xl p-4">
            <p className="text-sm text-rose-800 font-medium mb-2">
              ⚠️ You are about to delete:
            </p>
            <p className="text-sm text-gray-800 font-semibold">
              {itemDescription}
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Type <span className="text-rose-600 font-bold">{CONFIRM_WORD}</span> to confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Type DELETE"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:outline-none text-base uppercase"
              autoFocus
            />
          </div>

          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-600">
              💡 <strong>Tip:</strong> Make sure you really want to delete this log. This action is permanent and cannot be reversed.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={confirmText !== CONFIRM_WORD}
              className={`flex-1 font-bold py-3 px-6 rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 ${
                confirmText === CONFIRM_WORD
                  ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white hover:shadow-lg transform hover:scale-[1.02]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Trash2 size={20} />
              Delete
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
