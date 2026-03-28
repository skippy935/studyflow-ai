import prisma from '../lib/prisma';

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000];

export function levelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function xpForNextLevel(xp: number): { current: number; needed: number; level: number } {
  const level = levelFromXP(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return {
    level,
    current: xp - currentThreshold,
    needed:  nextThreshold - currentThreshold,
  };
}

export const BADGE_DEFS: Record<string, { label: string; emoji: string; desc: string }> = {
  first_deck:    { label: 'First Deck',     emoji: '📚', desc: 'Created your first flashcard deck' },
  first_quiz:    { label: 'Quiz Starter',   emoji: '🧠', desc: 'Completed your first quiz' },
  first_exam:    { label: 'First Exam',     emoji: '🎓', desc: 'Completed your first Examiner session' },
  cards_100:     { label: 'Century',        emoji: '💯', desc: 'Studied 100 cards total' },
  cards_500:     { label: 'Powerhouse',     emoji: '⚡', desc: 'Studied 500 cards total' },
  cards_1000:    { label: 'Legend',         emoji: '🏆', desc: 'Studied 1,000 cards total' },
  streak_7:      { label: 'Week Warrior',   emoji: '🔥', desc: '7-day study streak' },
  streak_30:     { label: 'Month Master',   emoji: '🌟', desc: '30-day study streak' },
  level_5:       { label: 'Level 5',        emoji: '🚀', desc: 'Reached Level 5' },
};

export async function awardXP(userId: number, amount: number, event: string): Promise<{ xp: number; newBadges: string[] }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, badges: true, streak: true, totalCardsLearned: true },
  });
  if (!user) return { xp: 0, newBadges: [] };

  const newXp = (user.xp ?? 0) + amount;
  const existingBadges: string[] = JSON.parse(user.badges || '[]');
  const earned: string[] = [];

  // Check badge conditions
  function check(key: string, condition: boolean) {
    if (condition && !existingBadges.includes(key)) earned.push(key);
  }

  const totalCards = (user.totalCardsLearned ?? 0);
  check('cards_100',  totalCards >= 100);
  check('cards_500',  totalCards >= 500);
  check('cards_1000', totalCards >= 1000);
  check('streak_7',   (user.streak ?? 0) >= 7);
  check('streak_30',  (user.streak ?? 0) >= 30);
  check('level_5',    levelFromXP(newXp) >= 5);

  // Event-specific badges
  if (event === 'quiz_complete')  check('first_quiz', true);
  if (event === 'exam_complete')  check('first_exam', true);
  if (event === 'deck_created')   check('first_deck', true);

  const allBadges = [...existingBadges, ...earned];

  await prisma.user.update({
    where: { id: userId },
    data:  { xp: newXp, badges: JSON.stringify(allBadges) },
  });

  return { xp: newXp, newBadges: earned };
}
