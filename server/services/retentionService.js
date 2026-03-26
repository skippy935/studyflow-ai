const db = require('../db');

// Forgetting curve: R(t) = e^(-t / stability)
// Stability ≈ current SM-2 interval in days
function retentionAt(intervalDays, t) {
  const stability = Math.max(intervalDays, 1);
  return Math.exp(-t / stability);
}

// Returns retention projection for every deck the user owns
function getRetentionProjection(userId) {
  const decks = db.prepare(
    'SELECT id, name, color FROM decks WHERE user_id = ?'
  ).all(userId);

  return decks.map(deck => {
    const cards = db.prepare(
      'SELECT interval, repetitions FROM cards WHERE deck_id = ?'
    ).all(deck.id);

    if (!cards.length) {
      return { deckId: deck.id, deckName: deck.name, deckColor: deck.color, week1: null, month1: null, cardCount: 0 };
    }

    const week1  = cards.reduce((s, c) => s + retentionAt(c.interval, 7),  0) / cards.length;
    const month1 = cards.reduce((s, c) => s + retentionAt(c.interval, 30), 0) / cards.length;

    return {
      deckId:    deck.id,
      deckName:  deck.name,
      deckColor: deck.color,
      week1:     Math.round(week1  * 100),
      month1:    Math.round(month1 * 100),
      cardCount: cards.length
    };
  });
}

// Detect cramming: heavy single-day sessions or exam approaching with low review history
function detectCramming(userId) {
  const warnings = [];
  const today = new Date().toISOString().split('T')[0];

  // Heavy single-day sessions (>40 cards in one day for one deck)
  const todaySessions = db.prepare(`
    SELECT ss.deck_id, SUM(ss.cards_studied) AS total_cards, d.name AS deck_name
    FROM study_sessions ss
    JOIN decks d ON d.id = ss.deck_id
    WHERE ss.user_id = ? AND date(ss.studied_at) = ?
    GROUP BY ss.deck_id
  `).all(userId, today);

  for (const s of todaySessions) {
    if (s.total_cards > 40) {
      warnings.push({
        deckId:     s.deck_id,
        deckName:   s.deck_name,
        type:       'heavy_session',
        message:    `You studied ${s.total_cards} cards in "${s.deck_name}" today — that's a heavy session.`,
        suggestion: 'Spread reviews across multiple short sessions. Spaced practice boosts retention by up to 200%.'
      });
    }
  }

  // Exam approaching (within 3 days) with fewer than 3 sessions in last 14 days
  const upcomingExams = db.prepare(`
    SELECT ed.deck_id, ed.exam_date, d.name AS deck_name
    FROM exam_dates ed
    JOIN decks d ON d.id = ed.deck_id
    WHERE ed.user_id = ?
      AND ed.exam_date >= date('now')
      AND ed.exam_date <= date('now', '+3 days')
  `).all(userId);

  for (const exam of upcomingExams) {
    const { cnt } = db.prepare(`
      SELECT COUNT(*) AS cnt FROM study_sessions
      WHERE user_id = ? AND deck_id = ? AND studied_at >= datetime('now', '-14 days')
    `).get(userId, exam.deck_id);

    if (cnt < 3) {
      const msLeft   = new Date(exam.exam_date) - new Date();
      const daysLeft = Math.max(1, Math.ceil(msLeft / 86400000));
      warnings.push({
        deckId:     exam.deck_id,
        deckName:   exam.deck_name,
        type:       'exam_soon',
        message:    `Exam for "${exam.deck_name}" is in ${daysLeft} day${daysLeft !== 1 ? 's' : ''} — only ${cnt} review${cnt !== 1 ? 's' : ''} in the last 2 weeks.`,
        suggestion: 'Focus on hard cards first. Even 15 minutes today will significantly improve recall tomorrow.'
      });
    }
  }

  return warnings;
}

// Micro-dose nudges: decks with due cards not studied in 3+ days
function getMicroDoseNudges(userId) {
  return db.prepare(`
    SELECT
      d.id        AS deckId,
      d.name      AS deckName,
      d.color     AS deckColor,
      COUNT(c.id) AS dueCards,
      COALESCE(
        CAST(julianday('now') - julianday(MAX(ss.studied_at)) AS INTEGER),
        999
      ) AS daysSinceStudy
    FROM decks d
    LEFT JOIN cards c
      ON c.deck_id = d.id AND c.next_review <= date('now')
    LEFT JOIN study_sessions ss
      ON ss.deck_id = d.id AND ss.user_id = ?
    WHERE d.user_id = ?
    GROUP BY d.id
    HAVING dueCards > 0 AND daysSinceStudy >= 3
    ORDER BY daysSinceStudy DESC
    LIMIT 3
  `).all(userId, userId);
}

module.exports = { getRetentionProjection, detectCramming, getMicroDoseNudges };
