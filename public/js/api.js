// ── One-time key migration (sf_ → sb_) ────────────────────
if (localStorage.getItem('sf_token')) {
  localStorage.removeItem('sf_token');
  localStorage.removeItem('sf_user');
}

// ── API fetch ─────────────────────────────────────────────
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('sb_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('sb_token');
    localStorage.removeItem('sb_user');
    window.location.href = '/';
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// ── Auth helpers ──────────────────────────────────────────
function getUser() {
  try { return JSON.parse(localStorage.getItem('sb_user')); } catch { return null; }
}
function requireAuth() {
  if (!localStorage.getItem('sb_token')) window.location.href = '/';
}
function logout() {
  localStorage.removeItem('sb_token');
  localStorage.removeItem('sb_user');
  window.location.href = '/';
}

// ── URL param helper ──────────────────────────────────────
function urlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// ── Language ──────────────────────────────────────────────
function getLang() { return localStorage.getItem('sb_lang') || 'en'; }
function setLang(l) {
  localStorage.setItem('sb_lang', l);
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === l);
  });
}

// ── Dark mode ─────────────────────────────────────────────
function initTheme() {
  const saved = localStorage.getItem('sb_theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
  updateThemeIcon(saved);
}
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('sb_theme', next);
  updateThemeIcon(next);
}
function updateThemeIcon(theme) {
  document.querySelectorAll('.theme-toggle').forEach(btn => {
    btn.innerHTML = theme === 'dark'
      ? '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>'
      : '<svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>';
  });
}

// ── Toast ─────────────────────────────────────────────────
function showToast(message, type = '') {
  document.querySelector('.toast')?.remove();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

// ── Escape HTML ───────────────────────────────────────────
function escHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Init theme on every page ──────────────────────────────
initTheme();
