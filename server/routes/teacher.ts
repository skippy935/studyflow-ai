import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);
const p = prisma as any;

// ── Helpers ───────────────────────────────────────────────────────────────────

function randomJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

async function requireApprovedTeacher(userId: number) {
  const profile = await p.teacherProfile.findUnique({ where: { userId } });
  if (!profile)                                    return { error: 'Not a teacher', profile: null };
  if (profile.verificationStatus !== 'approved')   return { error: 'Teacher account not yet approved', profile: null };
  return { error: null, profile };
}

// ── Teacher profile & onboarding ──────────────────────────────────────────────

// POST /api/teacher/register — legacy: make any user a teacher
router.post('/register', async (req: AuthRequest, res) => {
  const { schoolName } = req.body || {};
  try {
    await p.user.update({ where: { id: req.userId! }, data: { userType: 'teacher' } });
    const profile = await p.teacherProfile.upsert({
      where:  { userId: req.userId! },
      update: { schoolName: schoolName || '' },
      create: { userId: req.userId!, schoolName: schoolName || '', verificationStatus: 'pending' },
    });
    res.json({ profile });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// GET /api/teacher/profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const profile = await p.teacherProfile.findUnique({ where: { userId: req.userId! } });
    res.json({ profile, isTeacher: !!profile, teacherStatus: profile?.verificationStatus ?? null });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// POST /api/teacher/onboarding — complete teacher profile (triggers pending_approval)
router.post('/onboarding', async (req: AuthRequest, res) => {
  const { schoolName, bundesland, subjects } = req.body || {};
  if (!schoolName || !bundesland || !subjects?.length) {
    res.status(400).json({ error: 'School name, Bundesland, and subjects are required' }); return;
  }
  try {
    const user = await p.user.findUnique({ where: { id: req.userId! } });
    if (!user || user.userType !== 'teacher') {
      res.status(403).json({ error: 'Teacher account required' }); return;
    }
    // Check if auto-approval is enabled
    const flag = await p.featureFlag.findUnique({ where: { key: 'teacher_auto_approval' } });
    const autoApprove = flag?.isEnabled === true;
    const newStatus = autoApprove ? 'approved' : 'pending_approval';

    const profile = await p.teacherProfile.upsert({
      where:  { userId: req.userId! },
      update: {
        schoolName: schoolName.trim(),
        bundesland,
        subjects: JSON.stringify(Array.isArray(subjects) ? subjects : [subjects]),
        verificationStatus: newStatus,
        ...(autoApprove ? { approvedAt: new Date() } : {}),
      },
      create: {
        userId: req.userId!,
        schoolName: schoolName.trim(),
        bundesland,
        subjects: JSON.stringify(Array.isArray(subjects) ? subjects : [subjects]),
        verificationStatus: newStatus,
        ...(autoApprove ? { approvedAt: new Date() } : {}),
      },
    });
    res.json({ profile, teacherStatus: newStatus });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// ── Classes (approved teachers only) ─────────────────────────────────────────

router.get('/classes', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const classes = await p.class.findMany({
      where: { teacherId: profile.id, isArchived: false },
      include: { _count: { select: { members: true, assignments: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ classes });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post('/classes', async (req: AuthRequest, res) => {
  const { name, subject, gradeLevel } = req.body || {};
  if (!name) { res.status(400).json({ error: 'Class name required' }); return; }
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }

    let joinCode = randomJoinCode();
    for (let i = 0; i < 5; i++) {
      if (!await p.class.findUnique({ where: { joinCode } })) break;
      joinCode = randomJoinCode();
    }
    const cls = await p.class.create({
      data: { teacherId: profile.id, name, subject: subject || '', gradeLevel: gradeLevel || '', joinCode },
    });
    res.json({ class: cls });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.get('/classes/:id', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const cls = await p.class.findFirst({
      where: { id: parseInt(req.params.id), teacherId: profile.id },
      include: {
        members: {
          include: { user: { select: { id: true, displayName: true, email: true, xp: true, streak: true, totalCardsLearned: true, lastStudyDate: true } } },
        },
        assignments: { include: { _count: { select: { submissions: true } } }, orderBy: { createdAt: 'desc' } },
        announcements: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!cls) { res.status(404).json({ error: 'Class not found' }); return; }
    res.json({ class: cls });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// PATCH /api/teacher/classes/:id/rotate-code
router.patch('/classes/:id/rotate-code', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    let joinCode = randomJoinCode();
    for (let i = 0; i < 5; i++) {
      if (!await p.class.findUnique({ where: { joinCode } })) break;
      joinCode = randomJoinCode();
    }
    const cls = await p.class.updateMany({
      where: { id: parseInt(req.params.id), teacherId: profile.id },
      data: { joinCode },
    });
    res.json({ ok: true, joinCode });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.delete('/classes/:id', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    await p.class.updateMany({ where: { id: parseInt(req.params.id), teacherId: profile.id }, data: { isArchived: true } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// PATCH /api/teacher/classes/:id/remove-student/:studentId
router.patch('/classes/:id/remove-student/:studentId', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    // Verify class belongs to teacher
    const cls = await p.class.findFirst({ where: { id: parseInt(req.params.id), teacherId: profile.id } });
    if (!cls) { res.status(404).json({ error: 'Class not found' }); return; }
    await p.classMember.deleteMany({
      where: { classId: cls.id, userId: parseInt(req.params.studentId) },
    });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// ── Student: join class by code ───────────────────────────────────────────────

// Simple in-memory rate limiter for join (5 per 5 min per user)
const joinAttempts: Map<number, { count: number; resetAt: number }> = new Map();

router.post('/join', async (req: AuthRequest, res) => {
  const { code } = req.body || {};
  if (!code) { res.status(400).json({ error: 'Join code required' }); return; }

  const userId = req.userId!;
  const now = Date.now();
  const entry = joinAttempts.get(userId);
  if (entry && now < entry.resetAt && entry.count >= 5) {
    const secs = Math.ceil((entry.resetAt - now) / 1000);
    res.status(429).json({ error: `Too many attempts. Try again in ${secs}s`, retryAfter: secs });
    return;
  }
  if (!entry || now >= entry.resetAt) {
    joinAttempts.set(userId, { count: 1, resetAt: now + 5 * 60 * 1000 });
  } else {
    entry.count++;
  }

  const normalised = code.trim().toUpperCase().replace(/\s/g, '');
  try {
    const cls = await p.class.findUnique({
      where: { joinCode: normalised },
      include: { teacher: { include: { user: true } } },
    });
    if (!cls) { res.status(404).json({ error: 'Invalid or inactive join code' }); return; }
    if (cls.isArchived) { res.status(400).json({ error: 'This class is no longer active' }); return; }

    // Teacher must be approved
    if (cls.teacher.verificationStatus !== 'approved') {
      res.status(400).json({ error: 'Invalid or inactive join code' }); return;
    }

    // Check if already a member
    const existing = await p.classMember.findUnique({ where: { classId_userId: { classId: cls.id, userId } } });
    if (existing) { res.status(400).json({ error: 'You are already a member of this class' }); return; }

    await p.classMember.create({ data: { classId: cls.id, userId } });
    res.json({ ok: true, class: { id: cls.id, name: cls.name, subject: cls.subject, joinCode: cls.joinCode } });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// GET /api/teacher/my-classes — for students: classes they're in
router.get('/my-classes', async (req: AuthRequest, res) => {
  try {
    const memberships = await p.classMember.findMany({
      where: { userId: req.userId! },
      include: { class: { include: { teacher: { include: { user: { select: { displayName: true } } } }, _count: { select: { members: true, assignments: true } } } } },
      orderBy: { joinedAt: 'desc' },
    });
    res.json({ classes: memberships.map((m: any) => m.class) });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// ── Assignments ───────────────────────────────────────────────────────────────

router.post('/assignments', async (req: AuthRequest, res) => {
  const { classId, title, description, dueDate, maxXp, maxAttempts, instantFeedback, timeLimit, diffMode } = req.body || {};
  if (!classId || !title) { res.status(400).json({ error: 'classId and title required' }); return; }
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const cls = await p.class.findFirst({ where: { id: classId, teacherId: profile.id } });
    if (!cls) { res.status(403).json({ error: 'Class not found' }); return; }

    const assignment = await p.assignment.create({
      data: {
        classId,
        title,
        description: description || '',
        dueDate: dueDate ? new Date(dueDate) : null,
        maxXp: maxXp || 10,
      },
    });
    res.json({ assignment });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.get('/assignments/:id/submissions', async (req: AuthRequest, res) => {
  try {
    const { error } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const submissions = await p.submission.findMany({
      where: { assignmentId: parseInt(req.params.id) },
      include: { student: { select: { id: true, displayName: true, email: true } } },
      orderBy: { submittedAt: 'desc' },
    });
    res.json({ submissions });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.put('/submissions/:id/grade', async (req: AuthRequest, res) => {
  const { grade, feedback } = req.body || {};
  try {
    const sub = await p.submission.update({
      where: { id: parseInt(req.params.id) },
      data:  { grade, feedback: feedback || '', status: 'graded' },
    });
    res.json({ submission: sub });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// ── Material library ──────────────────────────────────────────────────────────

router.get('/materials', async (req: AuthRequest, res) => {
  const { q, subject, isDraft } = req.query as Record<string, string>;
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const where: any = { teacherId: profile.id };
    if (subject) where.subject = subject;
    if (isDraft !== undefined) where.isDraft = isDraft === 'true';
    if (q) where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { topic: { contains: q, mode: 'insensitive' } },
    ];
    const materials = await p.material.findMany({ where, orderBy: { updatedAt: 'desc' } });
    res.json({ materials });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post('/materials', async (req: AuthRequest, res) => {
  const { title, description, content, fileUrl, fileType, subject, topic, isDraft, tags } = req.body || {};
  if (!title) { res.status(400).json({ error: 'Title required' }); return; }
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const material = await p.material.create({
      data: {
        teacherId: profile.id,
        title, description: description || '', content: content || '',
        fileUrl: fileUrl || null, fileType: fileType || 'text',
        subject: subject || '', topic: topic || '',
        isDraft: isDraft !== false,
        tags: JSON.stringify(tags || []),
      },
    });
    res.json({ material });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.put('/materials/:id', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const { title, description, content, subject, topic, isDraft, tags } = req.body || {};
    const data: any = {};
    if (title !== undefined)       data.title = title;
    if (description !== undefined) data.description = description;
    if (content !== undefined)     data.content = content;
    if (subject !== undefined)     data.subject = subject;
    if (topic !== undefined)       data.topic = topic;
    if (isDraft !== undefined)     data.isDraft = isDraft;
    if (tags !== undefined)        data.tags = JSON.stringify(tags);
    const material = await p.material.updateMany({
      where: { id: parseInt(req.params.id), teacherId: profile.id }, data,
    });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.delete('/materials/:id', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    await p.material.deleteMany({ where: { id: parseInt(req.params.id), teacherId: profile.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// ── Announcements ──────────────────────────────────────────────────────────────

router.get('/announcements', async (req: AuthRequest, res) => {
  const { classId } = req.query as Record<string, string>;
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const where: any = { teacherId: profile.id };
    if (classId) where.classId = parseInt(classId);
    const announcements = await p.announcement.findMany({
      where, orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }], take: 50,
    });
    res.json({ announcements });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.post('/announcements', async (req: AuthRequest, res) => {
  const { classId, title, body, pinned } = req.body || {};
  if (!title || !body) { res.status(400).json({ error: 'Title and body required' }); return; }
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    const ann = await p.announcement.create({
      data: { teacherId: profile.id, classId: classId || null, title, body, pinned: !!pinned },
    });
    res.json({ announcement: ann });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

router.delete('/announcements/:id', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }
    await p.announcement.deleteMany({ where: { id: parseInt(req.params.id), teacherId: profile.id } });
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

// ── Analytics ─────────────────────────────────────────────────────────────────

router.get('/analytics/:classId', async (req: AuthRequest, res) => {
  try {
    const { error, profile } = await requireApprovedTeacher(req.userId!);
    if (error) { res.status(403).json({ error }); return; }

    const classId = parseInt(req.params.classId);
    const cls = await p.class.findFirst({
      where: { id: classId, teacherId: profile.id },
      include: {
        members: { include: { user: { select: { id: true, displayName: true, email: true, xp: true, streak: true, lastStudyDate: true } } } },
        assignments: { include: { submissions: { select: { grade: true, status: true, studentId: true, submittedAt: true } }, _count: { select: { submissions: true } } } },
      },
    });
    if (!cls) { res.status(404).json({ error: 'Class not found' }); return; }

    const totalStudents = cls.members.length;
    const assignments   = cls.assignments;
    const totalAssignments = assignments.length;

    const completionRates = assignments.map((a: any) => ({
      id: a.id, title: a.title, dueDate: a.dueDate,
      submitted: a._count.submissions,
      total: totalStudents,
      rate: totalStudents > 0 ? Math.round((a._count.submissions / totalStudents) * 100) : 0,
      avgGrade: a.submissions.filter((s: any) => s.grade != null).length > 0
        ? Math.round(a.submissions.filter((s: any) => s.grade != null).reduce((acc: number, s: any) => acc + s.grade, 0) / a.submissions.filter((s: any) => s.grade != null).length)
        : null,
    }));

    const overdue = assignments.filter((a: any) => a.dueDate && new Date(a.dueDate) < new Date() && a._count.submissions < totalStudents).length;
    const activeStudents = cls.members.filter((m: any) => {
      if (!m.user.lastStudyDate) return false;
      const dayAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(m.user.lastStudyDate) > dayAgo;
    }).length;

    res.json({
      class: { id: cls.id, name: cls.name, subject: cls.subject },
      totalStudents, totalAssignments, overdue, activeStudents,
      completionRates,
      roster: cls.members.map((m: any) => ({
        id: m.user.id, displayName: m.user.displayName, email: m.user.email,
        xp: m.user.xp, streak: m.user.streak, joinedAt: m.joinedAt,
        lastStudyDate: m.user.lastStudyDate,
        submittedCount: assignments.filter((a: any) =>
          a.submissions.some((s: any) => s.studentId === m.user.id)).length,
      })),
    });
  } catch (err) { res.status(500).json({ error: String(err) }); }
});

export default router;
