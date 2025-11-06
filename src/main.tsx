import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { DbProvider } from '@/components/DbProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DbProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </DbProvider>
  </StrictMode>
);
