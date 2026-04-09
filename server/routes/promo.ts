import { Router } from 'express';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

// POST /api/promo/redeem
router.post('/redeem', async (req: AuthRequest, res) => {
  const { code } = req.body ?? {};
  if (!code?.trim()) { res.status(400).json({ error: 'Promo code is required' }); return; }

  const p = require('../lib/prisma').default as any;
  const userId = req.userId!;

  try {
    const promo = await p.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });

    if (!promo || !promo.isActive) {
      res.status(404).json({ error: 'Invalid or inactive promo code' }); return;
    }

    const now = new Date();
    if (promo.validFrom && new Date(promo.validFrom) > now) {
      res.status(400).json({ error: 'This promo code is not valid yet' }); return;
    }
    if (promo.validUntil && new Date(promo.validUntil) < now) {
      res.status(400).json({ error: 'This promo code has expired' }); return;
    }
    if (promo.maxUses !== null && promo.usesCount >= promo.maxUses) {
      res.status(400).json({ error: 'This promo code has reached its usage limit' }); return;
    }

    // Check per-user limit
    const userUseCount = await p.promoCodeUse.count({
      where: { codeId: promo.id, userId },
    });
    if (userUseCount >= promo.maxUsesPerUser) {
      res.status(400).json({ error: 'You have already used this promo code' }); return;
    }

    // Apply the benefit
    let benefit = '';
    const userUpdate: any = {};

    if (promo.type === 'free_trial_days') {
      const days = Number(promo.value);
      const user = await p.user.findUnique({ where: { id: userId }, select: { trialEndDate: true, subscriptionTier: true } });
      const base = user.trialEndDate && new Date(user.trialEndDate) > now
        ? new Date(user.trialEndDate)
        : now;
      const newEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
      userUpdate.trialEndDate = newEnd;
      userUpdate.subscriptionTier = 'premium';
      benefit = `${days} days of Premium unlocked — expires ${newEnd.toLocaleDateString('en-GB')}`;
    } else if (promo.type === 'percent_off') {
      benefit = `${Number(promo.value)}% discount applied to your next payment`;
    } else if (promo.type === 'fixed_amount') {
      benefit = `€${Number(promo.value).toFixed(2)} credit applied to your account`;
    } else if (promo.type === 'school_bulk') {
      const days = 30;
      const user = await p.user.findUnique({ where: { id: userId }, select: { trialEndDate: true, subscriptionTier: true } });
      const base = user.trialEndDate && new Date(user.trialEndDate) > now
        ? new Date(user.trialEndDate)
        : now;
      const newEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);
      userUpdate.trialEndDate = newEnd;
      userUpdate.subscriptionTier = 'school';
      benefit = `School plan activated — expires ${newEnd.toLocaleDateString('en-GB')}`;
    }

    if (Object.keys(userUpdate).length > 0) {
      await p.user.update({ where: { id: userId }, data: userUpdate });
    }

    // Record use
    await p.promoCodeUse.create({
      data: {
        codeId: promo.id,
        userId,
        discountApplied: promo.type === 'fixed_amount' || promo.type === 'percent_off'
          ? promo.value
          : 0,
      },
    });

    // Increment use count
    await p.promoCode.update({
      where: { id: promo.id },
      data: { usesCount: { increment: 1 } },
    });

    res.json({ ok: true, benefit, type: promo.type });
  } catch (err) {
    console.error('Promo redeem error:', err);
    res.status(500).json({ error: 'Failed to redeem promo code' });
  }
});

export default router;
