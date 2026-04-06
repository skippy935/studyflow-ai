import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Search, Ban, Zap, ChevronRight } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

export default function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [banModal, setBanModal] = useState<{ user: any; action: 'ban' | 'unban' } | null>(null);
  const [xpModal, setXpModal] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const [xpAmount, setXpAmount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '50' });
      if (q) params.set('q', q);
      const data = await adminFetch(`/users?${params}`);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [q, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  async function handleBan() {
    if (!banModal || !reason.trim()) return;
    try {
      await adminFetch(`/users/${banModal.user.id}/${banModal.action}`, { method: 'POST', body: JSON.stringify({ reason }) });
      toast.success(`User ${banModal.action === 'ban' ? 'banned' : 'unbanned'}`);
      setBanModal(null);
      setReason('');
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function handleXp() {
    if (!xpModal || !reason.trim()) return;
    try {
      await adminFetch(`/users/${xpModal.id}/adjust-xp`, { method: 'POST', body: JSON.stringify({ amount: xpAmount, reason }) });
      toast.success('XP updated');
      setXpModal(null);
      setReason('');
      setXpAmount(0);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>Users</h1>
          <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{total} total</span>
        </div>

        {/* Search */}
        <div style={card} className="flex items-center gap-3 px-4 py-3">
          <Search className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
          <input
            value={q}
            onChange={e => { setQ(e.target.value); setPage(1); }}
            placeholder="Search by email or name…"
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>

        {/* Table */}
        <div style={card} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['User', 'Type', 'Tier', 'XP', 'Streak', 'Status', 'Joined', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold"
                    style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Loading…</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  className="hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => navigate(`/admin/users/${u.id}`)}>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{u.displayName || '(no name)'}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{u.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent-purple)' }}>
                      {u.userType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{u.subscriptionTier}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--accent-cyan)' }}>{u.xp}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{u.streak}d</td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.2)', color: 'var(--danger)' }}>Banned</span>
                    ) : u.isMinor ? (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--warning)' }}>Minor</span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.2)', color: 'var(--success)' }}>Active</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(u.createdAt).toLocaleDateString('de-DE')}
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setBanModal({ user: u, action: u.isBanned ? 'unban' : 'ban' }); setReason(''); }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                        title={u.isBanned ? 'Unban' : 'Ban'}
                        style={{ color: u.isBanned ? 'var(--success)' : 'var(--danger)' }}>
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => { setXpModal(u); setReason(''); setXpAmount(0); }}
                        className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
                        title="Adjust XP"
                        style={{ color: 'var(--warning)' }}>
                        <Zap className="w-3.5 h-3.5" />
                      </button>
                      <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-secondary)' }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 50 && (
          <div className="flex items-center justify-center gap-3">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 rounded-xl text-sm disabled:opacity-40"
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Previous
            </button>
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Page {page} of {Math.ceil(total / 50)}
            </span>
            <button disabled={page >= Math.ceil(total / 50)} onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 rounded-xl text-sm disabled:opacity-40"
              style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
              Next
            </button>
          </div>
        )}
      </div>

      {/* Ban/Unban modal */}
      {banModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ ...card, maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {banModal.action === 'ban' ? 'Ban User' : 'Unban User'}
            </h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {banModal.user.email}
            </p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason (required)…"
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <div className="flex gap-3">
              <button onClick={() => setBanModal(null)} className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleBan} disabled={!reason.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: banModal.action === 'ban' ? 'var(--danger)' : 'var(--success)' }}>
                {banModal.action === 'ban' ? 'Ban' : 'Unban'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* XP modal */}
      {xpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ ...card, maxWidth: '400px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Adjust XP</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {xpModal.email} — current: {xpModal.xp} XP
            </p>
            <input
              type="number"
              value={xpAmount}
              onChange={e => setXpAmount(parseInt(e.target.value) || 0)}
              placeholder="Amount (+/-)"
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-3"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason (required)…"
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />
            <div className="flex gap-3">
              <button onClick={() => setXpModal(null)} className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={handleXp} disabled={!reason.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--warning)' }}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
