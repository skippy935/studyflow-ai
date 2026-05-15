import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Zap, Star, Lock } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { apiFetch } from '../lib/api';
import { setSession, getToken, getUser } from '../lib/auth';

type SyncState = 'syncing' | 'done' | 'error';

export default function BillingSuccessPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  const [state, setState] = useState<SyncState>('syncing');
  const [tier, setTier] = useState('premium');

  useEffect(() => {
    if (!sessionId) { setState('done'); return; }
    syncAndActivate();
  }, [sessionId]);

  async function syncAndActivate() {
    try {
      const result = await apiFetch<{ ok: boolean; tier: string; status: string }>(
        '/billing/sync-session',
        { method: 'POST', body: JSON.stringify({ sessionId }) }
      );
      setTier(result.tier ?? 'premium');

      // Refresh auth state so the UI shows the new tier immediately
      const me = await apiFetch<{ user: Record<string, unknown> }>('/auth/me');
      const currentToken = getToken();
      const currentUser = getUser();
      if (currentToken && currentUser && me.user) {
        setSession(currentToken, { ...currentUser, ...me.user } as never);
      }

      setState('done');
    } catch {
      setState('done'); // Webhook may have already processed — show success anyway
    }
  }

  const PERKS: Record<string, string[]> = {
    premium: [
      'Alle 100+ Lern-Kits freigeschaltet',
      'KI-Examiner ohne Limit',
      'Sage AI Tutor unbegrenzt',
      'Unbegrenzte Flashcard-Decks',
      'Prioritäts-Support',
    ],
    school: [
      'Alle Premium-Features',
      'Klassen & Lerngruppen verwalten',
      'Schülerfortschritt einsehen',
      'Lehrer-Dashboard',
      'Dedizierter Support',
    ],
  };

  const perks = PERKS[tier] ?? PERKS.premium;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto py-16 px-4">
        {state === 'syncing' ? (
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center mx-auto mb-5">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
              Abonnement wird aktiviert…
            </h1>
            <p className="text-slate-500 text-sm">Einen Moment bitte.</p>
          </div>
        ) : (
          <div className="text-center">
            {/* Success icon */}
            <div className="relative inline-block mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center shadow-xl shadow-emerald-200 dark:shadow-emerald-900/50 mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
              Willkommen, {tier === 'school' ? 'Lehrer!' : 'Premium!'}
            </h1>
            <p className="text-slate-500 mb-8 text-base">
              Dein Abonnement ist jetzt aktiv — alle Features sind freigeschaltet.
            </p>

            {/* What's unlocked */}
            <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/50 dark:to-violet-950/50 rounded-2xl border border-indigo-100 dark:border-indigo-800 p-5 mb-8 text-left">
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-3 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5" /> Das hast du jetzt
              </p>
              <ul className="space-y-2.5">
                {perks.map(perk => (
                  <li key={perk} className="flex items-center gap-2.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                    </div>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/kits')}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-br from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 transition-all hover:-translate-y-0.5"
              >
                <Lock className="w-4 h-4" />
                Alle Kits entdecken
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all"
              >
                Zum Dashboard →
              </button>
            </div>

            {sessionId && (
              <p className="text-xs text-slate-400 mt-5">
                Ref: {sessionId.slice(-16).toUpperCase()} ·{' '}
                <button onClick={() => navigate('/billing')} className="underline hover:text-slate-600">
                  Rechnung anzeigen
                </button>
              </p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
