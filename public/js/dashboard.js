requireAuth();
document.getElementById('userName').textContent = getUser()?.name || 'there';
document.getElementById('logoutBtn').addEventListener('click', logout);

// ── Tabs ──────────────────────────────────────────────────
const tabs = document.querySelectorAll('.sb-tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    ['decks','quizzes','summaries'].forEach(t => {
      document.getElementById(`tab-${t}`).style.display = tab.dataset.tab === t ? '' : 'none';
    });
  });
});

// ── Load all ──────────────────────────────────────────────
loadDecks();
loadQuizzes();
loadSummaries();

// ── Decks ─────────────────────────────────────────────────
async function loadDecks() {
  try {
    const { decks } = await apiFetch('/api/decks');
    document.getElementById('decksLoading').style.display = 'none';
    if (!decks.length) { document.getElementById('decksEmpty').style.display = ''; return; }
    const grid = document.getElementById('decksGrid');
    grid.style.display = 'grid';
    grid.innerHTML = decks.map(d => `
      <div class="sb-card fade-in" style="padding:1.25rem;cursor:pointer;" data-id="${d.id}">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.875rem;">
          <div style="width:38px;height:38px;border-radius:10px;background:${d.color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:1rem;">
            ${escHtml(d.name.charAt(0).toUpperCase())}
          </div>
          <div style="display:flex;align-items:center;gap:.5rem;">
            ${d.due_count > 0 ? `<span style="font-size:.7rem;font-weight:700;padding:2px 8px;background:var(--primary-dim);color:var(--primary);border-radius:999px;">${d.due_count} due</span>` : ''}
            <button class="btn btn-ghost btn-sm del-deck" data-id="${d.id}" style="padding:4px;color:var(--text-3);" title="Delete">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        </div>
        <div style="font-weight:700;color:var(--text);margin-bottom:.25rem;">${escHtml(d.name)}</div>
        <div style="font-size:.8rem;color:var(--text-2);margin-bottom:.875rem;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escHtml(d.description || 'No description')}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:.75rem;color:var(--text-3);">${d.card_count} card${d.card_count !== 1 ? 's' : ''}</span>
          <div style="display:flex;gap:.375rem;">
            <a href="/deck.html?id=${d.id}" class="btn btn-ghost btn-sm" style="padding:.375rem .75rem;">View</a>
            <a href="/study.html?deckId=${d.id}" class="btn btn-primary btn-sm" style="background:${d.color};padding:.375rem .75rem;">Study</a>
          </div>
        </div>
      </div>
    `).join('');
    grid.querySelectorAll('.del-deck').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this deck and all its cards?')) return;
        await apiFetch(`/api/decks/${btn.dataset.id}`, { method: 'DELETE' });
        showToast('Deck deleted', 'success');
        loadDecks();
      });
    });
  } catch { document.getElementById('decksLoading').style.display = 'none'; }
}

// ── Quizzes ───────────────────────────────────────────────
async function loadQuizzes() {
  try {
    const { quizzes } = await apiFetch('/api/quizzes');
    document.getElementById('quizzesLoading').style.display = 'none';
    if (!quizzes.length) { document.getElementById('quizzesEmpty').style.display = ''; return; }
    const grid = document.getElementById('quizzesGrid');
    grid.style.display = 'grid';
    grid.innerHTML = quizzes.map(q => `
      <div class="sb-card fade-in" style="padding:1.25rem;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.875rem;">
          <div style="width:38px;height:38px;border-radius:10px;background:#7C3AED;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">❓</div>
          <button class="btn btn-ghost btn-sm del-quiz" data-id="${q.id}" style="padding:4px;color:var(--text-3);">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
        <div style="font-weight:700;color:var(--text);margin-bottom:.25rem;">${escHtml(q.title)}</div>
        <div style="font-size:.8rem;color:var(--text-2);margin-bottom:.875rem;">${q.topic ? escHtml(q.topic) : 'No topic'}</div>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:.75rem;color:var(--text-3);">${q.question_count} question${q.question_count !== 1 ? 's' : ''}</span>
          <a href="/quiz-take.html?id=${q.id}" class="btn btn-primary btn-sm" style="background:#7C3AED;">Take Quiz</a>
        </div>
      </div>
    `).join('');
    grid.querySelectorAll('.del-quiz').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this quiz?')) return;
        await apiFetch(`/api/quizzes/${btn.dataset.id}`, { method: 'DELETE' });
        showToast('Quiz deleted', 'success');
        loadQuizzes();
      });
    });
  } catch { document.getElementById('quizzesLoading').style.display = 'none'; }
}

// ── Summaries ─────────────────────────────────────────────
async function loadSummaries() {
  try {
    const { summaries } = await apiFetch('/api/summaries');
    document.getElementById('summariesLoading').style.display = 'none';
    if (!summaries.length) { document.getElementById('summariesEmpty').style.display = ''; return; }
    const grid = document.getElementById('summariesGrid');
    grid.style.display = 'grid';
    grid.innerHTML = summaries.map(s => `
      <div class="sb-card fade-in" style="padding:1.25rem;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.875rem;">
          <div style="width:38px;height:38px;border-radius:10px;background:#0EA5E9;display:flex;align-items:center;justify-content:center;font-size:1.1rem;">📝</div>
          <button class="btn btn-ghost btn-sm del-summary" data-id="${s.id}" style="padding:4px;color:var(--text-3);">
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
        <div style="font-weight:700;color:var(--text);margin-bottom:.25rem;">${escHtml(s.title)}</div>
        <div style="font-size:.8rem;color:var(--text-2);margin-bottom:.875rem;">${s.topic ? escHtml(s.topic) : ''}</div>
        <div style="display:flex;justify-content:flex-end;">
          <a href="/summary-view.html?id=${s.id}" class="btn btn-primary btn-sm" style="background:#0EA5E9;">Read</a>
        </div>
      </div>
    `).join('');
    grid.querySelectorAll('.del-summary').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this summary?')) return;
        await apiFetch(`/api/summaries/${btn.dataset.id}`, { method: 'DELETE' });
        showToast('Summary deleted', 'success');
        loadSummaries();
      });
    });
  } catch { document.getElementById('summariesLoading').style.display = 'none'; }
}
