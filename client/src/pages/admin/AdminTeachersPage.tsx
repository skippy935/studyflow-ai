import { useState, useEffect } from 'react';
import { GraduationCap, CheckCircle, XCircle, Clock, RefreshCw, User, School, Zap, Shield } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const BASE = '/api/admin/teachers';

function adminHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
  };
}

interface TeacherProfile {
  id: number;
  userId: number;
  schoolName: string;
  bundesland: string;
  verificationStatus: string;
  subjects: string;
  rejectionReason: string;
  approvedAt: string | null;
  createdAt: string;
  user: { id: number; email: string; displayName: string; createdAt: string; lastLogin?: string };
  _count?: { classes: number; materials: number };
}

export default function AdminTeachersPage() {
  const [tab, setTab]                 = useState<'pending' | 'all'>('pending');
  const [profiles, setProfiles]       = useState<TeacherProfile[]>([]);
  const [loading, setLoading]         = useState(true);
  const [actionId, setActionId]       = useState<number | null>(null);
  const [rejectModal, setRejectModal] = useState<TeacherProfile | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);
  const [modeLoading, setModeLoading] = useState(false);

  useEffect(() => { load(); loadMode(); }, [tab]);

  async function loadMode() {
    try {
      const res = await fetch(`${BASE}/approval-mode`, { headers: adminHeaders() });
      const data = await res.json();
      setAutoApprove(data.autoApprove ?? false);
    } catch {}
  }

  async function toggleMode() {
    setModeLoading(true);
    const next = !autoApprove;
    try {
      const res = await fetch(`${BASE}/approval-mode`, {
        method: 'POST', headers: adminHeaders(),
        body: JSON.stringify({ autoApprove: next }),
      });
      if (!res.ok) throw new Error();
      setAutoApprove(next);
      toast.success(next ? '⚡ Auto-approval ON — teachers approved instantly' : '🛡️ Manual approval ON — admin review required');
    } catch { toast.error('Failed to update mode'); }
    finally { setModeLoading(false); }
  }

  async function load() {
    setLoading(true);
    try {
      const url = tab === 'pending' ? `${BASE}/pending` : `${BASE}`;
      const res = await fetch(url, { headers: adminHeaders() });
      const data = await res.json();
      setProfiles(data.profiles || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  async function approve(profile: TeacherProfile) {
    setActionId(profile.id);
    try {
      const res = await fetch(`${BASE}/${profile.id}/approve`, { method: 'POST', headers: adminHeaders() });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`✅ ${profile.user.displayName} approved`);
      setProfiles(prev => prev.filter(p => p.id !== profile.id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setActionId(null); }
  }

  async function reject() {
    if (!rejectModal || !rejectReason.trim()) { toast.error('Reason required'); return; }
    setActionId(rejectModal.id);
    try {
      const res = await fetch(`${BASE}/${rejectModal.id}/reject`, {
        method: 'POST', headers: adminHeaders(),
        body: JSON.stringify({ reason: rejectReason }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast.success(`❌ ${rejectModal.user.displayName} rejected`);
      setProfiles(prev => prev.filter(p => p.id !== rejectModal.id));
      setRejectModal(null);
      setRejectReason('');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally { setActionId(null); }
  }

  const statusColors: Record<string, string> = {
    pending:          'text-slate-500  bg-slate-100  dark:bg-slate-800',
    pending_approval: 'text-amber-600  bg-amber-50   dark:bg-amber-950',
    approved:         'text-emerald-600 bg-emerald-50 dark:bg-emerald-950',
    rejected:         'text-red-600    bg-red-50     dark:bg-red-950',
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-violet-600" /> Lehrer-Genehmigungen
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">Manuelle Verifizierung von Lehrer-Konten</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Approval mode toggle */}
            <button
              onClick={toggleMode}
              disabled={modeLoading}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all ${
                autoApprove
                  ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400'
                  : 'bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400'
              } disabled:opacity-50`}
            >
              {autoApprove
                ? <><Zap className="w-4 h-4" /> Auto-Approval: ON</>
                : <><Shield className="w-4 h-4" /> Manual Approval: ON</>}
            </button>
            <button onClick={load} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <RefreshCw className="w-4 h-4" /> Aktualisieren
            </button>
          </div>
        </div>

        {/* Mode banner */}
        <div className={`rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2 ${
          autoApprove
            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400'
            : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
        }`}>
          {autoApprove
            ? <><Zap className="w-4 h-4 flex-shrink-0" /> <span><strong>Auto-Approval is ON.</strong> Teachers are approved instantly when they complete their profile. No manual review needed.</span></>
            : <><Shield className="w-4 h-4 flex-shrink-0" /> <span><strong>Manual Approval is ON.</strong> Teachers appear in this queue after completing their profile. Approve or reject each one below.</span></>}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-6 w-fit">
          {(['pending', 'all'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-500'}`}>
              {t === 'pending' ? '⏳ Ausstehend' : '📋 Alle'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">Keine ausstehenden Anträge</p>
          </div>
        ) : (
          <div className="space-y-4">
            {profiles.map(profile => {
              const subjectList: string[] = (() => { try { return JSON.parse(profile.subjects); } catch { return []; } })();
              const since = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 3600));
              const isOverdue = since > 24;

              return (
                <div key={profile.id} className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-5 ${isOverdue && profile.verificationStatus !== 'approved' ? 'border-amber-200 dark:border-amber-800' : 'border-slate-100 dark:border-slate-800'}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                    {/* Avatar */}
                    <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="font-bold text-violet-600">{profile.user.displayName[0]?.toUpperCase()}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100">{profile.user.displayName}</span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColors[profile.verificationStatus] || 'text-slate-500 bg-slate-100'}`}>
                          {profile.verificationStatus === 'pending_approval' ? '⏳ Ausstehend'
                            : profile.verificationStatus === 'approved' ? '✅ Genehmigt'
                            : profile.verificationStatus === 'rejected' ? '❌ Abgelehnt'
                            : '📝 Unvollständig'}
                        </span>
                        {isOverdue && profile.verificationStatus === 'pending_approval' && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950 text-red-600">
                            ⚠️ {since}h ausstehend
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> {profile.user.email}</span>
                        <span className="flex items-center gap-1"><School className="w-3 h-3" /> {profile.schoolName || '—'}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(profile.user.createdAt).toLocaleDateString('de-DE')}</span>
                        {profile.bundesland && <span>📍 {profile.bundesland}</span>}
                      </div>

                      {subjectList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {subjectList.map(s => (
                            <span key={s} className="text-xs bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      )}

                      {profile.rejectionReason && (
                        <div className="bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs rounded-lg px-3 py-2 mb-3">
                          <span className="font-semibold">Ablehnung: </span>{profile.rejectionReason}
                        </div>
                      )}

                      {tab === 'all' && profile._count && (
                        <div className="text-xs text-slate-400">
                          {profile._count.classes} Klassen · {profile._count.materials} Materialien
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {profile.verificationStatus === 'pending_approval' && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => approve(profile)}
                          disabled={actionId === profile.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          {actionId === profile.id ? '...' : 'Genehmigen'}
                        </button>
                        <button
                          onClick={() => { setRejectModal(profile); setRejectReason(''); }}
                          disabled={actionId === profile.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950 text-red-600 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 border border-red-200 dark:border-red-800"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Ablehnen
                        </button>
                      </div>
                    )}

                    {profile.verificationStatus === 'approved' && (
                      <span className="flex items-center gap-1 text-emerald-600 text-xs font-semibold flex-shrink-0">
                        <CheckCircle className="w-4 h-4" /> Genehmigt
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reject modal */}
        {rejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 p-6 w-full max-w-md">
              <h2 className="font-extrabold text-slate-900 dark:text-slate-100 mb-1">Antrag ablehnen</h2>
              <p className="text-sm text-slate-500 mb-4">{rejectModal.user.displayName} ({rejectModal.user.email})</p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Begründung der Ablehnung (wird dem Lehrer angezeigt)..."
                rows={4}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
              />
              <div className="flex gap-2">
                <button onClick={() => setRejectModal(null)} className="flex-1 px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 transition-colors">
                  Abbrechen
                </button>
                <button
                  onClick={reject}
                  disabled={!rejectReason.trim() || actionId === rejectModal.id}
                  className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-xl transition-colors disabled:opacity-50"
                >
                  {actionId === rejectModal.id ? 'Wird abgelehnt...' : 'Endgültig ablehnen'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
