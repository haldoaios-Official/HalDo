/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — TASCHENLAMPE (v1.0)
   Torch API · Weißer Bildschirm · Farben
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var state = { on:false, stream:null, track:null, color:"#ffffff", brightness:1 };

    function build(){
      var html = '<div class="card" style="text-align:center;background:'+(state.on ? state.color : "rgba(0,0,0,.2)")+';padding:30px 14px;transition:background .3s">'
        + '<div style="font-size:56px;filter:'+(state.on?'drop-shadow(0 0 20px '+state.color+')':'none')+'">🔦</div>'
        + '<div style="font-size:14px;font-weight:900;color:'+(state.on ? (isLight(state.color) ? "#000" : "#fff") : "var(--text-mute)")+';margin-top:10px">'+(state.on ? "AN" : "AUS")+'</div>'
        + '</div>';

      html += '<button class="btn full" id="tlToggle" style="padding:18px;font-size:16px;margin-bottom:8px">'+(state.on ? "⏹ Ausschalten" : "💡 Einschalten")+'</button>';

      html += '<div class="card"><h3>Farbe</h3><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">'
        + ["#ffffff","#ffdd44","#ff5555","#4ade80","#4dd0e1","#b478ff"].map(function(c){
            return '<button data-color="'+c+'" style="height:48px;background:'+c+';border:3px solid '+(state.color===c?'#fff':'transparent')+';border-radius:10px;cursor:pointer"></button>';
          }).join('')
        + '</div></div>';

      html += '<div class="card"><h3>Helligkeit</h3>'
        + '<input type="range" id="tlBright" min="20" max="100" value="'+Math.round(state.brightness*100)+'" style="width:100%">'
        + '<div style="text-align:center;font-size:11px;color:var(--text-mute);margin-top:4px">'+Math.round(state.brightness*100)+'%</div>'
        + '</div>';

      html += '<div class="card" style="font-size:10.5px;color:var(--text-mute);line-height:1.5">'
        + '💡 <b>Info:</b> Echte Hardware-Torch (LED) funktioniert nur auf manchen Android-Geräten. iPhone/Safari unterstützt es nicht — dann wird der Bildschirm zur Lampe.'
        + '</div>';

      container.innerHTML = html;
      if(state.on) document.body.style.background = state.color;
      bind();
    }

    function isLight(hex){
      var r = parseInt(hex.substr(1,2),16), g = parseInt(hex.substr(3,2),16), b = parseInt(hex.substr(5,2),16);
      return (r*299 + g*587 + b*114) / 1000 > 128;
    }

    function bind(){
      container.querySelector("#tlToggle").addEventListener("click", async function(){
        if(state.on){
          stopTorch();
          state.on = false;
          document.body.style.background = "";
          document.body.style.filter = "";
          build();
        } else {
          state.on = true;
          document.body.style.background = state.color;
          try { await startTorch(); } catch(e){}
          if(navigator.vibrate) navigator.vibrate(50);
          build();
        }
      });
      container.querySelectorAll("[data-color]").forEach(function(el){
        el.addEventListener("click", function(){
          state.color = el.dataset.color;
          if(state.on) document.body.style.background = state.color;
          build();
        });
      });
      var br = container.querySelector("#tlBright");
      br.addEventListener("input", function(){
        state.brightness = parseInt(br.value) / 100;
        if(state.on) document.body.style.filter = "brightness(" + state.brightness + ")";
      });
    }

    async function startTorch(){
      if(!navigator.mediaDevices) return;
      try {
        state.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        state.track = state.stream.getVideoTracks()[0];
        if(state.track && state.track.applyConstraints){
          await state.track.applyConstraints({ advanced: [{ torch: true }] });
        }
      } catch(e){ /* fallback: screen light only */ }
    }
    function stopTorch(){
      if(state.track && state.track.applyConstraints){
        try { state.track.applyConstraints({ advanced: [{ torch: false }] }); } catch(e){}
      }
      if(state.stream){ state.stream.getTracks().forEach(function(t){ t.stop(); }); state.stream = null; state.track = null; }
    }

    build();
  }

  HalDoApp("taschenlampe", { name: "Taschenlampe", icon: "🔦", render: render, category: "werkzeuge" });
  console.log("🦚 taschenlampe.js v1.0 geladen");
})();
