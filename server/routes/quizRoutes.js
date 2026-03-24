const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

function parseQuestion(q) {
  return {
    ...q,
    options: q.options ? JSON.parse(q.options) : null,
    keywords: q.keywords ? JSON.parse(q.keywords) : null
  };
}

// GET /api/quizzes
router.get('/', (req, res) => {
  const quizzes = db.prepare(`
    SELECT q.*, COUNT(qq.id) AS question_count
    FROM quizzes q
    LEFT JOIN quiz_questions qq ON qq.quiz_id = q.id
    WHERE q.user_id = ?
    GROUP BY q.id
    ORDER BY q.created_at DESC
  `).all(req.userId);
  res.json({ quizzes });
});

// GET /api/quizzes/:id
router.get('/:id', (req, res) => {
  const quiz = db.prepare('SELECT * FROM quizzes WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  const questions = db.prepare('SELECT * FROM quiz_questions WHERE quiz_id = ? ORDER BY id ASC').all(quiz.id).map(parseQuestion);
  res.json({ quiz, questions });
});

// DELETE /api/quizzes/:id
router.delete('/:id', (req, res) => {
  const quiz = db.prepare('SELECT id FROM quizzes WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  db.prepare('DELETE FROM quizzes WHERE id = ?').run(quiz.id);
  res.json({ success: true });
});

module.exports = router;
