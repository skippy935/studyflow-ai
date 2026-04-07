import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { isFeatureEnabled } from '../lib/featureFlags';
import prisma from '../lib/prisma';

/**
 * Middleware that blocks a route if a feature flag / kill switch is disabled.
 * Also blocks banned users and users with AI access disabled.
 */
export function featureGuard(flagKey: string) {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.userId;

      // Check if user is banned
      if (userId) {
        const user = await (prisma as any).user.findUnique({
          where: { id: userId },
          select: { isBanned: true, aiAccessDisabled: true, subscriptionTier: true },
        });

        if (user?.isBanned) {
          res.status(403).json({ error: 'ACCOUNT_BANNED', message: 'Your account has been suspended. Please contact support.' });
          return;
        }

        // For AI features, check aiAccessDisabled flag
        if (flagKey.startsWith('ai_') && user?.aiAccessDisabled) {
          res.status(403).json({ error: 'AI_ACCESS_DISABLED', message: 'AI features have been disabled on your account.' });
          return;
        }

        const enabled = await isFeatureEnabled(flagKey, userId, { subscription: user?.subscriptionTier });
        if (!enabled) {
          res.status(503).json({
            error: 'FEATURE_DISABLED',
            message: 'This feature is temporarily unavailable. Please try again later.',
            feature: flagKey,
          });
          return;
        }
      } else {
        // No userId — just check global flag
        const enabled = await isFeatureEnabled(flagKey);
        if (!enabled) {
          res.status(503).json({ error: 'FEATURE_DISABLED', message: 'This feature is temporarily unavailable.', feature: flagKey });
          return;
        }
      }

      next();
    } catch {
      // If flag check fails, allow through (fail open — don't break the app)
      next();
    }
  };
}
