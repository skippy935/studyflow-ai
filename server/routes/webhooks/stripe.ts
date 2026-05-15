import { Router, Request, Response } from 'express';
import Stripe from 'stripe';
import stripeClient from '../../lib/stripe';
import prisma from '../../lib/prisma';
import {
  activateSubscription,
  deactivateSubscription,
  recordInvoice,
} from '../../services/paymentService';

const router = Router();
const p = prisma as any;

// Raw body middleware — must be registered BEFORE express.json() in index.ts
router.post(
  '/',
  // express.raw is applied per-route in index.ts so express.json doesn't consume the body
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('[Webhook] STRIPE_WEBHOOK_SECRET not set');
      res.status(500).json({ error: 'Webhook not configured' }); return;
    }

    let event: Stripe.Event;
    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('[Webhook] Signature verification failed:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`); return;
    }

    // Idempotency check
    const existing = await p.stripeWebhookEvent.findUnique({ where: { eventId: event.id } });
    if (existing?.processed) {
      res.json({ received: true, skipped: true }); return;
    }

    // Record event
    await p.stripeWebhookEvent.upsert({
      where: { eventId: event.id },
      create: { eventId: event.id, type: event.type },
      update: {},
    });

    try {
      await handleEvent(event);
      await p.stripeWebhookEvent.update({ where: { eventId: event.id }, data: { processed: true } });
    } catch (err: any) {
      console.error(`[Webhook] Error handling ${event.type}:`, err.message);
      await p.stripeWebhookEvent.update({
        where: { eventId: event.id },
        data: { error: err.message },
      });
      res.status(500).json({ error: 'Webhook handler failed' }); return;
    }

    res.json({ received: true });
  },
);

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== 'subscription') break;

      const userId = parseInt(session.metadata?.userId ?? '0');
      if (!userId) break;

      const sub = await stripeClient.subscriptions.retrieve(session.subscription as string);
      const meta = sub.metadata as { tier?: string; interval?: string };

      // Normalise tier — legacy format stored "premium_month", new format stores "premium"
      const rawTier = meta.tier ?? 'premium';
      const tier = rawTier.includes('_') ? rawTier.split('_')[0] : rawTier;

      await activateSubscription(
        userId,
        sub.id,
        sub.items.data[0].price.id,
        tier,
        meta.interval ?? 'month',
        new Date(sub.current_period_start * 1000),
        new Date(sub.current_period_end * 1000),
        sub.trial_start ? new Date(sub.trial_start * 1000) : undefined,
        sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
      );
      break;
    }

    case 'customer.subscription.updated': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await getUserIdFromSub(sub);
      if (!userId) break;

      const meta = sub.metadata as { tier?: string; interval?: string };
      const status = sub.status;
      const rawTier2 = meta.tier ?? 'premium';
      const tier2 = rawTier2.includes('_') ? rawTier2.split('_')[0] : rawTier2;

      if (status === 'active' || status === 'trialing') {
        await activateSubscription(
          userId,
          sub.id,
          sub.items.data[0].price.id,
          tier2,
          meta.interval ?? 'month',
          new Date(sub.current_period_start * 1000),
          new Date(sub.current_period_end * 1000),
          sub.trial_start ? new Date(sub.trial_start * 1000) : undefined,
          sub.trial_end ? new Date(sub.trial_end * 1000) : undefined,
        );
      } else if (status === 'canceled') {
        await deactivateSubscription(userId);
      } else {
        // past_due, incomplete, unpaid — update status only
        await p.stripeSubscription.updateMany({
          where: { userId },
          data: {
            status,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            canceledAt: sub.canceled_at ? new Date(sub.canceled_at * 1000) : null,
          },
        });
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription;
      const userId = await getUserIdFromSub(sub);
      if (!userId) break;
      await deactivateSubscription(userId);
      break;
    }

    case 'invoice.paid': {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.customer) break;

      const customer = await p.stripeCustomer.findUnique({
        where: { stripeCustomerId: invoice.customer as string },
      });
      if (!customer) break;

      const amountPaid = (invoice.amount_paid ?? 0) / 100;
      const taxAmount = (invoice.tax ?? 0) / 100;
      const amountNet = amountPaid - taxAmount;

      await recordInvoice(
        customer.userId,
        invoice.id,
        invoice.number ?? '',
        amountPaid,
        amountNet,
        taxAmount,
        invoice.currency ?? 'eur',
        'paid',
        invoice.invoice_pdf ?? null,
        invoice.hosted_invoice_url ?? null,
        invoice.period_start ? new Date(invoice.period_start * 1000) : null,
        invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      );
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      if (!invoice.customer) break;
      const customer = await p.stripeCustomer.findUnique({
        where: { stripeCustomerId: invoice.customer as string },
      });
      if (!customer) break;

      await recordInvoice(
        customer.userId,
        invoice.id,
        invoice.number ?? '',
        (invoice.amount_due ?? 0) / 100,
        0,
        0,
        invoice.currency ?? 'eur',
        'open',
        null,
        invoice.hosted_invoice_url ?? null,
        invoice.period_start ? new Date(invoice.period_start * 1000) : null,
        invoice.period_end ? new Date(invoice.period_end * 1000) : null,
      );
      break;
    }

    default:
      // Unhandled events — no-op
      break;
  }
}

async function getUserIdFromSub(sub: Stripe.Subscription): Promise<number | null> {
  // Try metadata first
  const metaUserId = parseInt(sub.metadata?.userId ?? '0');
  if (metaUserId) return metaUserId;

  // Fall back to customer lookup
  const customer = await p.stripeCustomer.findUnique({
    where: { stripeCustomerId: sub.customer as string },
  });
  return customer?.userId ?? null;
}

export default router;
