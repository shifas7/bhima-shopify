/*
 * BHIMA — calm mobile-only homepage carousels.
 *
 * Editorial and occasion rows keep their native scroll-snap interaction and
 * receive a small set of runtime clones for looping. New Arrivals reuses the
 * theme's existing Swiper instance. Nothing here runs above 767px.
 */
(function () {
  var mobileQuery = window.matchMedia('(max-width: 767px)');
  var resumeDelay = 2300;
  var advanceDelay = 4200;

  function each(list, callback) {
    Array.prototype.forEach.call(list, callback);
  }

  function addMediaChangeListener(callback) {
    if (mobileQuery.addEventListener) mobileQuery.addEventListener('change', callback);
    else if (mobileQuery.addListener) mobileQuery.addListener(callback);
  }

  function makeClone(element) {
    var clone = element.cloneNode(true);
    clone.setAttribute('data-bhima-carousel-clone', 'true');
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('data-shopify-editor-block');
    each(clone.querySelectorAll('a, button, [tabindex]'), function (control) {
      control.setAttribute('tabindex', '-1');
    });
    return clone;
  }

  function initScrollCarousel(track) {
    if (track.dataset.bhimaMobileCarousel === 'true') return;

    var originals = Array.prototype.slice.call(track.children);
    if (originals.length < 2) return;

    var state = {
      active: false,
      autoScrolling: false,
      position: 0,
      timer: null,
      resumeTimer: null,
      settleTimer: null,
      clones: [],
      all: []
    };

    function leftOf(element) {
      return element.offsetLeft - track.offsetLeft;
    }

    function scrollTo(left, behavior) {
      if (track.scrollTo) track.scrollTo({ left: left, behavior: behavior });
      else track.scrollLeft = left;
    }

    function stop() {
      if (state.timer) window.clearInterval(state.timer);
      if (state.resumeTimer) window.clearTimeout(state.resumeTimer);
      state.timer = null;
      state.resumeTimer = null;
    }

    function resumeLater() {
      stop();
      if (state.active && mobileQuery.matches) {
        state.resumeTimer = window.setTimeout(start, resumeDelay);
      }
    }

    function start() {
      stop();
      if (state.active && mobileQuery.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        state.timer = window.setInterval(advance, advanceDelay);
      }
    }

    function settle() {
      if (!state.active || state.autoScrolling) return;
      var nearest = 0;
      var distance = Infinity;
      each(state.all, function (item, index) {
        var nextDistance = Math.abs(track.scrollLeft - leftOf(item));
        if (nextDistance < distance) {
          distance = nextDistance;
          nearest = index;
        }
      });

      var startIndex = originals.length;
      var cycle = leftOf(state.all[startIndex]) - leftOf(state.all[0]);
      if (cycle > 0) {
        while (nearest < startIndex) {
          track.scrollLeft += cycle;
          nearest += originals.length;
        }
        while (nearest >= startIndex + originals.length) {
          track.scrollLeft -= cycle;
          nearest -= originals.length;
        }
      }
      state.position = nearest;
    }

    function advance() {
      if (!state.active || !mobileQuery.matches) return;
      state.autoScrolling = true;
      state.position += 1;
      scrollTo(leftOf(state.all[state.position]), 'smooth');
      window.setTimeout(function () {
        var startIndex = originals.length;
        if (state.position >= startIndex + originals.length) {
          state.position -= originals.length;
          track.scrollLeft = leftOf(state.all[state.position]);
        }
        state.autoScrolling = false;
      }, 700);
    }

    function setup() {
      if (state.active || !mobileQuery.matches) return;
      var before = originals.map(makeClone);
      var after = originals.map(makeClone);
      var beforeFragment = document.createDocumentFragment();
      var afterFragment = document.createDocumentFragment();
      each(before, function (clone) { beforeFragment.appendChild(clone); state.clones.push(clone); });
      each(after, function (clone) { afterFragment.appendChild(clone); state.clones.push(clone); });
      track.insertBefore(beforeFragment, originals[0]);
      track.appendChild(afterFragment);
      state.all = Array.prototype.slice.call(track.children);
      state.position = originals.length;
      track.scrollLeft = leftOf(state.all[state.position]);
      state.active = true;
      track.dataset.bhimaMobileCarousel = 'true';
      start();
    }

    function teardown() {
      stop();
      if (!state.active) return;
      each(state.clones, function (clone) { if (clone.parentNode === track) track.removeChild(clone); });
      state.clones = [];
      state.all = originals;
      state.active = false;
      state.autoScrolling = false;
      state.position = 0;
      track.scrollLeft = 0;
      delete track.dataset.bhimaMobileCarousel;
    }

    track.addEventListener('scroll', function () {
      if (state.autoScrolling) return;
      if (state.settleTimer) window.clearTimeout(state.settleTimer);
      state.settleTimer = window.setTimeout(settle, 100);
    }, { passive: true });
    track.addEventListener('touchstart', function () { stop(); }, { passive: true });
    track.addEventListener('touchend', resumeLater, { passive: true });
    track.addEventListener('touchcancel', resumeLater, { passive: true });
    track.addEventListener('pointerdown', function () { stop(); }, { passive: true });
    track.addEventListener('pointerup', resumeLater, { passive: true });
    track.addEventListener('pointercancel', resumeLater, { passive: true });
    track.addEventListener('mouseenter', stop, { passive: true });
    track.addEventListener('mouseleave', start, { passive: true });
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stop();
      else start();
    });

    addMediaChangeListener(function () {
      if (mobileQuery.matches) setup();
      else teardown();
    });
    setup();
  }

  function initProductCarousel(root) {
    if (root.dataset.bhimaMobileProductCarousel === 'true') return;

    var tries = 0;
    function waitForSwiper() {
      if (root.swiper) return bind(root.swiper);
      if (++tries < 60) window.setTimeout(waitForSwiper, 100);
    }

    function bind(swiper) {
      if (root.dataset.bhimaMobileProductCarousel === 'true') return;
      var state = {
        active: false,
        timer: null,
        resumeTimer: null,
        originalLoop: swiper.params.loop,
        originalBreakpoints: {},
        listenersBound: false
      };

      [320, 576].forEach(function (breakpoint) {
        if (swiper.params.breakpoints && swiper.params.breakpoints[breakpoint]) {
          state.originalBreakpoints[breakpoint] = {
            slidesPerView: swiper.params.breakpoints[breakpoint].slidesPerView,
            slidesPerGroup: swiper.params.breakpoints[breakpoint].slidesPerGroup,
            spaceBetween: swiper.params.breakpoints[breakpoint].spaceBetween
          };
        }
      });

      function stop() {
        if (state.timer) window.clearInterval(state.timer);
        if (state.resumeTimer) window.clearTimeout(state.resumeTimer);
        state.timer = null;
        state.resumeTimer = null;
      }

      function resumeLater() {
        stop();
        if (state.active && mobileQuery.matches) state.resumeTimer = window.setTimeout(start, resumeDelay);
      }

      function start() {
        stop();
        if (state.active && mobileQuery.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
          state.timer = window.setInterval(function () { swiper.slideNext(700); }, advanceDelay);
        }
      }

      function setBreakpoint() {
        if (swiper.setBreakpoint) swiper.setBreakpoint();
        swiper.update();
      }

      function setup() {
        if (state.active || !mobileQuery.matches) return;
        if (swiper.params.breakpoints) {
          [320, 576].forEach(function (breakpoint) {
            if (!swiper.params.breakpoints[breakpoint]) return;
            swiper.params.breakpoints[breakpoint].slidesPerView = 1.2;
            swiper.params.breakpoints[breakpoint].slidesPerGroup = 1;
            swiper.params.breakpoints[breakpoint].spaceBetween = 14;
          });
        }
        swiper.params.slidesPerView = 1.2;
        swiper.params.slidesPerGroup = 1;
        swiper.params.spaceBetween = 14;
        swiper.params.speed = 700;
        swiper.allowTouchMove = true;
        if (!swiper.params.loop) {
          swiper.params.loop = true;
          if (swiper.loopCreate) swiper.loopCreate();
        }
        setBreakpoint();
        state.active = true;
        root.dataset.bhimaMobileProductCarousel = 'true';
        start();
      }

      function teardown() {
        stop();
        if (!state.active) return;
        if (!state.originalLoop && swiper.params.loop && swiper.loopDestroy) swiper.loopDestroy();
        swiper.params.loop = state.originalLoop;
        Object.keys(state.originalBreakpoints).forEach(function (key) {
          var original = state.originalBreakpoints[key];
          swiper.params.breakpoints[key].slidesPerView = original.slidesPerView;
          swiper.params.breakpoints[key].slidesPerGroup = original.slidesPerGroup;
          swiper.params.breakpoints[key].spaceBetween = original.spaceBetween;
        });
        state.active = false;
        delete root.dataset.bhimaMobileProductCarousel;
        setBreakpoint();
      }

      if (!state.listenersBound) {
        ['touchStart', 'sliderFirstMove'].forEach(function (eventName) { swiper.on(eventName, stop); });
        swiper.on('touchEnd', resumeLater);
        state.listenersBound = true;
      }
      addMediaChangeListener(function () { if (mobileQuery.matches) setup(); else teardown(); });
      setup();
    }

    waitForSwiper();
  }

  function init() {
    each(document.querySelectorAll('[data-bhima-mobile-scroll-carousel]'), initScrollCarousel);
    each(document.querySelectorAll('[data-bhima-mobile-product-carousel]'), function (root) {
      if (root.closest('.bhima-new-arrivals')) initProductCarousel(root);
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
