import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './index.styles.js';
import CssBaseline from '@mui/material/CssBaseline';
import App from './components/App';
import { ZkillPointsProvider } from './contexts/ZkillPoints';
import { ColorModeProvider } from './contexts/ColorMode';
import { SnackbarProvider } from 'notistack';
import reportWebVitals from './reportWebVitals';

import { ThemeProvider, createTheme } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <ColorModeProvider>
        <SnackbarProvider maxSnack={3}>
          <ZkillPointsProvider>
            <CssBaseline />
            <App />
          </ZkillPointsProvider>
        </SnackbarProvider>
      </ColorModeProvider>
    </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
