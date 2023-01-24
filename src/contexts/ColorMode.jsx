import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const THEMES = {
  light: createTheme({
    palette: {
      mode: 'light',
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      background: {
        paper: '#000',
        background: '#000',
      },
    },
  }),
};

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export function ColorModeProvider({ children }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(prefersDarkMode ? 'dark' : 'light');
  const providerValue = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  }), []);

  return (
    <ColorModeContext.Provider value={providerValue}>
      <ThemeProvider theme={THEMES[mode]}>
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorModeContext() {
  return useContext(ColorModeContext);
}