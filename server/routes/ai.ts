import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import { generateFlashcards, generateQuiz, generateSummary } from '../services/aiService';
import { awardXP } from '../services/gamification';

const router = Router();
router.use(auth);

router.post('/generate', async (req: AuthRequest, res) => {
  const { name, description = '', color = '#4F46E5', notes, language = 'en', examDate } = req.body || {};
  if (!name) { res.status(400).json({ error: 'Deck name is required' }); return; }
  if (!notes || notes.trim().length < 20) { res.status(400).json({ error: 'Please provide at least 20 characters of notes' }); return; }

  const deck = await prisma.deck.create({ data: { userId: req.userId!, name: name.trim(), description: description.trim(), color, examDate: examDate ? new Date(examDate) : null } });

  try {
    const generated = await generateFlashcards(notes.trim(), language);
    await prisma.card.createMany({ data: generated.map(c => ({ deckId: deck.id, front: c.front, back: c.back, difficulty: c.difficulty })) });
    const cards = await prisma.card.findMany({ where: { deckId: deck.id }, orderBy: { id: 'asc' } });
    const { newBadges } = await awardXP(req.userId!, 10, 'deck_created');
    res.status(201).json({ deck, cards, newBadges });
  } catch (err: unknown) {
    await prisma.deck.delete({ where: { id: deck.id } });
    console.error('Flashcard generation error:', err);
    res.status(422).json({ error: 'Failed to generate flashcards. Please try again.' });
  }
});

router.post('/quiz-create', async (req: AuthRequest, res) => {
  const { title, topic = '', notes, language = 'en' } = req.body || {};
  if (!title) { res.status(400).json({ error: 'Quiz title is required' }); return; }
  if (!notes || notes.trim().length < 20) { res.status(400).json({ error: 'Please provide at least 20 characters of notes' }); return; }

  const quiz = await prisma.quiz.create({ data: { userId: req.userId!, title: title.trim(), topic: (topic || title).trim() } });

  try {
    const generated = await generateQuiz(notes.trim(), topic || title, language);
    await prisma.quizQuestion.createMany({
      data: generated.questions.map((q: { type: string; question: string; options?: string[]; correct?: string; explanation?: string; sample_answer?: string; keywords?: string[] }) => ({
        quizId: quiz.id, type: q.type, question: q.question,
        options: q.options ? JSON.stringify(q.options) : null,
        correct: q.correct || null, explanation: q.explanation || '',
        sampleAnswer: q.sample_answer || '',
        keywords: q.keywords ? JSON.stringify(q.keywords) : null
      }))
    });
    const questions = await prisma.quizQuestion.findMany({ where: { quizId: quiz.id }, orderBy: { id: 'asc' } });
    res.status(201).json({ quiz, questions: questions.map((q: { options: string | null; keywords: string | null; [key: string]: unknown }) => ({ ...q, options: q.options ? JSON.parse(q.options) : null, keywords: q.keywords ? JSON.parse(q.keywords) : null })) });
  } catch (err) {
    await prisma.quiz.delete({ where: { id: quiz.id } });
    console.error('Quiz generation error:', err);
    res.status(422).json({ error: 'Failed to generate quiz. Please try again.' });
  }
});

router.post('/summary-create', async (req: AuthRequest, res) => {
  const { title, topic = '', notes, language = 'en' } = req.body || {};
  if (!title) { res.status(400).json({ error: 'Summary title is required' }); return; }
  if (!notes || notes.trim().length < 20) { res.status(400).json({ error: 'Please provide at least 20 characters of notes' }); return; }

  try {
    const content = await generateSummary(notes.trim(), topic || title, language);
    const summary = await prisma.summary.create({ data: { userId: req.userId!, title: title.trim(), topic: (topic || title).trim(), content } });
    res.status(201).json({ summary });
  } catch (err) {
    console.error('Summary generation error:', err);
    res.status(422).json({ error: 'Failed to generate summary. Please try again.' });
  }
});

router.post('/study-sessions', async (req: AuthRequest, res) => {
  const { deck_id, cards_studied, again_count, hard_count, good_count, easy_count } = req.body || {};
  if (!deck_id) { res.status(400).json({ error: 'deck_id required' }); return; }

  const userId = req.userId!;
  const studied = cards_studied || 0;

  await prisma.studySession.create({
    data: { userId, deckId: Number(deck_id), cardsStudied: studied, againCount: again_count || 0, hardCount: hard_count || 0, goodCount: good_count || 0, easyCount: easy_count || 0 }
  });

  // Update streak + total cards learned
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { streak: true, lastStudyDate: true } });
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
  const last = user?.lastStudyDate ? new Date(user.lastStudyDate) : null;
  if (last) last.setHours(0, 0, 0, 0);

  let newStreak = 1;
  if (last && last.getTime() === today.getTime()) newStreak = user?.streak ?? 1;
  else if (last && last.getTime() === yesterday.getTime()) newStreak = (user?.streak ?? 0) + 1;

  await prisma.user.update({
    where: { id: userId },
    data: { streak: newStreak, lastStudyDate: new Date(), totalCardsLearned: { increment: studied } }
  });

  const { xp, newBadges } = await awardXP(userId, studied * 2, 'study_session');
  res.status(201).json({ success: true, streak: newStreak, xp, newBadges });
});

export default router;
