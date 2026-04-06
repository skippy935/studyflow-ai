import { useEffect, useState, useCallback } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import toast from 'react-hot-toast';
import { CheckCircle, AlertTriangle } from 'lucide-react';

const card = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '16px' } as const;

const ACTION_COLORS: Record<string, string> = {
  BAN: 'var(--danger)', UNBAN: 'var(--success)', XP_CHANGE: 'var(--warning)',
  GDPR_ERASE: 'var(--danger)', GDPR_DATA_EXPORT: 'var(--accent-cyan)',
  FEATURE_FLAG_CHANGE: 'var(--accent-purple)', AI_MODEL_CHANGE: 'var(--accent-purple)',
  SCHOOL_VERIFY: 'var(--success)', ADMIN_INVITE: 'var(--accent-cyan)',
};

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionType, setActionType] = useState('');
  const [integrityResult, setIntegrityResult] = useState<any | null>(null);
  const [verifying, setVerifying] = useState(false);

  const fetchLogs = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page) });
    if (actionType) params.set('actionType', actionType);
    try {
      const data = await adminFetch(`/audit-logs?${params}`);
      setLogs(data.logs);
      setTotal(data.total);
    } catch (err: any) {
      toast.error(err.message);
    }
  }, [page, actionType]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  async function verifyIntegrity() {
    setVerifying(true);
    try {
      const result = await adminFetch('/audit-logs/verify-integrity');
      setIntegrityResult(result);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
            Audit Log
          </h1>
          <button onClick={verifyIntegrity} disabled={verifying}
            className="px-4 py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
            style={{ background: 'rgba(6,182,212,0.15)', color: 'var(--accent-cyan)', border: '1px solid rgba(6,182,212,0.3)' }}>
            {verifying ? 'Verifying…' : 'Verify Hash Chain'}
          </button>
        </div>

        {integrityResult && (
          <div style={{ ...card, border: `1px solid ${integrityResult.intact ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'}` }} className="p-4 flex items-center gap-3">
            {integrityResult.intact
              ? <CheckCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--success)' }} />
              : <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--danger)' }} />}
            <p className="text-sm" style={{ color: integrityResult.intact ? 'var(--success)' : 'var(--danger)' }}>
              {integrityResult.intact
                ? `Hash chain intact — ${integrityResult.total} entries verified`
                : `TAMPERING DETECTED — ${integrityResult.issues.length} broken entries: ${integrityResult.issues.join(', ')}`}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          {['', 'BAN', 'GDPR_ERASE', 'XP_CHANGE', 'FEATURE_FLAG_CHANGE', 'AI_MODEL_CHANGE', 'SCHOOL_VERIFY'].map(type => (
            <button key={type} onClick={() => { setActionType(type); setPage(1); }}
              className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: actionType === type ? 'var(--accent-purple)' : 'rgba(255,255,255,0.06)',
                color: actionType === type ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border)',
              }}>
              {type || 'All'}
            </button>
          ))}
        </div>

        <div style={card} className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Time', 'Admin', 'Action', 'Target User', 'Reason', 'IP'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                    {new Date(log.createdAt).toLocaleString('de-DE')}
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--text-primary)' }}>
                    {log.admin?.displayName || log.admin?.email || `#${log.adminId}`}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-mono"
                      style={{
                        background: `${ACTION_COLORS[log.actionType] ?? 'rgba(255,255,255,0.1)'}20`,
                        color: ACTION_COLORS[log.actionType] ?? 'var(--text-secondary)',
                      }}>
                      {log.actionType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {log.targetUserId ? `#${log.targetUserId}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs max-w-48 truncate" style={{ color: 'var(--text-secondary)' }} title={log.reason}>
                    {log.reason || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>
                    {log.ipAddress || '—'}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>No audit logs found</td></tr>
              )}
            </tbody>
          </table>
        </div>

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
    </AdminLayout>
  );
}
