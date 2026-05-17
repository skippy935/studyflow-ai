import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { I18nProvider } from './i18n';
import App from './App';
import CookieBanner from './components/ui/CookieBanner';
import SupportWidget from './components/ui/SupportWidget';
import ErrorBoundary from './components/ui/ErrorBoundary';
import UpgradeModal from './components/ui/UpgradeModal';
import './index.css';

// ── Global 402 interceptor ────────────────────────────────────────────────────
// Patches fetch so any 402 response automatically fires the upgrade modal.
// Components don't need to handle upgrade flows individually.
(function patchFetch() {
  const _fetch = window.fetch.bind(window);
  window.fetch = async (...args) => {
    const res = await _fetch(...args);
    if (res.status === 402) {
      let message: string | undefined;
      try {
        const clone = res.clone();
        const json = await clone.json();
        message = json.message ?? json.error ?? undefined;
      } catch { /* ignore */ }
      window.dispatchEvent(new CustomEvent('upgrade-required', { detail: { message } }));
    }
    return res;
  };
})();

function Root() {
  const [upgradeMessage, setUpgradeMessage] = useState<string | undefined>();
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { message?: string };
      setUpgradeMessage(detail?.message);
      setShowUpgrade(true);
    };
    window.addEventListener('upgrade-required', handler);
    return () => window.removeEventListener('upgrade-required', handler);
  }, []);

  return (
    <>
      <App />
      <CookieBanner />
      <SupportWidget />
      <Toaster position="top-right" toastOptions={{ style: { borderRadius: '12px', fontFamily: 'Inter, sans-serif', fontSize: '14px' } }} />
      {showUpgrade && (
        <UpgradeModal
          onClose={() => setShowUpgrade(false)}
          message={upgradeMessage}
        />
      )}
    </>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ErrorBoundary>
          <Root />
        </ErrorBoundary>
      </I18nProvider>
    </BrowserRouter>
  </StrictMode>
);
