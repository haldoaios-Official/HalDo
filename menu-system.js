/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MENU SYSTEM (v150b)
   Nur Sidebar-Inhalte · Kein Event-Konflikt mehr
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Menu = (function(){
  "use strict";

  function init(){
    /* NICHTS mit sidebarBtn überschreiben — das macht desktop.js! */
    if(window.HalDo.Kernel) HalDo.Kernel.log("Menu System bereit (Events von Desktop übernommen)");
  }

  return {
    init: init,
    refresh: function(){
      if(window.HalDo.Desktop && HalDo.Desktop.renderSidebar) HalDo.Desktop.renderSidebar();
    }
  };
})();

console.log("🦚 menu-system.js geladen (v150b ohne Konflikt)");
