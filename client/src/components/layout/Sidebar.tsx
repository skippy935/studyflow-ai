import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import {
  LayoutDashboard, Plus, Settings, LogOut, Zap, Moon, Sun,
  CalendarCheck, GraduationCap, User, Trophy, Bell, CreditCard,
  Sparkles, Package, ClipboardCheck,
} from 'lucide-react';
import { clearSession, getUser } from '../../lib/auth';
import { useTranslation } from '../../i18n';
import { apiFetch } from '../../lib/api';

const navLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard'   },
  { to: '/create',      icon: Plus,            label: 'Create'      },
  { to: '/examiner',    icon: ClipboardCheck,  label: 'Examiner'    },
  { to: '/kits',        icon: Package,         label: 'Kits'        },
  { to: '/planner',     icon: CalendarCheck,   label: 'Planner'     },
  { to: '/sage',        icon: Sparkles,        label: 'Sage Tutor'  },
  { to: '/leaderboard', icon: Trophy,          label: 'Leaderboard' },
  { to: '/billing',     icon: CreditCard,      label: 'Billing'     },
  { to: '/settings',    icon: Settings,        label: 'Settings'    },
];

const mobileNavLinks = [
  { to: '/dashboard',   icon: LayoutDashboard, label: 'Home'   },
  { to: '/create',      icon: Plus,            label: 'Create' },
  { to: '/examiner',    icon: GraduationCap,   label: 'Exam'   },
  { to: '/leaderboard', icon: Trophy,          label: 'Ranks'  },
  { to: '/settings',    icon: User,            label: 'Profile'},
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

  const avatar = user?.displayName?.charAt(0)?.toUpperCase() || '?';

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col w-64 bg-white dark:bg-[#0F172A] border-r border-slate-100 dark:border-white/5 z-30">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-100 dark:border-white/5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-lg tracking-tight">
              StudyBuild
            </span>
            {!isOnline && (
              <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
                Offline
              </span>
            )}
          </div>

          {/* Nav links */}
          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-100'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom controls */}
          <div className="px-3 py-4 border-t border-slate-100 dark:border-white/5 space-y-2">
            {/* Lang + Theme */}
            <div className="flex items-center gap-1.5 px-3">
              <button
                onClick={() => setLang('en')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  lang === 'en'
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('de')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                  lang === 'de'
                    ? 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                }`}
              >
                DE
              </button>
              <button
                onClick={toggleTheme}
                className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500 dark:text-slate-400"
                aria-label="Toggle theme"
              >
                {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>

            {/* Notifications */}
            <NavLink
              to="/planner"
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'
                }`
              }
            >
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

            {/* User card */}
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-all"
            >
              <LogOut className="w-4 h-4" />
              {t.nav.signOut}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Mobile top header ── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 bg-white/90 dark:bg-[#0F172A]/90 backdrop-blur-md border-b border-slate-100 dark:border-white/5 px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white fill-white" />
          </div>
          <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">StudyBuild</span>
          {!isOnline && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400">
              Offline
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setLang(lang === 'en' ? 'de' : 'en')}
            className="text-xs font-semibold px-2 py-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            {lang.toUpperCase()}
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-slate-500"
            aria-label="Toggle theme"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Mobile top spacer */}
      <div className="lg:hidden h-14 flex-shrink-0" />

      {/* ── Mobile bottom nav ── */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-100 dark:border-white/5 flex"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {mobileNavLinks.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center pt-2 pb-1.5 gap-0.5 relative transition-colors ${
                isActive
                  ? 'text-indigo-600 dark:text-indigo-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-[3px] rounded-full bg-gradient-to-r from-indigo-500 to-violet-600" />
                )}
                <div className="relative">
                  <Icon className={`w-5 h-5 transition-transform duration-150 ${isActive ? 'scale-110' : ''}`} />
                  {to === '/planner' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? '' : 'font-medium'}`}>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </>
  );
}
