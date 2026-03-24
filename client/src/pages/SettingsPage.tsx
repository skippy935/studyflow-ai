import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Input     from '../components/ui/Input';
import { apiFetch } from '../lib/api';
import { getUser, setSession, clearSession } from '../lib/auth';
import { useTranslation } from '../i18n';

export default function SettingsPage() {
  const { t, lang, setLang } = useTranslation();
  const navigate = useNavigate();
  const user = getUser();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [uiLang, setUiLang]           = useState(user?.uiLanguage || 'en');
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [saving, setSaving]           = useState(false);

  async function saveProfile() {
    setSaving(true);
    try {
      const data = await apiFetch<{ user: { id: number; email: string; displayName: string; uiLanguage: string } }>('/auth/me', {
        method: 'PUT' as unknown as 'GET',
        body: JSON.stringify({ displayName, uiLanguage: uiLang })
      });
      const token = localStorage.getItem('sb_token')!;
      setSession(token, { ...data.user, subscriptionTier: user?.subscriptionTier || 'free' });
      setLang(uiLang as 'en' | 'de');
      toast.success(t.settings.saved);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!currentPw || !newPw) { toast.error('Fill in both password fields'); return; }
    setSaving(true);
    try {
      await apiFetch('/auth/me', {
        method: 'PUT' as unknown as 'GET',
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
      });
      setCurrentPw(''); setNewPw('');
      toast.success('Password changed!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  }

  function deleteAccount() {
    const confirm = window.prompt(t.settings.deleteConfirm);
    if (confirm === 'DELETE') { clearSession(); navigate('/'); }
  }

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-8">{t.settings.title}</h1>

        {/* Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <User className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">{t.settings.profile}</h2>
          </div>
          <div className="space-y-4">
            <Input label={t.settings.displayName} value={displayName} onChange={e => setDisplayName(e.target.value)} />
            <Input label={t.settings.email} value={user?.email || ''} disabled className="opacity-60" />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{t.settings.language}</label>
              <div className="flex gap-2">
                {(['en','de'] as const).map(l => (
                  <button key={l} onClick={() => setUiLang(l)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${uiLang === l ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                    {l === 'en' ? 'English' : 'Deutsch'}
                  </button>
                ))}
              </div>
            </div>
            <Button loading={saving} onClick={saveProfile}>{t.settings.save}</Button>
          </div>
        </div>

        {/* Password */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <Lock className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">{t.settings.account}</h2>
          </div>
          <div className="space-y-4">
            <Input label={t.settings.currentPassword} type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••" />
            <Input label={t.settings.newPassword} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="New password" />
            <Button loading={saving} onClick={changePassword}>{t.settings.save}</Button>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-red-50 dark:bg-red-950 rounded-2xl border border-red-100 dark:border-red-900 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Trash2 className="w-4 h-4 text-red-500" />
            <h2 className="font-bold text-red-700 dark:text-red-400">{t.settings.deleteAccount}</h2>
          </div>
          <p className="text-sm text-red-500 mb-4">This action cannot be undone.</p>
          <Button variant="danger" size="sm" onClick={deleteAccount}>{t.settings.deleteAccount}</Button>
        </div>
      </div>
    </AppLayout>
  );
}
