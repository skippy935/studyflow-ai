import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

router.put('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const card = await prisma.card.findFirst({ where: { id }, include: { deck: true } });
  if (!card || card.deck.userId !== req.userId!) { res.status(404).json({ error: 'Card not found' }); return; }
  const { front, back, difficulty } = req.body || {};
  const updated = await prisma.card.update({ where: { id }, data: { front, back, difficulty } });
  res.json({ card: updated });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const card = await prisma.card.findFirst({ where: { id }, include: { deck: true } });
  if (!card || card.deck.userId !== req.userId!) { res.status(404).json({ error: 'Card not found' }); return; }
  await prisma.card.delete({ where: { id } });
  res.json({ success: true });
});

router.post('/:id/review', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const card = await prisma.card.findFirst({ where: { id }, include: { deck: true } });
  if (!card || card.deck.userId !== req.userId!) { res.status(404).json({ error: 'Card not found' }); return; }

  const { rating } = req.body; // 0=again, 1=hard, 2=good, 3=easy
  let { easiness, interval, repetitions } = card;

  if (rating === 0) {
    repetitions = 0; interval = 1;
  } else {
    if (repetitions === 0)      interval = 1;
    else if (repetitions === 1) interval = 6;
    else                        interval = Math.round(interval * easiness);
    repetitions += 1;
    easiness = Math.max(1.3, easiness + 0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02));
  }

  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + interval);

  const updated = await prisma.card.update({ where: { id }, data: { easiness, interval, repetitions, nextReview } });
  res.json({ card: updated });
});

export default router;
