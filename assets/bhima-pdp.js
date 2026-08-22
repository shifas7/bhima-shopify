/* ==========================================================================
   BHIMA — Luxury PDP behaviour
   Vanilla, dependency-free and strictly additive. It never removes or rebinds
   anything owned by nov-product-variants.js, nuranium.js or global.js — it only
   listens to what those scripts already emit.
   ========================================================================== */
(function () {
  'use strict';

  if (!document.querySelector('.bhima-pdp')) return;

  // Safe to include from more than one section.
  if (window.__bhimaPdpReady) return;
  window.__bhimaPdpReady = true;

  // Gates the scroll-reveal styles: without this class nothing is ever hidden.
  document.documentElement.classList.add('js-pdp');

  var root = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var smooth = reduceMotion ? 'auto' : 'smooth';

  function $(sel, ctx) { return (ctx || root).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || root).querySelectorAll(sel)); }

  /* ----------------------------------------------------------------------
     Collapsibles — price breakdown, detail toggles, policy accordions
     ---------------------------------------------------------------------- */

  function setHeight(body, open) {
    if (!body) return;
    if (open) {
      body.style.height = body.scrollHeight + 'px';
      var done = function () {
        body.style.height = 'auto';
        body.removeEventListener('transitionend', done);
      };
      body.addEventListener('transitionend', done);
    } else {
      body.style.height = body.scrollHeight + 'px';
      void body.offsetHeight;              // force reflow so the end state animates
      body.style.height = '0px';
    }
  }

  function initCollapse(toggle) {
    if (toggle.dataset.pdpCollapseBound) return;
    toggle.dataset.pdpCollapseBound = '1';

    var item = toggle.closest('[data-pdp-collapse]');
    if (!item) return;
    var body = $('[data-pdp-collapse-body]', item);
    if (!body) return;

    var group = item.getAttribute('data-pdp-collapse-group');

    if (item.classList.contains('is-open')) {
      body.style.height = 'auto';
      toggle.setAttribute('aria-expanded', 'true');
    } else {
      toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', function (event) {
      event.preventDefault();
      var willOpen = !item.classList.contains('is-open');

      if (willOpen && group) {
        $$('[data-pdp-collapse-group="' + group + '"].is-open').forEach(function (sibling) {
          if (sibling === item) return;
          sibling.classList.remove('is-open');
          var sToggle = sibling.querySelector('[data-pdp-collapse-toggle]');
          if (sToggle) sToggle.setAttribute('aria-expanded', 'false');
          setHeight(sibling.querySelector('[data-pdp-collapse-body]'), false);
        });
      }

      item.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      setHeight(body, willOpen);
    });
  }

  function initCollapses() { $$('[data-pdp-collapse-toggle]').forEach(initCollapse); }
  initCollapses();

  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      $$('[data-pdp-collapse].is-open [data-pdp-collapse-body]').forEach(function (b) { b.style.height = 'auto'; });
    }, 200);
  });

  /* ----------------------------------------------------------------------
     Gallery
     ---------------------------------------------------------------------- */

  (function gallery() {
    var el = $('[data-pdp-gallery]');
    if (!el) return;

    var track = $('[data-pdp-gallery-media]', el);
    var slides = $$('.pdp-gallery__slide', el);
    var thumbs = $$('[data-pdp-thumb]', el);
    var counter = $('[data-pdp-counter-current]', el);
    var prev = $('[data-pdp-gallery-prev]', el);
    var next = $('[data-pdp-gallery-next]', el);
    if (!track || !slides.length) return;

    var index = 0;

    function paint(i) {
      index = i;
      if (counter) counter.textContent = i + 1 < 10 ? '0' + (i + 1) : String(i + 1);
      thumbs.forEach(function (t, n) { t.classList.toggle('is-active', n === i); });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === slides.length - 1;
    }

    function goTo(i) {
      if (i < 0 || i >= slides.length) return;
      track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: smooth });
      paint(i);
    }

    thumbs.forEach(function (t, i) { t.addEventListener('click', function () { goTo(i); }); });
    if (prev) prev.addEventListener('click', function () { goTo(index - 1); });
    if (next) next.addEventListener('click', function () { goTo(index + 1); });

    var scrollTimer;
    track.addEventListener('scroll', function () {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function () {
        var mid = track.scrollLeft + track.clientWidth / 2;
        var best = Infinity, closest = 0;
        slides.forEach(function (s, i) {
          var c = s.offsetLeft - track.offsetLeft + s.offsetWidth / 2;
          var d = Math.abs(c - mid);
          if (d < best) { best = d; closest = i; }
        });
        paint(closest);
      }, 70);
    }, { passive: true });

    // nov-product-variants.js flags the variant's media with `.act`; mirror it.
    if ('MutationObserver' in window) {
      var watcher = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          if (m.attributeName !== 'class') return;
          if (!m.target.classList.contains('act')) return;
          var i = slides.indexOf(m.target);
          if (i > -1 && i !== index) goTo(i);
        });
      });
      slides.forEach(function (s) { watcher.observe(s, { attributes: true, attributeFilter: ['class'] }); });
    }

    // Deferred video: only build the player when asked for.
    $$('[data-pdp-video-play]', el).forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        var holder = button.closest('.pdp-gallery__slide');
        if (!holder) return;
        var tpl = holder.querySelector('template[data-pdp-video-source]');
        var frame = holder.querySelector('.pdp-gallery__frame');
        if (tpl && frame) {
          frame.innerHTML = tpl.innerHTML;
          var v = frame.querySelector('video');
          if (v) { v.setAttribute('controls', 'controls'); v.play().catch(function () {}); }
        }
        button.classList.add('is-hidden');
      });
    });

    // Fullscreen: hand the click to the PhotoSwipe-bound anchor.
    $$('[data-pdp-fullscreen]').forEach(function (b) {
      b.addEventListener('click', function () {
        var active = $('#proFeaturedImageZoom .item_img.act') || $('#proFeaturedImageZoom .item_img');
        if (active) active.click();
      });
    });

    paint(0);
  })();

  /* ----------------------------------------------------------------------
     Wishlist proxies
     The canonical control is the one nuranium.js binds:
     `.product-single__wishlist a[data-icon-wishlist]`. Every other heart
     proxies to it so the state can never diverge.
     ---------------------------------------------------------------------- */

  (function wishlist() {
    var canonical = $('.product-single__wishlist a[data-icon-wishlist]');
    var proxies = $$('[data-pdp-wish-proxy]');
    if (!canonical || !proxies.length) return;

    proxies.forEach(function (p) {
      p.addEventListener('click', function (e) { e.preventDefault(); canonical.click(); });
    });

    var mirror = function () {
      var on = canonical.classList.contains('whislist-added');
      proxies.forEach(function (p) { p.classList.toggle('whislist-added', on); });
    };

    mirror();
    if ('MutationObserver' in window) {
      new MutationObserver(mirror).observe(canonical, { attributes: true, attributeFilter: ['class'] });
    }
  })();

  /* ----------------------------------------------------------------------
     Size chart dialog
     A centred modal from 768px up and a bottom sheet below it — same node,
     the presentation is CSS. Closes on the scrim, the X, and Escape, locks
     the page behind it, and returns focus to whatever opened it.
     ---------------------------------------------------------------------- */

  (function sizeChart() {
    var modal = $('[data-pdp-sizechart]');
    if (!modal) return;

    var openers = $$('[data-pdp-sizechart-open]');
    if (!openers.length) return;

    var panel = $('.pdp-modal__panel', modal);
    var lastFocused = null;

    function open(opener) {
      // Remember the opener itself rather than trusting document.activeElement:
      // a click does not always move focus, and body.focus() is a no-op, which
      // would leave focus stranded inside a closed dialog.
      lastFocused = opener || document.activeElement;
      modal.hidden = false;
      // A timeout rather than rAF: this has to land even in a tab that is not
      // compositing, otherwise the panel never gets its visible state.
      setTimeout(function () { modal.classList.add('is-visible'); }, 10);
      document.body.style.overflow = 'hidden';
      if (panel) panel.focus();
    }

    function close() {
      modal.classList.remove('is-visible');
      document.body.style.overflow = '';
      setTimeout(function () { modal.hidden = true; }, 320);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    openers.forEach(function (o) {
      o.addEventListener('click', function (event) { event.preventDefault(); open(o); });
    });

    $$('[data-pdp-sizechart-close]', modal).forEach(function (c) {
      c.addEventListener('click', function (event) { event.preventDefault(); close(); });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !modal.hidden) close();
    });
  })();

  /* ----------------------------------------------------------------------
     Mobile variant bottom sheet
     ---------------------------------------------------------------------- */

  (function sheet() {
    var sheetEl = $('[data-pdp-sheet]');
    if (!sheetEl) return;

    var closers = $$('[data-pdp-sheet-close]', sheetEl);
    var lastFocused = null;

    /* The option block is a live custom element: relocate the node between the
       inline host and the sheet rather than rendering it twice, so
       nov-product-variants.js keeps a single source of truth. */
    var wrap = $('[data-pdp-options]');
    var host = $('[data-pdp-options-host]');
    var slot = $('[data-pdp-options-slot]', sheetEl);
    var phone = window.matchMedia('(max-width: 767px)');

    function place() {
      if (!wrap || !host || !slot) return;
      if (phone.matches) {
        if (host.parentNode !== slot) slot.appendChild(host);
        wrap.classList.add('has-sheet');
      } else {
        if (host.parentNode !== wrap) wrap.appendChild(host);
        wrap.classList.remove('has-sheet');
        sheetEl.classList.remove('is-open', 'is-visible');
        document.body.style.overflow = '';
      }
    }

    place();
    if (phone.addEventListener) phone.addEventListener('change', place);
    else if (phone.addListener) phone.addListener(place);

    function open() {
      lastFocused = document.activeElement;
      sheetEl.classList.add('is-open');
      requestAnimationFrame(function () { sheetEl.classList.add('is-visible'); });
      document.body.style.overflow = 'hidden';
    }

    function close() {
      sheetEl.classList.remove('is-visible');
      document.body.style.overflow = '';
      setTimeout(function () { sheetEl.classList.remove('is-open'); }, 400);
      if (lastFocused && lastFocused.focus) lastFocused.focus();
    }

    $$('[data-pdp-sheet-open]').forEach(function (o) { o.addEventListener('click', open); });
    closers.forEach(function (c) { c.addEventListener('click', close); });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && sheetEl.classList.contains('is-open')) close();
    });
  })();

  /* ----------------------------------------------------------------------
     Quantity stepper
     ---------------------------------------------------------------------- */

  $$('[data-pdp-qty]').forEach(function (widget) {
    var input = widget.querySelector('input');
    if (!input) return;

    widget.addEventListener('click', function (event) {
      var button = event.target.closest('[data-pdp-qty-step]');
      if (!button) return;
      event.preventDefault();
      var step = parseInt(button.getAttribute('data-pdp-qty-step'), 10) || 1;
      var min = parseInt(input.getAttribute('min'), 10) || 1;
      var next = (parseInt(input.value, 10) || min) + step;
      if (next < min) next = min;
      input.value = next;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  /* ----------------------------------------------------------------------
     Add-to-cart feedback
     nuranium.js owns the AJAX call; this only clears the button state it
     leaves behind so the CTA cannot get stuck.
     ---------------------------------------------------------------------- */

  /* The last add-to-cart button pressed, so a cart reply can be matched to it. */
  var atcPending = null;
  var atcTimer = null;

  function atcSettle(button, ok, message) {
    if (!button) return;
    clearTimeout(atcTimer);
    atcPending = null;

    var label = button.querySelector('[data-pdp-atc-label]');
    var original = button.dataset.pdpAtcOriginal || (label ? label.textContent : '');

    button.classList.remove('loading');
    button.classList.add(ok ? 'is-added' : 'is-failed');
    if (label) {
      label.textContent = ok
        ? (button.getAttribute('data-added-label') || 'Added')
        : (button.getAttribute('data-failed-label') || 'Unavailable');
    }

    /* The server explains why far better than we can guess — show it verbatim
       where there is room for it. */
    var holder = button.closest('form') || document;
    var errorEl = holder.querySelector('[data-pdp-atc-error]');
    if (errorEl) {
      errorEl.textContent = ok ? '' : (message || '');
      errorEl.hidden = ok || !message;
    }

    setTimeout(function () {
      button.classList.remove('is-added', 'is-failed');
      button.style.pointerEvents = '';
      if (label) label.textContent = original;
    }, ok ? 1800 : 3200);
  }

  function initAddToCartFeedback() {
    $$('[data-pdp-atc]').forEach(function (button) {
      if (button.dataset.pdpAtcBound) return;
      button.dataset.pdpAtcBound = '1';

      button.addEventListener('click', function () {
        if (button.classList.contains('is-added') || button.classList.contains('is-failed')) return;

        var label = button.querySelector('[data-pdp-atc-label]');
        if (label && !button.dataset.pdpAtcOriginal) {
          button.dataset.pdpAtcOriginal = label.textContent;
        }

        /* Drop the previous reason so it is not sitting beside a spinner while
           this attempt is in flight. */
        var priorHolder = button.closest('form') || document;
        var priorError = priorHolder.querySelector('[data-pdp-atc-error]');
        if (priorError) { priorError.textContent = ''; priorError.hidden = true; }

        /* Without .product-form__cart-submit the form posts normally and the
           page navigates to the cart, so there is no reply to wait for. */
        if (!button.classList.contains('product-form__cart-submit')) {
          setTimeout(function () { atcSettle(button, true); }, 700);
          return;
        }

        atcPending = button;
        button.classList.add('loading');

        /* Failsafe: if no cart reply is ever seen, clear the button rather
           than leaving it spinning. */
        clearTimeout(atcTimer);
        atcTimer = setTimeout(function () {
          if (atcPending === button) atcSettle(button, true);
        }, 6000);
      });
    });
  }

  /* nuranium.js owns the /cart/add.js call. jQuery fires these document-level
     events for every request it makes, so the real outcome can be observed
     without touching that file. Reporting success optimistically would tell a
     customer the piece was added when inventory had already run out. */
  if (window.jQuery) {
    window.jQuery(document).on('ajaxSuccess ajaxError', function (event, xhr, settings) {
      var url = (settings && settings.url) || '';
      if (url.indexOf('/cart/add') === -1) return;
      if (!atcPending) return;

      var ok = event.type === 'ajaxSuccess';
      var message = '';
      if (!ok) {
        try {
          var body = JSON.parse(xhr.responseText);
          message = body.description || body.message || '';
        } catch (error) { message = ''; }
      }
      atcSettle(atcPending, ok, message);
    });
  }

  initAddToCartFeedback();

  /* ----------------------------------------------------------------------
     Pincode delivery availability now lives in assets/bhima-delivery.js,
     which owns its own provider registry so the data source can be swapped
     without touching this file.
     ---------------------------------------------------------------------- */

  /* ----------------------------------------------------------------------
     Sticky Buy It Now
     There is only one Buy It Now on the page — the dynamic-checkout button
     Shopify renders inside the hero product form. The sticky button forwards
     to it rather than posting a checkout of its own, and hides itself
     whenever that button is absent or disabled (payment button switched off,
     variant sold out, or a wallet button that lives in a shadow root).
     ---------------------------------------------------------------------- */

  (function buyProxy() {
    var proxies = $$('[data-pdp-buy-proxy]');
    if (!proxies.length) return;

    var host = $('.pdp-actions .product-form__item--checkout');
    if (!host) {
      proxies.forEach(function (p) { p.parentNode.removeChild(p); });
      return;
    }

    function target() {
      return host.querySelector('.shopify-payment-button__button:not([disabled])')
        || host.querySelector('button:not([disabled])');
    }

    function sync() {
      var usable = !!target() && !host.hasAttribute('disabled');
      proxies.forEach(function (p) { p.hidden = !usable; });
    }

    proxies.forEach(function (p) {
      p.addEventListener('click', function (event) {
        event.preventDefault();
        var button = target();
        if (button) button.click();
      });
    });

    sync();
    if ('MutationObserver' in window) {
      new MutationObserver(sync).observe(host, {
        childList: true, subtree: true, attributes: true, attributeFilter: ['disabled']
      });
    }
    // The dynamic-checkout button is injected by Shopify after load.
    setTimeout(sync, 1200);
    setTimeout(sync, 4000);
  })();

  /* ----------------------------------------------------------------------
     Product rails
     ---------------------------------------------------------------------- */

  function initRails() {
    $$('[data-pdp-rail]').forEach(function (rail) {
      var track = rail.querySelector('[data-pdp-rail-track]');
      if (!track || track.dataset.pdpRailBound) return;
      track.dataset.pdpRailBound = '1';

      var prev = rail.querySelector('[data-pdp-rail-prev]');
      var next = rail.querySelector('[data-pdp-rail-next]');

      function step() {
        var first = track.firstElementChild;
        if (!first) return track.clientWidth;
        var gap = parseInt(window.getComputedStyle(track).columnGap, 10) || 14;
        return first.getBoundingClientRect().width + gap;
      }

      function refresh() {
        if (!prev || !next) return;
        var max = track.scrollWidth - track.clientWidth - 2;
        prev.disabled = track.scrollLeft <= 2;
        next.disabled = track.scrollLeft >= max;
      }

      if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: smooth }); });
      if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: smooth }); });

      track.addEventListener('scroll', refresh, { passive: true });
      window.addEventListener('resize', refresh);
      refresh();
    });
  }

  initRails();

  /* ----------------------------------------------------------------------
     Sticky purchase bar — only once the real CTA has scrolled away
     ---------------------------------------------------------------------- */

  (function stickyBar() {
    var bar = $('[data-pdp-sticky]');
    var anchor = $('[data-pdp-sticky-anchor]');
    if (!bar || !anchor) return;

    var overFooter = false;

    function update() {
      var r = anchor.getBoundingClientRect();
      bar.classList.toggle('is-shown', r.bottom < 0 && !overFooter);
    }

    var queued = false;
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; update(); });
    }, { passive: true });

    var footer = document.querySelector('.footer, #footer, [class*="nov-footer"]');
    if (footer && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          overFooter = e.isIntersecting;
          if (overFooter) bar.classList.remove('is-shown');
        });
      }, { threshold: 0 }).observe(footer);
    }

    update();
  })();

  /* ----------------------------------------------------------------------
     Scroll reveal, with a scroll-driven failsafe.
     The reveal styles keep content at opacity 0 until `.is-revealed` is added,
     so a silent observer would blank the page. The scroll sweep is a second,
     independent path to the same class.
     ---------------------------------------------------------------------- */

  var revealObserver = null;

  function initReveal() {
    var targets = $$('[data-pdp-reveal]:not([data-pdp-reveal-bound])');
    if (!targets.length) return;
    targets.forEach(function (t) { t.setAttribute('data-pdp-reveal-bound', '1'); });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (t) { t.classList.add('is-revealed'); });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-revealed');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.08, rootMargin: '0px 0px -5% 0px' });
    }

    targets.forEach(function (t) { revealObserver.observe(t); });
  }

  var sweepQueued = false;

  function sweepReveal() {
    var pending = $$('[data-pdp-reveal]:not(.is-revealed)');
    if (!pending.length) { window.removeEventListener('scroll', onScrollSweep); return; }
    pending.forEach(function (t) {
      if (t.getBoundingClientRect().top < window.innerHeight * 1.35) t.classList.add('is-revealed');
    });
  }

  function onScrollSweep() {
    if (sweepQueued) return;
    sweepQueued = true;
    requestAnimationFrame(function () { sweepQueued = false; sweepReveal(); });
  }

  function revealFailsafe() {
    window.addEventListener('scroll', onScrollSweep, { passive: true });
    setTimeout(sweepReveal, 2000);
  }

  initReveal();
  revealFailsafe();

  /* Sections that fetch their contents announce themselves when ready. */
  document.addEventListener('pdp:carousel:ready', function () {
    initRails();
    initCollapses();
    initReveal();
    revealFailsafe();
    initAddToCartFeedback();
  });

  /* ----------------------------------------------------------------------
     Keep the selected-option label in sync
     ---------------------------------------------------------------------- */

  root.addEventListener('change', function (event) {
    var input = event.target;
    if (!input || input.type !== 'radio') return;

    var fieldset = input.closest('fieldset');
    if (fieldset) {
      var label = fieldset.querySelector('.variant_current');
      if (label) label.textContent = input.value;
    }

    var trigger = $('[data-pdp-sheet-open][data-option="' + input.name + '"] .pdp-sheet-trigger__value');
    if (trigger) trigger.textContent = input.value;
  });
})();
