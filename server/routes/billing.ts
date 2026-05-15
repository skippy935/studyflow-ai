import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import {
  createCheckoutSession,
  createPortalSession,
  cancelSubscription,
  changePlan,
  getSubscriptionStatus,
  type PlanTier,
  type PlanInterval,
} from '../services/paymentService';

const router = Router();
router.use(auth);

// POST /api/billing/create-checkout
router.post('/create-checkout', async (req: AuthRequest, res) => {
  const { tier, interval, promoCode } = req.body ?? {};
  if (!tier || !interval) {
    res.status(400).json({ error: 'tier and interval are required' }); return;
  }
  if (!['premium', 'school'].includes(tier)) {
    res.status(400).json({ error: 'Invalid tier' }); return;
  }
  if (!['month', 'year'].includes(interval)) {
    res.status(400).json({ error: 'Invalid interval' }); return;
  }
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    res.status(503).json({ error: 'Payment system not configured' }); return;
  }

  try {
    const p = require('../lib/prisma').default as any;
    const user = await p.user.findUnique({
      where: { id: req.userId },
      select: { email: true, subscriptionTier: true },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const session = await createCheckoutSession(
      req.userId!,
      user.email,
      tier as PlanTier,
      interval as PlanInterval,
      promoCode,
    );

    res.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('[Billing] checkout error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
});

// POST /api/billing/portal
router.post('/portal', async (req: AuthRequest, res) => {
  try {
    const session = await createPortalSession(req.userId!);
    res.json({ url: session.url });
  } catch (err: any) {
    console.error('[Billing] portal error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to open billing portal' });
  }
});

// POST /api/billing/cancel
router.post('/cancel', async (req: AuthRequest, res) => {
  try {
    await cancelSubscription(req.userId!);
    res.json({ ok: true, message: 'Subscription will cancel at end of current period' });
  } catch (err: any) {
    console.error('[Billing] cancel error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to cancel subscription' });
  }
});

// POST /api/billing/change-plan
router.post('/change-plan', async (req: AuthRequest, res) => {
  const { tier, interval } = req.body ?? {};
  if (!tier || !interval) { res.status(400).json({ error: 'tier and interval required' }); return; }

  try {
    await changePlan(req.userId!, tier as PlanTier, interval as PlanInterval);
    res.json({ ok: true });
  } catch (err: any) {
    console.error('[Billing] change-plan error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to change plan' });
  }
});

// GET /api/billing/status
router.get('/status', async (req: AuthRequest, res) => {
  try {
    const data = await getSubscriptionStatus(req.userId!);
    res.json(data);
  } catch (err: any) {
    console.error('[Billing] status error:', err.message);
    res.status(500).json({ error: 'Failed to fetch billing status' });
  }
});

// POST /api/billing/sync-session — called by success page to immediately activate subscription
// even if the webhook hasn't fired yet (important for test mode + slow webhooks)
router.post('/sync-session', async (req: AuthRequest, res) => {
  const { sessionId } = req.body ?? {};
  if (!sessionId) { res.status(400).json({ error: 'sessionId required' }); return; }

  try {
    const stripe = require('../lib/stripe').default as import('stripe').default;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.payment_status !== 'paid' && session.status !== 'complete') {
      res.status(402).json({ error: 'Payment not completed' }); return;
    }

    const userId = parseInt(session.metadata?.userId ?? '0');
    if (!userId || userId !== req.userId) {
      res.status(403).json({ error: 'Session does not belong to this user' }); return;
    }

    const sub = session.subscription as import('stripe').Stripe.Subscription;
    if (!sub) { res.status(404).json({ error: 'No subscription in session' }); return; }

    const meta = sub.metadata as { tier?: string; interval?: string };
    const rawTier = meta.tier ?? 'premium';
    const tier = rawTier.includes('_') ? rawTier.split('_')[0] : rawTier;
    const interval = meta.interval ?? 'month';

    const { activateSubscription } = require('../services/paymentService');
    await activateSubscription(
      userId,
      sub.id,
      sub.items.data[0].price.id,
      tier,
      interval,
      new Date(sub.current_period_start * 1000),
      new Date(sub.current_period_end * 1000),
      sub.trial_start ? new Date(sub.trial_start * 1000) : undefined,
      sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
    );

    res.json({ ok: true, tier, status: sub.status });
  } catch (err: any) {
    console.error('[Billing] sync-session error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to sync session' });
  }
});

// GET /api/billing/invoices
router.get('/invoices', async (req: AuthRequest, res) => {
  try {
    const p = require('../lib/prisma').default as any;
    const invoices = await p.stripeInvoice.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: 24,
    });
    res.json(invoices);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
});

export default router;
