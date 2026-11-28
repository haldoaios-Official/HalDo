/* HalDo App Dependency Monitor Pro Max — read-only runtime inventory */
(function () {
  'use strict';
  var H = window.HalDo = window.HalDo || {};
  var APP_ID = 'app-dependency-monitor';
  var APP_NAME = 'HalDo App Dependency Monitor Pro Max';
  var BUILD = '1.0.0';

  function safe(value) { return String(value == null ? '' : value); }
  function analyze(input) {
    input = input || {};
    var scripts = Array.isArray(input.scripts) ? input.scripts : [];
    var apps = Array.isArray(input.apps) ? input.apps : [];
    var routes = Array.isArray(input.routes) ? input.routes : [];
    var seenSources = Object.create(null), seenApps = Object.create(null);
    var duplicateScripts = [], duplicateApps = [], routeIssues = [];
    var localScripts = [], externalScripts = [];
    scripts.forEach(function (item, index) {
      var src = safe(item && item.src).trim();
      if (!src) return;
      var record = { src: src, index: index + 1, status: safe(item.status || 'unbekannt') };
      if (item.external) externalScripts.push(record); else localScripts.push(record);
      var key = src.split(/[?#]/)[0];
      if (seenSources[key]) duplicateScripts.push({ src: src, first: seenSources[key], duplicate: index + 1 });
      else seenSources[key] = index + 1;
    });
    apps.forEach(function (app) {
      if (!app || !app.id) return;
      var id = safe(app.id);
      if (seenApps[id]) duplicateApps.push({ id: id, first: seenApps[id], duplicate: app.name || app.n || id });
      else seenApps[id] = app.name || app.n || id;
    });
    routes.forEach(function (id) {
      var moduleName = null;
      try { moduleName = typeof input.moduleFor === 'function' ? input.moduleFor(id) : null; } catch (e) {}
      var target = moduleName && input.modules ? input.modules[moduleName] : null;
      if (!moduleName || !target || typeof target.open !== 'function') {
        routeIssues.push({ id: safe(id), module: safe(moduleName || ''), reason: !moduleName ? 'Route ohne Modulzuordnung' : 'Zielmodul fehlt oder besitzt keine open()-Funktion' });
      }
    });
    var failed = scripts.filter(function (item) { return item && item.status === 'missing'; }).map(function (item) { return { src: safe(item.src), status: 'missing' }; });
    var unknown = scripts.filter(function (item) { return item && item.status === 'unknown'; }).map(function (item) { return { src: safe(item.src), status: 'unknown' }; });
    return {
      product: APP_NAME, version: BUILD, generatedAt: new Date().toISOString(),
      summary: { scriptReferences: scripts.length, localScripts: localScripts.length, externalScripts: externalScripts.length, missingLocalScripts: failed.length, unknownLocalScripts: unknown.length, duplicateScriptReferences: duplicateScripts.length, registeredApps: apps.length, duplicateAppIds: duplicateApps.length, dispatcherRoutes: routes.length, unresolvedRoutes: routeIssues.length },
      scripts: { local: localScripts, external: externalScripts, missing: failed, unknown: unknown },
      duplicates: { scripts: duplicateScripts, appIds: duplicateApps }, unresolvedRoutes: routeIssues,
      scope: 'Read-only Prüfung der Script-Einbindungen, Registry-IDs und Dispatcher-Zielmodule. Keine vollständige Laufzeit- oder Quellcode-Abhängigkeitsanalyse.'
    };
  }
  function collectScriptTags() {
    var base = document.baseURI || window.location.href;
    return Array.prototype.map.call(document.scripts || [], function (script) {
      var raw = script.getAttribute ? script.getAttribute('src') : script.src;
      if (!raw) return null;
      var url;
      try { url = new URL(raw, base); } catch (e) { return { src: raw, status: 'unknown', external: true }; }
      var origin = window.location && window.location.origin;
      return { src: url.href, status: 'unknown', external: !!(origin && url.origin !== origin), url: url.href };
    }).filter(Boolean);
  }
  function scan() {
    var scripts = collectScriptTags();
    var checks = scripts.map(function (item) {
      if (item.external) return Promise.resolve(item);
      if (typeof window.fetch !== 'function') { item.status = 'unknown'; return Promise.resolve(item); }
      return window.fetch(item.url, { method: 'HEAD', cache: 'no-store', credentials: 'same-origin' }).then(function (response) {
        item.status = response && response.status >= 400 ? 'missing' : response && response.ok ? 'loaded' : 'unknown';
        return item;
      }).catch(function () { item.status = 'unknown'; return item; });
    });
    return Promise.all(checks).then(function (checked) {
      var registry = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured.slice() : [];
      var routeIds = [];
      try { routeIds = H.SystemV157 && typeof H.SystemV157.routes === 'function' ? H.SystemV157.routes() : []; } catch (e) {}
      return analyze({
        scripts: checked, apps: registry, routes: Array.isArray(routeIds) ? routeIds : [],
        moduleFor: function (id) { return H.SystemV157 && typeof H.SystemV157.moduleFor === 'function' ? H.SystemV157.moduleFor(id) : null; },
        modules: H
      });
    });
  }
  function download(report) {
    var blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = url; a.download = 'HalDo-App-Dependency-Report.json';
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1200);
  }
  function open() {
    var rootId = 'haldo-dependency-' + Date.now().toString(36);
    if (!H.Win || typeof H.Win.open !== 'function') return;
    H.Win.open('🧩 ' + APP_NAME, '<div id="' + rootId + '"></div>', { w: 820, h: 780 });
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (!root || !root.isConnected) return;
      root.innerHTML = '<style>.hddm{height:100%;overflow:auto;padding:16px;color:var(--text,#eaf4ff);font:13px/1.5 system-ui}.hddm h2{font-size:20px;margin-bottom:5px}.hddm .muted{opacity:.7;font-size:11px}.hddm .stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(125px,1fr));gap:8px;margin:14px 0}.hddm .stat,.hddm .panel{border:1px solid rgba(0,210,230,.22);border-radius:12px;padding:11px;background:rgba(8,30,55,.35);margin-bottom:9px}.hddm .value{font-size:22px;font-weight:800}.hddm button{border:1px solid rgba(0,210,230,.4);background:rgba(0,150,190,.15);color:inherit;border-radius:8px;padding:8px 11px;cursor:pointer;margin:8px 6px 8px 0}.hddm pre{white-space:pre-wrap;overflow-wrap:anywhere;font-size:11px;max-height:210px;overflow:auto}</style><div class="hddm"><h2>🧩 HalDo App Dependency Monitor Pro Max</h2><div class="muted">Read-only Systemprüfung · Build ' + BUILD + '</div><div class="actions"><button data-refresh>Prüfung starten</button><button data-export disabled>JSON-Bericht exportieren</button></div><div data-status>Prüfung wird vorbereitet …</div><div data-stats class="stats"></div><div data-details></div><div class="muted">Hinweis: Ein nicht erreichbarer HEAD-Test wird als „unbekannt“ ausgewiesen und nicht fälschlich als fehlende Datei gewertet. Externe Skripte werden nicht aktiv abgefragt.</div></div>';
      var report = null, status = root.querySelector('[data-status]'), stats = root.querySelector('[data-stats]'), details = root.querySelector('[data-details]'), exportButton = root.querySelector('[data-export]');
      function esc(v) { return safe(v).replace(/[&<>"']/g, function (c) { return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }
      function section(title, rows) { return '<div class="panel"><strong>' + esc(title) + '</strong><pre>' + (rows.length ? rows.map(function (x) { return esc(JSON.stringify(x)); }).join('\n') : 'Keine Auffälligkeiten erkannt.') + '</pre></div>'; }
      function render() {
        var s = report.summary;
        stats.innerHTML = [['Script-Referenzen',s.scriptReferences],['Lokale Skripte',s.localScripts],['Externe Skripte',s.externalScripts],['Fehlende Dateien',s.missingLocalScripts],['Doppelte Scripts',s.duplicateScriptReferences],['Doppelte App-IDs',s.duplicateAppIds],['Offene Routen',s.unresolvedRoutes]].map(function (x) { return '<div class="stat"><div class="muted">' + x[0] + '</div><div class="value">' + x[1] + '</div></div>'; }).join('');
        details.innerHTML = section('Fehlende lokale Dateien', report.scripts.missing) + section('Unklare Datei-Prüfungen', report.scripts.unknown) + section('Doppelte Script-Einbindungen', report.duplicates.scripts) + section('Doppelte Registry-App-IDs', report.duplicates.appIds) + section('Nicht auflösbare Dispatcher-Routen', report.unresolvedRoutes);
        status.textContent = 'Prüfung abgeschlossen · ' + report.generatedAt;
        exportButton.disabled = false;
      }
      function refresh() { status.textContent = 'Lokale Script-Dateien werden geprüft …'; exportButton.disabled = true; scan().then(function (value) { report = value; render(); }).catch(function (error) { status.textContent = 'Prüfung fehlgeschlagen: ' + safe(error && error.message || error); }); }
      root.querySelector('[data-refresh]').addEventListener('click', refresh);
      exportButton.addEventListener('click', function () { if (report) download(report); });
      refresh();
    }, 80);
  }
  H.AppDependencyMonitor = { open: open, scan: scan, analyze: analyze, version: BUILD };
  H[APP_ID] = H.AppDependencyMonitor;
  if (H.Registry && Array.isArray(H.Registry.featured) && !H.Registry.featured.some(function (item) { return item && item.id === APP_ID; })) {
    H.Registry.featured.push({ id: APP_ID, n: APP_NAME, i: '🧩' });
  }
  if (H.Master && typeof H.Master.getCategoryApps === 'function') {
    var previous = H.Master.getCategoryApps.bind(H.Master);
    H.Master.getCategoryApps = function (key) {
      var entries = previous(key) || [];
      if (key !== 'S' || entries.some(function (item) { return item.id === APP_ID; })) return entries;
      return entries.concat([{ id: APP_ID, name: APP_NAME, icon: '🧩' }]);
    };
    H.Master.namedCoreApps = H.Registry && H.Registry.featured ? H.Registry.featured.length : H.Master.namedCoreApps;
  }
  console.info(APP_NAME + ' v' + BUILD + ' bereit.');
})();
