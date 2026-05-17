import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, GraduationCap, RefreshCw, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import { apiFetch } from '../lib/api';
import { clearSession } from '../lib/auth';

type Status = 'pending' | 'pending_approval' | 'approved' | 'rejected';

export default function TeacherPendingPage() {
  const navigate = useNavigate();
  const [status, setStatus]             = useState<Status>('pending_approval');
  const [rejectionReason, setRejection] = useState('');
  const [checking, setChecking]         = useState(false);

  useEffect(() => {
    checkStatus();
    // Poll every 30s
    const interval = setInterval(checkStatus, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function checkStatus() {
    try {
      const data = await apiFetch<{ teacherStatus: string; profile?: { rejectionReason?: string } }>('/teacher/profile');
      const s = (data as any).profile?.verificationStatus ?? (data as any).teacherStatus;
      setStatus((s as Status) || 'pending_approval');
      if ((data as any).profile?.rejectionReason) setRejection((data as any).profile.rejectionReason);
      if (s === 'approved') {
        navigate('/teacher');
      }
    } catch {
      // silent
    }
  }

  async function refresh() {
    setChecking(true);
    await checkStatus();
    setChecking(false);
  }

  function logout() {
    clearSession();
    navigate('/login');
  }

  const statusConfig = {
    pending:          { icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-950',  label: 'Profil unvollständig' },
    pending_approval: { icon: Clock,        color: 'text-amber-500',  bg: 'bg-amber-100 dark:bg-amber-950',  label: 'Warte auf Freigabe' },
    approved:         { icon: CheckCircle,  color: 'text-emerald-500',bg: 'bg-emerald-100 dark:bg-emerald-950', label: 'Freigegeben!' },
    rejected:         { icon: XCircle,      color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-950',      label: 'Nicht genehmigt' },
  };

  const cfg = statusConfig[status] || statusConfig.pending_approval;
  const Icon = cfg.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center">

          {/* Icon */}
          <div className={`w-20 h-20 ${cfg.bg} rounded-full flex items-center justify-center mx-auto mb-6`}>
            <Icon className={`w-10 h-10 ${cfg.color}`} />
          </div>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 ${cfg.bg} ${cfg.color}`}>
            <GraduationCap className="w-3 h-3" />
            {cfg.label}
          </div>

          {status === 'pending_approval' && (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
                Dein Antrag wird geprüft 📋
              </h1>
              <p className="text-slate-500 text-sm mb-4 leading-relaxed">
                Dein Lehrer-Profil wurde erfolgreich eingereicht. Unser Team prüft deine Angaben und schaltet dein Konto in der Regel <strong>innerhalb von 24 Stunden</strong> frei.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Registrierung abgeschlossen
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Profil eingereicht (Schule, Bundesland, Fächer)
                </div>
                <div className="flex items-center gap-2 text-sm text-amber-500">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                  Manuelle Prüfung durch Admin (ausstehend)
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full" />
                  Zugang zum Lehrer-Dashboard
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={refresh} loading={checking}>
                  <RefreshCw className="w-4 h-4" /> Status prüfen
                </Button>
                <Button variant="ghost" className="flex-1" onClick={logout}>
                  <LogOut className="w-4 h-4" /> Abmelden
                </Button>
              </div>
            </>
          )}

          {status === 'pending' && (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
                Profil unvollständig
              </h1>
              <p className="text-slate-500 text-sm mb-6">
                Du hast dein Lehrer-Profil noch nicht vollständig ausgefüllt. Bitte ergänze Schule, Bundesland und Fächer.
              </p>
              <Button size="lg" className="w-full" onClick={() => navigate('/teacher/onboarding')}>
                Profil vervollständigen →
              </Button>
            </>
          )}

          {status === 'rejected' && (
            <>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mb-3">
                Antrag abgelehnt
              </h1>
              <p className="text-slate-500 text-sm mb-4">
                Dein Lehrer-Konto wurde leider nicht genehmigt.
              </p>
              {rejectionReason && (
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-left">
                  <p className="text-xs font-semibold text-red-600 mb-1">Begründung:</p>
                  <p className="text-sm text-red-700 dark:text-red-400">{rejectionReason}</p>
                </div>
              )}
              <p className="text-xs text-slate-400 mb-6">
                Bei Fragen wende dich an unseren Support.
              </p>
              <Button variant="ghost" className="w-full" onClick={logout}>
                <LogOut className="w-4 h-4" /> Abmelden
              </Button>
            </>
          )}

        </div>
      </motion.div>
    </div>
  );
}
