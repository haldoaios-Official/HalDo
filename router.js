/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ROUTER (v150)
   appId → App · URL → App · Deep-Links
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Router = (function(){
  "use strict";

  /* ─────────── Routen-Map: Pfad → AppId ─────────── */
  var ROUTES = {
    "":            "chat",
    "/":           "chat",
    "/chat":       "chat",
    "/ai":         "haldoai",
    "/haldoai":    "haldoai",
    "/ezidi":      "ezidi",
    "/welt":       "welt",
    "/wissen":     "wissen",
    "/lernen":     "lernen",
    "/kreativ":    "kreativ",
    "/medien":     "medien",
    "/games":      "games",
    "/produktiv":  "produktiv",
    "/finanzen":   "finanzen",
    "/dokumente":  "dokumente",
    "/verkehr":    "verkehr",
    "/comm":       "comm",
    "/fitness":    "fitness",
    "/kueche":     "kueche",
    "/zuhause":    "zuhause",
    "/aufnahme":   "aufnahme",
    "/werkzeuge":  "werkzeuge",
    "/system":     "system"
  };

  /* ─────────── Aktueller Pfad ─────────── */
  var _current = null;

  /* ─────────── App öffnen (per appId) ─────────── */
  function open(appId){
    if(!appId) return Promise.reject(new Error("Keine App-ID"));

    var app = window.HalDo.Registry.get(appId);
    if(!app) return Promise.reject(new Error("App nicht gefunden: " + appId));

    _current = appId;

    /* URL aktualisieren (nur hash, kein Neuladen) */
    try {
      if(location.hash !== "#/" + appId){
        history.replaceState(null, "", "#/" + appId);
      }
    } catch(e){}

    /* Über AppManager starten */
    return window.HalDo.AppManager.start(appId)
      .then(function(){
        if(window.HalDo.Kernel) HalDo.Kernel.log("🛰 Router → " + app.name);
        return true;
      })
      .catch(function(err){
        if(window.HalDo.Kernel) HalDo.Kernel.log("❌ Router-Fehler: " + err.message, "error");
        throw err;
      });
  }

  /* ─────────── App aus URL öffnen ─────────── */
  function openFromUrl(){
    var hash = "";
    try { hash = (location.hash || "").replace(/^#/, ""); } catch(e){}
    var appId = ROUTES[hash] || null;

    if(appId){
      return open(appId);
    }

    /* Kein gültiger Pfad → nichts tun */
    return Promise.resolve(false);
  }

  /* ─────────── Routen registrieren (erweiterbar) ─────────── */
  function register(path, appId){
    if(!path || !appId) return false;
    if(!path.startsWith("/")) path = "/" + path;
    ROUTES[path] = appId;
    return true;
  }

  function routes(){
    return Object.assign({}, ROUTES);
  }

  function current(){
    return _current;
  }

  function clear(){
    _current = null;
    try { history.replaceState(null, "", location.pathname); } catch(e){}
  }

  /* ─────────── Init ─────────── */
  function init(){
    /* Auf Hash-Änderungen hören (für Vor/Zurück-Navigation) */
    window.addEventListener("hashchange", function(){
      openFromUrl();
    });

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

/* ─────────── Globaler Helfer: HalDo.Open("appid") ─────────── */
window.HalDo.Open = function(appId){
  return window.HalDo.Router.open(appId);
};

console.log("🦚 router.js geladen");
