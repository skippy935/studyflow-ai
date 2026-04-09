import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, Moon, Sun, Monitor, Trophy, GraduationCap, Tag } from 'lucide-react';
import toast from 'react-hot-toast';
import AppLayout from '../components/layout/AppLayout';
import Button    from '../components/ui/Button';
import Input     from '../components/ui/Input';
import { apiFetch } from '../lib/api';
import { getUser, setSession, clearSession } from '../lib/auth';
import { useTranslation, LANGUAGE_OPTIONS, type Language } from '../i18n';
import type { Stats } from '../types';

type ThemePreference = 'light' | 'dark' | 'system';

function applyTheme(pref: ThemePreference) {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = pref === 'dark' || (pref === 'system' && prefersDark);
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('sb_theme', pref === 'system' ? (isDark ? 'dark' : 'light') : pref);
  localStorage.setItem('sb_theme_pref', pref);
}

export default function SettingsPage() {
  const { t, setLang } = useTranslation();
  const navigate = useNavigate();
  const user = getUser();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [uiLang, setUiLang]           = useState(user?.uiLanguage || 'en');
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [gradeLevel, setGradeLevel]   = useState((user as any)?.gradeLevel || '');
  const [schoolType, setSchoolType]   = useState((user as any)?.schoolType || '');
  const [bundesland, setBundesland]   = useState((user as any)?.bundesland || '');
  const [learningStyle, setLearningStyle]         = useState((user as any)?.learningStyle || '');
  const [preferredStudyTime, setPreferredStudyTime] = useState((user as any)?.preferredStudyTime || '');
  const [stats, setStats]             = useState<Stats | null>(null);
  const [promoCode, setPromoCode]     = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoResult, setPromoResult] = useState<{ benefit: string } | null>(null);

  async function redeemPromo() {
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoResult(null);
    try {
      const data = await apiFetch<{ benefit: string }>('/promo/redeem', {
        method: 'POST' as unknown as 'GET',
        body: JSON.stringify({ code: promoCode.trim() }),
      });
      setPromoResult(data);
      setPromoCode('');
      toast.success('Promo code applied!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Invalid promo code');
    } finally {
      setPromoLoading(false);
    }
  }

  useEffect(() => {
    apiFetch<Stats>('/stats').then(setStats).catch(() => {});
  }, []);
  const [saving, setSaving]           = useState(false);
  const [themePref, setThemePref]     = useState<ThemePreference>(
    () => (localStorage.getItem('sb_theme_pref') as ThemePreference) || 'system'
  );

  function handleThemeChange(pref: ThemePreference) {
    setThemePref(pref);
    applyTheme(pref);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const data = await apiFetch<{ user: { id: number; email: string; displayName: string; uiLanguage: string } }>('/auth/me', {
        method: 'PUT' as unknown as 'GET',
        body: JSON.stringify({ displayName, uiLanguage: uiLang, gradeLevel, schoolType, bundesland, learningStyle, preferredStudyTime })
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

  async function deleteAccount() {
    const confirm = window.prompt(t.settings.deleteConfirm);
    if (confirm !== 'DELETE') return;
    try {
      await apiFetch('/auth/me', { method: 'DELETE' as unknown as 'GET' });
      clearSession();
      navigate('/');
      toast.success('Account deleted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Deletion failed');
    }
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
              <div className="flex flex-wrap gap-2">
                {LANGUAGE_OPTIONS.map(l => (
                  <button key={l.code} onClick={() => setUiLang(l.code as Language)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border-2 transition-all flex items-center gap-1.5 ${uiLang === l.code ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                    <span>{l.flag}</span>{l.label}
                  </button>
                ))}
              </div>
            </div>
            <Button loading={saving} onClick={saveProfile}>{t.settings.save}</Button>
          </div>
        </div>

        {/* Study Profile */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <GraduationCap className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Study Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Grade Level</label>
              <select value={gradeLevel} onChange={e => setGradeLevel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select grade level</option>
                {['5','6','7','8','9','10','11','12','University'].map(g => <option key={g} value={g}>{g === 'University' ? 'University / College' : `Grade ${g}`}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">School Type</label>
              <select value={schoolType} onChange={e => setSchoolType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select school type</option>
                {['Gymnasium','Realschule','Hauptschule','Gesamtschule','Berufsschule','University','Other'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Bundesland</label>
              <select value={bundesland} onChange={e => setBundesland(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="">Select Bundesland</option>
                {['Baden-Württemberg','Bayern','Berlin','Brandenburg','Bremen','Hamburg','Hessen','Mecklenburg-Vorpommern','Niedersachsen','Nordrhein-Westfalen','Rheinland-Pfalz','Saarland','Sachsen','Sachsen-Anhalt','Schleswig-Holstein','Thüringen'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Learning Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'visual',    label: 'Visual',    desc: 'Diagrams & images' },
                  { key: 'reading',   label: 'Reading',   desc: 'Notes & text' },
                  { key: 'practice',  label: 'Practice',  desc: 'Exercises & quizzes' },
                  { key: 'auditory',  label: 'Auditory',  desc: 'Listen & discuss' },
                ].map(({ key, label, desc }) => (
                  <button key={key} onClick={() => setLearningStyle(key)}
                    className={`text-left px-3 py-2.5 rounded-xl border-2 transition-all ${learningStyle === key ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950' : 'border-slate-200 dark:border-slate-700'}`}>
                    <p className={`text-sm font-semibold ${learningStyle === key ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{label}</p>
                    <p className="text-xs text-slate-400">{desc}</p>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Preferred Study Time</label>
              <div className="flex gap-2 flex-wrap">
                {['Morning','Afternoon','Evening','Night'].map(t => (
                  <button key={t} onClick={() => setPreferredStudyTime(t)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${preferredStudyTime === t ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'border-slate-200 dark:border-slate-700 text-slate-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <Button loading={saving} onClick={saveProfile}>Save Study Profile</Button>
          </div>
        </div>

        {/* XP & Badges */}
        {stats && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-slate-500" />
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Level & Badges</h2>
            </div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">Level {stats.level}</span>
              <span className="text-xs text-slate-400">{stats.xpProgress.current} / {stats.xpProgress.needed} XP</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
                style={{ width: `${Math.min(100, Math.round((stats.xpProgress.current / stats.xpProgress.needed) * 100))}%` }}
              />
            </div>
            {stats.badges.length === 0 ? (
              <p className="text-sm text-slate-400">No badges yet — keep studying!</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {stats.badges.map(b => (
                  <div key={b.key} title={b.desc} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950">
                    <span className="text-xl">{b.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{b.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Appearance */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <Moon className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Appearance</h2>
          </div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Theme</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { key: 'light',  icon: Sun,     label: 'Light'  },
              { key: 'dark',   icon: Moon,    label: 'Dark'   },
              { key: 'system', icon: Monitor, label: 'System' },
            ] as { key: ThemePreference; icon: typeof Sun; label: string }[]).map(({ key, icon: Icon, label }) => (
              <button key={key} onClick={() => handleThemeChange(key)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                  themePref === key
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-600'
                    : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'
                }`}>
                <Icon className="w-5 h-5" />
                {label}
              </button>
            ))}
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

        {/* Promo Code */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <Tag className="w-4 h-4 text-slate-500" />
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Promo Code</h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Have a promo code? Enter it below to unlock discounts or free Premium days.</p>
          <div className="flex gap-2">
            <input
              value={promoCode}
              onChange={e => setPromoCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === 'Enter' && redeemPromo()}
              placeholder="e.g. SUMMER2026"
              maxLength={32}
              className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <Button loading={promoLoading} onClick={redeemPromo} disabled={!promoCode.trim()}>
              Apply
            </Button>
          </div>
          {promoResult && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
              <span className="text-green-500 mt-0.5">✓</span>
              <p className="text-sm font-medium text-green-700 dark:text-green-300">{promoResult.benefit}</p>
            </div>
          )}
        </div>

        {/* Data export */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold text-slate-900 dark:text-slate-100">Export My Data</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">Download all your decks, cards, study sessions, and tasks as a JSON file.</p>
          <Button variant="ghost" size="sm" onClick={() => window.location.href = '/api/export/all'}>Download My Data</Button>
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
