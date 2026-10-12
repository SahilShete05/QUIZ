import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';

import { AppRoutes } from './AppRoutes';
import { AuthProvider } from './features/auth/AuthContext';
import { queryClient } from './lib/queryClient';

import './styles.css';

function App() {
  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="dark"
      enableSystem={false}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <BrowserRouter>
            <div className="min-h-screen">
              <AppRoutes />

              <Toaster
                richColors
                position="top-right"
                closeButton
                theme="system"
              />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);