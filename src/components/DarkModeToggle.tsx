import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface DarkModeToggleProps {
  className?: string;
}

export default function DarkModeToggle({ className = '' }: DarkModeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center w-14 h-14 rounded-full transition-all duration-300 hover:scale-110 shadow-lg hover:shadow-xl ${className}`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className={`relative w-12 h-12 rounded-full transition-all duration-300 ${
        theme === 'light'
          ? 'bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner'
          : 'bg-gradient-to-br from-gray-800 to-gray-900 shadow-inner border border-gray-600'
      }`}>
        {/* Sun Icon (Light Mode) */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          theme === 'light'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 rotate-180 scale-0'
        }`}>
          <Sun className="w-6 h-6 text-yellow-500 drop-shadow-sm" />
        </div>

        {/* Moon Icon (Dark Mode) */}
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
          theme === 'dark'
            ? 'opacity-100 rotate-0 scale-100'
            : 'opacity-0 -rotate-180 scale-0'
        }`}>
          <Moon className="w-6 h-6 text-blue-400 drop-shadow-sm" />
        </div>
      </div>

      {/* Glow effect for active state */}
      <div className={`absolute inset-0 rounded-full transition-opacity duration-300 ${
        theme === 'dark'
          ? 'opacity-20 bg-blue-400'
          : 'opacity-20 bg-yellow-400'
      }`} style={{ filter: 'blur(8px)' }}></div>
    </button>
  );
}
