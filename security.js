/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SECURITY LAYER (v150)
   Permissions · Key-Schutz · Sicherheit
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Security = (function(){
  "use strict";

  /* ─────────── Verfügbare Berechtigungen ─────────── */
  var PERMISSIONS = {
    camera:        { label: "Kamera",        desc: "Zugriff auf deine Kamera" },
    microphone:    { label: "Mikrofon",      desc: "Zugriff auf dein Mikrofon" },
    location:      { label: "Standort",      desc: "Deinen Standort verwenden" },
    notifications: { label: "Benachrichtigungen", desc: "System-Benachrichtigungen senden" },
    storage:       { label: "Speicher",      desc: "Lokalen Speicher nutzen" },
    network:       { label: "Netzwerk",      desc: "Mit dem Internet verbinden" },
    files:         { label: "Dateien",       desc: "Dateien lesen und speichern" },
    contacts:      { label: "Kontakte",      desc: "Auf Kontakte zugreifen" },
    audio:         { label: "Audio",         desc: "Ton abspielen und aufnehmen" },
    speech:        { label: "Sprache",       desc: "Sprachsteuerung nutzen" }
  };

  /* ─────────── Gespeicherte Berechtigungen ─────────── */
  var _grants = {};
  var _loaded = false;

  function _load(){
    if(_loaded) return;
    try {
      var stored = window.HalDo.Storage.ns("security").get("grants", {});
      _grants = stored || {};
    } catch(e){ _grants = {}; }
    _loaded = true;
  }
  function _save(){
    try { window.HalDo.Storage.ns("security").set("grants", _grants); }
    catch(e){}
  }

  /* ─────────── Aktive Sessions ─────────── */
  var _sessions = {};  /* { permName: { app: "...", since: timestamp } } */

  /* ─────────── Prüfen ─────────── */
  function has(permission, appId){
    _load();
    if(!_grants[permission]) return false;
    if(appId){
      return _grants[permission].indexOf(appId) >= 0;
    }
    return _grants[permission].length > 0;
  }

  function isAvailable(permission){
    var env = (window.HalDo.Kernel) ? HalDo.Kernel.env() : {};
    switch(permission){
      case "camera":        return env.hasCamera;
      case "microphone":    return env.hasCamera; /* gleiche API */
      case "notifications": return env.hasNotification;
      case "storage":       return env.hasStorage;
      case "speech":        return env.hasSpeechRec || env.hasSpeechSynth;
      case "audio":         return env.hasAudioCtx;
      default:              return true;
    }
  }

  /* ─────────── Grant ─────────── */
  function grant(permission, appId){
    _load();
    if(!_grants[permission]) _grants[permission] = [];
    if(_grants[permission].indexOf(appId) < 0){
      _grants[permission].push(appId);
    }
    _sessions[permission] = { app: appId, since: Date.now() };
    _save();
    if(window.HalDo && HalDo.Kernel) HalDo.Kernel.log("✅ Berechtigung erteilt: " + permission + " → " + appId);
    return true;
  }

  /* ─────────── Revoke ─────────── */
  function revoke(permission, appId){
    _load();
    if(!_grants[permission]) return false;
    var idx = _grants[permission].indexOf(appId);
    if(idx >= 0){
      _grants[permission].splice(idx, 1);
      _save();
      if(window.HalDo && HalDo.Kernel) HalDo.Kernel.log("🚫 Berechtigung entzogen: " + permission + " ← " + appId);
      return true;
    }
    return false;
  }

  function revokeAll(appId){
    _load();
    var count = 0;
    Object.keys(_grants).forEach(function(p){
      var idx = _grants[p].indexOf(appId);
      if(idx >= 0){ _grants[p].splice(idx, 1); count++; }
    });
    _save();
    return count;
  }

  /* ─────────── Request (mit Dialog) ─────────── */
  function request(permission, appId){
    _load();
    if(has(permission, appId)) return Promise.resolve(true);
    if(!isAvailable(permission)) return Promise.reject(new Error("Nicht verfügbar"));

    /* Browser-native Berechtigungen direkt abfragen */
    if(permission === "notifications" && window.Notification){
      return Notification.requestPermission().then(function(result){
        if(result === "granted"){ grant(permission, appId); return true; }
        return false;
      });
    }
    if(permission === "camera" || permission === "microphone"){
      return navigator.mediaDevices.getUserMedia({ video: permission === "camera", audio: permission === "microphone" })
        .then(function(stream){
          stream.getTracks().forEach(function(t){ t.stop(); });
          grant(permission, appId);
          return true;
        })
        .catch(function(){ return false; });
    }

    /* Für alle anderen: direkt erteilen (lokale Daten) */
    grant(permission, appId);
    return Promise.resolve(true);
  }

  /* ─────────── API-Key-Schutz ─────────── */
  function maskKey(key){
    if(!key) return "";
    if(key.length <= 8) return "••••••";
    return key.substring(0, 4) + "••••" + key.substring(key.length - 4);
  }

  /* Key aus Logs heraushalten */
  function safeKeyLog(){
    return "[KEY_GESCHÜTZT]";
  }

  /* ─────────── Aktivitäten-Log ─────────── */
  var _activity = [];
  function logActivity(type, message, appId){
    _activity.push({
      t: Date.now(),
      type: type,
      message: message,
      app: appId || null
    });
    if(_activity.length > 200) _activity.shift();
    try {
      var st = window.HalDo.Storage.ns("security");
      st.set("activity", _activity.slice(-100));
    } catch(e){}
  }
  function getActivity(){
    if(_activity.length === 0){
      try { _activity = window.HalDo.Storage.ns("security").get("activity", []); } catch(e){}
    }
    return _activity.slice();
  }

  /* ─────────── Status ─────────── */
  function status(){
    _load();
    var out = {};
    Object.keys(PERMISSIONS).forEach(function(p){
      out[p] = {
        label: PERMISSIONS[p].label,
        desc: PERMISSIONS[p].desc,
        available: isAvailable(p),
        granted: has(p)
      };
    });
    return out;
  }

  return {
    PERMISSIONS: PERMISSIONS,
    has: has,
    isAvailable: isAvailable,
    grant: grant,
    revoke: revoke,
    revokeAll: revokeAll,
    request: request,
    maskKey: maskKey,
    logActivity: logActivity,
    getActivity: getActivity,
    status: status
  };
})();

console.log("🦚 security.js geladen");
