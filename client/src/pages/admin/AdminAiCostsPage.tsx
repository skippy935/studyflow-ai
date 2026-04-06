import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { AlertTriangle, Zap } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

export default function AdminAiCostsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModel, setEditModel] = useState<any | null>(null);
  const [editReason, setEditReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      adminFetch('/ai-costs/overview'),
      adminFetch('/ai-costs/models'),
    ]).then(([ov, m]) => { setOverview(ov); setModels(m); }).catch(e => toast.error(e.message)).finally(() => setLoading(false));
  }, []);

  async function saveModel() {
    if (!editModel || !editReason.trim()) return;
    setSaving(true);
    try {
      const updated = await adminFetch(`/ai-costs/models/${editModel.feature}`, {
        method: 'PATCH',
        body: JSON.stringify({
          activeModel: editModel.activeModel,
          costPer1kInput: editModel.costPer1kInput,
          costPer1kOutput: editModel.costPer1kOutput,
          isActive: editModel.isActive,
          reason: editReason,
        }),
      });
      setModels(prev => prev.map(m => m.feature === updated.feature ? updated : m));
      setEditModel(null);
      toast.success('Model config updated');
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
          AI Cost Management
        </h1>

        {/* Cost cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Cost Today', value: `$${(overview?.costs?.today ?? 0).toFixed(4)}` },
            { label: 'Cost This Month', value: `$${(overview?.costs?.month ?? 0).toFixed(2)}` },
            { label: 'Cost This Year', value: `$${(overview?.costs?.year ?? 0).toFixed(2)}` },
          ].map(item => (
            <div key={item.label} style={card} className="p-5">
              <p className="text-2xl font-bold font-mono" style={{ color: 'var(--accent-cyan)' }}>{item.value}</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
            </div>
          ))}
        </div>

        {/* Anomalies */}
        {overview?.anomalies?.length > 0 && (
          <div style={{ ...card, border: '1px solid rgba(245,158,11,0.4)' }} className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" style={{ color: 'var(--warning)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--warning)' }}>
                Token Anomalies — Users consuming &gt;5× average
              </h2>
            </div>
            {overview.anomalies.map((a: any) => (
              <div key={a.userId} className="flex items-center justify-between py-2 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>User #{a.userId}</span>
                <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span>Today: <strong style={{ color: 'var(--warning)' }}>{a.todayTokens.toLocaleString()}</strong></span>
                  <span>Avg: {Math.round(a.avgTokens).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* By feature */}
        {overview?.byFeature?.length > 0 && (
          <div style={card} className="p-5">
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Cost by Feature (this month)</h2>
            {overview.byFeature.map((f: any) => {
              const maxCost = Math.max(...overview.byFeature.map((x: any) => Number(x._sum.costUsd ?? 0)), 0.001);
              const pct = (Number(f._sum.costUsd ?? 0) / maxCost) * 100;
              return (
                <div key={f.feature} className="mb-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{f.feature}</span>
                    <span style={{ color: 'var(--accent-cyan)' }}>${Number(f._sum.costUsd ?? 0).toFixed(4)}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent-purple)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Top users */}
        {overview?.topUsers?.length > 0 && (
          <div style={card} className="p-5">
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Top Spenders (this month)</h2>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['User', 'Tokens', 'Cost'].map(h => (
                    <th key={h} className="text-left pb-2 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overview.topUsers.map((u: any) => (
                  <tr key={u.userId} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="py-2.5">
                      <p className="text-xs" style={{ color: 'var(--text-primary)' }}>{u.user?.displayName || u.user?.email}</p>
                    </td>
                    <td className="py-2.5 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                      {(u._sum?.totalTokens ?? 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 text-xs font-bold" style={{ color: 'var(--accent-cyan)' }}>
                      ${Number(u._sum?.costUsd ?? 0).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Model config table */}
        <div style={card} className="overflow-x-auto">
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Model Configuration</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Feature', 'Active Model', 'Cost/1k in', 'Cost/1k out', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {models.map(m => (
                <tr key={m.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-5 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{m.feature}</td>
                  <td className="px-5 py-3 text-xs font-mono" style={{ color: 'var(--accent-cyan)' }}>{m.activeModel}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>${Number(m.costPer1kInput).toFixed(4)}</td>
                  <td className="px-5 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>${Number(m.costPer1kOutput).toFixed(4)}</td>
                  <td className="px-5 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: m.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: m.isActive ? 'var(--success)' : 'var(--danger)' }}>
                      {m.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => { setEditModel({ ...m }); setEditReason(''); }}
                      className="text-xs font-semibold hover:opacity-80" style={{ color: 'var(--accent-purple)' }}>
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit model modal */}
      {editModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ ...card, maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              Edit: {editModel.feature}
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Active Model</label>
                <input value={editModel.activeModel} onChange={e => setEditModel((m: any) => ({ ...m, activeModel: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Cost/1k Input ($)</label>
                  <input type="number" step="0.000001" value={editModel.costPer1kInput}
                    onChange={e => setEditModel((m: any) => ({ ...m, costPer1kInput: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Cost/1k Output ($)</label>
                  <input type="number" step="0.000001" value={editModel.costPer1kOutput}
                    onChange={e => setEditModel((m: any) => ({ ...m, costPer1kOutput: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>
              <textarea value={editReason} onChange={e => setEditReason(e.target.value)}
                placeholder="Reason for change (required)…" rows={2}
                className="w-full px-3 py-2 rounded-xl text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEditModel(null)} className="flex-1 py-2 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                Cancel
              </button>
              <button onClick={saveModel} disabled={saving || !editReason.trim()}
                className="flex-1 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                style={{ background: 'var(--accent-purple)' }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
