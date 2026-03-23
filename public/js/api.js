/**
 * Shared API helper — attaches JWT and handles auth errors globally.
 */

const BASE = '';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('sf_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(BASE + path, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('sf_token');
    localStorage.removeItem('sf_user');
    window.location.href = '/';
    return;
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

function getUser() {
  try { return JSON.parse(localStorage.getItem('sf_user')); }
  catch { return null; }
}

function requireAuth() {
  if (!localStorage.getItem('sf_token')) window.location.href = '/';
}

function logout() {
  localStorage.removeItem('sf_token');
  localStorage.removeItem('sf_user');
  window.location.href = '/';
}

function showToast(message, type = '') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.textContent = message;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3000);
}

function urlParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}
