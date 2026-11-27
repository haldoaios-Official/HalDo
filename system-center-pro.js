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
    {id:'route',name:'Spezialroute prüfen'},
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
  function categoryIndex() {
    var map = {};
    var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    if (H.Master && typeof H.Master.getCategoryApps === 'function') {
      letters.forEach(function (letter) {
        try {
          (H.Master.getCategoryApps(letter) || []).forEach(function (entry) {
            if (entry && entry.id && !map[entry.id]) map[entry.id] = letter;
          });
        } catch (e) {}
      });
    }
    return map;
  }
  function inspectApp(app, routeIds) {
    var direct = H[app.id];
    var open = direct && typeof direct.open === 'function' ? direct.open : null;
    if (open) {
      if (direct.__nativePro === true) {
        return {key:'native',label:'Natives Modul',detail:'Eigenständiges HalDo-Modul registriert'};
      }
      var source = '';
      try { source = Function.prototype.toString.call(open); } catch (e) {}
      if (source.indexOf('haldo_gen_') !== -1) {
        return {key:'generic',label:'Generischer Platzhalter',detail:'Allgemeine Eintragsverwaltung statt eigener Fach-App'};
      }
      return {key:'dedicated',label:'Eigenständiges Modul',detail:'Direkte open()-Implementierung vorhanden'};
    }
    if (routeIds.indexOf(app.id) !== -1) {
      return {key:'route',label:'Spezialroute prüfen',detail:'Launcher-Route vorhanden; direktes Modul nicht eindeutig am App-ID-Feld sichtbar'};
    }
    return {key:'missing',label:'Noch ohne Modul',detail:'Katalogeintrag vorhanden, aber kein direktes open()-Modul erkannt'};
  }
  function getInventory() {
    var apps = H.Registry.featured.slice();
    var routes = getRouteIds();
    var categories = categoryIndex();
    return apps.map(function (app) {
      var status = inspectApp(app, routes);
      return {
        id:String(app.id || ''),
        name:String(app.n || app.name || app.id || 'Unbenannte App'),
        icon:String(app.i || '📱'),
        category:categories[app.id] || '—',
        status:status.key,
        statusLabel:status.label,
        detail:status.detail
      };
    }).filter(function (app) { return !!app.id; }).sort(function (a,b) {
      return a.category.localeCompare(b.category) || a.name.localeCompare(b.name);
    });
  }
  function getPlan() {
    var categories = getCategories();
    var planned = Object.keys(categories).reduce(function (sum,key) {
      return sum + Math.max(0,Number(categories[key] && categories[key].count) || 0);
    },0);
    var reported = NaN;
    try { reported = Number(H.Registry.totalCount()); } catch (e) {}
    if (Number.isFinite(reported) && reported > 0) planned = reported;
    return {planned:planned,categoryCount:Object.keys(categories).length,categories:categories};
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
  function exportInventory() {
    var rows = getInventory();
    var csv = [['Kategorie','App','App-ID','Status','Hinweis']].concat(rows.map(function (r) {
      return [r.category,r.name,r.id,r.statusLabel,r.detail];
    })).map(function (row) {
      return row.map(function (cell) { return '"' + String(cell).replace(/"/g,'""') + '"'; }).join(';');
    }).join('\r\n');
    download('HalDo-Systeminventar.csv',new Blob(['\ufeff' + csv],{type:'text/csv;charset=utf-8'}));
  }
  function open() {
    var rootId = 'haldo-system-center-' + Date.now().toString(36);
    var html = '<div id="' + rootId + '" class="hdsc-root"><style>' +
      '.hdsc-root{height:100%;overflow:auto;padding:14px;box-sizing:border-box;color:var(--text,#eaf4ff);font:13px/1.45 system-ui,sans-serif}.hdsc-root *{box-sizing:border-box}.hdsc-hero{padding:16px;border:1px solid rgba(0,220,235,.25);border-radius:16px;background:linear-gradient(120deg,rgba(0,160,210,.17),rgba(120,75,210,.17));margin-bottom:12px}.hdsc-title{font-size:20px;font-weight:850;letter-spacing:-.3px}.hdsc-muted{font-size:11px;opacity:.7}.hdsc-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.hdsc-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.hdsc-btn{border:1px solid var(--border,rgba(120,180,220,.25));background:rgba(20,50,80,.55);color:inherit;border-radius:9px;padding:8px 11px;cursor:pointer}.hdsc-btn.primary{border-color:var(--accent,#00d5ed);background:rgba(0,190,220,.14)}.hdsc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:12px 0}.hdsc-stat{padding:12px;border:1px solid var(--border,rgba(120,180,220,.2));border-radius:12px;background:rgba(8,28,50,.28);min-width:0}.hdsc-value{font-size:22px;font-weight:850;font-variant-numeric:tabular-nums}.hdsc-label{font-size:10px;opacity:.7;margin-top:3px}.hdsc-section{margin-top:13px;padding:13px;border:1px solid var(--border,rgba(120,180,220,.2));border-radius:13px;background:rgba(8,28,50,.2)}.hdsc-section h3{margin:0 0 9px;font-size:14px}.hdsc-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.hdsc-cat{padding:10px;border:1px solid var(--border,rgba(120,180,220,.18));border-radius:10px;background:rgba(0,0,0,.13)}.hdsc-cat b{display:block;font-size:13px}.hdsc-cat small{font-size:10px;opacity:.67}.hdsc-tools{display:grid;grid-template-columns:minmax(0,1fr) 190px auto;gap:8px;margin:10px 0}.hdsc-input{width:100%;min-width:0;padding:9px 10px;border:1px solid var(--border,rgba(120,180,220,.28));border-radius:9px;background:rgba(0,0,0,.2);color:inherit}.hdsc-table{width:100%;border-collapse:collapse;font-size:11px}.hdsc-table th{text-align:left;opacity:.65;font-weight:650;padding:8px 7px;border-bottom:1px solid var(--border,rgba(120,180,220,.2))}.hdsc-table td{padding:8px 7px;border-bottom:1px solid rgba(120,180,220,.1);vertical-align:middle}.hdsc-table tr:last-child td{border-bottom:0}.hdsc-appname{font-weight:750}.hdsc-id{font-size:10px;opacity:.58}.hdsc-status{display:inline-block;padding:4px 7px;border-radius:7px;background:rgba(130,150,180,.12);white-space:nowrap}.hdsc-status.native{color:#7fffd4;background:rgba(0,200,140,.12)}.hdsc-status.dedicated{color:#9ed4ff;background:rgba(50,130,220,.13)}.hdsc-status.generic{color:#ffd27d;background:rgba(230,160,20,.12)}.hdsc-status.route{color:#e0c3ff;background:rgba(150,90,220,.14)}.hdsc-status.missing{color:#ffabb2;background:rgba(220,70,90,.12)}.hdsc-note{padding:10px;border:1px solid rgba(230,170,50,.25);border-radius:10px;background:rgba(230,170,50,.07);font-size:11px;margin-top:9px}.hdsc-footer{opacity:.55;font-size:10px;margin-top:12px}.hdsc-count{font-variant-numeric:tabular-nums}.hdsc-empty{padding:20px;text-align:center;opacity:.65}.hdsc-tablewrap{overflow:auto}@media(max-width:680px){.hdsc-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.hdsc-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hdsc-tools{grid-template-columns:1fr 1fr}.hdsc-tools input{grid-column:1/-1}.hdsc-table{min-width:650px}}@media(max-width:430px){.hdsc-grid{grid-template-columns:1fr 1fr}.hdsc-root{padding:8px}}' +
      '</style><div class="hdsc-hero"><div class="hdsc-row"><span style="font-size:28px">🧭</span><div><div class="hdsc-title">HalDo System Center Pro</div><div class="hdsc-muted">Live-App-Inventar · A–Z-Masterplan · Modulstatus · Systemprüfung</div></div></div>' +
      '<div class="hdsc-actions"><button class="hdsc-btn primary" data-action="registry">📦 App-Registry öffnen</button><button class="hdsc-btn" data-action="export">⬇ Inventar als CSV</button><button class="hdsc-btn" data-action="refresh">↻ Status aktualisieren</button></div></div>' +
      '<div class="hdsc-stats" id="' + rootId + '-stats"></div>' +
      '<div id="' + rootId + '-versions"></div>' +
      '<div class="hdsc-section"><h3>🗂 A–Z-Kategorien und Planungsumfang</h3><div class="hdsc-muted">Geplante App-Plätze sind Masterplan-Ziele – keine Behauptung, dass alle diese Apps bereits fertig programmiert sind.</div><div class="hdsc-grid" id="' + rootId + '-cats" style="margin-top:9px"></div></div>' +
      '<div class="hdsc-section"><div class="hdsc-row" style="justify-content:space-between"><h3 style="margin:0">📋 Benannte HalDo-Kern-Apps</h3><span class="hdsc-muted" id="' + rootId + '-count"></span></div>' +
      '<div class="hdsc-tools"><input class="hdsc-input" id="' + rootId + '-search" placeholder="App oder App-ID suchen …"><select class="hdsc-input" id="' + rootId + '-filter">' + FILTERS.map(function (f) { return '<option value="' + f.id + '">' + f.name + '</option>'; }).join('') + '</select><button class="hdsc-btn" id="' + rootId + '-clear">Zurücksetzen</button></div>' +
      '<div class="hdsc-tablewrap"><table class="hdsc-table"><thead><tr><th>Kategorie</th><th>App</th><th>Status</th><th>Aktion</th></tr></thead><tbody id="' + rootId + '-body"></tbody></table></div>' +
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

      function render() {
        var inventory = getInventory();
        var plan = getPlan();
        var versionsInfo = getVersionInfo();
        var summary = {native:0,dedicated:0,generic:0,route:0,missing:0};
        inventory.forEach(function (item) { summary[item.status] = (summary[item.status] || 0) + 1; });
        stats.innerHTML = [
          ['🧩',inventory.length,'Benannte Kern-Apps'],
          ['🗂',plan.planned,'Geplante App-Plätze'],
          ['🔠',plan.categoryCount,'A–Z-Kategorien'],
          ['✅',summary.native + summary.dedicated,'Direkt erkannte Module']
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
          var named = H.Master && typeof H.Master.getCategoryApps === 'function' ? H.Master.getCategoryApps(key) : [];
          return '<div class="hdsc-cat"><b>' + esc(category.icon || '📁') + ' ' + esc(key) + ' · ' + esc(category.name || 'Kategorie') + '</b><small>' + (Number(category.count) || 0) + ' geplante Plätze · ' + (named ? named.length : 0) + ' namentlich zugeordnet</small></div>';
        }).join('');

        var query = String(search.value || '').trim().toLowerCase();
        var statusFilter = filter.value;
        var filtered = inventory.filter(function (item) {
          var text = [item.name,item.id,item.category,item.statusLabel].join(' ').toLowerCase();
          return (!query || text.indexOf(query) !== -1) && (statusFilter === 'all' || item.status === statusFilter);
        });
        count.textContent = filtered.length + ' von ' + inventory.length + ' Einträgen';
        body.innerHTML = filtered.length ? filtered.map(function (item) {
          return '<tr><td>' + esc(item.category) + '</td><td><div class="hdsc-appname">' + esc(item.icon) + ' ' + esc(item.name) + '</div><div class="hdsc-id">' + esc(item.id) + '</div></td><td><span class="hdsc-status ' + item.status + '" title="' + esc(item.detail) + '">' + esc(item.statusLabel) + '</span></td><td><button class="hdsc-btn" data-open-app="' + esc(item.id) + '">Öffnen</button></td></tr>';
        }).join('') : '<tr><td colspan="4" class="hdsc-empty">Keine passenden Apps gefunden.</td></tr>';
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
      root.querySelector('#' + rootId + '-clear').addEventListener('click',function () {
        search.value = ''; filter.value = 'all'; render();
      });
      render();
    },90);
  }

  H.SystemCenter = {open:open,inventory:getInventory,refresh:getInventory};
  H[APP_ID] = H.SystemCenter;

  // Route the launcher to the real app window instead of the generic greeting.
  var previousLaunch = H.Launch;
  H.Launch = function (app) {
    if (app && app.id === APP_ID) return open();
    if (typeof previousLaunch === 'function') return previousLaunch.apply(this, arguments);
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