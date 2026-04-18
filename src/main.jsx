import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Context Providers
import { AuthProvider } from './context/AuthProvider';
import { SocketProvider } from './context/SocketProvider'; // ✅ updated import
import { ThemeProvider } from './context/ThemeProvider.jsx'; // ✅ fixed import

// Error Boundary Component
import ErrorBoundary from './components/ErrorBoundary';

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => console.log('Service Worker registered successfully'))
      .catch((err) => console.error('Service Worker registration failed:', err));
  });
}

// --- Root Rendering ---
const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <ThemeProvider>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </ThemeProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>
);