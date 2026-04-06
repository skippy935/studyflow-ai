import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/adminApi';
import AdminLayout from '../../components/admin/AdminLayout';
import { Users, AlertTriangle, Zap, School, Shield, TrendingUp } from 'lucide-react';

const card = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '16px',
  backdropFilter: 'blur(12px)',
} as const;

function StatCard({ label, value, sub, icon: Icon, color }: { label: string; value: string | number; sub?: string; icon: any; color: string }) {
  return (
    <div style={card} className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
        {value}
      </p>
      <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-secondary)' }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)', opacity: 0.6 }}>{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs tabular-nums w-6 text-right" style={{ color: 'var(--text-secondary)' }}>{value}</span>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch('/').then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--accent-purple)', borderTopColor: 'transparent' }} />
      </div>
    </AdminLayout>
  );

  const maxChart = data?.chart ? Math.max(...data.chart.map((d: any) => d.count), 1) : 1;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
            Overview
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {new Date().toLocaleDateString('de-DE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Kill switch warning */}
        {data?.killSwitchesActive > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse"
            style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)' }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--danger)' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--danger)' }}>
              {data.killSwitchesActive} kill switch{data.killSwitchesActive > 1 ? 'es' : ''} currently DISABLED
            </p>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={data?.users?.total ?? 0} icon={Users} color="var(--accent-cyan)" />
          <StatCard label="New Today" value={data?.users?.newToday ?? 0} sub={`${data?.users?.newThisMonth ?? 0} this month`} icon={TrendingUp} color="var(--success)" />
          <StatCard label="Active Today" value={data?.users?.activeToday ?? 0} sub={`${data?.users?.active7d ?? 0} last 7d`} icon={Users} color="var(--accent-purple)" />
          <StatCard label="AI Cost Today" value={`$${(data?.aiCosts?.today ?? 0).toFixed(4)}`} sub={`$${(data?.aiCosts?.month ?? 0).toFixed(2)} this month`} icon={Zap} color="var(--warning)" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Banned Users" value={data?.users?.banned ?? 0} icon={AlertTriangle} color="var(--danger)" />
          <StatCard label="Minors w/o Consent" value={data?.gdpr?.minorsWithoutConsent ?? 0} icon={Shield} color="var(--warning)" />
          <StatCard label="Schools" value={data?.schools?.total ?? 0} sub={`${data?.schools?.pending ?? 0} pending`} icon={School} color="var(--accent-cyan)" />
          <StatCard label="Teacher Queue" value={data?.gdpr?.unverifiedTeachers ?? 0} icon={Users} color="var(--accent-purple)" />
        </div>

        {/* Registration chart */}
        {data?.chart && (
          <div style={card} className="p-6">
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text-primary)' }}>New Registrations — Last 14 Days</h2>
            <div className="flex items-end gap-1 h-24">
              {data.chart.map((d: any) => {
                const pct = maxChart > 0 ? (d.count / maxChart) * 100 : 0;
                return (
                  <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                      style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      {d.date}: {d.count}
                    </div>
                    <div className="w-full rounded-t-sm transition-all"
                      style={{ height: `${Math.max(pct, 4)}%`, background: pct > 50 ? 'var(--accent-purple)' : 'rgba(124,58,237,0.4)' }} />
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{data.chart[0]?.date}</span>
              <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{data.chart[data.chart.length - 1]?.date}</span>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
