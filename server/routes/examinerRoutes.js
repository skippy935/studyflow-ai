const express   = require('express');
const router    = express.Router();
const auth      = require('../middleware/auth');
const db        = require('../db');
const Anthropic = require('@anthropic-ai/sdk');
const { buildSystemPrompt, GAP_ANALYSIS_TRIGGER, parseGapAnalysis } = require('../services/examinerPrompts');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Create session ────────────────────────────────────────
// POST /api/examiner/sessions
router.post('/sessions', auth, (req, res) => {
  const { materialName, materialType = 'paste', wordCount = 0,
          difficulty = 'standard', questionCount = 10,
          focusArea = null, extractedText } = req.body || {};

  if (!materialName) return res.status(400).json({ error: 'materialName required' });
  if (!extractedText || extractedText.trim().length < 50)
    return res.status(400).json({ error: 'extractedText required (min 50 chars)' });

  const sessionResult = db.prepare(`
    INSERT INTO examiner_sessions
      (user_id, material_name, material_type, word_count, difficulty, question_count, focus_area)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(req.userId, materialName, materialType, wordCount,
         difficulty, questionCount, focusArea || null);

  const sessionId = sessionResult.lastInsertRowid;

  db.prepare(`
    INSERT INTO examiner_materials (session_id, extracted_text) VALUES (?, ?)
  `).run(sessionId, extractedText.trim());

  res.status(201).json({ sessionId });
});

// ── List sessions ─────────────────────────────────────────
// GET /api/examiner/sessions
router.get('/sessions', auth, (req, res) => {
  const sessions = db.prepare(`
    SELECT id, material_name, material_type, difficulty, question_count,
           exchange_count, completed, gap_analysis, created_at, completed_at
    FROM examiner_sessions
    WHERE user_id = ?
    ORDER BY created_at DESC
    LIMIT 50
  `).all(req.userId).map(s => ({
    ...s,
    gapCount: s.gap_analysis
      ? (JSON.parse(s.gap_analysis).gaps || []).length
      : 0
  }));
  res.json({ sessions });
});

// ── Get single session ────────────────────────────────────
// GET /api/examiner/sessions/:id
router.get('/sessions/:id', auth, (req, res) => {
  const session = db.prepare(`
    SELECT * FROM examiner_sessions WHERE id = ? AND user_id = ?
  `).get(req.params.id, req.userId);
  if (!session) return res.status(404).json({ error: 'Session not found' });

  session.messages    = JSON.parse(session.messages || '[]');
  session.stats       = JSON.parse(session.stats || '{}');
  session.gap_analysis = session.gap_analysis ? JSON.parse(session.gap_analysis) : null;
  res.json({ session });
});

// ── Delete session ────────────────────────────────────────
// DELETE /api/examiner/sessions/:id
router.delete('/sessions/:id', auth, (req, res) => {
  const info = db.prepare(
    'DELETE FROM examiner_sessions WHERE id = ? AND user_id = ?'
  ).run(req.params.id, req.userId);
  if (!info.changes) return res.status(404).json({ error: 'Session not found' });
  res.json({ ok: true });
});

// ── Send message (SSE streaming) ──────────────────────────
// POST /api/examiner/sessions/:id/message
router.post('/sessions/:id/message', auth, async (req, res) => {
  const { content = '', triggerGapAnalysis = false } = req.body || {};

  const session = db.prepare(
    'SELECT * FROM examiner_sessions WHERE id = ? AND user_id = ?'
  ).get(req.params.id, req.userId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.completed) return res.status(400).json({ error: 'Session already completed' });

  const material = db.prepare(
    'SELECT extracted_text FROM examiner_materials WHERE session_id = ?'
  ).get(session.id);
  if (!material) return res.status(500).json({ error: 'Material not found' });

  // Parse existing messages
  const storedMessages = JSON.parse(session.messages || '[]');

  // Build API messages
  let apiMessages = storedMessages.map(m => ({ role: m.role, content: m.content }));

  // Add new user message (unless it's init — empty content means start)
  const isInit = content === '' && storedMessages.length === 0 && !triggerGapAnalysis;

  if (!isInit && content.trim()) {
    apiMessages.push({ role: 'user', content: content.trim() });
  }

  // Inject gap analysis trigger if requested (not stored as user message)
  if (triggerGapAnalysis) {
    apiMessages.push({ role: 'user', content: GAP_ANALYSIS_TRIGGER });
  }

  // For the very first call (init), send a dummy user message to kick things off
  if (isInit) {
    apiMessages = [{ role: 'user', content: 'Begin.' }];
  }

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const systemPrompt = buildSystemPrompt(
    material.extracted_text,
    session.difficulty,
    session.question_count,
    session.focus_area
  );

  let fullText = '';

  try {
    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      system: systemPrompt,
      messages: apiMessages
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        const text = chunk.delta.text;
        fullText += text;
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // After stream ends — save to DB
    const newMessages = [...storedMessages];

    // Save the user message (if real, not trigger/init)
    if (!isInit && content.trim() && !triggerGapAnalysis) {
      newMessages.push({ role: 'user', content: content.trim(), timestamp: new Date().toISOString() });
    }

    // Save the assistant response
    newMessages.push({ role: 'assistant', content: fullText, timestamp: new Date().toISOString() });

    const gapAnalysis = parseGapAnalysis(fullText);
    const isCompleted = !!gapAnalysis || triggerGapAnalysis;
    const newExchangeCount = isInit ? 0 : session.exchange_count + (content.trim() ? 1 : 0);

    db.prepare(`
      UPDATE examiner_sessions SET
        messages       = ?,
        exchange_count = ?,
        completed      = ?,
        gap_analysis   = ?,
        completed_at   = ?
      WHERE id = ?
    `).run(
      JSON.stringify(newMessages),
      newExchangeCount,
      isCompleted ? 1 : 0,
      gapAnalysis ? JSON.stringify(gapAnalysis) : session.gap_analysis,
      isCompleted ? new Date().toISOString() : session.completed_at,
      session.id
    );

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Examiner stream error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
