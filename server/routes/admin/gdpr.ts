import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../lib/auditLog';
import crypto from 'crypto';

const router = Router();
const p = prisma as any;

// GET /api/admin/gdpr/user-preview/:id — preview all data before erasure
router.get('/user-preview/:id', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await p.user.findUnique({
      where: { id: userId },
      include: {
        decks: { select: { id: true, name: true, _count: { select: { cards: true } } } },
        studySessions: { select: { id: true, studiedAt: true } },
        examinerSessions: { select: { id: true, materialName: true, createdAt: true } },
        aiUsageLogs: { select: { id: true, feature: true, totalTokens: true, createdAt: true } },
        parentLinks: { select: { id: true } },
        childLinks: { select: { id: true } },
      },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    res.json({
      userId: user.id,
      email: user.email,
      displayName: user.displayName,
      piiFields: ['email', 'displayName', 'avatarUrl', 'googleId', 'verifyCode'],
      decks: user.decks.length,
      studySessions: user.studySessions.length,
      examinerSessions: user.examinerSessions.length,
      aiUsageLogs: user.aiUsageLogs.length,
      parentLinks: user.parentLinks.length + user.childLinks.length,
      isAlreadyAnonymized: user.isAnonymized,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/gdpr/erase/:id — anonymize user (GDPR Article 17)
router.post('/erase/:id', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  const { reason } = req.body ?? {};
  if (!reason?.trim()) { res.status(400).json({ error: 'reason is required' }); return; }

  try {
    const user = await p.user.findUnique({ where: { id: userId } });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.isAnonymized) { res.status(400).json({ error: 'User already anonymized' }); return; }

    const anonUuid = crypto.randomUUID();
    const previousValue = {
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    };

    await p.user.update({
      where: { id: userId },
      data: {
        email: `deleted_${anonUuid}@erased.invalid`,
        displayName: '[DELETED]',
        avatarUrl: null,
        googleId: null,
        verifyCode: null,
        passwordHash: '',
        parentalConsentEmail: null,
        consentIp: null,
        isAnonymized: true,
        erasureCompletedAt: new Date(),
      },
    });

    // Delete examiner material (contains uploaded text)
    await p.examinerMaterial.deleteMany({
      where: { session: { userId } },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'GDPR_ERASE',
      targetUserId: userId,
      previousValue,
      newValue: { isAnonymized: true, email: `deleted_${anonUuid}@erased.invalid` },
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
      twoFactorConfirmed: req.admin!.tfaConfirmed,
    });

    res.json({
      ok: true,
      certificate: {
        userId,
        erasedAt: new Date().toISOString(),
        adminId: req.admin!.id,
        reason,
        fieldsAnonymized: ['email', 'displayName', 'avatarUrl', 'googleId', 'verifyCode', 'passwordHash'],
        filesDeleted: ['examinerMaterial'],
      },
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/gdpr/consent — consent management table
router.get('/consent', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { page = '1', filter } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * 50;

  try {
    const where: any = {};
    if (filter === 'missing_parental') {
      where.isMinor = true;
      where.parentalConsentGiven = false;
    } else if (filter === 'no_marketing') {
      where.consentMarketing = false;
    }

    const users = await p.user.findMany({
      where,
      skip,
      take: 50,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, displayName: true, isMinor: true,
        consentTerms: true, consentTermsDate: true,
        consentMarketing: true, consentMarketingDate: true,
        consentAnalytics: true, consentAnalyticsDate: true,
        parentalConsentGiven: true, parentalConsentDate: true,
        consentVersion: true, consentIp: true,
        isAnonymized: true,
      },
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/gdpr/minors — minor protection panel
router.get('/minors', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    const minors = await p.user.findMany({
      where: { isMinor: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, email: true, displayName: true, dateOfBirth: true,
        parentalConsentGiven: true, parentalConsentDate: true, parentalConsentEmail: true,
        createdAt: true, isBanned: true, aiAccessDisabled: true,
      },
    });

    // Flag minors over 7 days old without parental consent
    const flagged = minors.filter((m: any) => {
      if (m.parentalConsentGiven) return false;
      const daysSince = (Date.now() - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      return daysSince > 7;
    });

    res.json({ minors, flagged: flagged.map((f: any) => f.id) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/gdpr/minors/:id/mark-consent
router.post('/minors/:id/mark-consent', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  const { reason } = req.body ?? {};

  try {
    await p.user.update({
      where: { id: userId },
      data: { parentalConsentGiven: true, parentalConsentDate: new Date() },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'GDPR_PARENTAL_CONSENT',
      targetUserId: userId,
      reason: reason ?? 'Manual admin mark',
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/gdpr/export-data/:id — generate data portability export
router.get('/export-data/:id', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await p.user.findUnique({
      where: { id: userId },
      include: {
        decks: { include: { cards: true } },
        studySessions: true,
        quizzes: { include: { questions: true } },
        summaries: true,
        studyTasks: true,
        examinerSessions: { select: { id: true, materialName: true, difficulty: true, exchangeCount: true, gapAnalysis: true, createdAt: true } },
        aiUsageLogs: true,
      },
    });

    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'GDPR_DATA_EXPORT',
      targetUserId: userId,
      reason: 'Article 20 data portability export',
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user_${userId}_export.json"`);
    res.json({
      exportedAt: new Date().toISOString(),
      userId,
      profile: {
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
        subscriptionTier: user.subscriptionTier,
        xp: user.xp,
        streak: user.streak,
      },
      decks: user.decks,
      studySessions: user.studySessions,
      quizzes: user.quizzes,
      summaries: user.summaries,
      studyTasks: user.studyTasks,
      examinerSessions: user.examinerSessions,
      aiUsage: user.aiUsageLogs,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
