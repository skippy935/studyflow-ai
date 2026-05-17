import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api';

export interface UsageStat {
  limit: number | boolean;
  used: number;
  remaining: number | boolean;
  periodType: 'daily' | 'monthly';
  resetAt?: string;
}

export interface UsageData {
  tier: string;
  limits: Record<string, number | boolean>;
  usage: Record<string, UsageStat>;
  isPremium: boolean;
  isYearly: boolean;
  isSchool: boolean;
  xpMultiplier: number;
}

export function useUsage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const json = await apiFetch<UsageData>('/usage');
      setData(json);
    } catch {
      // ignore — user may not be logged in
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  function canUse(feature: string): boolean {
    if (!data) return true;
    const limit = data.limits[feature];
    if (limit === true || limit === -1) return true;
    if (limit === false) return false;
    const stat = data.usage[feature];
    if (!stat) return true;
    return (stat.remaining as number) > 0;
  }

  function getRemaining(feature: string): number | null {
    if (!data) return null;
    const limit = data.limits[feature];
    if (limit === -1) return Infinity;
    const stat = data.usage[feature];
    return stat ? (stat.remaining as number) : (limit as number);
  }

  function getPercent(feature: string): number {
    if (!data) return 0;
    const limit = data.limits[feature];
    if (!limit || limit === -1 || typeof limit === 'boolean') return 0;
    const stat = data.usage[feature];
    const used = stat?.used ?? 0;
    return Math.min(100, Math.round((used / (limit as number)) * 100));
  }

  return { data, loading, canUse, getRemaining, getPercent, refresh };
}
