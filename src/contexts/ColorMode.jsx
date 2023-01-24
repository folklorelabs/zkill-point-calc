import { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// import useMediaQuery from '@mui/material/useMediaQuery';

const THEMES = {
  light: createTheme({
    palette: {
      mode: 'light',
      background: {
        paper: '#fefefe',
        background: '#fefefe',
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      background: {
        paper: '#020202',
        background: '#020202',
      },
    },
  }),
};

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export function ColorModeProvider({ children }) {
  // const prefersLightMode = useMediaQuery('(prefers-color-scheme: light)');
  // const [mode, setMode] = useState(prefersLightMode ? 'light' : 'dark');
  const [mode, setMode] = useState('dark');
  const providerValue = useMemo(() => ({
    toggleColorMode: () => {
      setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    },
  }), []);

  console.log(THEMES.light);

  return (
    <ColorModeContext.Provider value={providerValue}>
      <ThemeProvider theme={THEMES[mode]}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export function useColorModeContext() {
  return useContext(ColorModeContext);
}