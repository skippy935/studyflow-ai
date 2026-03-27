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

// POST /api/quizzes/:id/results — save wrong answers to missed questions bank
router.post('/:id/results', async (req: AuthRequest, res) => {
  const quizId = parseInt(req.params.id);
  const { wrongIds }: { wrongIds: number[] } = req.body || {};
  if (!Array.isArray(wrongIds)) { res.status(400).json({ error: 'wrongIds array required' }); return; }

  try {
    const quiz = await prisma.quiz.findFirst({ where: { id: quizId, userId: req.userId! } });
    if (!quiz) { res.status(404).json({ error: 'Quiz not found' }); return; }

    // Upsert: increment timesWrong if already exists, create if not
    for (const questionId of wrongIds) {
      await prisma.missedQuestion.upsert({
        where:  { userId_questionId: { userId: req.userId!, questionId } },
        update: { timesWrong: { increment: 1 }, lastSeenAt: new Date(), quizId },
        create: { userId: req.userId!, questionId, quizId, timesWrong: 1 },
      });
    }

    res.json({ saved: wrongIds.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save results' });
  }
});

// GET /api/quizzes/missed — list all missed questions
router.get('/missed', async (req: AuthRequest, res) => {
  try {
    const missed = await prisma.missedQuestion.findMany({
      where: { userId: req.userId! },
      include: {
        question: true,
        quiz:     { select: { id: true, title: true } },
      },
      orderBy: [{ timesWrong: 'desc' }, { lastSeenAt: 'desc' }],
    });
    res.json({
      missed: missed.map(m => ({
        ...m,
        question: parseQ(m.question as { options: string | null; keywords: string | null; [key: string]: unknown }),
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch missed questions' });
  }
});

// DELETE /api/quizzes/missed/:questionId — mark as learned
router.delete('/missed/:questionId', async (req: AuthRequest, res) => {
  const questionId = parseInt(req.params.questionId);
  try {
    await prisma.missedQuestion.deleteMany({
      where: { userId: req.userId!, questionId },
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove missed question' });
  }
});

function parseQ(q: { options: string | null; keywords: string | null; [key: string]: unknown }) {
  return { ...q, options: q.options ? JSON.parse(q.options) : null, keywords: q.keywords ? JSON.parse(q.keywords) : null };
}

export default router;
