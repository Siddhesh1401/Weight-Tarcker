import React from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  label?: string;
  className?: string;
}

const TimePicker: React.FC<TimePickerProps> = ({ 
  value, 
  onChange, 
  label = "Time",
  className = "" 
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        <Clock className="inline w-4 h-4 mr-1" />
        {label}
      </label>
      <input
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   transition-all"
      />
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
        Default is current time, edit if needed
      </p>
    </div>
  );
};

export default TimePicker;
