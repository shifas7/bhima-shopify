/* ==========================================================================
   BHIMA — Pincode delivery availability
   --------------------------------------------------------------------------
   A small provider registry so the data source can be swapped without touching
   markup or styles. Nothing here decides serviceability on its own: every
   verdict comes from merchant-managed data (metaobject zones, section rules) or
   from an HTTP endpoint.

   Adding a provider from anywhere on the page:

     BhimaDelivery.registerProvider('shiprocket', function (pincode, config) {
       return fetch('/apps/shiprocket/serviceability?pin=' + pincode)
         .then(function (r) { return r.json(); })
         .then(BhimaDelivery.normalise);      // or return the shape yourself
     });

   A provider receives (pincode, config) and returns a result — or a Promise of
   one — in this shape. Every field is optional except `serviceable`:

     {
       serviceable: true,
       minDays: 5,
       maxDays: 10,
       freeDelivery: true,
       insured: true,
       cod: false,
       label: 'Ernakulam',
       message: 'Ships from our Kochi vault'
     }

   Returning null means "I have nothing to say about this PIN" and the next
   provider in the chain is tried.

   `BhimaDelivery.normalise(raw)` accepts the aliases an external API is likely
   to use (min_days / eta_min / days, free_delivery, is_serviceable, available,
   and a { success, data } wrapper) and returns that shape.
   ========================================================================== */
(function () {
  'use strict';

  var PIN_RE = /^[1-9][0-9]{5}$/;   // Indian PIN codes never start with 0

  var providers = {};

  function toList(raw) {
    if (Array.isArray(raw)) {
      return raw.map(function (v) { return String(v).trim(); }).filter(Boolean);
    }
    return String(raw || '')
      .split(/[,\s;|]+/)
      .map(function (v) { return v.trim(); })
      .filter(Boolean);
  }

  function matchPrefix(pincode, prefixes) {
    for (var i = 0; i < prefixes.length; i++) {
      if (pincode.indexOf(prefixes[i]) === 0) return prefixes[i];
    }
    return null;
  }

  function num(value) {
    var n = parseInt(value, 10);
    return isNaN(n) ? null : n;
  }

  function first() {
    for (var i = 0; i < arguments.length; i++) {
      var v = arguments[i];
      if (v !== undefined && v !== null && v !== '') return v;
    }
    return null;
  }

  /* Accepts whatever an external API returns and maps it onto the contract. */
  function normalise(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var d = (raw.data && typeof raw.data === 'object') ? raw.data : raw;

    var serviceable = first(
      d.serviceable, d.is_serviceable, d.isServiceable,
      d.available, d.deliverable, d.delivery_available
    );
    if (serviceable === 'true' || serviceable === 1 || serviceable === '1') serviceable = true;
    if (serviceable === 'false' || serviceable === 0 || serviceable === '0') serviceable = false;

    var minDays = num(first(d.minDays, d.min_days, d.eta_min, d.etaMin, d.days_min, d.days));
    var maxDays = num(first(d.maxDays, d.max_days, d.eta_max, d.etaMax, d.days_max, d.days));

    /* Left undefined when the payload is silent about them: the renderer then
       falls back to the merchant's own free / insured copy. Only an explicit
       false from the API suppresses those lines. */
    var free = first(d.freeDelivery, d.free_delivery, d.free_shipping, d.free);
    var insured = first(d.insured, d.is_insured, d.secure);

    return {
      serviceable: serviceable === undefined || serviceable === null ? false : !!serviceable,
      minDays: minDays,
      maxDays: maxDays,
      freeDelivery: free === null ? undefined : !!free,
      insured: insured === null ? undefined : !!insured,
      cod: !!first(d.cod, d.cod_available, d.codAvailable),
      label: first(d.label, d.city, d.district, d.zone, d.region) || '',
      message: first(d.message, d.note, d.reason) || ''
    };
  }

  /* ---------------------------------------------------------------- providers */

  /* Serviceable areas defined as Shopify metaobject entries and rendered into
     the page by snippets/pdp-delivery-check.liquid. Merchant-managed, no API. */
  providers.zones = function (pincode, config) {
    var zones = config.zones || [];
    if (!zones.length) return null;                 // nothing configured

    for (var i = 0; i < zones.length; i++) {
      var zone = zones[i];
      if (!matchPrefix(pincode, toList(zone.prefixes))) continue;
      if (zone.serviceable === false) {
        return { serviceable: false, label: zone.label || '' };
      }
      return {
        serviceable: true,
        minDays: num(zone.minDays),
        maxDays: num(zone.maxDays),
        freeDelivery: true,
        insured: true,
        cod: !!zone.cod,
        label: zone.label || ''
      };
    }
    return { serviceable: false };                  // zones exist, none matched
  };

  /* PIN-prefix rules from the section settings. */
  providers.rules = function (pincode, config) {
    var r = config.rules || {};
    var blocked = toList(r.blockedPrefixes);
    var serviceable = toList(r.serviceablePrefixes);
    var express = toList(r.expressPrefixes);

    if (blocked.length && matchPrefix(pincode, blocked)) return { serviceable: false };
    if (serviceable.length && !matchPrefix(pincode, serviceable)) return { serviceable: false };

    var days = (express.length && matchPrefix(pincode, express))
      ? num(r.expressDays)
      : num(r.standardDays);

    var spread = num(r.spread);
    if (spread === null || spread < 0) spread = 3;

    var maxDays = days;
    var minDays = days === null ? null : Math.max(1, days - spread);

    return { serviceable: true, minDays: minDays, maxDays: maxDays, freeDelivery: true, insured: true };
  };

  /* Any HTTP API. The URL may carry {pincode} / {product_id} placeholders. */
  providers.endpoint = function (pincode, config) {
    var url = config.endpoint;
    if (!url) return null;

    var method = (config.endpointMethod || 'GET').toUpperCase();
    var payload = {
      pincode: pincode,
      product_id: config.productId,
      variant_id: config.variantId,
      sku: config.sku
    };

    var options = { method: method, headers: { Accept: 'application/json' } };

    if (url.indexOf('{pincode}') > -1) {
      url = url
        .replace('{pincode}', encodeURIComponent(pincode))
        .replace('{product_id}', encodeURIComponent(config.productId || ''))
        .replace('{variant_id}', encodeURIComponent(config.variantId || ''));
    } else if (method === 'GET') {
      var query = Object.keys(payload)
        .filter(function (k) {
          return payload[k] !== null && payload[k] !== undefined && payload[k] !== '';
        })
        .map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(payload[k]); })
        .join('&');
      url += (url.indexOf('?') > -1 ? '&' : '?') + query;
    }

    if (method !== 'GET' && method !== 'HEAD') {
      options.headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(payload);
    }

    return fetch(url, options)
      .then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        return response.json();
      })
      .then(normalise);
  };

  function pick(config) {
    var wanted = config.provider || 'auto';
    if (wanted !== 'auto' && providers[wanted]) return [providers[wanted]];

    var chain = [];
    if (config.endpoint) chain.push(providers.endpoint);
    if ((config.zones || []).length) chain.push(providers.zones);
    chain.push(providers.rules);
    return chain;
  }

  /* Walks the chain and resolves to { result, failed }.
     `result: null` means no provider had an answer — which is NOT the same as
     "we do not deliver there". A dead endpoint must surface as "we couldn't
     check", never as an unserviceable verdict. */
  function resolve(pincode, config) {
    var chain = pick(config);
    var failed = false;

    function step(i) {
      if (i >= chain.length) return Promise.resolve({ result: null, failed: failed });
      var out;
      try {
        out = chain[i](pincode, config);
      } catch (error) {
        failed = true;
        return step(i + 1);
      }
      return Promise.resolve(out).then(function (result) {
        if (result === null || result === undefined) return step(i + 1);
        return { result: result, failed: failed };
      }, function () {
        failed = true;
        return step(i + 1);
      });
    }

    return step(0);
  }

  /* ------------------------------------------------------------------- view */

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var ICON_CHECK = '<svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">'
    + '<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.2"/>'
    + '<path d="M6.8 10.2 9 12.4l4.2-4.4" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  var ICON_CROSS = '<svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">'
    + '<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.2"/>'
    + '<path d="M7.5 7.5l5 5m0-5-5 5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>';

  function etaText(result, strings) {
    var min = result.minDays;
    var max = result.maxDays;
    var word = strings.daysWord || 'Days';
    if (!min && !max) return '';
    if (min && max && min !== max) return min + '–' + max + ' ' + word;
    return (max || min) + ' ' + word;
  }

  function render(el, result, strings) {
    var idle = el.querySelector('[data-bhima-delivery-idle]');
    var box = el.querySelector('[data-bhima-delivery-result]');
    if (!box) return;

    var html;

    if (!result || !result.serviceable) {
      html = '<div class="pdp-deliv__verdict is-off">' + ICON_CROSS
        + '<div><strong>' + esc((result && result.message) || strings.unserved
          || 'Delivery is currently unavailable for this pincode.') + '</strong>'
        + (result && result.label ? '<span>' + esc(result.label) + '</span>' : '')
        + '</div></div>';
    } else {
      var eta = etaText(result, strings);
      html = '<div class="pdp-deliv__verdict is-on">' + ICON_CHECK
        + '<div><strong>' + esc(strings.available || 'Delivery Available') + '</strong>'
        + (result.label ? '<span>' + esc(result.label) + '</span>' : '')
        + '</div></div>';

      if (eta) {
        html += '<div class="pdp-deliv__eta"><span>'
          + esc(strings.etaLabel || 'Estimated Delivery:')
          + '</span><b>' + esc(eta) + '</b></div>';
      }

      var notes = [];
      if (result.freeDelivery !== false && strings.free) notes.push(strings.free);
      if (result.insured !== false && strings.insured) notes.push(strings.insured);
      if (result.cod && strings.cod) notes.push(strings.cod);
      if (result.message) notes.push(result.message);

      if (notes.length) {
        html += '<ul class="pdp-deliv__notes">' + notes.map(function (n) {
          return '<li>' + esc(n) + '</li>';
        }).join('') + '</ul>';
      }
    }

    box.innerHTML = html;
    box.hidden = false;
    if (idle) idle.hidden = true;
  }

  /* Back to the idle promises. Used when a check fails: leaving the previous
     PIN's verdict on screen next to "we couldn't check" reads as an answer. */
  function reset(el) {
    var idle = el.querySelector('[data-bhima-delivery-idle]');
    var box = el.querySelector('[data-bhima-delivery-result]');
    if (box) { box.innerHTML = ''; box.hidden = true; }
    if (idle) idle.hidden = false;
  }

  function init(el) {
    if (el.dataset.bhimaDeliveryBound) return;
    el.dataset.bhimaDeliveryBound = '1';

    var config = {};
    try {
      config = JSON.parse(el.getAttribute('data-bhima-delivery') || '{}');
    } catch (error) {
      config = {};
    }
    var strings = config.strings || {};

    var form = el.querySelector('[data-bhima-delivery-form]');
    var input = el.querySelector('[data-bhima-delivery-input]');
    var submit = el.querySelector('[data-bhima-delivery-submit]');
    var errorEl = el.querySelector('[data-bhima-delivery-error]');
    if (!form || !input) return;

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message || '';
      errorEl.hidden = !message;
    }

    function busy(state) {
      el.classList.toggle('is-loading', state);
      if (submit) submit.disabled = state;
      input.setAttribute('aria-busy', state ? 'true' : 'false');
    }

    /* The pincode a visible verdict belongs to, and a counter so a slow reply
       for an abandoned pincode cannot overwrite a newer one. */
    var shownFor = null;
    var requestId = 0;

    input.addEventListener('input', function () {
      input.value = input.value.replace(/\D/g, '').slice(0, 6);
      el.classList.remove('is-invalid');
      showError('');

      // Still showing the answer for exactly this pincode — nothing to undo.
      if (input.value === shownFor) return;

      /* Editing invalidates both the verdict on screen and any reply still in
         flight: each was about a different pincode. Clear the one and abandon
         the other, rather than leaving "Delivery Available" sitting under a
         half-typed code — or letting a slow reply repaint it a moment later. */
      shownFor = null;
      requestId++;
      busy(false);
      reset(el);
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var pincode = (input.value || '').replace(/\D/g, '');

      if (!PIN_RE.test(pincode)) {
        el.classList.add('is-invalid');
        shownFor = null;
        reset(el);
        showError(strings.invalid || 'Please enter a valid 6-digit pincode.');
        input.focus();
        return;
      }

      showError('');
      busy(true);

      var token = ++requestId;
      var stale = function () { return token !== requestId; };

      resolve(pincode, config)
        .then(function (outcome) {
          if (stale()) return;
          busy(false);
          if (!outcome || outcome.result === null) {
            // Nobody could answer. Say so — do not imply we don't deliver there.
            shownFor = null;
            reset(el);
            showError(strings.error || 'Please try again.');
            return;
          }
          shownFor = pincode;
          render(el, outcome.result, strings);
        })
        .catch(function () {
          if (stale()) return;
          busy(false);
          shownFor = null;
          reset(el);
          showError(strings.error || 'Please try again.');
        });
    });
  }

  function initAll() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-bhima-delivery]'), init);
  }

  window.BhimaDelivery = {
    registerProvider: function (name, fn) { providers[name] = fn; },
    providers: providers,
    normalise: normalise,
    init: initAll,
    isValidPincode: function (value) { return PIN_RE.test(String(value || '').trim()); }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', initAll);
})();
