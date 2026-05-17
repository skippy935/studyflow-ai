import { useState } from 'react';
import { Lock } from 'lucide-react';
import UpgradeModal from './UpgradeModal';

interface Props {
  children: React.ReactNode;
  locked: boolean;
  message?: string;
  featureName?: string;
}

export default function PaywallGate({ children, locked, message, featureName }: Props) {
  const [showModal, setShowModal] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <>
      <div className="relative">
        <div className="pointer-events-none select-none blur-sm opacity-60">
          {children}
        </div>
        <div
          className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-4 shadow-xl flex flex-col items-center gap-2 text-center max-w-xs">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center">
              <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
              {featureName ? `${featureName} ist Premium` : 'Premium-Feature'}
            </p>
            {message && (
              <p className="text-slate-500 dark:text-slate-400 text-xs">{message}</p>
            )}
            <button className="mt-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition">
              Upgrade
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <UpgradeModal
          onClose={() => setShowModal(false)}
          message={message}
        />
      )}
    </>
  );
}
