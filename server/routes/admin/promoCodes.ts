import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../lib/auditLog';
import crypto from 'crypto';

const router = Router();
const p = prisma as any;

function generateCode(prefix = ''): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = prefix ? prefix.toUpperCase() + '-' : '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET /api/admin/promo-codes
router.get('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { page = '1', active } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * 50;

  try {
    const where: any = {};
    if (active === 'true') where.isActive = true;
    if (active === 'false') where.isActive = false;

    const [codes, total] = await Promise.all([
      p.promoCode.findMany({ where, skip, take: 50, orderBy: { createdAt: 'desc' } }),
      p.promoCode.count({ where }),
    ]);

    res.json({ codes, total });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/promo-codes — create single code
router.post('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { code, type, value, appliesTo, maxUses, maxUsesPerUser, validUntil, reason, metadata } = req.body ?? {};
  if (!type || value === undefined) { res.status(400).json({ error: 'type and value required' }); return; }
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    const finalCode = (code ?? generateCode()).toUpperCase();
    const promo = await p.promoCode.create({
      data: {
        code: finalCode, type, value, appliesTo: appliesTo ?? 'all',
        maxUses: maxUses ?? null, maxUsesPerUser: maxUsesPerUser ?? 1,
        validUntil: validUntil ? new Date(validUntil) : null,
        metadata: metadata ?? {},
      },
    });

    await createAuditLog({
      adminId: req.admin!.id, adminRole: req.admin!.role,
      actionType: 'PROMO_CODE_CREATE', newValue: { code: finalCode, type, value },
      reason, ipAddress: req.admin!.ip, deviceInfo: req.admin!.device,
    });

    res.json(promo);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/promo-codes/bulk-generate
router.post('/bulk-generate', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { count, prefix, type, value, appliesTo, maxUsesPerUser, validUntil, reason, metadata } = req.body ?? {};
  if (!count || count > 500) { res.status(400).json({ error: 'count must be 1-500' }); return; }
  if (!type || value === undefined) { res.status(400).json({ error: 'type and value required' }); return; }
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    const codes: string[] = [];
    const created = [];

    for (let i = 0; i < count; i++) {
      let code: string;
      let attempts = 0;
      do {
        code = generateCode(prefix);
        attempts++;
      } while (codes.includes(code) && attempts < 20);
      codes.push(code);

      created.push(await p.promoCode.create({
        data: {
          code, type, value, appliesTo: appliesTo ?? 'all',
          maxUses: 1, maxUsesPerUser: maxUsesPerUser ?? 1,
          validUntil: validUntil ? new Date(validUntil) : null,
          metadata: metadata ?? {},
        },
      }));
    }

    await createAuditLog({
      adminId: req.admin!.id, adminRole: req.admin!.role,
      actionType: 'PROMO_CODE_BULK_CREATE', newValue: { count, type, value },
      reason, ipAddress: req.admin!.ip, deviceInfo: req.admin!.device,
    });

    res.json({ ok: true, count: created.length, codes: created.map(c => c.code) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /api/admin/promo-codes/:id/deactivate
router.patch('/:id/deactivate', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { reason } = req.body ?? {};
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    await p.promoCode.update({ where: { id }, data: { isActive: false } });

    await createAuditLog({
      adminId: req.admin!.id, adminRole: req.admin!.role,
      actionType: 'PROMO_CODE_DEACTIVATE', newValue: { isActive: false },
      reason, ipAddress: req.admin!.ip, deviceInfo: req.admin!.device,
      metadata: { codeId: id },
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/promo-codes/:id/uses
router.get('/:id/uses', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const uses = await p.promoCodeUse.findMany({
      where: { codeId: id },
      include: { user: { select: { id: true, email: true, displayName: true } } },
      orderBy: { usedAt: 'desc' },
    });
    res.json(uses);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
