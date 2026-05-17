import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { check, consume } from '../services/usageService';
import { isEnabled, FEATURE_NAMES, type TierLimits } from '../lib/tierLimits';

const p = () => require('../lib/prisma').default as any;

function upgradePayload(feature: string, userTier: string) {
  return {
    upgradeRequired: true,
    currentTier: userTier,
    upgradeUrl: '/pricing',
    monthlyPrice: '€7,99/Monat',
    yearlyPrice: '€69,99/Jahr (spare 27%)',
  };
}

/**
 * Gate a usage-counted feature (AI calls, scans, etc.)
 * Consumes 1 unit on success.
 */
export function requireFeature(feature: keyof TierLimits) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    try {
      const user = await p().user.findUnique({ where: { id: userId }, select: { subscriptionTier: true } });
      const tier = user?.subscriptionTier ?? 'free';
      const status = await check(userId, feature, tier);

      if (!status.allowed) {
        const name = FEATURE_NAMES[feature as string] ?? String(feature);
        const periodType = status.resetAt
          ? (new Date(status.resetAt).getDate() === new Date(Date.now() + 86400000).getDate() ? 'daily' : 'monthly')
          : 'monthly';

        const message = status.reason === 'feature_not_available'
          ? `${name} ist nur für Premium-Nutzer verfügbar. Jetzt upgraden!`
          : status.reason === 'admin_revoked'
          ? 'Der Zugang zu dieser Funktion wurde eingeschränkt.'
          : periodType === 'daily'
          ? `Dein Tageslimit für ${name} ist erreicht. Wird um Mitternacht zurückgesetzt.`
          : `Dein monatliches Limit für ${name} ist erreicht. Wird am ${status.resetAt ? new Date(status.resetAt).toLocaleDateString('de-DE') : '1.'} zurückgesetzt.`;

        res.status(402).json({
          error: 'UPGRADE_REQUIRED',
          message,
          feature,
          limit: status.limit,
          used: status.used,
          remaining: status.remaining,
          resetAt: status.resetAt,
          ...upgradePayload(feature as string, tier),
        });
        return;
      }

      // Consume AFTER successful response
      const originalJson = res.json.bind(res);
      (res as any).json = async (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          await consume(userId, feature as string).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('[tierGuard] error:', err);
      next(); // fail open
    }
  };
}

/**
 * Gate a boolean feature (study groups, export, etc.)
 * No usage counting — just checks tier.
 */
export function requireTierFeature(feature: keyof TierLimits) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.userId;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    try {
      const user = await p().user.findUnique({ where: { id: userId }, select: { subscriptionTier: true } });
      const tier = user?.subscriptionTier ?? 'free';

      if (!isEnabled(tier, feature)) {
        const name = FEATURE_NAMES[feature as string] ?? String(feature);
        res.status(402).json({
          error: 'UPGRADE_REQUIRED',
          message: `${name} ist nur für Premium-Nutzer verfügbar. Jetzt upgraden!`,
          feature,
          ...upgradePayload(feature as string, tier),
        });
        return;
      }

      next();
    } catch (err) {
      console.error('[tierGuard] boolean error:', err);
      next();
    }
  };
}
