import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, CheckCircle, GraduationCap, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input  from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';
import { setSession } from '../../lib/auth';
import { useTranslation } from '../../i18n';
import GoogleAuthButton from '../../components/ui/GoogleAuthButton';
import type { User } from '../../types';

type Role = 'student' | 'teacher' | null;

export default function RegisterPage() {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();

  const [role, setRole]         = useState<Role>(null);
  const [step, setStep]         = useState(0); // 0=role, 1=email, 2=details, 3=done
  const [email, setEmail]       = useState('');
  const [name, setName]         = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    setError('');
    setLoading(true);
    try {
      const endpoint = role === 'teacher' ? '/auth/register/teacher' : '/auth/register/student';
      const data = await apiFetch<{ token: string; user: User; teacherStatus?: string }>(endpoint, {
        method: 'POST', body: JSON.stringify({ email, password, name }),
      });
      setSession(data.token, data.user);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  function handleDone() {
    if (role === 'teacher') {
      navigate('/teacher/onboarding');
    } else {
      toast.success("Let's study!");
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0F172A] flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-[#1E293B] rounded-[24px] shadow-[0_24px_80px_rgba(0,0,0,0.12)] dark:shadow-[0_24px_80px_rgba(0,0,0,0.4)] border border-slate-100 dark:border-white/5 p-8">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">StudyBuild</span>
          </Link>

          {/* Step indicator */}
          {step > 0 && step < 3 && (
            <div className="flex gap-2 mb-6">
              {[1, 2].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
              ))}
            </div>
          )}

          <AnimatePresence mode="wait">

            {/* Step 0: Role selector */}
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                  {lang === 'de' ? 'Konto erstellen' : 'Create an account'}
                </h1>
                <p className="text-slate-500 text-sm mb-6">
                  {lang === 'de' ? 'Bereits registriert? ' : 'Already registered? '}
                  <Link to="/login" className="text-indigo-600 font-semibold hover:underline">
                    {lang === 'de' ? 'Anmelden' : 'Sign in'}
                  </Link>
                </p>

                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => { setRole('student'); setStep(1); }}
                    className="w-full flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950 border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-950 rounded-xl flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {lang === 'de' ? 'Ich bin Schüler/in' : "I'm a Student"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {lang === 'de' ? 'Lernkarten, Quizze, KI-Tutor' : 'Flashcards, quizzes, AI tutor'}
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => { setRole('teacher'); setStep(1); }}
                    className="w-full flex items-center gap-4 p-4 border-2 rounded-2xl text-left transition-all hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-950 border-slate-200 dark:border-slate-700"
                  >
                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950 rounded-xl flex items-center justify-center flex-shrink-0">
                      <GraduationCap className="w-5 h-5 text-violet-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                        {lang === 'de' ? 'Ich bin Lehrer/in' : "I'm a Teacher"}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {lang === 'de' ? 'Klassen, Aufgaben, Fortschritt verfolgen' : 'Classes, assignments, track progress'}
                      </div>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                  <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or</span>
                  <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                </div>
                <GoogleAuthButton label="Continue with Google" />
              </motion.div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-1">
                  {role === 'teacher'
                    ? <GraduationCap className="w-5 h-5 text-violet-600" />
                    : <BookOpen className="w-5 h-5 text-indigo-600" />}
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {role === 'teacher' ? (lang === 'de' ? 'Lehrer-Konto' : 'Teacher account') : (lang === 'de' ? 'Schüler-Konto' : 'Student account')}
                  </span>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-6">
                  {lang === 'de' ? 'Deine E-Mail-Adresse' : 'Your email address'}
                </h1>
                <div className="space-y-4">
                  <Input label={t.auth.email} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.auth.emailPlaceholder} required />
                  <Button size="lg" className="w-full" onClick={() => { if (email) setStep(2); }} disabled={!email}>
                    {lang === 'de' ? 'Weiter →' : 'Continue →'}
                  </Button>
                  <button onClick={() => setStep(0)} className="w-full text-sm text-slate-400 hover:text-slate-600 text-center">
                    ← {lang === 'de' ? 'Zurück' : 'Back'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Name + password */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-6">
                  {lang === 'de' ? 'Fast fertig!' : 'Almost there!'}
                </h1>
                <div className="space-y-4">
                  <Input label={t.auth.name} type="text" value={name} onChange={e => setName(e.target.value)} placeholder={t.auth.namePlaceholder} required />
                  <Input label={t.auth.password} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.auth.passwordPlaceholder} required />
                  {role === 'teacher' && (
                    <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2">
                      {lang === 'de'
                        ? '🔐 Passwort: mind. 8 Zeichen, Groß-/Kleinbuchstaben, Zahl & Sonderzeichen'
                        : '🔐 Password: min 8 chars, upper + lowercase, number & special character'}
                    </p>
                  )}
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <Button size="lg" loading={loading} className="w-full" onClick={handleRegister} disabled={!name || password.length < 8}>
                    {t.auth.registerBtn}
                  </Button>
                  <button onClick={() => setStep(1)} className="w-full text-sm text-slate-400 hover:text-slate-600 text-center">
                    ← {lang === 'de' ? 'Zurück' : 'Back'}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Done */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
                  {lang === 'de' ? `Willkommen, ${name}!` : `Welcome, ${name}!`}
                </h1>
                {role === 'teacher' ? (
                  <p className="text-slate-500 text-sm mb-6">
                    {lang === 'de'
                      ? 'Bitte vervollständige dein Lehrer-Profil, damit wir dein Konto freischalten können.'
                      : 'Please complete your teacher profile so we can verify your account.'}
                  </p>
                ) : (
                  <p className="text-slate-500 text-sm mb-6">
                    {lang === 'de' ? 'Deine 14-Tage Premium Trial ist aktiv!' : 'Your 14-day Premium trial is active!'}
                  </p>
                )}
                <Button size="lg" className="w-full" onClick={handleDone}>
                  {role === 'teacher'
                    ? (lang === 'de' ? 'Profil vervollständigen →' : 'Complete Profile →')
                    : (lang === 'de' ? 'Zum Dashboard →' : 'Go to Dashboard →')}
                </Button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
