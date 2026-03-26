requireAuth();
document.getElementById('userName').textContent = getUser()?.name || 'there';
document.getElementById('logoutBtn').addEventListener('click', logout);

// ── Tabs ──────────────────────────────────────────────────
const tabs = document.querySelectorAll('.sb-tab');
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    ['decks','quizzes','summaries','examiner'].forEach(t => {
      document.getElementById(`tab-${t}`).style.display = tab.dataset.tab === t ? '' : 'none';
    });
    if (tab.dataset.tab === 'examiner') loadExaminerSessions();
  });
});

// ── Load all ──────────────────────────────────────────────
loadAnalytics().then(() => loadDecks());
loadQuizzes();
loadSummaries();

// ── Examiner Sessions ──────────────────────────────────────
async function loadExaminerSessions() {
  try {
    const { sessions } = await apiFetch('/api/examiner/sessions');
    document.getElementById('examinerLoading').style.display = 'none';
    if (!sessions.length) { document.getElementById('examinerEmpty').style.display = ''; return; }

    const DIFF_COLORS = { standard: '#3B82F6', hard: '#F59E0B', brutal: '#EF4444' };
    const DIFF_LABELS = { standard: 'Standard', hard: 'Hard', brutal: 'Brutal' };
    const grid = document.getElementById('examinerGrid');
    grid.style.display = 'grid';
    grid.innerHTML = sessions.map(s => {
      const dc  = DIFF_COLORS[s.difficulty] || '#3B82F6';
      const dl  = DIFF_LABELS[s.difficulty] || s.difficulty;
      const date = new Date(s.created_at).toLocaleDateString(undefined, { month:'short', day:'numeric' });
      const badge = s.completed
        ? (s.gapCount > 0 ? `<span style="font-size:.7rem;font-weight:700;padding:2px 8px;background:rgba(239,68,68,.1);color:#EF4444;border-radius:999px;">${s.gapCount} gap${s.gapCount!==1?'s':''}</span>`
          : `<span style="font-size:.7rem;font-weight:700;padding:2px 8px;background:rgba(16,185,129,.1);color:#10B981;border-radius:999px;">✓ Done</span>`)
        : `<span style="font-size:.7rem;font-weight:700;padding:2px 8px;background:var(--primary-dim);color:var(--primary);border-radius:999px;">In progress</span>`;
      return `
        <div class="sb-card fade-in" style="padding:1.25rem;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.875rem;">
            <div style="width:38px;height:38px;border-radius:10px;background:#312e81;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">🎓</div>
            <div style="display:flex;align-items:center;gap:.375rem;">
              ${badge}
              <button class="btn btn-ghost btn-sm del-exam" data-id="${s.id}" style="padding:4px;color:var(--text-3);">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
          <div style="font-weight:700;color:var(--text);margin-bottom:.25rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escHtml(s.material_name)}</div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.875rem;">
            <span style="font-size:.7rem;font-weight:700;padding:2px 7px;border-radius:999px;background:${dc}22;color:${dc};">${dl}</span>
            <span style="font-size:.75rem;color:var(--text-3);">${s.exchange_count} Q · ${date}</span>
          </div>
          <div style="display:flex;justify-content:flex-end;">
            <a href="/examiner-session.html?id=${s.id}" class="btn btn-primary btn-sm" style="background:${dc};">${s.completed ? 'Review' : 'Continue'}</a>
          </div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.del-exam').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this exam session?')) return;
        await apiFetch(`/api/examiner/sessions/${btn.dataset.id}`, { method: 'DELETE' });
        showToast('Session deleted', 'success');
        loadExaminerSessions();
      });
    });
  } catch { document.getElementById('examinerLoading').style.display = 'none'; }
}

// ── Analytics (Phase 1: Anti-Cramming + Retention) ────────
let retentionMap = {}; // deckId → { week1, month1 }

async function loadAnalytics() {
  try {
    const data = await apiFetch('/api/analytics/dashboard');
    const { crammingWarnings, retentionProjections, microDoseNudges } = data;

    // Build retention lookup used by loadDecks
    retentionMap = {};
    for (const r of retentionProjections) {
      if (r.cardCount > 0) retentionMap[r.deckId] = r;
    }

    const hasWarnings = crammingWarnings.length > 0;
    const hasNudges   = microDoseNudges.length > 0;

    if (!hasWarnings && !hasNudges) return;
    document.getElementById('studyHealth').style.display = '';

    // Cramming warnings
    if (hasWarnings) {
      document.getElementById('crammingWarnings').innerHTML = crammingWarnings.map(w => `
        <div style="display:flex;gap:.875rem;align-items:flex-start;background:${w.type === 'exam_soon' ? 'rgba(239,68,68,.08)' : 'rgba(245,158,11,.08)'};border:1px solid ${w.type === 'exam_soon' ? 'rgba(239,68,68,.25)' : 'rgba(245,158,11,.25)'};border-radius:var(--radius);padding:1rem 1.125rem;margin-bottom:.75rem;">
          <div style="font-size:1.25rem;line-height:1;margin-top:.1rem">${w.type === 'exam_soon' ? '🚨' : '⚠️'}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:.875rem;color:${w.type === 'exam_soon' ? '#EF4444' : '#D97706'};margin-bottom:.2rem;">${escHtml(w.message)}</div>
            <div style="font-size:.8rem;color:var(--text-2);">${escHtml(w.suggestion)}</div>
          </div>
          <a href="/study.html?deckId=${w.deckId}" class="btn btn-sm" style="flex-shrink:0;background:${w.type === 'exam_soon' ? '#EF4444' : '#D97706'};color:#fff;padding:.375rem .75rem;">Study Now</a>
        </div>
      `).join('');
    }

    // Micro-dose nudges
    if (hasNudges) {
      document.getElementById('microDoseNudges').innerHTML = `
        <div style="background:var(--surface);border:1px solid var(--border);border-radius:var(--radius);padding:1rem 1.125rem;margin-bottom:.75rem;">
          <div style="font-size:.75rem;font-weight:700;color:var(--primary);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem;">⚡ 2-Min Quick Reviews</div>
          <div style="display:flex;flex-wrap:wrap;gap:.5rem;">
            ${microDoseNudges.map(n => `
              <a href="/study.html?deckId=${n.deckId}" style="display:flex;align-items:center;gap:.5rem;padding:.375rem .75rem;border-radius:999px;background:var(--primary-dim);color:var(--primary);font-size:.8rem;font-weight:600;text-decoration:none;">
                <span style="width:8px;height:8px;border-radius:50%;background:${escHtml(n.deckColor)};flex-shrink:0;"></span>
                ${escHtml(n.deckName)}
                <span style="opacity:.75;">${n.dueCards} due · ${n.daysSinceStudy === 999 ? 'never' : n.daysSinceStudy + 'd ago'}</span>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }
  } catch { /* analytics are non-critical */ }
}

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
        ${retentionMap[d.id] ? `
        <div style="margin-bottom:.875rem;">
          <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text-3);margin-bottom:.3rem;">
            <span>Retention in 1 week</span><span style="font-weight:700;color:${retentionMap[d.id].week1 >= 70 ? '#22C55E' : retentionMap[d.id].week1 >= 40 ? '#F59E0B' : '#EF4444'}">${retentionMap[d.id].week1}%</span>
          </div>
          <div style="height:4px;background:var(--border);border-radius:999px;overflow:hidden;">
            <div style="height:100%;width:${retentionMap[d.id].week1}%;background:${retentionMap[d.id].week1 >= 70 ? '#22C55E' : retentionMap[d.id].week1 >= 40 ? '#F59E0B' : '#EF4444'};border-radius:999px;transition:width .4s ease;"></div>
          </div>
          <div style="display:flex;justify-content:space-between;font-size:.7rem;color:var(--text-3);margin-top:.4rem;margin-bottom:.3rem;">
            <span>Retention in 1 month</span><span style="font-weight:700;color:${retentionMap[d.id].month1 >= 50 ? '#22C55E' : retentionMap[d.id].month1 >= 25 ? '#F59E0B' : '#EF4444'}">${retentionMap[d.id].month1}%</span>
          </div>
          <div style="height:4px;background:var(--border);border-radius:999px;overflow:hidden;">
            <div style="height:100%;width:${retentionMap[d.id].month1}%;background:${retentionMap[d.id].month1 >= 50 ? '#22C55E' : retentionMap[d.id].month1 >= 25 ? '#F59E0B' : '#EF4444'};border-radius:999px;transition:width .4s ease;"></div>
          </div>
        </div>` : ''}
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

// ── Examiner Sessions ──────────────────────────────────────
async function loadExaminerSessions() {
  try {
    const { sessions } = await apiFetch('/api/examiner/sessions');
    document.getElementById('examinerLoading').style.display = 'none';
    if (!sessions.length) { document.getElementById('examinerEmpty').style.display = ''; return; }

    const DIFF_COLORS = { standard: '#3B82F6', hard: '#F59E0B', brutal: '#EF4444' };
    const DIFF_LABELS = { standard: 'Standard', hard: 'Hard', brutal: 'Brutal' };

    const grid = document.getElementById('examinerGrid');
    grid.style.display = 'grid';
    grid.innerHTML = sessions.map(s => {
      const dc   = DIFF_COLORS[s.difficulty] || '#3B82F6';
      const dl   = DIFF_LABELS[s.difficulty] || s.difficulty;
      const date = new Date(s.created_at).toLocaleDateString(undefined, { month:'short', day:'numeric' });
      const gapBadge = s.gapCount > 0
        ? `<span style="font-size:.7rem;font-weight:700;padding:2px 8px;background:rgba(239,68,68,.1);color:#EF4444;border-radius:999px;">${s.gapCount} gap${s.gapCount !== 1 ? 's' : ''}</span>`
        : `<span style="font-size:.7rem;font-weight:700;padding:2px 8px;background:rgba(16,185,129,.1);color:#10B981;border-radius:999px;">✓ Complete</span>`;
      return `
        <div class="sb-card fade-in" style="padding:1.25rem;">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.875rem;">
            <div style="width:38px;height:38px;border-radius:10px;background:${dc}22;display:flex;align-items:center;justify-content:center;font-size:1.1rem;flex-shrink:0;">🎓</div>
            <div style="display:flex;align-items:center;gap:.375rem;">
              ${s.completed ? gapBadge : `<span style="font-size:.7rem;font-weight:700;padding:2px 8px;background:var(--primary-dim);color:var(--primary);border-radius:999px;">In progress</span>`}
              <button class="btn btn-ghost btn-sm del-exam" data-id="${s.id}" style="padding:4px;color:var(--text-3);">
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
          <div style="font-weight:700;color:var(--text);margin-bottom:.25rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escHtml(s.material_name)}</div>
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.875rem;">
            <span style="font-size:.7rem;font-weight:700;padding:2px 7px;border-radius:999px;background:${dc}22;color:${dc};">${dl}</span>
            <span style="font-size:.75rem;color:var(--text-3);">${s.exchange_count} Q · ${date}</span>
          </div>
          <div style="display:flex;justify-content:flex-end;">
            <a href="/examiner-session.html?id=${s.id}" class="btn btn-primary btn-sm" style="background:${dc};">
              ${s.completed ? 'Review' : 'Continue'}
            </a>
          </div>
        </div>
      `;
    }).join('');

    grid.querySelectorAll('.del-exam').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.stopPropagation();
        if (!confirm('Delete this exam session?')) return;
        await apiFetch(`/api/examiner/sessions/${btn.dataset.id}`, { method: 'DELETE' });
        showToast('Session deleted', 'success');
        loadExaminerSessions();
      });
    });
  } catch { document.getElementById('examinerLoading').style.display = 'none'; }
}
