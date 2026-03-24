const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { generateFlashcards, generateQuiz, generateSummary } = require('../services/aiService');

router.use(auth);

// POST /api/ai/generate — create deck + flashcards from notes
router.post('/generate', async (req, res) => {
  const { name, description = '', color = '#4F46E5', notes, language = 'en' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Deck name is required' });
  if (!notes || notes.trim().length < 20) return res.status(400).json({ error: 'Please provide at least 20 characters of notes' });

  const deckResult = db.prepare('INSERT INTO decks (user_id, name, description, color) VALUES (?, ?, ?, ?)').run(req.userId, name.trim(), description.trim(), color);
  const deckId = deckResult.lastInsertRowid;

  try {
    const generatedCards = await generateFlashcards(notes.trim(), language);
    const insertCard = db.prepare('INSERT INTO cards (deck_id, front, back, difficulty) VALUES (?, ?, ?, ?)');
    db.exec('BEGIN');
    try {
      for (const c of generatedCards) insertCard.run(deckId, c.front, c.back, c.difficulty);
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }

    const deck = db.prepare('SELECT * FROM decks WHERE id = ?').get(deckId);
    const cards = db.prepare('SELECT * FROM cards WHERE deck_id = ? ORDER BY id ASC').all(deckId);
    res.status(201).json({ deck, cards });
  } catch (err) {
    db.prepare('DELETE FROM decks WHERE id = ?').run(deckId);
    console.error('Flashcard generation error:', err.message);
    res.status(422).json({ error: 'Failed to generate flashcards. Please try again.' });
  }
});

// POST /api/ai/quiz-create — create quiz from notes
router.post('/quiz-create', async (req, res) => {
  const { title, topic = '', notes, language = 'en' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Quiz title is required' });
  if (!notes || notes.trim().length < 20) return res.status(400).json({ error: 'Please provide at least 20 characters of notes' });

  const quizResult = db.prepare('INSERT INTO quizzes (user_id, title, topic) VALUES (?, ?, ?)').run(req.userId, title.trim(), (topic || title).trim());
  const quizId = quizResult.lastInsertRowid;

  try {
    const generated = await generateQuiz(notes.trim(), topic || title, language);
    const insertQ = db.prepare('INSERT INTO quiz_questions (quiz_id, type, question, options, correct, explanation, sample_answer, keywords) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    db.exec('BEGIN');
    try {
      for (const q of generated.questions) {
        insertQ.run(
          quizId, q.type, q.question,
          q.options ? JSON.stringify(q.options) : null,
          q.correct || null,
          q.explanation || '',
          q.sample_answer || '',
          q.keywords ? JSON.stringify(q.keywords) : null
        );
      }
      db.exec('COMMIT');
    } catch (e) { db.exec('ROLLBACK'); throw e; }

    const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ?').get(quizId);
    const questions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC').all(quizId).map(parseQuestion);
    res.status(201).json({ quiz, questions });
  } catch (err) {
    db.prepare('DELETE FROM quizzes WHERE id = ?').run(quizId);
    console.error('Quiz generation error:', err.message);
    res.status(422).json({ error: 'Failed to generate quiz. Please try again.' });
  }
});

// POST /api/ai/summary-create — create summary from notes
router.post('/summary-create', async (req, res) => {
  const { title, topic = '', notes, language = 'en' } = req.body || {};
  if (!title) return res.status(400).json({ error: 'Summary title is required' });
  if (!notes || notes.trim().length < 20) return res.status(400).json({ error: 'Please provide at least 20 characters of notes' });

  try {
    const content = await generateSummary(notes.trim(), topic || title, language);
    const result = db.prepare('INSERT INTO summaries (user_id, title, topic, content) VALUES (?, ?, ?, ?)').run(req.userId, title.trim(), (topic || title).trim(), content);
    const summary = db.prepare('SELECT * FROM summaries WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ summary });
  } catch (err) {
    console.error('Summary generation error:', err.message);
    res.status(422).json({ error: 'Failed to generate summary. Please try again.' });
  }
});

// POST /api/ai/study-sessions
router.post('/study-sessions', (req, res) => {
  const { deck_id, cards_studied, again_count, hard_count, good_count, easy_count } = req.body || {};
  if (!deck_id) return res.status(400).json({ error: 'deck_id required' });
  db.prepare('INSERT INTO study_sessions (user_id, deck_id, cards_studied, again_count, hard_count, good_count, easy_count) VALUES (?, ?, ?, ?, ?, ?, ?)').run(req.userId, deck_id, cards_studied || 0, again_count || 0, hard_count || 0, good_count || 0, easy_count || 0);
  res.status(201).json({ success: true });
});

function parseQuestion(q) {
  return {
    ...q,
    options: q.options ? JSON.parse(q.options) : null,
    keywords: q.keywords ? JSON.parse(q.keywords) : null
  };
}

module.exports = router;
