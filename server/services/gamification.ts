import prisma from '../lib/prisma';

// ── XP thresholds per level ───────────────────────────────────────────────────
export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000];

// LearnForge level names: Novice → Scholar → Master → Legend (+ sub-tiers)
export const LEVEL_NAMES: Record<number, string> = {
  1:  '🌱 Novice I',
  2:  '🌱 Novice II',
  3:  '📚 Scholar I',
  4:  '📚 Scholar II',
  5:  '📚 Scholar III',
  6:  '🎓 Master I',
  7:  '🎓 Master II',
  8:  '🎓 Master III',
  9:  '🏆 Legend',
  10: '⭐ Legend Elite',
};

export function levelFromXP(xp: number): number {
  let level = 1;
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1;
    else break;
  }
  return level;
}

export function levelNameFromXP(xp: number): string {
  return LEVEL_NAMES[levelFromXP(xp)] ?? '⭐ Legend Elite';
}

export function xpForNextLevel(xp: number): { current: number; needed: number; level: number; levelName: string } {
  const level = levelFromXP(xp);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const nextThreshold    = LEVEL_THRESHOLDS[level]     ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  return {
    level,
    levelName: LEVEL_NAMES[level] ?? '⭐ Legend Elite',
    current: xp - currentThreshold,
    needed:  nextThreshold - currentThreshold,
  };
}

// ── XP amounts per event (matching spec) ─────────────────────────────────────
export const XP_EVENTS: Record<string, number> = {
  material_upload:     10,   // +10 XP: Material hochgeladen & verarbeitet
  quiz_complete_80:    25,   // +25 XP: Quiz mit >80% bestanden
  quiz_complete:       10,   // +10 XP: Quiz abgeschlossen (< 80%)
  streak_7:            50,   // +50 XP: 7-Tage-Lernstreak
  exam_passed:        100,   // +100 XP: Prüfung bestanden (self-reported)
  referral_pro:       200,   // +200 XP: Freund eingeladen, der PRO wird
  deck_created:        10,
  flashcard_studied:    2,
  login:                5,
  morning_study:        8,   // early bird
  night_study:          8,   // night owl
  vocab_learned:       15,   // daily quest: 3 neue Vokabeln
  plan_created:        30,   // daily quest: Lernplan erstellt
  share_deck:          25,   // daily quest: Deck geteilt
  card_reviewed:       10,   // daily quest: alte Karte wiederholt
  kit_started:         10,   // Kit geöffnet
};

// ── Badge definitions ─────────────────────────────────────────────────────────
export const BADGE_DEFS: Record<string, { label: string; emoji: string; desc: string }> = {
  // Milestones
  first_deck:       { label: 'Erster Schritt',    emoji: '👣', desc: 'Created your first flashcard deck' },
  first_quiz:       { label: 'Wissensdurst',      emoji: '🧠', desc: 'Completed your first quiz' },
  first_exam:       { label: 'Prüfungsbereit',    emoji: '🎓', desc: 'Completed your first Examiner session' },
  first_kit:        { label: 'Kit-Starter',       emoji: '📦', desc: 'Opened your first Lern-Kit' },
  // Cards
  cards_100:        { label: 'Century',           emoji: '💯', desc: 'Studied 100 cards total' },
  cards_500:        { label: 'Powerhouse',        emoji: '⚡', desc: 'Studied 500 cards total' },
  cards_1000:       { label: 'Legende',           emoji: '🏆', desc: 'Studied 1,000 cards total' },
  // Streaks
  streak_7:         { label: 'Streak Master 🔥',  emoji: '🔥', desc: '7-day study streak' },
  streak_30:        { label: 'Perfektionist',     emoji: '🌟', desc: '30-day study streak' },
  // Levels
  level_5:          { label: 'Scholar',           emoji: '📚', desc: 'Reached Scholar level' },
  level_8:          { label: 'Master',            emoji: '🎓', desc: 'Reached Master level' },
  level_9:          { label: 'Legend',            emoji: '🏆', desc: 'Reached Legend!' },
  // Time-based
  night_owl:        { label: 'Nachteule',         emoji: '🦉', desc: 'Studied after 22:00' },
  early_bird:       { label: 'Frühaufsteher',     emoji: '🌅', desc: 'Studied before 07:00' },
  // Quizzes
  quiz_champion:    { label: 'Quiz Champion',     emoji: '🥇', desc: 'Passed 10 quizzes with >80%' },
  flashcard_pro:    { label: 'Flashcard Pro',     emoji: '🗂️', desc: 'Studied 50 flashcards in one session' },
  // Social / variety
  versatile:        { label: 'Vielseitig',        emoji: '🎨', desc: 'Used 5 different study modes' },
  uploader:         { label: 'Uploader',          emoji: '📤', desc: 'Uploaded study material' },
  helper:           { label: 'Helfer',            emoji: '🤝', desc: 'Shared a deck with others' },
  // New LearnForge
  kit_explorer:     { label: 'Kit Explorer',      emoji: '🗺️', desc: 'Completed 5 different Lern-Kits' },
  speed_learner:    { label: 'Speed Learner',     emoji: '⚡', desc: 'Finished a quiz in under 2 minutes' },
  top_scorer:       { label: 'Top Scorer',        emoji: '🎯', desc: 'Scored 100% on a quiz' },
  consistent:       { label: 'Beständig',         emoji: '📅', desc: 'Studied every day for 14 days' },
};

// ── Daily quests (static definitions – completion tracked client-side) ────────
export const DAILY_QUESTS = [
  { id: 'vocab_3',     label: 'Lerne 3 neue Vokabeln / Flashcards', xp: 15, icon: '📝' },
  { id: 'create_plan', label: 'Erstelle einen Lernplan',             xp: 30, icon: '🗓️' },
  { id: 'share_deck',  label: 'Hilf einem Freund (Deck teilen)',     xp: 25, icon: '🤝' },
  { id: 'review_card', label: 'Wiederhole eine alte Karte',          xp: 10, icon: '🔁' },
  { id: 'quiz_today',  label: 'Schließe heute ein Quiz ab',          xp: 20, icon: '❓' },
];

// ── Core awardXP function ─────────────────────────────────────────────────────
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

  const totalCards = user.totalCardsLearned ?? 0;
  const streak     = user.streak ?? 0;
  const newLevel   = levelFromXP(newXp);

  // Card milestones
  check('cards_100',  totalCards >= 100);
  check('cards_500',  totalCards >= 500);
  check('cards_1000', totalCards >= 1000);
  // Streak milestones
  check('streak_7',   streak >= 7);
  check('streak_30',  streak >= 30);
  check('consistent', streak >= 14);
  // Level badges
  check('level_5',    newLevel >= 3);   // Scholar
  check('level_8',    newLevel >= 6);   // Master
  check('level_9',    newLevel >= 9);   // Legend

  // Event-specific badges
  if (event === 'quiz_complete' || event === 'quiz_complete_80') check('first_quiz', true);
  if (event === 'quiz_complete_80')  check('top_scorer', amount >= 100);
  if (event === 'exam_complete')     check('first_exam', true);
  if (event === 'deck_created')      check('first_deck', true);
  if (event === 'material_upload')   check('uploader', true);
  if (event === 'share_deck')        check('helper', true);
  if (event === 'night_study')       check('night_owl', true);
  if (event === 'morning_study')     check('early_bird', true);
  if (event === 'kit_started')       check('first_kit', true);

  const allBadges = [...existingBadges, ...earned];

  await (prisma.user as any).update({
    where: { id: userId },
    data:  { xp: newXp, badges: JSON.stringify(allBadges) },
  });

  return { xp: newXp, newBadges: earned };
}

// ── Login streak XP ───────────────────────────────────────────────────────────
export async function awardLoginXP(userId: number): Promise<{ xp: number; newBadges: string[] }> {
  const hour = new Date().getHours();
  const event = hour < 7 ? 'morning_study' : hour >= 22 ? 'night_study' : 'login';
  const streakData = await (prisma.user as any).findUnique({
    where: { id: userId }, select: { streak: true }
  });
  const streak  = streakData?.streak ?? 0;
  const xpBase  = XP_EVENTS[event] ?? XP_EVENTS.login;
  // +50 bonus on every 7-day milestone
  const xpAmount = streak > 0 && streak % 7 === 0 ? xpBase + 50 : xpBase;
  return awardXP(userId, xpAmount, event);
}
