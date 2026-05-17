import prisma from '../lib/prisma';
import { getLimits, getLimit, FEATURE_PERIODS, type TierLimits } from '../lib/tierLimits';

const p = prisma as any;

function getPeriodKey(periodType: 'daily' | 'monthly'): string {
  const now = new Date();
  if (periodType === 'daily') return now.toISOString().slice(0, 10);
  return now.toISOString().slice(0, 7);
}

function getResetAt(periodType: 'daily' | 'monthly'): Date {
  const now = new Date();
  if (periodType === 'daily') {
    const t = new Date(now);
    t.setUTCDate(t.getUTCDate() + 1);
    t.setUTCHours(0, 0, 0, 0);
    return t;
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
}

export interface CheckResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  used: number;
  reason: string | null;
  upgradeRequired: boolean;
  resetAt: Date | null;
}

export async function check(userId: number, feature: keyof TierLimits, userTier: string): Promise<CheckResult> {
  const limit = getLimit(userTier, feature);

  // Boolean feature
  if (typeof limit === 'boolean') {
    if (!limit) return { allowed: false, remaining: 0, limit: 0, used: 0, reason: 'feature_not_available', upgradeRequired: true, resetAt: null };
    return { allowed: true, remaining: -1, limit: -1, used: 0, reason: null, upgradeRequired: false, resetAt: null };
  }

  // Unlimited
  if (limit === -1) return { allowed: true, remaining: -1, limit: -1, used: 0, reason: null, upgradeRequired: false, resetAt: null };

  // Check admin override
  const override = await p.featureOverride.findFirst({
    where: { userId, feature, OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] },
  });
  if (override?.overrideType === 'grant') return { allowed: true, remaining: -1, limit: -1, used: 0, reason: 'admin_override', upgradeRequired: false, resetAt: null };
  if (override?.overrideType === 'revoke') return { allowed: false, remaining: 0, limit: 0, used: 0, reason: 'admin_revoked', upgradeRequired: false, resetAt: null };

  // Usage count
  const periodType = FEATURE_PERIODS[feature as string] ?? 'monthly';
  const periodKey = getPeriodKey(periodType);

  const row = await p.featureUsage.findFirst({ where: { userId, feature, periodType, periodKey } });
  const used = row?.count ?? 0;
  const remaining = Math.max(0, (limit as number) - used);
  const allowed = used < (limit as number);

  return {
    allowed,
    remaining,
    limit: limit as number,
    used,
    reason: allowed ? null : 'limit_reached',
    upgradeRequired: !allowed,
    resetAt: allowed ? null : getResetAt(periodType),
  };
}

export async function consume(userId: number, feature: string, amount = 1): Promise<void> {
  const periodType = FEATURE_PERIODS[feature] ?? 'monthly';
  const periodKey = getPeriodKey(periodType);

  await p.featureUsage.upsert({
    where: { userId_feature_periodType_periodKey: { userId, feature, periodType, periodKey } },
    create: { userId, feature, periodType, periodKey, count: amount },
    update: { count: { increment: amount } },
  });
}

export async function getUsageStats(userId: number, userTier: string) {
  const limits = getLimits(userTier);
  const features = Object.keys(FEATURE_PERIODS);
  const stats: Record<string, any> = {};

  await Promise.all(features.map(async (feature) => {
    const limit = limits[feature as keyof TierLimits];
    if (limit === -1 || typeof limit === 'boolean') {
      stats[feature] = { limit, used: 0, remaining: limit, periodType: FEATURE_PERIODS[feature] };
      return;
    }
    const periodType = FEATURE_PERIODS[feature];
    const periodKey = getPeriodKey(periodType);
    const row = await p.featureUsage.findFirst({ where: { userId, feature, periodType, periodKey } });
    const used = row?.count ?? 0;
    stats[feature] = { limit, used, remaining: Math.max(0, (limit as number) - used), periodType, resetAt: getResetAt(periodType) };
  }));

  return stats;
}

export async function resetUsage(userId: number, features: string[] | null, resetBy: number | null, reason: string): Promise<void> {
  if (features?.length) {
    await p.featureUsage.deleteMany({ where: { userId, feature: { in: features } } });
  } else {
    await p.featureUsage.deleteMany({ where: { userId } });
  }
  await p.usageReset.create({
    data: { userId, resetBy, features: JSON.stringify(features ?? []), reason },
  });
}
