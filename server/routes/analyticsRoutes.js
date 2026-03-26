const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');
const db      = require('../db');
const { getRetentionProjection, detectCramming, getMicroDoseNudges } = require('../services/retentionService');

// GET /api/analytics/dashboard
router.get('/dashboard', auth, (req, res) => {
  try {
    const crammingWarnings    = detectCramming(req.userId);
    const retentionProjections = getRetentionProjection(req.userId);
    const microDoseNudges     = getMicroDoseNudges(req.userId);
    res.json({ crammingWarnings, retentionProjections, microDoseNudges });
  } catch (e) {
    console.error('Analytics error:', e);
    res.status(500).json({ error: 'Analytics error' });
  }
});

// GET /api/analytics/exam-dates
router.get('/exam-dates', auth, (req, res) => {
  const dates = db.prepare(
    'SELECT deck_id, exam_date FROM exam_dates WHERE user_id = ?'
  ).all(req.userId);
  res.json({ examDates: dates });
});

// POST /api/analytics/exam-date  { deckId, examDate }
router.post('/exam-date', auth, (req, res) => {
  const { deckId, examDate } = req.body;
  if (!deckId || !examDate) return res.status(400).json({ error: 'deckId and examDate required' });

  const deck = db.prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?').get(deckId, req.userId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });

  db.prepare(`
    INSERT INTO exam_dates (user_id, deck_id, exam_date) VALUES (?, ?, ?)
    ON CONFLICT(user_id, deck_id) DO UPDATE SET exam_date = excluded.exam_date
  `).run(req.userId, deckId, examDate);

  res.json({ ok: true });
});

// DELETE /api/analytics/exam-date/:deckId
router.delete('/exam-date/:deckId', auth, (req, res) => {
  db.prepare('DELETE FROM exam_dates WHERE user_id = ? AND deck_id = ?').run(req.userId, req.params.deckId);
  res.json({ ok: true });
});

module.exports = router;
