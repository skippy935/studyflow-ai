import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('[Stripe] STRIPE_SECRET_KEY not set — payment features disabled');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? 'sk_test_placeholder', {
  apiVersion: '2024-06-20',
  typescript: true,
});

export default stripe;

export const STRIPE_CONFIG = {
  currency: 'eur',
  taxRateId: process.env.STRIPE_TAX_RATE_ID ?? '',  // 19% MwSt in Stripe
  prices: {
    premiumMonthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID ?? '',
    premiumYearly:  process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID ?? '',
    schoolMonthly:  process.env.STRIPE_SCHOOL_MONTHLY_PRICE_ID ?? '',
    schoolYearly:   process.env.STRIPE_SCHOOL_YEARLY_PRICE_ID ?? '',
  },
  successUrl: `${process.env.APP_URL ?? 'https://studyflow-ai-production.up.railway.app'}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
  cancelUrl:  `${process.env.APP_URL ?? 'https://studyflow-ai-production.up.railway.app'}/pricing`,
  portalReturnUrl: `${process.env.APP_URL ?? 'https://studyflow-ai-production.up.railway.app'}/billing`,
};
