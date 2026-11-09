/* Dax Landess portfolio — small progressive enhancements.
   Every feature here has a no-JavaScript fallback in the HTML:
   - nav links are always visible without JS
   - comparison images link to the alternate image
   - gallery images link to the full-size file
   - reel chapters link to the video file at that time */
(function () {
  'use strict';
  var doc = document;
  doc.documentElement.classList.add('js');

  /* ---------- Mobile navigation ---------- */
  var toggle = doc.querySelector('.nav-toggle');
  var nav = doc.getElementById('site-nav');
  if (toggle && nav) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    };
    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setOpen(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  /* ---------- Comparison toggle (e.g. capstone Style: Off / Retro pixel) ---------- */
  doc.querySelectorAll('[data-compare]').forEach(function (root) {
    var group = root.querySelector('.segmented');
    var status = root.querySelector('[data-compare-status]');
    if (!group) return;
    group.hidden = false;
    var buttons = group.querySelectorAll('button[data-state]');
    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var state = btn.getAttribute('data-state');
        root.setAttribute('data-state', state);
        buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        if (status) status.textContent = btn.getAttribute('data-announce') || '';
      });
    });
  });

  /* ---------- Lightbox for gallery images ---------- */
  var links = Array.prototype.slice.call(doc.querySelectorAll('a.zoom'));
  if (links.length && typeof HTMLDialogElement === 'function') {
    var dlg, imgEl, capEl, countEl, prevBtn, nextBtn, current = -1, group = [], opener = null;

    var build = function () {
      dlg = doc.createElement('dialog');
      dlg.className = 'lightbox';
      dlg.setAttribute('aria-label', 'Image viewer');
      dlg.innerHTML =
        '<div class="lightbox__inner">' +
          '<div class="lightbox__bar">' +
            '<span class="lightbox__count" aria-live="polite"></span>' +
            '<div class="lightbox__nav">' +
              '<button type="button" data-lb="prev" aria-label="Previous image">←</button>' +
              '<button type="button" data-lb="next" aria-label="Next image">→</button>' +
              '<button type="button" data-lb="close">Close</button>' +
            '</div>' +
          '</div>' +
          '<div class="lightbox__figure"><img alt=""></div>' +
          '<p class="lightbox__caption"></p>' +
        '</div>';
      doc.body.appendChild(dlg);
      imgEl = dlg.querySelector('img');
      capEl = dlg.querySelector('.lightbox__caption');
      countEl = dlg.querySelector('.lightbox__count');
      prevBtn = dlg.querySelector('[data-lb="prev"]');
      nextBtn = dlg.querySelector('[data-lb="next"]');
      dlg.querySelector('[data-lb="close"]').addEventListener('click', function () { dlg.close(); });
      prevBtn.addEventListener('click', function () { show(current - 1); });
      nextBtn.addEventListener('click', function () { show(current + 1); });
      dlg.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
      });
      // click on the dark area (not the image or controls) closes
      dlg.addEventListener('click', function (e) {
        if (e.target === dlg || e.target.classList.contains('lightbox__figure')) dlg.close();
      });
      dlg.addEventListener('close', function () {
        imgEl.removeAttribute('src');
        if (opener) opener.focus();
      });
    };

    var captionFor = function (a) {
      if (a.getAttribute('data-caption')) return a.getAttribute('data-caption');
      var fig = a.closest('figure');
      var cap = fig && fig.querySelector('figcaption');
      return cap ? cap.textContent.trim() : '';
    };

    var show = function (i) {
      if (!group.length) return;
      current = (i + group.length) % group.length;
      var a = group[current];
      var thumb = a.querySelector('img');
      imgEl.src = a.getAttribute('href');
      imgEl.alt = thumb ? thumb.alt : '';
      capEl.textContent = captionFor(a);
      countEl.textContent = group.length > 1 ? (current + 1) + ' / ' + group.length : '';
      prevBtn.hidden = nextBtn.hidden = group.length < 2;
    };

    links.forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        if (!dlg) build();
        var name = a.getAttribute('data-group');
        group = name ? links.filter(function (l) { return l.getAttribute('data-group') === name; }) : [a];
        opener = a;
        show(group.indexOf(a));
        dlg.showModal();
        dlg.querySelector('[data-lb="close"]').focus();
      });
    });
  }

  /* ---------- Reel chapters: seek the inline player ---------- */
  var reel = doc.getElementById('reel-video');
  if (reel) {
    doc.querySelectorAll('a[data-seek]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        e.preventDefault();
        var t = parseFloat(a.getAttribute('data-seek')) || 0;
        var go = function () { reel.currentTime = t; reel.play().catch(function () {}); };
        if (reel.readyState >= 1) go();
        else { reel.preload = 'metadata'; reel.addEventListener('loadedmetadata', go, { once: true }); reel.load(); }
        reel.scrollIntoView({ block: 'center', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        reel.focus({ preventScroll: true });
      });
    });
  }
})();
