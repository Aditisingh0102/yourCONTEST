import { useState, useEffect } from 'react';

/**
 * useTheme - Reads/writes the theme preference to sessionStorage
 * and syncs the appropriate class (`dark` or `warm`) on <html>.
 *
 * Returns [theme, cycleTheme]
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    const saved = sessionStorage.getItem('theme');
    if (saved && ['light', 'dark', 'warm'].includes(saved)) {
      return saved;
    }
    // Default to dark mode on first visit
    return 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    // Clear all previous theme classes
    root.classList.remove('dark', 'warm');
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'warm') {
      root.classList.add('warm');
    }
    
    sessionStorage.setItem('theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'warm';
      return 'light'; // from warm to light
    });
  };

  return [theme, cycleTheme];
}
