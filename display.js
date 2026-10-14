/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DISPLAY LAYER (v150)
   Theme · Layout · Skalierung · Responsive
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Display = (function(){
  "use strict";

  var _current = {
    theme: "kosmos",
    cyborg: false,
    reduceMotion: false,
    scale: 1
  };

  /* ─────────── Theme anwenden ─────────── */
  function applyTheme(theme){
    _current.theme = theme || "kosmos";
    document.body.setAttribute("data-theme", _current.theme);

    var bgLayer = document.getElementById("bgLayer");
    if(bgLayer){
      if(_current.theme === "kosmos"){
        bgLayer.style.background = "radial-gradient(ellipse at 50% 50%,#0a1a3a,#02040a 70%)";
      } else if(_current.theme === "erde"){
        bgLayer.style.background = "radial-gradient(ellipse at 40% 40%,#1a3a6a,#02040a 70%)";
      } else if(_current.theme === "holo"){
        bgLayer.style.background = "linear-gradient(135deg,#0a1a3a,#1a2a5a)";
      }
    }
    if(window.HalDo.Kernel) HalDo.Kernel.log("Theme: " + _current.theme);
  }

  /* ─────────── Cyborg-Modus ─────────── */
  function applyCyborg(on){
    _current.cyborg = !!on;
    document.body.classList.toggle("cyborg", _current.cyborg);
    if(window.HalDo.Kernel) HalDo.Kernel.log("Cyborg: " + (_current.cyborg ? "AN" : "AUS"));
  }
  function toggleCyborg(){
    applyCyborg(!_current.cyborg);
    return _current.cyborg;
  }

  /* ─────────── Motion ─────────── */
  function applyReduceMotion(on){
    _current.reduceMotion = !!on;
    document.body.classList.toggle("reduce-motion", _current.reduceMotion);
    if(_current.reduceMotion){
      document.documentElement.style.setProperty("--dur", "0s");
    } else {
      document.documentElement.style.removeProperty("--dur");
    }
  }

  /* ─────────── Skalierung ─────────── */
  function applyScale(scale){
    _current.scale = scale;
    document.documentElement.style.fontSize = (13 * scale) + "px";
  }

  /* ─────────── Responsive ─────────── */
  function updateViewport(){
    var w = window.innerWidth;
    var h = window.innerHeight;
    var isMobile = w < 600;
    var isTablet = w >= 600 && w < 1024;

    document.body.classList.toggle("is-mobile", isMobile);
    document.body.classList.toggle("is-tablet", isTablet);
    document.body.classList.toggle("is-desktop", !isMobile && !isTablet);
  }

  /* ─────────── Layout-Helper ─────────── */
  function setSidebarOpen(open){
    var sb = document.getElementById("sidebar");
    if(!sb) return;
    sb.classList.toggle("open", !!open);
  }
  function toggleSidebar(){
    var sb = document.getElementById("sidebar");
    if(!sb) return;
    sb.classList.toggle("open");
  }
  function isSidebarOpen(){
    var sb = document.getElementById("sidebar");
    return sb ? sb.classList.contains("open") : false;
  }

  /* ─────────── Screen-Orientierung ─────────── */
  function isPortrait(){ return window.innerHeight > window.innerWidth; }
  function isLandscape(){ return window.innerWidth >= window.innerHeight; }

  /* ─────────── Init ─────────── */
  function init(){
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", function(){
      setTimeout(updateViewport, 200);
    });

    /* Auto-Cyborg bei bestimmten Themes nicht, aber prüfen */
    var cfg = window.HalDo.Config.get();
    applyTheme(cfg.theme || "kosmos");
    applyCyborg(!!cfg.cyborg);
    applyReduceMotion(!!cfg.reduceMotion);

    if(window.HalDo.Kernel) HalDo.Kernel.log("Display Layer bereit (" + window.innerWidth + "×" + window.innerHeight + ")");
  }

  return {
    init: init,
    applyTheme: applyTheme,
    applyCyborg: applyCyborg,
    toggleCyborg: toggleCyborg,
    applyReduceMotion: applyReduceMotion,
    applyScale: applyScale,
    updateViewport: updateViewport,
    setSidebarOpen: setSidebarOpen,
    toggleSidebar: toggleSidebar,
    isSidebarOpen: isSidebarOpen,
    isPortrait: isPortrait,
    isLandscape: isLandscape,
    current: function(){ return Object.assign({}, _current); }
  };
})();

console.log("🦚 display.js geladen");
