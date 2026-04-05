import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 p-4 pb-safe">
      <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl p-4 flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Cookie & Privacy Notice</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            We use essential cookies only — to keep you signed in and remember your preferences.
            No tracking or advertising cookies. Your data is never sold.{' '}
            <a href="/privacy" className="text-indigo-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={decline}
            className="text-xs text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors">
            Decline
          </button>
          <button onClick={accept}
            className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-xl transition-colors">
            Accept
          </button>
          <button onClick={accept} className="p-1 text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
