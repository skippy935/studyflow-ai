requireAuth();

document.getElementById('logoutBtn').addEventListener('click', logout);

const deckId = urlParam('deckId');
if (!deckId) window.location.href = '/dashboard.html';

const loadingView   = document.getElementById('loadingView');
const emptyView     = document.getElementById('emptyView');
const moodOverlay   = document.getElementById('moodOverlay');
const studyView     = document.getElementById('studyView');
const doneView      = document.getElementById('doneView');
const deckNameEl    = document.getElementById('deckNameEl');
const progressFill  = document.getElementById('progressFill');
const progressText  = document.getElementById('progressText');
const cardScene     = document.getElementById('cardScene');
const cardWrap      = document.getElementById('cardWrap');
const frontText     = document.getElementById('frontText');
const backText      = document.getElementById('backText');
const showAnswerBtn = document.getElementById('showAnswerBtn');
const ratingBtns    = document.getElementById('ratingBtns');
const flipHint      = document.getElementById('flipHint');
const diffBadgeWrap = document.getElementById('diffBadgeWrap');
const frustrationOverlay = document.getElementById('frustrationOverlay');
const celebrationFlash   = document.getElementById('celebrationFlash');
const moodBadge          = document.getElementById('moodBadge');

const DIFF_COLORS = { easy: '#10B981', medium: '#F59E0B', hard: '#EF4444' };
const DIFF_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const DIFF_ORDER  = { easy: 0, medium: 1, hard: 2 };

const MOOD_CONFIG = {
  energized:  { emoji: '🚀', label: 'Energized',  sort: 'hard_first',  limit: null, tone: 'challenge' },
  good:       { emoji: '😊', label: 'Good',        sort: 'normal',      limit: null, tone: 'normal'    },
  okay:       { emoji: '😐', label: 'Okay',        sort: 'normal',      limit: null, tone: 'normal'    },
  tired:      { emoji: '😴', label: 'Tired',       sort: 'easy_first',  limit: 10,   tone: 'gentle'    },
  frustrated: { emoji: '😤', label: 'Frustrated',  sort: 'easy_first',  limit: 10,   tone: 'gentle'    }
};

let deck, cards, index = 0;
const ratings = { 0: 0, 1: 0, 2: 0, 3: 0 };
let currentMood       = null;
let consecutiveAgains = 0;
let failedCardIds     = new Set(); // cards rated "Again" this session
let frustrationShown  = false;

// ── Init ──────────────────────────────────────────────────
async function init() {
  try {
    const { deck: d, cards: c } = await apiFetch(`/api/decks/${deckId}/due`);
    deck  = d;
    cards = c;
    loadingView.style.display = 'none';
    deckNameEl.textContent = deck.name;

    if (!cards.length) {
      emptyView.style.display = '';
      return;
    }

    // Show mood check-in before starting
    moodOverlay.style.display = '';
  } catch {
    showToast('Failed to load study session', 'error');
  }
}

// ── Mood Check-In ─────────────────────────────────────────
document.querySelectorAll('.mood-btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => { btn.style.borderColor = 'var(--primary)'; });
  btn.addEventListener('mouseleave', () => {
    if (btn.dataset.mood !== currentMood) btn.style.borderColor = 'var(--border)';
  });
  btn.addEventListener('click', () => {
    currentMood = btn.dataset.mood;
    localStorage.setItem(`sb_mood_${deckId}`, currentMood);
    startSession();
  });
});

document.getElementById('skipMoodBtn').addEventListener('click', () => {
  currentMood = null;
  startSession();
});

function startSession() {
  moodOverlay.style.display = 'none';
  applyMoodToCards();

  if (currentMood) {
    const cfg = MOOD_CONFIG[currentMood];
    moodBadge.textContent    = `${cfg.emoji} ${cfg.label} mode`;
    moodBadge.style.display  = '';
  }

  studyView.style.display = '';
  showCard();
}

function applyMoodToCards() {
  if (!currentMood) return;
  const cfg = MOOD_CONFIG[currentMood];

  if (cfg.sort === 'easy_first') {
    cards.sort((a, b) => (DIFF_ORDER[a.difficulty] ?? 1) - (DIFF_ORDER[b.difficulty] ?? 1));
  } else if (cfg.sort === 'hard_first') {
    cards.sort((a, b) => (DIFF_ORDER[b.difficulty] ?? 1) - (DIFF_ORDER[a.difficulty] ?? 1));
  }

  if (cfg.limit) cards = cards.slice(0, cfg.limit);
}

// ── Card display ──────────────────────────────────────────
function showCard() {
  if (index >= cards.length) { endSession(); return; }

  const card = cards[index];
  frontText.textContent = card.front;
  backText.textContent  = card.back;

  if (card.difficulty && DIFF_LABELS[card.difficulty]) {
    const color = DIFF_COLORS[card.difficulty];
    diffBadgeWrap.innerHTML = `<span style="display:inline-block;padding:.2rem .625rem;border-radius:100px;font-size:.7rem;font-weight:700;background:${color}22;color:${color};">${DIFF_LABELS[card.difficulty]}</span>`;
  } else {
    diffBadgeWrap.innerHTML = '';
  }

  // Gentle mode hint for tired/frustrated
  const cfg = currentMood ? MOOD_CONFIG[currentMood] : null;
  if (cfg?.tone === 'gentle' && card.difficulty === 'easy') {
    diffBadgeWrap.innerHTML += `<span style="margin-left:.375rem;font-size:.7rem;color:var(--text-3);">✨ You've got this</span>`;
  }

  cardWrap.classList.remove('flipped');
  showAnswerBtn.style.display = '';
  ratingBtns.style.display   = 'none';
  flipHint.style.display     = '';

  const pct = Math.round((index / cards.length) * 100);
  progressFill.style.width = pct + '%';
  progressText.textContent = `${index + 1} / ${cards.length}`;
}

function flipCard() {
  cardWrap.classList.add('flipped');
  showAnswerBtn.style.display = 'none';
  flipHint.style.display      = 'none';
  setTimeout(() => { ratingBtns.style.display = ''; }, 300);
}

showAnswerBtn.addEventListener('click', flipCard);
cardScene.addEventListener('click', () => { if (!cardWrap.classList.contains('flipped')) flipCard(); });

document.addEventListener('keydown', e => {
  if (studyView.style.display === 'none') return;
  if (e.code === 'Space') { e.preventDefault(); if (!cardWrap.classList.contains('flipped')) flipCard(); }
  if (e.key === '1') rateCard(0);
  if (e.key === '2') rateCard(1);
  if (e.key === '3') rateCard(2);
  if (e.key === '4') rateCard(3);
});

ratingBtns.querySelectorAll('.rating-btn').forEach(btn => {
  btn.addEventListener('click', () => rateCard(parseInt(btn.dataset.rating)));
});

// ── Rating + Frustration + Celebration ────────────────────
async function rateCard(rating) {
  const card = cards[index];
  ratings[rating]++;

  // Frustration detector: track consecutive "Again" (rating 0)
  if (rating === 0) {
    consecutiveAgains++;
    failedCardIds.add(card.id);
    if (consecutiveAgains >= 3 && !frustrationShown) {
      frustrationShown = true;
      showFrustrationOverlay();
    }
  } else {
    // Celebration: card was failed earlier this session, now recovered
    if (rating >= 2 && failedCardIds.has(card.id)) {
      failedCardIds.delete(card.id);
      showCelebration();
    }
    consecutiveAgains = 0;
  }

  try {
    await apiFetch(`/api/cards/${card.id}/review`, { method: 'POST', body: JSON.stringify({ rating }) });
  } catch { /* non-fatal */ }

  index++;
  showCard();
}

// ── Frustration overlay ───────────────────────────────────
function showFrustrationOverlay() {
  frustrationOverlay.style.display = 'flex';
}

document.getElementById('keepGoingBtn').addEventListener('click', () => {
  frustrationOverlay.style.display = 'none';
  // Reset counter so it won't fire again too soon
  consecutiveAgains = 0;
});

document.getElementById('takBreakBtn').addEventListener('click', () => {
  frustrationOverlay.style.display = 'none';
  // End session early and go to done screen
  endSession();
});

// ── Celebration flash ─────────────────────────────────────
function showCelebration() {
  celebrationFlash.style.display = '';
  setTimeout(() => { celebrationFlash.style.display = 'none'; }, 2200);
}

// ── End session ───────────────────────────────────────────
async function endSession() {
  studyView.style.display  = 'none';
  moodBadge.style.display  = 'none';
  doneView.style.display   = '';

  progressFill.style.width = '100%';
  progressText.textContent = `${cards.length} / ${cards.length}`;

  const total = cards.length;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statAgain').textContent = ratings[0];
  document.getElementById('statHard').textContent  = ratings[1];
  document.getElementById('statGood').textContent  = ratings[2];
  document.getElementById('statEasy').textContent  = ratings[3];

  // Show reflection prompts (only if session had at least 3 cards)
  if (total >= 3) {
    document.getElementById('reflectionSection').style.display = '';
    // Pre-load any saved reflections for this deck
    const saved = JSON.parse(localStorage.getItem(`sb_reflect_${deckId}`) || '{}');
    if (saved.surprise)  document.getElementById('reflectSurprise').value  = saved.surprise;
    if (saved.nextTime)  document.getElementById('reflectNextTime').value  = saved.nextTime;

    // Auto-save reflections to localStorage
    ['reflectSurprise', 'reflectNextTime'].forEach(id => {
      document.getElementById(id).addEventListener('input', () => {
        localStorage.setItem(`sb_reflect_${deckId}`, JSON.stringify({
          surprise: document.getElementById('reflectSurprise').value,
          nextTime: document.getElementById('reflectNextTime').value
        }));
      });
    });
  }

  try {
    await apiFetch('/api/ai/study-sessions', {
      method: 'POST',
      body: JSON.stringify({
        deck_id: deckId,
        cards_studied: total,
        again_count: ratings[0],
        hard_count:  ratings[1],
        good_count:  ratings[2],
        easy_count:  ratings[3]
      })
    });
  } catch { /* non-fatal */ }

  document.getElementById('backToDeckBtn').onclick = () => window.location.href = `/deck.html?id=${deckId}`;
  document.getElementById('dashboardBtn').onclick  = () => window.location.href = '/dashboard.html';
}

document.getElementById('emptyBackBtn')?.addEventListener('click', () => window.location.href = `/deck.html?id=${deckId}`);

init();
