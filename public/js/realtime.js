// public/js/realtime.js
// KrishiSetu realtime sync — every open page stays up to date with zero
// page refreshes.
//
// How it works:
//   1. The browser opens an EventSource on /events (Server-Sent Events).
//   2. Whenever the app data changes, the server broadcasts a `sync` event.
//   3. This script silently re-fetches the current page and swaps the
//      <main> content, then dispatches 'krishisetu:synced' so charts re-draw.
//   4. A small "Live sync" pill in the corner shows connection + last update.
//
// Safety: the swap is skipped while you are typing in a form or a dialog is
// open, so nothing you are working on is ever disturbed.

(function () {
  'use strict';

  var DEBOUNCE_MS = 250;
  var MAIN_SELECTOR = 'main.page';
  var timer = null;
  var pill = null;

  /* ------------------------- live-sync pill ------------------------- */

  function makePill() {
    pill = document.createElement('div');
    pill.id = 'ks-live-pill';
    pill.innerHTML =
      '<span class="ks-live-dot"></span>' +
      '<span class="ks-live-label">Live sync</span>' +
      '<span class="ks-live-time">connecting…</span>';
    document.body.appendChild(pill);
  }

  function setPill(text, activeClass) {
    if (!pill) makePill();
    pill.classList.add('ks-live-active', activeClass || '');
    var t = pill.querySelector('.ks-live-time');
    if (t) t.textContent = text;
    clearTimeout(setPill._h);
    setPill._h = setTimeout(function () {
      pill.classList.remove('ks-live-active');
    }, 2000);
  }

  /* --------------------------- safety guards ------------------------ */

  function isBusy() {
    var ae = document.activeElement;
    if (ae && ae !== document.body) {
      var tag = (ae.tagName || '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || ae.isContentEditable) {
        return true;
      }
    }
    if (document.querySelector('dialog[open]')) return true;
    return false;
  }

  /* ------------------------------- sync ----------------------------- */

  // Re-run inline <script> blocks that arrived with the new content
  // (e.g. window.CROP_CHART_DATA on /trends) so charts can re-render.
  function rehydrateMainScripts(doc) {
    var scripts = doc.querySelectorAll(MAIN_SELECTOR + ' script:not([src])');
    scripts.forEach(function (s) {
      try {
        new Function(s.textContent)();
      } catch (err) {
        /* best-effort — never let a script break the sync */
      }
    });
  }

  function syncNow() {
    if (isBusy()) return;

    var sep = location.search ? '&' : '?';
    var url = location.pathname + location.search + sep + '__rt=' + Date.now();

    fetch(url, {
      headers: { Accept: 'text/html', 'X-Realtime-Sync': '1' },
      credentials: 'same-origin',
    })
      .then(function (res) { return res.text(); })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var cur = document.querySelector(MAIN_SELECTOR);
        var next = doc.querySelector(MAIN_SELECTOR);
        if (!cur || !next) return;

        var scrollY = window.scrollY || 0;
        var hasCharts = !!next.querySelector('canvas');

        cur.innerHTML = next.innerHTML;
        rehydrateMainScripts(doc);

        if (hasCharts) {
          document.dispatchEvent(new CustomEvent('krishisetu:synced'));
        }
        if (doc.title) document.title = doc.title;

        window.scrollTo(0, scrollY);
        setPill(new Date().toLocaleTimeString());
      })
      .catch(function () {
        // Server is restarting — EventSource reconnects automatically.
      });
  }

  function onSyncEvent() {
    clearTimeout(timer);
    timer = setTimeout(syncNow, DEBOUNCE_MS);
  }

  /* ------------------------------ connect --------------------------- */

  function connect() {
    if (!window.EventSource) return; // ancient browsers: manual refresh

    var es = new EventSource('/events');
    es.onmessage = onSyncEvent;
    es.onopen = function () { setPill('connected'); };
    es.onerror = function () {
      if (!pill) makePill();
      var t = pill.querySelector('.ks-live-time');
      if (t) t.textContent = 'reconnecting…';
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', connect);
  } else {
    connect();
  }
})();