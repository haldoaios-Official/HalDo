/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — APP MANAGER (v150)
   Lifecycle · State · Fehlerbehandlung
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.AppManager = (function(){
  "use strict";

  /* ─────────── Status ─────────── */
  var STATUS = {
    NOT_INSTALLED: "NOT_INSTALLED",
    INSTALLED:     "INSTALLED",
    RUNNING:       "RUNNING",
    SUSPENDED:     "SUSPENDED",
    ERROR:         "ERROR",
    UPDATING:      "UPDATING",
    STOPPED:       "STOPPED"
  };

  /* ─────────── State pro App ─────────── */
  var _states = {};   /* { appId: { status, since, lastError, runCount } } */

  function _state(id){
    if(!_states[id]){
      _states[id] = {
        status: STATUS.INSTALLED,
        since: Date.now(),
        lastError: null,
        runCount: 0
      };
    }
    return _states[id];
  }

  function _setStatus(id, status, err){
    var s = _state(id);
    s.status = status;
    s.since = Date.now();
    if(err) s.lastError = String(err.message || err);
    return s;
  }

  /* ─────────── Persistenz ─────────── */
  function _saveState(){
    try {
      var st = window.HalDo.Storage.ns("appmgr");
      st.set("states", _states);
    } catch(e){}
  }
  function _loadState(){
    try {
      var st = window.HalDo.Storage.ns("appmgr");
      var saved = st.get("states", {});
      _states = saved || {};
    } catch(e){ _states = {}; }
  }

  /* ─────────── Install (markiert als verfügbar) ─────────── */
  function install(appId){
    var app = window.HalDo.Registry.get(appId);
    if(!app) return Promise.reject(new Error("App nicht gefunden: " + appId));
    _setStatus(appId, STATUS.INSTALLED);
    if(window.HalDo.Kernel) HalDo.Kernel.log("📦 App installiert: " + app.name);
    _saveState();
    return Promise.resolve(true);
  }

  /* ─────────── Start ─────────── */
  function start(appId){
    var app = window.HalDo.Registry.get(appId);
    if(!app) return Promise.reject(new Error("App nicht gefunden: " + appId));

    var s = _state(appId);

    /* Wenn schon läuft → bring in Fokus */
    if(s.status === STATUS.RUNNING){
      if(window.HalDo.WindowManager && HalDo.WindowManager.focus){
        HalDo.WindowManager.focus(appId);
      }
      return Promise.resolve(true);
    }

    /* Permission-Check */
    var missing = [];
    (app.permissions || []).forEach(function(p){
      if(window.HalDo.Security && !HalDo.Security.has(p, appId)){
        missing.push(p);
      }
    });

    /* Alle Berechtigungen automatisch anfordern */
    var promises = (app.permissions || []).map(function(p){
      if(window.HalDo.Security){
        return HalDo.Security.request(p, appId).catch(function(){ return false; });
      }
      return Promise.resolve(true);
    });

    return Promise.all(promises)
      .then(function(){
        /* Modul-Check */
        if(!window.HalDo.Modules || !HalDo.Modules[appId]){
          throw new Error("Modul nicht geladen: " + appId + " (" + app.entry + ")");
        }

        /* Runtime starten */
        return window.HalDo.Runtime.run(appId);
      })
      .then(function(){
        _setStatus(appId, STATUS.RUNNING);
        s.runCount++;
        if(window.HalDo.Kernel) HalDo.Kernel.log("▶ App gestartet: " + app.name);
        _saveState();
        return true;
      })
      .catch(function(err){
        _setStatus(appId, STATUS.ERROR, err);
        if(window.HalDo.Kernel) HalDo.Kernel.log("❌ App-Fehler: " + app.name + " — " + err.message, "error");
        _saveState();
        throw err;
      });
  }

  /* ─────────── Stop ─────────── */
  function stop(appId){
    var app = window.HalDo.Registry.get(appId);
    if(!app) return false;
    var s = _state(appId);
    if(s.status === STATUS.RUNNING){
      if(window.HalDo.Runtime && HalDo.Runtime.stop){
        HalDo.Runtime.stop(appId);
      }
      _setStatus(appId, STATUS.STOPPED);
      if(window.HalDo.Kernel) HalDo.Kernel.log("⏹ App gestoppt: " + app.name);
      _saveState();
    }
    return true;
  }

  /* ─────────── Restart ─────────── */
  function restart(appId){
    stop(appId);
    return start(appId);
  }

  /* ─────────── Suspend ─────────── */
  function suspend(appId){
    var s = _state(appId);
    if(s.status === STATUS.RUNNING){
      _setStatus(appId, STATUS.SUSPENDED);
      _saveState();
    }
    return true;
  }

  /* ─────────── Resume ─────────── */
  function resume(appId){
    var s = _state(appId);
    if(s.status === STATUS.SUSPENDED){
      _setStatus(appId, STATUS.RUNNING);
      _saveState();
    }
    return true;
  }

  /* ─────────── Status abfragen ─────────── */
  function status(appId){
    var s = _state(appId);
    return s.status;
  }
  function info(appId){
    var app = window.HalDo.Registry.get(appId);
    var s = _state(appId);
    return Object.assign({}, app, {
      state: s.status,
      running: s.status === STATUS.RUNNING,
      runCount: s.runCount,
      lastError: s.lastError,
      since: s.since
    });
  }
  function allStatus(){
    return window.HalDo.Registry.all().map(function(a){
      return info(a.id);
    });
  }

  /* ─────────── Fehler-Recovery ─────────── */
  function recover(appId){
    var app = window.HalDo.Registry.get(appId);
    if(!app) return false;
    if(window.HalDo.Kernel) HalDo.Kernel.log("🔧 Recovery für " + app.name);
    _setStatus(appId, STATUS.INSTALLED);
    _saveState();
    return true;
  }

  /* ─────────── Init ─────────── */
  function init(){
    _loadState();
    /* Alle Apps als "installed" markieren */
    window.HalDo.Registry.all().forEach(function(a){
      var s = _state(a.id);
      if(s.status === STATUS.RUNNING || s.status === STATUS.ERROR){
        s.status = STATUS.INSTALLED;
      }
    });
    _saveState();
    if(window.HalDo.Kernel) HalDo.Kernel.log("App Manager bereit (" + window.HalDo.Registry.count() + " Apps)");
  }

  /* ─────────── Öffentliche API ─────────── */
  return {
    STATUS: STATUS,
    init: init,
    install: install,
    start: start,
    stop: stop,
    restart: restart,
    suspend: suspend,
    resume: resume,
    status: status,
    info: info,
    allStatus: allStatus,
    recover: recover
  };
})();

console.log("🦚 app-manager.js geladen");
