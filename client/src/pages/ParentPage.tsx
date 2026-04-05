import { useState, useEffect } from 'react';
import { Users, Plus, Check, X, Flame, Trophy, BookOpen } from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';
import { apiFetch } from '../lib/api';
import { levelFromXP } from '../lib/xp';
import toast from 'react-hot-toast';

interface ChildLink {
  id: number;
  status: string;
  child: {
    id: number;
    displayName: string;
    email: string;
    xp: number;
    streak: number;
    totalCardsLearned: number;
    lastStudyDate: string | null;
    badges: string;
  };
}

interface ParentRequest {
  id: number;
  parent: { id: number; displayName: string; email: string };
}

interface ChildProgress {
  child: { displayName: string; xp: number; streak: number; totalCardsLearned: number; gradeLevel: string | null; schoolType: string | null };
  stats: { totalCards30d: number; studyDays30d: number; deckCount: number; sessionsCount: number };
}

export default function ParentPage() {
  const [links, setLinks] = useState<ChildLink[]>([]);
  const [requests, setRequests] = useState<ParentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [childEmail, setChildEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [selectedChild, setSelectedChild] = useState<number | null>(null);
  const [progress, setProgress] = useState<ChildProgress | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    Promise.all([
      apiFetch<{ links: ChildLink[] }>('/parent/links'),
      apiFetch<{ requests: ParentRequest[] }>('/parent/requests'),
    ]).then(([l, r]) => {
      setLinks(l.links);
      setRequests(r.requests);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  async function sendLink() {
    if (!childEmail.trim()) return;
    setLinking(true);
    try {
      await apiFetch('/parent/link', { method: 'POST', body: JSON.stringify({ childEmail }) });
      toast.success('Link request sent — ask your child to accept it in their account.');
      setChildEmail('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLinking(false);
    }
  }

  async function respondToRequest(id: number, action: 'accept' | 'reject') {
    try {
      await apiFetch(`/parent/link/${id}`, { method: 'PUT', body: JSON.stringify({ action }) });
      setRequests(prev => prev.filter(r => r.id !== id));
      if (action === 'accept') {
        toast.success('Parent link accepted');
        // Reload links
        apiFetch<{ links: ChildLink[] }>('/parent/links').then(d => setLinks(d.links)).catch(() => {});
      } else {
        toast.success('Request declined');
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    }
  }

  async function viewProgress(childId: number) {
    setSelectedChild(childId);
    setProgressLoading(true);
    try {
      const d = await apiFetch<ChildProgress>(`/parent/child/${childId}/progress`);
      setProgress(d);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load progress');
      setSelectedChild(null);
    } finally {
      setProgressLoading(false);
    }
  }

  if (loading) return <AppLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-950 rounded-2xl flex items-center justify-center">
            <Users className="w-5 h-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Parent Dashboard</h1>
        </div>

        {/* Pending requests (child view) */}
        {requests.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950 rounded-2xl border border-amber-200 dark:border-amber-800 p-5 mb-5">
            <h2 className="font-bold text-amber-800 dark:text-amber-300 mb-3">Parent link requests</h2>
            {requests.map(r => (
              <div key={r.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{r.parent.displayName}</p>
                  <p className="text-xs text-slate-500">{r.parent.email}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => respondToRequest(r.id, 'accept')} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors">
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button onClick={() => respondToRequest(r.id, 'reject')} className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold transition-colors">
                    <X className="w-3.5 h-3.5" /> Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Link a child */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 mb-5">
          <h2 className="font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Link a child's account
          </h2>
          <p className="text-xs text-slate-500 mb-3">Enter your child's email address. They'll receive a request to approve.</p>
          <div className="flex gap-2">
            <Input label="" value={childEmail} onChange={e => setChildEmail(e.target.value)} placeholder="child@example.com" className="flex-1" />
            <Button loading={linking} onClick={sendLink} disabled={!childEmail.trim()}>Send Request</Button>
          </div>
        </div>

        {/* Linked children */}
        {links.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No linked children yet</p>
            <p className="text-sm mt-1">Send a link request using your child's email above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {links.map(link => (
              <div key={link.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {link.child.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{link.child.displayName}</p>
                      <p className="text-xs text-slate-400">{link.child.email}</p>
                      {link.status === 'pending' && <span className="text-xs text-amber-600 font-medium">Awaiting approval</span>}
                    </div>
                  </div>
                  {link.status === 'accepted' && (
                    <Button size="sm" onClick={() => viewProgress(link.child.id)}>View Progress</Button>
                  )}
                </div>

                {/* Quick stats for accepted links */}
                {link.status === 'accepted' && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><Trophy className="w-3 h-3 text-indigo-500" /> Lv {levelFromXP(link.child.xp)} · {link.child.xp} XP</span>
                    {link.child.streak >= 3 && <span className="flex items-center gap-1 text-orange-500"><Flame className="w-3 h-3" /> {link.child.streak} day streak</span>}
                    <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {link.child.totalCardsLearned} cards studied</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Child progress panel */}
        {selectedChild && (
          <div className="mt-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900 dark:text-slate-100">Last 30 days</h2>
              <button onClick={() => { setSelectedChild(null); setProgress(null); }} className="text-xs text-slate-400 hover:text-slate-600">Close</button>
            </div>
            {progressLoading ? (
              <div className="flex justify-center py-6"><Spinner size="md" /></div>
            ) : progress ? (
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Cards studied', value: progress.stats.totalCards30d },
                  { label: 'Study days',    value: progress.stats.studyDays30d },
                  { label: 'Sessions',      value: progress.stats.sessionsCount },
                  { label: 'Decks created', value: progress.stats.deckCount },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-center">
                    <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{value}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
