/*
 * head.js runs synchronously in <head>, before any CSS is applied.
 *
 * 1. Restores an explicit theme preference (light/dark) so the first paint
 *    is already correct. No stored preference means "system", which the CSS
 *    handles on its own through `color-scheme: light dark` and light-dark().
 * 2. Applies the active brand (config/site.config.js + config/brands.js):
 *    custom properties for colours, fonts and shape, the favicon, and the
 *    font stylesheet.
 *
 * Keep this file small. Everything else is deferred ES modules in js/main.js.
 */
(function () {
  var root = document.documentElement;
  var cfg = window.SITE_CONFIG || {};
  var key = cfg.themeStorageKey || 'theme';

  var pref = null;
  try {
    pref = localStorage.getItem(key);
    if (pref === 'light' || pref === 'dark') root.setAttribute('data-theme', pref);
    else pref = null;
  } catch (e) { /* storage unavailable: fall through to system */ }

  /* The theme that is actually showing. CSS handles colours on its own via
     light-dark(); this attribute exists for things CSS cannot branch on,
     such as which logo file to show. js/theme.js keeps it up to date. */
  var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  root.setAttribute('data-resolved-theme', pref || (systemDark ? 'dark' : 'light'));

  function kebab(s) { return s.replace(/[A-Z]/g, function (m) { return '-' + m.toLowerCase(); }); }

  var BrandTokens = {
    /* Custom-property declarations for one brand, as a cssText string. */
    toStyle: function (brand) {
      var out = [];
      ['light', 'dark'].forEach(function (mode) {
        var set = (brand.colors && brand.colors[mode]) || {};
        Object.keys(set).forEach(function (k) {
          out.push('--brand-' + mode + '-' + kebab(k) + ':' + set[k]);
        });
      });
      var f = brand.fonts || {};
      if (f.display) out.push('--font-display:' + f.display);
      if (f.body) out.push('--font-body:' + f.body);
      if (f.displayWeight) out.push('--font-display-weight:' + f.displayWeight);
      if (f.displayTracking) out.push('--font-display-tracking:' + f.displayTracking);
      var s = brand.shape || {};
      if (s.radiusSm) out.push('--radius-sm:' + s.radiusSm);
      if (s.radius) out.push('--radius:' + s.radius);
      if (s.radiusLg) out.push('--radius-lg:' + s.radiusLg);
      if (s.button) out.push('--radius-button:' + s.button);
      return out.join(';') + ';';
    },
    apply: function (el, brand) {
      el.style.cssText += BrandTokens.toStyle(brand);
      el.setAttribute('data-brand', brand.id);
    },
    loadFonts: function (brand) {
      var href = brand.fonts && brand.fonts.stylesheet;
      if (!href || document.querySelector('link[href="' + href + '"]')) return;
      if (!document.querySelector('link[rel="preconnect"][href="https://fonts.gstatic.com"]')) {
        ['https://fonts.googleapis.com', 'https://fonts.gstatic.com'].forEach(function (origin) {
          var pre = document.createElement('link');
          pre.rel = 'preconnect';
          pre.href = origin;
          if (origin.indexOf('gstatic') > -1) pre.crossOrigin = 'anonymous';
          document.head.appendChild(pre);
        });
      }
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
  };
  window.BrandTokens = BrandTokens;

  var brand = window.BRANDS && window.BRANDS[cfg.brand];
  if (!brand) return;
  window.ACTIVE_BRAND = brand;
  BrandTokens.apply(root, brand);
  BrandTokens.loadFonts(brand);

  if (brand.mark && brand.mark.src) {
    var icon = document.createElement('link');
    icon.rel = 'icon';
    icon.type = 'image/svg+xml';
    icon.href = brand.mark.src;
    document.head.appendChild(icon);
  }
})();
