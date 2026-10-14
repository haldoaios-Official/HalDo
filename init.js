/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — INIT (v150b)
   Boot-Chain Start · Alle Services in richtiger Reihenfolge
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

    if(HalDo.Kernel && HalDo.Kernel.boot){
      HalDo.Kernel.boot().then(function(ok){
        if(!ok){
          console.warn("[HalDo Init] Boot-Fehler — starte trotzdem");
        }

        /* WICHTIG: Reihenfolge — Config zuerst, dann Services, dann UI */
        var order = [
          ["Config",        function(){ if(HalDo.Config && HalDo.Config.load) HalDo.Config.load(); }],
          ["Storage",       function(){ if(HalDo.Storage && HalDo.Storage.init) HalDo.Storage.init(); }],
          ["Security",      function(){ if(HalDo.Security && HalDo.Security.init) HalDo.Security.init(); }],
          ["AppManager",    function(){ if(HalDo.AppManager && HalDo.AppManager.init) HalDo.AppManager.init(); }],
          ["Runtime",       function(){ if(HalDo.Runtime && HalDo.Runtime.init) HalDo.Runtime.init(); }],
          ["Language",      function(){ if(HalDo.Language && HalDo.Language.init) HalDo.Language.init(); }],
          ["Memory",        function(){ if(HalDo.Memory && HalDo.Memory.init) HalDo.Memory.init(); }],
          ["Voice",         function(){ if(HalDo.Voice && HalDo.Voice.init) HalDo.Voice.init(); }],
          ["AI",            function(){ if(HalDo.AI && HalDo.AI.init) HalDo.AI.init(); }],
          ["Display",       function(){ if(HalDo.Display && HalDo.Display.init) HalDo.Display.init(); }],
          ["Desktop",       function(){ if(HalDo.Desktop && HalDo.Desktop.init) HalDo.Desktop.init(); }],
          ["WindowManager", function(){ if(HalDo.WindowManager && HalDo.WindowManager.init) HalDo.WindowManager.init(); }],
          ["Menu",          function(){ if(HalDo.Menu && HalDo.Menu.init) HalDo.Menu.init(); }],
          ["Router",        function(){ if(HalDo.Router && HalDo.Router.init) HalDo.Router.init(); }],
          ["CosmicWorld",   function(){ if(HalDo.CosmicWorld && HalDo.CosmicWorld.init) HalDo.CosmicWorld.init(); }]
        ];

        order.forEach(function(pair){
          try {
            pair[1]();
          } catch(e){
            console.warn("[HalDo Init] " + pair[0] + ": " + e.message);
          }
        });

        /* Boot-Screen weg nach kurzer Verzögerung */
        setTimeout(function(){
          hideBootScreen();
          if(HalDo.Kernel) HalDo.Kernel.log("✅ Boot abgeschlossen");

          var name = (HalDo.Config && HalDo.Config.get) ? HalDo.Config.get("userName") : "Bruder";
          setTimeout(function(){
            var t = document.getElementById("toast");
            if(t){
              t.textContent = "🦚 Silav, " + name + "! Klick die Sonne oder einen Planeten";
              t.className = "show ok";
              setTimeout(function(){ t.className = ""; }, 3500);
            }
          }, 400);
        }, 300);
      });
    } else {
      setTimeout(hideBootScreen, 800);
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();

console.log("🦚 init.js geladen (v150b)");
