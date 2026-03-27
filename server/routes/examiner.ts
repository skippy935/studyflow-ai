import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';
import { buildSystemPrompt, GAP_ANALYSIS_TRIGGER, parseGapAnalysis } from '../services/examinerPrompts';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/examiner/sessions — create session
router.post('/sessions', auth, async (req: AuthRequest, res) => {
  const { materialName, materialType = 'paste', wordCount = 0,
          difficulty = 'standard', questionCount = 10,
          focusArea, extractedText } = req.body || {};

  if (!materialName) { res.status(400).json({ error: 'materialName required' }); return; }
  if (!extractedText || extractedText.trim().length < 50) {
    res.status(400).json({ error: 'extractedText required (min 50 chars)' }); return;
  }

  try {
    const session = await prisma.examinerSession.create({
      data: {
        userId: req.userId!,
        materialName,
        materialType,
        wordCount,
        difficulty,
        questionCount,
        focusArea: focusArea || null,
        material: {
          create: { extractedText: extractedText.trim() }
        }
      }
    });
    res.status(201).json({ sessionId: session.id });
  } catch (err) {
    console.error('Create session error:', err);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// GET /api/examiner/sessions — list user sessions
router.get('/sessions', auth, async (req: AuthRequest, res) => {
  try {
    const sessions = await prisma.examinerSession.findMany({
      where: { userId: req.userId! },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    const result = sessions.map(s => ({
      ...s,
      gapCount: s.gapAnalysis
        ? ((s.gapAnalysis as any)?.gaps?.length ?? 0)
        : 0
    }));
    res.json({ sessions: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/examiner/sessions/:id — get single session
router.get('/sessions/:id', auth, async (req: AuthRequest, res) => {
  try {
    const session = await prisma.examinerSession.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId! },
    });
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
    res.json({ session });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// DELETE /api/examiner/sessions/:id
router.delete('/sessions/:id', auth, async (req: AuthRequest, res) => {
  try {
    await prisma.examinerSession.deleteMany({
      where: { id: parseInt(req.params.id), userId: req.userId! }
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// POST /api/examiner/sessions/:id/message — SSE streaming
router.post('/sessions/:id/message', auth, async (req: AuthRequest, res) => {
  const { content = '', triggerGapAnalysis = false } = req.body || {};

  try {
    const session = await prisma.examinerSession.findFirst({
      where: { id: parseInt(req.params.id), userId: req.userId! },
      include: { material: true }
    });
    if (!session) { res.status(404).json({ error: 'Session not found' }); return; }
    if (session.completed) { res.status(400).json({ error: 'Session already completed' }); return; }
    if (!session.material) { res.status(500).json({ error: 'Material not found' }); return; }

    const storedMessages = (session.messages as { role: string; content: string; timestamp: string }[]) || [];
    const isInit = content === '' && storedMessages.length === 0 && !triggerGapAnalysis;

    let apiMessages: { role: 'user' | 'assistant'; content: string }[] = storedMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content
    }));

    if (!isInit && content.trim() && !triggerGapAnalysis) {
      apiMessages.push({ role: 'user', content: content.trim() });
    }
    if (triggerGapAnalysis) {
      apiMessages.push({ role: 'user', content: GAP_ANALYSIS_TRIGGER });
    }
    if (isInit) {
      apiMessages = [{ role: 'user', content: 'Begin.' }];
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const systemPrompt = buildSystemPrompt(
      session.material.extractedText,
      session.difficulty,
      session.questionCount,
      session.focusArea
    );

    let fullText = '';

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

    // Save to DB after stream ends
    const newMessages = [...storedMessages];
    if (!isInit && content.trim() && !triggerGapAnalysis) {
      newMessages.push({ role: 'user', content: content.trim(), timestamp: new Date().toISOString() });
    }
    newMessages.push({ role: 'assistant', content: fullText, timestamp: new Date().toISOString() });

    const gapAnalysis = parseGapAnalysis(fullText);
    const isCompleted = !!gapAnalysis || triggerGapAnalysis;
    const newExchangeCount = isInit ? 0 : session.exchangeCount + (content.trim() && !triggerGapAnalysis ? 1 : 0);

    await prisma.examinerSession.update({
      where: { id: session.id },
      data: {
        messages: newMessages as any,
        exchangeCount: newExchangeCount,
        completed: isCompleted,
        gapAnalysis: gapAnalysis ? gapAnalysis as any : session.gapAnalysis,
        completedAt: isCompleted ? new Date() : session.completedAt,
      }
    });

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err: unknown) {
    console.error('Examiner stream error:', err);
    res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
    res.end();
  }
});

export default router;
