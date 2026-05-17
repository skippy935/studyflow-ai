import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface SubscriptionData {
  id: number;
  userId: number;
  stripeSubscriptionId: string;
  stripePriceId: string;
  status: string;
  tier: string;
  interval: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  trialStart: string | null;
  trialEnd: string | null;
}

export interface InvoiceData {
  id: number;
  stripeInvoiceId: string;
  invoiceNumber: string;
  amount: number;
  amountNet: number;
  tax: number;
  currency: string;
  status: string;
  pdfUrl: string | null;
  hostedUrl: string | null;
  periodStart: string | null;
  periodEnd: string | null;
  createdAt: string;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch<{ subscription: SubscriptionData | null; invoices: InvoiceData[] }>('/billing/status');
      setSubscription(data.subscription);
      setInvoices(data.invoices);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function startCheckout(tier: 'premium' | 'school', interval: 'month' | 'year', promoCode?: string) {
    const data = await apiFetch<{ url: string }>('/billing/create-checkout', {
      method: 'POST',
      body: JSON.stringify({ tier, interval, promoCode }),
    });
    window.location.href = data.url;
  }

  async function openPortal() {
    const data = await apiFetch<{ url: string }>('/billing/portal', { method: 'POST' });
    window.location.href = data.url;
  }

  async function cancelPlan() {
    await apiFetch('/billing/cancel', { method: 'POST' });
    await load();
  }

  return { subscription, invoices, loading, error, startCheckout, openPortal, cancelPlan, reload: load };
}
