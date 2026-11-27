/* ================================================================
   HALDO AI OS PRO MAX — v178 AI Core Foundation
   Integrates existing platform services without impersonating absent
   authentication, permission, secure-vault or AI-inference backends.

   Event transport: existing HalDo VoiceHub (no second event bus).
   Registry: read-only view of the existing featured app registry.
   Preferences: non-sensitive local preferences only via H.Store.
   Identity: presentation settings only via IdentityBridge.
   ================================================================ */
(function (window) {
  'use strict';

  var H = window.HalDo = window.HalDo || {};
  var VERSION = '178.0.0';
  var AUDIT_LIMIT = 100;
  var MAX_METADATA_BYTES = 8192;
  var audit = [];
  var sequence = 0;
  var CORE_STORE_PREFIX = 'haldo_aicore_v178:';
  var SECRET_KEY_PATTERN = /(password|passphrase|credential|token|secret|medical|health|patient|medication|diagnos|labor|vital|insurance|auth)/i;
  var EVENT_NAME_PATTERN = /^[a-z0-9][a-z0-9:_-]{0,63}$/i;
  var METADATA_KEYS = {
    appId: true,
    action: true,
    status: true,
    resourceType: true,
    resourceId: true,
    correlationId: true,
    timestamp: true,
    count: true,
    durationMs: true,
    reason: true,
    source: true,
    version: true
  };

  function isPlainObject(value) {
    if (!value || Object.prototype.toString.call(value) !== '[object Object]') return false;
    var prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  }

  function safeString(value, maxLength) {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, maxLength || 240);
  }

  function makeId() {
    sequence += 1;
    return 'hdcore178-' + Date.now().toString(36) + '-' + sequence.toString(36);
  }

  function addAudit(eventName, metadata) {
    var entry = {
      id: makeId(),
      timestamp: new Date().toISOString(),
      event: eventName,
      appId: safeString(metadata.appId, 96) || null,
      action: safeString(metadata.action, 96) || null,
      status: safeString(metadata.status, 48) || null,
      source: safeString(metadata.source, 64) || null
    };
    audit.push(entry);
    if (audit.length > AUDIT_LIMIT) audit.splice(0, audit.length - AUDIT_LIMIT);
    return entry;
  }

  function normalizeEventMetadata(metadata) {
    if (metadata == null) return {};
    if (!isPlainObject(metadata)) throw new TypeError('HalDo AI Core events require a plain metadata object.');
    var normalized = {};
    Object.keys(metadata).forEach(function (key) {
      if (!METADATA_KEYS[key]) {
        throw new Error('HalDo AI Core accepts metadata only; unsupported field: ' + key);
      }
      var value = metadata[key];
      if (value == null) return;
      if (typeof value === 'string') {
        normalized[key] = value.slice(0, 240);
      } else if (typeof value === 'number' && Number.isFinite(value)) {
        normalized[key] = value;
      } else if (typeof value === 'boolean') {
        normalized[key] = value;
      } else {
        throw new TypeError('HalDo AI Core event metadata values must be strings, finite numbers, booleans or null.');
      }
    });
    var serialized = JSON.stringify(normalized);
    if (new TextEncoder().encode(serialized).length > MAX_METADATA_BYTES) {
      throw new Error('HalDo AI Core event metadata exceeds the 8 KB limit.');
    }
    return normalized;
  }

  function hasVoiceHub() {
    return !!(H.VoiceHub && typeof H.VoiceHub.on === 'function' && typeof H.VoiceHub.emit === 'function');
  }

  function eventTopic(name) {
    var normalized = safeString(name, 64);
    if (!EVENT_NAME_PATTERN.test(normalized)) throw new Error('Invalid HalDo AI Core event name.');
    return 'haldo:core:' + normalized;
  }

  function on(name, handler) {
    if (typeof handler !== 'function') throw new TypeError('HalDo AI Core event listener must be a function.');
    if (!hasVoiceHub()) throw new Error('HalDo VoiceHub is not available in this runtime.');
    return H.VoiceHub.on(eventTopic(name), handler);
  }

  function emit(name, metadata) {
    if (!hasVoiceHub()) throw new Error('HalDo VoiceHub is not available in this runtime.');
    var topic = eventTopic(name);
    var safeMetadata = normalizeEventMetadata(metadata);
    var envelope = {
      source: 'haldo-ai-core',
      version: VERSION,
      name: safeString(name, 64),
      timestamp: new Date().toISOString(),
      metadata: safeMetadata
    };
    H.VoiceHub.emit(topic, envelope);
    addAudit(topic, safeMetadata);
    return true;
  }

  function listApps() {
    var entries = H.Registry && Array.isArray(H.Registry.featured) ? H.Registry.featured : [];
    return entries.filter(function (app) {
      return app && typeof app.id === 'string' && app.id.length > 0;
    }).map(function (app) {
      return Object.freeze({
        id: app.id,
        name: safeString(app.n || app.name || app.id, 160),
        icon: safeString(app.i || app.icon || '', 16)
      });
    });
  }

  function getApp(appId) {
    var id = safeString(appId, 160);
    return listApps().find(function (app) { return app.id === id; }) || null;
  }

  function getIdentityPresentation() {
    var bridge = H.IdentityBridge;
    if (!bridge || typeof bridge.getSettings !== 'function') return null;
    var settings;
    try { settings = bridge.getSettings(); } catch (_) { return null; }
    if (!isPlainObject(settings)) return null;
    var allowed = ['avatar', 'logo', 'emotion', 'animation', 'visible', 'logoPath'];
    var result = {};
    allowed.forEach(function (key) {
      if (Object.prototype.hasOwnProperty.call(settings, key)) result[key] = settings[key];
    });
    return Object.freeze(result);
  }

  function preferencesAvailable() {
    return !!(H.Store && typeof H.Store.get === 'function' && typeof H.Store.set === 'function');
  }

  function validatePreferenceKey(key) {
    var normalized = safeString(key, 100);
    if (!normalized || normalized !== key || !/^[a-z0-9][a-z0-9._:-]{0,99}$/i.test(normalized)) {
      throw new Error('HalDo AI Core preference key is invalid.');
    }
    if (SECRET_KEY_PATTERN.test(normalized)) {
      throw new Error('Sensitive data is not allowed in HalDo AI Core local preferences. Use the owning app’s protected vault.');
    }
    return normalized;
  }

  function setPreference(key, value) {
    if (!preferencesAvailable()) throw new Error('HalDo local preference storage is unavailable.');
    var normalized = validatePreferenceKey(key);
    var serialized = JSON.stringify(value);
    if (typeof serialized !== 'string' || serialized.length > 16384) {
      throw new Error('HalDo AI Core preference must be JSON data no larger than 16 KB.');
    }
    var parsed = JSON.parse(serialized);
    H.Store.set(CORE_STORE_PREFIX + normalized, parsed);
    return true;
  }

  function getPreference(key, fallback) {
    if (!preferencesAvailable()) return fallback;
    var normalized = validatePreferenceKey(key);
    return H.Store.get(CORE_STORE_PREFIX + normalized, fallback);
  }

  function removePreference(key) {
    if (!preferencesAvailable()) throw new Error('HalDo local preference storage is unavailable.');
    var normalized = validatePreferenceKey(key);
    if (typeof H.Store.remove === 'function') return H.Store.remove(CORE_STORE_PREFIX + normalized);
    if (typeof H.Store.delete === 'function') return H.Store.delete(CORE_STORE_PREFIX + normalized);
    return false;
  }

  function requestPermission(permission, appId) {
    if (!H.Security || typeof H.Security.request !== 'function') {
      return Promise.reject(new Error('No central permission service is loaded. The platform will not grant a permission implicitly.'));
    }
    return H.Security.request(permission, appId);
  }

  function getStatus() {
    var bridgeStatus = null;
    try {
      if (H.IdentityBridge && typeof H.IdentityBridge.getStatus === 'function') {
        bridgeStatus = H.IdentityBridge.getStatus();
      }
    } catch (_) {}
    var aiRuntime = !!(H.AI && (typeof H.AI.generate === 'function' || typeof H.AI.run === 'function'));
    var permissionService = !!(H.Security && typeof H.Security.request === 'function');
    return {
      version: VERSION,
      platformVersion: H.Master && H.Master.version || null,
      localOnly: true,
      eventHub: hasVoiceHub(),
      appRegistry: !!(H.Registry && Array.isArray(H.Registry.featured)),
      localPreferences: preferencesAvailable(),
      identityPresentation: !!getIdentityPresentation(),
      identityBridge: !!(bridgeStatus && bridgeStatus.identityAvailable),
      permissionService: permissionService,
      authentication: !!(H.Auth && (typeof H.Auth.signIn === 'function' || typeof H.Auth.getSession === 'function')),
      commonSecureVault: false,
      aiInferenceRuntime: aiRuntime,
      agentRuntime: false,
      backendConnected: false
    };
  }

  var api = {
    version: VERSION,
    getStatus: getStatus,
    listApps: listApps,
    getApp: getApp,
    getIdentityPresentation: getIdentityPresentation,
    events: Object.freeze({ on: on, emit: emit }),
    preferences: Object.freeze({
      get: getPreference,
      set: setPreference,
      remove: removePreference
    }),
    permissions: Object.freeze({
      request: requestPermission,
      hasService: function () {
        return !!(H.Security && typeof H.Security.request === 'function');
      }
    }),
    getRecentAudit: function (limit) {
      var count = Number.isFinite(limit) ? Math.max(0, Math.min(AUDIT_LIMIT, Math.floor(limit))) : 20;
      return audit.slice(-count).map(function (entry) { return Object.assign({}, entry); });
    },
    clearSessionAudit: function () {
      var count = audit.length;
      audit = [];
      return count;
    }
  };

  H.AICore = api;
  H.Master = H.Master || {};
  H.Master.aiCoreVersion = VERSION;
  H.Master.aiCoreStatus = 'foundation';
  console.info('[HalDo v178] AI Core foundation ready. Capabilities:', getStatus());
})(window);
