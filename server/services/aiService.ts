import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM = `You are StudyBuild AI — an expert learning assistant. Generate precise, high-quality study content. Always return only the requested format with no extra prose.`;

export interface AiUsage { inputTokens: number; outputTokens: number; model: string; }

export async function generateFlashcards(notes: string, language = 'en'): Promise<{ cards: { front: string; back: string; difficulty: string }[]; usage: AiUsage }> {
  const lang = language === 'de' ? 'German' : 'English';
  const model = 'claude-sonnet-4-6';
  const msg = await client.messages.create({
    model, max_tokens: 2000, system: SYSTEM,
    messages: [{ role: 'user', content: `Generate 5–20 flashcards from the notes below. Respond in ${lang}.
Return ONLY a valid JSON array, no extra text:
[{"front":"...","back":"...","difficulty":"easy|medium|hard"}]

Notes:\n${notes}` }]
  });
  const text = (msg.content[0] as { text: string }).text.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Invalid AI response');
  const cards: { front: string; back: string; difficulty: string }[] = JSON.parse(match[0]);
  return {
    cards: cards.map(c => ({
      front: String(c.front || '').trim(),
      back: String(c.back || '').trim(),
      difficulty: ['easy','medium','hard'].includes(c.difficulty) ? c.difficulty : 'medium'
    })).filter(c => c.front && c.back),
    usage: { inputTokens: msg.usage.input_tokens, outputTokens: msg.usage.output_tokens, model },
  };
}

export async function generateQuiz(notes: string, topic: string, language = 'en'): Promise<{ questions: any[]; usage: AiUsage }> {
  const lang = language === 'de' ? 'German' : 'English';
  const model = 'claude-sonnet-4-6';
  const msg = await client.messages.create({
    model, max_tokens: 2500, system: SYSTEM,
    messages: [{ role: 'user', content: `Generate a quiz with 5–8 questions about "${topic}". Respond in ${lang}.
Return ONLY valid JSON:
{"topic":"${topic}","questions":[{"id":1,"type":"multiple_choice","question":"...","options":["A","B","C","D"],"correct":"A","explanation":"..."},{"id":2,"type":"open","question":"...","sample_answer":"...","keywords":["term1"]}]}

Notes:\n${notes}` }]
  });
  const text = (msg.content[0] as { text: string }).text.trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid AI response');
  const quiz = JSON.parse(match[0]);
  if (!quiz.questions?.length) throw new Error('Empty quiz');
  return {
    questions: quiz.questions,
    usage: { inputTokens: msg.usage.input_tokens, outputTokens: msg.usage.output_tokens, model },
  };
}

export async function generateSummary(notes: string, topic: string, language = 'en'): Promise<{ content: string; usage: AiUsage }> {
  const lang = language === 'de' ? 'German' : 'English';
  const model = 'claude-sonnet-4-6';
  const msg = await client.messages.create({
    model, max_tokens: 3000, system: SYSTEM,
    messages: [{ role: 'user', content: `Create a structured study summary for "${topic}". Respond in ${lang} using this Markdown structure:
## ${topic}
**Key Terms**
- Term: definition
**Core Concepts**
1. Concept explanation
**Memory Hooks**
- Memorable analogy
**Related Topics**
- Related topic

Notes:\n${notes}` }]
  });
  return {
    content: (msg.content[0] as { text: string }).text.trim(),
    usage: { inputTokens: msg.usage.input_tokens, outputTokens: msg.usage.output_tokens, model },
  };
}
