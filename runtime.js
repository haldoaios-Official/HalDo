/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — APP RUNTIME (v150)
   Modul-Loader · Renderer · Lifecycle pro App
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Modules = HalDo.Modules || {};   /* Alle App-Module landen hier */
HalDo.Runtime = (function(){
  "use strict";

  /* ─────────── Aktive Instanzen ─────────── */
  var _instances = {};   /* { appId: { container, module, mountedAt } } */

  /* ─────────── Modul-Registrierung (durch Apps genutzt) ─────────── */
  function register(appId, moduleObj){
    if(!appId) throw new Error("Runtime.register: appId fehlt");
    HalDo.Modules[appId] = moduleObj;
    if(window.HalDo.Kernel) HalDo.Kernel.log("📦 Modul registriert: " + appId);
    return true;
  }

  function hasModule(appId){
    return !!HalDo.Modules[appId];
  }

  /* ─────────── App ausführen (wird von AppManager.start aufgerufen) ─────────── */
  function run(appId){
    return new Promise(function(resolve, reject){
      try {
        var app = window.HalDo.Registry.get(appId);
        if(!app) throw new Error("App unbekannt: " + appId);

        var mod = HalDo.Modules[appId];
        if(!mod) throw new Error("Modul nicht geladen: " + appId);

        /* Bereits gelaufen? → nur Fokus */
        if(_instances[appId]){
          if(window.HalDo.WindowManager) HalDo.WindowManager.focus(appId);
          return resolve(true);
        }

        /* Fenster erstellen (wenn WindowManager da) */
        var container = null;
        if(window.HalDo.WindowManager && HalDo.WindowManager.create){
          container = HalDo.WindowManager.create(appId);
        }

        if(!container){
          throw new Error("Kein Container — WindowManager fehlt");
        }

        /* Modul initialisieren */
        var context = {
          appId: appId,
          app: app,
          store: window.HalDo.Store(appId),
          settings: window.HalDo.Config.getApp(appId),
          voice: window.HalDo.Voice || null,
          ai: window.HalDo.AI || null,
          security: window.HalDo.Security
        };

        /* Wenn Modul `init` hat → aufrufen */
        if(typeof mod.init === "function"){
          mod.init(container, context);
        }
        /* Sonst wenn Modul `render` hat → aufrufen */
        else if(typeof mod.render === "function"){
          mod.render(container, context);
        }
        /* Sonst Placeholder */
        else {
          container.innerHTML = '<div class="placeholder">📦 ' + app.name + ' (kein Renderer)</div>';
        }

        _instances[appId] = {
          container: container,
          module: mod,
          mountedAt: Date.now(),
          context: context
        };

        if(window.HalDo.Kernel) HalDo.Kernel.log("▶ Runtime aktiv: " + app.name);
        resolve(true);

      } catch(err){
        if(window.HalDo.Kernel) HalDo.Kernel.log("❌ Runtime-Fehler: " + err.message, "error");
        reject(err);
      }
    });
  }

  /* ─────────── Stop ─────────── */
  function stop(appId){
    var inst = _instances[appId];
    if(!inst) return true;

    try {
      if(inst.module && typeof inst.module.destroy === "function"){
        inst.module.destroy(inst.container, inst.context);
      }
    } catch(e){
      if(window.HalDo.Kernel) HalDo.Kernel.log("Runtime.destroy Fehler: " + e.message, "warn");
    }

    if(window.HalDo.WindowManager && HalDo.WindowManager.close){
      HalDo.WindowManager.close(appId);
    }

    delete _instances[appId];
    return true;
  }

  /* ─────────── Suspend ─────────── */
  function suspend(appId){
    var inst = _instances[appId];
    if(!inst) return false;
    try {
      if(inst.module && typeof inst.module.suspend === "function"){
        inst.module.suspend(inst.container, inst.context);
      }
    } catch(e){}
    return true;
  }

  /* ─────────── Resume ─────────── */
  function resume(appId){
    var inst = _instances[appId];
    if(!inst) return false;
    try {
      if(inst.module && typeof inst.module.resume === "function"){
        inst.module.resume(inst.container, inst.context);
      }
    } catch(e){}
    return true;
  }

  /* ─────────── Info ─────────── */
  function isRunning(appId){ return !!_instances[appId]; }
  function runningApps(){ return Object.keys(_instances); }
  function getInstance(appId){ return _instances[appId] || null; }

  function init(){
    if(window.HalDo.Kernel) HalDo.Kernel.log("Runtime bereit — warte auf App-Starts");
  }

  return {
    init: init,
    register: register,
    hasModule: hasModule,
    run: run,
    stop: stop,
    suspend: suspend,
    resume: resume,
    isRunning: isRunning,
    runningApps: runningApps,
    getInstance: getInstance
  };
})();

/* ─────────── Globaler Helfer für Apps ─────────── */
window.HalDoApp = function(appId, moduleObj){
  window.HalDo.Runtime.register(appId, moduleObj);
};

console.log("🦚 runtime.js geladen");
