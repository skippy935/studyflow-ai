requireAuth();

document.getElementById('logoutBtn').addEventListener('click', logout);

const form       = document.getElementById('createForm');
const generateBtn= document.getElementById('generateBtn');
const notesArea  = document.getElementById('notes');
const colorPicker= document.getElementById('colorPicker');
const previewSec = document.getElementById('previewSection');
const previewList= document.getElementById('previewList');
const cardCount  = document.getElementById('cardCount');
const errorMsg   = document.getElementById('errorMsg');

const COLORS = ['#6366f1','#8B5CF6','#EC4899','#EF4444','#F59E0B','#10B981','#06B6D4','#64748B'];
let selectedColor = COLORS[0];

// Render color swatches
colorPicker.innerHTML = COLORS.map(c => `
  <div class="color-swatch ${c === selectedColor ? 'selected' : ''}"
       style="background:${c}" data-color="${c}" title="${c}"></div>
`).join('');

colorPicker.querySelectorAll('.color-swatch').forEach(s => {
  s.addEventListener('click', () => {
    selectedColor = s.dataset.color;
    colorPicker.querySelectorAll('.color-swatch').forEach(el => el.classList.remove('selected'));
    s.classList.add('selected');
  });
});

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  errorMsg.textContent = '';

  const name  = document.getElementById('deckName').value.trim();
  const desc  = document.getElementById('deckDesc').value.trim();
  const notes = notesArea.value.trim();

  if (!name) { errorMsg.textContent = 'Please enter a deck name.'; return; }
  if (notes.length < 20) { errorMsg.textContent = 'Please paste at least a few sentences of notes.'; return; }

  generateBtn.disabled = true;
  generateBtn.innerHTML = `
    <span class="spinner" style="width:18px;height:18px;border-width:2.5px;border-top-color:white;border-color:rgba(255,255,255,0.3)"></span>
    Generating with AI…
  `;
  previewSec.style.display = 'none';

  try {
    const { deck, cards } = await apiFetch('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ name, description: desc, color: selectedColor, notes })
    });

    cardCount.textContent = `${cards.length} flashcard${cards.length !== 1 ? 's' : ''} generated`;
    renderPreview(cards);
    previewSec.style.display = '';
    previewSec.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Store deck id for navigation
    previewSec.dataset.deckId = deck.id;

    document.getElementById('viewDeckBtn').onclick  = () => window.location.href = `/deck.html?id=${deck.id}`;
    document.getElementById('studyNowBtn').onclick  = () => window.location.href = `/study.html?deckId=${deck.id}`;

  } catch (err) {
    errorMsg.textContent = err.message;
  } finally {
    generateBtn.disabled = false;
    generateBtn.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
      Generate Flashcards with AI
    `;
  }
});

function renderPreview(cards) {
  previewList.innerHTML = cards.map((c, i) => `
    <div class="card-preview-row flex gap-4 p-4 rounded-xl border border-slate-100 bg-white fade-in items-start" data-index="${i}">
      <span class="text-xs font-semibold text-slate-400 mt-0.5 w-5 shrink-0">${i + 1}</span>
      <div class="flex-1 grid grid-cols-2 gap-4">
        <div>
          <div class="text-xs font-semibold text-slate-400 mb-1">FRONT</div>
          <p class="text-sm text-slate-800">${escHtml(c.front)}</p>
        </div>
        <div>
          <div class="text-xs font-semibold text-slate-400 mb-1">BACK</div>
          <p class="text-sm text-slate-800">${escHtml(c.back)}</p>
        </div>
      </div>
    </div>
  `).join('');
}

function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}
