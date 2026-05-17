import { useState } from 'react';
import { Check, Zap, Star, GraduationCap, Building2, Loader2, Users, Gift, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { getUser } from '../lib/auth';
import { useSubscription } from '../hooks/useSubscription';
import toast from 'react-hot-toast';

export default function PricingPage() {
  const user = getUser();
  const navigate = useNavigate();
  const { subscription, startCheckout } = useSubscription();
  const [interval, setInterval] = useState<'month' | 'year'>('month');
  const [loading, setLoading] = useState<string | null>(null);
  const [promoInput, setPromoInput] = useState('');

  const currentTier = subscription?.tier ?? user?.subscriptionTier ?? 'free';
  const isActive = subscription && ['active', 'trialing'].includes(subscription.status);

  async function handleSelect(tier: 'premium' | 'school') {
    if (tier === currentTier && isActive) { navigate('/billing'); return; }
    setLoading(tier);
    try {
      await startCheckout(tier, interval, promoInput.trim() || undefined);
    } catch (err: any) {
      if (err.message?.includes('not configured')) {
        toast.error('Zahlungssystem noch nicht eingerichtet — bitte wende dich an den Support.');
      } else {
        toast.error(err.message ?? 'Fehler beim Starten des Checkouts');
      }
      setLoading(null);
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'LearnStarter',
      tagline: 'Kostenlos starten',
      icon: Zap,
      price: { month: '€0', year: '€0' },
      badge: null,
      color: 'border-slate-200 dark:border-slate-700',
      headerBg: 'bg-slate-50 dark:bg-slate-800',
      headerText: 'text-slate-900 dark:text-slate-100',
      headerSub: 'text-slate-500',
      ctaStyle: 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default',
      features: [
        '5 Material-Uploads / Monat',
        'Basis-Optimierung (Quiz, Flashcards)',
        '3 kostenlose Lern-Kits',
        'Standard-Support (Community)',
        'Export: Plain Text & Copy-Paste',
        'Lernplaner',
        'Streak & XP-System',
      ],
    },
    {
      id: 'premium',
      name: 'LearnPro',
      tagline: 'Für ernsthafte Lerner',
      icon: Star,
      price: { month: '€2,99', year: '€24,99' },
      yearlySaving: '33 % gespart',
      badge: '⭐ Beliebteste Wahl',
      color: 'border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-500/30',
      headerBg: 'bg-gradient-to-br from-indigo-600 to-violet-600',
      headerText: 'text-white',
      headerSub: 'text-white/80',
      ctaStyle: 'bg-white text-indigo-700 font-bold shadow-lg hover:bg-indigo-50',
      features: [
        'UNBEGRENZTE Uploads & Verarbeitung',
        'Alle Output-Modi (Study Guide, Exam, Plan…)',
        '100+ Lern-Kits — vollständiger Katalog',
        'Adaptive Schwierigkeit + Lernpfad',
        'Anki / PDF / Word Export + Cloud-Sync',
        'Priority-Support (Chat <2h)',
        'Werbefrei + Offline-Modus',
        'Fortschritts-Analytics + Schwächen-Analyse',
        'Der Examiner — KI-Prüfungssimulator',
        'KI-Tutor 24/7',
      ],
    },
    {
      id: 'school',
      name: 'LearnTeam',
      tagline: 'Für Familie & Klasse',
      icon: Users,
      price: { month: '€9,99', year: '€89,99' },
      yearlySaving: '25 % gespart',
      badge: '🏆 Für Familien & Lehrer',
      color: 'border-emerald-300 dark:border-emerald-700',
      headerBg: 'bg-gradient-to-br from-emerald-600 to-teal-600',
      headerText: 'text-white',
      headerSub: 'text-white/80',
      ctaStyle: 'bg-white text-emerald-700 font-bold shadow-lg hover:bg-emerald-50',
      features: [
        'Alles aus LearnPro × 5 Accounts',
        'Gemeinsame Kit-Bibliothek + Sharing',
        'Eltern-Dashboard: Fortschritt der Kinder',
        'Lehrer-Tools: Klassen + Aufgaben',
        'Gruppen-Challenges + Leaderboards',
        'Klassen erstellen, Kits zuweisen',
        'Automatische Auswertung pro Klasse',
        'Schüler-Leaderboard (opt-in)',
      ],
    },
  ] as const;

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Gift className="w-3.5 h-3.5" /> 14 Tage LearnPro gratis — keine Kreditkarte nötig
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mb-2">
            Wähle deinen Lernplan
          </h1>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            Starte kostenlos, erlebe den Mehrwert, upgrade wenn du bereit bist.
          </p>
          {currentTier !== 'free' && isActive && (
            <p className="mt-3 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              Aktueller Plan: <span className="capitalize">{currentTier}</span>
              {subscription?.cancelAtPeriodEnd && (
                <span className="ml-2 text-red-500 font-normal">
                  (endet {new Date(subscription.currentPeriodEnd).toLocaleDateString('de-DE')})
                </span>
              )}
            </p>
          )}
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-full p-1">
            <button
              onClick={() => setInterval('month')}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${interval === 'month' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Monatlich
            </button>
            <button
              onClick={() => setInterval('year')}
              className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all ${interval === 'year' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Jährlich
              <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-0.5 rounded-full font-bold">bis −33 %</span>
            </button>
          </div>
        </div>

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {plans.map(plan => {
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.id && (plan.id === 'free' || isActive);

            return (
              <div key={plan.id} className={`relative rounded-2xl border flex flex-col overflow-hidden ${plan.color}`}>
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow z-10">
                    {plan.badge}
                  </div>
                )}

                {/* Header */}
                <div className={`${plan.headerBg} px-5 pt-7 pb-5`}>
                  <Icon className={`w-5 h-5 mb-3 ${plan.headerText}`} />
                  <p className={`font-extrabold text-xl ${plan.headerText}`}>{plan.name}</p>
                  <p className={`text-xs mb-3 ${plan.headerSub}`}>{plan.tagline}</p>
                  <p className={plan.headerText}>
                    <span className="text-3xl font-black">{plan.price[interval]}</span>
                    {plan.id !== 'free' && <span className={`text-sm ml-1 ${plan.headerSub}`}>/{interval === 'month' ? 'Monat' : 'Jahr'}</span>}
                  </p>
                  {'yearlySaving' in plan && interval === 'year' && (
                    <p className={`text-xs mt-1 font-semibold ${plan.headerSub}`}>✨ {plan.yearlySaving}</p>
                  )}
                  {plan.id === 'premium' && interval === 'month' && (
                    <p className={`text-xs mt-1 ${plan.headerSub}`}>oder €24,99/Jahr</p>
                  )}
                </div>

                {/* Features */}
                <div className="p-5 bg-white dark:bg-slate-900 flex flex-col flex-1">
                  <ul className="space-y-2.5 flex-1 mb-5">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  {plan.id === 'free' ? (
                    <button disabled className={`w-full py-2.5 rounded-xl text-sm font-semibold ${isCurrent ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                      {isCurrent ? '✓ Aktueller Plan' : 'Kostenlos starten'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelect(plan.id as 'premium' | 'school')}
                      disabled={loading !== null}
                      className={`w-full py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 ${isCurrent ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold' : plan.ctaStyle}`}
                    >
                      {loading === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : isCurrent ? '✓ Verwalten' : '14 Tage gratis testen →'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Enterprise banner */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-900 dark:to-slate-950 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white">LearnEdu — Enterprise</p>
              <p className="text-slate-400 text-sm">White-Label, LMS-Integration (Moodle, Google Classroom), DSGVO-Server in DE/EU, API-Zugang</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="flex-shrink-0 px-5 py-2.5 bg-white text-slate-900 rounded-xl font-bold text-sm hover:bg-slate-100 transition-colors"
          >
            Anfrage senden →
          </button>
        </div>

        {/* Perks row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { icon: '🎓', title: '50% Schülerrabatt', desc: 'Mit .edu-Email oder Ausweis' },
            { icon: '👥', title: 'Freunde einladen', desc: '3 Freunde → 1 Monat PRO gratis' },
            { icon: '🔒', title: 'DSGVO-konform', desc: 'Server in Deutschland / EU' },
            { icon: '⚡', title: 'Sofort kündbar', desc: 'Keine Mindestlaufzeit' },
          ].map(p => (
            <div key={p.title} className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 text-center">
              <span className="text-2xl">{p.icon}</span>
              <p className="font-bold text-slate-900 dark:text-slate-100 text-xs mt-2">{p.title}</p>
              <p className="text-slate-500 text-xs mt-0.5">{p.desc}</p>
            </div>
          ))}
        </div>

        {/* Promo code */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <Tag className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={promoInput}
            onChange={e => setPromoInput(e.target.value.toUpperCase())}
            placeholder="Promocode eingeben"
            className="px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 w-44 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {promoInput && <span className="text-xs text-emerald-600 font-semibold">✓ Wird beim Checkout angewendet</span>}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400">
          Preise in EUR inkl. MwSt. · Abrechnung über Stripe · Kreditkarte, SEPA & PayPal akzeptiert
          {currentTier !== 'free' && isActive && (
            <> · <button onClick={() => navigate('/billing')} className="text-indigo-500 underline">Abonnement verwalten</button></>
          )}
        </p>
      </div>
    </AppLayout>
  );
}
