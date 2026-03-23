const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function generateFlashcards(notes) {
  const prompt = `You are a flashcard generator. Analyze the following notes and create between 5 and 20 high-quality flashcards.

Rules:
- Each flashcard must test ONE specific concept, fact, or definition
- "front" is the question or term (concise, max 20 words)
- "back" is the answer or definition (clear, max 50 words)
- Cover the most important concepts in the notes
- Avoid trivial or redundant cards

Return ONLY a valid JSON array with no extra text, no markdown, no code fences.
Format: [{"front": "...", "back": "..."}, ...]

Notes:
${notes}`;

  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 4096,
    temperature: 0.3,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = message.content[0].text.trim();

  // Extract JSON even if Claude wraps it in code fences
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI did not return valid JSON');

  const cards = JSON.parse(jsonMatch[0]);
  if (!Array.isArray(cards) || cards.length === 0) {
    throw new Error('AI returned empty card list');
  }

  return cards.map(c => ({
    front: String(c.front || '').trim(),
    back: String(c.back || '').trim()
  })).filter(c => c.front && c.back);
}

module.exports = { generateFlashcards };
