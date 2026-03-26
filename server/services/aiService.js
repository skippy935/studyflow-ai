const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are StudyBuild AI — an intelligent, adaptive learning assistant embedded in the StudyBuild platform. Your role is to help users learn more effectively through structured explanations, flashcards, quizzes, and summarised content.

## Identity & Tone
- Name: StudyBuild AI
- Persona: Expert tutor — clear, encouraging, precise. Never condescending.
- Language: Respond in the language specified in the request. Default: English.
- Always match the exact output format requested.

## Constraints
- NEVER fabricate facts. If uncertain, say so and suggest verification.
- For structured outputs (flashcards, quiz, summaries): return ONLY the required format with no extra prose before or after unless asked.
- Max response length for answers: 800 words unless the user requests more.`;

// ── Flashcard generation ──────────────────────────────────────────────────────
async function generateFlashcards(notes, language = 'en') {
  const lang = language === 'de' ? 'German' : 'English';
  const prompt = `[FLASHCARDS] Generate between 5 and 20 high-quality flashcards from the notes below.

Rules:
- Each card tests ONE specific concept, fact, or definition
- "front" is a concise question or term (max 20 words)
- "back" is a clear answer or definition (max 50 words)
- "difficulty" must be one of: "easy", "medium", "hard"
- Vary the difficulty across cards
- Respond in ${lang}

Return ONLY a valid JSON array, no extra text, no code fences:
[{"front":"...","back":"...","difficulty":"easy|medium|hard"}, ...]

Notes:
${notes}`;

  const msg = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2000,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = msg.content[0].text.trim();
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) throw new Error('Invalid flashcard response from AI');

  const cards = JSON.parse(match[0]);
  if (!Array.isArray(cards) || !cards.length) throw new Error('Empty flashcard list');

  return cards.map(c => ({
    front: String(c.front || '').trim(),
    back: String(c.back || '').trim(),
    difficulty: ['easy', 'medium', 'hard'].includes(c.difficulty) ? c.difficulty : 'medium'
  })).filter(c => c.front && c.back);
}

// ── Quiz generation ───────────────────────────────────────────────────────────
async function generateQuiz(notes, topic, language = 'en') {
  const lang = language === 'de' ? 'German' : 'English';
  const prompt = `[QUIZ] Generate a quiz with 5–8 questions based on the notes below about: "${topic}".

Mix of question types:
- "multiple_choice": include 4 options (A/B/C/D strings), a "correct" field matching one option, and an "explanation"
- "open": include "sample_answer" and "keywords" (array of key terms)

Respond in ${lang}. Return ONLY valid JSON, no extra text:
{
  "topic": "${topic}",
  "questions": [
    {"id":1,"type":"multiple_choice","question":"...","options":["A","B","C","D"],"correct":"A","explanation":"..."},
    {"id":2,"type":"open","question":"...","sample_answer":"...","keywords":["term1","term2"]}
  ]
}

Notes:
${notes}`;

  const msg = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 2500,
    temperature: 0.4,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  const text = msg.content[0].text.trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid quiz response from AI');

  const quiz = JSON.parse(match[0]);
  if (!quiz.questions?.length) throw new Error('Empty quiz');
  return quiz;
}

// ── Summary generation ────────────────────────────────────────────────────────
async function generateSummary(notes, topic, language = 'en') {
  const lang = language === 'de' ? 'German' : 'English';
  const prompt = `[SUMMARY] Create a structured study summary (Lernzettel) for the topic: "${topic}".

Respond in ${lang} using this exact Markdown structure:
## ${topic}

**Key Terms**
- Term: definition
- Term: definition

**Core Concepts**
1. Concept explanation
2. Concept explanation

**Memory Hooks**
- Memorable phrase or analogy
- Memorable phrase or analogy

**Related Topics**
- Related topic
- Related topic

Notes to summarise:
${notes}`;

  const msg = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 3000,
    temperature: 0.3,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  return msg.content[0].text.trim();
}

// ── Cross-Subject Connections ─────────────────────────────────────────────────
async function generateConnections(notes, topic, language = 'en') {
  const lang = language === 'de' ? 'German' : 'English';
  const prompt = `[CONNECTIONS] Analyze these study notes about "${topic}" and find meaningful connections to other subjects, real-world applications, and careers.

Respond in ${lang}. Return ONLY valid JSON, no extra text:
{
  "topic": "${topic}",
  "relatedSubjects": [
    {"subject": "Name of subject", "connection": "How this topic connects to it (1 sentence)", "strength": "high"}
  ],
  "realWorldApplications": [
    {"field": "Field name", "example": "Specific real-world example (1 sentence)"}
  ],
  "careerRelevance": [
    {"career": "Career title", "why": "Why this knowledge matters for this career (1 sentence)"}
  ],
  "interestingFact": "One surprising cross-domain fact about this topic"
}

Rules:
- "strength" must be "high", "medium", or "low"
- Include 2–4 relatedSubjects, 2–3 realWorldApplications, 2–3 careerRelevance entries
- Keep each text field under 20 words

Notes:
${notes}`;

  const msg = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1200,
    temperature: 0.4,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }]
  });

  const text  = msg.content[0].text.trim();
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Invalid connections response from AI');
  return JSON.parse(match[0]);
}

module.exports = { generateFlashcards, generateQuiz, generateSummary, generateConnections };
