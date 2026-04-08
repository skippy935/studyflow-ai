import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Ban, Zap, BookOpen, Brain, FileText, Clock,
  Activity, Shield, CheckCircle, XCircle, Trash2,
} from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

type Tab = 'overview' | 'decks' | 'quizzes' | 'examiner' | 'activity' | 'ai';

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('overview');

  // Modals
  const [banModal, setBanModal] = useState<'ban' | 'unban' | null>(null);
  const [xpModal, setXpModal] = useState(false);
  const [aiModal, setAiModal] = useState<'disable' | 'enable' | null>(null);
  const [reason, setReason] = useState('');
  const [xpAmount, setXpAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    adminFetch(`/users/${id}`)
      .then(setUser)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function deleteAccount() {
    setSaving(true);
    try {
      await adminFetch(`/users/${id}`, { method: 'DELETE' });
      toast.success('Account permanently deleted');
      navigate('/admin/users');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function action(endpoint: string, body: object) {
    setSaving(true);
    try {
      await adminFetch(`/users/${id}/${endpoint}`, { method: 'POST', body: JSON.stringify(body) });
      const updated = await adminFetch(`/users/${id}`);
      setUser(updated);
      toast.success('Done');
      setBanModal(null); setXpModal(false); setAiModal(null);
      setReason(''); setXpAmount(0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
    </AdminLayout>
  );

  if (!user) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64" style={{ color: 'var(--danger)' }}>User not found</div>
    </AdminLayout>
  );

  const tierColor: Record<string, string> = {
    free: 'var(--text-secondary)',
    premium: 'var(--accent-purple)',
    school: 'var(--accent-cyan)',
  };

  const totalStudySessions = user.studySessions?.length ?? 0;
  const totalCardsStudied = user.studySessions?.reduce((s: number, ss: any) => s + ss.cardsStudied, 0) ?? 0;
  const totalAiCost = user.aiUsageLogs?.reduce((s: number, l: any) => s + (l.costUsd ?? 0), 0) ?? 0;
  const completedExams = user.examinerSessions?.filter((s: any) => s.completed).length ?? 0;

  const tabs: { key: Tab; label: string; icon: any; count?: number }[] = [
    { key: 'overview', label: 'Overview', icon: Activity },
    { key: 'decks', label: 'Decks', icon: BookOpen, count: user.decks?.length },
    { key: 'quizzes', label: 'Quizzes', icon: Brain, count: user.quizzes?.length },
    { key: 'examiner', label: 'Exams', icon: Shield, count: user.examinerSessions?.length },
    { key: 'activity', label: 'Study Activity', icon: Clock, count: totalStudySessions },
    { key: 'ai', label: 'AI Usage', icon: FileText, count: user.aiUsageLogs?.length },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Back button */}
        <button onClick={() => navigate('/admin/users')}
          className="flex items-center gap-2 text-sm hover:opacity-80 transition-opacity"
          style={{ color: 'var(--text-secondary)' }}>
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>

        {/* User header */}
        <div style={card} className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0"
                style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent-purple)' }}>
                {(user.displayName || user.email)[0].toUpperCase()}
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
                  {user.displayName || '(no name)'}
                </h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${tierColor[user.subscriptionTier] ?? 'var(--text-secondary)'}20`, color: tierColor[user.subscriptionTier] ?? 'var(--text-secondary)' }}>
                    {user.subscriptionTier}
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-purple)' }}>
                    {user.userType ?? 'student'}
                  </span>
                  {user.isBanned && (
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--danger)' }}>Banned</span>
                  )}
                  {user.isMinor && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>Minor</span>
                  )}
                  {user.aiAccessDisabled && (
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>AI Disabled</span>
                  )}
                  {user.emailVerified ? (
                    <span title="Email verified"><CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} /></span>
                  ) : (
                    <span title="Email not verified"><XCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} /></span>
                  )}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 flex-shrink-0">
              <button
                onClick={() => { setBanModal(user.isBanned ? 'unban' : 'ban'); setReason(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{
                  background: user.isBanned ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                  color: user.isBanned ? 'var(--success)' : 'var(--danger)',
                  border: `1px solid ${user.isBanned ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                }}>
                <Ban className="w-3.5 h-3.5" />
                {user.isBanned ? 'Unban' : 'Ban'}
              </button>
              <button
                onClick={() => { setXpModal(true); setReason(''); setXpAmount(0); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <Zap className="w-3.5 h-3.5" /> Adjust XP
              </button>
              <button
                onClick={() => { setAiModal(user.aiAccessDisabled ? 'enable' : 'disable'); setReason(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-purple)', border: '1px solid rgba(124,58,237,0.3)' }}>
                <Brain className="w-3.5 h-3.5" />
                {user.aiAccessDisabled ? 'Enable AI' : 'Disable AI'}
              </button>
              <button
                onClick={() => { setDeleteModal(true); setDeleteConfirmText(''); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.4)' }}>
                <Trash2 className="w-3.5 h-3.5" /> Delete Account
              </button>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
            {[
              { label: 'XP', value: (user.xp ?? 0).toLocaleString(), color: 'var(--accent-cyan)' },
              { label: 'Streak', value: `${user.streak ?? 0}d`, color: 'var(--warning)' },
              { label: 'Cards Studied', value: totalCardsStudied.toLocaleString(), color: 'var(--success)' },
              { label: 'AI Cost', value: `$${totalAiCost.toFixed(4)}`, color: 'var(--accent-purple)' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold font-mono" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto" style={{ ...card, padding: '6px' }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
              style={{
                background: tab === t.key ? 'rgba(124,58,237,0.2)' : 'transparent',
                color: tab === t.key ? 'var(--accent-purple)' : 'var(--text-secondary)',
              }}>
              <t.icon className="w-3.5 h-3.5" />
              {t.label}
              {t.count !== undefined && (
                <span className="px-1.5 py-0.5 rounded-full text-xs"
                  style={{ background: 'rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Member since', value: new Date(user.createdAt).toLocaleDateString('en-GB') },
              { label: 'Last login', value: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('en-GB') : 'Never' },
              { label: 'Email verified', value: user.emailVerified ? 'Yes' : 'No' },
              { label: 'Subscription', value: user.subscriptionTier },
              { label: 'Decks created', value: user.decks?.length ?? 0 },
              { label: 'Quizzes created', value: user.quizzes?.length ?? 0 },
              { label: 'Summaries', value: user.summaries?.length ?? 0 },
              { label: 'Exam sessions', value: `${completedExams} completed / ${user.examinerSessions?.length ?? 0} total` },
              { label: 'Total study sessions', value: totalStudySessions },
              { label: 'Total cards studied', value: totalCardsStudied.toLocaleString() },
              { label: 'AI tokens used today', value: (user.aiTokenBudget?.tokensUsedToday ?? 0).toLocaleString() },
              { label: 'AI tokens this month', value: (user.aiTokenBudget?.tokensUsedThisMonth ?? 0).toLocaleString() },
            ].map(row => (
              <div key={row.label} style={card} className="px-4 py-3 flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{String(row.value)}</span>
              </div>
            ))}
          </div>
        )}

        {tab === 'decks' && (
          <div style={card} className="overflow-x-auto">
            {user.decks?.length === 0 ? (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>No decks yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Deck Name', 'Cards', 'Sessions', 'Created'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {user.decks?.map((deck: any) => (
                    <tr key={deck.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: deck.color ?? '#4F46E5' }} />
                          <span style={{ color: 'var(--text-primary)' }}>{deck.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--accent-cyan)' }}>{deck._count?.cards ?? 0}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{deck._count?.studySessions ?? 0}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(deck.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'quizzes' && (
          <div style={card} className="overflow-x-auto">
            {user.quizzes?.length === 0 ? (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>No quizzes yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Title', 'Topic', 'Questions', 'Created'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {user.quizzes?.map((q: any) => (
                    <tr key={q.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{q.title}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{q.topic}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--accent-cyan)' }}>{q._count?.questions ?? 0}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(q.createdAt).toLocaleDateString('en-GB')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'examiner' && (
          <div className="space-y-3">
            {user.examinerSessions?.length === 0 ? (
              <div style={{ ...card, color: 'var(--text-secondary)' }} className="p-12 text-center text-sm">No exam sessions yet</div>
            ) : user.examinerSessions?.map((s: any) => {
              const gap = s.gapAnalysis as any;
              return (
                <div key={s.id} style={card} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{s.materialName}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-purple)' }}>{s.difficulty}</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.exchangeCount} exchanges</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(s.createdAt).toLocaleDateString('en-GB')}</span>
                        {s.completed ? (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)' }}>Completed</span>
                        ) : (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>In progress</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {gap && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>Solid</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{(gap.solid ?? []).join(', ') || '—'}</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <p className="text-xs font-semibold" style={{ color: 'var(--warning)' }}>Shaky</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{(gap.shaky ?? []).join(', ') || '—'}</p>
                      </div>
                      <div className="p-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)' }}>
                        <p className="text-xs font-semibold" style={{ color: 'var(--danger)' }}>Gaps</p>
                        <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{(gap.gaps ?? []).join(', ') || '—'}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === 'activity' && (
          <div style={card} className="overflow-x-auto">
            {user.studySessions?.length === 0 ? (
              <p className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>No study activity yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Date', 'Cards Studied', 'Again', 'Hard', 'Good', 'Easy'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {user.studySessions?.map((ss: any) => (
                    <tr key={ss.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(ss.studiedAt).toLocaleDateString('en-GB')}</td>
                      <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--accent-cyan)' }}>{ss.cardsStudied}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--danger)' }}>{ss.againCount}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--warning)' }}>{ss.hardCount}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--accent-cyan)' }}>{ss.goodCount}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--success)' }}>{ss.easyCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === 'ai' && (
          <div className="space-y-4">
            {/* Budget */}
            {user.aiTokenBudget && (
              <div style={card} className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Tokens today', value: (user.aiTokenBudget.tokensUsedToday ?? 0).toLocaleString(), limit: user.aiTokenBudget.dailyTokenLimit },
                  { label: 'Tokens this month', value: (user.aiTokenBudget.tokensUsedThisMonth ?? 0).toLocaleString(), limit: user.aiTokenBudget.monthlyTokenLimit },
                  { label: 'Daily limit', value: (user.aiTokenBudget.dailyTokenLimit ?? 0).toLocaleString() },
                  { label: 'Monthly limit', value: (user.aiTokenBudget.monthlyTokenLimit ?? 0).toLocaleString() },
                ].map(stat => (
                  <div key={stat.label}>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</p>
                    <p className="text-lg font-bold font-mono mt-1" style={{ color: 'var(--accent-cyan)' }}>{stat.value}</p>
                    {stat.limit && (
                      <div className="mt-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-full rounded-full" style={{
                          width: `${Math.min(100, (parseInt(stat.value.replace(/,/g, '')) / stat.limit) * 100)}%`,
                          background: 'var(--accent-cyan)',
                        }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Usage log */}
            <div style={card} className="overflow-x-auto">
              {user.aiUsageLogs?.length === 0 ? (
                <p className="text-center py-12 text-sm" style={{ color: 'var(--text-secondary)' }}>No AI usage yet</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                      {['Date', 'Feature', 'Model', 'Tokens In', 'Tokens Out', 'Cost'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {user.aiUsageLogs?.map((log: any) => (
                      <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-2 text-xs" style={{ color: 'var(--text-secondary)' }}>{new Date(log.createdAt).toLocaleDateString('en-GB')}</td>
                        <td className="px-4 py-2 text-xs">
                          <span className="px-2 py-0.5 rounded-full" style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-purple)' }}>{log.feature}</span>
                        </td>
                        <td className="px-4 py-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{log.model?.split('-').slice(-2).join('-')}</td>
                        <td className="px-4 py-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{(log.inputTokens ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{(log.outputTokens ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-2 text-xs font-mono" style={{ color: 'var(--accent-cyan)' }}>${(log.costUsd ?? 0).toFixed(5)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ban / Unban modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div style={{ ...card, maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {banModal === 'ban' ? 'Ban User' : 'Unban User'}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Reason (required)…" rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <div className="flex gap-3">
              <button onClick={() => setBanModal(null)} className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={() => action(banModal, { reason })} disabled={!reason.trim() || saving}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: banModal === 'ban' ? 'var(--danger)' : 'var(--success)' }}>
                {saving ? '…' : banModal === 'ban' ? 'Ban' : 'Unban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XP modal */}
      {xpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div style={{ ...card, maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Adjust XP</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{user.email} — current: {user.xp} XP</p>
            <input type="number" value={xpAmount} onChange={e => setXpAmount(parseInt(e.target.value) || 0)}
              placeholder="Amount (+/-)"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Reason (required)…" rows={2}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <div className="flex gap-3">
              <button onClick={() => setXpModal(false)} className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={() => action('adjust-xp', { amount: xpAmount, reason })} disabled={!reason.trim() || saving}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--warning)' }}>
                {saving ? '…' : 'Apply'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI access modal */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div style={{ ...card, maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {aiModal === 'disable' ? 'Disable AI Access' : 'Enable AI Access'}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="Reason (required)…" rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <div className="flex gap-3">
              <button onClick={() => setAiModal(null)} className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={() => action('disable-ai', { disabled: aiModal === 'disable', reason })} disabled={!reason.trim() || saving}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: aiModal === 'disable' ? 'var(--danger)' : 'var(--success)' }}>
                {saving ? '…' : aiModal === 'disable' ? 'Disable AI' : 'Enable AI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete account modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)' }}>
          <div style={{ ...card, maxWidth: '420px', width: '100%', padding: '24px', border: '1px solid rgba(239,68,68,0.4)' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(239,68,68,0.15)' }}>
                <Trash2 className="w-5 h-5" style={{ color: 'var(--danger)' }} />
              </div>
              <div>
                <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Delete Account</h2>
                <p className="text-xs" style={{ color: 'var(--danger)' }}>This cannot be undone</p>
              </div>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              Permanently deletes <strong style={{ color: 'var(--text-primary)' }}>{user.email}</strong> and all their data — decks, cards, quizzes, summaries, exam sessions, study history, and AI usage logs.
            </p>
            <p className="text-xs mb-2 font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Type <span style={{ color: 'var(--danger)' }}>DELETE</span> to confirm
            </p>
            <input
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4 font-mono"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: 'var(--danger)' }}
            />
            <div className="flex gap-3">
              <button onClick={() => setDeleteModal(false)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={deleteAccount} disabled={deleteConfirmText !== 'DELETE' || saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-40"
                style={{ background: 'var(--danger)' }}>
                {saving ? 'Deleting…' : 'Delete Forever'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
