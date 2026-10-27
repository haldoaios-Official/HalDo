/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SPIEGEL (v1.0)
   Frontkamera · Vollbild · Flip · Foto
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var state = { stream:null, flipped:true };

    function build(){
      var html = '<div class="card" style="padding:0;overflow:hidden;background:#000;border-radius:14px;aspect-ratio:3/4;position:relative;display:flex;align-items:center;justify-content:center">'
        + '<video id="mirVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;'+(state.flipped?'transform:scaleX(-1);':'')+'display:none"></video>'
        + '<div id="mirPlaceholder" style="color:#aaa;text-align:center;padding:20px"><div style="font-size:56px">🪞</div><div style="font-size:12px;margin-top:8px">Spiegel starten</div></div>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">'
        + '<button class="btn" id="mirStart" style="padding:14px">▶ Starten</button>'
        + '<button class="btn sec" id="mirFlip" style="padding:14px">🔄 Spiegeln</button>'
        + '</div>';
      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#mirStart").addEventListener("click", function(){
        if(state.stream){ stopCam(); build(); return; }
        if(!navigator.mediaDevices){ alert("Kamera nicht verfügbar"); return; }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false })
          .then(function(stream){
            state.stream = stream;
            var v = container.querySelector("#mirVideo");
            v.srcObject = stream; v.style.display = "block";
            container.querySelector("#mirPlaceholder").style.display = "none";
            container.querySelector("#mirStart").textContent = "⏹ Stoppen";
          })
          .catch(function(e){ alert("Kamera-Zugriff verweigert: " + e.message); });
      });
      container.querySelector("#mirFlip").addEventListener("click", function(){
        state.flipped = !state.flipped;
        var v = container.querySelector("#mirVideo");
        if(v) v.style.transform = state.flipped ? "scaleX(-1)" : "none";
      });
    }

    function stopCam(){
      if(state.stream){ state.stream.getTracks().forEach(function(t){ t.stop(); }); state.stream = null; }
    }

    build();
  }

  HalDoApp("spiegel", { name: "Spiegel", icon: "🪞", render: render, category: "werkzeuge" });
  console.log("🦚 spiegel.js v1.0 geladen");
})();
