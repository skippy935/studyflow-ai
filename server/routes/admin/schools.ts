import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../lib/auditLog';

const router = Router();
const p = prisma as any;

// GET /api/admin/schools
router.get('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { status, page = '1', q } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * 50;

  try {
    const where: any = {};
    if (status) where.verificationStatus = status;
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { city: { contains: q, mode: 'insensitive' } },
        { contactEmail: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [schools, total] = await Promise.all([
      p.school.findMany({
        where, skip, take: 50,
        orderBy: { createdAt: 'desc' },
        include: { _count: { select: { schoolAdmins: true } } },
      }),
      p.school.count({ where }),
    ]);

    res.json({ schools, total });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/schools
router.post('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { name, city, state, country, schoolType, contactName, contactEmail, licenseSeats } = req.body ?? {};
  if (!name) { res.status(400).json({ error: 'name required' }); return; }

  try {
    const school = await p.school.create({
      data: { name, city: city ?? '', state: state ?? '', country: country ?? 'DE', schoolType: schoolType ?? '', contactName: contactName ?? '', contactEmail: contactEmail ?? '', licenseSeats: licenseSeats ?? 0 },
    });

    await createAuditLog({
      adminId: req.admin!.id, adminRole: req.admin!.role,
      actionType: 'SCHOOL_CREATE', newValue: { name, city },
      reason: 'Admin created school', ipAddress: req.admin!.ip, deviceInfo: req.admin!.device,
    });

    res.json(school);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/schools/:id
router.get('/:id', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const id = parseInt(req.params.id);
  try {
    const school = await p.school.findUnique({
      where: { id },
      include: {
        schoolAdmins: {
          include: { user: { select: { id: true, email: true, displayName: true, userType: true } } },
        },
      },
    });
    if (!school) { res.status(404).json({ error: 'School not found' }); return; }

    // Count linked students (users with matching school name)
    const studentCount = await p.user.count({ where: { schoolType: school.schoolType, bundesland: school.state } });

    res.json({ ...school, studentCount });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /api/admin/schools/:id/verify
router.patch('/:id/verify', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { status, reason } = req.body ?? {};
  if (!['verified', 'rejected'].includes(status)) { res.status(400).json({ error: 'status must be verified or rejected' }); return; }
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    const school = await p.school.update({
      where: { id },
      data: { verificationStatus: status, verifiedAt: status === 'verified' ? new Date() : null },
    });

    await createAuditLog({
      adminId: req.admin!.id, adminRole: req.admin!.role,
      actionType: 'SCHOOL_VERIFY', newValue: { status },
      reason, ipAddress: req.admin!.ip, deviceInfo: req.admin!.device,
      metadata: { schoolId: id },
    });

    res.json(school);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /api/admin/schools/:id/license
router.patch('/:id/license', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { licenseSeats, licenseExpiresAt, licensePricePerSeat, reason } = req.body ?? {};
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    const school = await p.school.update({
      where: { id },
      data: { licenseSeats, licenseExpiresAt: licenseExpiresAt ? new Date(licenseExpiresAt) : undefined, licensePricePerSeat },
    });

    await createAuditLog({
      adminId: req.admin!.id, adminRole: req.admin!.role,
      actionType: 'SCHOOL_LICENSE_UPDATE', newValue: { licenseSeats, licenseExpiresAt },
      reason, ipAddress: req.admin!.ip, deviceInfo: req.admin!.device,
      metadata: { schoolId: id },
    });

    res.json(school);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/schools/teacher-verification — pending teacher verifications
router.get('/teacher-verification/pending', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    const pending = await p.teacherProfile.findMany({
      where: { verificationStatus: 'pending' },
      include: { user: { select: { id: true, email: true, displayName: true, createdAt: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /api/admin/schools/teacher-verification/:profileId
router.patch('/teacher-verification/:profileId', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const profileId = parseInt(req.params.profileId);
  const { status, reason } = req.body ?? {};
  if (!['verified', 'rejected'].includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    const profile = await p.teacherProfile.update({
      where: { id: profileId },
      data: { verificationStatus: status },
      include: { user: { select: { id: true } } },
    });

    if (status === 'verified') {
      await p.user.update({ where: { id: profile.user.id }, data: { userType: 'teacher' } });
    }

    await createAuditLog({
      adminId: req.admin!.id, adminRole: req.admin!.role,
      actionType: 'TEACHER_VERIFY', targetUserId: profile.user.id,
      newValue: { verificationStatus: status }, reason,
      ipAddress: req.admin!.ip, deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
