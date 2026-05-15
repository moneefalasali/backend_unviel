import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>('dark');

  const applyTheme = (nextTheme: Theme) => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(nextTheme);
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as Theme) || 'dark';
    setThemeState(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const setTheme = async (nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem('theme', nextTheme);
    applyTheme(nextTheme);
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};
