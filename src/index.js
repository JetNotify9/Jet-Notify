// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

const theme = createTheme();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('No element with id "root" found in public/index.html');
}
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <HashRouter>
          <App />
        </HashRouter>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

console.log('Index.js loaded');
