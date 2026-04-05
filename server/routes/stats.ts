import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import { levelFromXP, xpForNextLevel, BADGE_DEFS } from '../services/gamification';

const router = Router();
router.use(auth);

// GET /api/stats/calendar?days=90
router.get('/calendar', async (req: AuthRequest, res) => {
  const days = Math.min(parseInt((req.query.days as string) || '90', 10), 365);
  const since = new Date();
  since.setDate(since.getDate() - days + 1);
  since.setHours(0, 0, 0, 0);

  try {
    const sessions = await prisma.studySession.findMany({
      where: { userId: req.userId!, studiedAt: { gte: since } },
      select: { studiedAt: true, cardsStudied: true },
    });

    const map: Record<string, number> = {};
    for (const s of sessions) {
      const key = s.studiedAt.toISOString().slice(0, 10);
      map[key] = (map[key] ?? 0) + s.cardsStudied;
    }

    const result: { date: string; count: number }[] = [];
    const cursor = new Date(since);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10);
      result.push({ date: key, count: map[key] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    res.json({ calendar: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

router.get('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;

  const [user, weakCards, dueToday, recentSessions] = await Promise.all([
    (prisma.user as any).findUnique({
      where: { id: userId },
      select: { streak: true, lastStudyDate: true, totalCardsLearned: true, xp: true, badges: true }
    }),
    prisma.card.count({
      where: { deck: { userId }, easiness: { lt: 1.8 } }
    }),
    prisma.card.count({
      where: { deck: { userId }, nextReview: { lte: new Date() } }
    }),
    prisma.studySession.findMany({
      where: { userId },
      orderBy: { studiedAt: 'desc' },
      take: 7,
      include: { deck: { select: { name: true, color: true } } }
    })
  ]);

  const xp = (user as any)?.xp ?? 0;
  const badgeKeys: string[] = JSON.parse((user as any)?.badges || '[]');
  const badges = badgeKeys.map(k => ({ key: k, ...BADGE_DEFS[k] })).filter(b => b.label);

  res.json({
    streak: user?.streak ?? 0,
    lastStudyDate: user?.lastStudyDate ?? null,
    totalCardsLearned: user?.totalCardsLearned ?? 0,
    weakCards,
    dueToday,
    recentSessions,
    xp,
    level: levelFromXP(xp),
    xpProgress: xpForNextLevel(xp),
    badges,
  });
});

// GET /api/stats/analytics — full analytics for analytics page
router.get('/analytics', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const since30 = new Date(); since30.setDate(since30.getDate() - 30); since30.setHours(0,0,0,0);
  const since7  = new Date(); since7.setDate(since7.getDate() - 7);   since7.setHours(0,0,0,0);

  try {
    const [user, sessions30, sessions7, deckStats, totalDecks, totalCards] = await Promise.all([
      (prisma.user as any).findUnique({
        where: { id: userId },
        select: { streak: true, xp: true, badges: true, totalCardsLearned: true, createdAt: true },
      }),
      prisma.studySession.findMany({
        where: { userId, studiedAt: { gte: since30 } },
        select: { cardsStudied: true, studiedAt: true, againCount: true, hardCount: true, goodCount: true, easyCount: true },
        orderBy: { studiedAt: 'asc' },
      }),
      prisma.studySession.findMany({
        where: { userId, studiedAt: { gte: since7 } },
        select: { cardsStudied: true, studiedAt: true },
      }),
      prisma.studySession.groupBy({
        by: ['deckId'],
        where: { userId, studiedAt: { gte: since30 } },
        _sum: { cardsStudied: true },
        _count: { id: true },
        orderBy: { _sum: { cardsStudied: 'desc' } },
        take: 5,
      }),
      prisma.deck.count({ where: { userId } }),
      prisma.card.count({ where: { deck: { userId } } }),
    ]);

    // Daily cards chart (30 days)
    const dailyMap: Record<string, { cards: number; sessions: number }> = {};
    for (const s of sessions30) {
      const key = s.studiedAt.toISOString().slice(0, 10);
      if (!dailyMap[key]) dailyMap[key] = { cards: 0, sessions: 0 };
      dailyMap[key].cards    += s.cardsStudied;
      dailyMap[key].sessions += 1;
    }
    const dailyChart: { date: string; cards: number; sessions: number }[] = [];
    const cursor = new Date(since30);
    const today  = new Date(); today.setHours(0,0,0,0);
    while (cursor <= today) {
      const key = cursor.toISOString().slice(0, 10);
      dailyChart.push({ date: key, ...(dailyMap[key] ?? { cards: 0, sessions: 0 }) });
      cursor.setDate(cursor.getDate() + 1);
    }

    // Answer quality breakdown (30d)
    const quality = sessions30.reduce(
      (acc, s) => ({
        again: acc.again + s.againCount,
        hard:  acc.hard  + s.hardCount,
        good:  acc.good  + s.goodCount,
        easy:  acc.easy  + s.easyCount,
      }),
      { again: 0, hard: 0, good: 0, easy: 0 }
    );

    // Top decks with names
    const topDeckIds = deckStats.map((d: any) => d.deckId);
    const topDeckNames = await prisma.deck.findMany({
      where: { id: { in: topDeckIds } },
      select: { id: true, name: true, color: true },
    });
    const nameMap = Object.fromEntries(topDeckNames.map(d => [d.id, d]));
    const topDecks = deckStats.map((d: any) => ({
      deckId: d.deckId,
      name: nameMap[d.deckId]?.name ?? 'Unknown',
      color: nameMap[d.deckId]?.color ?? '#4F46E5',
      cardsStudied: d._sum.cardsStudied ?? 0,
      sessions: d._count.id,
    }));

    // Week-over-week comparison
    const cards7  = sessions7.reduce((s, r) => s + r.cardsStudied, 0);
    const studyDays30 = new Set(sessions30.map(s => s.studiedAt.toISOString().slice(0, 10))).size;
    const studyDays7  = new Set(sessions7.map(s =>  s.studiedAt.toISOString().slice(0, 10))).size;

    const xp = user?.xp ?? 0;

    res.json({
      summary: {
        totalDecks,
        totalCards,
        totalCardsLearned: user?.totalCardsLearned ?? 0,
        streak: user?.streak ?? 0,
        xp,
        level: levelFromXP(xp),
        cards30d: sessions30.reduce((s, r) => s + r.cardsStudied, 0),
        cards7d: cards7,
        sessions30d: sessions30.length,
        studyDays30d: studyDays30,
        studyDays7d: studyDays7,
        avgCardsPerDay: studyDays30 > 0 ? Math.round(sessions30.reduce((s, r) => s + r.cardsStudied, 0) / studyDays30) : 0,
        memberSince: user?.createdAt ?? null,
      },
      dailyChart,
      quality,
      topDecks,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
