import { ThemeProvider, Theme } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { useEffect, useMemo, useState } from 'react';

// Theme context so other components can toggle the theme
export const ThemeModeContext = (/* placeholder for typing at runtime */) as any;

const STORAGE_KEY = 'appThemeMode';

export const AppTheme = ({ children }: React.PropsWithChildren) => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return (saved as 'light' | 'dark') ?? 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore
    }
  }, [mode]);

  const theme: Theme = useMemo(() =>
    createTheme({
      palette: {
        mode,
        primary: { main: '#262254' },
        secondary: { main: '#543884' },
      },
      components: {
        // small default adjustments for a modern look
        MuiButton: {
          defaultProps: { disableElevation: true },
        },
      },
    }),
    [mode]
  );

  const toggleMode = () => setMode((m) => (m === 'light' ? 'dark' : 'light'));

  // Provide a lightweight context object (avoid heavyweight typing here)
  const contextValue = useMemo(() => ({ mode, toggleMode }), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ThemeModeContext.Provider value={contextValue}>
        {children}
      </ThemeModeContext.Provider>
    </ThemeProvider>
  );
};
