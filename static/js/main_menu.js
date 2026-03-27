'use strict';

function getCsrf() {
    return document.querySelector('meta[name="csrf-token"]').getAttribute('content');
}

function showToast(msg, type = 'success') {
    const container = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.textContent = msg;
    container.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 200);
    }, 3200);
}

window.addEventListener('DOMContentLoaded', () => {
    const msg = sessionStorage.getItem('veil_toast');
    const type = sessionStorage.getItem('veil_toast_type') || 'success';
    if (msg) {
        sessionStorage.removeItem('veil_toast');
        sessionStorage.removeItem('veil_toast_type');
        showToast(msg, type);
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    try {
        await fetch('/logout/', {
            method: 'POST',
            headers: { 'X-CSRFToken': getCsrf() },
        });
    } catch { }

    sessionStorage.setItem('veil_logout', '1');
    window.location.href = '/?modal=login';
});