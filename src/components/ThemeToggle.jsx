import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeToggle button for switching between light and dark themes.
 * Uses fixed dimensions to guarantee ZERO layout shift when toggling.
 * Includes prominent visible focus rings for keyboard navigation.
 */
export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn btn-sm btn-ghost btn-circle w-8 h-8 min-h-[32px] max-h-[32px] p-0 shrink-0 text-base-content hover:bg-base-300/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun size={16} className="text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon size={16} className="text-slate-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
}
