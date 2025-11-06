import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from '@/components/ui/ThemeProvider';
import { createDexieDb } from '@/lib/dexieDb';
import { initDb } from '@/lib/db';

// Initialize database
initDb(createDexieDb());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
