requireAuth();

const sessionId = urlParam('id');
if (!sessionId) window.location.href = '/examiner.html';

// ── DOM refs ───────────────────────────────────────────────
const sessionLoading      = document.getElementById('sessionLoading');
const sessionMain         = document.getElementById('sessionMain');
const chatMessages        = document.getElementById('chatMessages');
const streamingIndicator  = document.getElementById('streamingIndicator');
const answerInput         = document.getElementById('answerInput');
const submitBtn           = document.getElementById('submitBtn');
const inputArea           = document.getElementById('inputArea');
const gapAnalysisEl       = document.getElementById('gapAnalysis');
const topMaterialName     = document.getElementById('topMaterialName');
const topDiffBadge        = document.getElementById('topDiffBadge');
const topQCounter         = document.getElementById('topQCounter');
const endConfirmOverlay   = document.getElementById('endConfirmOverlay');

// ── State ──────────────────────────────────────────────────
let session       = null;
let isStreaming   = false;
let sessionEnded  = false;
let exchangeCount = 0;

const DIFF_COLORS = { standard: '#3B82F6', hard: '#F59E0B', brutal: '#EF4444' };
const DIFF_LABELS = { standard: 'Standard', hard: 'Hard', brutal: 'Brutal' };

// ── Quality detection (client-side) ───────────────────────
function detectQuality(answer) {
  const isVague = answer.length < 80 ||
    /\bi think\b|\bmaybe\b|\bnot sure\b|\bkind of\b|\bsort of\b/i.test(answer);
  // We don't have extractedText client-side, so skip quote check
  if (isVague) return 'vague';
  if (answer.length > 200) return 'solid';
  return 'partial';
}

// ── Render a chat message ─────────────────────────────────
function appendMessage(role, content, quality) {
  const wrap = document.createElement('div');
  wrap.className = role === 'assistant' ? 'msg-examiner' : 'msg-student';
  wrap.dataset.role = role;

  const bubble = document.createElement('div');
  bubble.className = role === 'assistant' ? 'msg-bubble-examiner' : 'msg-bubble-student';
  bubble.style.whiteSpace = 'pre-wrap';
  bubble.textContent = content;

  // Quality pill for student messages
  if (role === 'user' && quality) {
    const pill = document.createElement('div');
    pill.className = `quality-pill quality-${quality}`;
    const labels = { solid: 'Solid', partial: 'Partial', vague: 'Vague', wrong: 'Needs work', quote: 'Quote' };
    pill.textContent = labels[quality] || quality;
    wrap.appendChild(bubble);
    wrap.appendChild(pill);
  } else {
    wrap.appendChild(bubble);
  }

  chatMessages.appendChild(wrap);
  scrollToBottom();
  return bubble; // return bubble so we can update it during streaming
}

function scrollToBottom() {
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
}

// ── Update top bar ─────────────────────────────────────────
function updateTopBar() {
  topMaterialName.textContent = session.material_name || 'Exam';
  const diff = session.difficulty;
  topDiffBadge.textContent   = DIFF_LABELS[diff] || diff;
  topDiffBadge.style.background = (DIFF_COLORS[diff] || '#3B82F6') + '22';
  topDiffBadge.style.color      = DIFF_COLORS[diff] || '#3B82F6';
  updateQCounter();
}

function updateQCounter() {
  topQCounter.textContent = `Q ${exchangeCount} / ${session.question_count}`;
}

// ── Stream a message ───────────────────────────────────────
async function streamMessage(userContent, triggerGapAnalysis = false) {
  if (isStreaming) return;
  isStreaming = true;

  setInputEnabled(false);
  streamingIndicator.style.display = 'flex';

  // Create placeholder bubble for streaming
  const wrap   = document.createElement('div');
  wrap.className = 'msg-examiner';
  const bubble = document.createElement('div');
  bubble.className   = 'msg-bubble-examiner';
  bubble.style.whiteSpace = 'pre-wrap';
  bubble.textContent = '';
  wrap.appendChild(bubble);
  chatMessages.appendChild(wrap);
  scrollToBottom();

  let fullText = '';

  try {
    const res = await fetch(`/api/examiner/sessions/${sessionId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sb_token')}`
      },
      body: JSON.stringify({ content: userContent, triggerGapAnalysis })
    });

    if (!res.ok) {
      bubble.textContent = 'Error connecting to The Examiner. Please refresh and try again.';
      isStreaming = false;
      return;
    }

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();
    let   buffer  = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop(); // keep incomplete line

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const payload = line.slice(6);
        if (payload === '[DONE]') break;
        try {
          const { text, error } = JSON.parse(payload);
          if (error) { bubble.textContent = 'Error: ' + error; break; }
          if (text) {
            fullText += text;
            bubble.textContent = fullText;
            scrollToBottom();
          }
        } catch { /* malformed chunk */ }
      }
    }

    // After stream complete
    streamingIndicator.style.display = 'none';

    // Check for gap analysis
    const gapMatch = fullText.match(/---GAP_ANALYSIS_START---([\s\S]*?)---GAP_ANALYSIS_END---/);
    if (gapMatch || triggerGapAnalysis) {
      // Hide the raw gap analysis text bubble
      if (gapMatch) wrap.style.display = 'none';
      const gap = gapMatch ? parseGapAnalysis(fullText) : null;
      if (gap) showGapAnalysis(gap);
      endSession();
      return;
    }

    exchangeCount++;
    updateQCounter();

    // Auto-trigger gap analysis when question limit reached
    if (exchangeCount >= session.question_count) {
      setTimeout(() => triggerEnd(), 800);
      return;
    }

    setInputEnabled(true);
    answerInput.focus();
  } catch (err) {
    streamingIndicator.style.display = 'none';
    bubble.textContent = 'Connection error. Please try again.';
    setInputEnabled(!sessionEnded);
  } finally {
    isStreaming = false;
  }
}

// ── Submit answer ─────────────────────────────────────────
async function submitAnswer() {
  const answer = answerInput.value.trim();
  if (!answer || isStreaming || sessionEnded) return;

  const quality = detectQuality(answer);
  appendMessage('user', answer, quality);
  answerInput.value = '';
  answerInput.style.height = 'auto';

  await streamMessage(answer, false);
}

submitBtn.addEventListener('click', submitAnswer);
answerInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    submitAnswer();
  }
});
answerInput.addEventListener('input', () => {
  answerInput.style.height = 'auto';
  answerInput.style.height = answerInput.scrollHeight + 'px';
  submitBtn.disabled = !answerInput.value.trim() || isStreaming;
});

function setInputEnabled(enabled) {
  answerInput.disabled  = !enabled;
  submitBtn.disabled    = !enabled || !answerInput.value.trim();
  inputArea.style.display = enabled ? '' : 'none';
}

// ── End session ───────────────────────────────────────────
function endSession() {
  sessionEnded = true;
  setInputEnabled(false);
  inputArea.style.display = 'none';
  streamingIndicator.style.display = 'none';
  gapAnalysisEl.style.display = '';
  scrollToBottom();
}

async function triggerEnd() {
  if (sessionEnded || isStreaming) return;
  setInputEnabled(false);
  await streamMessage('', true);
}

// ── End early dialog ──────────────────────────────────────
document.getElementById('endEarlyBtn').addEventListener('click', () => {
  if (sessionEnded) return;
  endConfirmOverlay.style.display = 'flex';
});
document.getElementById('cancelEndBtn').addEventListener('click', () => {
  endConfirmOverlay.style.display = 'none';
});
document.getElementById('confirmEndBtn').addEventListener('click', () => {
  endConfirmOverlay.style.display = 'none';
  triggerEnd();
});

// ── Gap analysis ──────────────────────────────────────────
function parseGapAnalysis(text) {
  const match = text.match(/---GAP_ANALYSIS_START---([\s\S]*?)---GAP_ANALYSIS_END---/);
  if (!match) return null;
  const block   = match[1];
  const get     = key => (block.match(new RegExp(`${key}:(.+)`))?.[1] ?? '').trim();
  const getList = key => get(key).split(',').map(s => s.trim()).filter(Boolean);
  return {
    solid:     getList('SOLID'),
    shaky:     getList('SHAKY'),
    gaps:      getList('GAPS'),
    summary:   get('SUMMARY'),
    nextSteps: getList('NEXT_STEPS')
  };
}

function showGapAnalysis(gap) {
  // Stats row
  const statsRow = document.getElementById('statsRow');
  statsRow.innerHTML = [
    { label: 'Solid', value: gap.solid.length,     color: '#10B981' },
    { label: 'Shaky', value: gap.shaky.length,     color: '#F59E0B' },
    { label: 'Gaps',  value: gap.gaps.length,      color: '#EF4444' },
    { label: 'Questions', value: exchangeCount,    color: 'var(--primary)' }
  ].map(s => `
    <div class="sb-card" style="padding:1rem;text-align:center;">
      <div style="font-size:1.5rem;font-weight:800;color:${s.color};">${s.value}</div>
      <div style="font-size:.7rem;color:var(--text-3);margin-top:.125rem;">${s.label}</div>
    </div>
  `).join('');

  // Lists
  const renderList = (items, emptyMsg) => items.length
    ? items.map(i => `<div style="padding:.25rem 0;">• ${escHtml(i)}</div>`).join('')
    : `<div style="color:var(--text-3);font-style:italic;">${emptyMsg}</div>`;

  document.getElementById('solidList').innerHTML  = renderList(gap.solid, 'None demonstrated clearly yet.');
  document.getElementById('shakyList').innerHTML  = renderList(gap.shaky, 'No shaky areas identified.');
  document.getElementById('gapList').innerHTML    = renderList(gap.gaps,  'No major gaps found.');
  document.getElementById('gapSummary').textContent = gap.summary || '—';

  const ol = document.getElementById('nextStepsList');
  ol.innerHTML = gap.nextSteps.map(s => `<li style="margin-bottom:.25rem;">${escHtml(s)}</li>`).join('');

  // Re-examine button
  document.getElementById('reExamineBtn').addEventListener('click', () => {
    const weakAreas = [...gap.shaky, ...gap.gaps].join(', ');
    sessionStorage.setItem('examiner_reexamine', JSON.stringify({
      focusArea: weakAreas,
      difficulty: session.difficulty
    }));
    window.location.href = '/examiner.html';
  });
}

// ── Init ───────────────────────────────────────────────────
async function init() {
  try {
    const data = await apiFetch(`/api/examiner/sessions/${sessionId}`);
    session = data.session;

    sessionLoading.style.display = 'none';
    sessionMain.style.display    = '';
    updateTopBar();

    // If session already has messages (resuming), render them
    if (session.messages && session.messages.length > 0) {
      exchangeCount = session.exchange_count || 0;
      for (const msg of session.messages) {
        appendMessage(msg.role, msg.content, msg.role === 'user' ? detectQuality(msg.content) : null);
      }
      if (session.completed && session.gap_analysis) {
        showGapAnalysis(session.gap_analysis);
        endSession();
      } else {
        setInputEnabled(true);
        answerInput.focus();
      }
    } else {
      // Fresh session — kick off first question
      await streamMessage('', false);
    }
  } catch (err) {
    sessionLoading.innerHTML = `<p style="color:#EF4444;">Failed to load session. <a href="/examiner.html" style="color:var(--primary);">Start a new one</a></p>`;
  }
}

// Pre-fill focus area if coming from re-examine
const reexamineData = sessionStorage.getItem('examiner_reexamine');
if (reexamineData) sessionStorage.removeItem('examiner_reexamine');

init();
