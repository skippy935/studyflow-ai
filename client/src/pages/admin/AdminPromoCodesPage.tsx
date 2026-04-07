import { useEffect, useState, useCallback } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { Plus, Copy, Download } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

type ModalType = 'single' | 'bulk' | null;

const DEFAULT_FORM = {
  code: '', type: 'percent_off', value: 20, appliesTo: 'all',
  maxUses: '', maxUsesPerUser: 1, validUntil: '', reason: '', metadata: '',
};

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('');
  const [modal, setModal] = useState<ModalType>(null);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [bulkCount, setBulkCount] = useState(10);
  const [bulkPrefix, setBulkPrefix] = useState('');
  const [saving, setSaving] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const fetchCodes = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (activeFilter) params.set('active', activeFilter);
    try {
      const data = await adminFetch(`/promo-codes?${params}`);
      setCodes(data.codes);
      setTotal(data.total);
    } catch (err: any) { toast.error(err.message); }
  }, [page, activeFilter]);

  useEffect(() => { fetchCodes(); }, [fetchCodes]);

  function setF(key: string, val: any) { setForm(f => ({ ...f, [key]: val })); }

  async function createSingle() {
    if (!form.reason.trim()) { toast.error('Reason required'); return; }
    setSaving(true);
    try {
      await adminFetch('/promo-codes', {
        method: 'POST',
        body: JSON.stringify({
          code: form.code || undefined,
          type: form.type,
          value: Number(form.value),
          appliesTo: form.appliesTo,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          maxUsesPerUser: Number(form.maxUsesPerUser),
          validUntil: form.validUntil || null,
          reason: form.reason,
        }),
      });
      toast.success('Promo code created');
      setModal(null);
      setForm(DEFAULT_FORM);
      fetchCodes();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  async function createBulk() {
    if (!form.reason.trim()) { toast.error('Reason required'); return; }
    setSaving(true);
    try {
      const data = await adminFetch('/promo-codes/bulk-generate', {
        method: 'POST',
        body: JSON.stringify({
          count: bulkCount,
          prefix: bulkPrefix || undefined,
          type: form.type,
          value: Number(form.value),
          appliesTo: form.appliesTo,
          maxUsesPerUser: 1,
          validUntil: form.validUntil || null,
          reason: form.reason,
        }),
      });
      setGeneratedCodes(data.codes);
      toast.success(`${data.count} codes generated`);
      fetchCodes();
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  async function deactivate(id: number) {
    const reason = prompt('Reason for deactivating this code?');
    if (!reason?.trim()) return;
    try {
      await adminFetch(`/promo-codes/${id}/deactivate`, { method: 'PATCH', body: JSON.stringify({ reason }) });
      toast.success('Code deactivated');
      fetchCodes();
    } catch (err: any) { toast.error(err.message); }
  }

  function copyAll() {
    navigator.clipboard.writeText(generatedCodes.join('\n'));
    toast.success('Copied to clipboard');
  }

  function downloadCsv() {
    const csv = 'code\n' + generatedCodes.join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'promo_codes.csv'; a.click();
  }

  const typeLabel: Record<string, string> = {
    percent_off: '% Off', fixed_amount: '€ Off', free_trial_days: 'Free Days', school_bulk: 'School Bulk',
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>Promo Codes</h1>
          <div className="flex gap-2">
            <button onClick={() => { setModal('bulk'); setForm(DEFAULT_FORM); setGeneratedCodes([]); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.3)' }}>
              <Plus className="w-4 h-4" /> Bulk Generate
            </button>
            <button onClick={() => { setModal('single'); setForm(DEFAULT_FORM); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'var(--accent-purple)' }}>
              <Plus className="w-4 h-4" /> Single Code
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {[{ v: '', l: 'All' }, { v: 'true', l: 'Active' }, { v: 'false', l: 'Inactive' }].map(f => (
            <button key={f.v} onClick={() => { setActiveFilter(f.v); setPage(1); }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium"
              style={{ background: activeFilter === f.v ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)', color: activeFilter === f.v ? 'white' : 'var(--text-secondary)', border: '1px solid var(--border)' }}>
              {f.l}
            </button>
          ))}
        </div>

        {/* Table */}
        <div style={card} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Code', 'Type', 'Value', 'Applies To', 'Uses', 'Valid Until', 'Status', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {codes.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(124,58,237,0.15)', color: 'var(--accent-purple)' }}>{c.code}</span>
                      <button onClick={() => { navigator.clipboard.writeText(c.code); toast.success('Copied'); }}
                        className="hover:opacity-60" style={{ color: 'var(--text-secondary)' }}>
                        <Copy className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{typeLabel[c.type] ?? c.type}</td>
                  <td className="px-4 py-3 text-xs font-bold" style={{ color: 'var(--accent-cyan)' }}>
                    {c.type === 'percent_off' ? `${c.value}%` : c.type === 'fixed_amount' ? `€${c.value}` : `${c.value} days`}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>{c.appliesTo}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {c.usesCount}{c.maxUses ? `/${c.maxUses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {c.validUntil ? new Date(c.validUntil).toLocaleDateString('de-DE') : '∞'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: c.isActive ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)', color: c.isActive ? 'var(--success)' : 'var(--danger)' }}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.isActive && (
                      <button onClick={() => deactivate(c.id)} className="text-xs hover:opacity-80" style={{ color: 'var(--danger)' }}>
                        Deactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {codes.length === 0 && (
                <tr><td colSpan={8} className="text-center py-10" style={{ color: 'var(--text-secondary)' }}>No promo codes yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

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
      </div>

      {/* Single / Bulk modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
          <div style={{ ...card, maxWidth: '480px', width: '100%', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
              {modal === 'single' ? 'Create Promo Code' : 'Bulk Generate Codes'}
            </h2>

            {/* Shared fields */}
            <div className="space-y-3">
              {modal === 'single' && (
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Code (leave blank to auto-generate)</label>
                  <input value={form.code} onChange={e => setF('code', e.target.value.toUpperCase())}
                    placeholder="e.g. SCHOOL50"
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              )}
              {modal === 'bulk' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Count</label>
                    <input type="number" value={bulkCount} onChange={e => setBulkCount(Math.min(500, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Prefix (optional)</label>
                    <input value={bulkPrefix} onChange={e => setBulkPrefix(e.target.value.toUpperCase())}
                      placeholder="e.g. SCHOOL"
                      className="w-full px-3 py-2 rounded-xl text-sm outline-none font-mono"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Type</label>
                  <select value={form.type} onChange={e => setF('type', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="percent_off">% Off</option>
                    <option value="fixed_amount">€ Fixed Off</option>
                    <option value="free_trial_days">Free Trial Days</option>
                    <option value="school_bulk">School Bulk</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>
                    Value ({form.type === 'percent_off' ? '%' : form.type === 'fixed_amount' ? '€' : 'days'})
                  </label>
                  <input type="number" value={form.value} onChange={e => setF('value', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Applies To</label>
                  <select value={form.appliesTo} onChange={e => setF('appliesTo', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}>
                    <option value="all">All plans</option>
                    <option value="premium_monthly">Premium Monthly</option>
                    <option value="premium_yearly">Premium Yearly</option>
                    <option value="school_license">School License</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Valid Until (optional)</label>
                  <input type="date" value={form.validUntil} onChange={e => setF('validUntil', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Reason *</label>
                <input value={form.reason} onChange={e => setF('reason', e.target.value)}
                  placeholder="e.g. School Hamburg partnership"
                  className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', color: 'var(--text-primary)' }} />
              </div>
            </div>

            {/* Generated codes list */}
            {generatedCodes.length > 0 && (
              <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)' }}>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold" style={{ color: 'var(--success)' }}>{generatedCodes.length} codes generated</p>
                  <div className="flex gap-2">
                    <button onClick={copyAll} className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent-cyan)' }}>
                      <Copy className="w-3 h-3" /> Copy all
                    </button>
                    <button onClick={downloadCsv} className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent-cyan)' }}>
                      <Download className="w-3 h-3" /> CSV
                    </button>
                  </div>
                </div>
                <div className="max-h-28 overflow-y-auto font-mono text-xs flex flex-wrap gap-1.5">
                  {generatedCodes.slice(0, 20).map(c => (
                    <span key={c} className="px-2 py-0.5 rounded" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent-purple)' }}>{c}</span>
                  ))}
                  {generatedCodes.length > 20 && <span style={{ color: 'var(--text-secondary)' }}>+{generatedCodes.length - 20} more…</span>}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5">
              <button onClick={() => { setModal(null); setGeneratedCodes([]); }} className="flex-1 py-2.5 rounded-xl text-sm"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                {generatedCodes.length > 0 ? 'Close' : 'Cancel'}
              </button>
              {generatedCodes.length === 0 && (
                <button onClick={modal === 'single' ? createSingle : createBulk}
                  disabled={saving || !form.reason.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
                  style={{ background: 'var(--accent-purple)' }}>
                  {saving ? 'Creating…' : modal === 'single' ? 'Create Code' : `Generate ${bulkCount} Codes`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
