import { ReactNode } from 'react';
import Sidebar from './Sidebar';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, X } from 'lucide-react';
import { useState } from 'react';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { canInstall, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 lg:ml-64 min-h-screen">
        {canInstall && !dismissed && (
          <div className="bg-indigo-600 text-white px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Download className="w-4 h-4 flex-shrink-0" />
              <span>Install StudyFlow for offline access and a better experience.</span>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={install} className="text-xs font-bold bg-white text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors">
                Install
              </button>
              <button onClick={() => setDismissed(true)} className="text-indigo-200 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 pb-20 lg:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
