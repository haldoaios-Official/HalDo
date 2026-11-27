/* ================================================================
   HALDO AI OS PRO MAX — v177 Brand Core
   Unified HalDo product identity · registry naming · window titles
   No network access · preserves stable app IDs and existing modules
   ================================================================ */
(function () {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var BUILD = '177.0.0';
  if (H.BrandingV177 && H.BrandingV177.ready) return;

  var preferredNames = {
    'app-registry': 'App Center Pro',
    'ai-memory': 'Memory AI Pro',
    'avatar': 'Cyborg Avatar AI Pro',
    'fahrschule': 'Fahrschule AI Pro',
    'arztbuch': 'Arztbuch AI Pro Max',
    'music-studio': 'Musikstudio Pro Max',
    'wlan-bt': 'Cyborg Device Control Pro',
    'science-lab': 'Wissenschaftslabor Pro',
    'email': 'E-Mail Pro',
    'phone': 'Phone Pro',
    'videocall': 'Video Calls Pro'
  };

  function brandRegistry() {
    var registry = H.Registry;
    if (!registry || !Array.isArray(registry.featured)) return false;
    registry.featured.forEach(function (app) {
      if (!app || typeof app !== 'object') return;
      var id = String(app.id || '');
      var existing = String(app.n || id || 'App').trim();
      var clean = preferredNames[id] || existing.replace(/^HalDo\s+/i, '').trim();
      app.n = /^HalDo\b/i.test(clean) ? clean : 'HalDo ' + clean;
    });
    return true;
  }

  function brandWindowTitles() {
    if (!H.Win || typeof H.Win.open !== 'function' || H.Win.__v177BrandWrapped) return false;
    var originalOpen = H.Win.open;
    H.Win.open = function (title) {
      var args = Array.prototype.slice.call(arguments);
      if (typeof title === 'string' && !/\bHalDo\b/i.test(title)) {
        args[0] = 'HalDo ' + title;
      }
      return originalOpen.apply(this, args);
    };
    H.Win.__v177BrandWrapped = true;
    return true;
  }

  var registryReady = brandRegistry();
  var titleGuardReady = brandWindowTitles();

  H.Master = H.Master || {};
  H.Master.version = BUILD;
  H.Master.specDate = '2026-11-27';
  H.BrandingV177 = {
    version: BUILD,
    ready: registryReady && titleGuardReady,
    registryReady: registryReady,
    titleGuardReady: titleGuardReady,
    status: function () {
      var apps = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured : [];
      return {
        version: BUILD,
        ready: this.ready,
        appCount: apps.length,
        unbranded: apps.filter(function (app) { return !/^HalDo\b/.test(String(app.n || '')); }).map(function (app) { return app.id; }),
        windowTitleGuard: !!(H.Win && H.Win.__v177BrandWrapped)
      };
    }
  };

  console.info('[HalDo v177] Product branding and app window titles standardized.');
})();
