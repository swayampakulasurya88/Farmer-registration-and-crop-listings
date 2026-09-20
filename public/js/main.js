// public/js/main.js
// Global UI behaviour: mobile nav, dismissable alerts, confirm dialogs,
// and the role toggle on the registration form.

(function () {
  'use strict';

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  if (navToggle && mainNav) {
    navToggle.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });
    // close the menu when a link inside it is clicked
    mainNav.querySelectorAll('a').forEach((a) =>
      a.addEventListener('click', () => mainNav.classList.remove('open'))
    );
  }

  /* ---------- Dismissable alerts ---------- */
  document.querySelectorAll('.alert').forEach((alert) => {
    const close = alert.querySelector('.alert-close');
    if (close) {
      close.addEventListener('click', () => alert.remove());
    }
    // auto-dismiss after 6 seconds
    setTimeout(() => {
      if (alert.parentNode) alert.remove();
    }, 6000);
  });

  /* ---------- Confirm dialogs (data-confirm="...") ---------- */
  document.querySelectorAll('form[data-confirm]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      const message = form.getAttribute('data-confirm');
      if (message && !window.confirm(message)) {
        e.preventDefault();
      }
    });
  });

  /* ---------- Registration role toggle ---------- */
  const roleInputs = document.querySelectorAll('input[name="role"]');
  const farmerFields = document.querySelector('.farmer-only');
  const buyerFields = document.querySelector('.buyer-only');

  const syncRoleFields = (role) => {
    if (role === 'buyer') {
      farmerFields?.classList.add('hidden');
      buyerFields?.classList.remove('hidden');
    } else {
      buyerFields?.classList.add('hidden');
      farmerFields?.classList.remove('hidden');
    }
    document.querySelectorAll('.role-option').forEach((opt) => {
      const input = opt.querySelector('input');
      opt.classList.toggle('selected', input && input.checked);
    });
  };

  if (roleInputs.length) {
    roleInputs.forEach((input) =>
      input.addEventListener('change', () => syncRoleFields(input.value))
    );
    const checked = document.querySelector('input[name="role"]:checked');
    if (checked) syncRoleFields(checked.value);
  }
})();