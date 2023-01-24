import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

const THEMES = {
  light: createTheme({
    palette: {
      mode: 'light',
      background: {
        paper: 'red',
        background: 'red',
      },
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
  const prefersLightMode = useMediaQuery('(prefers-color-scheme: light)');
  const [mode, setMode] = useState(prefersLightMode ? 'light' : 'dark');
  const providerValue = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  }), []);

  console.log(THEMES.light);

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