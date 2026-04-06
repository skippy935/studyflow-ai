import { Router, Response } from 'express';
import prisma from '../../lib/prisma';
import { adminAuth, AdminRequest } from '../../middleware/adminAuth';
import { createAuditLog } from '../../lib/auditLog';
import { invalidateFlagCache } from '../../lib/featureFlags';

const router = Router();
const p = prisma as any;

const DEFAULT_FLAGS = [
  { key: 'ai_chat', name: 'AI Chat Assistant', category: 'ai', isKillSwitch: true, description: 'Master switch for all AI chat functionality' },
  { key: 'ai_quiz_gen', name: 'AI Quiz Generation', category: 'ai', isKillSwitch: true, description: 'AI-powered quiz generation from uploaded content' },
  { key: 'ai_ocr', name: 'AI OCR / Document Scan', category: 'ai', isKillSwitch: true, description: 'OCR processing of uploaded images and PDFs' },
  { key: 'ai_explain', name: 'AI Explain Feature', category: 'ai', isKillSwitch: true, description: 'AI explanations for learning content' },
  { key: 'ai_flashcards', name: 'AI Flashcard Generation', category: 'ai', isKillSwitch: true, description: 'AI-generated flashcards' },
  { key: 'leaderboard', name: 'Leaderboard', category: 'gamification', isKillSwitch: true, description: 'Global and school leaderboards' },
  { key: 'xp_system', name: 'XP & Level System', category: 'gamification', isKillSwitch: true, description: 'XP earning and level-up functionality' },
  { key: 'file_upload', name: 'File Upload', category: 'core', isKillSwitch: true, description: 'All user file uploads (PDFs, images)' },
  { key: 'user_registration', name: 'New User Registration', category: 'core', isKillSwitch: true, description: 'Ability for new users to register' },
  { key: 'payments', name: 'Payment Processing', category: 'payments', isKillSwitch: true, description: 'All Stripe payment flows' },
  { key: 'premium_upgrade', name: 'Premium Upgrade Flow', category: 'payments', isKillSwitch: false, description: 'Upgrade prompts and checkout' },
  { key: 'study_groups', name: 'Study Groups', category: 'social', isKillSwitch: false, description: 'Collaborative study group feature' },
  { key: 'chat_messages', name: 'User-to-User Chat', category: 'social', isKillSwitch: true, description: 'Direct messages between users' },
  { key: 'teacher_content', name: 'Teacher Content Upload', category: 'core', isKillSwitch: false, description: 'Teachers uploading learning materials' },
  { key: 'school_dashboard', name: 'School Dashboard', category: 'core', isKillSwitch: false, description: 'School admin dashboard for teachers' },
];

// GET /api/admin/feature-flags — list all flags
router.get('/', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    // Seed defaults if none exist
    const count = await p.featureFlag.count();
    if (count === 0) {
      for (const flag of DEFAULT_FLAGS) {
        await p.featureFlag.create({ data: flag });
      }
    }

    const flags = await p.featureFlag.findMany({ orderBy: [{ isKillSwitch: 'desc' }, { category: 'asc' }] });
    res.json(flags);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/feature-flags/:key/history
router.get('/:key/history', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  try {
    const flag = await p.featureFlag.findUnique({ where: { key: req.params.key } });
    if (!flag) { res.status(404).json({ error: 'Flag not found' }); return; }

    const history = await p.featureFlagHistory.findMany({
      where: { flagId: flag.id },
      orderBy: { changedAt: 'desc' },
      take: 50,
    });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PATCH /api/admin/feature-flags/:key — update a flag
router.patch('/:key', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { key } = req.params;
  const { isEnabled, rolloutPercentage, reason, enabledForSubscriptions, enabledForUserIds, disabledForUserIds } = req.body ?? {};

  if (!reason?.trim() || reason.trim().length < 10) {
    res.status(400).json({ error: 'reason is required (min 10 characters)' });
    return;
  }

  try {
    const flag = await p.featureFlag.findUnique({ where: { key } });
    if (!flag) { res.status(404).json({ error: 'Flag not found' }); return; }

    const updateData: any = { changeReason: reason, lastChangedAt: new Date() };
    if (typeof isEnabled === 'boolean') updateData.isEnabled = isEnabled;
    if (typeof rolloutPercentage === 'number') updateData.rolloutPercentage = Math.min(100, Math.max(0, rolloutPercentage));
    if (enabledForSubscriptions) updateData.enabledForSubscriptions = JSON.stringify(enabledForSubscriptions);
    if (enabledForUserIds) updateData.enabledForUserIds = JSON.stringify(enabledForUserIds);
    if (disabledForUserIds) updateData.disabledForUserIds = JSON.stringify(disabledForUserIds);

    const previousState = { isEnabled: flag.isEnabled, rolloutPercentage: flag.rolloutPercentage };
    const updated = await p.featureFlag.update({ where: { key }, data: updateData });

    await p.featureFlagHistory.create({
      data: {
        flagId: flag.id,
        adminId: req.admin!.id,
        previousState,
        newState: updateData,
        reason,
      },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'FEATURE_FLAG_CHANGE',
      previousValue: previousState,
      newValue: updateData,
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
      metadata: { flagKey: key },
    });

    invalidateFlagCache(key);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/admin/feature-flags — create new flag
router.post('/', adminAuth('SUPER_ADMIN'), async (req: AdminRequest, res: Response) => {
  const { key, name, description, category, isKillSwitch, reason } = req.body ?? {};
  if (!key || !name) { res.status(400).json({ error: 'key and name required' }); return; }
  if (!reason?.trim()) { res.status(400).json({ error: 'reason required' }); return; }

  try {
    const flag = await p.featureFlag.create({
      data: { key, name, description: description ?? '', category: category ?? 'core', isKillSwitch: isKillSwitch ?? false, changeReason: reason },
    });

    await createAuditLog({
      adminId: req.admin!.id,
      adminRole: req.admin!.role,
      actionType: 'FEATURE_FLAG_CREATE',
      newValue: { key, name },
      reason,
      ipAddress: req.admin!.ip,
      deviceInfo: req.admin!.device,
    });

    res.json(flag);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/feature-flags/check/:key/:userId — evaluate flag for a user
router.get('/check/:key/:userId', adminAuth('MODERATOR'), async (req: AdminRequest, res: Response) => {
  const { isFeatureEnabled } = await import('../../lib/featureFlags');
  const userId = parseInt(req.params.userId);
  const result = await isFeatureEnabled(req.params.key, userId);
  res.json({ enabled: result });
});

export default router;
