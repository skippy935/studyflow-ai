import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../lib/auditLog';

const router = Router();
const p = prisma as any;

// GET /api/admin/users — list users with search/filter
router.get('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { q, page = '1', limit = '50', tier, banned, type } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where: any = {};
    if (q) {
      where.OR = [
        { email: { contains: q, mode: 'insensitive' } },
        { displayName: { contains: q, mode: 'insensitive' } },
      ];
    }
    if (tier) where.subscriptionTier = tier;
    if (banned === 'true') where.isBanned = true;
    if (type) where.userType = type;

    const [users, total] = await Promise.all([
      p.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, email: true, displayName: true, userType: true,
          subscriptionTier: true, xp: true, streak: true,
          isBanned: true, isAnonymized: true, isMinor: true,
          createdAt: true, lastLogin: true, emailVerified: true,
          totalCardsLearned: true,
        },
      }),
      p.user.count({ where }),
    ]);

    res.json({ users, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/users/:id — full user detail
router.get('/:id', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await p.user.findUnique({
      where: { id: userId },
      include: {
        decks: { select: { id: true, name: true, createdAt: true, _count: { select: { cards: true } } } },
        studySessions: { take: 10, orderBy: { studiedAt: 'desc' } },
        examinerSessions: { take: 5, orderBy: { createdAt: 'desc' }, select: { id: true, materialName: true, difficulty: true, completed: true, createdAt: true } },
        aiUsageLogs: { take: 20, orderBy: { createdAt: 'desc' } },
        aiTokenBudget: true,
      },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/users/:id/ban
router.post('/:id/ban', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  const { reason } = req.body ?? {};
  if (!reason?.trim()) { res.status(400).json({ error: 'reason is required' }); return; }

  try {
    const user = await p.user.findUnique({ where: { id: userId }, select: { isBanned: true, email: true } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    await p.user.update({
      where: { id: userId },
      data: { isBanned: true, bannedAt: new Date(), banReason: reason },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'BAN',
      targetUserId: userId,
      previousValue: { isBanned: false },
      newValue: { isBanned: true },
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/users/:id/unban
router.post('/:id/unban', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  const { reason } = req.body ?? {};
  if (!reason?.trim()) { res.status(400).json({ error: 'reason is required' }); return; }

  try {
    await p.user.update({
      where: { id: userId },
      data: { isBanned: false, bannedAt: null, banReason: null },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'UNBAN',
      targetUserId: userId,
      previousValue: { isBanned: true },
      newValue: { isBanned: false },
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/users/:id/adjust-xp
router.post('/:id/adjust-xp', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  const { amount, reason } = req.body ?? {};
  if (typeof amount !== 'number') { res.status(400).json({ error: 'amount must be a number' }); return; }
  if (!reason?.trim()) { res.status(400).json({ error: 'reason is required' }); return; }

  try {
    const user = await p.user.findUnique({ where: { id: userId }, select: { xp: true } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    const newXp = Math.max(0, user.xp + amount);
    await p.user.update({ where: { id: userId }, data: { xp: newXp } });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'XP_CHANGE',
      targetUserId: userId,
      previousValue: { xp: user.xp },
      newValue: { xp: newXp },
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true, xp: newXp });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/users/:id/disable-ai
router.post('/:id/disable-ai', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  const { reason, disabled } = req.body ?? {};
  if (!reason?.trim()) { res.status(400).json({ error: 'reason is required' }); return; }

  try {
    await p.user.update({ where: { id: userId }, data: { aiAccessDisabled: disabled !== false } });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: disabled !== false ? 'AI_ACCESS_DISABLED' : 'AI_ACCESS_ENABLED',
      targetUserId: userId,
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/users/bulk-ban
router.post('/bulk-ban', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const { userIds, reason } = req.body ?? {};
  if (!Array.isArray(userIds) || userIds.length === 0) { res.status(400).json({ error: 'userIds array required' }); return; }
  if (!reason?.trim()) { res.status(400).json({ error: 'reason is required' }); return; }

  try {
    const before = await p.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, isBanned: true },
    });

    await p.user.updateMany({
      where: { id: { in: userIds } },
      data: { isBanned: true, bannedAt: new Date(), banReason: reason },
    });

    const canUndoUntil = new Date(Date.now() + 60 * 60 * 1000);
    await p.bulkAction.create({
      data: {
        adminId: req.admin!.id,
        actionType: 'bulk_ban',
        affectedUserIds: userIds,
        previousStates: before,
        newStates: userIds.map((id: number) => ({ id, isBanned: true })),
        reason,
        canUndoUntil,
      },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'BULK_BAN',
      reason,
      metadata: { userIds, count: userIds.length },
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true, count: userIds.length, canUndoUntil });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/users/bulk-undo/:bulkActionId
router.post('/bulk-undo/:bulkActionId', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const id = parseInt(req.params.bulkActionId);
  try {
    const action = await p.bulkAction.findUnique({ where: { id } });
    if (!action) { res.status(404).json({ error: 'Bulk action not found' }); return; }
    if (action.wasUndone) { res.status(400).json({ error: 'Already undone' }); return; }
    if (new Date(action.canUndoUntil) < new Date()) { res.status(400).json({ error: 'Undo window expired' }); return; }

    // Restore previous states
    for (const prev of action.previousStates as any[]) {
      await p.user.update({ where: { id: prev.id }, data: { isBanned: prev.isBanned } });
    }

    await p.bulkAction.update({
      where: { id },
      data: { wasUndone: true, undoneAt: new Date(), undoneBy: req.admin!.id },
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
