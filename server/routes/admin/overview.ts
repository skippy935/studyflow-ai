import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';

const router = Router();
const p = prisma as any;

// GET /api/admin/overview — main dashboard stats
router.get('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0);
    const yesterday = new Date(startOfDay); yesterday.setDate(yesterday.getDate() - 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const last7d = new Date(now); last7d.setDate(last7d.getDate() - 7);
    const last30d = new Date(now); last30d.setDate(last30d.getDate() - 30);

    const [
      totalUsers, newToday, newThisMonth,
      activeToday, active7d, active30d,
      bannedCount, minorCount, unverifiedTeachers,
      aiCostToday, aiCostMonth,
      totalSchools, pendingSchools,
      activeFlags,
    ] = await Promise.all([
      p.user.count(),
      p.user.count({ where: { createdAt: { gte: startOfDay } } }),
      p.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      p.user.count({ where: { lastLogin: { gte: startOfDay } } }),
      p.user.count({ where: { lastLogin: { gte: last7d } } }),
      p.user.count({ where: { lastLogin: { gte: last30d } } }),
      p.user.count({ where: { isBanned: true } }),
      p.user.count({ where: { isMinor: true, parentalConsentGiven: false } }),
      p.teacherProfile.count({ where: { verificationStatus: 'pending' } }),
      p.aiUsageLog.aggregate({ _sum: { costUsd: true }, where: { createdAt: { gte: startOfDay } } }).then((r: any) => Number(r._sum.costUsd ?? 0)),
      p.aiUsageLog.aggregate({ _sum: { costUsd: true }, where: { createdAt: { gte: startOfMonth } } }).then((r: any) => Number(r._sum.costUsd ?? 0)),
      p.school.count().catch(() => 0),
      p.school.count({ where: { verificationStatus: 'pending' } }).catch(() => 0),
      p.featureFlag.count({ where: { isEnabled: false, isKillSwitch: true } }).catch(() => 0),
    ]);

    // 14-day registration chart
    const chart = [];
    for (let i = 13; i >= 0; i--) {
      const day = new Date(now); day.setDate(day.getDate() - i); day.setHours(0, 0, 0, 0);
      const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
      const count = await p.user.count({ where: { createdAt: { gte: day, lt: nextDay } } });
      chart.push({ date: day.toISOString().split('T')[0], count });
    }

    res.json({
      users: { total: totalUsers, newToday, newThisMonth, activeToday, active7d, active30d, banned: bannedCount },
      gdpr: { minorsWithoutConsent: minorCount, unverifiedTeachers },
      aiCosts: { today: aiCostToday, month: aiCostMonth },
      schools: { total: totalSchools, pending: pendingSchools },
      killSwitchesActive: activeFlags,
      chart,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/audit-logs
router.get('/audit-logs', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { page = '1', adminId, actionType } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * 50;

  try {
    const where: any = {};
    if (adminId) where.adminId = parseInt(adminId);
    if (actionType) where.actionType = actionType;

    const [logs, total] = await Promise.all([
      p.auditLog.findMany({
        where, skip, take: 50,
        orderBy: { createdAt: 'desc' },
        include: { admin: { select: { email: true, displayName: true } } },
      }),
      p.auditLog.count({ where }),
    ]);

    res.json({ logs, total });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/audit-logs/verify-integrity (Super Admin only)
router.get('/audit-logs/verify-integrity', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  try {
    const logs = await p.auditLog.findMany({ orderBy: { id: 'asc' }, select: { id: true, chainHash: true, previousHash: true } });
    const issues: number[] = [];

    for (let i = 1; i < logs.length; i++) {
      if (logs[i].previousHash !== logs[i - 1].chainHash) {
        issues.push(logs[i].id);
      }
    }

    res.json({ total: logs.length, issues, intact: issues.length === 0 });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/maintenance
router.get('/maintenance', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    const active = await p.maintenanceWindow.findFirst({ where: { isActive: true }, orderBy: { createdAt: 'desc' } });
    res.json({ maintenance: active });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/maintenance
router.post('/maintenance', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const { message, startsAt, endsAt, immediate } = req.body ?? {};

  try {
    // Deactivate any existing
    await p.maintenanceWindow.updateMany({ where: { isActive: true }, data: { isActive: false } });

    const window = await p.maintenanceWindow.create({
      data: {
        message: message ?? 'Wartungsarbeiten — wir sind gleich zurück.',
        startsAt: immediate ? new Date() : new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        isActive: true,
        createdBy: req.admin!.id,
      },
    });

    res.json(window);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/admin/maintenance — end maintenance
router.delete('/maintenance', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  try {
    await p.maintenanceWindow.updateMany({ where: { isActive: true }, data: { isActive: false, endsAt: new Date() } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
