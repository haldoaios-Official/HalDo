/* ================================================================
   HALDO AI OS PRO MAX — v179 Permission & Consent Core
   Explicit app manifests, visible user consent, session-only grants.
   Browser permission status is read separately; browser site grants
   cannot be revoked programmatically by this application.
   No localStorage/sessionStorage persistence for grants.
   ================================================================ */
(function (window, document) {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var VERSION = '179.0.0';
  var PERMISSIONS = {
    camera: {
      label: 'Kamera',
      description: 'Kamerazugriff für Video- oder Foto-Funktionen.',
      browserApi: 'camera',
      available: function () {
        return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
      }
    },
    microphone: {
      label: 'Mikrofon',
      description: 'Mikrofonzugriff für Sprach- und Audiofunktionen.',
      browserApi: 'microphone',
      available: function () {
        return !!(navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function');
      }
    },
    location: {
      label: 'Standort',
      description: 'Standortzugriff für ausdrücklich angeforderte Standortfunktionen.',
      browserApi: 'geolocation',
      available: function () {
        return !!(navigator.geolocation && typeof navigator.geolocation.getCurrentPosition === 'function');
      }
    },
    notifications: {
      label: 'Benachrichtigungen',
      description: 'Systembenachrichtigungen dieser Website anzeigen.',
      browserApi: 'notifications',
      available: function () {
        return typeof window.Notification !== 'undefined' && typeof window.Notification.requestPermission === 'function';
      }
    }
  };
  Object.keys(PERMISSIONS).forEach(function (key) {
    Object.freeze(PERMISSIONS[key]);
  });
  Object.freeze(PERMISSIONS);

  var manifests = new Map();
  var grants = new Map();
  var pending = new Map();
  var requestSequence = 0;
  var APP_ID = 'privacy-center';
  var ROOT_PREFIX = 'hdv179-';

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function identifier(value, label) {
    if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9._-]{0,79}$/i.test(value)) {
      throw new Error('Ungültige ' + label + '-Kennung.');
    }
    return value;
  }

  function getApp(appId) {
    var id = identifier(appId, 'App');
    if (H.AICore && typeof H.AICore.getApp === 'function') return H.AICore.getApp(id);
    var registry = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured : [];
    var item = registry.find(function (app) { return app && app.id === id; });
    return item ? { id: item.id, name: item.n || item.name || item.id } : null;
  }

  function normalizePermissions(list) {
    if (!Array.isArray(list) || list.length > 10) {
      throw new TypeError('Ein App-Manifest benötigt eine Berechtigungsliste mit höchstens 10 Einträgen.');
    }
    var result = [];
    list.forEach(function (item) {
      if (typeof item !== 'string' || !Object.prototype.hasOwnProperty.call(PERMISSIONS, item)) {
        throw new Error('Nicht unterstützte HalDo-Berechtigung: ' + String(item));
      }
      if (result.indexOf(item) < 0) result.push(item);
    });
    return result;
  }

  function emitAudit(permission, appId, status) {
    try {
      if (H.AICore && H.AICore.events && typeof H.AICore.events.emit === 'function') {
        H.AICore.events.emit('permission:decision', {
          appId: appId,
          action: permission,
          status: status,
          resourceType: 'permission',
          source: 'permission-core'
        });
      }
    } catch (error) {
      console.warn('[HalDo v179] Ereignis konnte nicht publiziert werden:', error);
    }
  }

  function registerApp(appId, permissions) {
    var id = identifier(appId, 'App');
    var app = getApp(id);
    if (!app) throw new Error('Die App ist nicht in der HalDo-Registry registriert: ' + id);
    var allowed = normalizePermissions(permissions);
    manifests.set(id, Object.freeze(allowed.slice()));
    return Object.freeze({ appId: id, permissions: allowed.slice() });
  }

  function unregisterApp(appId) {
    var id = identifier(appId, 'App');
    manifests.delete(id);
    var removed = revokeAll(id);
    return { appId: id, revoked: removed };
  }

  function getGrantMap(appId) {
    var id = identifier(appId, 'App');
    if (!grants.has(id)) grants.set(id, new Set());
    return grants.get(id);
  }

  function has(permission, appId) {
    if (!Object.prototype.hasOwnProperty.call(PERMISSIONS, permission)) return false;
    if (typeof appId !== 'string' || !appId) return false;
    var set = grants.get(appId);
    return !!(set && set.has(permission));
  }

  function nativePermissionStatus(permission) {
    var descriptor = PERMISSIONS[permission];
    if (!descriptor || !descriptor.available()) return Promise.resolve('unsupported');
    if (permission === 'notifications' && window.Notification) {
      var value = window.Notification.permission;
      return Promise.resolve(value === 'granted' ? 'granted' : value === 'denied' ? 'denied' : 'prompt');
    }
    if (!navigator.permissions || typeof navigator.permissions.query !== 'function') {
      return Promise.resolve('unknown');
    }
    return navigator.permissions.query({ name: descriptor.browserApi }).then(function (status) {
      return status && status.state ? status.state : 'unknown';
    }).catch(function () {
      return 'unknown';
    });
  }

  function getBrowserStatus() {
    return Promise.all(Object.keys(PERMISSIONS).map(function (key) {
      return nativePermissionStatus(key).then(function (state) {
        return { id: key, label: PERMISSIONS[key].label, available: PERMISSIONS[key].available(), state: state };
      });
    }));
  }

  function requestBrowserPermission(permission) {
    var descriptor = PERMISSIONS[permission];
    if (!descriptor || !descriptor.available()) return Promise.resolve(false);

    if (permission === 'camera' || permission === 'microphone') {
      return navigator.mediaDevices.getUserMedia({
        video: permission === 'camera',
        audio: permission === 'microphone'
      }).then(function (stream) {
        stream.getTracks().forEach(function (track) {
          try { track.stop(); } catch (_) {}
        });
        return true;
      }).catch(function () {
        return false;
      });
    }

    if (permission === 'location') {
      return new Promise(function (resolve) {
        navigator.geolocation.getCurrentPosition(
          function () { resolve(true); },
          function () { resolve(false); },
          { enableHighAccuracy: false, maximumAge: 0, timeout: 12000 }
        );
      });
    }

    if (permission === 'notifications') {
      return window.Notification.requestPermission().then(function (state) {
        return state === 'granted';
      }).catch(function () {
        return false;
      });
    }

    return Promise.resolve(false);
  }

  function removePending(id) {
    var item = pending.get(id);
    if (!item) return;
    pending.delete(id);
    if (item.windowId && H.Win && typeof H.Win.close === 'function') {
      try { H.Win.close(item.windowId); } catch (_) {}
    }
  }

  function request(permission, appId) {
    var id = identifier(appId, 'App');
    var app = getApp(id);
    if (!app) return Promise.reject(new Error('HalDo-App nicht gefunden: ' + id));
    if (!Object.prototype.hasOwnProperty.call(PERMISSIONS, permission)) {
      return Promise.reject(new Error('Nicht unterstützte Berechtigung: ' + String(permission)));
    }
    var declaration = manifests.get(id);
    if (!declaration || declaration.indexOf(permission) < 0) {
      return Promise.reject(new Error('Die App hat diese Berechtigung nicht in ihrem Manifest deklariert: ' + id));
    }
    if (has(permission, id)) return Promise.resolve(true);
    if (!PERMISSIONS[permission].available()) {
      return Promise.reject(new Error('Diese Browserfunktion ist in der aktuellen Umgebung nicht verfügbar.'));
    }
    if (!H.Win || typeof H.Win.open !== 'function') {
      return Promise.reject(new Error('Der HalDo-Freigabedialog ist nicht verfügbar.'));
    }

    var pendingKey = id + ':' + permission;
    if (pending.has(pendingKey)) return pending.get(pendingKey).promise;

    requestSequence += 1;
    var rootId = ROOT_PREFIX + Date.now().toString(36) + '-' + requestSequence.toString(36);
    var appName = app.name || id;
    var definition = PERMISSIONS[permission];
    var html = [
      '<div class="hdv179-consent" id="' + esc(rootId) + '" style="color:var(--text,#e6f7ff);font:14px/1.55 system-ui,sans-serif;padding:8px 4px">',
      '<div style="font-size:34px;margin-bottom:8px">🛡️</div>',
      '<h2 style="font-size:19px;margin:0 0 8px;color:var(--accent,#00e5ff)">Berechtigungsanfrage</h2>',
      '<p style="margin:0 0 12px"><strong>' + esc(appName) + '</strong> möchte Zugriff auf <strong>' + esc(definition.label) + '</strong> erhalten.</p>',
      '<p style="opacity:.82;margin:0 0 14px">' + esc(definition.description) + '</p>',
      '<div style="padding:11px;border:1px solid var(--border,rgba(0,229,255,.4));border-radius:12px;background:rgba(0,0,0,.16);margin-bottom:14px">',
      '<strong>Was passiert?</strong><br>HalDo zeigt zuerst diese Freigabe. Erst nach deiner Zustimmung fragt der Browser nach seiner eigenen Berechtigung. HalDo speichert die Freigabe nur bis zum Neuladen dieser Sitzung.',
      '</div>',
      '<p data-consent-status role="status" aria-live="polite" style="min-height:20px;opacity:.82;margin:0 0 10px">Du kannst die Anfrage ablehnen, ohne die App zu schließen.</p>',
      '<div style="display:flex;gap:9px;flex-wrap:wrap">',
      '<button type="button" data-consent-deny style="flex:1;min-width:120px;padding:11px;border-radius:11px;border:1px solid var(--border,rgba(0,229,255,.4));background:rgba(255,255,255,.06);color:inherit;cursor:pointer">Ablehnen</button>',
      '<button type="button" data-consent-allow style="flex:1;min-width:150px;padding:11px;border-radius:11px;border:1px solid var(--accent,#00e5ff);background:rgba(0,229,255,.16);color:inherit;font-weight:700;cursor:pointer">Zustimmen und fortfahren</button>',
      '</div></div>'
    ].join('');

    var resolveRequest;
    var promise = new Promise(function (resolve) { resolveRequest = resolve; });
    var windowId = H.Win.open('🛡️ HalDo Berechtigungsfreigabe', html, { w: 440, h: 480 });
    var record = { promise: promise, windowId: windowId, resolve: resolveRequest };
    pending.set(pendingKey, record);

    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (!root) {
        pending.delete(pendingKey);
        emitAudit(permission, id, 'denied');
        resolveRequest(false);
        return;
      }
      var allow = root.querySelector('[data-consent-allow]');
      var deny = root.querySelector('[data-consent-deny]');
      var status = root.querySelector('[data-consent-status]');
      var busy = false;
      var settled = false;
      var closeObserver = new MutationObserver(function () {
        if (root.isConnected || settled) return;
        settled = true;
        pending.delete(pendingKey);
        emitAudit(permission, id, 'denied');
        resolveRequest(false);
        closeObserver.disconnect();
      });
      closeObserver.observe(document.body, { childList: true, subtree: true });

      function finish(granted, outcome) {
        if (busy || settled) return;
        busy = true;
        settled = true;
        closeObserver.disconnect();
        if (status) status.textContent = outcome;
        if (granted) {
          getGrantMap(id).add(permission);
          emitAudit(permission, id, 'granted');
        } else {
          emitAudit(permission, id, 'denied');
        }
        window.setTimeout(function () {
          pending.delete(pendingKey);
          try { if (windowId) H.Win.close(windowId); } catch (_) {}
          resolveRequest(granted);
        }, 120);
      }

      if (deny) deny.addEventListener('click', function () {
        finish(false, 'Die Anfrage wurde abgelehnt.');
      });

      if (allow) allow.addEventListener('click', function () {
        if (busy) return;
        busy = true;
        if (allow) allow.disabled = true;
        if (deny) deny.disabled = true;
        if (status) status.textContent = 'Browserberechtigung wird angefragt …';
        requestBrowserPermission(permission).then(function (browserGranted) {
          if (settled) return;
          busy = false;
          if (browserGranted) {
            finish(true, 'Freigabe erteilt. Sie gilt nur für diese HalDo-Sitzung.');
          } else {
            finish(false, 'Der Browser hat den Zugriff nicht freigegeben.');
          }
        }).catch(function () {
          if (settled) return;
          busy = false;
          finish(false, 'Die Browseranfrage ist fehlgeschlagen.');
        });
      });
    }, 40);

    return promise;
  }

  function revoke(permission, appId) {
    var id = identifier(appId, 'App');
    if (!Object.prototype.hasOwnProperty.call(PERMISSIONS, permission)) return false;
    var set = grants.get(id);
    if (!set || !set.has(permission)) return false;
    set.delete(permission);
    emitAudit(permission, id, 'revoked');
    return true;
  }

  function revokeAll(appId) {
    var id = identifier(appId, 'App');
    var set = grants.get(id);
    if (!set) return 0;
    var count = set.size;
    set.forEach(function (permission) {
      emitAudit(permission, id, 'revoked');
    });
    set.clear();
    return count;
  }

  function listApps() {
    return Array.from(manifests.entries()).map(function (entry) {
      var id = entry[0];
      var app = getApp(id);
      return {
        id: id,
        name: app ? app.name : id,
        permissions: entry[1].map(function (permission) {
          return {
            id: permission,
            label: PERMISSIONS[permission].label,
            granted: has(permission, id),
            browserAvailable: PERMISSIONS[permission].available()
          };
        })
      };
    });
  }

  function getStatus() {
    var grantedCount = 0;
    grants.forEach(function (set) { grantedCount += set.size; });
    return {
      version: VERSION,
      manifestCount: manifests.size,
      sessionGrantCount: grantedCount,
      persistentGrants: false,
      explicitConsentRequired: true,
      browserPermissionStatusSeparate: true,
      browserCapabilities: Object.keys(PERMISSIONS)
    };
  }

  function openCenter() {
    var rootId = ROOT_PREFIX + 'center-' + Date.now().toString(36);
    var html = [
      '<div class="hdv179-center" id="' + esc(rootId) + '" style="font:14px/1.5 system-ui,sans-serif;color:var(--text,#e6f7ff);padding:6px">',
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">',
      '<div style="font-size:34px">🛡️</div><div><h2 style="font-size:20px;margin:0;color:var(--accent,#00e5ff)">HalDo Privacy & Consent Center Pro</h2><p style="opacity:.75;margin:2px 0 0">Berechtigungen · Einwilligungen · Browserstatus</p></div>',
      '</div>',
      '<div data-center-summary style="padding:12px;border-radius:12px;background:rgba(0,229,255,.08);border:1px solid var(--border,rgba(0,229,255,.3));margin-bottom:12px">Sitzungsfreigaben werden geladen …</div>',
      '<section style="margin-bottom:16px"><h3 style="font-size:15px;margin:0 0 8px">App-Berechtigungen</h3><div data-center-apps>Wird geladen …</div></section>',
      '<section><div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px"><h3 style="font-size:15px;margin:0">Browser-Berechtigungen</h3><button type="button" data-center-refresh style="padding:7px 10px;border-radius:9px;border:1px solid var(--border,rgba(0,229,255,.4));background:rgba(255,255,255,.06);color:inherit;cursor:pointer">Aktualisieren</button></div><div data-center-browser>Wird geprüft …</div></section>',
      '<p style="font-size:12px;opacity:.7;margin-top:14px">Wichtig: HalDo-Sitzungsfreigaben lassen sich hier widerrufen. Browser-Websiteberechtigungen werden separat vom Browser verwaltet und müssen dort geändert werden. Freigaben werden nicht dauerhaft gespeichert.</p>',
      '<div style="display:flex;justify-content:flex-end;margin-top:12px"><button type="button" data-center-revoke-all style="padding:9px 12px;border-radius:10px;border:1px solid rgba(255,140,120,.65);background:rgba(255,100,80,.1);color:inherit;cursor:pointer">Alle HalDo-Sitzungsfreigaben widerrufen</button></div>',
      '</div>'
    ].join('');

    H.Win.open('🛡️ HalDo Privacy & Consent Center Pro', html, { w: 760, h: 720 });
    window.setTimeout(function () {
      var root = document.getElementById(rootId);
      if (!root) return;
      var appHost = root.querySelector('[data-center-apps]');
      var browserHost = root.querySelector('[data-center-browser]');
      var summary = root.querySelector('[data-center-summary]');

      function renderApps() {
        var apps = listApps();
        if (!apps.length) {
          appHost.innerHTML = '<p style="opacity:.75">Noch keine App hat ein Berechtigungsmanifest registriert. Eine App darf keine Rechte automatisch erhalten; ihre benötigten Fähigkeiten müssen zuerst ausdrücklich deklariert werden.</p>';
          return;
        }
        appHost.innerHTML = apps.map(function (app) {
          var rows = app.permissions.map(function (item) {
            return '<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:8px 0;border-top:1px solid rgba(255,255,255,.08)"><span>' + esc(item.label) + ' <small style="opacity:.7">(' + (item.granted ? 'HalDo freigegeben' : 'nicht freigegeben') + ')</small></span><button type="button" data-permission-action="' + esc(item.id) + '" data-app-id="' + esc(app.id) + '" data-revoke="' + (item.granted ? '1' : '0') + '" style="padding:7px 10px;border-radius:8px;border:1px solid var(--border,rgba(0,229,255,.4));background:rgba(0,229,255,.08);color:inherit;cursor:pointer">' + (item.granted ? 'Widerrufen' : 'Anfragen') + '</button></div>';
          }).join('');
          return '<article style="padding:11px;border-radius:12px;border:1px solid var(--border,rgba(0,229,255,.25));margin-bottom:9px"><strong>' + esc(app.name) + '</strong>' + (rows || '<p style="opacity:.7;margin-top:6px">Keine Berechtigungen deklariert.</p>') + '</article>';
        }).join('');
      }

      function renderSummary() {
        var status = getStatus();
        summary.textContent = 'Aktive HalDo-Sitzungsfreigaben: ' + status.sessionGrantCount +
          ' · App-Manifeste: ' + status.manifestCount +
          ' · Dauerhafte Freigaben: deaktiviert';
      }

      function renderBrowser() {
        browserHost.textContent = 'Browserstatus wird geprüft …';
        getBrowserStatus().then(function (items) {
          if (!root.isConnected) return;
          browserHost.innerHTML = items.map(function (item) {
            return '<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-top:1px solid rgba(255,255,255,.08)"><span>' + esc(item.label) + '</span><span style="opacity:.8">' + esc(item.state) + (item.available ? '' : ' · nicht verfügbar') + '</span></div>';
          }).join('');
        });
      }

      root.addEventListener('click', function (event) {
        var button = event.target.closest('button');
        if (!button) return;
        if (button.hasAttribute('data-center-refresh')) {
          renderBrowser();
          renderSummary();
          return;
        }
        if (button.hasAttribute('data-center-revoke-all')) {
          var total = 0;
          listApps().forEach(function (app) { total += revokeAll(app.id); });
          renderApps();
          renderSummary();
          return;
        }
        if (button.hasAttribute('data-permission-action')) {
          var appId = button.getAttribute('data-app-id');
          var permission = button.getAttribute('data-permission-action');
          if (button.getAttribute('data-revoke') === '1') {
            revoke(permission, appId);
            renderApps();
            renderSummary();
            return;
          }
          request(permission, appId).then(function () {
            renderApps();
            renderSummary();
            renderBrowser();
          }).catch(function (error) {
            button.title = error.message;
          });
        }
      });
      renderApps();
      renderSummary();
      renderBrowser();
    }, 70);
  }

  var registry = H.Registry;
  if (registry && Array.isArray(registry.featured)) {
    var existing = registry.featured.find(function (app) { return app && app.id === APP_ID; });
    if (existing) {
      existing.n = 'HalDo Privacy & Consent Center Pro';
      existing.i = '🛡️';
    } else {
      registry.featured.push({ id: APP_ID, n: 'HalDo Privacy & Consent Center Pro', i: '🛡️' });
    }
  }

  var api = {
    version: VERSION,
    permissions: Object.freeze(Object.keys(PERMISSIONS)),
    describe: function (id) { return PERMISSIONS[id] || null; },
    registerApp: registerApp,
    unregisterApp: unregisterApp,
    request: request,
    has: has,
    revoke: revoke,
    revokeAll: revokeAll,
    listApps: listApps,
    getBrowserStatus: getBrowserStatus,
    getStatus: getStatus,
    open: openCenter
  };

  H.PermissionCore = api;
  H[APP_ID] = { open: openCenter, version: VERSION, implementationKind: 'module' };
  if (H.Registry && Array.isArray(H.Registry.featured)) {
    var finalEntry = H.Registry.featured.find(function (app) { return app && app.id === APP_ID; });
    if (finalEntry) {
      finalEntry.n = 'HalDo Privacy & Consent Center Pro';
      finalEntry.i = '🛡️';
    }
  }

  if (H.AICore) {
    H.AICore.permissions = Object.freeze({
      request: request,
      has: has,
      revoke: revoke,
      revokeAll: revokeAll,
      hasService: function () { return true; }
    });
    var previousStatus = H.AICore.getStatus;
    if (typeof previousStatus === 'function' && !previousStatus.__v179Wrapped) {
      var wrappedStatus = function () {
        var status = previousStatus.call(H.AICore);
        status.permissionService = true;
        status.permissionCoreVersion = VERSION;
        status.permissionModel = 'explicit-session-consent';
        return status;
      };
      wrappedStatus.__v179Wrapped = true;
      H.AICore.getStatus = wrappedStatus;
    }
  }

  try {
    registerApp(APP_ID, []);
  } catch (error) {
    console.error('[HalDo v179] Privacy Center konnte nicht registriert werden:', error);
  }

  H.Master = H.Master || {};
  H.Master.permissionCoreVersion = VERSION;
  console.info('[HalDo v179] Permission & Consent Core bereit.', getStatus());
})(window, document);
