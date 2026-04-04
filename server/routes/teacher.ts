import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

function randomJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Teacher registration ──────────────────────────────────────────────────────

// POST /api/teacher/register — become a teacher
router.post('/register', async (req: AuthRequest, res) => {
  const { schoolName } = req.body || {};
  try {
    // Mark user as teacher
    await (prisma.user as any).update({
      where: { id: req.userId! },
      data:  { userType: 'teacher' },
    });
    const profile = await (prisma as any).teacherProfile.upsert({
      where:  { userId: req.userId! },
      update: { schoolName: schoolName || '' },
      create: { userId: req.userId!, schoolName: schoolName || '' },
    });
    res.json({ profile });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/teacher/profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const profile = await (prisma as any).teacherProfile.findUnique({
      where: { userId: req.userId! },
    });
    res.json({ profile, isTeacher: !!profile });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Classes ───────────────────────────────────────────────────────────────────

// GET /api/teacher/classes
router.get('/classes', async (req: AuthRequest, res) => {
  try {
    const profile = await (prisma as any).teacherProfile.findUnique({ where: { userId: req.userId! } });
    if (!profile) { res.status(403).json({ error: 'Not a teacher' }); return; }

    const classes = await (prisma as any).class.findMany({
      where:   { teacherId: profile.id, isArchived: false },
      include: { _count: { select: { members: true, assignments: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ classes });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// POST /api/teacher/classes
router.post('/classes', async (req: AuthRequest, res) => {
  const { name, subject, gradeLevel } = req.body || {};
  if (!name) { res.status(400).json({ error: 'Class name required' }); return; }
  try {
    const profile = await (prisma as any).teacherProfile.findUnique({ where: { userId: req.userId! } });
    if (!profile) { res.status(403).json({ error: 'Not a teacher' }); return; }

    let joinCode = randomJoinCode();
    // Retry on collision (extremely unlikely)
    let attempts = 0;
    while (attempts < 5) {
      const existing = await (prisma as any).class.findUnique({ where: { joinCode } });
      if (!existing) break;
      joinCode = randomJoinCode();
      attempts++;
    }

    const cls = await (prisma as any).class.create({
      data: { teacherId: profile.id, name, subject: subject || '', gradeLevel: gradeLevel || '', joinCode },
    });
    res.json({ class: cls });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/teacher/classes/:id — class detail with students + assignments
router.get('/classes/:id', async (req: AuthRequest, res) => {
  try {
    const profile = await (prisma as any).teacherProfile.findUnique({ where: { userId: req.userId! } });
    if (!profile) { res.status(403).json({ error: 'Not a teacher' }); return; }

    const cls = await (prisma as any).class.findFirst({
      where: { id: parseInt(req.params.id), teacherId: profile.id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true, displayName: true, email: true,
                xp: true, streak: true, totalCardsLearned: true, lastStudyDate: true,
              },
            },
          },
        },
        assignments: {
          include: { _count: { select: { submissions: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!cls) { res.status(404).json({ error: 'Class not found' }); return; }
    res.json({ class: cls });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// DELETE /api/teacher/classes/:id (archive)
router.delete('/classes/:id', async (req: AuthRequest, res) => {
  try {
    const profile = await (prisma as any).teacherProfile.findUnique({ where: { userId: req.userId! } });
    if (!profile) { res.status(403).json({ error: 'Not a teacher' }); return; }
    await (prisma as any).class.updateMany({
      where: { id: parseInt(req.params.id), teacherId: profile.id },
      data:  { isArchived: true },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ── Assignments ───────────────────────────────────────────────────────────────

// POST /api/teacher/assignments
router.post('/assignments', async (req: AuthRequest, res) => {
  const { classId, title, description, dueDate, maxXp } = req.body || {};
  if (!classId || !title) { res.status(400).json({ error: 'classId and title required' }); return; }
  try {
    const profile = await (prisma as any).teacherProfile.findUnique({ where: { userId: req.userId! } });
    if (!profile) { res.status(403).json({ error: 'Not a teacher' }); return; }

    const cls = await (prisma as any).class.findFirst({ where: { id: classId, teacherId: profile.id } });
    if (!cls) { res.status(403).json({ error: 'Class not found' }); return; }

    const assignment = await (prisma as any).assignment.create({
      data: {
        classId,
        title,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        maxXp: maxXp || 10,
      },
    });
    res.json({ assignment });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/teacher/assignments/:id/submissions
router.get('/assignments/:id/submissions', async (req: AuthRequest, res) => {
  try {
    const profile = await (prisma as any).teacherProfile.findUnique({ where: { userId: req.userId! } });
    if (!profile) { res.status(403).json({ error: 'Not a teacher' }); return; }

    const submissions = await (prisma as any).submission.findMany({
      where: { assignmentId: parseInt(req.params.id) },
      include: { student: { select: { id: true, displayName: true, email: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json({ submissions });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// PUT /api/teacher/submissions/:id/grade
router.put('/submissions/:id/grade', async (req: AuthRequest, res) => {
  const { grade, feedback } = req.body || {};
  try {
    const sub = await (prisma as any).submission.update({
      where: { id: parseInt(req.params.id) },
      data:  { grade, feedback: feedback || '', status: 'graded' },
    });
    res.json({ submission: sub });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
