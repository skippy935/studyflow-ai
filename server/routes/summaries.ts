import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/', async (req: AuthRequest, res) => {
  const summaries = await prisma.summary.findMany({
    where: { userId: req.userId! },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ summaries });
});

router.get('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const summary = await prisma.summary.findFirst({ where: { id, userId: req.userId! } });
  if (!summary) { res.status(404).json({ error: 'Summary not found' }); return; }
  res.json({ summary });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const summary = await prisma.summary.findFirst({ where: { id, userId: req.userId! } });
  if (!summary) { res.status(404).json({ error: 'Summary not found' }); return; }
  await prisma.summary.delete({ where: { id } });
  res.json({ success: true });
});

export default router;
