import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Mail } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { getUser } from '../../lib/auth';
import Button from '../../components/ui/Button';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const user = getUser();
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  function handleDigit(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (next.every(d => d !== '')) submitCode(next.join(''));
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(''));
      submitCode(pasted);
    }
  }

  async function submitCode(code: string) {
    setError('');
    setLoading(true);
    try {
      await apiFetch('/auth/verify-email', { method: 'POST', body: JSON.stringify({ code }) });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Incorrect code');
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    setResending(true);
    try {
      await apiFetch('/auth/resend-verify', { method: 'POST' });
      setResendCooldown(60);
      setError('');
    } catch {
      setError('Failed to resend. Try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">StudyBuild</span>
          </div>

          <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-950 rounded-2xl flex items-center justify-center mb-5">
            <Mail className="w-7 h-7 text-indigo-600" />
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">Check your email</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
            We sent a 6-digit code to <strong className="text-slate-700 dark:text-slate-300">{user?.email}</strong>. It expires in 15 minutes.
          </p>

          <div className="flex gap-2 justify-center mb-6" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={loading}
                className={`w-12 h-14 text-center text-2xl font-bold rounded-xl border-2 transition-all focus:outline-none focus:border-indigo-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 ${
                  error ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'
                } disabled:opacity-50`}
              />
            ))}
          </div>

          {error && <p className="text-sm text-red-500 text-center mb-4">{error}</p>}

          {loading && (
            <div className="flex justify-center mb-4">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="text-center">
            {resendCooldown > 0 ? (
              <p className="text-sm text-slate-400">Resend code in {resendCooldown}s</p>
            ) : (
              <Button variant="ghost" size="sm" loading={resending} onClick={resend}>
                Resend code
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
