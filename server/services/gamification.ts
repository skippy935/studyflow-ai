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
  // Milestones
  first_deck:    { label: 'Erster Schritt',   emoji: '👣', desc: 'Created your first flashcard deck' },
  first_quiz:    { label: 'Wissensdurst',     emoji: '🧠', desc: 'Completed your first quiz' },
  first_exam:    { label: 'Prüfungsbereit',   emoji: '🎓', desc: 'Completed your first Examiner session' },
  // Cards
  cards_100:     { label: 'Century',          emoji: '💯', desc: 'Studied 100 cards total' },
  cards_500:     { label: 'Powerhouse',       emoji: '⚡', desc: 'Studied 500 cards total' },
  cards_1000:    { label: 'Legende',          emoji: '🏆', desc: 'Studied 1,000 cards total' },
  // Streaks
  streak_7:      { label: 'Marathon',         emoji: '🔥', desc: '7-day study streak' },
  streak_30:     { label: 'Perfektionist',    emoji: '🌟', desc: '30-day study streak' },
  // Levels
  level_5:       { label: 'Aufsteiger',       emoji: '🚀', desc: 'Reached Level 5' },
  level_10:      { label: 'Fortgeschritten',  emoji: '🎯', desc: 'Reached Level 10' },
  // Time-based
  night_owl:     { label: 'Nachteule',        emoji: '🦉', desc: 'Studied after 22:00' },
  early_bird:    { label: 'Frühaufsteher',    emoji: '🌅', desc: 'Studied before 07:00' },
  // Variety
  versatile:     { label: 'Vielseitig',       emoji: '🎨', desc: 'Used 5 different study modes' },
  uploader:      { label: 'Uploader',         emoji: '📤', desc: 'Uploaded study material' },
  helper:        { label: 'Helfer',           emoji: '🤝', desc: 'Shared a deck with others' },
};

export async function awardXP(userId: number, amount: number, event: string): Promise<{ xp: number; newBadges: string[] }> {
  const user = await (prisma.user as any).findUnique({
    where: { id: userId },
    select: { xp: true, badges: true, streak: true, totalCardsLearned: true },
  });
  if (!user) return { xp: 0, newBadges: [] };

  const newXp = (user.xp ?? 0) + amount;
  const existingBadges: string[] = JSON.parse(user.badges || '[]');
  const earned: string[] = [];

  function check(key: string, condition: boolean) {
    if (condition && !existingBadges.includes(key)) earned.push(key);
  }

  const totalCards = (user.totalCardsLearned ?? 0);
  const streak = (user.streak ?? 0);
  check('cards_100',  totalCards >= 100);
  check('cards_500',  totalCards >= 500);
  check('cards_1000', totalCards >= 1000);
  check('streak_7',   streak >= 7);
  check('streak_30',  streak >= 30);
  check('level_5',    levelFromXP(newXp) >= 5);
  check('level_10',   levelFromXP(newXp) >= 10);

  // Event-specific badges
  if (event === 'quiz_complete')    check('first_quiz', true);
  if (event === 'exam_complete')    check('first_exam', true);
  if (event === 'deck_created')     check('first_deck', true);
  if (event === 'file_upload')      check('uploader', true);
  if (event === 'night_study')      check('night_owl', true);
  if (event === 'morning_study')    check('early_bird', true);

  const allBadges = [...existingBadges, ...earned];

  await (prisma.user as any).update({
    where: { id: userId },
    data:  { xp: newXp, badges: JSON.stringify(allBadges) },
  });

  return { xp: newXp, newBadges: earned };
}

// Award login streak XP — call on each login
export async function awardLoginXP(userId: number): Promise<{ xp: number; newBadges: string[] }> {
  const hour = new Date().getHours();
  const event = hour < 7 ? 'morning_study' : hour >= 22 ? 'night_study' : 'login';
  const streakBonus = await (prisma.user as any).findUnique({
    where: { id: userId }, select: { streak: true }
  });
  const streak = (streakBonus?.streak ?? 0);
  const xpAmount = streak > 0 && streak % 7 === 0 ? 55 : 5; // +50 bonus every 7 days
  return awardXP(userId, xpAmount, event);
}
