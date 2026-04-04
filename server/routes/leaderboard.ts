import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import { levelFromXP } from '../services/gamification';

const router = Router();
router.use(auth);

// GET /api/leaderboard?scope=global&limit=50
router.get('/', async (req: AuthRequest, res) => {
  const limit = Math.min(parseInt((req.query.limit as string) || '50', 10), 100);

  try {
    const [topUsers, me] = await Promise.all([
      prisma.user.findMany({
        where:   { xp: { gt: 0 } },
        orderBy: { xp: 'desc' },
        take:    limit,
        select:  { id: true, displayName: true, xp: true, badges: true, streak: true, avatarUrl: true },
      }),
      prisma.user.findUnique({
        where:  { id: req.userId! },
        select: { id: true, displayName: true, xp: true, badges: true, streak: true, avatarUrl: true },
      }),
    ]);

    // Calculate own rank (full table count)
    let myRank: number | null = null;
    if (me) {
      myRank = await prisma.user.count({ where: { xp: { gt: me.xp } } }) + 1;
    }

    const ranked = topUsers.map((u, i) => ({
      rank: i + 1,
      id:   u.id,
      displayName: u.displayName || 'Anonymous',
      xp:   u.xp,
      level: levelFromXP(u.xp),
      streak: u.streak,
      badgeCount: (() => { try { return (JSON.parse(u.badges) as string[]).length; } catch { return 0; } })(),
      isMe: u.id === req.userId,
    }));

    res.json({
      leaderboard: ranked,
      myRank,
      myXp: me?.xp ?? 0,
      myLevel: levelFromXP(me?.xp ?? 0),
    });
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to load leaderboard' });
  }
});

export default router;
