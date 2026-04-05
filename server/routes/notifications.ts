import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);
const p = prisma as any;

// GET /api/notifications — get notification digest for the current user
router.get('/', async (req: AuthRequest, res) => {
  const userId = req.userId!;
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const in3Days  = new Date(today); in3Days.setDate(in3Days.getDate() + 3);

    const [dueCards, overdueTasks, upcomingExams, pendingRequests] = await Promise.all([
      // Cards due for review
      p.card.count({ where: { deck: { userId }, nextReview: { lte: new Date() } } }),

      // Overdue study tasks
      p.studyTask.count({ where: { userId, done: false, dueDate: { lt: today } } }),

      // Exams in next 3 days
      p.deck.findMany({
        where: { userId, examDate: { gte: today, lte: in3Days } },
        select: { id: true, name: true, examDate: true },
      }),

      // Pending parent link requests
      p.parentChildLink.count({ where: { childId: userId, status: 'pending' } }),
    ]);

    const notifications: Array<{ id: string; type: string; message: string; link?: string; urgent: boolean }> = [];

    if (dueCards > 0) {
      notifications.push({
        id: 'due-cards',
        type: 'study',
        message: `${dueCards} card${dueCards > 1 ? 's' : ''} due for review`,
        link: '/dashboard',
        urgent: dueCards > 20,
      });
    }

    if (overdueTasks > 0) {
      notifications.push({
        id: 'overdue-tasks',
        type: 'planner',
        message: `${overdueTasks} overdue task${overdueTasks > 1 ? 's' : ''}`,
        link: '/planner',
        urgent: true,
      });
    }

    for (const exam of upcomingExams) {
      const examDate = new Date(exam.examDate);
      const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / 86400000);
      notifications.push({
        id: `exam-${exam.id}`,
        type: 'exam',
        message: `Exam "${exam.name}" in ${daysLeft === 0 ? 'today!' : daysLeft === 1 ? 'tomorrow!' : `${daysLeft} days`}`,
        link: `/deck/${exam.id}`,
        urgent: daysLeft <= 1,
      });
    }

    if (pendingRequests > 0) {
      notifications.push({
        id: 'parent-requests',
        type: 'social',
        message: `${pendingRequests} pending parent link request${pendingRequests > 1 ? 's' : ''}`,
        link: '/parent',
        urgent: false,
      });
    }

    res.json({ notifications, unreadCount: notifications.length });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

export default router;
