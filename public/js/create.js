requireAuth();
document.getElementById('logoutBtn').addEventListener('click', logout);

// ── Mode selector ─────────────────────────────────────────
let mode = urlParam('mode') || 'flashcards';
const COLORS = ['#4F46E5','#7C3AED','#EC4899','#EF4444','#F59E0B','#10B981','#06B6D4','#64748B'];
let selectedColor = COLORS[0];

function initModeSelector() {
  document.querySelectorAll('.mode-card').forEach(card => {
    if (card.dataset.mode === mode) card.classList.add('selected');
    else card.classList.remove('selected');
    card.addEventListener('click', () => {
      mode = card.dataset.mode;
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('colorRow').style.display = mode === 'flashcards' ? '' : 'none';
      document.getElementById('previewSection').style.display = 'none';
    });
  });
  document.getElementById('colorRow').style.display = mode === 'flashcards' ? '' : 'none';
}

function initColorPicker() {
  const picker = document.getElementById('colorPicker');
  picker.innerHTML = COLORS.map(c => `
    <div class="color-swatch ${c === selectedColor ? 'selected' : ''}" style="background:${c}" data-color="${c}"></div>
  `).join('');
  picker.querySelectorAll('.color-swatch').forEach(s => {
    s.addEventListener('click', () => {
      selectedColor = s.dataset.color;
      picker.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('selected'));
      s.classList.add('selected');
    });
  });
}

// ── Init ──────────────────────────────────────────────────
initModeSelector();
initColorPicker();

// Sync language buttons
document.querySelectorAll('.lang-btn').forEach(b => {
  b.classList.toggle('active', b.dataset.lang === getLang());
  b.style.borderColor = b.dataset.lang === getLang() ? 'var(--primary)' : '';
  b.style.color = b.dataset.lang === getLang() ? 'var(--primary)' : '';
});

// ── Form submit ───────────────────────────────────────────
document.getElementById('createForm').addEventListener('submit', async e => {
  e.preventDefault();
  const errorMsg = document.getElementById('errorMsg');
  errorMsg.textContent = '';

  const title = document.getElementById('titleInput').value.trim();
  const desc  = document.getElementById('descInput').value.trim();
  const notes = document.getElementById('notesInput').value.trim();

  if (!title) { errorMsg.textContent = 'Please enter a title.'; return; }
  if (notes.length < 20) { errorMsg.textContent = 'Please paste at least a few sentences of notes.'; return; }

  const btn = document.getElementById('generateBtn');
  btn.disabled = true;
  btn.innerHTML = `<span class="spinner" style="width:16px;height:16px;border-width:2px;border-top-color:#fff;border-color:rgba(255,255,255,.3)"></span> Generating…`;

  try {
    if (mode === 'flashcards') await generateFlashcards(title, desc, notes);
    else if (mode === 'quiz')   await generateQuiz(title, notes);
    else if (mode === 'summary') await generateSummary(title, notes);
  } catch (err) {
    errorMsg.textContent = err.message;
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg> Generate with AI';
  }
});

// ── Generate functions ────────────────────────────────────
async function generateFlashcards(title, desc, notes) {
  const { deck, cards } = await apiFetch('/api/ai/generate', {
    method: 'POST',
    body: JSON.stringify({ name: title, description: desc, color: selectedColor, notes, language: getLang() })
  });
  showPreview(`${cards.length} flashcard${cards.length !== 1 ? 's' : ''} generated`, cards.map(c => `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem;padding:1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);" class="fade-in">
      <div>
        <div style="font-size:.65rem;font-weight:700;color:var(--text-3);text-transform:uppercase;margin-bottom:.25rem;">Front</div>
        <p style="font-size:.875rem;color:var(--text);margin:0;">${escHtml(c.front)}</p>
      </div>
      <div>
        <div style="font-size:.65rem;font-weight:700;color:var(--text-3);text-transform:uppercase;margin-bottom:.25rem;">Back</div>
        <p style="font-size:.875rem;color:var(--text-2);margin:0;">${escHtml(c.back)}</p>
      </div>
    </div>
  `).join(''),
  `/deck.html?id=${deck.id}`, `/study.html?deckId=${deck.id}`, 'Study Now →');
}

async function generateQuiz(title, notes) {
  const { quiz, questions } = await apiFetch('/api/ai/quiz-create', {
    method: 'POST',
    body: JSON.stringify({ title, topic: title, notes, language: getLang() })
  });
  showPreview(`${questions.length} question${questions.length !== 1 ? 's' : ''} generated`, questions.map((q, i) => `
    <div style="padding:1rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);" class="fade-in">
      <div style="font-size:.65rem;font-weight:700;color:#7C3AED;text-transform:uppercase;margin-bottom:.375rem;">${q.type === 'multiple_choice' ? 'Multiple Choice' : 'Open Question'}</div>
      <p style="font-size:.875rem;font-weight:600;color:var(--text);margin:0 0 .375rem;"><strong>${i+1}.</strong> ${escHtml(q.question)}</p>
      ${q.options ? `<p style="font-size:.75rem;color:var(--text-2);margin:0;">Options: ${q.options.map(o => escHtml(o)).join(' · ')}</p>` : ''}
    </div>
  `).join(''),
  `/quiz-take.html?id=${quiz.id}`, `/quiz-take.html?id=${quiz.id}`, 'Take Quiz →');
}

async function generateSummary(title, notes) {
  const { summary } = await apiFetch('/api/ai/summary-create', {
    method: 'POST',
    body: JSON.stringify({ title, topic: title, notes, language: getLang() })
  });
  const preview = summary.content.substring(0, 300) + (summary.content.length > 300 ? '…' : '');
  showPreview('Summary generated', `
    <div style="padding:1.25rem;background:var(--surface);border:1px solid var(--border);border-radius:var(--radius-sm);font-size:.875rem;color:var(--text-2);line-height:1.7;" class="fade-in">
      ${escHtml(preview)}
    </div>
  `,
  `/summary-view.html?id=${summary.id}`, `/summary-view.html?id=${summary.id}`, 'Read Summary →');
}

function showPreview(meta, html, viewUrl, actionUrl, actionLabel) {
  document.getElementById('previewMeta').textContent = meta;
  document.getElementById('previewList').innerHTML = html;
  document.getElementById('viewBtn').onclick   = () => window.location.href = viewUrl;
  document.getElementById('actionBtn').textContent = actionLabel;
  document.getElementById('actionBtn').onclick = () => window.location.href = actionUrl;
  const sec = document.getElementById('previewSection');
  sec.style.display = '';
  sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
