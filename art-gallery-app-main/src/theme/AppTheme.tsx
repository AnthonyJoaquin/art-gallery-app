import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';

import { purpleTheme } from './purple-theme';

export const AppTheme = ({ children }: React.PropsWithChildren) => {
  return (
    <ThemeProvider theme={purpleTheme}>
      <CssBaseline />

      {children}
    </ThemeProvider>
  );
};
