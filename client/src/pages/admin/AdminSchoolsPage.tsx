import { useEffect, useState, useCallback } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Search, Plus, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

type Tab = 'schools' | 'teachers';

export default function AdminSchoolsPage() {
  const [tab, setTab] = useState<Tab>('schools');
  const [schools, setSchools] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<any | null>(null);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [createModal, setCreateModal] = useState(false);
  const [newSchool, setNewSchool] = useState({ name: '', city: '', state: '', schoolType: '', contactName: '', contactEmail: '', licenseSeats: 0 });
  const [saving, setSaving] = useState(false);
  const [verifyModal, setVerifyModal] = useState<{ item: any; type: 'school' | 'teacher' } | null>(null);
  const [verifyReason, setVerifyReason] = useState('');
  const [verifyStatus, setVerifyStatus] = useState<'verified' | 'rejected'>('verified');

  const fetchSchools = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (q) params.set('q', q);
    if (statusFilter) params.set('status', statusFilter);
    try {
      const data = await adminFetch(`/schools?${params}`);
      setSchools(data.schools);
      setTotal(data.total);
    } catch (err: any) { toast.error(err.message); }
  }, [q, page, statusFilter]);

  const fetchTeachers = useCallback(async () => {
    try {
      const data = await adminFetch('/schools/teacher-verification/pending');
      setTeachers(data);
    } catch (err: any) { toast.error(err.message); }
  }, []);

  useEffect(() => { if (tab === 'schools') fetchSchools(); else fetchTeachers(); }, [tab, fetchSchools, fetchTeachers]);

  async function createSchool() {
    setSaving(true);
    try {
      await adminFetch('/schools', { method: 'POST', body: JSON.stringify(newSchool) });
      toast.success('School created');
      setCreateModal(false);
      setNewSchool({ name: '', city: '', state: '', schoolType: '', contactName: '', contactEmail: '', licenseSeats: 0 });
      fetchSchools();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  async function verifySchool(status: 'verified' | 'rejected') {
    if (!verifyModal || !verifyReason.trim()) return;
    setSaving(true);
    try {
      if (verifyModal.type === 'school') {
        await adminFetch(`/schools/${verifyModal.item.id}/verify`, { method: 'PATCH', body: JSON.stringify({ status, reason: verifyReason }) });
        fetchSchools();
      } else {
        await adminFetch(`/schools/teacher-verification/${verifyModal.item.id}`, { method: 'PATCH', body: JSON.stringify({ status, reason: verifyReason }) });
        fetchTeachers();
      }
      toast.success(`${status === 'verified' ? 'Approved' : 'Rejected'}`);
      setVerifyModal(null);
      setVerifyReason('');
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  const statusColor: Record<string, string> = {
    pending: 'var(--warning)', verified: 'var(--success)', rejected: 'var(--danger)',
  };

  const SCHOOL_TYPES = ['Gymnasium', 'Realschule', 'Gesamtschule', 'Hauptschule', 'Grundschule', 'Berufsschule', 'Other'];

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>Schools</h1>
          <button onClick={() => setCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent-purple)' }}>
            <Plus className="w-4 h-4" /> Add School
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
          {[{ id: 'schools', label: 'Schools' }, { id: 'teachers', label: `Teacher Verification${teachers.length ? ` (${teachers.length})` : ''}` }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as Tab)}
              className="px-4 py-2.5 text-sm font-medium transition-all"
              style={{ color: tab === t.id ? 'white' : 'var(--text-secondary)', borderBottom: tab === t.id ? '2px solid var(--accent-purple)' : '2px solid transparent' }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'schools' && (
          <>
            {/* Filters */}
            <div className="flex gap-3">
              <div style={{ ...card, flex: 1 }} className="flex items-center gap-2 px-4 py-2.5">
                <Search className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                <input value={q} onChange={e => { setQ(e.target.value); setPage(1); }}
                  placeholder="Search school name, city, email…"
                  className="flex-1 bg-transparent text-sm outline-none" style={{ color: 'var(--text-primary)' }} />
              </div>
              {['', 'pending', 'verified', 'rejected'].map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
                  className="px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: statusFilter === s ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)', color: statusFilter === s ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                  {s || 'All'}
                </button>
              ))}
            </div>

            {/* Schools table */}
            <div style={card} className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['School', 'Type', 'City', 'Status', 'Seats', 'License Expires', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schools.map(s => (
                    <tr key={s.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                      onClick={() => setSelected(selected?.id === s.id ? null : s)}>
                      <td className="px-4 py-3">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.contactEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{s.schoolType || '—'}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{s.city || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-0.5 rounded-full"
                          style={{ background: `${statusColor[s.verificationStatus] ?? '#666'}20`, color: statusColor[s.verificationStatus] ?? 'var(--text-secondary)' }}>
                          {s.verificationStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{s.licenseSeats}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {s.licenseExpiresAt ? new Date(s.licenseExpiresAt).toLocaleDateString('de-DE') : '—'}
                      </td>
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        {s.verificationStatus === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => { setVerifyModal({ item: s, type: 'school' }); setVerifyStatus('verified'); setVerifyReason(''); }}
                              className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--success)' }} title="Approve">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { setVerifyModal({ item: s, type: 'school' }); setVerifyStatus('rejected'); setVerifyReason(''); }}
                              className="p-1.5 rounded-lg hover:bg-white/10" style={{ color: 'var(--danger)' }} title="Reject">
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {schools.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No schools found</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Expand selected school */}
            {selected && (
              <div style={{ ...card, border: '1px solid rgba(124,58,237,0.3)' }} className="p-5 space-y-3">
                <h2 className="font-bold" style={{ color: 'var(--text-primary)' }}>{selected.name}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Contact', value: selected.contactName || '—' },
                    { label: 'Email', value: selected.contactEmail || '—' },
                    { label: 'State', value: selected.state || '—' },
                    { label: 'Price/seat', value: `€${selected.licensePricePerSeat}` },
                  ].map(item => (
                    <div key={item.label}>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {total > 50 && (
              <div className="flex items-center justify-center gap-3">
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 rounded-xl text-sm disabled:opacity-40"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>Previous</button>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Page {page} of {Math.ceil(total / 50)}</span>
                <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 rounded-xl text-sm disabled:opacity-40"
                  style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>Next</button>
              </div>
            )}
          </>
        )}

        {tab === 'teachers' && (
          <div style={card} className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Teacher', 'School', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teachers.map((t: any) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t.user?.displayName || '(no name)'}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.user?.email}</p>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{t.schoolName || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(t.createdAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => { setVerifyModal({ item: t, type: 'teacher' }); setVerifyStatus('verified'); setVerifyReason(''); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }}>
                          <CheckCircle className="w-3 h-3" /> Approve
                        </button>
                        <button onClick={() => { setVerifyModal({ item: t, type: 'teacher' }); setVerifyStatus('rejected'); setVerifyReason(''); }}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold"
                          style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {teachers.length === 0 && (
                  <tr><td colSpan={4} className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No pending teacher verifications</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create school modal */}
      {createModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ ...card, maxWidth: '480px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Add School</h2>
            <div className="space-y-3">
              {[
                { label: 'School Name *', key: 'name', type: 'text' },
                { label: 'Contact Name', key: 'contactName', type: 'text' },
                { label: 'Contact Email', key: 'contactEmail', type: 'email' },
                { label: 'City', key: 'city', type: 'text' },
                { label: 'State / Bundesland', key: 'state', type: 'text' },
                { label: 'License Seats', key: 'licenseSeats', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>{f.label}</label>
                  <input type={f.type} value={(newSchool as any)[f.key]}
                    onChange={e => setNewSchool(s => ({ ...s, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>School Type</label>
                <select value={newSchool.schoolType} onChange={e => setNewSchool(s => ({ ...s, schoolType: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                  <option value="">Select type…</option>
                  {SCHOOL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setCreateModal(false)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={createSchool} disabled={saving || !newSchool.name.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--accent-purple)' }}>{saving ? 'Creating…' : 'Create School'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Verify modal */}
      {verifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ ...card, maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {verifyStatus === 'verified' ? 'Approve' : 'Reject'} {verifyModal.type === 'school' ? 'School' : 'Teacher'}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {verifyModal.type === 'school' ? verifyModal.item.name : verifyModal.item.user?.email}
            </p>
            <textarea value={verifyReason} onChange={e => setVerifyReason(e.target.value)}
              placeholder="Reason (required)…" rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            <div className="flex gap-3">
              <button onClick={() => setVerifyModal(null)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={() => verifySchool(verifyStatus)} disabled={saving || !verifyReason.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: verifyStatus === 'verified' ? 'var(--success)' : 'var(--danger)' }}>
                {saving ? 'Saving…' : (verifyStatus === 'verified' ? 'Approve' : 'Reject')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
