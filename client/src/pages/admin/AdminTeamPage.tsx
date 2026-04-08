import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Plus, UserPlus, Shield, User, Clock, CheckCircle, XCircle, Trash2, Eye, EyeOff } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

type Mode = 'invite' | 'create';

export default function AdminTeamPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<Mode | null>(null);
  const [saving, setSaving] = useState(false);

  // Invite fields
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'MODERATOR' | 'SUPER_ADMIN'>('MODERATOR');
  const [inviteNotes, setInviteNotes] = useState('');
  const [inviteResult, setInviteResult] = useState<{ url: string } | null>(null);

  // Create fields
  const [createEmail, setCreateEmail] = useState('');
  const [createName, setCreateName] = useState('');
  const [createPassword, setCreatePassword] = useState('');
  const [createRole, setCreateRole] = useState<'MODERATOR' | 'SUPER_ADMIN'>('MODERATOR');
  const [showPassword, setShowPassword] = useState(false);

  // Deactivate confirm
  const [deactivateTarget, setDeactivateTarget] = useState<any | null>(null);

  function loadAdmins() {
    adminFetch('/auth/admins')
      .then(setAdmins)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadAdmins(); }, []);

  async function sendInvite() {
    if (!inviteEmail.trim()) return;
    setSaving(true);
    try {
      const data = await adminFetch('/auth/invite', {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, notes: inviteNotes }),
      });
      setInviteResult({ url: data.inviteUrl });
      toast.success('Invite created');
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function createAdmin() {
    if (!createEmail.trim() || !createName.trim() || !createPassword.trim()) return;
    setSaving(true);
    try {
      await adminFetch('/auth/create-admin', {
        method: 'POST',
        body: JSON.stringify({ email: createEmail, password: createPassword, displayName: createName, role: createRole }),
      });
      toast.success(`Admin ${createEmail} created`);
      resetModals();
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deactivateAdmin(adminId: number) {
    try {
      await adminFetch(`/auth/admins/${adminId}`, { method: 'DELETE' });
      toast.success('Admin deactivated');
      setDeactivateTarget(null);
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  async function reactivateAdmin(adminId: number) {
    try {
      await adminFetch(`/auth/admins/${adminId}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: true }),
      });
      toast.success('Admin reactivated');
      loadAdmins();
    } catch (err: any) {
      toast.error(err.message);
    }
  }

  function resetModals() {
    setModal(null);
    setInviteEmail(''); setInviteRole('MODERATOR'); setInviteNotes(''); setInviteResult(null);
    setCreateEmail(''); setCreateName(''); setCreatePassword(''); setCreateRole('MODERATOR'); setShowPassword(false);
  }

  const roleColor: Record<string, string> = {
    SUPER_ADMIN: 'var(--accent-purple)',
    MODERATOR: 'var(--accent-cyan)',
  };

  const active = admins.filter(a => a.isActive && a.inviteAccepted);
  const pending = admins.filter(a => !a.inviteAccepted);
  const inactive = admins.filter(a => !a.isActive && a.inviteAccepted);

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
          <div className="flex gap-2">
            <button onClick={() => setModal('create')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--accent-cyan)' }}>
              <UserPlus className="w-4 h-4" /> Create Admin
            </button>
            <button onClick={() => setModal('invite')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--accent-purple)' }}>
              <Plus className="w-4 h-4" /> Invite Link
            </button>
          </div>
        </div>

        {/* Role limits */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Super Admins', count: admins.filter(a => a.role === 'SUPER_ADMIN' && a.inviteAccepted && a.isActive).length, max: 3, color: 'var(--accent-purple)', icon: Shield },
            { label: 'Moderators', count: admins.filter(a => a.role === 'MODERATOR' && a.inviteAccepted && a.isActive).length, max: 10, color: 'var(--accent-cyan)', icon: User },
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
                <div className="flex items-center gap-3">
                  <div className="text-right hidden md:block">
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Last login</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
                      {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString('en-GB') : 'Never'}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{ background: `${roleColor[admin.role] ?? '#666'}20`, color: roleColor[admin.role] ?? '#666' }}>
                    {admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Moderator'}
                  </span>
                  {admin.tfaEnabled ? (
                    <span title="2FA enabled"><CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} /></span>
                  ) : (
                    <span title="2FA not set up"><XCircle className="w-4 h-4" style={{ color: 'var(--warning)' }} /></span>
                  )}
                  <button onClick={() => setDeactivateTarget(admin)} title="Deactivate"
                    className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                    style={{ color: 'var(--danger)' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
                          {new Date(a.createdAt).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: expired ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          {a.inviteExpiry ? new Date(a.inviteExpiry).toLocaleDateString('en-GB') : '—'}
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

        {/* Inactive admins */}
        {inactive.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>Deactivated Admins</h2>
            <div style={card} className="divide-y">
              {inactive.map(admin => (
                <div key={admin.id} className="flex items-center justify-between p-4 opacity-60" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <div>
                    <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{admin.displayName || admin.email}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{admin.email}</p>
                  </div>
                  <button onClick={() => reactivateAdmin(admin.id)}
                    className="text-xs px-3 py-1.5 rounded-xl font-semibold"
                    style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--success)', border: '1px solid rgba(16,185,129,0.3)' }}>
                    Reactivate
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Security note */}
        <div className="p-4 rounded-xl text-xs" style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', color: 'var(--text-secondary)' }}>
          <p className="font-semibold mb-1" style={{ color: 'var(--accent-purple)' }}>Security Requirements</p>
          All admin accounts require: 16+ character password · TOTP 2FA setup · Invite-only access · Session timeout after 30 min inactivity
        </div>
      </div>

      {/* ── Create Admin Modal ── */}
      {modal === 'create' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div style={{ ...card, maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Create Admin Directly</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                <input type="email" value={createEmail} onChange={e => setCreateEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Display Name *</label>
                <input value={createName} onChange={e => setCreateName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Password * (min 16 chars)</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={createPassword} onChange={e => setCreatePassword(e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  <button onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-secondary)' }}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {createPassword.length > 0 && createPassword.length < 16 && (
                  <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{createPassword.length}/16 characters</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MODERATOR', 'SUPER_ADMIN'] as const).map(r => (
                    <button key={r} onClick={() => setCreateRole(r)}
                      className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: createRole === r ? `${r === 'SUPER_ADMIN' ? 'var(--accent-purple)' : 'var(--accent-cyan)'}25` : 'rgba(255,255,255,0.06)',
                        color: createRole === r ? (r === 'SUPER_ADMIN' ? 'var(--accent-purple)' : 'var(--accent-cyan)') : 'var(--text-secondary)',
                        border: `1px solid ${createRole === r ? (r === 'SUPER_ADMIN' ? 'rgba(124,58,237,0.5)' : 'rgba(6,182,212,0.5)') : 'var(--border)'}`,
                      }}>
                      {r === 'SUPER_ADMIN' ? 'Super Admin' : 'Moderator'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={resetModals} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={createAdmin}
                disabled={saving || !createEmail.trim() || !createName.trim() || createPassword.length < 16}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--accent-cyan)' }}>
                {saving ? 'Creating…' : 'Create Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Invite Link Modal ── */}
      {modal === 'invite' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div style={{ ...card, maxWidth: '440px', width: '100%', padding: '24px' }}>
            {!inviteResult ? (
              <>
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Invite via Link</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                    <input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Role</label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['MODERATOR', 'SUPER_ADMIN'] as const).map(r => (
                        <button key={r} onClick={() => setInviteRole(r)}
                          className="py-2.5 rounded-xl text-sm font-semibold transition-all"
                          style={{
                            background: inviteRole === r ? `${r === 'SUPER_ADMIN' ? 'var(--accent-purple)' : 'var(--accent-cyan)'}25` : 'rgba(255,255,255,0.06)',
                            color: inviteRole === r ? (r === 'SUPER_ADMIN' ? 'var(--accent-purple)' : 'var(--accent-cyan)') : 'var(--text-secondary)',
                            border: `1px solid ${inviteRole === r ? (r === 'SUPER_ADMIN' ? 'rgba(124,58,237,0.5)' : 'rgba(6,182,212,0.5)') : 'var(--border)'}`,
                          }}>
                          {r === 'SUPER_ADMIN' ? 'Super Admin' : 'Moderator'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Notes (optional)</label>
                    <input value={inviteNotes} onChange={e => setInviteNotes(e.target.value)}
                      placeholder="e.g. Customer support team"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </div>
                  <p className="text-xs p-3 rounded-xl" style={{ background: 'rgba(245,158,11,0.1)', color: 'var(--warning)', border: '1px solid rgba(245,158,11,0.2)' }}>
                    Invite link expires in 24 hours. The new admin must set a 16+ character password and configure 2FA on first login.
                  </p>
                </div>
                <div className="flex gap-3 mt-5">
                  <button onClick={resetModals} className="flex-1 py-2.5 rounded-xl text-sm"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
                  <button onClick={sendInvite} disabled={saving || !inviteEmail.trim()}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                    style={{ background: 'var(--accent-purple)' }}>{saving ? 'Sending…' : 'Generate Link'}</button>
                </div>
              </>
            ) : (
              <>
                <div className="text-center mb-5">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2" style={{ color: 'var(--success)' }} />
                  <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Invite Link Created</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Send this to {inviteEmail}</p>
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
                <button onClick={resetModals} className="w-full py-2.5 rounded-xl text-sm font-semibold text-white"
                  style={{ background: 'var(--accent-purple)' }}>Done</button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Deactivate confirm ── */}
      {deactivateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)' }}>
          <div style={{ ...card, maxWidth: '380px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Deactivate Admin</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              This will revoke access for <strong style={{ color: 'var(--text-primary)' }}>{deactivateTarget.email}</strong>. They will not be able to log in until reactivated.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeactivateTarget(null)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={() => deactivateAdmin(deactivateTarget.id)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'var(--danger)' }}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
