import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

// GET /api/subjects
router.get('/', async (req: AuthRequest, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      where: { userId: req.userId! },
      include: { _count: { select: { decks: true } } },
      orderBy: { createdAt: 'asc' },
    });
    res.json({ subjects });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
});

// POST /api/subjects
router.post('/', async (req: AuthRequest, res) => {
  const { name, color = '#4F46E5' } = req.body || {};
  if (!name?.trim()) { res.status(400).json({ error: 'Subject name is required' }); return; }
  try {
    const subject = await prisma.subject.create({
      data: { userId: req.userId!, name: name.trim(), color },
    });
    res.status(201).json({ subject });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

// PUT /api/subjects/:id
router.put('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { name, color } = req.body || {};
  try {
    const subject = await prisma.subject.findFirst({ where: { id, userId: req.userId! } });
    if (!subject) { res.status(404).json({ error: 'Subject not found' }); return; }
    const updated = await prisma.subject.update({
      where: { id },
      data: { ...(name ? { name: name.trim() } : {}), ...(color ? { color } : {}) },
    });
    res.json({ subject: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update subject' });
  }
});

// DELETE /api/subjects/:id  — decks become unassigned (subjectId -> null via SetNull)
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.subject.deleteMany({ where: { id, userId: req.userId! } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

export default router;
