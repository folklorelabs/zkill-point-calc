import React, {
  createContext, useContext, useState, useMemo,
} from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// import useMediaQuery from '@mui/material/useMediaQuery';
import { childrenProps, childrenDefaults } from '../propTypes/children';

const THEMES = {
  light: createTheme({
    palette: {
      background: {
        default: '#fefefe',
        paper: '#fefefe',
      },
      primary: {
        main: '#1c6f95',
      },
      text: {
        primary: '#6f6f6f',
        secondary: '#000',
      },
    },
  }),
  dark: createTheme({
    palette: {
      mode: 'dark',
      background: {
        default: '#000',
        paper: '#060606',
      },
      primary: {
        main: '#2a9fd6',
      },
      warning: {
        main: '#fcc204',
      },
      divider: 'rgba(255, 255, 255, 0.333)',
      text: {
        primary: '#8f8f8f',
        secondary: '#fff',
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

  return (
    <ColorModeContext.Provider value={providerValue}>
      <ThemeProvider theme={THEMES[mode]}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

ColorModeProvider.defaultProps = {
  children: childrenDefaults,
};

ColorModeProvider.propTypes = {
  children: childrenProps,
};

export function useColorModeContext() {
  return useContext(ColorModeContext);
}
