requireAuth();

document.getElementById('logoutBtn').addEventListener('click', logout);

const deckId = urlParam('id');
if (!deckId) window.location.href = '/dashboard.html';

const deckTitle = document.getElementById('deckTitle');
const deckDesc  = document.getElementById('deckDesc');
const cardTotal = document.getElementById('cardTotal');
const dueCount  = document.getElementById('dueCount');
const cardsList = document.getElementById('cardsList');
const noCards   = document.getElementById('noCards');
const studyBtn  = document.getElementById('studyBtn');
const addCardBtn= document.getElementById('addCardBtn');
const errorMsg  = document.getElementById('errorMsg');

let deck, cards;

async function load() {
  try {
    const data = await apiFetch(`/api/decks/${deckId}`);
    deck  = data.deck;
    cards = data.cards;
    render();
  } catch (err) {
    showToast('Failed to load deck', 'error');
  }
}

function render() {
  deckTitle.textContent = deck.name;
  deckDesc.textContent  = deck.description || '';
  cardTotal.textContent = cards.length;
  const due = cards.filter(c => c.next_review <= new Date().toISOString().split('T')[0]).length;
  dueCount.textContent  = due;
  studyBtn.href = `/study.html?deckId=${deck.id}`;

  // Update header color accent
  document.getElementById('deckColorDot').style.background = deck.color;

  noCards.style.display = cards.length ? 'none' : '';
  cardsList.innerHTML   = cards.map(c => cardRowHtml(c)).join('');
  bindCardActions();
}

function cardRowHtml(c) {
  return `
    <div class="card-row" data-id="${c.id}">
      <div class="text-sm text-slate-700 leading-relaxed">${escHtml(c.front)}</div>
      <div class="text-sm text-slate-500 leading-relaxed">${escHtml(c.back)}</div>
      <div class="flex gap-1 shrink-0">
        <button class="edit-card p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors" title="Edit">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
          </svg>
        </button>
        <button class="delete-card p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Delete">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function editRowHtml(c) {
  return `
    <div class="card-row bg-indigo-50/60" data-id="${c.id}">
      <textarea class="edit-front w-full text-sm border border-indigo-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" rows="2">${escHtml(c.front)}</textarea>
      <textarea class="edit-back w-full text-sm border border-indigo-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400" rows="2">${escHtml(c.back)}</textarea>
      <div class="flex gap-1 shrink-0">
        <button class="save-card px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">Save</button>
        <button class="cancel-edit px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
      </div>
    </div>
  `;
}

function bindCardActions() {
  cardsList.querySelectorAll('.edit-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('[data-id]');
      const card = cards.find(c => String(c.id) === row.dataset.id);
      row.outerHTML = editRowHtml(card);
      bindSaveCancel(card);
    });
  });

  cardsList.querySelectorAll('.delete-card').forEach(btn => {
    btn.addEventListener('click', async () => {
      const row = btn.closest('[data-id]');
      if (!confirm('Delete this card?')) return;
      try {
        await apiFetch(`/api/cards/${row.dataset.id}`, { method: 'DELETE' });
        cards = cards.filter(c => String(c.id) !== row.dataset.id);
        render();
        showToast('Card deleted', 'success');
      } catch (err) { showToast(err.message, 'error'); }
    });
  });
}

function bindSaveCancel(card) {
  const row = cardsList.querySelector(`[data-id="${card.id}"]`);
  if (!row) return;

  row.querySelector('.save-card').addEventListener('click', async () => {
    const front = row.querySelector('.edit-front').value.trim();
    const back  = row.querySelector('.edit-back').value.trim();
    if (!front || !back) { showToast('Front and back cannot be empty', 'error'); return; }
    try {
      const { card: updated } = await apiFetch(`/api/cards/${card.id}`, {
        method: 'PUT', body: JSON.stringify({ front, back })
      });
      cards = cards.map(c => c.id === updated.id ? updated : c);
      render();
      showToast('Card updated', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });

  row.querySelector('.cancel-edit').addEventListener('click', () => render());
}

addCardBtn.addEventListener('click', () => {
  // Append a blank add-row
  const temp = document.createElement('div');
  temp.className = 'card-row bg-emerald-50/60';
  temp.innerHTML = `
    <textarea class="new-front w-full text-sm border border-emerald-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" rows="2" placeholder="Question or term…"></textarea>
    <textarea class="new-back w-full text-sm border border-emerald-200 rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400" rows="2" placeholder="Answer or definition…"></textarea>
    <div class="flex gap-1 shrink-0">
      <button class="save-new px-3 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">Add</button>
      <button class="cancel-new px-3 py-1.5 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">Cancel</button>
    </div>
  `;
  cardsList.appendChild(temp);
  noCards.style.display = 'none';
  temp.querySelector('.new-front').focus();

  temp.querySelector('.cancel-new').addEventListener('click', () => { temp.remove(); });

  temp.querySelector('.save-new').addEventListener('click', async () => {
    const front = temp.querySelector('.new-front').value.trim();
    const back  = temp.querySelector('.new-back').value.trim();
    if (!front || !back) { showToast('Front and back cannot be empty', 'error'); return; }
    try {
      const { card } = await apiFetch(`/api/decks/${deckId}/cards`, {
        method: 'POST', body: JSON.stringify({ front, back })
      });
      cards.push(card);
      render();
      showToast('Card added', 'success');
    } catch (err) { showToast(err.message, 'error'); }
  });
});

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

load();
