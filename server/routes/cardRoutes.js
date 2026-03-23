const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { calcNextReview } = require('../services/sm2');

router.use(auth);

// POST /api/decks/:deckId/cards — add a card manually
router.post('/decks/:deckId/cards', (req, res) => {
  const deck = db.prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?').get(req.params.deckId, req.userId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const { front, back } = req.body || {};
  if (!front || !back) return res.status(400).json({ error: 'Front and back are required' });
  const result = db.prepare(
    'INSERT INTO cards (deck_id, front, back) VALUES (?, ?, ?)'
  ).run(deck.id, front.trim(), back.trim());
  const card = db.prepare('SELECT * FROM cards WHERE id = ?').get(result.lastInsertRowid);

  // Update deck timestamp
  db.prepare("UPDATE decks SET updated_at = datetime('now') WHERE id = ?").run(deck.id);

  res.status(201).json({ card });
});

// PUT /api/cards/:id — update a card
router.put('/cards/:id', (req, res) => {
  const card = db.prepare(
    'SELECT c.* FROM cards c JOIN decks d ON d.id = c.deck_id WHERE c.id = ? AND d.user_id = ?'
  ).get(req.params.id, req.userId);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  const { front = card.front, back = card.back } = req.body || {};
  db.prepare('UPDATE cards SET front = ?, back = ? WHERE id = ?').run(front.trim(), back.trim(), card.id);
  const updated = db.prepare('SELECT * FROM cards WHERE id = ?').get(card.id);
  res.json({ card: updated });
});

// DELETE /api/cards/:id
router.delete('/cards/:id', (req, res) => {
  const card = db.prepare(
    'SELECT c.id, c.deck_id FROM cards c JOIN decks d ON d.id = c.deck_id WHERE c.id = ? AND d.user_id = ?'
  ).get(req.params.id, req.userId);
  if (!card) return res.status(404).json({ error: 'Card not found' });
  db.prepare('DELETE FROM cards WHERE id = ?').run(card.id);
  res.json({ success: true });
});

// POST /api/cards/:id/review — submit SM-2 review
router.post('/cards/:id/review', (req, res) => {
  const card = db.prepare(
    'SELECT c.* FROM cards c JOIN decks d ON d.id = c.deck_id WHERE c.id = ? AND d.user_id = ?'
  ).get(req.params.id, req.userId);
  if (!card) return res.status(404).json({ error: 'Card not found' });

  const rating = parseInt(req.body?.rating);
  if (isNaN(rating) || rating < 0 || rating > 3) {
    return res.status(400).json({ error: 'Rating must be 0, 1, 2, or 3' });
  }

  const { easiness, interval, repetitions, next_review } = calcNextReview(
    { easiness: card.easiness, interval: card.interval, repetitions: card.repetitions },
    rating
  );

  db.prepare(
    'UPDATE cards SET easiness = ?, interval = ?, repetitions = ?, next_review = ? WHERE id = ?'
  ).run(easiness, interval, repetitions, next_review, card.id);

  res.json({ next_review, interval, easiness, repetitions });
});

module.exports = router;
