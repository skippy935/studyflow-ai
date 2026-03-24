const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

// GET /api/summaries
router.get('/', (req, res) => {
  const summaries = db.prepare('SELECT id, user_id, title, topic, created_at FROM summaries WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json({ summaries });
});

// GET /api/summaries/:id
router.get('/:id', (req, res) => {
  const summary = db.prepare('SELECT * FROM summaries WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!summary) return res.status(404).json({ error: 'Summary not found' });
  res.json({ summary });
});

// DELETE /api/summaries/:id
router.delete('/:id', (req, res) => {
  const summary = db.prepare('SELECT id FROM summaries WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!summary) return res.status(404).json({ error: 'Summary not found' });
  db.prepare('DELETE FROM summaries WHERE id = ?').run(summary.id);
  res.json({ success: true });
});

module.exports = router;
