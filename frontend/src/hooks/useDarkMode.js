import { useState, useEffect } from 'react';

/**
 * useDarkMode – Reads/writes the dark-mode preference to sessionStorage
 * and syncs the `dark` class on <html>.
 *
 * Returns [isDark, toggle]
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = sessionStorage.getItem('theme');
    if (saved) return saved === 'dark';
    // Default to dark mode on first visit
    return true;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      sessionStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      sessionStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return [isDark, toggle];
}
