const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const { generateFlashcards } = require('../services/aiService');

router.use(auth);

// POST /api/ai/generate — create deck + generate cards from notes
router.post('/generate', async (req, res) => {
  const { name, description = '', color = '#6366f1', notes } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Deck name is required' });
  if (!notes || notes.trim().length < 20) {
    return res.status(400).json({ error: 'Please provide at least 20 characters of notes' });
  }

  // Create the deck first
  const deckResult = db.prepare(
    'INSERT INTO decks (user_id, name, description, color) VALUES (?, ?, ?, ?)'
  ).run(req.userId, name.trim(), description.trim(), color);
  const deckId = deckResult.lastInsertRowid;

  try {
    const generatedCards = await generateFlashcards(notes.trim());

    // Bulk insert cards in a manual transaction
    const insertCard = db.prepare('INSERT INTO cards (deck_id, front, back) VALUES (?, ?, ?)');
    db.exec('BEGIN');
    try {
      for (const card of generatedCards) insertCard.run(deckId, card.front, card.back);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }

    const deck = db.prepare('SELECT * FROM decks WHERE id = ?').get(deckId);
    const cards = db.prepare('SELECT * FROM cards WHERE deck_id = ? ORDER BY id ASC').all(deckId);

    res.status(201).json({ deck, cards });
  } catch (err) {
    // Rollback deck if card generation fails
    db.prepare('DELETE FROM decks WHERE id = ?').run(deckId);
    console.error('AI generation error:', err.message);
    res.status(422).json({ error: 'Failed to generate flashcards. Please try again.' });
  }
});

// POST /api/study-sessions — save session stats
router.post('/study-sessions', (req, res) => {
  const { deck_id, cards_studied, again_count, hard_count, good_count, easy_count } = req.body || {};
  if (!deck_id) return res.status(400).json({ error: 'deck_id required' });

  db.prepare(`
    INSERT INTO study_sessions (user_id, deck_id, cards_studied, again_count, hard_count, good_count, easy_count)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, deck_id, cards_studied || 0, again_count || 0, hard_count || 0, good_count || 0, easy_count || 0);

  res.status(201).json({ success: true });
});

module.exports = router;
