/**
 * SM-2 spaced repetition algorithm.
 * rating: 0=Again, 1=Hard, 2=Good, 3=Easy
 * Returns updated { easiness, interval, repetitions, next_review }
 */
function calcNextReview({ easiness, interval, repetitions }, rating) {
  let e = easiness;
  let i = interval;
  let r = repetitions;

  if (rating < 2) {
    // Failed — reset
    r = 0;
    i = 1;
  } else {
    // Passed
    if (r === 0) i = 1;
    else if (r === 1) i = 6;
    else i = Math.round(i * e);
    r += 1;
  }

  // Update ease factor (clamped to min 1.3)
  e = e + (0.1 - (3 - rating) * (0.08 + (3 - rating) * 0.02));
  e = Math.max(1.3, parseFloat(e.toFixed(4)));

  // Calculate next review date
  const next = new Date();
  next.setDate(next.getDate() + i);
  const next_review = next.toISOString().split('T')[0];

  return { easiness: e, interval: i, repetitions: r, next_review };
}

module.exports = { calcNextReview };
