import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { LayoutDashboard, Plus, Settings, LogOut, Zap, Moon, Sun, CalendarCheck, GraduationCap, User, Trophy, Bell } from 'lucide-react';
import { clearSession, getUser } from '../../lib/auth';
import { useTranslation } from '../../i18n';
import { apiFetch } from '../../lib/api';

const links = [
  { to: '/dashboard',    icon: LayoutDashboard, labelKey: 'dashboard'    as const },
  { to: '/create',       icon: Plus,            labelKey: 'create'       as const },
  { to: '/planner',      icon: CalendarCheck,   labelKey: 'planner'      as const },
  { to: '/leaderboard',  icon: Trophy,          labelKey: 'leaderboard'  as const },
  { to: '/settings',     icon: Settings,        labelKey: 'settings'     as const },
];

const bottomNavLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home' },
  { to: '/create',      icon: Plus,            label: 'Create' },
  { to: '/examiner',    icon: GraduationCap,   label: 'Exam' },
  { to: '/leaderboard', icon: Trophy,          label: 'Ranks' },
  { to: '/settings',    icon: User,            label: 'Profile' },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const { t, lang, setLang } = useTranslation();
  const user = getUser();
  const isOnline = useOnlineStatus();
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('sb_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('sb_theme', next ? 'dark' : 'light');
  }

  function handleLogout() {
    clearSession();
    navigate('/');
  }

  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    apiFetch<{ unreadCount: number }>('/notifications')
      .then(d => setUnreadCount(d.unreadCount))
      .catch(() => {});
  }, []);

  const navLabels: Record<string, string> = {
    dashboard:   t.dashboard.title,
    create:      t.create.title,
    planner:     'Study Planner',
    leaderboard: 'Leaderboard',
    settings:    t.settings.title,
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-6 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900">
          <Zap className="w-4 h-4 text-white fill-white" />
        </div>
        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight">StudyBuild</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, labelKey }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {navLabels[labelKey]}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
        {/* Language + Theme */}
        <div className="flex items-center gap-2 px-3">
          <button onClick={() => setLang('en')} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${lang === 'en' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>EN</button>
          <button onClick={() => setLang('de')} className={`text-xs font-semibold px-2 py-1 rounded-lg transition-colors ${lang === 'de' ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>DE</button>
          <button onClick={toggleTheme} className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* User */}
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.displayName?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{user?.displayName || 'User'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>

        <NavLink to="/planner"
          className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
          <div className="relative">
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </NavLink>

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950 transition-colors">
          <LogOut className="w-4 h-4" />
          {t.nav.signOut}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile header — logo + theme/lang toggles */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isOnline && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 mr-1">
              Offline
            </span>
          )}
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100">StudyBuild</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLang(lang === 'en' ? 'de' : 'en')}
            className="text-xs font-semibold px-2 py-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            {lang.toUpperCase()}
          </button>
          <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile top padding */}
      <div className="lg:hidden h-14" />

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex">
        {bottomNavLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
