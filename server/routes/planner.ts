import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

// GET /api/planner — list tasks
router.get('/', async (req: AuthRequest, res) => {
  try {
    const tasks = await prisma.studyTask.findMany({
      where: { userId: req.userId! },
      include: { deck: { select: { id: true, name: true, color: true } } },
      orderBy: [{ done: 'asc' }, { dueDate: 'asc' }, { createdAt: 'asc' }],
    });
    res.json({ tasks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/planner — create task
router.post('/', async (req: AuthRequest, res) => {
  const { title, notes = '', dueDate, deckId } = req.body || {};
  if (!title?.trim()) { res.status(400).json({ error: 'Title is required' }); return; }
  try {
    const task = await prisma.studyTask.create({
      data: {
        userId: req.userId!,
        title:  title.trim(),
        notes:  notes.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
        deckId:  deckId  ? parseInt(deckId)  : null,
      },
      include: { deck: { select: { id: true, name: true, color: true } } },
    });
    res.status(201).json({ task });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/planner/:id — update done / title / dueDate / deckId
router.patch('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    const task = await prisma.studyTask.findFirst({ where: { id, userId: req.userId! } });
    if (!task) { res.status(404).json({ error: 'Task not found' }); return; }

    const { done, title, notes, dueDate, deckId } = req.body || {};
    const updated = await prisma.studyTask.update({
      where: { id },
      data: {
        ...(done      !== undefined ? { done }                         : {}),
        ...(title     !== undefined ? { title: title.trim() }         : {}),
        ...(notes     !== undefined ? { notes: notes.trim() }         : {}),
        ...(dueDate   !== undefined ? { dueDate: dueDate ? new Date(dueDate) : null } : {}),
        ...(deckId    !== undefined ? { deckId: deckId ? parseInt(deckId) : null }    : {}),
      },
      include: { deck: { select: { id: true, name: true, color: true } } },
    });
    res.json({ task: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/planner/:id
router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.studyTask.deleteMany({ where: { id, userId: req.userId! } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
