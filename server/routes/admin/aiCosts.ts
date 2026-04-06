import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../lib/auditLog';

const router = Router();
const p = prisma as any;

// GET /api/admin/ai-costs/overview
router.get('/overview', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [todayCost, monthCost, yearCost, byFeature, topUsers] = await Promise.all([
      p.aiUsageLog.aggregate({ _sum: { costUsd: true }, where: { createdAt: { gte: startOfDay } } }),
      p.aiUsageLog.aggregate({ _sum: { costUsd: true }, where: { createdAt: { gte: startOfMonth } } }),
      p.aiUsageLog.aggregate({ _sum: { costUsd: true }, where: { createdAt: { gte: startOfYear } } }),
      p.aiUsageLog.groupBy({
        by: ['feature'],
        _sum: { costUsd: true, totalTokens: true },
        where: { createdAt: { gte: startOfMonth } },
        orderBy: { _sum: { costUsd: 'desc' } },
      }),
      p.aiUsageLog.groupBy({
        by: ['userId'],
        _sum: { costUsd: true, totalTokens: true },
        where: { createdAt: { gte: startOfMonth } },
        orderBy: { _sum: { costUsd: 'desc' } },
        take: 10,
      }),
    ]);

    // Enrich top users with display names
    const userIds = topUsers.map((u: any) => u.userId);
    const users = await p.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, displayName: true },
    });
    const userMap = Object.fromEntries(users.map((u: any) => [u.id, u]));

    const topUsersEnriched = topUsers.map((u: any) => ({
      ...u,
      user: userMap[u.userId] ?? { email: 'unknown', displayName: 'Unknown' },
    }));

    // Detect anomalies: users using >5x average daily tokens
    const avgResult = await p.aiUsageLog.aggregate({
      _avg: { totalTokens: true },
      where: { createdAt: { gte: startOfDay } },
    });
    const avgDaily = avgResult._avg.totalTokens ?? 0;

    const todayByUser = await p.aiUsageLog.groupBy({
      by: ['userId'],
      _sum: { totalTokens: true },
      where: { createdAt: { gte: startOfDay } },
    });

    const anomalies = todayByUser
      .filter((u: any) => u._sum.totalTokens > avgDaily * 5 && avgDaily > 0)
      .map((u: any) => ({ userId: u.userId, todayTokens: u._sum.totalTokens, avgTokens: avgDaily }));

    res.json({
      costs: {
        today: Number(todayCost._sum.costUsd ?? 0),
        month: Number(monthCost._sum.costUsd ?? 0),
        year: Number(yearCost._sum.costUsd ?? 0),
      },
      byFeature,
      topUsers: topUsersEnriched,
      anomalies,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/ai-costs/models
router.get('/models', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    let configs = await p.aiModelsConfig.findMany({ orderBy: { feature: 'asc' } });

    // Seed defaults if empty
    if (configs.length === 0) {
      const defaults = [
        { feature: 'chat', activeModel: 'claude-sonnet-4-6', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
        { feature: 'quiz_gen', activeModel: 'claude-sonnet-4-6', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
        { feature: 'flashcard', activeModel: 'claude-sonnet-4-6', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
        { feature: 'examiner', activeModel: 'claude-sonnet-4-6', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
        { feature: 'tutor', activeModel: 'claude-sonnet-4-6', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
        { feature: 'ocr', activeModel: 'claude-sonnet-4-6', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
        { feature: 'summary', activeModel: 'claude-sonnet-4-6', costPer1kInput: 0.003, costPer1kOutput: 0.015 },
      ];
      for (const d of defaults) await p.aiModelsConfig.create({ data: d });
      configs = await p.aiModelsConfig.findMany({ orderBy: { feature: 'asc' } });
    }

    res.json(configs);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /api/admin/ai-costs/models/:feature
router.patch('/models/:feature', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const { activeModel, costPer1kInput, costPer1kOutput, isActive, reason } = req.body ?? {};
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    const config = await p.aiModelsConfig.findUnique({ where: { feature: req.params.feature } });
    if (!config) { res.status(404).json({ error: 'Config not found' }); return; }

    const updated = await p.aiModelsConfig.update({
      where: { feature: req.params.feature },
      data: { activeModel, costPer1kInput, costPer1kOutput, isActive },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'AI_MODEL_CHANGE',
      previousValue: { activeModel: config.activeModel },
      newValue: { activeModel },
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
      metadata: { feature: req.params.feature },
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/ai-costs/budgets — token budgets
router.get('/budgets', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { q } = req.query as Record<string, string>;
  try {
    const where: any = {};
    if (q) {
      const users = await p.user.findMany({
        where: { OR: [{ email: { contains: q, mode: 'insensitive' } }, { displayName: { contains: q, mode: 'insensitive' } }] },
        select: { id: true },
      });
      where.userId = { in: users.map((u: any) => u.id) };
    }

    const budgets = await p.aiTokenBudget.findMany({
      where,
      take: 50,
      include: { user: { select: { id: true, email: true, displayName: true, subscriptionTier: true } } },
    });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /api/admin/ai-costs/budgets/:userId
router.patch('/budgets/:userId', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.userId);
  const { budgetOverride, reason } = req.body ?? {};
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    const budget = await p.aiTokenBudget.upsert({
      where: { userId },
      update: { budgetOverride, overrideReason: reason },
      create: { userId, budgetOverride, overrideReason: reason, subscriptionTier: 'free', dailyTokenLimit: 10000, monthlyTokenLimit: 100000 },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'TOKEN_BUDGET_OVERRIDE',
      targetUserId: userId,
      newValue: { budgetOverride },
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json(budget);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
