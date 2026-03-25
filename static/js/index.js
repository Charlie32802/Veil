// Modals and Buttons
const overlay       = document.getElementById('overlay');
const settingsBtn   = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');

const loginBtn      = document.getElementById('loginBtn');
const signupBtn     = document.getElementById('signupBtn');
const aboutBtn      = document.getElementById('aboutBtn');

const loginModal    = document.getElementById('loginModal');
const signupModal   = document.getElementById('signupModal');
const aboutModal    = document.getElementById('aboutModal');

const switchToSignup= document.getElementById('switchToSignup');
const switchToLogin = document.getElementById('switchToLogin');

const allModals = [settingsModal, loginModal, signupModal, aboutModal];

function openAnyModal(targetModal) {
  if (!targetModal) return;
  // First close any open modals without animation immediately
  allModals.forEach(m => {
    if (m && m !== targetModal && m.classList.contains('open')) {
      m.classList.remove('open', 'closing');
    }
  });

  targetModal.classList.remove('closing', 'open');
  void targetModal.offsetWidth; // force reflow
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

// Add close listeners to all close buttons
document.querySelectorAll('.modalCloseBtn, #modalClose').forEach(btn => {
  btn.addEventListener('click', closeAllModals);
});

if (overlay) overlay.addEventListener('click', closeAllModals);

// Sliders — live value + track fill
[
  ['sl-music',    'val-music'],
  ['sl-sfx',      'val-sfx'],
].forEach(([sliderId, valId]) => {
  const slider = document.getElementById(sliderId);
  const label  = document.getElementById(valId);
  if (!slider || !label) return;
  function update() {
    const pct = slider.value + '%';
    label.textContent = slider.value;
    slider.style.setProperty('--pct', pct);
  }
  slider.addEventListener('input', update);
  update(); // init
});

// Toggle password visibility
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
