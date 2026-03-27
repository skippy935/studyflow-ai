import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/', async (req: AuthRequest, res) => {
  const decks = await prisma.deck.findMany({
    where: { userId: req.userId! },
    include: { _count: { select: { cards: true } } },
    orderBy: { updatedAt: 'desc' }
  });
  res.json({ decks });
});

// PATCH /api/decks/:id/subject — assign or remove subject
router.patch('/:id/subject', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { subjectId } = req.body || {};
  try {
    const deck = await prisma.deck.findFirst({ where: { id, userId: req.userId! } });
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }
    if (subjectId !== null && subjectId !== undefined) {
      const subject = await prisma.subject.findFirst({ where: { id: subjectId, userId: req.userId! } });
      if (!subject) { res.status(404).json({ error: 'Subject not found' }); return; }
    }
    const updated = await prisma.deck.update({ where: { id }, data: { subjectId: subjectId ?? null } });
    res.json({ deck: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update deck subject' });
  }
});

router.post('/', async (req: AuthRequest, res) => {
  const { name, description = '', color = '#4F46E5' } = req.body || {};
  if (!name) { res.status(400).json({ error: 'Deck name is required' }); return; }
  const deck = await prisma.deck.create({ data: { userId: req.userId!, name: name.trim(), description: description.trim(), color } });
  res.status(201).json({ deck });
});

router.get('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const deck = await prisma.deck.findFirst({ where: { id, userId: req.userId! } });
  if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }
  const cards = await prisma.card.findMany({ where: { deckId: id }, orderBy: { id: 'asc' } });
  res.json({ deck, cards });
});

router.put('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const deck = await prisma.deck.findFirst({ where: { id, userId: req.userId! } });
  if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }
  const { name, description, color, isFavorite } = req.body || {};
  const updated = await prisma.deck.update({ where: { id }, data: { name, description, color, isFavorite } });
  res.json({ deck: updated });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const deck = await prisma.deck.findFirst({ where: { id, userId: req.userId! } });
  if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }
  await prisma.deck.delete({ where: { id } });
  res.json({ success: true });
});

router.get('/:id/due', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const deck = await prisma.deck.findFirst({ where: { id, userId: req.userId! } });
  if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }
  const cards = await prisma.card.findMany({
    where: { deckId: id, nextReview: { lte: new Date() } },
    orderBy: { nextReview: 'asc' }
  });
  res.json({ deck, cards });
});

router.post('/:id/cards', async (req: AuthRequest, res) => {
  const deckId = parseInt(req.params.id);
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: req.userId! } });
  if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }
  const { front, back, difficulty = 'medium' } = req.body || {};
  if (!front || !back) { res.status(400).json({ error: 'Front and back required' }); return; }
  const card = await prisma.card.create({ data: { deckId, front: front.trim(), back: back.trim(), difficulty } });
  res.status(201).json({ card });
});

export default router;
