import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../lib/auditLog';

const router = Router();
const p = prisma as any;

// GET /api/admin/teachers/pending — approval queue
router.get('/pending', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    const profiles = await p.teacherProfile.findMany({
      where: { verificationStatus: { in: ['pending_approval', 'pending'] } },
      include: {
        user: { select: { id: true, email: true, displayName: true, createdAt: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ profiles });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// GET /api/admin/teachers — all teachers with status
router.get('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { status } = req.query as Record<string, string>;
  try {
    const where: any = {};
    if (status) where.verificationStatus = status;
    const profiles = await p.teacherProfile.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, displayName: true, createdAt: true, lastLogin: true } },
        _count: { select: { classes: true, materials: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ profiles });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// POST /api/admin/teachers/:id/approve
router.post('/:id/approve', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const profileId = parseInt(req.params.id);
  try {
    const profile = await p.teacherProfile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });
    if (!profile) { res.status(404).json({ error: 'Teacher profile not found' }); return; }

    await p.teacherProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: 'approved',
        approvedAt: new Date(),
        approvedById: req.admin!.id,
        rejectionReason: '',
      },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'TEACHER_APPROVED',
      targetUserId: profile.userId,
      previousValue: { verificationStatus: profile.verificationStatus },
      newValue: { verificationStatus: 'approved' },
      reason: 'Manual admin approval',
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// POST /api/admin/teachers/:id/reject
router.post('/:id/reject', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const profileId = parseInt(req.params.id);
  const { reason } = req.body || {};
  if (!reason?.trim()) { res.status(400).json({ error: 'Rejection reason required' }); return; }

  try {
    const profile = await p.teacherProfile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });
    if (!profile) { res.status(404).json({ error: 'Teacher profile not found' }); return; }

    await p.teacherProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: 'rejected',
        rejectionReason: reason.trim(),
      },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'TEACHER_REJECTED',
      targetUserId: profile.userId,
      previousValue: { verificationStatus: profile.verificationStatus },
      newValue: { verificationStatus: 'rejected', rejectionReason: reason.trim() },
      reason: reason.trim(),
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// POST /api/admin/teachers/:id/revoke — approved → pending_approval
router.post('/:id/revoke', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const profileId = parseInt(req.params.id);
  const { reason } = req.body || {};
  try {
    const profile = await p.teacherProfile.findUnique({ where: { id: profileId } });
    if (!profile) { res.status(404).json({ error: 'Teacher profile not found' }); return; }

    await p.teacherProfile.update({
      where: { id: profileId },
      data: { verificationStatus: 'pending_approval', approvedAt: null, approvedById: null },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'TEACHER_REVOKED',
      targetUserId: profile.userId,
      reason: reason || 'Approval revoked',
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// GET /api/admin/teachers/approval-mode
router.get('/approval-mode', adminAuth('MODERATOR'), async (_req, res: Response) => {
  try {
    const flag = await p.featureFlag.findUnique({ where: { key: 'teacher_auto_approval' } });
    res.json({ autoApprove: flag ? flag.isEnabled : false });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// POST /api/admin/teachers/approval-mode
router.post('/approval-mode', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { autoApprove } = req.body || {};
  try {
    await p.featureFlag.upsert({
      where: { key: 'teacher_auto_approval' },
      update: { isEnabled: !!autoApprove, lastChangedAt: new Date() },
      create: {
        key: 'teacher_auto_approval',
        name: 'Teacher Auto-Approval',
        description: 'When enabled, teachers are approved instantly upon completing onboarding profile.',
        category: 'core',
        isEnabled: !!autoApprove,
      },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: autoApprove ? 'TEACHER_AUTO_APPROVAL_ON' : 'TEACHER_AUTO_APPROVAL_OFF',
      reason: autoApprove ? 'Switched to automatic teacher approval' : 'Switched to manual teacher approval',
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true, autoApprove: !!autoApprove });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

export default router;
