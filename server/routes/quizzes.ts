import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(auth);

router.get('/', async (req: AuthRequest, res) => {
  const quizzes = await prisma.quiz.findMany({
    where: { userId: req.userId! },
    include: { _count: { select: { questions: true } } },
    orderBy: { createdAt: 'desc' }
  });
  res.json({ quizzes });
});

router.get('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const quiz = await prisma.quiz.findFirst({ where: { id, userId: req.userId! } });
  if (!quiz) { res.status(404).json({ error: 'Quiz not found' }); return; }
  const questions = await prisma.quizQuestion.findMany({ where: { quizId: id }, orderBy: { id: 'asc' } });
  res.json({ quiz, questions: questions.map(parseQ) });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const quiz = await prisma.quiz.findFirst({ where: { id, userId: req.userId! } });
  if (!quiz) { res.status(404).json({ error: 'Quiz not found' }); return; }
  await prisma.quiz.delete({ where: { id } });
  res.json({ success: true });
});

function parseQ(q: { options: string | null; keywords: string | null; [key: string]: unknown }) {
  return { ...q, options: q.options ? JSON.parse(q.options) : null, keywords: q.keywords ? JSON.parse(q.keywords) : null };
}

export default router;
