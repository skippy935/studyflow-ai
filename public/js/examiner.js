requireAuth();
document.getElementById('logoutBtn').addEventListener('click', logout);

// ── State ─────────────────────────────────────────────────
let extractedMaterial = null; // { text, wordCount, pageCount, fileName, fileType }
let selectedDifficulty = null;
let selectedCount = 10;

// ── Step helpers ──────────────────────────────────────────
function goStep2() {
  document.getElementById('step1').style.display = 'none';
  document.getElementById('step2').style.display = '';
  document.getElementById('dot1').classList.replace('active','done');
  document.getElementById('line1').classList.add('done');
  document.getElementById('dot2').classList.add('active');
  document.getElementById('stepLabel').textContent = 'Settings';
  renderPreview();
}

function goStep1() {
  document.getElementById('step1').style.display = '';
  document.getElementById('step2').style.display = 'none';
  document.getElementById('dot1').classList.replace('done','active');
  document.getElementById('line1').classList.remove('done');
  document.getElementById('dot2').classList.remove('active');
  document.getElementById('stepLabel').textContent = 'Upload notes';
  extractedMaterial = null;
}

// ── File upload / drag-drop ───────────────────────────────
const dropZone  = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

dropZone.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('dragging'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragging'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragging');
  const file = e.dataTransfer.files[0];
  if (file) handleFile(file);
});
fileInput.addEventListener('change', () => {
  if (fileInput.files[0]) handleFile(fileInput.files[0]);
});

async function handleFile(file) {
  showExtractError('');
  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(file.name);
  document.getElementById('dropLoading').style.display = '';
  document.getElementById('dropIdle').style.display    = 'none';
  document.getElementById('extractingLabel').textContent = isImage
    ? 'Reading notes from image…' : 'Extracting text…';

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res  = await fetch('/api/extract', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('sb_token')}` },
      body: formData
    });
    const data = await res.json();

    if (!res.ok || data.error) {
      showExtractError(data.error || 'Extraction failed');
      resetDropZone();
      return;
    }

    extractedMaterial = data;
    goStep2();
  } catch (err) {
    showExtractError('Network error. Please try again.');
  } finally {
    resetDropZone();
  }
}

function resetDropZone() {
  document.getElementById('dropLoading').style.display = 'none';
  document.getElementById('dropIdle').style.display    = '';
  fileInput.value = '';
}

function showExtractError(msg) {
  const el = document.getElementById('extractError');
  el.textContent   = msg;
  el.style.display = msg ? '' : 'none';
}

// ── Paste ─────────────────────────────────────────────────
const pasteArea    = document.getElementById('pasteArea');
const usePasteBtn  = document.getElementById('usePasteBtn');
const pasteWCLabel = document.getElementById('pasteWordCount');

pasteArea.addEventListener('input', () => {
  const words = pasteArea.value.trim().split(/\s+/).filter(Boolean).length;
  pasteWCLabel.textContent = words + ' word' + (words !== 1 ? 's' : '');
  usePasteBtn.disabled = words < 50;
});

usePasteBtn.addEventListener('click', () => {
  const text  = pasteArea.value.trim();
  const words = text.split(/\s+/).filter(Boolean).length;
  if (words < 50) { showExtractError('Please paste at least 50 words.'); return; }
  extractedMaterial = { text, wordCount: words, fileName: 'Pasted notes', fileType: 'paste' };
  goStep2();
});

// ── Preview ───────────────────────────────────────────────
function renderPreview() {
  const m = extractedMaterial;
  if (!m) return;

  const icons = { pdf: '📕', txt: '📄', md: '📝', image: '🖼️', docx: '📘', paste: '📋' };
  document.getElementById('previewIcon').textContent    = icons[m.fileType] || '📄';
  document.getElementById('previewFileName').textContent = m.fileName;

  let meta = m.wordCount.toLocaleString() + ' words';
  if (m.pageCount) meta += ` · ${m.pageCount} page${m.pageCount !== 1 ? 's' : ''}`;
  document.getElementById('previewMeta').textContent = meta;

  const preview = m.text.slice(0, 300) + (m.text.length > 300 ? '…' : '');
  document.getElementById('previewTextShort').textContent = preview;
  document.getElementById('previewTextFull').textContent  = m.text;

  document.getElementById('longNoteWarning').style.display = m.wordCount > 15000 ? '' : 'none';
}

document.getElementById('toggleFullText').addEventListener('click', function() {
  const full   = document.getElementById('previewTextFull');
  const isOpen = full.style.display !== 'none';
  full.style.display = isOpen ? 'none' : '';
  this.textContent   = isOpen ? 'Show full text ↓' : 'Hide full text ↑';
});

document.getElementById('changeFileBtn').addEventListener('click', goStep1);

// ── Difficulty selection ──────────────────────────────────
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedDifficulty = btn.dataset.diff;
    updateStartBtn();
  });
});

// ── Question count ────────────────────────────────────────
document.querySelectorAll('.qcount-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.qcount-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    const customInput = document.getElementById('customCount');
    if (btn.dataset.count === 'custom') {
      customInput.style.display = '';
      customInput.focus();
      selectedCount = parseInt(customInput.value) || 10;
    } else {
      customInput.style.display = 'none';
      selectedCount = parseInt(btn.dataset.count);
    }
    updateStartBtn();
  });
});

document.getElementById('customCount').addEventListener('input', function() {
  let v = parseInt(this.value);
  if (v < 3)  v = 3;
  if (v > 30) v = 30;
  selectedCount = v || 10;
});

// Set default question count
document.querySelector('.qcount-btn[data-count="10"]').click();

// ── Start exam ────────────────────────────────────────────
function updateStartBtn() {
  const btn = document.getElementById('startExamBtn');
  const ready = selectedDifficulty && selectedCount >= 3;
  btn.disabled       = !ready;
  btn.style.opacity  = ready ? '1' : '.4';
}

document.getElementById('startExamBtn').addEventListener('click', async () => {
  const btn = document.getElementById('startExamBtn');
  const errEl = document.getElementById('startError');
  errEl.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Starting…';

  const focusArea = document.getElementById('focusArea').value.trim();
  const m = extractedMaterial;

  try {
    const data = await apiFetch('/api/examiner/sessions', {
      method: 'POST',
      body: JSON.stringify({
        materialName:  m.fileName,
        materialType:  m.fileType,
        wordCount:     m.wordCount,
        difficulty:    selectedDifficulty,
        questionCount: selectedCount,
        focusArea:     focusArea || null,
        extractedText: m.text
      })
    });
    window.location.href = `/examiner-session.html?id=${data.sessionId}`;
  } catch (err) {
    errEl.textContent   = err.message || 'Failed to start session. Please try again.';
    errEl.style.display = '';
    btn.disabled        = false;
    btn.textContent     = 'Start The Exam';
    updateStartBtn();
  }
});
