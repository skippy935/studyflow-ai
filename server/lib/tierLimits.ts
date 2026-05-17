// ─────────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for subscription tier limits.
// -1 = unlimited. false = disabled. true = enabled.
// ─────────────────────────────────────────────────────────────────────────────

export interface TierLimits {
  // AI — counted per period
  ai_chat_messages_per_day:    number;
  ai_explanation_per_day:      number;
  ai_quiz_gen_per_month:       number;
  ai_flashcard_gen_per_month:  number;
  ocr_scans_per_month:         number;
  // Content limits
  max_active_flashcard_decks:  number;
  max_manual_quizzes:          number;
  // Boolean features
  study_groups:         boolean;
  offline_mode:         boolean;
  export_pdf:           boolean;
  export_csv:           boolean;
  advanced_analytics:   boolean;
  custom_study_plan:    boolean;
  priority_support:     boolean;
  early_access:         boolean;
  // School
  teacher_dashboard:    boolean;
  class_management:     boolean;
  student_monitoring:   boolean;
  assignment_creation:  boolean;
  // Gamification
  xp_multiplier:        number;
  analytics_history_days: number;
}

const TIER_LIMITS: Record<string, TierLimits> = {
  free: {
    ai_chat_messages_per_day:   5,
    ai_explanation_per_day:     3,
    ai_quiz_gen_per_month:      2,
    ai_flashcard_gen_per_month: 5,
    ocr_scans_per_month:        3,
    max_active_flashcard_decks: 3,
    max_manual_quizzes:         10,
    study_groups:       false,
    offline_mode:       false,
    export_pdf:         false,
    export_csv:         false,
    advanced_analytics: false,
    custom_study_plan:  false,
    priority_support:   false,
    early_access:       false,
    teacher_dashboard:  false,
    class_management:   false,
    student_monitoring: false,
    assignment_creation: false,
    xp_multiplier:          1.0,
    analytics_history_days: 3,
  },

  premium_monthly: {
    ai_chat_messages_per_day:   -1,
    ai_explanation_per_day:     -1,
    ai_quiz_gen_per_month:      -1,
    ai_flashcard_gen_per_month: -1,
    ocr_scans_per_month:        -1,
    max_active_flashcard_decks: -1,
    max_manual_quizzes:         -1,
    study_groups:       true,
    offline_mode:       true,
    export_pdf:         true,
    export_csv:         true,
    advanced_analytics: true,
    custom_study_plan:  true,
    priority_support:   false,
    early_access:       false,
    teacher_dashboard:  false,
    class_management:   false,
    student_monitoring: false,
    assignment_creation: false,
    xp_multiplier:          1.5,
    analytics_history_days: 365,
  },

  premium_yearly: {
    ai_chat_messages_per_day:   -1,
    ai_explanation_per_day:     -1,
    ai_quiz_gen_per_month:      -1,
    ai_flashcard_gen_per_month: -1,
    ocr_scans_per_month:        -1,
    max_active_flashcard_decks: -1,
    max_manual_quizzes:         -1,
    study_groups:       true,
    offline_mode:       true,
    export_pdf:         true,
    export_csv:         true,
    advanced_analytics: true,
    custom_study_plan:  true,
    priority_support:   true,
    early_access:       true,
    teacher_dashboard:  false,
    class_management:   false,
    student_monitoring: false,
    assignment_creation: false,
    xp_multiplier:          2.0,
    analytics_history_days: 365,
  },

  school: {
    ai_chat_messages_per_day:   -1,
    ai_explanation_per_day:     -1,
    ai_quiz_gen_per_month:      -1,
    ai_flashcard_gen_per_month: -1,
    ocr_scans_per_month:        -1,
    max_active_flashcard_decks: -1,
    max_manual_quizzes:         -1,
    study_groups:       true,
    offline_mode:       true,
    export_pdf:         true,
    export_csv:         true,
    advanced_analytics: true,
    custom_study_plan:  true,
    priority_support:   true,
    early_access:       true,
    teacher_dashboard:  true,
    class_management:   true,
    student_monitoring: true,
    assignment_creation: true,
    xp_multiplier:          2.0,
    analytics_history_days: 365,
  },
};

// Alias 'premium' (legacy) to premium_monthly
const TIER_ALIASES: Record<string, string> = {
  free:            'free',
  premium:         'premium_monthly',
  premium_monthly: 'premium_monthly',
  premium_yearly:  'premium_yearly',
  school:          'school',
  school_license:  'school',
};

export function getLimits(tier: string | null | undefined): TierLimits {
  const key = TIER_ALIASES[tier ?? 'free'] ?? 'free';
  return TIER_LIMITS[key] ?? TIER_LIMITS.free;
}

export function getLimit(tier: string | null | undefined, feature: keyof TierLimits): number | boolean {
  return getLimits(tier)[feature];
}

export function isEnabled(tier: string | null | undefined, feature: keyof TierLimits): boolean {
  const val = getLimit(tier, feature);
  return val === true || val === -1;
}

export const FEATURE_PERIODS: Record<string, 'daily' | 'monthly'> = {
  ai_chat_messages_per_day:   'daily',
  ai_explanation_per_day:     'daily',
  ai_quiz_gen_per_month:      'monthly',
  ai_flashcard_gen_per_month: 'monthly',
  ocr_scans_per_month:        'monthly',
};

export const FEATURE_NAMES: Record<string, string> = {
  ai_chat_messages_per_day:   'KI-Chat',
  ai_explanation_per_day:     'KI-Erklärungen',
  ai_quiz_gen_per_month:      'KI-Quiz-Generator',
  ai_flashcard_gen_per_month: 'KI-Karteikarten',
  ocr_scans_per_month:        'Dokument-Scanner',
  study_groups:               'Lerngruppen',
  offline_mode:               'Offline-Modus',
  export_pdf:                 'PDF-Export',
  export_csv:                 'CSV-Export',
  advanced_analytics:         'Erweiterte Statistiken',
  custom_study_plan:          'Persönlicher Lernplan',
  teacher_dashboard:          'Lehrer-Dashboard',
};
