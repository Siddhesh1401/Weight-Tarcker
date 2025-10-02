import { useEffect } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="bg-emerald-500 dark:bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[300px] border border-emerald-400 dark:border-emerald-700">
        <CheckCircle size={24} className="flex-shrink-0" />
        <p className="flex-1 font-semibold">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:bg-emerald-600 dark:hover:bg-emerald-700 rounded-full p-1 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
