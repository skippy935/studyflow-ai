import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiFetch } from '../../lib/api';
import { setSession } from '../../lib/auth';
import toast from 'react-hot-toast';
import type { User } from '../../types';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize(cfg: { client_id: string; callback: (r: { credential: string }) => void }): void;
          renderButton(el: HTMLElement, opts: object): void;
        };
      };
    };
  }
}

export default function GoogleAuthButton({ label = 'Continue with Google' }: { label?: string }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const handleCredential = useCallback(async (credential: string) => {
    setLoading(true);
    try {
      const data = await apiFetch<{ token: string; user: User }>('/auth/google', {
        method: 'POST',
        body: JSON.stringify({ idToken: credential }),
      });
      setSession(data.token, data.user);
      toast.success(`Welcome, ${data.user.displayName}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (!clientId) return;
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (r) => handleCredential(r.credential),
      });
      const el = document.getElementById('google-signin-btn');
      if (el) {
        window.google?.accounts.id.renderButton(el, {
          theme: 'outline', size: 'large', width: '100%', text: 'continue_with',
        });
      }
    };
    document.head.appendChild(script);
    return () => { document.head.removeChild(script); };
  }, [clientId, handleCredential]);

  if (!clientId) return null;

  return (
    <div className="w-full">
      {loading ? (
        <div className="w-full h-11 flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-500">
          Signing in…
        </div>
      ) : (
        <div id="google-signin-btn" className="w-full" title={label} />
      )}
    </div>
  );
}
