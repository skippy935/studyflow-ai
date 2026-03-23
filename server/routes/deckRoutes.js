const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/decks — list all decks with card count and due count
router.get('/', (req, res) => {
  const decks = db.prepare(`
    SELECT
      d.*,
      COUNT(c.id) AS card_count,
      SUM(CASE WHEN c.next_review <= date('now') THEN 1 ELSE 0 END) AS due_count
    FROM decks d
    LEFT JOIN cards c ON c.deck_id = d.id
    WHERE d.user_id = ?
    GROUP BY d.id
    ORDER BY d.updated_at DESC
  `).all(req.userId);
  res.json({ decks });
});

// POST /api/decks — create deck
router.post('/', (req, res) => {
  const { name, description = '', color = '#6366f1' } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Deck name is required' });
  const result = db.prepare(
    'INSERT INTO decks (user_id, name, description, color) VALUES (?, ?, ?, ?)'
  ).run(req.userId, name.trim(), description.trim(), color);
  const deck = db.prepare('SELECT * FROM decks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ deck });
});

// GET /api/decks/:id — single deck with cards
router.get('/:id', (req, res) => {
  const deck = db.prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const cards = db.prepare('SELECT * FROM cards WHERE deck_id = ? ORDER BY created_at ASC').all(deck.id);
  res.json({ deck, cards });
});

// PUT /api/decks/:id — update deck
router.put('/:id', (req, res) => {
  const deck = db.prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const { name = deck.name, description = deck.description, color = deck.color } = req.body || {};
  db.prepare(
    "UPDATE decks SET name = ?, description = ?, color = ?, updated_at = datetime('now') WHERE id = ?"
  ).run(name.trim(), description.trim(), color, deck.id);
  const updated = db.prepare('SELECT * FROM decks WHERE id = ?').get(deck.id);
  res.json({ deck: updated });
});

// DELETE /api/decks/:id
router.delete('/:id', (req, res) => {
  const deck = db.prepare('SELECT id FROM decks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  db.prepare('DELETE FROM decks WHERE id = ?').run(deck.id);
  res.json({ success: true });
});

// GET /api/decks/:id/due — cards due for review
router.get('/:id/due', (req, res) => {
  const deck = db.prepare('SELECT * FROM decks WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  const cards = db.prepare(
    "SELECT * FROM cards WHERE deck_id = ? AND next_review <= date('now') ORDER BY next_review ASC"
  ).all(deck.id);
  res.json({ deck, cards });
});

module.exports = router;
