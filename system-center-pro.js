/* HalDo System Center Pro — live inventory and readiness overview */
(function () {
  'use strict';
  var H = window.HalDo;
  if (!H || !H.Win || !H.Registry || !Array.isArray(H.Registry.featured)) return;

  var APP_ID = 'system-center';
  var APP_NAME = 'HalDo System Center Pro';
  var APP_ICON = '🧭';
  var FILTERS = [
    {id:'all',name:'Alle Status'},
    {id:'native',name:'Native Module'},
    {id:'dedicated',name:'Eigenständige Module'},
    {id:'generic',name:'Generische Platzhalter'},
    {id:'routeReady',name:'Route mit erkanntem Zielmodul'},
    {id:'moduleUnrouted',name:'Modul vorhanden · Route fehlt'},
    {id:'route',name:'Route ohne erkanntes Zielmodul'},
    {id:'missing',name:'Noch ohne Modul'}
  ];

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }
  function getCategories() {
    try { return H.Registry.getCategories ? H.Registry.getCategories() : {}; }
    catch (e) { return {}; }
  }
  function getRouteIds() {
    try { return H.SystemV157 && typeof H.SystemV157.routes === 'function' ? H.SystemV157.routes() : []; }
    catch (e) { return []; }
  }
  function getCategoryEntries(letter) {
    var byId = Object.create(null);
    function addAll(entries) {
      (entries || []).forEach(function (entry) {
        if (!entry || !entry.id) return;
        var id = String(entry.id);
        if (!byId[id]) byId[id] = entry;
      });
    }
    try {
      if (H.Master && typeof H.Master.getCategoryCatalogApps === 'function') {
        addAll(H.Master.getCategoryCatalogApps(letter));
      }
    } catch (e) {}
    try {
      if (H.Master && typeof H.Master.getCategoryApps === 'function') {
        addAll(H.Master.getCategoryApps(letter));
      }
    } catch (e) {}
    return Object.keys(byId).map(function (id) { return byId[id]; });
  }
  function categoryIndex() {
    var map = {};
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (letter) {
      getCategoryEntries(letter).forEach(function (entry) {
        var id = String(entry.id);
        if (!map[id]) map[id] = [];
        if (map[id].indexOf(letter) === -1) map[id].push(letter);
      });
    });
    Object.keys(map).forEach(function (id) { map[id].sort(); });
    return map;
  }
  function inspectApp(app, routeIds) {
    var routeExists = routeIds.indexOf(app.id) !== -1;
    var routeModuleName = null;
    try {
      if (H.SystemV157 && typeof H.SystemV157.moduleFor === 'function') {
        routeModuleName = H.SystemV157.moduleFor(app.id);
      }
    } catch (e) {}
    var routeTarget = routeModuleName ? H[routeModuleName] : null;

    // Match the real v157 dispatcher order: its mapped target is tried before H[app.id].
    if (routeExists && routeTarget && typeof routeTarget.open === 'function') {
      var routeSource = '';
      try { routeSource = Function.prototype.toString.call(routeTarget.open); } catch (e) {}
      if (routeTarget.__nativePro === true) {
        return {key:'native',label:'Natives Modul',detail:'Zentrale Route zeigt auf natives Modul ' + routeModuleName,moduleName:routeModuleName};
      }
      if (routeSource.indexOf('haldo_gen_') !== -1) {
        return {key:'generic',label:'Generischer Platzhalter',detail:'Zentrale Route zeigt auf generisches Modul ' + routeModuleName,moduleName:routeModuleName};
      }
      return {
        key:'routeReady',
        label:'Route-Zielmodul erkannt',
        detail:'Zentrale Launcher-Route zeigt auf ' + routeModuleName + '; open()-Methode vorhanden',
        moduleName:routeModuleName
      };
    }

    var direct = H[app.id];
    var open = direct && typeof direct.open === 'function' ? direct.open : null;
    if (open) {
      if (direct.__nativePro === true) {
        return {key:'native',label:'Natives Modul',detail:'Eigenständiges HalDo-Modul registriert',moduleName:app.id};
      }
      var source = '';
      try { source = Function.prototype.toString.call(open); } catch (e) {}
      if (source.indexOf('haldo_gen_') !== -1) {
        return {key:'generic',label:'Generischer Platzhalter',detail:'Allgemeine Eintragsverwaltung statt eigener Fach-App',moduleName:app.id};
      }
      return {key:'dedicated',label:'Eigenständiges Modul',detail:'Direkte open()-Implementierung vorhanden',moduleName:app.id};
    }

    if (routeExists) {
      return {
        key:'route',
        label:'Route ohne erkanntes Zielmodul',
        detail:routeModuleName
          ? 'Launcher-Route zeigt auf ' + routeModuleName + ', aber dort wurde keine open()-Methode erkannt'
          : 'Launcher-Route vorhanden; Zielmodul konnte nicht eindeutig aufgelöst werden',
        moduleName:routeModuleName || ''
      };
    }

    // Detect a real PascalCase module that exists but has no dispatcher entry.
    var inferredName = String(app.id).split(/[-_]/).map(function (part) {
      return part ? part.charAt(0).toUpperCase() + part.slice(1) : '';
    }).join('');
    var inferred = inferredName ? H[inferredName] : null;
    if (inferred && typeof inferred.open === 'function') {
      return {
        key:'moduleUnrouted',
        label:'Modul vorhanden · Route fehlt',
        detail:'Modul ' + inferredName + ' besitzt open(), ist aber nicht in der zentralen App-Route verdrahtet',
        moduleName:inferredName
      };
    }
    return {key:'missing',label:'Noch ohne Modul',detail:'Weder direktes Modul noch Dispatcher-Ziel erkannt',moduleName:''};
  }
  function getAppGuidance(app,status) {
    var guidance = {
      native: {
        label:'Natives HalDo-Modul erkannt',
        steps:['App im echten Browser starten und die wichtigsten Arbeitsabläufe manuell testen.','Bedienung, Fehlerfälle sowie Import-/Exportpfade prüfen, sofern die App diese anbietet.','Ergebnis der praktischen Abnahme dokumentieren.']
      },
      dedicated: {
        label:'Eigenständiges Modul erkannt',
        steps:['Modul über den zentralen Launcher im echten Browser starten.','Die zugesagten Kernfunktionen einzeln durchtesten und Fehlerfälle prüfen.','Nach erfolgreicher Abnahme einen konkreten Funktionstest ergänzen.']
      },
      routeReady: {
        label:'Zentrales Routenziel erkannt',
        steps:['Start der App über den zentralen Launcher im echten Browser prüfen.','Kontrollieren, ob die erkannte open()-Methode tatsächlich das richtige Fachmodul öffnet.','Kernabläufe der App praktisch testen und dokumentieren.']
      },
      generic: {
        label:'Generischer Platzhalter erkannt',
        steps:['Fachlichen Zweck und verbindlichen Funktionsumfang der App festlegen.','Den generischen Platzhalter durch ein eigenständiges HalDo-Fachmodul ersetzen.','Eigenes Modul registrieren, Launcher-Ziel verbinden und Funktionen testen.']
      },
      moduleUnrouted: {
        label:'Modul vorhanden, zentrale Verbindung fehlt',
        steps:['Vorhandenes Modul und seine App-ID fachlich zuordnen.','Die passende ID im zentralen Dispatcher mit dem echten Modul verbinden.','Start über den Launcher und die Kernabläufe praktisch testen.']
      },
      route: {
        label:'Zentrale Route ohne startbares Ziel erkannt',
        steps:['Dispatcher-Zuordnung und tatsächlichen Modulnamen prüfen.','Ein startbares Modul mit exportierter open()-Methode bereitstellen oder die Route korrigieren.','Launcher-Verbindung und Kernabläufe praktisch testen.']
      },
      missing: {
        label:'Noch kein startbares Modul erkannt',
        steps:['Zweck, Verantwortungsbereich und Funktionsumfang der App festlegen.','Eigenständiges HalDo-Modul implementieren und in der Registry registrieren.','Dispatcher-Verbindung ergänzen und automatisierte sowie praktische Tests hinzufügen.']
      }
    };
    var result = guidance[status.key] || guidance.missing;
    var steps = result.steps.slice();
    if (app && app.__catalogOnly === true) {
      steps.unshift('Katalogeintrag fachlich benennen und beschreiben; erst nach bestätigtem Umfang in die Kern-Registry aufnehmen.');
    }
    return {
      implementationLabel:result.label,
      nextSteps:steps,
      verificationNote:'Technischer Laufzeit-Snapshot: Modul-/Routenmerkmale wurden erkannt. Das ist keine vollständige manuelle Funktions- oder Browserabnahme.'
    };
  }
  function getInventory() {
    var apps = H.Registry.featured.slice();
    var registryIds = new Set(apps.map(function (app) { return app.id; }));
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (letter) {
      getCategoryEntries(letter).forEach(function (entry) {
        if (!entry || !entry.id || registryIds.has(entry.id)) return;
        registryIds.add(entry.id);
        apps.push({
          id:entry.id,
          n:entry.name || 'Name noch offen',
          i:entry.icon || '📦',
          __catalogOnly:true
        });
      });
    });
    var routes = getRouteIds();
    var categories = categoryIndex();
    return apps.map(function (app) {
      var status = inspectApp(app, routes);
      return {
        id:String(app.id || ''),
        name:String(app.n || app.name || app.id || 'Unbenannte App'),
        icon:String(app.i || '📱'),
        categories:categories[app.id] ? categories[app.id].slice() : [],
        category:categories[app.id] && categories[app.id].length ? categories[app.id][0] : '—',
        module:status.moduleName || '',
        status:status.key,
        statusLabel:status.label,
        detail:app.__catalogOnly
          ? 'A–Z-Katalog-ID vorhanden, aber noch nicht in der Kern-Registry registriert. ' + status.detail
          : status.detail,
        catalogOnly:app.__catalogOnly === true,
        registration:app.__catalogOnly === true ? 'planned-only' : 'registered',
        registrationLabel:app.__catalogOnly === true ? 'Nur A–Z-Katalog' : 'In Kern-Registry',
        implementationLabel:getAppGuidance(app,status).implementationLabel,
        nextSteps:getAppGuidance(app,status).nextSteps,
        verificationNote:getAppGuidance(app,status).verificationNote
      };
    }).filter(function (app) { return !!app.id; }).sort(function (a,b) {
      return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    });
  }
  function countRegisteredCategoryApps(entries) {
    var registered = new Set((H.Registry && H.Registry.featured || []).map(function (app) { return String(app.id); }));
    return (entries || []).filter(function (entry) { return entry && entry.id && registered.has(String(entry.id)); }).length;
  }
  function getCategoryProgress(letter) {
    var key = String(letter || '').toUpperCase();
    var category = getCategories()[key] || {};
    var entries = getCategoryEntries(key);
    var routes = getRouteIds();
    var registered = new Set((H.Registry && H.Registry.featured || []).map(function (app) { return String(app.id); }));
    var counts = {native:0,dedicated:0,generic:0,routeReady:0,moduleUnrouted:0,route:0,missing:0};
    var named = 0;
    entries.forEach(function (entry) {
      if (!entry || !entry.id) return;
      if (entry.name && entry.name !== 'Name noch offen') named += 1;
      var status = inspectApp({id:String(entry.id)},routes);
      counts[status.key] = (counts[status.key] || 0) + 1;
    });
    var planned = Math.max(0,Number(category.count) || 0);
    var catalogIds = entries.length;
    return {
      letter:key,
      name:String(category.name || 'Kategorie'),
      planned:planned,
      catalogIds:catalogIds,
      namedIds:named,
      registeredIds:countRegisteredCategoryApps(entries),
      readyModules:counts.native + counts.dedicated + counts.routeReady,
      genericPlaceholders:counts.generic,
      modulesWithoutRoute:counts.moduleUnrouted,
      routesWithoutTarget:counts.route,
      missingModules:counts.missing,
      planSlotsWithoutId:Math.max(0,planned - catalogIds),
      statusCounts:counts
    };
  }
  function getPlan() {
    var categories = getCategories();
    var planned = Object.keys(categories).reduce(function (sum,key) {
      return sum + Math.max(0,Number(categories[key] && categories[key].count) || 0);
    },0);
    var reported = NaN;
    try { reported = Number(H.Registry.totalCount()); } catch (e) {}
    if (Number.isFinite(reported) && reported > 0) planned = reported;
    var catalogIds = new Set();
    var catalogUnnamedIds = new Set();
    var catalogAssignments = 0;
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (letter) {
      var entries = getCategoryEntries(letter);
      catalogAssignments += entries.length;
      entries.forEach(function (entry) {
        if (!entry || !entry.id) return;
        var id = String(entry.id);
        catalogIds.add(id);
        if (!entry.name || entry.name === 'Name noch offen') catalogUnnamedIds.add(id);
      });
    });
    var registryIds = new Set((H.Registry && H.Registry.featured || []).map(function (app) { return String(app.id); }));
    var registeredInCatalog = Array.from(catalogIds).filter(function (id) { return registryIds.has(id); }).length;
    return {
      planned:planned,
      categoryCount:Object.keys(categories).length,
      categories:categories,
      catalogAssignments:catalogAssignments,
      catalogUnique:catalogIds.size,
      catalogDuplicateAssignments:Math.max(0,catalogAssignments - catalogIds.size),
      catalogUnnamed:catalogUnnamedIds.size,
      registryCount:registryIds.size,
      registeredInCatalog:registeredInCatalog,
      registryWithoutCategory:Array.from(registryIds).filter(function (id) { return !catalogIds.has(id); }).length,
      unassignedPlanSlots:Math.max(0,planned - catalogAssignments)
    };
  }
  function getVersionInfo() {
    var title = String(document.title || '');
    var match = title.match(/\bv(\d+)\b/i);
    var release = match ? 'v' + match[1] : 'Titelversion nicht erkannt';
    var core = H.SystemV157 && typeof H.SystemV157.getVersion === 'function' ? String(H.SystemV157.getVersion()) : 'nicht gemeldet';
    var master = H.Master && H.Master.version ? String(H.Master.version) : 'nicht gemeldet';
    return {release:release,core:core,master:master,consistent:release === 'v' + core.split('.')[0] && release === 'v' + master.split('.')[0]};
  }
  function download(name,blob) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); },1500);
  }
  function csvCell(value) {
    var text = String(value == null ? '' : value);
    // App metadata is text: neutralize spreadsheet formulas even after leading whitespace/control chars.
    // Numeric values remain numeric, including legitimate negative numbers.
    if (typeof value !== 'number' && /^[\s\u0000-\u001f]*[=+\-@]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g,'""') + '"';
  }
  function exportInventory() {
    var rows = getInventory();
    var csv = [['Kategorie(n)','App','App-ID','Registrierung','Erkanntes Modul','Status','Hinweis']].concat(rows.map(function (r) {
      return [r.categories.length ? r.categories.join(', ') : '—',r.name,r.id,r.registrationLabel,r.module || '—',r.statusLabel,r.detail];
    })).map(function (row) {
      return row.map(csvCell).join(';');
    }).join('\r\n');
    download('HalDo-Systeminventar.csv',new Blob(['\ufeff' + csv],{type:'text/csv;charset=utf-8'}));
  }
  function open() {
    var rootId = 'haldo-system-center-' + Date.now().toString(36);
    var html = '<div id="' + rootId + '" class="hdsc-root"><style>' +
      '.hdsc-root{height:100%;overflow:auto;padding:14px;box-sizing:border-box;color:var(--text,#eaf4ff);font:13px/1.45 system-ui,sans-serif}.hdsc-root *{box-sizing:border-box}.hdsc-hero{padding:16px;border:1px solid rgba(0,220,235,.25);border-radius:16px;background:linear-gradient(120deg,rgba(0,160,210,.17),rgba(120,75,210,.17));margin-bottom:12px}.hdsc-title{font-size:20px;font-weight:850;letter-spacing:-.3px}.hdsc-muted{font-size:11px;opacity:.7}.hdsc-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.hdsc-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.hdsc-btn{border:1px solid var(--border,rgba(120,180,220,.25));background:rgba(20,50,80,.55);color:inherit;border-radius:9px;padding:8px 11px;cursor:pointer}.hdsc-btn:disabled{opacity:.45;cursor:not-allowed}.hdsc-btn.primary{border-color:var(--accent,#00d5ed);background:rgba(0,190,220,.14)}.hdsc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:12px 0}.hdsc-stat{padding:12px;border:1px solid var(--border,rgba(120,180,220,.2));border-radius:12px;background:rgba(8,28,50,.28);min-width:0}.hdsc-value{font-size:22px;font-weight:850;font-variant-numeric:tabular-nums}.hdsc-label{font-size:10px;opacity:.7;margin-top:3px}.hdsc-section{margin-top:13px;padding:13px;border:1px solid var(--border,rgba(120,180,220,.2));border-radius:13px;background:rgba(8,28,50,.2)}.hdsc-section h3{margin:0 0 9px;font-size:14px}.hdsc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hdsc-cat{padding:10px;border:1px solid var(--border,rgba(120,180,220,.18));border-radius:10px;background:rgba(0,0,0,.13);text-align:left;color:inherit;width:100%;cursor:pointer;font:inherit}.hdsc-cat:hover,.hdsc-cat:focus-visible{border-color:var(--accent,#00d5ed);outline:none;background:rgba(0,150,190,.1)}.hdsc-cat b{display:block;font-size:13px}.hdsc-cat small{display:block;font-size:10px;opacity:.75;margin-top:3px;line-height:1.5}.hdsc-cat strong{font-size:10px;font-weight:750;color:var(--accent,#00d5ed)}.hdsc-tools{display:grid;grid-template-columns:minmax(0,1fr) 170px 170px auto;gap:8px;margin:10px 0}.hdsc-input{width:100%;min-width:0;padding:9px 10px;border:1px solid var(--border,rgba(120,180,220,.28));border-radius:9px;background:rgba(0,0,0,.2);color:inherit}.hdsc-table{width:100%;border-collapse:collapse;font-size:11px}.hdsc-table th{text-align:left;opacity:.65;font-weight:650;padding:8px 7px;border-bottom:1px solid var(--border,rgba(120,180,220,.2))}.hdsc-table td{padding:8px 7px;border-bottom:1px solid rgba(120,180,220,.1);vertical-align:middle}.hdsc-table tr:last-child td{border-bottom:0}.hdsc-appname{font-weight:750}.hdsc-id{font-size:10px;opacity:.58}.hdsc-status{display:inline-block;padding:4px 7px;border-radius:7px;background:rgba(130,150,180,.12);white-space:nowrap}.hdsc-status.native{color:#7fffd4;background:rgba(0,200,140,.12)}.hdsc-status.dedicated{color:#9ed4ff;background:rgba(50,130,220,.13)}.hdsc-status.generic{color:#ffd27d;background:rgba(230,160,20,.12)}.hdsc-status.route{color:#e0c3ff;background:rgba(150,90,220,.14)}.hdsc-status.routeReady{color:#7fffd4;background:rgba(0,200,140,.12)}.hdsc-status.moduleUnrouted{color:#ffd27d;background:rgba(230,160,20,.12)}.hdsc-status.missing{color:#ffabb2;background:rgba(220,70,90,.12)}.hdsc-note{padding:10px;border:1px solid rgba(230,170,50,.25);border-radius:10px;background:rgba(230,170,50,.07);font-size:11px;margin-top:9px}.hdsc-footer{opacity:.55;font-size:10px;margin-top:12px}.hdsc-count{font-variant-numeric:tabular-nums}.hdsc-empty{padding:20px;text-align:center;opacity:.65}.hdsc-tablewrap{overflow:auto}.hdsc-detail{margin-top:12px;padding:14px;border:1px solid var(--accent,rgba(0,210,230,.35));border-radius:12px;background:rgba(0,120,160,.07)}.hdsc-detail h4{margin:0 0 5px;font-size:15px}.hdsc-detail p{margin:7px 0;font-size:11px}.hdsc-detail ol{margin:7px 0 0;padding-left:22px}.hdsc-detail li{margin:5px 0;font-size:11px}.hdsc-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;margin-top:9px}.hdsc-detail-cell{padding:8px;border:1px solid var(--border,rgba(120,180,220,.18));border-radius:8px;min-width:0}.hdsc-detail-cell small{display:block;opacity:.65;font-size:10px}.hdsc-detail-cell b{display:block;font-size:11px;overflow-wrap:anywhere}@media(max-width:680px){.hdsc-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.hdsc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hdsc-tools{grid-template-columns:1fr 1fr}.hdsc-tools input{grid-column:1/-1}.hdsc-table{min-width:650px}}@media(max-width:430px){.hdsc-grid{grid-template-columns:1fr 1fr}.hdsc-root{padding:8px}}' +
      '</style><div class="hdsc-hero"><div class="hdsc-row"><span style="font-size:28px">🧭</span><div><div class="hdsc-title">HalDo System Center Pro</div><div class="hdsc-muted">Live-App-Inventar · A–Z-Masterplan · Modulstatus · Systemprüfung</div></div></div>' +
      '<div class="hdsc-actions"><button class="hdsc-btn primary" data-action="registry">📦 App-Registry öffnen</button><button class="hdsc-btn" data-action="export">⬇ Inventar als CSV</button><button class="hdsc-btn" data-action="refresh">↻ Status aktualisieren</button></div></div>' +
      '<div class="hdsc-stats" id="' + rootId + '-stats"></div>' +
      '<div id="' + rootId + '-versions"></div>' +
      '<div class="hdsc-section"><div class="hdsc-row" style="justify-content:space-between"><h3 style="margin:0">🧾 Was bisher in HalDo gebaut wurde</h3><span class="hdsc-status native">Projektübersicht</span></div>' +
      '<div class="hdsc-muted" style="margin:6px 0 10px">Diese Übersicht zeigt konkret integrierte Arbeiten im aktuellen Entwicklungsstand. „Automatisiert geprüft“ bedeutet nicht, dass jede App bereits manuell im echten Browser vollständig getestet wurde.</div>' +
      '<div class="hdsc-grid">' +
      '<div class="hdsc-cat"><b>🧭 System Center Pro</b><small>Live-App-Inventar, A–Z-Kategorien, Suche, Status- und Buchstabenfilter, Registry-Abgleich, CSV-Export und Modul-/Dispatcher-Erkennung</small></div>' +
      '<div class="hdsc-cat"><b>🎵 Music Studio Pro</b><small>Studio-Modul eingebunden; Lade- und Vertragsprüfungen in der automatisierten Projektprüfung</small></div>' +
      '<div class="hdsc-cat"><b>🎬 Video Studio Pro</b><small>Studio-Modul eingebunden; Lade- und Vertragsprüfungen in der automatisierten Projektprüfung</small></div>' +
      '<div class="hdsc-cat"><b>🩺 System Diagnostics</b><small>Systemdiagnose mit Prüfungen für Kern, Registry, Dispatcher, Module, Browser- und Speicher-APIs sowie Diagnosebericht</small></div>' +
      '<div class="hdsc-cat"><b>🚨 Runtime Error Monitor</b><small>Erfasst Laufzeitfehler und unbehandelte Promise-Fehler, begrenzt den Speicherpuffer und ermöglicht einen lokalen Berichtsexport</small></div>' +
      '<div class="hdsc-cat"><b>⌨️ HalDo Keyboard Studio</b><small>Soranî-RTL-Ausrichtung und passendes Tastenraster; deutsche Umlaute und Kurmancî-Sonderzeichen samt Shift-Unterstützung</small></div>' +
      '<div class="hdsc-cat"><b>📄 HalDo Datei-Konverter</b><small>Strengere CSV-Anführungszeichenprüfung und Schutz vor Formel-Injection beim CSV-Export</small></div>' +
      '<div class="hdsc-cat"><b>💾 HalDo Backup & Recovery</b><small>Transparenter Hinweis: Schlüssel-Namen-Filter ist heuristisch und untersucht keine geheimen Werte; lokalisierte Erklärung</small></div>' +
      '<div class="hdsc-cat"><b>🔗 Zentraler App-Dispatcher</b><small>Vorhandene Fachmodule korrekt zugeordnet; spätere Launcher-Overrides werden bei der Zielmodulprüfung berücksichtigt</small></div>' +
      '<div class="hdsc-cat"><b>🛡️ Qualitäts- und Integritätsprüfungen</b><small>Automatische Syntax-, Modul-Abhängigkeits-, Inline-Script-, Registry-, Diagnose- und System-Center-Vertragstests</small></div>' +
      '</div><div class="hdsc-note"><b>Prüfgrenze:</b> Die automatisierte GitHub-Prüfung für diesen Entwicklungsstand ist erfolgreich. Ein vollständiger manueller Live-Browsertest aller Apps steht noch aus. Apps, die nur im A–Z-Katalog stehen, werden ausdrücklich nicht als fertig oder startbar ausgegeben.</div></div>' +
      '<div class="hdsc-section"><h3>🗂 A–Z-Kategorien und Planungsumfang</h3><div class="hdsc-muted">Geplante App-Plätze sind Masterplan-Ziele – keine Behauptung, dass alle diese Apps bereits fertig programmiert sind.</div><div class="hdsc-grid" id="' + rootId + '-cats" style="margin-top:9px"></div></div>' +
      '<div class="hdsc-section" id="' + rootId + '-inventory"><div class="hdsc-row" style="justify-content:space-between"><h3 style="margin:0">📋 Vollständiges A–Z-App-Inventar</h3><span class="hdsc-muted" id="' + rootId + '-count"></span></div>' +
      '<div class="hdsc-tools"><input class="hdsc-input" id="' + rootId + '-search" placeholder="App oder App-ID suchen …"><select class="hdsc-input" id="' + rootId + '-filter">' + FILTERS.map(function (f) { return '<option value="' + f.id + '">' + f.name + '</option>'; }).join('') + '</select><select class="hdsc-input" id="' + rootId + '-category"><option value="all">Alle A–Z-Kategorien</option><option value="none">Ohne Kategorie</option>' + Object.keys(getCategories()).sort().map(function (key) { var category = getCategories()[key]; return '<option value="' + esc(key) + '">' + esc(key + ' · ' + (category.name || 'Kategorie')) + '</option>'; }).join('') + '</select><button class="hdsc-btn" id="' + rootId + '-clear">Zurücksetzen</button></div>' +
      '<div class="hdsc-tablewrap"><table class="hdsc-table"><thead><tr><th>Kategorie(n)</th><th>App</th><th>Registrierung</th><th>Erkanntes Modul</th><th>Status</th><th>Aktion</th></tr></thead><tbody id="' + rootId + '-body"></tbody></table></div>' +
      '<div class="hdsc-detail" id="' + rootId + '-detail" hidden aria-live="polite"></div>' +
      '<div class="hdsc-footer">Status wird aus dem aktuell geladenen HalDo-Laufzeitsystem erkannt. „Spezialroute prüfen“ ist ausdrücklich keine Bestätigung einer vollständig funktionsfähigen App.</div></div>' +
      '<div class="hdsc-section"><h3>✅ Aktuell bestätigte native Studio-Module</h3><div class="hdsc-row"><span class="hdsc-status native">HalDo Music Studio Pro</span><span class="hdsc-status native">HalDo Video Studio Pro</span></div><div class="hdsc-muted" style="margin-top:8px">Nativ registrierte Module werden anhand ihrer Modulregistrierung erkannt. Browser-/Exportfunktionen müssen zusätzlich im echten Browser praktisch getestet werden.</div></div>';

    H.Win.open('🧭 HalDo System Center Pro',html,{w:1040,h:850});
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (!root) return;
      var stats = root.querySelector('#' + rootId + '-stats');
      var versions = root.querySelector('#' + rootId + '-versions');
      var cats = root.querySelector('#' + rootId + '-cats');
      var body = root.querySelector('#' + rootId + '-body');
      var detailPanel = root.querySelector('#' + rootId + '-detail');
      var count = root.querySelector('#' + rootId + '-count');
      var search = root.querySelector('#' + rootId + '-search');
      var filter = root.querySelector('#' + rootId + '-filter');
      var categoryFilter = root.querySelector('#' + rootId + '-category');

      function render() {
        var inventory = getInventory();
        var plan = getPlan();
        var versionsInfo = getVersionInfo();
        var summary = {native:0,dedicated:0,generic:0,routeReady:0,moduleUnrouted:0,route:0,missing:0};
        inventory.forEach(function (item) { summary[item.status] = (summary[item.status] || 0) + 1; });
        stats.innerHTML = [
          ['🧩',inventory.length,'Sichtbare Einträge'],
          ['🗂',plan.planned,'Geplante App-Plätze'],
          ['🔠',plan.categoryCount,'A–Z-Kategorien'],
          ['🧾',plan.catalogAssignments,'Kategorie-Zuordnungen'],
          ['🆔',plan.catalogUnique,'Eindeutige Katalog-IDs'],
          ['🔁',plan.catalogDuplicateAssignments,'Mehrfach-Zuordnungen über Kategorien'],
          ['🏷️',plan.catalogUnnamed,'Katalog-IDs ohne App-Namen'],
          ['📦',plan.registryCount,'Registrierte Kern-Apps'],
          ['🗂',inventory.filter(function (item) { return item.registration === 'planned-only'; }).length,'Nur im A–Z-Katalog'],
          ['🔗',plan.registeredInCatalog,'In Katalog & Registry'],
          ['🗃',plan.registryWithoutCategory,'Registry-Apps ohne Kategorie'],
          ['🧭',summary.routeReady,'Launcher-Zielmodule erkannt'],
          ['🧩',summary.moduleUnrouted,'Module ohne Dispatcher-Route'],
          ['📭',plan.unassignedPlanSlots,'Planplätze ohne Katalog-ID']
        ].map(function (item) {
          return '<div class="hdsc-stat"><div class="hdsc-value">' + item[0] + ' ' + item[1] + '</div><div class="hdsc-label">' + item[2] + '</div></div>';
        }).join('');

        var versionWarn = !versionsInfo.consistent;
        versions.innerHTML = '<div class="hdsc-section"><h3>⚙️ Versions- und Laufzeitprüfung</h3>' +
          '<div class="hdsc-row"><span class="hdsc-status">Seitentitel: ' + esc(versionsInfo.release) + '</span><span class="hdsc-status">Systemkern: ' + esc(versionsInfo.core) + '</span><span class="hdsc-status">Master-Metadaten: ' + esc(versionsInfo.master) + '</span></div>' +
          (versionWarn ? '<div class="hdsc-note">Versionsangaben sind noch nicht einheitlich. Der Seitentitel, der zentrale Launcher und ältere Master-Metadaten werden getrennt angezeigt, damit ein alter Wert nicht als aktueller Build ausgegeben wird.</div>' : '<div class="hdsc-muted" style="margin-top:8px">Versionsangaben stimmen überein.</div>') +
          '<div class="hdsc-row" style="margin-top:9px"><span class="hdsc-status ' + (H.MusicStudio && H.MusicStudio.__nativePro ? 'native' : 'missing') + '">Music Studio: ' + (H.MusicStudio && H.MusicStudio.__nativePro ? 'geladen' : 'nicht erkannt') + '</span><span class="hdsc-status ' + (H.VideoStudio && H.VideoStudio.__nativePro ? 'native' : 'missing') + '">Video Studio: ' + (H.VideoStudio && H.VideoStudio.__nativePro ? 'geladen' : 'nicht erkannt') + '</span><span class="hdsc-status ' + (typeof (window.AudioContext || window.webkitAudioContext) === 'function' ? 'dedicated' : 'missing') + '">Web Audio: ' + (typeof (window.AudioContext || window.webkitAudioContext) === 'function' ? 'verfügbar' : 'nicht verfügbar') + '</span><span class="hdsc-status ' + (window.MediaRecorder && HTMLCanvasElement.prototype.captureStream ? 'dedicated' : 'missing') + '">Videoaufnahme: ' + (window.MediaRecorder && HTMLCanvasElement.prototype.captureStream ? 'API verfügbar' : 'API fehlt') + '</span></div></div>';

        cats.innerHTML = Object.keys(plan.categories).sort().map(function (key) {
          var progress = getCategoryProgress(key);
          return '<button type="button" class="hdsc-cat" data-filter-category="' + esc(key) + '" aria-label="Kategorie ' + esc(key) + ' filtern: ' + esc(progress.name) + '">' +
            '<b>' + esc((plan.categories[key] && plan.categories[key].icon) || '📁') + ' ' + esc(key) + ' · ' + esc(progress.name) + '</b>' +
            '<small>' + progress.planned + ' Planplätze · ' + progress.catalogIds + ' Katalog-IDs (' + progress.namedIds + ' benannt) · ' + progress.registeredIds + ' registriert</small>' +
            '<small><strong>' + progress.readyModules + ' Module erkannt</strong> · ' + progress.genericPlaceholders + ' Platzhalter · ' + progress.modulesWithoutRoute + ' ohne Route · ' + progress.routesWithoutTarget + ' Route ohne Ziel · ' + progress.missingModules + ' ohne Modul</small>' +
            '<small>' + progress.planSlotsWithoutId + ' Planplätze noch ohne Katalog-ID · anklicken zum Filtern</small></button>';
        }).join('');

        var query = String(search.value || '').trim().toLowerCase();
        var statusFilter = filter.value;
        var filtered = inventory.filter(function (item) {
          var text = [item.name,item.id,item.categories.join(' '),item.statusLabel].join(' ').toLowerCase();
          return (!query || text.indexOf(query) !== -1) && (statusFilter === 'all' || item.status === statusFilter) && (categoryFilter.value === 'all' || (categoryFilter.value === 'none' ? item.categories.length === 0 : item.categories.indexOf(categoryFilter.value) !== -1));
        });
        count.textContent = filtered.length + ' von ' + inventory.length + ' Einträgen';
        body.innerHTML = filtered.length ? filtered.map(function (item) {
          // Catalogue-only IDs are visible for planning, but are not launchable until registered.
          var canOpen = !item.catalogOnly && ['native','dedicated','routeReady'].indexOf(item.status) !== -1;
          return '<tr><td>' + esc(item.categories.length ? item.categories.join(' · ') : '—') + '</td><td><div class="hdsc-appname">' + esc(item.icon) + ' ' + esc(item.name) + '</div><div class="hdsc-id">' + esc(item.id) + '</div></td><td><span class="hdsc-status ' + (item.catalogOnly ? 'missing' : 'native') + '">' + esc(item.registrationLabel) + '</span></td><td>' + esc(item.module || '—') + '</td><td><span class="hdsc-status ' + item.status + '" title="' + esc(item.detail) + '">' + esc(item.statusLabel) + '</span></td><td><div class="hdsc-row"><button type="button" class="hdsc-btn" data-app-details="' + esc(item.id) + '">Details</button><button class="hdsc-btn" data-open-app="' + esc(item.id) + '"' + (canOpen ? '' : ' disabled title="' + esc(item.status === 'generic' ? 'Generischer Platzhalter: noch kein eigenständiges Fachmodul.' : 'Für diese App ist noch kein startbares Modul registriert.') + '"') + '>' + (canOpen ? 'Öffnen' : (item.status === 'generic' ? 'Platzhalter' : 'Modul fehlt')) + '</button></div></td></tr>';
        }).join('') : '<tr><td colspan="6" class="hdsc-empty">Keine passenden Apps gefunden.</td></tr>';
      }
      root.addEventListener('click',function (event) {
        var detailButton = event.target.closest('[data-app-details]');
        if (detailButton) {
          var detailApp = getInventory().find(function (item) { return item.id === detailButton.dataset.appDetails; });
          if (detailApp) {
            detailPanel.innerHTML = '<div class="hdsc-row" style="justify-content:space-between"><div><h4>' + esc(detailApp.icon) + ' ' + esc(detailApp.name) + '</h4><div class="hdsc-id">' + esc(detailApp.id) + '</div></div><button type="button" class="hdsc-btn" data-close-details>Schließen</button></div>' +
              '<div class="hdsc-detail-grid"><div class="hdsc-detail-cell"><small>Technischer Status</small><b>' + esc(detailApp.statusLabel) + '</b></div><div class="hdsc-detail-cell"><small>Implementierungsmerkmal</small><b>' + esc(detailApp.implementationLabel) + '</b></div><div class="hdsc-detail-cell"><small>Registrierung</small><b>' + esc(detailApp.registrationLabel) + '</b></div><div class="hdsc-detail-cell"><small>Kategorie(n)</small><b>' + esc(detailApp.categories.length ? detailApp.categories.join(' · ') : 'Keine Kategorie zugeordnet') + '</b></div><div class="hdsc-detail-cell"><small>Erkanntes Laufzeitmodul</small><b>' + esc(detailApp.module || 'Kein Modul erkannt') + '</b></div><div class="hdsc-detail-cell"><small>Startbarkeit</small><b>' + (detailApp.catalogOnly ? 'Noch nicht über die Kern-Registry startbar' : (['native','dedicated','routeReady'].indexOf(detailApp.status) !== -1 ? 'Startziel technisch erkannt' : 'Noch kein verifiziertes Startziel')) + '</b></div></div>' +
              '<p><b>Aktueller Befund:</b> ' + esc(detailApp.detail) + '</p><p><b>Nächste technische Schritte:</b></p><ol>' + detailApp.nextSteps.map(function (step) { return '<li>' + esc(step) + '</li>'; }).join('') + '</ol>' +
              '<div class="hdsc-note">' + esc(detailApp.verificationNote) + '</div>';
            detailPanel.hidden = false;
          }
          return;
        }
        if (event.target.closest('[data-close-details]')) {
          detailPanel.hidden = true;
          detailPanel.innerHTML = '';
          return;
        }
        var categoryButton = event.target.closest('[data-filter-category]');
        if (categoryButton) {
          categoryFilter.value = categoryButton.dataset.filterCategory;
          render();
          var inventorySection = root.querySelector('#' + rootId + '-inventory');
          if (inventorySection && typeof inventorySection.scrollIntoView === 'function') inventorySection.scrollIntoView({behavior:'smooth',block:'start'});
          return;
        }
        var action = event.target.closest('[data-action]');
        if (action) {
          if (action.dataset.action === 'registry' && H.AppBrowser && typeof H.AppBrowser.open === 'function') H.AppBrowser.open();
          else if (action.dataset.action === 'export') exportInventory();
          else if (action.dataset.action === 'refresh') { render(); }
          return;
        }
        var launch = event.target.closest('[data-open-app]');
        if (launch) {
          var app = H.Registry.featured.find(function (item) { return item.id === launch.dataset.openApp; });
          if (app && typeof H.Launch === 'function') H.Launch(app);
        }
      });
      search.addEventListener('input',render);
      filter.addEventListener('change',render);
      categoryFilter.addEventListener('change',render);
      root.querySelector('#' + rootId + '-clear').addEventListener('click',function () {
        search.value = ''; filter.value = 'all'; categoryFilter.value = 'all'; render();
      });
      render();
    },90);
  }

  H.SystemCenter = {open:open,inventory:getInventory,plan:getPlan,refresh:getInventory,categoryRegisteredCount:countRegisteredCategoryApps,categoryProgress:getCategoryProgress,guidance:getAppGuidance};
  H[APP_ID] = H.SystemCenter;

  // Route the launcher to the real app window instead of the generic greeting.
  var previousLaunch = H.Launch;
  H.Launch = function (app) {
    // Preserve the central launcher (including the universal welcome experience).
    // The v157 dispatcher can then resolve H[APP_ID].open() like every other app.
    if (typeof previousLaunch === 'function') return previousLaunch.apply(this, arguments);
    if (app && app.id === APP_ID) return H.SystemCenter.open();
  };
  if (!H.Registry.featured.some(function (item) { return item.id === APP_ID; })) {
    H.Registry.featured.push({id:APP_ID,n:APP_NAME,i:APP_ICON});
  }
  if (H.Master && typeof H.Master.getCategoryApps === 'function') {
    var previousCategoryApps = H.Master.getCategoryApps.bind(H.Master);
    H.Master.getCategoryApps = function (key) {
      var items = previousCategoryApps(key) || [];
      if (key !== 'S' || items.some(function (item) { return item.id === APP_ID; })) return items;
      return items.concat([{id:APP_ID,name:APP_NAME,icon:APP_ICON}]);
    };
    H.Master.namedCoreApps = H.Registry.featured.length;
  }
  console.info('HalDo System Center Pro: Live-App-Inventar und A–Z-Statusübersicht registriert.');
})();