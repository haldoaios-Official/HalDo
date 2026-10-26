/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HOME PATCH (v1)
   Verhindert, dass Home als Fenster geöffnet wird.
   Stattdessen: Fullscreen-Hintergrund via home.js.
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDoDeskpane || !HalDoDeskpane.open) return;
  if(window.__haldoHomePatched) return;
  window.__haldoHomePatched = true;

  var origOpen = HalDoDeskpane.open;

  HalDoDeskpane.open = function(app){
    // Home → kein Fenster, sondern Fullscreen-Hintergrund
    if(app && app.id === "home"){
      // 1. Alle offenen Home-Fenster schließen (falls vorhanden)
      try {
        if(HalDoDeskpane.close){
          // Nur schließen, wenn ein Home-Fenster existiert
          var wins = HalDoDeskpane.windows || {};
          Object.keys(wins).forEach(function(id){
            if(id === "home") HalDoDeskpane.close("home");
          });
        }
      } catch(e){}

      // 2. Fullscreen-Hintergrund rendern (aus home.js v181)
      if(window.HalDoHomeShow){
        window.HalDoHomeShow();
      } else {
        // Fallback: Wenn home.js noch nicht bereit ist, kurz warten
        setTimeout(function(){
          if(window.HalDoHomeShow) window.HalDoHomeShow();
        }, 100);
      }
      return;
    }

    // Alle anderen Apps → normales Fenster
    return origOpen.apply(this, arguments);
  };

  console.log("🦚 home-patch.js v1 geladen — Home läuft als Fullscreen-Hintergrund");
})();
