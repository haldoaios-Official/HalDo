/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ROUTER (v150b)
   Mit verbessertem Error-Handling
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Router = (function(){
  "use strict";

  var ROUTES = {
    "": "chat", "/": "chat", "/chat": "chat",
    "/ai": "haldoai", "/haldoai": "haldoai",
    "/ezidi": "ezidi", "/welt": "welt", "/wissen": "wissen",
    "/lernen": "lernen", "/kreativ": "kreativ", "/medien": "medien",
    "/games": "games", "/produktiv": "produktiv", "/finanzen": "finanzen",
    "/dokumente": "dokumente", "/verkehr": "verkehr", "/comm": "comm",
    "/fitness": "fitness", "/kueche": "kueche", "/zuhause": "zuhause",
    "/aufnahme": "aufnahme", "/werkzeuge": "werkzeuge", "/system": "system"
  };

  var _current = null;

  function open(appId){
    if(!appId) return Promise.reject(new Error("Keine App-ID"));

    var app = window.HalDo.Registry ? HalDo.Registry.get(appId) : null;
    if(!app){
      /* Fallback: trotzdem versuchen zu öffnen */
      console.warn("[Router] App nicht in Registry: " + appId);
    }

    _current = appId;
    try {
      if(location.hash !== "#/" + appId) history.replaceState(null, "", "#/" + appId);
    } catch(e){}

    /* Direkt über WindowManager + Runtime starten (nicht AppManager, um Fehler zu vermeiden) */
    return new Promise(function(resolve, reject){
      try {
        if(!window.HalDo.WindowManager){ reject(new Error("WindowManager fehlt")); return; }
        if(!window.HalDo.Runtime){ reject(new Error("Runtime fehlt")); return; }

        var container = window.HalDo.WindowManager.create(appId);
        if(!container){ reject(new Error("Container konnte nicht erstellt werden")); return; }

        /* Modul prüfen */
        if(!HalDo.Modules || !HalDo.Modules[appId]){
          container.innerHTML = '<div class="placeholder">📦 ' + (app ? app.name : appId) + '<br><br><span style="color:#ff8080">Modul nicht geladen</span></div>';
          resolve(false);
          return;
        }

        /* Modul rendern */
        var ctx = {
          appId: appId,
          app: app || {id: appId, name: appId},
          store: window.HalDo.Store ? HalDo.Store(appId) : {get:function(){},set:function(){}},
          settings: window.HalDo.Config.getApp(appId, {}),
          voice: window.HalDo.Voice,
          ai: window.HalDo.AI,
          security: window.HalDo.Security
        };
        var mod = HalDo.Modules[appId];
        if(mod.init) mod.init(container, ctx);
        else if(mod.render) mod.render(container, ctx);

        resolve(true);
      } catch(err){
        console.error("[Router] Fehler:", err);
        reject(err);
      }
    });
  }

  function openFromUrl(){
    var hash = "";
    try { hash = (location.hash || "").replace(/^#/, ""); } catch(e){}
    var appId = ROUTES[hash] || null;
    if(appId) return open(appId);
    return Promise.resolve(false);
  }

  function register(path, appId){
    if(!path || !appId) return false;
    if(path.charAt(0) !== "/") path = "/" + path;
    ROUTES[path] = appId;
    return true;
  }

  function routes(){ return Object.assign({}, ROUTES); }
  function current(){ return _current; }
  function clear(){
    _current = null;
    try { history.replaceState(null, "", location.pathname); } catch(e){}
  }

  function init(){
    window.addEventListener("hashchange", function(){ openFromUrl(); });
    if(window.HalDo.Kernel) HalDo.Kernel.log("Router bereit (" + Object.keys(ROUTES).length + " Routen)");
  }

  return {
    init: init,
    open: open,
    openFromUrl: openFromUrl,
    register: register,
    routes: routes,
    current: current,
    clear: clear
  };
})();

window.HalDo.Open = function(appId){ return window.HalDo.Router.open(appId); };

console.log("🦚 router.js geladen (v150b)");
