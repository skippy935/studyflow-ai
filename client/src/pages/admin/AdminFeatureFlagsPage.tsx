import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { AlertTriangle, ToggleLeft, ToggleRight, Clock } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

const CATEGORY_COLORS: Record<string, string> = {
  ai: 'var(--accent-purple)',
  gamification: 'var(--warning)',
  social: 'var(--accent-cyan)',
  payments: 'var(--success)',
  core: 'var(--text-secondary)',
};

export default function AdminFeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<any | null>(null);
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminFetch('/feature-flags').then(setFlags).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  const killSwitches = flags.filter(f => f.isKillSwitch);
  const regular = flags.filter(f => !f.isKillSwitch);

  async function toggle(flag: any) {
    if (flag.isKillSwitch) {
      setModal({ ...flag, newEnabled: !flag.isEnabled });
      setReason('');
      return;
    }
    // Non-kill-switch: quick toggle
    await applyToggle(flag, !flag.isEnabled, 'Admin quick toggle');
  }

  async function applyToggle(flag: any, newEnabled: boolean, r: string) {
    if (r.trim().length < 10) { toast.error('Reason must be at least 10 characters'); return; }
    setSaving(true);
    try {
      const updated = await adminFetch(`/feature-flags/${flag.key}`, {
        method: 'PATCH',
        body: JSON.stringify({ isEnabled: newEnabled, reason: r }),
      });
      setFlags(prev => prev.map(f => f.id === updated.id ? updated : f));
      setModal(null);
      toast.success('Flag updated');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: 'var(--accent-purple)', borderTopColor: 'transparent' }} />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
          Feature Flags & Kill Switches
        </h1>

        {/* Kill switches — always visible, large cards */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
            Kill Switches
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {killSwitches.map(flag => {
              const disabled = !flag.isEnabled;
              return (
                <div
                  key={flag.id}
                  style={{
                    ...card,
                    border: disabled ? '2px solid var(--danger)' : '1px solid var(--border)',
                    ...(disabled ? { animation: 'pulse 2s infinite' } : {}),
                  }}
                  className="p-4 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {disabled && <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--danger)' }} />}
                      <span className="text-xs font-bold uppercase tracking-wide"
                        style={{ color: CATEGORY_COLORS[flag.category] ?? 'var(--text-secondary)' }}>
                        {flag.category}
                      </span>
                    </div>
                    <div className={`px-2 py-0.5 rounded-full text-xs font-semibold ${disabled ? 'animate-pulse' : ''}`}
                      style={{
                        background: disabled ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)',
                        color: disabled ? 'var(--danger)' : 'var(--success)',
                      }}>
                      {disabled ? '● DISABLED' : '● ON'}
                    </div>
                  </div>

                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{flag.name}</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{flag.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Clock className="w-3 h-3" />
                      {new Date(flag.lastChangedAt).toLocaleDateString('de-DE')}
                    </div>
                    <button
                      onClick={() => toggle(flag)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                      style={{
                        background: disabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: disabled ? 'var(--success)' : 'var(--danger)',
                      }}
                    >
                      {disabled ? <ToggleLeft className="w-3.5 h-3.5" /> : <ToggleRight className="w-3.5 h-3.5" />}
                      {disabled ? 'Enable' : 'Disable'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Regular flags table */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-secondary)' }}>
            Feature Flags
          </h2>
          <div style={card} className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Flag', 'Category', 'Rollout', 'Status', 'Last Changed', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {regular.map(flag => (
                  <tr key={flag.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{flag.name}</p>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{flag.key}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: `${CATEGORY_COLORS[flag.category] ?? '#666'}20`, color: CATEGORY_COLORS[flag.category] ?? 'var(--text-secondary)' }}>
                        {flag.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {flag.rolloutPercentage}%
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{
                          background: flag.isEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                          color: flag.isEnabled ? 'var(--success)' : 'var(--danger)',
                        }}>
                        {flag.isEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {new Date(flag.lastChangedAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(flag)}
                        style={{ color: flag.isEnabled ? 'var(--danger)' : 'var(--success)' }}
                        className="text-xs font-semibold hover:opacity-80 transition-opacity">
                        {flag.isEnabled ? 'Disable' : 'Enable'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Kill switch confirmation modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ ...card, maxWidth: '440px', width: '100%', padding: '24px' }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: modal.newEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)' }}>
                <AlertTriangle className="w-5 h-5" style={{ color: modal.newEnabled ? 'var(--success)' : 'var(--danger)' }} />
              </div>
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {modal.newEnabled ? 'Enable' : 'DISABLE'} Kill Switch
                </h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{modal.name}</p>
              </div>
            </div>

            {!modal.newEnabled && (
              <div className="px-3 py-2 rounded-xl mb-4 text-xs"
                style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)', border: '1px solid rgba(239,68,68,0.3)' }}>
                This will immediately disable this feature for ALL users.
              </div>
            )}

            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Reason (min 10 characters, required)…"
              rows={3}
              className="w-full px-3 py-2 rounded-xl text-sm outline-none mb-4 resize-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
            />

            <div className="flex gap-3">
              <button onClick={() => setModal(null)} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button
                onClick={() => applyToggle(modal, modal.newEnabled, reason)}
                disabled={saving || reason.trim().length < 10}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-50"
                style={{ background: modal.newEnabled ? 'var(--success)' : 'var(--danger)' }}>
                {saving ? 'Saving…' : (modal.newEnabled ? 'Enable' : 'Disable')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
