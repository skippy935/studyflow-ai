import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import { getLimits } from '../lib/tierLimits';

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

  // Tier limit: max active flashcard decks
  try {
    const p = require('../lib/prisma').default as any;
    const user = await p.user.findUnique({ where: { id: req.userId! }, select: { subscriptionTier: true } });
    const limits = getLimits(user?.subscriptionTier);
    if (limits.max_active_flashcard_decks !== -1) {
      const count = await prisma.deck.count({ where: { userId: req.userId! } });
      if (count >= limits.max_active_flashcard_decks) {
        res.status(402).json({
          error: 'UPGRADE_REQUIRED',
          message: `Du hast das Maximum von ${limits.max_active_flashcard_decks} Karteikarten-Stapeln erreicht. Upgrade auf Premium für unbegrenzte Stapel!`,
          feature: 'max_active_flashcard_decks',
          limit: limits.max_active_flashcard_decks,
          used: count,
          upgradeRequired: true,
          upgradeUrl: '/pricing',
        });
        return;
      }
    }
  } catch { /* fail open */ }

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

// POST /api/decks/:id/cards/bulk — Anki import
router.post('/:id/cards/bulk', async (req: AuthRequest, res) => {
  const deckId = parseInt(req.params.id);
  const deck = await prisma.deck.findFirst({ where: { id: deckId, userId: req.userId! } });
  if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

  const { cards } = req.body || {};
  if (!Array.isArray(cards) || cards.length === 0) {
    res.status(400).json({ error: 'cards array required' }); return;
  }
  if (cards.length > 500) {
    res.status(400).json({ error: 'Max 500 cards per import' }); return;
  }

  const valid = (cards as { front: string; back: string }[]).filter(
    c => typeof c.front === 'string' && c.front.trim() &&
         typeof c.back  === 'string' && c.back.trim()
  );

  await prisma.card.createMany({
    data: valid.map(c => ({ deckId, front: c.front.trim(), back: c.back.trim() })),
  });

  res.status(201).json({ imported: valid.length, skipped: cards.length - valid.length });
});

export default router;
