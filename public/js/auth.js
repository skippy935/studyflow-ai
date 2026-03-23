// Redirect if already logged in
if (localStorage.getItem('sf_token')) window.location.href = '/dashboard.html';

const modal        = document.getElementById('authModal');
const modalTitle   = document.getElementById('modalTitle');
const modalToggle  = document.getElementById('modalToggle');
const nameField    = document.getElementById('fieldName');
const emailField   = document.getElementById('fieldEmail');
const passField    = document.getElementById('fieldPassword');
const authForm     = document.getElementById('authForm');
const authBtn      = document.getElementById('authBtn');
const authError    = document.getElementById('authError');
const openLogin    = document.getElementById('openLogin');
const openSignup   = document.getElementById('openSignup');

let mode = 'signup'; // 'login' | 'signup'

function openModal(m) {
  mode = m;
  modal.classList.add('open');
  authError.textContent = '';
  authForm.reset();
  if (mode === 'login') {
    modalTitle.textContent = 'Welcome back';
    authBtn.textContent = 'Sign In';
    nameField.closest('.field-row').style.display = 'none';
    modalToggle.innerHTML = "Don't have an account? <a href='#' id='switchMode'>Sign up free</a>";
  } else {
    modalTitle.textContent = 'Create your account';
    authBtn.textContent = 'Get Started Free';
    nameField.closest('.field-row').style.display = '';
    modalToggle.innerHTML = "Already have an account? <a href='#' id='switchMode'>Sign in</a>";
  }
  document.getElementById('switchMode').addEventListener('click', (e) => {
    e.preventDefault();
    openModal(mode === 'login' ? 'signup' : 'login');
  });
}

function closeModal() {
  modal.classList.remove('open');
}

openLogin?.addEventListener('click', (e) => { e.preventDefault(); openModal('login'); });
openSignup?.addEventListener('click', (e) => { e.preventDefault(); openModal('signup'); });

modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

authForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  authError.textContent = '';
  authBtn.disabled = true;
  authBtn.innerHTML = '<span class="spinner" style="width:16px;height:16px;border-width:2px"></span>';

  const email    = emailField.value.trim();
  const password = passField.value;
  const name     = nameField.value.trim();

  try {
    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = mode === 'login' ? { email, password } : { name, email, password };
    const data = await apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) });
    localStorage.setItem('sf_token', data.token);
    localStorage.setItem('sf_user', JSON.stringify(data.user));
    window.location.href = '/dashboard.html';
  } catch (err) {
    authError.textContent = err.message;
    authBtn.disabled = false;
    authBtn.textContent = mode === 'login' ? 'Sign In' : 'Get Started Free';
  }
});
