import { Router } from 'express';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import { generateFlashcards, generateQuiz, generateSummary } from '../services/aiService';

const router = Router();
router.use(auth);

router.post('/generate', async (req: AuthRequest, res) => {
  const { name, description = '', color = '#4F46E5', notes, language = 'en' } = req.body || {};
  if (!name) { res.status(400).json({ error: 'Deck name is required' }); return; }
  if (!notes || notes.trim().length < 20) { res.status(400).json({ error: 'Please provide at least 20 characters of notes' }); return; }

  const deck = await prisma.deck.create({ data: { userId: req.userId!, name: name.trim(), description: description.trim(), color } });

  try {
    const generated = await generateFlashcards(notes.trim(), language);
    await prisma.card.createMany({ data: generated.map(c => ({ deckId: deck.id, front: c.front, back: c.back, difficulty: c.difficulty })) });
    const cards = await prisma.card.findMany({ where: { deckId: deck.id }, orderBy: { id: 'asc' } });
    res.status(201).json({ deck, cards });
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
      data: generated.questions.map(q => ({
        quizId: quiz.id, type: q.type, question: q.question,
        options: q.options ? JSON.stringify(q.options) : null,
        correct: q.correct || null, explanation: q.explanation || '',
        sampleAnswer: q.sample_answer || '',
        keywords: q.keywords ? JSON.stringify(q.keywords) : null
      }))
    });
    const questions = await prisma.quizQuestion.findMany({ where: { quizId: quiz.id }, orderBy: { id: 'asc' } });
    res.status(201).json({ quiz, questions: questions.map(q => ({ ...q, options: q.options ? JSON.parse(q.options) : null, keywords: q.keywords ? JSON.parse(q.keywords) : null })) });
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
  await prisma.studySession.create({ data: { userId: req.userId!, deckId: Number(deck_id), cardsStudied: cards_studied || 0, againCount: again_count || 0, hardCount: hard_count || 0, goodCount: good_count || 0, easyCount: easy_count || 0 } });
  res.status(201).json({ success: true });
});

export default router;
