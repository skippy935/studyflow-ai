import { useState } from 'react';
import { X, Star, Loader2 } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import toast from 'react-hot-toast';

interface Props {
  onClose: () => void;
  message?: string;
}

export default function UpgradeModal({ onClose, message }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(interval: 'month' | 'year') {
    setLoading(interval);
    try {
      const data = await apiFetch<{ url: string }>('/billing/create-checkout', {
        method: 'POST',
        body: JSON.stringify({ tier: 'premium', interval }),
      });
      window.location.href = data.url;
    } catch (err: any) {
      toast.error(err.message ?? 'Fehler beim Starten des Checkouts');
      setLoading(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl p-7 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">Premium werden</h2>
              <p className="text-slate-400 text-xs">Lerne ohne Grenzen</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blocker message */}
        {message && (
          <div className="mb-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            {message}
          </div>
        )}

        {/* Features */}
        <ul className="space-y-1.5 mb-6 text-sm text-slate-600 dark:text-slate-400">
          {[
            'Unbegrenzte KI-Nachrichten & Erklärungen',
            'Unbegrenzte KI-Quiz & Karteikarten',
            'Unbegrenzte Karteikarten-Stapel',
            'Offline-Modus',
            'Lerngruppen',
            'Erweiterte Lernstatistiken (1 Jahr)',
            'PDF & CSV Export',
            '1,5× – 2× XP-Bonus',
          ].map(f => (
            <li key={f} className="flex items-center gap-2">
              <span className="text-emerald-500 font-bold">✓</span> {f}
            </li>
          ))}
        </ul>

        {/* Pricing */}
        <div className="space-y-2.5">
          <button
            onClick={() => handleUpgrade('year')}
            disabled={loading !== null}
            className="w-full relative bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-semibold transition flex flex-col items-center"
          >
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold whitespace-nowrap">
              SPARE 27%
            </span>
            {loading === 'year'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <>
                  <span>€69,99 / Jahr</span>
                  <span className="text-indigo-200 text-xs font-normal mt-0.5">Nur €5,83/Monat · 2× XP · Prioritäts-Support</span>
                </>
            }
          </button>

          <button
            onClick={() => handleUpgrade('month')}
            disabled={loading !== null}
            className="w-full border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-medium transition flex flex-col items-center"
          >
            {loading === 'month'
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <>
                  <span>€7,99 / Monat</span>
                  <span className="text-slate-400 text-xs font-normal">Monatlich kündbar · 14 Tage gratis testen</span>
                </>
            }
          </button>
        </div>

        <p className="text-xs text-center text-slate-400 mt-4">
          Jederzeit kündbar · Sicher mit Stripe · SEPA, Kreditkarte & PayPal
        </p>
      </div>
    </div>
  );
}
