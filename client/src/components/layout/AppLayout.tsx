import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0F172A]">
      <Sidebar />

      <main className="flex-1 lg:ml-64 min-h-screen flex flex-col">
        {/* PWA install banner */}
        {canInstall && !dismissed && (
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Download className="w-4 h-4 flex-shrink-0" />
              <span>Install StudyFlow for offline access &amp; a better experience.</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={install}
                className="text-xs font-bold bg-white text-indigo-600 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Install
              </button>
              <button
                onClick={() => setDismissed(true)}
                className="text-indigo-200 hover:text-white transition-colors p-1"
                aria-label="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Page content */}
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 pb-24 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
