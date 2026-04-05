import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);
const p = prisma as any;

// GET /api/export/deck/:id/csv — export deck as CSV
router.get('/deck/:id/csv', async (req: AuthRequest, res) => {
  const deckId = parseInt(req.params.id);
  try {
    const deck = await p.deck.findFirst({
      where: { id: deckId, userId: req.userId! },
      include: { cards: { select: { front: true, back: true, difficulty: true, repetitions: true, easiness: true } } },
    });
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const header = 'Front,Back,Difficulty,Repetitions,Easiness';
    const rows = deck.cards.map((c: any) =>
      [escape(c.front), escape(c.back), escape(c.difficulty), c.repetitions, c.easiness.toFixed(2)].join(',')
    );
    const csv = [header, ...rows].join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(deck.name)}.csv"`);
    res.send('\uFEFF' + csv); // BOM for Excel compatibility
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/export/deck/:id/anki — export as Anki-compatible TSV
router.get('/deck/:id/anki', async (req: AuthRequest, res) => {
  const deckId = parseInt(req.params.id);
  try {
    const deck = await p.deck.findFirst({
      where: { id: deckId, userId: req.userId! },
      include: { cards: { select: { front: true, back: true } } },
    });
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const lines = deck.cards.map((c: any) =>
      `${c.front.replace(/\t/g, ' ')}\t${c.back.replace(/\t/g, ' ')}`
    );
    const tsv = lines.join('\n');

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(deck.name)}_anki.txt"`);
    res.send(tsv);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/export/deck/:id/json — export deck as JSON
router.get('/deck/:id/json', async (req: AuthRequest, res) => {
  const deckId = parseInt(req.params.id);
  try {
    const deck = await p.deck.findFirst({
      where: { id: deckId, userId: req.userId! },
      include: { cards: { select: { front: true, back: true, difficulty: true, easiness: true, interval: true, repetitions: true } } },
    });
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const exportData = {
      name: deck.name,
      description: deck.description,
      color: deck.color,
      exportedAt: new Date().toISOString(),
      cards: deck.cards,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(deck.name)}.json"`);
    res.json(exportData);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/export/all — full user data export (GDPR)
router.get('/all', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  try {
    const [user, decks, sessions, tasks] = await Promise.all([
      p.user.findUnique({
        where: { id: userId },
        select: { email: true, displayName: true, xp: true, streak: true, totalCardsLearned: true, createdAt: true, uiLanguage: true },
      }),
      p.deck.findMany({
        where: { userId },
        include: { cards: { select: { front: true, back: true, difficulty: true } } },
      }),
      p.studySession.findMany({
        where: { userId },
        select: { studiedAt: true, cardsStudied: true, againCount: true, hardCount: true, goodCount: true, easyCount: true },
        orderBy: { studiedAt: 'desc' },
        take: 1000,
      }),
      p.studyTask.findMany({
        where: { userId },
        select: { title: true, notes: true, dueDate: true, done: true, createdAt: true },
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user,
      decks,
      studySessions: sessions,
      studyTasks: tasks,
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="studyflow_export.json"');
    res.json(exportData);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
