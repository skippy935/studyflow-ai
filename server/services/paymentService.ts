import stripe, { STRIPE_CONFIG } from '../lib/stripe';
import prisma from '../lib/prisma';

const p = prisma as any;

// ─── Customer ────────────────────────────────────────────────────────────────

export async function getOrCreateCustomer(userId: number, email: string): Promise<string> {
  const existing = await p.stripeCustomer.findUnique({ where: { userId } });
  if (existing) return existing.stripeCustomerId;

  const customer = await stripe.customers.create({
    email,
    metadata: { userId: String(userId) },
  });

  await p.stripeCustomer.create({
    data: { userId, stripeCustomerId: customer.id },
  });

  return customer.id;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export type PlanInterval = 'month' | 'year';
export type PlanTier = 'premium' | 'school';

function getPriceId(tier: PlanTier, interval: PlanInterval): string {
  if (tier === 'premium' && interval === 'month') return STRIPE_CONFIG.prices.premiumMonthly;
  if (tier === 'premium' && interval === 'year')  return STRIPE_CONFIG.prices.premiumYearly;
  if (tier === 'school'  && interval === 'month') return STRIPE_CONFIG.prices.schoolMonthly;
  if (tier === 'school'  && interval === 'year')  return STRIPE_CONFIG.prices.schoolYearly;
  throw new Error(`Unknown plan: ${tier}/${interval}`);
}

export async function createCheckoutSession(
  userId: number,
  email: string,
  tier: PlanTier,
  interval: PlanInterval,
  promoCode?: string,
) {
  const customerId = await getOrCreateCustomer(userId, email);
  const priceId = getPriceId(tier, interval);

  const params: any = {
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: STRIPE_CONFIG.successUrl,
    cancel_url: STRIPE_CONFIG.cancelUrl,
    subscription_data: {
      trial_period_days: 14,
      metadata: { userId: String(userId), tier, interval },
    },
    payment_method_types: ['card', 'sepa_debit', 'paypal'],
    billing_address_collection: 'required',
    customer_update: { address: 'auto', name: 'auto' },
    locale: 'de',
    metadata: { userId: String(userId) },
  };

  if (STRIPE_CONFIG.taxRateId) {
    params.line_items[0].tax_rates = [STRIPE_CONFIG.taxRateId];
  }

  // Validate promo code against Stripe promotion codes
  if (promoCode) {
    const codes = await stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 });
    if (codes.data.length > 0) {
      params.discounts = [{ promotion_code: codes.data[0].id }];
    }
  }

  const session = await stripe.checkout.sessions.create(params);
  return session;
}

// ─── Customer Portal ──────────────────────────────────────────────────────────

export async function createPortalSession(userId: number) {
  const customer = await p.stripeCustomer.findUnique({ where: { userId } });
  if (!customer) throw new Error('No billing account found');

  const session = await stripe.billingPortal.sessions.create({
    customer: customer.stripeCustomerId,
    return_url: STRIPE_CONFIG.portalReturnUrl,
  });

  return session;
}

// ─── Subscription management ──────────────────────────────────────────────────

export async function cancelSubscription(userId: number) {
  const sub = await p.stripeSubscription.findUnique({ where: { userId } });
  if (!sub) throw new Error('No active subscription');

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    cancel_at_period_end: true,
  });

  await p.stripeSubscription.update({
    where: { userId },
    data: { cancelAtPeriodEnd: true },
  });
}

export async function changePlan(userId: number, newTier: PlanTier, newInterval: PlanInterval) {
  const sub = await p.stripeSubscription.findUnique({ where: { userId } });
  if (!sub) throw new Error('No active subscription');

  const priceId = getPriceId(newTier, newInterval);
  const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);

  await stripe.subscriptions.update(sub.stripeSubscriptionId, {
    items: [{ id: stripeSub.items.data[0].id, price: priceId }],
    proration_behavior: 'always_invoice',
  });

  await p.stripeSubscription.update({
    where: { userId },
    data: { stripePriceId: priceId, tier: newTier, interval: newInterval, cancelAtPeriodEnd: false },
  });
}

// ─── Subscription status ──────────────────────────────────────────────────────

export async function getSubscriptionStatus(userId: number) {
  const sub = await p.stripeSubscription.findUnique({ where: { userId } });
  const invoices = await p.stripeInvoice.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return { subscription: sub, invoices };
}

// ─── Activate / Deactivate user tier ─────────────────────────────────────────

export async function activateSubscription(
  userId: number,
  stripeSubscriptionId: string,
  stripePriceId: string,
  tier: string,
  interval: string,
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  trialStart?: Date,
  trialEnd?: Date,
) {
  await p.stripeSubscription.upsert({
    where: { userId },
    create: {
      userId,
      stripeSubscriptionId,
      stripePriceId,
      tier,
      interval,
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
      trialStart: trialStart ?? null,
      trialEnd: trialEnd ?? null,
    },
    update: {
      stripeSubscriptionId,
      stripePriceId,
      tier,
      interval,
      status: 'active',
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      canceledAt: null,
      trialStart: trialStart ?? null,
      trialEnd: trialEnd ?? null,
    },
  });

  await p.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      trialEndDate: trialEnd ?? null,
    },
  });
}

export async function deactivateSubscription(userId: number) {
  await p.stripeSubscription.updateMany({
    where: { userId },
    data: { status: 'canceled', canceledAt: new Date() },
  });

  await p.user.update({
    where: { id: userId },
    data: { subscriptionTier: 'free', trialEndDate: null },
  });
}

// ─── Record invoice ──────────────────────────────────────────────────────────

export async function recordInvoice(
  userId: number,
  stripeInvoiceId: string,
  invoiceNumber: string,
  amount: number,
  amountNet: number,
  tax: number,
  currency: string,
  status: string,
  pdfUrl: string | null,
  hostedUrl: string | null,
  periodStart: Date | null,
  periodEnd: Date | null,
) {
  await p.stripeInvoice.upsert({
    where: { stripeInvoiceId },
    create: {
      userId,
      stripeInvoiceId,
      invoiceNumber,
      amount,
      amountNet,
      tax,
      currency,
      status,
      pdfUrl,
      hostedUrl,
      periodStart,
      periodEnd,
    },
    update: { status, pdfUrl, hostedUrl },
  });
}
