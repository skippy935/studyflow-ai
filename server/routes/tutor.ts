import { Router } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import prisma from '../lib/prisma';
import { auth, AuthRequest } from '../middleware/auth';

const router = Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type TutorMode = 'normal' | 'exam' | 'math';

function buildSystemPrompt(deckName: string, cards: { front: string; back: string }[], mode: TutorMode): string {
  const cardSummary = cards
    .map((c, i) => `${i + 1}. Q: ${c.front}\n   A: ${c.back}`)
    .join('\n');

  const base = `You are an AI tutor helping a student with their flashcard deck titled "${deckName}".
The deck contains ${cards.length} flashcards:
${cardSummary}`;

  if (mode === 'exam') {
    return `${base}

=== EXAM MODE ===
You are in exam mode. Your job is to help the student THINK, not to give them answers.
- NEVER give the direct answer to any question
- When a student asks "what is X?", respond with a guiding question like "What do your notes say about X? What clues do you have?"
- When a student gives a wrong answer, explain WHY it is wrong and what concept they should revisit — but do not reveal the correct answer
- Give hints only: redirect to the relevant concept, ask follow-up questions, point to what the student already knows
- Keep responses brief (1-2 sentences max)
- If the student explicitly says they give up, you may reveal the answer only then`;
  }

  if (mode === 'math') {
    return `${base}

=== MATH MODE ===
You specialise in mathematical explanations. For every problem or concept:
- Break your explanation into clearly numbered steps (Step 1, Step 2, etc.)
- Show every intermediate calculation — never skip steps
- After the step-by-step solution, give a one-sentence summary of the method used
- If the student made an error, identify the exact step where they went wrong and explain the correct approach for that step
- Use plain text math (e.g. "x^2 + 3x = 10") since LaTeX is not rendered
- Accuracy over speed — never guess at a numerical result`;
  }

  // normal mode
  return `${base}

Your role:
- Explain concepts clearly with depth and good examples
- When a student gets something wrong, first explain WHY it is wrong, then give the correct explanation
- Always cite which card or concept you are drawing from (e.g. "According to card 3 on photosynthesis...")
- Responses should be concise but thorough (2-4 paragraphs max)
- Never just recite the card verbatim — always explain and expand
- Be encouraging and pedagogically effective`;
}

// POST /api/tutor/:deckId/chat — SSE streaming tutor chat
router.post('/:deckId/chat', auth, async (req: AuthRequest, res) => {
  const deckId = parseInt(req.params.deckId);
  const {
    messages,
    mode = 'normal',
    hintLevel,
  }: {
    messages: { role: 'user' | 'assistant'; content: string }[];
    mode?: TutorMode;
    hintLevel?: 1 | 2 | 3;
  } = req.body || {};

  if (!messages || messages.length === 0) {
    res.status(400).json({ error: 'messages required' }); return;
  }

  try {
    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId: req.userId! },
      include: { cards: { select: { front: true, back: true }, take: 100 } },
    });
    if (!deck) { res.status(404).json({ error: 'Deck not found' }); return; }

    const systemPrompt = buildSystemPrompt(deck.name, deck.cards, mode as TutorMode);

    // If a hint was explicitly requested, inject that context as the last user message
    let finalMessages = messages;
    if (hintLevel) {
      const hintInstructions: Record<number, string> = {
        1: '[HINT REQUEST - Level 1] Give me a single sentence hint that points me in the right direction without revealing the answer.',
        2: '[HINT REQUEST - Level 2] Give me a partial explanation — explain the concept but leave the final step for me to figure out.',
        3: '[HINT REQUEST - Level 3] I am stuck. Please give me the full explanation with all the details.',
      };
      finalMessages = [...messages, { role: 'user' as const, content: hintInstructions[hintLevel] }];
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: mode === 'math' ? 2048 : 1024,
      system: systemPrompt,
      messages: finalMessages,
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
