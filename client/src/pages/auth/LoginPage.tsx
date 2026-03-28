import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input  from '../../components/ui/Input';
import { apiFetch } from '../../lib/api';
import { setSession } from '../../lib/auth';
import { useTranslation } from '../../i18n';
import GoogleAuthButton from '../../components/ui/GoogleAuthButton';
import type { User } from '../../types';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: User }>('/auth/login', {
        method: 'POST', body: JSON.stringify({ email, password })
      });
      setSession(data.token, data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">StudyBuild</span>
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-1">{t.auth.loginTitle}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            {t.auth.switchToRegister}{' '}
            <Link to="/register" className="text-indigo-600 font-semibold hover:underline">{t.auth.switchRegisterLink}</Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label={t.auth.email} type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t.auth.emailPlaceholder} required />
            <Input label={t.auth.password} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={t.auth.passwordPlaceholder} required />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" loading={loading} className="w-full" size="lg">{t.auth.loginBtn}</Button>
          </form>
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>
          <GoogleAuthButton label="Sign in with Google" />
        </div>
      </motion.div>
    </div>
  );
}
