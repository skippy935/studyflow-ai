import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

// POST /api/classes/join  { joinCode }
router.post('/join', async (req: AuthRequest, res) => {
  const { joinCode } = req.body || {};
  if (!joinCode) { res.status(400).json({ error: 'Join code required' }); return; }
  try {
    const cls = await (prisma as any).class.findUnique({
      where: { joinCode: joinCode.toUpperCase() },
    });
    if (!cls || cls.isArchived) { res.status(404).json({ error: 'Class not found. Check the code.' }); return; }

    await (prisma as any).classMember.upsert({
      where:  { classId_userId: { classId: cls.id, userId: req.userId! } },
      update: {},
      create: { classId: cls.id, userId: req.userId! },
    });
    res.json({ class: { id: cls.id, name: cls.name, subject: cls.subject } });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/classes/mine — classes the student has joined
router.get('/mine', async (req: AuthRequest, res) => {
  try {
    const memberships = await (prisma as any).classMember.findMany({
      where: { userId: req.userId! },
      include: {
        class: {
          include: {
            teacher: { include: { user: { select: { displayName: true } } } },
            _count: { select: { assignments: true } },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });
    res.json({ classes: memberships.map((m: any) => m.class) });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/classes/:id/assignments — assignments for a class the student is in
router.get('/:id/assignments', async (req: AuthRequest, res) => {
  try {
    const member = await (prisma as any).classMember.findFirst({
      where: { classId: parseInt(req.params.id), userId: req.userId! },
    });
    if (!member) { res.status(403).json({ error: 'Not a member of this class' }); return; }

    const assignments = await (prisma as any).assignment.findMany({
      where: { classId: parseInt(req.params.id) },
      include: {
        submissions: {
          where: { studentId: req.userId! },
          select: { id: true, status: true, grade: true, submittedAt: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ assignments });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/classes/:id/assignments/:aId/submit
router.post('/:id/assignments/:aId/submit', async (req: AuthRequest, res) => {
  const { content } = req.body || {};
  try {
    const member = await (prisma as any).classMember.findFirst({
      where: { classId: parseInt(req.params.id), userId: req.userId! },
    });
    if (!member) { res.status(403).json({ error: 'Not a member of this class' }); return; }

    const sub = await (prisma as any).submission.upsert({
      where: { assignmentId_studentId: { assignmentId: parseInt(req.params.aId), studentId: req.userId! } },
      update: { content: content || '', submittedAt: new Date(), status: 'submitted' },
      create: { assignmentId: parseInt(req.params.aId), studentId: req.userId!, content: content || '' },
    });
    res.json({ submission: sub });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
