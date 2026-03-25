import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;

  const [user, weakCards, dueToday, recentSessions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { streak: true, lastStudyDate: true, totalCardsLearned: true }
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

  res.json({
    streak: user?.streak ?? 0,
    lastStudyDate: user?.lastStudyDate ?? null,
    totalCardsLearned: user?.totalCardsLearned ?? 0,
    weakCards,
    dueToday,
    recentSessions
  });
});

export default router;
