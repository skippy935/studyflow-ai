import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from './i18n';
import App from './App';
import CookieBanner from './components/ui/CookieBanner';
import SupportWidget from './components/ui/SupportWidget';
import ErrorBoundary from './components/ui/ErrorBoundary';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ErrorBoundary>
          <App />
          <CookieBanner />
          <SupportWidget />
          <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
        </ErrorBoundary>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
);
