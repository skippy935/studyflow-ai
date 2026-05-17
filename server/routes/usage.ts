import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';
import { getUsageStats } from '../services/usageService';
import { getLimits } from '../lib/tierLimits';

const router = Router();
router.use(auth);

// GET /api/usage — returns tier limits + current usage for the frontend
router.get('/', async (req: AuthRequest, res) => {
  try {
    const p = require('../lib/prisma').default as any;
    const user = await p.user.findUnique({
      where: { id: req.userId! },
      select: { subscriptionTier: true },
    });
    const tier = user?.subscriptionTier ?? 'free';
    const limits = getLimits(tier);
    const usage = await getUsageStats(req.userId!, tier);

    res.json({
      tier,
      limits,
      usage,
      isPremium: tier !== 'free',
      isYearly: tier === 'premium_yearly',
      isSchool: tier === 'school',
      xpMultiplier: limits.xp_multiplier,
    });
  } catch (err) {
    console.error('[usage]', err);
    res.status(500).json({ error: 'Failed to load usage' });
  }
});

export default router;
