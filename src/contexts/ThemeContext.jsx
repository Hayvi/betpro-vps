import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { THEME_STORAGE_KEY, DEFAULT_THEME } from '@/constants/theme';
import { safeSetItem, safeGetItem } from '@/services/localStorageService';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      if (typeof window === 'undefined') {
        return DEFAULT_THEME === 'dark';
      }
      const savedTheme = safeGetItem(THEME_STORAGE_KEY) || DEFAULT_THEME;
      return savedTheme === 'dark';
    } catch {
      return DEFAULT_THEME === 'dark';
    }
  });

  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
      if (typeof window !== 'undefined') {
        const success = safeSetItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
        if (!success) {
          console.warn('Failed to save theme preference due to storage limits');
        }
      }
    } catch {
      // ignore storage / DOM errors
    }
  }, [isDark]);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

