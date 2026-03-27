'use strict';

const overlay = document.getElementById('overlay');
const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');

const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const aboutBtn = document.getElementById('aboutBtn');

const loginModal = document.getElementById('loginModal');
const signupModal = document.getElementById('signupModal');
const aboutModal = document.getElementById('aboutModal');

const switchToSignup = document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

const allModals = [settingsModal, loginModal, signupModal, aboutModal];

function openAnyModal(targetModal) {
  if (!targetModal) return;
  allModals.forEach(m => {
    if (m && m !== targetModal && m.classList.contains('open')) {
      m.classList.remove('open', 'closing');
    }
  });
  targetModal.classList.remove('closing', 'open');
  void targetModal.offsetWidth;
  targetModal.classList.add('open');
  overlay.classList.add('visible');
}

function closeAllModals() {
  allModals.forEach(m => {
    if (m && m.classList.contains('open')) {
      m.classList.remove('open');
      m.classList.add('closing');
      m.addEventListener('animationend', () => {
        m.classList.remove('closing');
      }, { once: true });
    }
  });
  overlay.classList.remove('visible');
}

if (settingsBtn) settingsBtn.addEventListener('click', () => openAnyModal(settingsModal));
if (loginBtn) loginBtn.addEventListener('click', () => openAnyModal(loginModal));
if (signupBtn) signupBtn.addEventListener('click', () => openAnyModal(signupModal));
if (aboutBtn) aboutBtn.addEventListener('click', () => openAnyModal(aboutModal));

if (switchToSignup) switchToSignup.addEventListener('click', () => openAnyModal(signupModal));
if (switchToLogin) switchToLogin.addEventListener('click', () => openAnyModal(loginModal));

document.querySelectorAll('.modalCloseBtn, #modalClose').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

if (overlay) overlay.addEventListener('click', closeAllModals);

[
  ['sl-music', 'val-music'],
  ['sl-sfx', 'val-sfx'],
].forEach(([sliderId, valId]) => {
  const slider = document.getElementById(sliderId);
  const label = document.getElementById(valId);
  if (!slider || !label) return;
  function update() {
    label.textContent = slider.value;
    slider.style.setProperty('--pct', slider.value + '%');
  }
  slider.addEventListener('input', update);
  update();
});

const eyeClosedSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12c-2.66 4.34-6.66 7-10 7s-7.34-2.66-10-7c2.66-4.34 6.66-7 10-7s7.34 2.66 10 7z"/><circle cx="12" cy="12" r="3" fill="currentColor"/><path d="M3 3l18 18"/></svg>`;
const eyeOpenSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12c-2.66 4.34-6.66 7-10 7s-7.34-2.66-10-7c2.66-4.34 6.66-7 10-7s7.34 2.66 10 7z"/><circle cx="12" cy="12" r="3" fill="currentColor"/></svg>`;

document.querySelectorAll('.toggle-password').forEach(btn => {
  btn.innerHTML = eyeClosedSVG;
  btn.addEventListener('click', () => {
    const passInput = btn.parentElement.querySelector('input');
    if (!passInput) return;
    if (passInput.type === 'password') {
      passInput.type = 'text';
      btn.innerHTML = eyeOpenSVG;
      btn.style.color = 'var(--teal)';
    } else {
      passInput.type = 'password';
      btn.innerHTML = eyeClosedSVG;
      btn.style.color = '';
    }
  });
});

const toastContainer = document.getElementById('toastContainer');

function showToast(msg, type = 'success', duration = 3200) {
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.textContent = msg;
  toastContainer.appendChild(el);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('show'));
  });
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 200);
  }, duration);
}

function setLoading(btn, label) {
  btn.disabled = true;
  btn.innerHTML = `<span class="btn-label">${label}</span><span class="btn-spinner"></span>`;
}

function clearLoading(btn, label) {
  btn.disabled = false;
  btn.innerHTML = `<span class="btn-label">${label}</span>`;
}

function getCsrf() {
  return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

async function apiFetch(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCsrf(),
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

let googleTokenClient = null;
let activeGmailLink = null;
let currentGoogleAction = 'signup';

const defaultGmailIcon = `<svg class="gmail-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="16" height="16">
  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
</svg>`;

async function handleGoogleToken(tokenResponse) {
  if (tokenResponse.error) {
    showToast('Google sign-in failed.', 'error');
    if (activeGmailLink) resetGmailLink();
    return;
  }
  
  if (activeGmailLink) {
    activeGmailLink.innerHTML = `${currentGoogleAction === 'login' ? 'LOGGING IN...' : 'CREATING...'} <span class="btn-spinner" style="display:inline-block; width:13px; height:13px; margin-left:6px; border-width:2px; padding:0;"></span>`;
    activeGmailLink.style.pointerEvents = 'none';
    
    // Disable the main form submit button to prevent double actions
    if (currentGoogleAction === 'login' && loginSubmitBtn) loginSubmitBtn.disabled = true;
    if (currentGoogleAction === 'signup' && signupSubmitBtn) signupSubmitBtn.disabled = true;
  }

  try {
    const res = await apiFetch('/auth/google/', { 
      access_token: tokenResponse.access_token,
      action: currentGoogleAction
    });
    
    if (res.success) {
      if (res.new) {
        sessionStorage.setItem('veil_registered', '1');
        window.location.href = '/?modal=login';
      } else {
        sessionStorage.setItem('veil_toast', `Welcome back, ${res.username}!`);
        sessionStorage.setItem('veil_toast_type', 'success');
        window.location.href = '/menu/';
      }
    } else {
      showToast(res.error || 'Google auth failed.', 'error');
      if (activeGmailLink) resetGmailLink();
    }
  } catch {
    showToast('Network error. Please try again.', 'error');
    if (activeGmailLink) resetGmailLink();
  }
}

function resetGmailLink() {
  activeGmailLink.innerHTML = `${currentGoogleAction === 'login' ? 'Log in' : 'Sign up'} with Gmail ${defaultGmailIcon}`;
  activeGmailLink.style.pointerEvents = 'auto';
  
  if (currentGoogleAction === 'login' && loginSubmitBtn) loginSubmitBtn.disabled = false;
  if (currentGoogleAction === 'signup' && signupSubmitBtn) signupSubmitBtn.disabled = false;
}

function initGoogleAuth() {
  const clientId = document.querySelector('meta[name="google-client-id"]')?.getAttribute('content');
  if (!clientId || typeof google === 'undefined' || !google.accounts?.oauth2) return;

  googleTokenClient = google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: 'email profile',
    callback: handleGoogleToken,
  });
}

// Handle both cases: GSI may load before or after this script
window.onGoogleLibraryLoad = initGoogleAuth;
if (typeof google !== 'undefined' && google.accounts?.oauth2) {
  initGoogleAuth();
}

document.querySelectorAll('.gmail-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    if (googleTokenClient) {
      activeGmailLink = link;
      currentGoogleAction = link.closest('#loginModal') ? 'login' : 'signup';
      googleTokenClient.requestAccessToken();
    } else {
      showToast('Google Sign-In is loading. Please try again.', 'error');
    }
  });
});

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('veil_logout')) {
    sessionStorage.removeItem('veil_logout');
    showToast('Logged out successfully.');
  }

  if (sessionStorage.getItem('veil_registered')) {
    sessionStorage.removeItem('veil_registered');
    showToast('Account created! Please log in.', 'success');
  }

  const params = new URLSearchParams(window.location.search);
  if (params.get('modal') === 'login') {
    openAnyModal(loginModal);
    window.history.replaceState({}, '', '/');
  }
});

const signupSubmitBtn = document.querySelector('#signupModal .modal-btn');

if (signupSubmitBtn) {
  signupSubmitBtn.innerHTML = `<span class="btn-label">SIGNUP</span>`;

  signupSubmitBtn.addEventListener('click', async () => {
    const username = document.getElementById('regUser').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPass').value;
    const confirm = document.getElementById('regPassConf').value;
    const month = document.getElementById('bdMonth').value;
    const day = document.getElementById('bdDay').value;
    const year = document.getElementById('bdYear').value;

    if (!username || !email || !password || !confirm || !month || !day || !year) {
      showToast('All fields are required.', 'error'); return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match.', 'error'); return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error'); return;
    }

    setLoading(signupSubmitBtn, 'CREATING...');

    try {
      const res = await apiFetch('/register/', { username, email, password, confirm, month, day, year });
      if (res.success) {
        sessionStorage.setItem('veil_registered', '1');
        window.location.href = '/?modal=login';
      } else {
        showToast(res.error || 'Registration failed.', 'error');
        clearLoading(signupSubmitBtn, 'SIGNUP');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
      clearLoading(signupSubmitBtn, 'SIGNUP');
    }
  });
}

const loginSubmitBtn = document.querySelector('#loginModal .modal-btn');

if (loginSubmitBtn) {
  loginSubmitBtn.innerHTML = `<span class="btn-label">LOGIN</span>`;

  loginSubmitBtn.addEventListener('click', async () => {
    const email = document.getElementById('logEmail').value.trim();
    const password = document.getElementById('logPass').value;

    if (!email || !password) {
      showToast('Email and password are required.', 'error'); return;
    }

    setLoading(loginSubmitBtn, 'LOGGING IN...');

    try {
      const res = await apiFetch('/login/', { email, password });
      if (res.success) {
        sessionStorage.setItem('veil_toast', `Welcome back, ${res.username}!`);
        sessionStorage.setItem('veil_toast_type', 'success');
        window.location.href = '/menu/';
      } else {
        showToast(res.error || 'Login failed.', 'error');
        clearLoading(loginSubmitBtn, 'LOGIN');
      }
    } catch {
      showToast('Network error. Please try again.', 'error');
      clearLoading(loginSubmitBtn, 'LOGIN');
    }
  });
}