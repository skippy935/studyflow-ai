import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CreditCard, FileText, ExternalLink, XCircle, RefreshCw,
  CheckCircle, AlertTriangle, Clock, Loader2,
} from 'lucide-react';
import AppLayout from '../components/layout/AppLayout';
import { useSubscription } from '../hooks/useSubscription';
import { getUser } from '../lib/auth';
import toast from 'react-hot-toast';

const TIER_LABELS: Record<string, string> = {
  premium: 'Premium',
  school: 'Schule',
  free: 'Kostenlos',
};

const STATUS_BADGE: Record<string, { label: string; color: string; Icon: any }> = {
  active:     { label: 'Aktiv',           color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', Icon: CheckCircle },
  trialing:   { label: 'Probephase',      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',   Icon: Clock },
  past_due:   { label: 'Zahlung offen',   color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',      Icon: AlertTriangle },
  canceled:   { label: 'Gekündigt',       color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',              Icon: XCircle },
  incomplete: { label: 'Unvollständig',   color: 'bg-slate-100 text-slate-600',                                               Icon: AlertTriangle },
};

function formatEur(amount: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(amount);
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function BillingPage() {
  const user = getUser();
  const navigate = useNavigate();
  const { subscription, invoices, loading, error, openPortal, cancelPlan, reload } = useSubscription();
  const [canceling, setCanceling] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const hasActiveSub = subscription && ['active', 'trialing'].includes(subscription.status);
  const badge = subscription ? (STATUS_BADGE[subscription.status] ?? STATUS_BADGE.incomplete) : null;

  async function handleOpenPortal() {
    setPortalLoading(true);
    try {
      await openPortal();
    } catch (err: any) {
      toast.error(err.message ?? 'Fehler beim Öffnen des Kundenportals');
      setPortalLoading(false);
    }
  }

  async function handleCancel() {
    setCanceling(true);
    try {
      await cancelPlan();
      setShowCancelConfirm(false);
      toast.success('Abonnement wird zum Ende des Abrechnungszeitraums gekündigt.');
    } catch (err: any) {
      toast.error(err.message ?? 'Kündigung fehlgeschlagen');
    } finally {
      setCanceling(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto text-center py-16">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">Billing-Daten konnten nicht geladen werden.</p>
          <button onClick={reload} className="text-indigo-600 hover:underline text-sm">Erneut versuchen</button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">Abonnement & Rechnungen</h1>
          <button onClick={reload} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Current plan card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-indigo-500" />
              <span className="font-semibold text-slate-900 dark:text-slate-100">Aktuelles Abonnement</span>
            </div>
            {badge && (
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.color}`}>
                <badge.Icon className="w-3.5 h-3.5" />
                {badge.label}
              </span>
            )}
          </div>

          <div className="p-5">
            {!hasActiveSub ? (
              <div className="text-center py-6">
                <p className="text-slate-500 mb-4">Du hast kein aktives Abonnement.</p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-sm"
                >
                  Plan auswählen
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Plan</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {TIER_LABELS[subscription!.tier] ?? subscription!.tier}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Abrechnung</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {subscription!.interval === 'month' ? 'Monatlich' : 'Jährlich'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-xs mb-0.5">Aktuelle Periode</p>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      {formatDate(subscription!.currentPeriodStart)} – {formatDate(subscription!.currentPeriodEnd)}
                    </p>
                  </div>
                  {subscription!.trialEnd && new Date(subscription!.trialEnd) > new Date() && (
                    <div>
                      <p className="text-slate-400 text-xs mb-0.5">Probephase endet</p>
                      <p className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {formatDate(subscription!.trialEnd)}
                      </p>
                    </div>
                  )}
                  {subscription!.cancelAtPeriodEnd && (
                    <div className="col-span-2">
                      <p className="text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" />
                        Kündigung aktiv — Zugang bis {formatDate(subscription!.currentPeriodEnd)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleOpenPortal}
                    disabled={portalLoading}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold"
                  >
                    {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                    Zahlungsmethode verwalten
                  </button>
                  {!subscription!.cancelAtPeriodEnd && (
                    <button
                      onClick={() => setShowCancelConfirm(true)}
                      className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-sm font-semibold"
                    >
                      <XCircle className="w-4 h-4" />
                      Kündigen
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <FileText className="w-5 h-5 text-slate-400" />
            <span className="font-semibold text-slate-900 dark:text-slate-100">Rechnungen</span>
          </div>

          {invoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Noch keine Rechnungen vorhanden.</div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {invoices.map(inv => (
                <div key={inv.id} className="flex items-center justify-between px-5 py-3 text-sm">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {inv.invoiceNumber || inv.stripeInvoiceId.slice(-8).toUpperCase()}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {formatDate(inv.periodStart)} · {formatEur(inv.amount)} inkl. {formatEur(inv.tax)} MwSt.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      inv.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {inv.status === 'paid' ? 'Bezahlt' : inv.status}
                    </span>
                    {inv.pdfUrl && (
                      <a
                        href={inv.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-indigo-500 hover:text-indigo-700 text-xs font-medium"
                      >
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </a>
                    )}
                    {inv.hostedUrl && (
                      <a
                        href={inv.hostedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account info */}
        <div className="text-xs text-slate-400 text-center space-y-1 pb-4">
          <p>Konto: {user?.email}</p>
          <p>Zahlungen werden sicher über Stripe verarbeitet · §14 UStG-konforme Rechnungen</p>
          <button
            onClick={() => navigate('/pricing')}
            className="text-indigo-500 hover:text-indigo-700 underline"
          >
            Plan wechseln →
          </button>
        </div>
      </div>

      {/* Cancel confirm modal */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">Abonnement kündigen?</h3>
            <p className="text-slate-500 text-sm mb-5">
              Du behältst vollen Zugang bis zum Ende deiner aktuellen Periode ({formatDate(subscription?.currentPeriodEnd ?? null)}).
              Danach wirst du auf den kostenlosen Plan zurückgestuft.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={canceling}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-1.5"
              >
                {canceling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Ja, kündigen
              </button>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-400"
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
