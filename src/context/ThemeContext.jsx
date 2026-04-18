import { createContext, useContext } from 'react';

// Context object create karein
export const ThemeContext = createContext(undefined);

// Hook export karein
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};