import { useState } from 'react';
import { Check, Zap, Star, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import Button from '../components/ui/Button';
import { getUser } from '../lib/auth';
import { apiFetch } from '../lib/api';
import toast from 'react-hot-toast';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '€0',
    period: '',
    icon: Zap,
    color: 'border-slate-200 dark:border-slate-700',
    headerColor: 'bg-slate-50 dark:bg-slate-800',
    features: [
      '50 AI-generated flashcards/month',
      '5 AI quizzes/month',
      '3 study summaries/month',
      'Basic spaced repetition',
      'Study planner',
      'Offline mode',
    ],
    cta: 'Current plan',
    ctaDisabled: true,
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '€7.99',
    period: '/month',
    icon: Star,
    color: 'border-indigo-300 dark:border-indigo-700 ring-2 ring-indigo-500',
    headerColor: 'bg-indigo-600',
    popular: true,
    features: [
      'Unlimited AI flashcards',
      'Unlimited quizzes & summaries',
      'PDF, image & YouTube upload',
      'The Examiner (oral practice)',
      'AI Tutor 24/7',
      'Smart study scheduling',
      'Study groups',
      'Advanced analytics',
      'Parent dashboard',
      'Priority support',
    ],
    cta: 'Start 14-day free trial',
    ctaDisabled: false,
  },
  {
    id: 'student',
    name: 'Student',
    price: '€3.99',
    period: '/month',
    icon: GraduationCap,
    color: 'border-emerald-200 dark:border-emerald-800',
    headerColor: 'bg-emerald-600',
    features: [
      'All Premium features',
      '.edu email required',
      'Student leaderboard',
      'Group study rooms',
    ],
    cta: 'Verify student status',
    ctaDisabled: false,
  },
];

export default function PricingPage() {
  const user = getUser();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);
  const currentTier = user?.subscriptionTier || 'free';

  async function selectPlan(planId: string) {
    if (planId === 'free' || planId === currentTier) return;
    setLoading(planId);
    try {
      // In production: redirect to Stripe checkout
      // For now: simulate upgrade via API
      await apiFetch('/auth/me', {
        method: 'PUT' as unknown as 'GET',
        body: JSON.stringify({ subscriptionTier: planId }),
      });
      toast.success(`Upgraded to ${planId}! (Demo mode — no payment required)`);
      navigate('/settings');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(null);
    }
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">Choose your plan</h1>
          <p className="text-slate-500 mt-2">14 days Premium free — no credit card needed.</p>
          {currentTier !== 'free' && (
            <p className="mt-2 text-sm font-semibold text-indigo-600">
              Current plan: <span className="capitalize">{currentTier}</span>
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map(plan => {
            const Icon = plan.icon;
            const isCurrent = currentTier === plan.id;
            return (
              <div key={plan.id} className={`relative rounded-2xl border overflow-hidden ${plan.color}`}>
                {plan.popular && (
                  <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    Most Popular
                  </div>
                )}
                <div className={`p-5 ${plan.headerColor}`}>
                  <Icon className={`w-6 h-6 mb-2 ${plan.id === 'free' ? 'text-slate-500' : 'text-white'}`} />
                  <p className={`font-extrabold text-lg ${plan.id === 'free' ? 'text-slate-900 dark:text-slate-100' : 'text-white'}`}>{plan.name}</p>
                  <p className={`mt-1 ${plan.id === 'free' ? 'text-slate-500' : 'text-white/80'}`}>
                    <span className="text-2xl font-black">{plan.price}</span>
                    <span className="text-sm">{plan.period}</span>
                  </p>
                </div>
                <div className="p-5 bg-white dark:bg-slate-900 space-y-3">
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="w-full justify-center mt-4"
                    variant={plan.id === 'premium' ? 'primary' : 'ghost'}
                    disabled={isCurrent || plan.ctaDisabled}
                    loading={loading === plan.id}
                    onClick={() => selectPlan(plan.id)}>
                    {isCurrent ? '✓ Current plan' : plan.cta}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Prices shown in EUR. Billing handled securely via Stripe. Cancel anytime.
        </p>
      </div>
    </AppLayout>
  );
}
