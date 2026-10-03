import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { Colors } from '../constants/theme';
import { getDb } from '../database/db';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  theme: typeof Colors.light;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  mode: 'system',
  isDark: false,
  theme: Colors.light,
  setMode: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    (async () => {
      try {
        const db = await getDb();
        const row = await db.getFirstAsync<{ value: string }>(
          'SELECT value FROM settings WHERE key = ?',
          'theme_mode'
        );
        if (row && (row.value === 'light' || row.value === 'dark' || row.value === 'system')) {
          setModeState(row.value as ThemeMode);
        }
      } catch {
        // Fallback to system
      }
    })();
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      const db = await getDb();
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        'theme_mode',
        newMode
      );
    } catch {
      // Ignored
    }
  };

  const isDark =
    mode === 'dark' || (mode === 'system' && systemColorScheme === 'dark');

  const theme = isDark ? Colors.dark : Colors.light;

  const toggleTheme = () => {
    setMode(isDark ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ mode, isDark, theme, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
