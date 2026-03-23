requireAuth();

document.getElementById('logoutBtn').addEventListener('click', logout);

const deckId = urlParam('deckId');
if (!deckId) window.location.href = '/dashboard.html';

// UI elements
const loadingView  = document.getElementById('loadingView');
const emptyView    = document.getElementById('emptyView');
const studyView    = document.getElementById('studyView');
const doneView     = document.getElementById('doneView');
const deckNameEl   = document.getElementById('deckNameEl');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const cardScene    = document.getElementById('cardScene');
const cardWrap     = document.getElementById('cardWrap');
const frontText    = document.getElementById('frontText');
const backText     = document.getElementById('backText');
const showAnswerBtn= document.getElementById('showAnswerBtn');
const ratingBtns   = document.getElementById('ratingBtns');
const flipHint     = document.getElementById('flipHint');

// Session state
let deck, cards, index = 0;
const ratings = { 0: 0, 1: 0, 2: 0, 3: 0 };

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
    studyView.style.display = '';
    showCard();
  } catch (err) {
    showToast('Failed to load study session', 'error');
  }
}

function showCard() {
  if (index >= cards.length) { endSession(); return; }

  const card = cards[index];
  frontText.textContent = card.front;
  backText.textContent  = card.back;

  // Reset flip state
  cardWrap.classList.remove('flipped');
  showAnswerBtn.style.display = '';
  ratingBtns.style.display   = 'none';
  flipHint.style.display     = '';

  // Progress
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

document.addEventListener('keydown', (e) => {
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

async function rateCard(rating) {
  const card = cards[index];
  ratings[rating]++;

  try {
    await apiFetch(`/api/cards/${card.id}/review`, { method: 'POST', body: JSON.stringify({ rating }) });
  } catch (_) { /* non-fatal */ }

  index++;
  showCard();
}

async function endSession() {
  studyView.style.display = 'none';
  doneView.style.display  = '';

  progressFill.style.width = '100%';
  progressText.textContent = `${cards.length} / ${cards.length}`;

  // Stats
  const total = cards.length;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statAgain').textContent = ratings[0];
  document.getElementById('statHard').textContent  = ratings[1];
  document.getElementById('statGood').textContent  = ratings[2];
  document.getElementById('statEasy').textContent  = ratings[3];

  // Save session
  try {
    await apiFetch('/api/ai/study-sessions', {
      method: 'POST',
      body: JSON.stringify({
        deck_id: deckId,
        cards_studied: total,
        again_count: ratings[0],
        hard_count: ratings[1],
        good_count: ratings[2],
        easy_count: ratings[3]
      })
    });
  } catch (_) { /* non-fatal */ }

  document.getElementById('backToDeckBtn').onclick = () => window.location.href = `/deck.html?id=${deckId}`;
  document.getElementById('dashboardBtn').onclick  = () => window.location.href = '/dashboard.html';
}

document.getElementById('emptyBackBtn')?.addEventListener('click', () => window.location.href = `/deck.html?id=${deckId}`);

init();
