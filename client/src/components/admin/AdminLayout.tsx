import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Shield, Zap, School, Tag, BarChart2,
  Flag, LogOut, Menu, X, AlertTriangle, ChevronRight,
} from 'lucide-react';
import { clearAdminToken } from '../../lib/adminApi';

const NAV = [
  { label: 'Overview', path: '/admin', icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', icon: Users },
  { label: 'GDPR / DSGVO', path: '/admin/gdpr', icon: Shield },
  { label: 'Kill Switches', path: '/admin/feature-flags', icon: AlertTriangle },
  { label: 'AI Costs', path: '/admin/ai-costs', icon: Zap },
  { label: 'Schools', path: '/admin/schools', icon: School },
  { label: 'Promo Codes', path: '/admin/promo-codes', icon: Tag },
  { label: 'Audit Log', path: '/admin/audit-log', icon: BarChart2 },
  { label: 'Admin Team', path: '/admin/team', icon: Flag },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function logout() {
    clearAdminToken();
    navigate('/admin/login');
  }

  const Sidebar = () => (
    <nav className="flex flex-col h-full" style={{ background: 'var(--bg-secondary)' }}>
      {/* Logo */}
      <div className="px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
            style={{ background: 'var(--accent-purple)' }}>A</div>
          <div>
            <p className="text-xs font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
              StudyFlow
            </p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <div className="flex-1 py-4 overflow-y-auto">
        {NAV.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path || (path !== '/admin' && location.pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-6 py-2.5 text-sm transition-all"
              style={{
                color: active ? 'white' : 'var(--text-secondary)',
                background: active ? 'rgba(124,58,237,0.2)' : 'transparent',
                borderLeft: active ? '2px solid var(--accent-purple)' : '2px solid transparent',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3 h-3 ml-auto" />}
            </Link>
          );
        })}
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <button
          onClick={logout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all hover:opacity-80"
          style={{ color: 'var(--text-secondary)' }}
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </nav>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-primary)', fontFamily: 'Inter, sans-serif' }}>
      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-56 flex-shrink-0 flex-col" style={{ borderRight: '1px solid var(--border)' }}>
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-56 flex-shrink-0">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)', background: 'var(--bg-secondary)' }}>
          <button className="lg:hidden" onClick={() => setSidebarOpen(true)}
            style={{ color: 'var(--text-secondary)' }}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(124,58,237,0.2)', color: 'var(--accent-purple)' }}>
            Admin Dashboard
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
