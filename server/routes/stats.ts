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
    prisma.user.findUnique({
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

export default router;
