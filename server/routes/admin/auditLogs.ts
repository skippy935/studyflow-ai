import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import crypto from 'crypto';

const router = Router();
const p = prisma as any;

// GET /api/admin/audit-logs
router.get('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { page = '1', limit = '50', action, adminId, userId } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const where: any = {};
    if (action) where.actionType = { contains: action, mode: 'insensitive' };
    if (adminId) where.adminId = parseInt(adminId);
    if (userId) where.targetUserId = parseInt(userId);

    const [logs, total] = await Promise.all([
      p.auditLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          admin: { select: { id: true, email: true, name: true, role: true } },
        },
      }),
      p.auditLog.count({ where }),
    ]);

    res.json({ logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/audit-logs/verify-integrity
router.post('/verify-integrity', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  try {
    const logs = await p.auditLog.findMany({ orderBy: { id: 'asc' } });

    let valid = true;
    let brokenAt: number | null = null;

    for (let i = 1; i < logs.length; i++) {
      const prev = logs[i - 1];
      const curr = logs[i];
      const expectedHash = crypto
        .createHash('sha256')
        .update(JSON.stringify({ id: prev.id, actionType: prev.actionType, createdAt: prev.createdAt, chainHash: prev.chainHash }))
        .digest('hex');

      if (curr.previousHash && curr.previousHash !== expectedHash) {
        valid = false;
        brokenAt = curr.id;
        break;
      }
    }

    res.json({ valid, brokenAt, totalLogs: logs.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
