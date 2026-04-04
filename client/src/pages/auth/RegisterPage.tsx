import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input  from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';
import { setSession } from '../../lib/auth';
import { useTranslation } from '../../i18n';
import GoogleAuthButton from '../../components/ui/GoogleAuthButton';
import type { User } from '../../types';

const FIELDS = ['email', 'details', 'welcome'] as const;

export default function RegisterPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep]         = useState(0);
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: User; emailVerified: boolean }>('/auth/register', {
        method: 'POST', body: JSON.stringify({ email, password, name })
      });
      setSession(data.token, { ...data.user, emailVerified: false } as any);
      navigate('/verify-email');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">StudyBuild</span>
          </Link>

          {/* Step indicator */}
          {step < 2 && (
            <div className="flex gap-2 mb-6">
              {[0, 1].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />)}
            </div>
          )}

          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">{t.auth.registerTitle}</h1>
                <p className="text-slate-500 text-sm mb-6">
                  {t.auth.switchToLogin}{' '}
                  <Link to="/login" className="text-indigo-600 font-semibold hover:underline">{t.auth.switchLoginLink}</Link>
                </p>
                <div className="space-y-4">
                  <Input label={t.auth.email} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.auth.emailPlaceholder} required />
                  <Button size="lg" className="w-full" onClick={() => { if (email) setStep(1); }} disabled={!email}>
                    {lang === 'de' ? 'Weiter →' : 'Continue →'}
                  </Button>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or</span>
                    <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  </div>
                  <GoogleAuthButton label="Sign up with Google" />
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-6">{lang === 'de' ? 'Fast fertig!' : 'Almost there!'}</h1>
                <div className="space-y-4">
                  <Input label={t.auth.name} type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t.auth.namePlaceholder} required />
                  <Input label={t.auth.password} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.auth.passwordPlaceholder} required />
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button size="lg" loading={loading} className="w-full" onClick={handleRegister} disabled={!name || password.length < 6}>
                    {t.auth.registerBtn}
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                  {lang === 'de' ? `Willkommen, ${name}! 🎉` : `Welcome, ${name}! 🎉`}
                </h1>
                <p className="text-slate-500 text-sm mb-6">
                  {lang === 'de' ? 'Deine 14-Tage Premium Trial ist aktiv!' : 'Your 14-day Premium trial is active!'}
                </p>
                <Button size="lg" className="w-full" onClick={() => { toast.success('Let\'s study!'); navigate('/dashboard'); }}>
                  {lang === 'de' ? 'Zum Dashboard →' : 'Go to Dashboard →'}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
