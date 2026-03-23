requireAuth();

const user = getUser();
document.getElementById('userName').textContent = user?.name || user?.email || 'there';
document.getElementById('logoutBtn').addEventListener('click', logout);

const grid    = document.getElementById('deckGrid');
const empty   = document.getElementById('emptyState');
const loading = document.getElementById('loadingState');

async function loadDecks() {
  loading.style.display = '';
  grid.style.display = 'none';

  try {
    const { decks } = await apiFetch('/api/decks');
    loading.style.display = 'none';

    if (!decks.length) {
      empty.style.display = '';
      return;
    }

    empty.style.display = 'none';
    grid.style.display = '';
    grid.innerHTML = decks.map(deck => `
      <div class="deck-card bg-white rounded-2xl p-6 shadow-sm border border-slate-100 cursor-pointer fade-in" data-id="${deck.id}">
        <div class="flex items-start justify-between mb-4">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg"
               style="background:${deck.color}">
            ${deck.name.charAt(0).toUpperCase()}
          </div>
          <div class="flex items-center gap-2">
            ${deck.due_count > 0
              ? `<span class="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full">${deck.due_count} due</span>`
              : ''}
            <button class="text-slate-300 hover:text-red-400 transition-colors p-1 delete-deck" data-id="${deck.id}" title="Delete deck">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
              </svg>
            </button>
          </div>
        </div>
        <h3 class="font-semibold text-slate-900 text-lg leading-tight mb-1">${escHtml(deck.name)}</h3>
        <p class="text-slate-500 text-sm mb-4 line-clamp-2">${escHtml(deck.description || 'No description')}</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-slate-400">${deck.card_count} card${deck.card_count !== 1 ? 's' : ''}</span>
          <div class="flex gap-2">
            <a href="/deck.html?id=${deck.id}"
               class="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-50">
              View
            </a>
            <a href="/study.html?deckId=${deck.id}"
               class="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
               style="background:${deck.color}">
              Study
            </a>
          </div>
        </div>
      </div>
    `).join('');

    // Delete buttons
    grid.querySelectorAll('.delete-deck').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!confirm('Delete this deck and all its cards?')) return;
        try {
          await apiFetch(`/api/decks/${btn.dataset.id}`, { method: 'DELETE' });
          showToast('Deck deleted', 'success');
          loadDecks();
        } catch (err) {
          showToast(err.message, 'error');
        }
      });
    });

  } catch (err) {
    loading.style.display = 'none';
    showToast('Failed to load decks', 'error');
  }
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

loadDecks();
