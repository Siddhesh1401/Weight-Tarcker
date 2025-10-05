import React, { useState } from 'react';
import { Calendar, Clock, ChevronDown, ChevronUp } from 'lucide-react';

interface DateTimePickerProps {
  dateValue: string;
  timeValue: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
  dateLabel?: string;
  timeLabel?: string;
  className?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({
  dateValue,
  timeValue,
  onDateChange,
  onTimeChange,
  dateLabel = "Date",
  timeLabel = "Time",
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format time for display (12-hour format)
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700 
                   border border-gray-300 dark:border-gray-600 rounded-lg
                   hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors
                   text-left group"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4" />
            <span className="font-medium">{formatDate(dateValue)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatTime(timeValue)}</span>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar className="inline w-4 h-4 mr-1" />
              {dateLabel}
            </label>
            <input
              type="date"
              value={dateValue}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Clock className="inline w-4 h-4 mr-1" />
              {timeLabel}
            </label>
            <input
              type="time"
              value={timeValue}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all"
            />
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Click to collapse when done editing
          </p>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;