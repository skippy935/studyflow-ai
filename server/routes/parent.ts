import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

// POST /api/parent/link  { childEmail } — parent sends link request
router.post('/link', async (req: AuthRequest, res) => {
  const { childEmail } = req.body || {};
  if (!childEmail) { res.status(400).json({ error: 'childEmail required' }); return; }
  try {
    const child = await prisma.user.findUnique({ where: { email: childEmail }, select: { id: true, displayName: true } });
    if (!child) { res.status(404).json({ error: 'No account found with that email' }); return; }
    if (child.id === req.userId) { res.status(400).json({ error: 'Cannot link to yourself' }); return; }

    const link = await (prisma as any).parentChildLink.upsert({
      where:  { parentId_childId: { parentId: req.userId!, childId: child.id } },
      update: { status: 'pending' },
      create: { parentId: req.userId!, childId: child.id, status: 'pending' },
    });
    res.json({ link, childName: child.displayName });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/parent/links — parent gets their linked children
router.get('/links', async (req: AuthRequest, res) => {
  try {
    const links = await (prisma as any).parentChildLink.findMany({
      where: { parentId: req.userId! },
      include: { child: { select: { id: true, displayName: true, email: true, xp: true, streak: true, totalCardsLearned: true, lastStudyDate: true, badges: true } } },
    });
    res.json({ links });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/parent/requests — child sees pending link requests from parents
router.get('/requests', async (req: AuthRequest, res) => {
  try {
    const requests = await (prisma as any).parentChildLink.findMany({
      where: { childId: req.userId!, status: 'pending' },
      include: { parent: { select: { id: true, displayName: true, email: true } } },
    });
    res.json({ requests });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT /api/parent/link/:id  { action: 'accept' | 'reject' }
router.put('/link/:id', async (req: AuthRequest, res) => {
  const { action } = req.body || {};
  if (!['accept', 'reject'].includes(action)) { res.status(400).json({ error: 'action must be accept or reject' }); return; }
  try {
    const link = await (prisma as any).parentChildLink.findFirst({
      where: { id: parseInt(req.params.id), childId: req.userId! },
    });
    if (!link) { res.status(404).json({ error: 'Request not found' }); return; }

    const updated = await (prisma as any).parentChildLink.update({
      where: { id: link.id },
      data:  { status: action === 'accept' ? 'accepted' : 'rejected', acceptedAt: action === 'accept' ? new Date() : null },
    });
    res.json({ link: updated });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/parent/child/:id/progress — parent views child aggregate progress
router.get('/child/:id/progress', async (req: AuthRequest, res) => {
  const childId = parseInt(req.params.id);
  try {
    // Verify the link is accepted
    const link = await (prisma as any).parentChildLink.findFirst({
      where: { parentId: req.userId!, childId, status: 'accepted' },
    });
    if (!link) { res.status(403).json({ error: 'Not linked to this child or link not accepted' }); return; }

    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [child, recentSessions, deckCount] = await Promise.all([
      (prisma.user as any).findUnique({
        where: { id: childId },
        select: { displayName: true, xp: true, streak: true, totalCardsLearned: true, lastStudyDate: true, badges: true, gradeLevel: true, schoolType: true },
      }),
      prisma.studySession.findMany({
        where: { userId: childId, studiedAt: { gte: since } },
        select: { cardsStudied: true, studiedAt: true },
        orderBy: { studiedAt: 'desc' },
      }),
      prisma.deck.count({ where: { userId: childId } }),
    ]);

    const totalCards30d = recentSessions.reduce((s: number, r: any) => s + r.cardsStudied, 0);
    const studyDays30d  = new Set(recentSessions.map((s: any) => s.studiedAt.toISOString().slice(0, 10))).size;

    res.json({
      child,
      stats: { totalCards30d, studyDays30d, deckCount, sessionsCount: recentSessions.length },
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/parent/link/:id — remove link
router.delete('/link/:id', async (req: AuthRequest, res) => {
  try {
    await (prisma as any).parentChildLink.deleteMany({
      where: { id: parseInt(req.params.id), parentId: req.userId! },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
