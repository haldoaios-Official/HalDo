/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BOOT (v151)
   Start-Logik · Loader verstecken · Shell starten
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";

  window._haldoBooted = true;

  function hideLoader(){
    var loader = document.getElementById("haldo-loader");
    if(!loader) return;
    loader.classList.add("hide");
    setTimeout(function(){
      if(loader.parentNode) loader.parentNode.removeChild(loader);
    }, 500);
  }

  function boot(){
    console.log("🦚 HalDo AI OS startet...");

    /* Loader verstecken */
    setTimeout(hideLoader, 500);

    /* Shell starten falls vorhanden */
    if(window.HalDo && HalDo.Shell && typeof HalDo.Shell.init === "function"){
      setTimeout(function(){
        try {
          HalDo.Shell.init();
          console.log("✅ Shell gestartet");
        } catch(e){
          console.error("Shell-Start Fehler:", e);
        }
      }, 200);
    } else {
      console.warn("⚠️ Shell nicht verfügbar — App-Shell kann nicht starten");
    }

    /* Notify-Begrüßung (nur beim ersten Start) */
    try {
      var visited = localStorage.getItem("haldo:visited");
      if(!visited){
        localStorage.setItem("haldo:visited", "1");
        setTimeout(function(){
          if(HalDo.Notify) HalDo.Notify.success("Willkommen bei HalDo AI OS! 🦚", { app: "system", duration: 5000 });
        }, 1200);
      }
    } catch(e){}

    /* Failsafe: Loader nach 8s IMMER entfernen */
    setTimeout(hideLoader, 8000);
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  console.log("🦚 boot.js geladen");
})();
