/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — INIT (v150) — VORLÄUFIG
   Wird in späterer Runde durch finale Version ersetzt
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo) return;

  function hideBootScreen(){
    var bs = document.getElementById("bootScreen");
    if(!bs) return;
    bs.classList.add("hide");
    setTimeout(function(){
      if(bs.parentNode) bs.parentNode.removeChild(bs);
    }, 900);
  }

  function start(){
    if(window.HalDo.Kernel){
      HalDo.Kernel.log("Init: starte Boot-Chain…");
    }

    /* Boot-Chain aus Kernel */
    if(HalDo.Kernel && HalDo.Kernel.boot){
      HalDo.Kernel.boot().then(function(ok){
        if(!ok){
          console.warn("[HalDo Init] Boot-Fehler — starte trotzdem");
        }

        /* Alle Kern-Services starten (falls vorhanden) */
        try { if(HalDo.Config && HalDo.Config.load)   HalDo.Config.load();     } catch(e){ console.warn("Config:", e.message); }
        try { if(HalDo.Security && HalDo.Security.init) HalDo.Security.init(); } catch(e){ console.warn("Security:", e.message); }
        try { if(HalDo.Storage && HalDo.Storage.init)   HalDo.Storage.init();   } catch(e){ console.warn("Storage:", e.message); }
        try { if(HalDo.AppManager && HalDo.AppManager.init) HalDo.AppManager.init(); } catch(e){ console.warn("AppManager:", e.message); }
        try { if(HalDo.Runtime && HalDo.Runtime.init)   HalDo.Runtime.init();   } catch(e){ console.warn("Runtime:", e.message); }
        try { if(HalDo.Router && HalDo.Router.init)     HalDo.Router.init();    } catch(e){ console.warn("Router:", e.message); }
        try { if(HalDo.Display && HalDo.Display.init)   HalDo.Display.init();   } catch(e){ console.warn("Display:", e.message); }
        try { if(HalDo.WindowManager && HalDo.WindowManager.init) HalDo.WindowManager.init(); } catch(e){ console.warn("WindowManager:", e.message); }
        try { if(HalDo.Desktop && HalDo.Desktop.init)   HalDo.Desktop.init();   } catch(e){ console.warn("Desktop:", e.message); }
        try { if(HalDo.Voice && HalDo.Voice.init)       HalDo.Voice.init();     } catch(e){ console.warn("Voice:", e.message); }
        try { if(HalDo.Language && HalDo.Language.init) HalDo.Language.init();  } catch(e){ console.warn("Language:", e.message); }
        try { if(HalDo.Memory && HalDo.Memory.init)     HalDo.Memory.init();    } catch(e){ console.warn("Memory:", e.message); }
        try { if(HalDo.AI && HalDo.AI.init)             HalDo.AI.init();        } catch(e){ console.warn("AI:", e.message); }
        try { if(HalDo.Menu && HalDo.Menu.init)         HalDo.Menu.init();      } catch(e){ console.warn("Menu:", e.message); }
        try { if(HalDo.CosmicWorld && HalDo.CosmicWorld.init) HalDo.CosmicWorld.init(); } catch(e){ console.warn("CosmicWorld:", e.message); }

        /* Boot-Screen weg */
        setTimeout(function(){
          hideBootScreen();
          if(HalDo.Kernel) HalDo.Kernel.log("✅ Boot abgeschlossen");

          /* Begrüßung */
          var name = (HalDo.Config && HalDo.Config.get) ? HalDo.Config.get("userName") : "Bruder";
          setTimeout(function(){
            var t = document.getElementById("toast");
            if(t){
              t.textContent = "🦚 Silav, " + name + "! Klick die Sonne oder einen Planeten";
              t.className = "show ok";
              setTimeout(function(){ t.className = ""; }, 3000);
            }
          }, 500);
        }, 400);
      });
    } else {
      /* Kein Kernel → trotzdem Boot-Screen weg */
      setTimeout(hideBootScreen, 1000);
    }
  }

  /* DOM fertig? */
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

console.log("🦚 init.js geladen (vorläufig)");
