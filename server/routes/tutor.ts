import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/tutor/:deckId/chat — SSE streaming tutor chat
router.post('/:deckId/chat', auth, async (req: AuthRequest, res) => {
  const deckId = parseInt(req.params.deckId);
  const { messages }: { messages: { role: 'user' | 'assistant'; content: string }[] } = req.body || {};

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: 'messages required' }); return;
  }

  try {
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId: req.userId! },
      include: { cards: { select: { front: true, back: true }, take: 100 } },
    });
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const cardSummary = deck.cards
      .map((c, i) => `${i + 1}. Q: ${c.front}\n   A: ${c.back}`)
      .join('\n');

    const systemPrompt = `You are a friendly AI tutor helping a student understand the material in their flashcard deck titled "${deck.name}".

Your role:
- Explain concepts from the deck clearly and in depth
- Answer questions about the material
- Give examples and analogies to aid understanding
- If asked something outside the deck material, you may answer briefly but redirect back to the deck content
- Keep responses concise but thorough (2-4 paragraphs max)
- Never just recite the card verbatim — always explain and expand

The deck contains ${deck.cards.length} flashcards. Here is the content:
${cardSummary}

Be encouraging, clear, and pedagogically effective.`;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('Tutor error:', err);
    res.write(`data: ${JSON.stringify({ error: String(err) })}\n\n`);
    res.end();
  }
});

export default router;
