import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Plus, Shield, User, Clock, CheckCircle, XCircle } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModal, setInviteModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MODERATOR' | 'SUPER_ADMIN'>('MODERATOR');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ url: string; token: string } | null>(null);

  useEffect(() => {
    adminFetch('/auth/admins')
      .then(setAdmins)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function sendInvite() {
    if (!email.trim()) return;
    setSaving(true);
    try {
      const data = await adminFetch('/auth/invite', {
        method: 'POST',
        body: JSON.stringify({ email, role, notes }),
      });
      setInviteResult({ url: data.inviteUrl, token: data.inviteToken });
      toast.success('Invite created');
      // Refresh list
      const updated = await adminFetch('/auth/admins');
      setAdmins(updated);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setInviteModal(false);
    setEmail('');
    setRole('MODERATOR');
    setNotes('');
    setInviteResult(null);
  }

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'var(--accent-purple)',
    MODERATOR: 'var(--accent-cyan)',
  };

  const active = admins.filter(a => a.isActive && a.inviteAccepted);
  const pending = admins.filter(a => !a.inviteAccepted);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>Admin Team</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {active.length} active admin{active.length !== 1 ? 's' : ''} · max 3 Super Admins, 10 Moderators
            </p>
          </div>
          <button onClick={() => setInviteModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'var(--accent-purple)' }}>
            <Plus className="w-4 h-4" /> Invite Admin
          </button>
        </div>

        {/* Role limits */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Super Admins', count: admins.filter(a => a.role === 'SUPER_ADMIN' && a.inviteAccepted).length, max: 3, color: 'var(--accent-purple)', icon: Shield },
            { label: 'Moderators', count: admins.filter(a => a.role === 'MODERATOR' && a.inviteAccepted).length, max: 10, color: 'var(--accent-cyan)', icon: User },
          ].map(item => (
            <div key={item.label} style={card} className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${item.color}20` }}>
                <item.icon className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <div className="flex-1">
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold font-mono" style={{ color: item.color }}>{item.count}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>/ {item.max} max</p>
                </div>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: `${(item.count / item.max) * 100}%`, background: item.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Active admins */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Active Admins</h2>
          <div style={card} className="divide-y">
            {loading ? (
              <div className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>Loading…</div>
            ) : active.length === 0 ? (
              <div className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No active admins yet</div>
            ) : active.map(admin => (
              <div key={admin.id} className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ background: `${roleColor[admin.role] ?? '#666'}25`, color: roleColor[admin.role] ?? '#666' }}>
                    {(admin.displayName || admin.email)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {admin.displayName || admin.email}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{admin.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden md:block">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Last login</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString('de-DE') : 'Never'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${roleColor[admin.role] ?? '#666'}20`, color: roleColor[admin.role] ?? '#666' }}>
                      {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Moderator'}
                    </span>
                    {admin.tfaEnabled ? (
                      <span title="2FA enabled"><CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} /></span>
                    ) : (
                      <span title="2FA not set up"><XCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} /></span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pending invites */}
        {pending.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Pending Invites</h2>
            <div style={card} className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Email', 'Role', 'Invited', 'Expires', 'Status'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pending.map(a => {
                    const expired = a.inviteExpiry && new Date(a.inviteExpiry) < new Date();
                    return (
                      <tr key={a.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-primary)' }}>{a.email}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full"
                            style={{ background: `${roleColor[a.role] ?? '#666'}20`, color: roleColor[a.role] ?? '#666' }}>
                            {a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Moderator'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(a.createdAt).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: expired ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          {a.inviteExpiry ? new Date(a.inviteExpiry).toLocaleDateString('de-DE') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" style={{ color: expired ? 'var(--danger)' : 'var(--warning)' }} />
                            <span className="text-xs" style={{ color: expired ? 'var(--danger)' : 'var(--warning)' }}>
                              {expired ? 'Expired' : 'Pending'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Security note */}
        <div className="p-4 rounded-xl text-xs" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--text-secondary)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--accent-purple)' }}>Security Requirements</p>
          All admin accounts require: 16+ character password · TOTP 2FA setup · Invite-only access · Session timeout after 30 min inactivity
        </div>
      </div>

      {/* Invite modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ ...card, maxWidth: '440px', width: '100%', padding: '24px' }}>
            {!inviteResult ? (
              <>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Invite Admin</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['MODERATOR', 'SUPER_ADMIN'] as const).map(r => (
                        <button key={r} onClick={() => setRole(r)}
                          className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: role === r ? `${roleColor[r]}25` : 'rgba(255,255,255,0.06)',
                            color: role === r ? roleColor[r] : 'var(--text-secondary)',
                            border: `1px solid ${role === r ? roleColor[r] + '50' : 'var(--border)'}`,
                          }}>
                          {r === 'SUPER_ADMIN' ? 'Super Admin' : 'Moderator'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Notes (optional)</label>
                    <input value={notes} onChange={e => setNotes(e.target.value)}
                      placeholder="e.g. Customer support team"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </div>
                  <p className="text-xs p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    Invite link expires in 24 hours. The new admin must set a 16+ character password and configure 2FA on first login.
                  </p>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={reset} className="flex-1 py-2.5 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
                  <button onClick={sendInvite} disabled={saving || !email.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: 'var(--accent-purple)' }}>{saving ? 'Sending…' : 'Send Invite'}</button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-5">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--success)' }} />
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Invite Created</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Send this link to {email}</p>
                </div>
                <div className="p-3 rounded-xl mb-4" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-mono break-all" style={{ color: 'var(--accent-cyan)' }}>
                    {window.location.origin}{inviteResult.url}
                  </p>
                </div>
                <button
                  onClick={() => { navigator.clipboard.writeText(window.location.origin + inviteResult.url); toast.success('Copied'); }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold mb-3"
                  style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.3)' }}>
                  Copy Invite Link
                </button>
                <button onClick={reset} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--accent-purple)' }}>Done</button>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
