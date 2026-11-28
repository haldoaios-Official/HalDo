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
        registrationLabel:app.__catalogOnly === true ? 'Nur A–Z-Katalog' : 'In Kern-Registry'
      };
    }).filter(function (app) { return !!app.id; }).sort(function (a,b) {
      return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    });
  }
  function countRegisteredCategoryApps(entries) {
    var registered = new Set((H.Registry && H.Registry.featured || []).map(function (app) { return String(app.id); }));
    return (entries || []).filter(function (entry) { return entry && entry.id && registered.has(String(entry.id)); }).length;
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
    var catalogAssignments = 0;
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach(function (letter) {
      var entries = getCategoryEntries(letter);
      catalogAssignments += entries.length;
      entries.forEach(function (entry) { if (entry && entry.id) catalogIds.add(String(entry.id)); });
    });
    var registryIds = new Set((H.Registry && H.Registry.featured || []).map(function (app) { return String(app.id); }));
    var registeredInCatalog = Array.from(catalogIds).filter(function (id) { return registryIds.has(id); }).length;
    return {
      planned:planned,
      categoryCount:Object.keys(categories).length,
      categories:categories,
      catalogAssignments:catalogAssignments,
      catalogUnique:catalogIds.size,
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
      '.hdsc-root{height:100%;overflow:auto;padding:14px;box-sizing:border-box;color:var(--text,#eaf4ff);font:13px/1.45 system-ui,sans-serif}.hdsc-root *{box-sizing:border-box}.hdsc-hero{padding:16px;border:1px solid rgba(0,220,235,.25);border-radius:16px;background:linear-gradient(120deg,rgba(0,160,210,.17),rgba(120,75,210,.17));margin-bottom:12px}.hdsc-title{font-size:20px;font-weight:850;letter-spacing:-.3px}.hdsc-muted{font-size:11px;opacity:.7}.hdsc-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.hdsc-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.hdsc-btn{border:1px solid var(--border,rgba(120,180,220,.25));background:rgba(20,50,80,.55);color:inherit;border-radius:9px;padding:8px 11px;cursor:pointer}.hdsc-btn:disabled{opacity:.45;cursor:not-allowed}.hdsc-btn.primary{border-color:var(--accent,#00d5ed);background:rgba(0,190,220,.14)}.hdsc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:12px 0}.hdsc-stat{padding:12px;border:1px solid var(--border,rgba(120,180,220,.2));border-radius:12px;background:rgba(8,28,50,.28);min-width:0}.hdsc-value{font-size:22px;font-weight:850;font-variant-numeric:tabular-nums}.hdsc-label{font-size:10px;opacity:.7;margin-top:3px}.hdsc-section{margin-top:13px;padding:13px;border:1px solid var(--border,rgba(120,180,220,.2));border-radius:13px;background:rgba(8,28,50,.2)}.hdsc-section h3{margin:0 0 9px;font-size:14px}.hdsc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hdsc-cat{padding:10px;border:1px solid var(--border,rgba(120,180,220,.18));border-radius:10px;background:rgba(0,0,0,.13)}.hdsc-cat b{display:block;font-size:13px}.hdsc-cat small{font-size:10px;opacity:.67}.hdsc-tools{display:grid;grid-template-columns:minmax(0,1fr) 170px 170px auto;gap:8px;margin:10px 0}.hdsc-input{width:100%;min-width:0;padding:9px 10px;border:1px solid var(--border,rgba(120,180,220,.28));border-radius:9px;background:rgba(0,0,0,.2);color:inherit}.hdsc-table{width:100%;border-collapse:collapse;font-size:11px}.hdsc-table th{text-align:left;opacity:.65;font-weight:650;padding:8px 7px;border-bottom:1px solid var(--border,rgba(120,180,220,.2))}.hdsc-table td{padding:8px 7px;border-bottom:1px solid rgba(120,180,220,.1);vertical-align:middle}.hdsc-table tr:last-child td{border-bottom:0}.hdsc-appname{font-weight:750}.hdsc-id{font-size:10px;opacity:.58}.hdsc-status{display:inline-block;padding:4px 7px;border-radius:7px;background:rgba(130,150,180,.12);white-space:nowrap}.hdsc-status.native{color:#7fffd4;background:rgba(0,200,140,.12)}.hdsc-status.dedicated{color:#9ed4ff;background:rgba(50,130,220,.13)}.hdsc-status.generic{color:#ffd27d;background:rgba(230,160,20,.12)}.hdsc-status.route{color:#e0c3ff;background:rgba(150,90,220,.14)}.hdsc-status.routeReady{color:#7fffd4;background:rgba(0,200,140,.12)}.hdsc-status.moduleUnrouted{color:#ffd27d;background:rgba(230,160,20,.12)}.hdsc-status.missing{color:#ffabb2;background:rgba(220,70,90,.12)}.hdsc-note{padding:10px;border:1px solid rgba(230,170,50,.25);border-radius:10px;background:rgba(230,170,50,.07);font-size:11px;margin-top:9px}.hdsc-footer{opacity:.55;font-size:10px;margin-top:12px}.hdsc-count{font-variant-numeric:tabular-nums}.hdsc-empty{padding:20px;text-align:center;opacity:.65}.hdsc-tablewrap{overflow:auto}@media(max-width:680px){.hdsc-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.hdsc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hdsc-tools{grid-template-columns:1fr 1fr}.hdsc-tools input{grid-column:1/-1}.hdsc-table{min-width:650px}}@media(max-width:430px){.hdsc-grid{grid-template-columns:1fr 1fr}.hdsc-root{padding:8px}}' +
      '</style><div class="hdsc-hero"><div class="hdsc-row"><span style="font-size:28px">🧭</span><div><div class="hdsc-title">HalDo System Center Pro</div><div class="hdsc-muted">Live-App-Inventar · A–Z-Masterplan · Modulstatus · Systemprüfung</div></div></div>' +
      '<div class="hdsc-actions"><button class="hdsc-btn primary" data-action="registry">📦 App-Registry öffnen</button><button class="hdsc-btn" data-action="export">⬇ Inventar als CSV</button><button class="hdsc-btn" data-action="refresh">↻ Status aktualisieren</button></div></div>' +
      '<div class="hdsc-stats" id="' + rootId + '-stats"></div>' +
      '<div id="' + rootId + '-versions"></div>' +
      '<div class="hdsc-section"><h3>🗂 A–Z-Kategorien und Planungsumfang</h3><div class="hdsc-muted">Geplante App-Plätze sind Masterplan-Ziele – keine Behauptung, dass alle diese Apps bereits fertig programmiert sind.</div><div class="hdsc-grid" id="' + rootId + '-cats" style="margin-top:9px"></div></div>' +
      '<div class="hdsc-section"><div class="hdsc-row" style="justify-content:space-between"><h3 style="margin:0">📋 Vollständiges A–Z-App-Inventar</h3><span class="hdsc-muted" id="' + rootId + '-count"></span></div>' +
      '<div class="hdsc-tools"><input class="hdsc-input" id="' + rootId + '-search" placeholder="App oder App-ID suchen …"><select class="hdsc-input" id="' + rootId + '-filter">' + FILTERS.map(function (f) { return '<option value="' + f.id + '">' + f.name + '</option>'; }).join('') + '</select><select class="hdsc-input" id="' + rootId + '-category"><option value="all">Alle A–Z-Kategorien</option><option value="none">Ohne Kategorie</option>' + Object.keys(getCategories()).sort().map(function (key) { var category = getCategories()[key]; return '<option value="' + esc(key) + '">' + esc(key + ' · ' + (category.name || 'Kategorie')) + '</option>'; }).join('') + '</select><button class="hdsc-btn" id="' + rootId + '-clear">Zurücksetzen</button></div>' +
      '<div class="hdsc-tablewrap"><table class="hdsc-table"><thead><tr><th>Kategorie(n)</th><th>App</th><th>Registrierung</th><th>Erkanntes Modul</th><th>Status</th><th>Aktion</th></tr></thead><tbody id="' + rootId + '-body"></tbody></table></div>' +
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

        cats.innerHTML = Object.entries(plan.categories).map(function (entry) {
          var key = entry[0], category = entry[1];
          var catalog = getCategoryEntries(key);
          var registeredCount = countRegisteredCategoryApps(catalog);
          var planned = Math.max(0,Number(category.count) || 0);
          var catalogCount = catalog.length;
          var unspecified = Math.max(0,planned - catalogCount);
          return '<div class="hdsc-cat"><b>' + esc(category.icon || '📁') + ' ' + esc(key) + ' · ' + esc(category.name || 'Kategorie') + '</b><small>' + planned + ' Planplätze · ' + catalogCount + ' Katalog-IDs · ' + unspecified + ' Planplätze ohne Katalog-ID · ' + registeredCount + ' tatsächlich registrierte Kern-Apps</small></div>';
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
          return '<tr><td>' + esc(item.categories.length ? item.categories.join(' · ') : '—') + '</td><td><div class="hdsc-appname">' + esc(item.icon) + ' ' + esc(item.name) + '</div><div class="hdsc-id">' + esc(item.id) + '</div></td><td><span class="hdsc-status ' + (item.catalogOnly ? 'missing' : 'native') + '">' + esc(item.registrationLabel) + '</span></td><td>' + esc(item.module || '—') + '</td><td><span class="hdsc-status ' + item.status + '" title="' + esc(item.detail) + '">' + esc(item.statusLabel) + '</span></td><td><button class="hdsc-btn" data-open-app="' + esc(item.id) + '" + (canOpen ? '' : ' disabled title="' + esc(item.status === 'generic' ? 'Generischer Platzhalter: noch kein eigenständiges Fachmodul.' : 'Für diese App ist noch kein startbares Modul registriert.') + '"') + '>' + (canOpen ? 'Öffnen' : (item.status === 'generic' ? 'Platzhalter' : 'Modul fehlt')) + '</button></td></tr>';
        }).join('') : '<tr><td colspan="5" class="hdsc-empty">Keine passenden Apps gefunden.</td></tr>';
      }
      root.addEventListener('click',function (event) {
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

  H.SystemCenter = {open:open,inventory:getInventory,plan:getPlan,refresh:getInventory,categoryRegisteredCount:countRegisteredCategoryApps};
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