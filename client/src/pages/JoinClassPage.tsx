import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Hash, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../components/ui/Button';
import { apiFetch } from '../lib/api';

type State = 'idle' | 'loading' | 'success' | 'error' | 'rateLimit';

export default function JoinClassPage() {
  const navigate  = useNavigate();
  const inputRef  = useRef<HTMLInputElement>(null);
  const [code, setCode]           = useState('');
  const [state, setState]         = useState<State>('idle');
  const [errorMsg, setErrorMsg]   = useState('');
  const [className, setClassName] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => { if (c <= 1) { clearInterval(t); setState('idle'); return 0; } return c - 1; }), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
    setCode(val);
    if (state === 'error') setState('idle');
  }

  async function handleJoin() {
    if (code.length < 4) return;
    setState('loading');
    setErrorMsg('');
    try {
      const data = await apiFetch<{ ok: boolean; class: { name: string } }>('/teacher/join', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
      setClassName(data.class.name);
      setState('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid code';
      if (msg.toLowerCase().includes('too many') || msg.toLowerCase().includes('rate')) {
        const match = msg.match(/(\d+)s/);
        setCountdown(match ? parseInt(match[1]) : 60);
        setState('rateLimit');
      } else {
        setErrorMsg(msg);
        setState('error');
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">

          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Hash className="w-7 h-7 text-indigo-600" />
          </div>

          <AnimatePresence mode="wait">

            {/* Idle / error / rate-limit */}
            {(state === 'idle' || state === 'loading' || state === 'error' || state === 'rateLimit') && (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 text-center mb-1">
                  Klasse beitreten
                </h1>
                <p className="text-slate-500 text-sm text-center mb-7">
                  Gib den 6–8-stelligen Code ein, den dein Lehrer geteilt hat.
                </p>

                {/* Code input */}
                <div className="relative mb-4">
                  <input
                    ref={inputRef}
                    value={code}
                    onChange={handleInput}
                    onKeyDown={e => e.key === 'Enter' && handleJoin()}
                    maxLength={8}
                    disabled={state === 'rateLimit'}
                    placeholder="Z.B. AB3X7K"
                    className={`w-full text-center text-3xl font-extrabold tracking-[0.3em] py-4 px-4 rounded-2xl border-2 transition-all bg-slate-50 dark:bg-slate-800 outline-none font-mono
                      ${state === 'error'     ? 'border-red-400 text-red-600 dark:text-red-400' : ''}
                      ${state === 'rateLimit' ? 'border-amber-400 text-amber-600 opacity-60' : ''}
                      ${state !== 'error' && state !== 'rateLimit' ? 'border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:border-indigo-500' : ''}`}
                  />
                </div>

                {/* Error message */}
                {state === 'error' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl px-3 py-2.5 text-sm mb-4">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {errorMsg || 'Ungültiger oder inaktiver Code.'}
                  </motion.div>
                )}

                {/* Rate-limit countdown */}
                {state === 'rateLimit' && (
                  <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-xl px-3 py-2.5 text-sm mb-4">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    Zu viele Versuche. Bitte warte {countdown}s.
                  </motion.div>
                )}

                <Button
                  size="lg" className="w-full"
                  loading={state === 'loading'}
                  disabled={code.length < 4 || state === 'rateLimit'}
                  onClick={handleJoin}
                >
                  Beitreten →
                </Button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="w-full mt-3 text-sm text-slate-400 hover:text-slate-600 text-center"
                >
                  Abbrechen
                </button>
              </motion.div>
            )}

            {/* Success */}
            {state === 'success' && (
              <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                  Erfolgreich beigetreten! 🎉
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  Du bist jetzt Mitglied von <strong className="text-slate-700 dark:text-slate-300">„{className}"</strong>.
                </p>
                <Button size="lg" className="w-full" onClick={() => navigate('/dashboard')}>
                  Zum Dashboard →
                </Button>
              </motion.div>
            )}

          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
