'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-8 right-8 z-50 p-4 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? (
        <Sun className="w-6 h-6 text-yellow-500" strokeWidth={2.5} />
      ) : (
        <Moon className="w-6 h-6 text-gray-700" strokeWidth={2.5} />
      )}
    </button>
  );
}
