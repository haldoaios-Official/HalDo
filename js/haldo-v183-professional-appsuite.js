/* ================================================================
   HALDO AI OS PRO MAX — v183 Professional App Suite
   - Upgrades the existing app-registry entry to HalDo AI AppStore Pro Max
   - Adds HalDo Anwälte App Pro, HalDo Gesetze App Pro,
     HalDo Logo & Patent App Pro
   - Confidential records use the existing encrypted v180 DataVault.
   - No remote legal advice, filing, trademark clearance, or app installation
     is claimed by this browser-only module.
   ================================================================ */
(function (window, document) {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var VERSION = '183.0.0';
  if (H.ProfessionalSuiteV183 && H.ProfessionalSuiteV183.version === VERSION) return;
  if (!H.Win || typeof H.Win.open !== 'function' || !H.Registry ||
      !Array.isArray(H.Registry.featured)) {
    console.error('[HalDo v183] Window manager and featured registry are required.');
    return;
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[ch];
    });
  }
  function uid(prefix) {
    return prefix + '-' + (window.crypto && window.crypto.randomUUID
      ? window.crypto.randomUUID()
      : Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10));
  }
  function notify(message, type) {
    try {
      if (H.Notify && typeof H.Notify[type || 'info'] === 'function') H.Notify[type || 'info'](message);
      else console.info('[HalDo v183]', message);
    } catch (_) { console.info('[HalDo v183]', message); }
  }
  function openWindow(title, rootClass, width, height, mount) {
    var rootId = uid('hdv183');
    H.Win.open(title, '<div id="' + esc(rootId) + '" class="' + esc(rootClass) +
      '" style="height:100%;overflow:auto;padding:16px;color:var(--text,#e6f7ff);font:14px/1.5 system-ui,sans-serif"></div>',
      { w: width || 820, h: height || 760 });
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (root && root.isConnected) mount(root);
    }, 70);
  }
  function registerApp(id, title, icon, category, description, open) {
    var entry = H.Registry.featured.find(function (item) { return item && item.id === id; });
    if (entry) {
      entry.n = title;
      entry.i = icon;
      entry.category = category;
      entry.desc = description;
    } else {
      H.Registry.featured.push({ id: id, n: title, i: icon, category: category, desc: description });
    }
    H[id] = {
      version: VERSION,
      implementationKind: 'module',
      isGenericFallback: false,
      open: open
    };
    if (H.Registry && typeof H.Registry.registerCategoryApp === 'function') {
      try { H.Registry.registerCategoryApp(category, id); } catch (error) {
        console.warn('[HalDo v183] Category registration:', id, error);
      }
    }
    return { id: id, title: title, icon: icon, category: category, description: description };
  }

  /* ----------------------- APPSTORE PRO MAX ----------------------- */
  function openAppStore() {
    openWindow('🛍️ HalDo AI AppStore Pro Max', 'hdv183-store', 980, 780, function (root) {
      var query = '';
      var category = 'Alle';
      var selected = 'Alle';
      var status = root.querySelector('[data-store-status]');
      function entries() {
        return H.Registry.featured.filter(function (app) {
          return app && typeof app.id === 'string';
        }).map(function (app) {
          var handler = H[app.id];
          return {
            id: app.id,
            name: app.n || app.name || app.id,
            icon: app.i || app.ico || '📦',
            category: (app.category || app.cat || 'Weitere').toString(),
            ready: !!(handler && typeof handler.open === 'function'),
            description: app.desc || app.description || 'HalDo-Anwendung'
          };
        }).sort(function (a, b) { return a.name.localeCompare(b.name, 'de'); });
      }
      function render() {
        var all = entries();
        var categories = ['Alle'].concat(Array.from(new Set(all.map(function (app) { return app.category; }))).sort());
        if (categories.indexOf(category) < 0) category = 'Alle';
        var normalized = query.trim().toLocaleLowerCase('de-DE');
        var visible = all.filter(function (app) {
          return (category === 'Alle' || app.category === category) &&
            (!normalized || (app.name + ' ' + app.id + ' ' + app.description).toLocaleLowerCase('de-DE').indexOf(normalized) >= 0);
        });
        root.innerHTML =
          '<header style="padding:18px;border:1px solid rgba(0,229,255,.28);border-radius:18px;background:linear-gradient(130deg,rgba(0,229,255,.14),rgba(180,120,255,.12));margin-bottom:14px">' +
            '<div style="font-size:12px;letter-spacing:2px;opacity:.72">HALDO AI OS PRO MAX</div>' +
            '<h2 style="font-size:25px;margin:5px 0">🛍️ HalDo AI AppStore Pro Max</h2>' +
            '<p style="opacity:.8">Zentrale Übersicht aller registrierten HalDo-Anwendungen.</p>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">' +
              '<b>' + all.length + ' registrierte Apps</b><span>·</span><b>' +
              all.filter(function (app) { return app.ready; }).length + ' mit Startmodul</b>' +
            '</div>' +
          '</header>' +
          '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:12px">' +
            '<input data-store-search type="search" value="' + esc(query) + '" placeholder="HalDo-App suchen …" aria-label="Apps suchen" style="flex:1;min-width:220px;padding:12px;border-radius:11px;border:1px solid var(--border,rgba(0,229,255,.35));background:rgba(0,0,0,.22);color:inherit">' +
            '<select data-store-category aria-label="Kategorie" style="padding:12px;border-radius:11px;border:1px solid var(--border,rgba(0,229,255,.35));background:#102033;color:inherit">' +
              categories.map(function (item) { return '<option value="' + esc(item) + '"' + (item === category ? ' selected' : '') + '>' + esc(item) + '</option>'; }).join('') +
            '</select>' +
          '</div>' +
          '<div data-store-list style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">' +
            (visible.length ? visible.map(function (app) {
              return '<article style="padding:14px;border:1px solid rgba(0,229,255,.2);border-radius:14px;background:rgba(5,20,38,.55);min-width:0">' +
                '<div style="font-size:26px">' + esc(app.icon) + '</div>' +
                '<h3 style="font-size:15px;margin:5px 0">' + esc(app.name) + '</h3>' +
                '<div style="font-size:11px;opacity:.7;margin-bottom:8px">' + esc(app.category) + ' · ' + esc(app.id) + '</div>' +
                '<p style="font-size:12px;opacity:.8;min-height:34px">' + esc(app.description) + '</p>' +
                '<div style="display:flex;justify-content:space-between;align-items:center;gap:8px;margin-top:12px">' +
                  '<span style="font-size:11px;color:' + (app.ready ? '#86efac' : '#fbbf24') + '">' + (app.ready ? 'Startmodul erkannt' : 'Nur Registry-Eintrag') + '</span>' +
                  '<button type="button" data-store-open="' + esc(app.id) + '"' + (app.ready ? '' : ' disabled') +
                    ' style="padding:8px 12px;border-radius:9px;border:1px solid rgba(0,229,255,.4);background:rgba(0,229,255,.13);color:inherit;cursor:' + (app.ready ? 'pointer' : 'not-allowed') + '">' +
                    (app.ready ? 'Öffnen' : 'Nicht verfügbar') + '</button>' +
                '</div></article>';
            }).join('') : '<p style="opacity:.7;padding:18px">Keine passenden Apps gefunden.</p>') +
          '</div>' +
          '<p data-store-status role="status" aria-live="polite" style="margin-top:12px;opacity:.75;font-size:12px">Der Store zeigt den tatsächlichen Registry- und Modulstatus. Er lädt oder installiert keine Dateien aus dem Internet.</p>';
        root.querySelector('[data-store-search]').addEventListener('input', function (event) {
          query = event.target.value;
          var start = event.target.selectionStart;
          render();
          var input = root.querySelector('[data-store-search]');
          input.focus();
          try { input.setSelectionRange(start, start); } catch (_) {}
        });
        root.querySelector('[data-store-category]').addEventListener('change', function (event) {
          category = event.target.value; render();
        });
        root.querySelectorAll('[data-store-open]').forEach(function (button) {
          button.addEventListener('click', function () {
            var id = button.getAttribute('data-store-open');
            var app = H.Registry.featured.find(function (item) { return item && item.id === id; });
            if (!app) { notify('App-Eintrag wurde nicht gefunden.', 'warn'); return; }
            try {
              if (typeof H.Launch === 'function') H.Launch(app);
              else if (H[id] && typeof H[id].open === 'function') H[id].open();
              else notify('Für diese App ist kein Startmodul verfügbar.', 'warn');
            } catch (error) {
              notify('App konnte nicht geöffnet werden: ' + (error.message || error), 'error');
            }
          });
        });
      }
      render();
    });
  }

  /* ---------------- ENCRYPTED PROFESSIONAL WORKSPACES ---------------- */
  function vaultGate(root, appConfig, onReady) {
    var vault = H.DataVault;
    if (!vault || typeof vault.getStatus !== 'function') {
      root.innerHTML = '<h2>' + esc(appConfig.icon + ' ' + appConfig.title) + '</h2>' +
        '<p style="color:#fbbf24">Der verschlüsselte HalDo DataVault v180 ist nicht geladen. Es werden keine vertraulichen Daten gespeichert.</p>';
      return;
    }
    vault.getStatus().then(function (state) {
      if (!root.isConnected) return;
      var action = state.vaultExists ? 'unlock' : 'create';
      root.innerHTML =
        '<header style="padding:16px;border:1px solid rgba(0,229,255,.25);border-radius:15px;margin-bottom:14px">' +
          '<h2 style="font-size:21px">' + esc(appConfig.icon + ' ' + appConfig.title) + '</h2>' +
          '<p style="opacity:.8;margin-top:5px">Vertrauliche Einträge werden ausschließlich im bestehenden HalDo DataVault verschlüsselt abgelegt.</p>' +
          '<p style="font-size:12px;color:#fbbf24;margin-top:8px">Lokaler Browser-Tresor · AES-GCM-256 · Schlüssel nur im Arbeitsspeicher · keine Cloud-Synchronisierung.</p>' +
        '</header>' +
        '<form data-vault-gate style="display:grid;gap:10px;max-width:520px">' +
          '<label for="hdv183-pass">Tresor-Passphrase ' + (action === 'create' ? '(mindestens 12 Zeichen)' : '') + '</label>' +
          '<input id="hdv183-pass" name="passphrase" type="password" minlength="12" maxlength="200" autocomplete="current-password" required style="padding:12px;border-radius:10px;background:rgba(0,0,0,.22);color:inherit;border:1px solid var(--border,rgba(0,229,255,.3))">' +
          '<button type="submit" style="padding:12px;border-radius:10px;background:rgba(0,229,255,.18);border:1px solid var(--accent,#00e5ff);color:inherit;font-weight:700">' +
            (action === 'create' ? 'Verschlüsselten Tresor erstellen' : 'Tresor entsperren') + '</button>' +
          '<p data-vault-message role="status" aria-live="polite" style="min-height:22px"></p>' +
        '</form>' +
        '<p style="font-size:12px;opacity:.72;margin-top:12px">Wichtig: Bei Verlust der Passphrase gibt es keine Schlüsselwiederherstellung. Vor Nutzung mit echten Mandanten- oder Schutzrechtsdaten sind zusätzliche Datenschutz-, Berufsrechts- und Sicherheitsprüfungen erforderlich.</p>';
      root.querySelector('[data-vault-gate]').addEventListener('submit', function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var pass = form.elements.passphrase.value;
        var button = form.querySelector('button[type="submit"]');
        var message = root.querySelector('[data-vault-message]');
        button.disabled = true;
        message.textContent = action === 'create' ? 'Tresor wird erstellt …' : 'Tresor wird entsperrt …';
        var task = action === 'create' ? vault.create(pass) : vault.unlock(pass);
        Promise.resolve(task).then(function () {
          form.elements.passphrase.value = '';
          onReady(root, appConfig);
        }).catch(function (error) {
          message.textContent = error.message || 'Tresorvorgang fehlgeschlagen.';
          button.disabled = false;
        });
      });
    }).catch(function (error) {
      root.innerHTML = '<p style="color:#fca5a5">DataVault-Status konnte nicht geprüft werden: ' + esc(error.message || error) + '</p>';
    });
  }

  function openVaultWorkspace(config) {
    openWindow(config.title, 'hdv183-workspace', 900, 780, function (root) {
      vaultGate(root, config, renderWorkspace);
    });
  }
  function renderWorkspace(root, config) {
    var query = '';
    var records = [];
    var statusText = '';
    function load() {
      var vault = H.DataVault;
      if (!vault.isUnlocked()) {
        root.innerHTML = '<h2>' + esc(config.title) + '</h2><p style="color:#fbbf24">Der HalDo DataVault ist gesperrt. Öffne HalDo DataVault Pro und entsperre ihn erneut.</p>';
        return;
      }
      vault.list().then(function (items) {
        return Promise.all(items.map(function (item) {
          return vault.get(item.id).then(function (payload) {
            return { id: item.id, payload: payload };
          });
        }));
      }).then(function (all) {
        if (!root.isConnected) return;
        records = all.filter(function (item) { return item.payload && item.payload.appId === config.id; });
        render();
      }).catch(function (error) {
        if (root.isConnected) root.innerHTML = '<p style="color:#fca5a5">Verschlüsselte Einträge konnten nicht geladen werden: ' + esc(error.message || error) + '</p>';
      });
    }
    function render() {
      var visible = records.filter(function (item) {
        return JSON.stringify(item.payload).toLocaleLowerCase('de-DE').indexOf(query.toLocaleLowerCase('de-DE')) >= 0;
      });
      root.innerHTML =
        '<header style="padding:16px;border:1px solid rgba(0,229,255,.25);border-radius:15px;margin-bottom:12px">' +
          '<h2 style="font-size:21px">' + esc(config.icon + ' ' + config.title) + '</h2>' +
          '<p style="opacity:.75;font-size:12px">Geschützter Arbeitsbereich · AES-GCM-256 DataVault · ' + records.length + ' Einträge</p>' +
        '</header>' +
        config.descriptionHtml +
        '<section style="margin-top:14px;padding:14px;border:1px solid rgba(0,229,255,.2);border-radius:14px">' +
          '<h3 style="margin-bottom:10px">Neuen Eintrag erfassen</h3>' +
          '<form data-workspace-form style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px">' +
            config.fields.map(function (field) {
              return '<label style="display:grid;gap:5px;font-size:12px">' + esc(field.label) +
                (field.type === 'textarea'
                  ? '<textarea name="' + esc(field.name) + '" maxlength="' + Number(field.max || 3000) + '" rows="3" ' + (field.required ? 'required' : '') + ' style="padding:10px;border-radius:9px;background:rgba(0,0,0,.2);color:inherit;border:1px solid var(--border,rgba(0,229,255,.3))"></textarea>'
                  : '<input name="' + esc(field.name) + '" type="' + esc(field.type || 'text') + '" maxlength="' + Number(field.max || 180) + '" ' + (field.required ? 'required' : '') + ' style="padding:10px;border-radius:9px;background:rgba(0,0,0,.2);color:inherit;border:1px solid var(--border,rgba(0,229,255,.3))">') +
                '</label>';
            }).join('') +
            '<div style="grid-column:1/-1"><button type="submit" style="padding:11px 16px;border-radius:10px;background:rgba(0,229,255,.16);border:1px solid var(--accent,#00e5ff);color:inherit;font-weight:700">Verschlüsselt speichern</button></div>' +
          '</form><p data-workspace-status role="status" aria-live="polite" style="margin-top:8px;min-height:20px;color:#86efac">' + esc(statusText) + '</p>' +
        '</section>' +
        '<section style="margin-top:14px"><div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:9px"><h3 style="flex:1">Gespeicherte Einträge</h3><input data-workspace-search type="search" value="' + esc(query) + '" placeholder="Einträge durchsuchen …" style="padding:9px;border-radius:9px;background:rgba(0,0,0,.2);color:inherit;border:1px solid var(--border,rgba(0,229,255,.3))"></div>' +
        (visible.length ? visible.map(function (item) {
          var p = item.payload;
          var summary = Object.keys(p).filter(function (key) { return ['appId','createdAt','updatedAt'].indexOf(key) < 0 && p[key]; })
            .map(function (key) { return '<div style="font-size:12px;margin-top:3px"><b>' + esc(key) + ':</b> ' + esc(p[key]) + '</div>'; }).join('');
          return '<article style="padding:12px;border:1px solid rgba(0,229,255,.16);border-radius:12px;margin-bottom:8px"><div style="display:flex;gap:8px;align-items:center"><b style="flex:1">' + esc(p.title || p.name || 'Eintrag') + '</b><button type="button" data-workspace-delete="' + esc(item.id) + '" style="padding:6px 9px;border-radius:8px;background:rgba(255,80,80,.12);border:1px solid rgba(255,120,120,.4);color:inherit">Löschen</button></div>' + summary + '</article>';
        }).join('') : '<p style="opacity:.7;padding:12px">Noch keine Einträge in diesem Arbeitsbereich.</p>') +
        '</section>';
      root.querySelector('[data-workspace-form]').addEventListener('submit', function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var payload = { appId: config.id, createdAt: new Date().toISOString() };
        config.fields.forEach(function (field) {
          payload[field.name] = String(form.elements[field.name].value || '').trim();
        });
        payload.title = payload.title || payload.name || payload.client || config.title;
        H.DataVault.put(payload).then(function () {
          statusText = 'Eintrag wurde verschlüsselt gespeichert.';
          load();
        }).catch(function (error) {
          statusText = 'Speichern fehlgeschlagen: ' + (error.message || error);
          var status = root.querySelector('[data-workspace-status]');
          if (status) status.textContent = statusText;
        });
      });
      root.querySelector('[data-workspace-search]').addEventListener('input', function (event) {
        query = event.target.value;
        var pos = event.target.selectionStart;
        render();
        var input = root.querySelector('[data-workspace-search]');
        input.focus();
        try { input.setSelectionRange(pos, pos); } catch (_) {}
      });
      root.querySelectorAll('[data-workspace-delete]').forEach(function (button) {
        button.addEventListener('click', function () {
          var id = button.getAttribute('data-workspace-delete');
          if (!window.confirm('Diesen verschlüsselten Eintrag endgültig löschen?')) return;
          H.DataVault.deleteRecord(id).then(load).catch(function (error) {
            statusText = 'Löschen fehlgeschlagen: ' + (error.message || error);
            render();
          });
        });
      });
    }
    load();
  }

  /* ----------------------- GERMAN LAW LIBRARY ----------------------- */
  function openLawLibrary() {
    openWindow('⚖️ HalDo Gesetze App Pro', 'hdv183-laws', 920, 760, function (root) {
      var laws = [
        { code:'GG', name:'Grundgesetz', url:'https://www.gesetze-im-internet.de/gg/', area:'Verfassungsrecht' },
        { code:'BGB', name:'Bürgerliches Gesetzbuch', url:'https://www.gesetze-im-internet.de/bgb/', area:'Zivilrecht' },
        { code:'StGB', name:'Strafgesetzbuch', url:'https://www.gesetze-im-internet.de/stgb/', area:'Strafrecht' },
        { code:'StPO', name:'Strafprozessordnung', url:'https://www.gesetze-im-internet.de/stpo/', area:'Strafprozessrecht' },
        { code:'ZPO', name:'Zivilprozessordnung', url:'https://www.gesetze-im-internet.de/zpo/', area:'Zivilprozessrecht' }
      ];
      var query = '';
      var saved = [];
      function render() {
        var matches = laws.filter(function (law) {
          return (law.code + ' ' + law.name + ' ' + law.area).toLocaleLowerCase('de-DE').indexOf(query.toLocaleLowerCase('de-DE')) >= 0;
        });
        root.innerHTML =
          '<header style="padding:16px;border:1px solid rgba(0,229,255,.25);border-radius:15px;margin-bottom:12px"><h2 style="font-size:22px">⚖️ HalDo Gesetze App Pro</h2><p style="opacity:.75">Deutsche Gesetzesportale · Paragraphen- und Gesetzessuche · Quellenprüfung</p></header>' +
          '<input data-law-search type="search" value="' + esc(query) + '" placeholder="Gesetz oder Rechtsgebiet suchen …" style="width:100%;padding:12px;border-radius:10px;background:rgba(0,0,0,.2);color:inherit;border:1px solid var(--border,rgba(0,229,255,.3));margin-bottom:12px">' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:10px">' +
          matches.map(function (law) {
            return '<article style="padding:14px;border:1px solid rgba(0,229,255,.2);border-radius:13px"><div style="font-size:12px;opacity:.7">' + esc(law.area) + '</div><h3 style="margin:5px 0">' + esc(law.code) + ' · ' + esc(law.name) + '</h3><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><a href="' + esc(law.url) + '" target="_blank" rel="noopener noreferrer" style="color:#7dd3fc">Amtlichen Gesetzestext öffnen ↗</a><button type="button" data-law-save="' + esc(law.code) + '" style="padding:6px 9px;border-radius:8px;background:rgba(0,229,255,.12);border:1px solid rgba(0,229,255,.3);color:inherit">Merken</button></div></article>';
          }).join('') +
          '</div><p style="font-size:12px;opacity:.7;margin-top:14px">Die Links führen zum amtlichen Portal „Gesetze im Internet“. Vor rechtlicher Verwendung immer die aktuell geltende Fassung, Übergangsregeln und amtliche Verkündungen prüfen. Die App ersetzt keine anwaltliche Beratung.</p><p data-law-status role="status" aria-live="polite" style="margin-top:8px;min-height:20px"></p>';
        root.querySelector('[data-law-search]').addEventListener('input', function (event) {
          query = event.target.value; var pos = event.target.selectionStart; render();
          var input = root.querySelector('[data-law-search]'); input.focus();
          try { input.setSelectionRange(pos, pos); } catch (_) {}
        });
        root.querySelectorAll('[data-law-save]').forEach(function (button) {
          button.addEventListener('click', function () {
            var law = laws.find(function (item) { return item.code === button.getAttribute('data-law-save'); });
            if (!law) return;
            if (!H.DataVault || !H.DataVault.isUnlocked()) {
              var status = root.querySelector('[data-law-status]');
              status.textContent = 'Zum sicheren Merken bitte zuerst HalDo DataVault Pro entsperren.';
              return;
            }
            H.DataVault.put({ appId:'gesetze-pro', title:law.code + ' – ' + law.name, code:law.code, url:law.url, area:law.area, createdAt:new Date().toISOString() })
              .then(function () { root.querySelector('[data-law-status]').textContent = law.code + ' wurde verschlüsselt gemerkt.'; })
              .catch(function (error) { root.querySelector('[data-law-status]').textContent = error.message || 'Speichern fehlgeschlagen.'; });
          });
        });
      }
      render();
    });
  }

  /* ----------------------- LOGO & IP WORKBENCH ----------------------- */
  function openBrandStudio() {
    openWindow('🎨 HalDo Logo & Patent App Pro', 'hdv183-brand', 940, 780, function (root) {
      var brand = 'HalDo';
      var subtitle = 'AI OS PRO MAX';
      var color = '#00d9ff';
      var shape = 'circle';
      function validColor(value) { return /^#[0-9a-f]{6}$/i.test(value) ? value : '#00d9ff'; }
      function svgMarkup() {
        var safeColor = validColor(color);
        var shapeMarkup = shape === 'square'
          ? '<rect x="14" y="14" width="72" height="72" rx="18" fill="' + safeColor + '" fill-opacity=".14" stroke="' + safeColor + '" stroke-width="2"/>'
          : '<circle cx="50" cy="50" r="36" fill="' + safeColor + '" fill-opacity=".12" stroke="' + safeColor + '" stroke-width="2"/>';
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" role="img" aria-label="Logo-Entwurf">' + shapeMarkup +
          '<path d="M28 53 L43 68 L73 34" fill="none" stroke="' + safeColor + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
          '</svg>';
      }
      function render() {
        root.innerHTML =
          '<header style="padding:16px;border:1px solid rgba(0,229,255,.25);border-radius:15px;margin-bottom:12px"><h2 style="font-size:22px">🎨 HalDo Logo & Patent App Pro</h2><p style="opacity:.75">Logo-Entwürfe, Markenprojekte und Schutzrechtsfristen verwalten.</p></header>' +
          '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:14px">' +
            '<section style="padding:14px;border:1px solid rgba(0,229,255,.2);border-radius:14px"><h3>Logo-Studio</h3><label style="display:grid;gap:5px;margin-top:10px">Markenname<input data-brand-name maxlength="48" value="' + esc(brand) + '" style="padding:10px;border-radius:8px;background:rgba(0,0,0,.2);color:inherit"></label>' +
            '<label style="display:grid;gap:5px;margin-top:10px">Unterzeile<input data-brand-sub maxlength="64" value="' + esc(subtitle) + '" style="padding:10px;border-radius:8px;background:rgba(0,0,0,.2);color:inherit"></label>' +
            '<label style="display:grid;gap:5px;margin-top:10px">Akzentfarbe<input data-brand-color type="color" value="' + esc(color) + '"></label>' +
            '<label style="display:grid;gap:5px;margin-top:10px">Form<select data-brand-shape style="padding:9px;background:#102033;color:inherit"><option value="circle"' + (shape === 'circle' ? ' selected' : '') + '>Kreis</option><option value="square"' + (shape === 'square' ? ' selected' : '') + '>Abgerundetes Quadrat</option></select></label>' +
            '<div data-brand-preview style="display:flex;align-items:center;gap:12px;padding:12px;margin-top:12px;border-radius:12px;background:rgba(0,0,0,.2)">' + svgMarkup() + '<div><b>' + esc(brand) + '</b><div style="font-size:11px;opacity:.7">' + esc(subtitle) + '</div></div></div>' +
            '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button type="button" data-brand-export style="padding:9px 12px;border-radius:9px;background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.4);color:inherit">SVG exportieren</button><button type="button" data-brand-save style="padding:9px 12px;border-radius:9px;background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.4);color:inherit">Projekt verschlüsselt speichern</button></div></section>' +
            '<section style="padding:14px;border:1px solid rgba(0,229,255,.2);border-radius:14px"><h3>Marken- & Patentverwaltung</h3><p style="font-size:12px;opacity:.75;margin:8px 0">Recherche und Anmeldung müssen bei den zuständigen Stellen selbst geprüft und durchgeführt werden.</p>' +
            '<div style="display:grid;gap:9px"><a href="https://register.dpma.de/DPMAregister/marke/einsteiger" target="_blank" rel="noopener noreferrer">DPMAregister – deutsche Marken ↗</a><a href="https://euipo.europa.eu/" target="_blank" rel="noopener noreferrer">EUIPO – Unionsmarken ↗</a><a href="https://www.wipo.int/" target="_blank" rel="noopener noreferrer">WIPO – internationale Schutzrechte ↗</a><a href="https://www.dpma.de/" target="_blank" rel="noopener noreferrer">DPMA – Patente und Schutzrechte ↗</a></div>' +
            '<hr style="border:0;border-top:1px solid rgba(0,229,255,.2);margin:14px 0"><form data-ip-form style="display:grid;gap:8px"><label>Projekt / Marke<input name="title" required maxlength="100" style="width:100%;padding:9px;border-radius:8px;background:rgba(0,0,0,.2);color:inherit"></label><label>Schutzart<select name="type" style="width:100%;padding:9px;background:#102033;color:inherit"><option>Marke</option><option>Patent</option><option>Gebrauchsmuster</option><option>Design</option><option>Urheberrechtliche Dokumentation</option></select></label><label>Status<input name="status" maxlength="60" placeholder="z. B. Recherche offen" style="width:100%;padding:9px;border-radius:8px;background:rgba(0,0,0,.2);color:inherit"></label><label>Frist / Wiedervorlage<input name="deadline" type="date" style="width:100%;padding:9px;border-radius:8px;background:rgba(0,0,0,.2);color:inherit"></label><button type="submit" style="padding:10px;border-radius:9px;background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.4);color:inherit">Schutzrechtsprojekt verschlüsselt speichern</button></form><p data-ip-status role="status" aria-live="polite" style="font-size:12px;margin-top:8px"></p></section>' +
          '</div>' +
          '<p style="font-size:12px;opacity:.7;margin-top:12px">Ein erzeugter Entwurf ist keine Markenrecherche und keine Zusage der Eintragungs- oder Patentfähigkeit. Das Originalprojektlogo wird nicht überschrieben.</p>';
        root.querySelector('[data-brand-name]').addEventListener('input', function (event) { brand = event.target.value; updatePreview(); });
        root.querySelector('[data-brand-sub]').addEventListener('input', function (event) { subtitle = event.target.value; updatePreview(); });
        root.querySelector('[data-brand-color]').addEventListener('input', function (event) { color = validColor(event.target.value); updatePreview(); });
        root.querySelector('[data-brand-shape]').addEventListener('change', function (event) { shape = event.target.value === 'square' ? 'square' : 'circle'; updatePreview(); });
        function updatePreview() {
          var host = root.querySelector('[data-brand-preview]');
          if (host) host.innerHTML = svgMarkup() + '<div><b>' + esc(brand) + '</b><div style="font-size:11px;opacity:.7">' + esc(subtitle) + '</div></div>';
        }
        root.querySelector('[data-brand-export]').addEventListener('click', function () {
          var svg = svgMarkup();
          var link = document.createElement('a');
          link.href = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
          link.download = 'haldo-logo-entwurf.svg';
          link.style.position = 'fixed';
          link.style.left = '-10000px';
          link.style.top = '0';
          document.body.appendChild(link);
          link.click();
          window.setTimeout(function () { link.remove(); }, 1000);
        });
        root.querySelector('[data-brand-save]').addEventListener('click', function () {
          if (!H.DataVault || !H.DataVault.isUnlocked()) {
            root.querySelector('[data-ip-status]').textContent = 'Zum Speichern bitte zuerst HalDo DataVault Pro entsperren.';
            return;
          }
          H.DataVault.put({ appId:'logo-patent-pro', title:brand + ' – Logoentwurf', brand:brand, subtitle:subtitle, color:color, shape:shape, svg:svgMarkup(), createdAt:new Date().toISOString() })
            .then(function () { root.querySelector('[data-ip-status]').textContent = 'Logoentwurf wurde verschlüsselt gespeichert.'; })
            .catch(function (error) { root.querySelector('[data-ip-status]').textContent = error.message || 'Speichern fehlgeschlagen.'; });
        });
        root.querySelector('[data-ip-form]').addEventListener('submit', function (event) {
          event.preventDefault();
          if (!H.DataVault || !H.DataVault.isUnlocked()) {
            root.querySelector('[data-ip-status]').textContent = 'Zum Speichern bitte zuerst HalDo DataVault Pro entsperren.';
            return;
          }
          var form = event.currentTarget;
          var payload = { appId:'logo-patent-pro', title:form.elements.title.value.trim(), type:form.elements.type.value, status:form.elements.status.value.trim(), deadline:form.elements.deadline.value, createdAt:new Date().toISOString() };
          H.DataVault.put(payload).then(function () { form.reset(); root.querySelector('[data-ip-status]').textContent = 'Schutzrechtsprojekt wurde verschlüsselt gespeichert.'; })
            .catch(function (error) { root.querySelector('[data-ip-status]').textContent = error.message || 'Speichern fehlgeschlagen.'; });
        });
      }
      render();
    });
  }

  var apps = [];
  // The existing stable app-registry ID is upgraded rather than duplicated.
  apps.push(registerApp('app-registry', 'HalDo AI AppStore Pro Max', '🛍️', 'A',
    'Zentrale App-Übersicht, Suche, Kategorien und Startstatus.', openAppStore));
  apps.push(registerApp('anwaelte-pro', 'HalDo Anwälte App Pro', '⚖️', 'A',
    'Mandanten- und Aktenorganisation im verschlüsselten DataVault.', function () {
      openVaultWorkspace({
        id:'anwaelte-pro', title:'HalDo Anwälte App Pro', icon:'⚖️',
        descriptionHtml:'<p style="font-size:12px;opacity:.75">Organisationshilfe für Kanzleiabläufe. Keine Rechtsberatung, keine Fristenberechnung und kein Ersatz für anwaltliche Fachsoftware.</p>',
        fields:[
          { name:'client', label:'Mandant / Organisation', required:true, max:180 },
          { name:'matter', label:'Aktenzeichen / Angelegenheit', required:true, max:180 },
          { name:'status', label:'Bearbeitungsstatus', max:100 },
          { name:'deadline', label:'Wiedervorlage / Frist', type:'date' },
          { name:'notes', label:'Interne Notiz (nur nach Datenschutzprüfung)', type:'textarea', max:3000 }
        ]
      });
    }));
  apps.push(registerApp('gesetze-pro', 'HalDo Gesetze App Pro', '📚', 'G',
    'Durchsuchbarer Einstieg zu wichtigen deutschen Gesetzen und amtlichen Quellen.', openLawLibrary));
  apps.push(registerApp('logo-patent-pro', 'HalDo Logo & Patent App Pro', '™️', 'L',
    'Logo-Entwürfe, Markenprojekte und Schutzrechtsfristen.', openBrandStudio));

  H.ProfessionalSuiteV183 = Object.freeze({
    version: VERSION,
    apps: apps.slice(),
    getStatus: function () {
      return {
        version: VERSION,
        registered: apps.map(function (app) {
          return { id: app.id, title: app.title, ready: !!(H[app.id] && typeof H[app.id].open === 'function') };
        }),
        appStoreRegistryCount: H.Registry.featured.length,
        encryptedVaultAvailable: !!(H.DataVault && typeof H.DataVault.put === 'function'),
        liveInstallAndUpdateService: false,
        legalAdviceService: false,
        trademarkClearanceService: false
      };
    }
  });
  H.Master = H.Master || {};
  H.Master.version = VERSION;
  H.Master.namedCoreApps = H.Registry.featured.length;
  console.info('[HalDo v183] AppStore Pro Max and three professional apps registered.');
})(window, document);
