export interface User {
  id: number;
  email: string;
  displayName: string;
  uiLanguage: string;
  subscriptionTier: string;
}

export interface Deck {
  id: number;
  name: string;
  description: string;
  color: string;
  isFavorite: boolean;
  examDate?: string | null;
  createdAt: string;
  _count?: { cards: number };
}

export interface Stats {
  streak: number;
  lastStudyDate: string | null;
  totalCardsLearned: number;
  weakCards: number;
  dueToday: number;
  recentSessions: { id: number; cardsStudied: number; studiedAt: string; deck: { name: string; color: string } }[];
}

export interface Card {
  id: number;
  deckId: number;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  nextReview: string;
  easiness: number;
  interval: number;
  repetitions: number;
}

export interface Quiz {
  id: number;
  title: string;
  topic: string;
  createdAt: string;
  _count?: { questions: number };
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  type: 'multiple_choice' | 'open';
  question: string;
  options: string[] | null;
  correct: string | null;
  explanation: string;
  sampleAnswer: string;
  keywords: string[] | null;
}

export interface Summary {
  id: number;
  title: string;
  topic: string;
  content: string;
  createdAt: string;
}
