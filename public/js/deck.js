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

const DIFF_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const DIFF_COLORS = { easy: '#10B981', medium: '#F59E0B', hard: '#EF4444' };

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

  document.getElementById('deckColorDot').style.background = deck.color;
  document.getElementById('deckColorDot').textContent = deck.name.charAt(0).toUpperCase();

  noCards.style.display = cards.length ? 'none' : '';
  cardsList.innerHTML   = cards.map(c => cardRowHtml(c)).join('');
  bindCardActions();
}

function diffBadge(diff) {
  const label = DIFF_LABELS[diff] || diff || '';
  const color = DIFF_COLORS[diff] || 'var(--text-3)';
  if (!label) return '<span style="color:var(--text-3);font-size:.75rem;">—</span>';
  return `<span style="display:inline-block;padding:.125rem .5rem;border-radius:100px;font-size:.65rem;font-weight:700;background:${color}22;color:${color};">${label}</span>`;
}

function cardRowHtml(c) {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr 80px 80px;gap:1rem;padding:.875rem 1.5rem;border-bottom:1px solid var(--border);align-items:center;" data-id="${c.id}">
      <div style="font-size:.875rem;color:var(--text);line-height:1.5;">${escHtml(c.front)}</div>
      <div style="font-size:.875rem;color:var(--text-2);line-height:1.5;">${escHtml(c.back)}</div>
      <div>${diffBadge(c.difficulty)}</div>
      <div style="display:flex;gap:.25rem;justify-content:flex-end;">
        <button class="edit-card" style="padding:.375rem;color:var(--text-3);border-radius:8px;background:none;border:none;cursor:pointer;" title="Edit">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
        </button>
        <button class="delete-card" style="padding:.375rem;color:var(--text-3);border-radius:8px;background:none;border:none;cursor:pointer;" title="Delete">
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
        </button>
      </div>
    </div>
  `;
}

function editRowHtml(c) {
  return `
    <div style="display:grid;grid-template-columns:1fr 1fr 80px 80px;gap:1rem;padding:.875rem 1.5rem;border-bottom:1px solid var(--border);align-items:start;background:var(--primary-dim);" data-id="${c.id}">
      <textarea class="edit-front sb-textarea" rows="2" style="min-height:unset;">${escHtml(c.front)}</textarea>
      <textarea class="edit-back sb-textarea" rows="2" style="min-height:unset;">${escHtml(c.back)}</textarea>
      <div>${diffBadge(c.difficulty)}</div>
      <div style="display:flex;gap:.375rem;flex-direction:column;">
        <button class="save-card btn btn-primary btn-sm" style="justify-content:center;padding:.25rem .625rem;font-size:.75rem;">Save</button>
        <button class="cancel-edit btn btn-ghost btn-sm" style="justify-content:center;padding:.25rem .625rem;font-size:.75rem;">Cancel</button>
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
  const temp = document.createElement('div');
  temp.style.cssText = 'display:grid;grid-template-columns:1fr 1fr 80px 80px;gap:1rem;padding:.875rem 1.5rem;border-bottom:1px solid var(--border);align-items:start;background:var(--surface2);';
  temp.innerHTML = `
    <textarea class="new-front sb-textarea" rows="2" style="min-height:unset;" placeholder="Question or term…"></textarea>
    <textarea class="new-back sb-textarea" rows="2" style="min-height:unset;" placeholder="Answer or definition…"></textarea>
    <div></div>
    <div style="display:flex;gap:.375rem;flex-direction:column;">
      <button class="save-new btn btn-primary btn-sm" style="justify-content:center;padding:.25rem .625rem;font-size:.75rem;">Add</button>
      <button class="cancel-new btn btn-ghost btn-sm" style="justify-content:center;padding:.25rem .625rem;font-size:.75rem;">Cancel</button>
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

load();
