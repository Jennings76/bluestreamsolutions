/* ============================================================
   Blue Mic - Interactions
   ============================================================ */

(function () {
  // Build animated waveform bars
  function buildBars(target, count, opts) {
    if (!target) return;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const bar = document.createElement('span');
      bar.className = (opts && opts.className) || 'bar';
      const center = count / 2;
      const distance = Math.abs(i - center) / center;
      const base = 1 - distance * 0.55;
      const amp = base * (0.7 + Math.random() * 0.5);
      bar.style.animationDelay = (i * 0.05 + Math.random() * 0.2).toFixed(2) + 's';
      bar.style.animationDuration = (1.2 + Math.random() * 0.9).toFixed(2) + 's';
      const minH = (opts && opts.minH) || 8;
      const maxH = (opts && opts.maxH) || 90;
      bar.style.height = Math.max(minH, Math.round(amp * maxH)) + 'px';
      frag.appendChild(bar);
    }
    target.appendChild(frag);
  }

  document.addEventListener('DOMContentLoaded', function () {
    // Hero waveform behind the logo
    const heroWave = document.querySelector('.hero-mark .waveform');
    buildBars(heroWave, 40, { maxH: 44, minH: 5 });

    // iPhone mockup waveform: full-width recording screen, dense bars
    // Modulated envelope (not pure random) so the waveform reads as "speech".
    const wave = document.querySelector('.rec-wave');
    if (wave) {
      const COUNT = 70;
      for (let i = 0; i < COUNT; i++) {
        const bar = document.createElement('span');
        bar.className = 'b';
        // Speech-like envelope: combine a slow oscillation with jitter
        const t = i / COUNT;
        const env = 0.45 + 0.55 * Math.abs(Math.sin(t * Math.PI * 3.2 + 1.1));
        const jitter = 0.6 + Math.random() * 0.7;
        const h = Math.max(3, Math.round(env * jitter * 36));
        bar.style.height = h + 'px';
        bar.style.animationDelay = (i * 0.025 + Math.random() * 0.18).toFixed(2) + 's';
        bar.style.animationDuration = (1.0 + Math.random() * 1.0).toFixed(2) + 's';
        wave.appendChild(bar);
      }
    }

    // Sticky nav scroll state
    const nav = document.querySelector('.nav');
    if (nav) {
      const onScroll = () => {
        if (window.scrollY > 8) nav.classList.add('scrolled');
        else nav.classList.remove('scrolled');
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // Reveal-on-scroll
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && reveals.length) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in');
              io.unobserve(e.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
      );
      reveals.forEach((el) => io.observe(el));
    } else {
      reveals.forEach((el) => el.classList.add('in'));
    }

    // FAQ: rotate the + on open
    document.querySelectorAll('details').forEach((d) => {
      const sign = d.querySelector('summary > span:last-child');
      if (!sign) return;
      d.addEventListener('toggle', () => {
        sign.style.transform = d.open ? 'rotate(45deg)' : '';
      });
    });

    // Mobile menu toggle
    const burger = document.querySelector('.nav-burger');
    const menu = document.querySelector('.mobile-menu');
    if (burger && menu) {
      const close = () => {
        burger.setAttribute('aria-expanded', 'false');
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      };
      const open = () => {
        burger.setAttribute('aria-expanded', 'true');
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      };
      burger.addEventListener('click', () => {
        const isOpen = burger.getAttribute('aria-expanded') === 'true';
        isOpen ? close() : open();
      });
      // Close when a link is tapped
      menu.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', close);
      });
      // Close on Escape
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') close();
      });
      // Close if viewport grows back to desktop while open
      window.addEventListener('resize', () => {
        if (menu.classList.contains('open') && burger && getComputedStyle(burger).display === 'none') close();
      });
    }
  });
})();

/* Manager Dashboard: click/hover a panel to open it enlarged and centered */
document.addEventListener('DOMContentLoaded', function () {
  var lb = document.getElementById('mgrLightbox');
  if (!lb) return;
  var img = document.getElementById('mgrLightboxImg');
  var closeBtn = lb.querySelector('.mgr-lb-close');
  var hoverTimer = null;
  function openLb(src, label) {
    img.src = src; img.alt = label || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeLb() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  Array.prototype.forEach.call(document.querySelectorAll('.mgr-win, .img-zoom'), function (h) {
    h.addEventListener('click', function () {
      if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
      openLb(h.getAttribute('data-img'), h.getAttribute('aria-label'));
    });
  });
  closeBtn.addEventListener('click', closeLb);
  lb.addEventListener('click', function () { closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lb.classList.contains('open')) closeLb();
  });
});

/* Manager Dashboard coverflow carousel */
document.addEventListener('DOMContentLoaded', function () {
  var root = document.querySelector('.mgr-cf');
  if (!root) return;
  var cards = Array.prototype.slice.call(root.querySelectorAll('.mgr-cf-card'));
  var cap = root.querySelector('.mgr-cf-caption');
  var n = cards.length, i = 0, stopped = false, hovering = false;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render() {
    cards.forEach(function (c, k) {
      var off = ((k - i) % n + n) % n;
      if (off > 2) off -= n;
      c.setAttribute('data-pos', off);
      c.setAttribute('aria-label', (off === 0 ? 'Enlarge: ' : 'Show ') + c.getAttribute('data-label'));
      c.tabIndex = Math.abs(off) <= 1 ? 0 : -1;
    });
    var cur = cards[i];
    var strong = document.createElement('strong');
    strong.textContent = cur.getAttribute('data-label') + '.';
    cap.textContent = '';
    cap.appendChild(strong);
    cap.appendChild(document.createTextNode(' ' + cur.getAttribute('data-caption')));
  }
  function go(k, stop) {
    i = ((k % n) + n) % n;
    if (stop) stopped = true;
    render();
  }
  function enlarge(c) {
    var lb = document.getElementById('mgrLightbox');
    var img = document.getElementById('mgrLightboxImg');
    if (!lb || !img) return;
    img.src = c.getAttribute('data-img');
    img.alt = c.querySelector('img').alt;
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  cards.forEach(function (c, k) {
    c.addEventListener('click', function () {
      if (k === i) enlarge(c); else go(k, true);
    });
  });
  Array.prototype.forEach.call(root.querySelectorAll('.mgr-cf-arrow'), function (b) {
    b.addEventListener('click', function () { go(i + parseInt(b.getAttribute('data-dir'), 10), true); });
  });
  root.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { go(i - 1, true); e.preventDefault(); }
    if (e.key === 'ArrowRight') { go(i + 1, true); e.preventDefault(); }
  });

  var stage = root.querySelector('.mgr-cf-stage'), startX = null;
  stage.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1), true);
  });

  root.addEventListener('mouseenter', function () { hovering = true; });
  root.addEventListener('mouseleave', function () { hovering = false; });
  if (!reduce) {
    setInterval(function () {
      if (!stopped && !hovering && !document.hidden && !document.documentElement.classList.contains('mgr-lb-open')) go(i + 1, false);
    }, 13000);
  }
  render();
});

/* Enlarged image: pause background videos and hide the page behind it while open */
document.addEventListener('DOMContentLoaded', function () {
  var lb = document.getElementById('mgrLightbox');
  if (!lb || !window.MutationObserver) return;
  var root = document.documentElement;
  var paused = [];
  var wasOpen = false;
  function sync() {
    var open = lb.classList.contains('open');
    if (open === wasOpen) return;
    wasOpen = open;
    if (open) {
      root.classList.add('mgr-lb-open');
      paused = Array.prototype.filter.call(document.querySelectorAll('video'), function (v) { return !v.paused; });
      paused.forEach(function (v) { v.pause(); });
    } else {
      root.classList.remove('mgr-lb-open');
      paused.forEach(function (v) {
        var p = v.play();
        if (p && typeof p.catch === 'function') p.catch(function () {});
      });
      paused = [];
    }
  }
  new MutationObserver(sync).observe(lb, { attributes: true, attributeFilter: ['class'] });
});
