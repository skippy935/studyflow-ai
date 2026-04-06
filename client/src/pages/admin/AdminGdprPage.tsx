import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Search, AlertTriangle, Download, Trash2 } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

type Tab = 'minors' | 'consent' | 'erasure';

export default function AdminGdprPage() {
  const [tab, setTab] = useState<Tab>('minors');
  const [minors, setMinors] = useState<any[]>([]);
  const [flaggedIds, setFlaggedIds] = useState<number[]>([]);
  const [consent, setConsent] = useState<any[]>([]);
  const [consentFilter, setConsentFilter] = useState('');
  const [searchId, setSearchId] = useState('');
  const [preview, setPreview] = useState<any | null>(null);
  const [eraseReason, setEraseReason] = useState('');
  const [erasing, setErasing] = useState(false);

  useEffect(() => {
    if (tab === 'minors') {
      adminFetch('/gdpr/minors').then(d => { setMinors(d.minors); setFlaggedIds(d.flagged); }).catch(e => toast.error(e.message));
    }
    if (tab === 'consent') {
      const params = consentFilter ? `?filter=${consentFilter}` : '';
      adminFetch(`/gdpr/consent${params}`).then(setConsent).catch(e => toast.error(e.message));
    }
  }, [tab, consentFilter]);

  async function searchUser() {
    if (!searchId.trim()) return;
    try {
      const data = await adminFetch(`/gdpr/user-preview/${searchId.trim()}`);
      setPreview(data);
      setEraseReason('');
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function eraseUser() {
    if (!preview || !eraseReason.trim()) return;
    if (!confirm(`IRREVERSIBLE: Anonymize user ${preview.email}?`)) return;
    setErasing(true);
    try {
      const cert = await adminFetch(`/gdpr/erase/${preview.userId}`, {
        method: 'POST',
        body: JSON.stringify({ reason: eraseReason }),
      });
      toast.success('User anonymized. Certificate generated.');
      console.log('Erasure certificate:', cert);
      setPreview(null);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setErasing(false);
    }
  }

  async function exportUserData(userId: number) {
    window.location.href = `/api/admin/gdpr/export-data/${userId}`;
  }

  async function markConsent(userId: number) {
    try {
      await adminFetch(`/gdpr/minors/${userId}/mark-consent`, { method: 'POST', body: JSON.stringify({ reason: 'Admin manual confirmation' }) });
      toast.success('Consent marked');
      setMinors(prev => prev.map(m => m.id === userId ? { ...m, parentalConsentGiven: true } : m));
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'minors', label: 'Minor Protection' },
    { id: 'consent', label: 'Consent Management' },
    { id: 'erasure', label: 'Right to Erasure (Art. 17)' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
          GDPR / DSGVO Toolkit
        </h1>

        {/* Tabs */}
        <div className="flex gap-2" style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="px-4 py-2.5 text-sm font-medium transition-all"
              style={{
                color: tab === t.id ? 'white' : 'var(--text-secondary)',
                borderBottom: tab === t.id ? '2px solid var(--accent-purple)' : '2px solid transparent',
              }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Minor protection */}
        {tab === 'minors' && (
          <div className="space-y-4">
            {flaggedIds.length > 0 && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
                style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--warning)' }}>
                  {flaggedIds.length} minor{flaggedIds.length > 1 ? 's' : ''} over 7 days old without parental consent
                </p>
              </div>
            )}

            <div style={card} className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['User', 'DOB', 'Parental Consent', 'Consent Date', 'Status', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {minors.map(m => (
                    <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: flaggedIds.includes(m.id) ? 'rgba(245,158,11,0.05)' : undefined }}>
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.displayName || '(no name)'}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{m.email}</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {m.dateOfBirth ? new Date(m.dateOfBirth).toLocaleDateString('de-DE') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{
                            background: m.parentalConsentGiven ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                            color: m.parentalConsentGiven ? 'var(--success)' : 'var(--danger)',
                          }}>
                          {m.parentalConsentGiven ? 'Given' : 'Missing'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {m.parentalConsentDate ? new Date(m.parentalConsentDate).toLocaleDateString('de-DE') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {flaggedIds.includes(m.id) && (
                          <span className="text-xs px-2 py-0.5 rounded-full animate-pulse"
                            style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--warning)' }}>
                            ⚠ Flagged
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!m.parentalConsentGiven && (
                          <button onClick={() => markConsent(m.id)}
                            className="text-xs font-semibold hover:opacity-80"
                            style={{ color: 'var(--success)' }}>
                            Mark Received
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {minors.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No minors found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Consent management */}
        {tab === 'consent' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              {[
                { value: '', label: 'All' },
                { value: 'missing_parental', label: 'Missing Parental Consent' },
                { value: 'no_marketing', label: 'No Marketing' },
              ].map(f => (
                <button key={f.value} onClick={() => setConsentFilter(f.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                  style={{
                    background: consentFilter === f.value ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)',
                    color: consentFilter === f.value ? 'white' : 'var(--text-secondary)',
                    border: '1px solid var(--border)',
                  }}>
                  {f.label}
                </button>
              ))}
            </div>

            <div style={card} className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['User', 'Terms', 'Marketing', 'Analytics', 'Parental', 'Version', 'IP'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {consent.map(u => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3">
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{u.email}</p>
                      </td>
                      {[u.consentTerms, u.consentMarketing, u.consentAnalytics, u.parentalConsentGiven].map((v, i) => (
                        <td key={i} className="px-4 py-3">
                          <span className="text-xs px-1.5 py-0.5 rounded"
                            style={{ background: v ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.15)', color: v ? 'var(--success)' : 'var(--danger)' }}>
                            {v ? '✓' : '✗'}
                          </span>
                        </td>
                      ))}
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{u.consentVersion}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{u.consentIp ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Right to erasure */}
        {tab === 'erasure' && (
          <div className="space-y-5">
            <div style={card} className="p-6">
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Search User</h2>
              <div className="flex gap-3">
                <input
                  value={searchId}
                  onChange={e => setSearchId(e.target.value)}
                  placeholder="User ID or email…"
                  className="flex-1 px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                />
                <button onClick={searchUser}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--accent-purple)' }}>
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {preview && (
              <div style={{ ...card, border: preview.isAlreadyAnonymized ? '1px solid var(--success)' : '1px solid rgba(239,68,68,0.4)' }} className="p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{preview.email}</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>ID: {preview.userId} — {preview.displayName}</p>
                  </div>
                  {preview.isAlreadyAnonymized && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--success)' }}>
                      Already anonymized
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Decks', value: preview.decks },
                    { label: 'Study Sessions', value: preview.studySessions },
                    { label: 'Examiner Sessions', value: preview.examinerSessions },
                    { label: 'AI Usage Logs', value: preview.aiUsageLogs },
                    { label: 'Family Links', value: preview.parentLinks },
                  ].map(item => (
                    <div key={item.label} className="text-center p-3 rounded-xl"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <p className="text-lg font-bold font-mono" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="text-xs p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>PII fields to anonymize:</strong> {preview.piiFields?.join(', ')}
                </div>

                {!preview.isAlreadyAnonymized && (
                  <div className="space-y-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex gap-3">
                      <button onClick={() => exportUserData(preview.userId)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.3)' }}>
                        <Download className="w-4 h-4" /> Export First (Art. 20)
                      </button>
                    </div>
                    <textarea
                      value={eraseReason}
                      onChange={e => setEraseReason(e.target.value)}
                      placeholder="Erasure reason (required) — e.g. 'User request via email 2026-04-06'"
                      rows={2}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                    <button
                      onClick={eraseUser}
                      disabled={erasing || !eraseReason.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                      style={{ background: 'var(--danger)' }}>
                      <Trash2 className="w-4 h-4" />
                      {erasing ? 'Anonymizing…' : 'Anonymize User (IRREVERSIBLE)'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
