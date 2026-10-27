/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — LUPE (v1.0)
   Kamera-Zoom · Kontrast · Foto
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var state = { stream:null, track:null, zoom:2, contrast:1.2 };

    function build(){
      var html = '<div class="card" style="padding:0;overflow:hidden;background:#000;border-radius:14px;aspect-ratio:1;position:relative">'
        + '<video id="luVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;filter:contrast('+state.contrast+') '+(state.zoom>1?'transform:scale('+state.zoom+')':'')+';display:none"></video>'
        + '<div id="luPlaceholder" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#aaa"><div style="font-size:56px">🔍</div><div style="font-size:12px;margin-top:8px">Lupe starten</div></div>'
        + '</div>';
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:8px">'
        + '<button class="btn" id="luStart" style="padding:14px">▶ Starten</button>'
        + '<button class="btn sec" id="luShot" style="padding:14px" disabled>📸 Foto</button>'
        + '</div>';
      html += '<div class="card"><h3>Zoom</h3>'
        + '<input type="range" id="luZoom" min="1" max="8" step="0.1" value="'+state.zoom+'" style="width:100%">'
        + '<div style="text-align:center;font-size:11px;color:var(--text-mute);margin-top:4px">'+state.zoom.toFixed(1)+'×</div>'
        + '</div>';
      html += '<div class="card"><h3>Kontrast</h3>'
        + '<input type="range" id="luContrast" min="0.5" max="3" step="0.1" value="'+state.contrast+'" style="width:100%">'
        + '</div>';
      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#luStart").addEventListener("click", function(){
        if(state.stream){ stopCam(); build(); return; }
        if(!navigator.mediaDevices){ alert("Kamera nicht verfügbar"); return; }
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false })
          .then(function(stream){
            state.stream = stream;
            state.track = stream.getVideoTracks()[0];
            var v = container.querySelector("#luVideo");
            v.srcObject = stream; v.style.display = "block";
            container.querySelector("#luPlaceholder").style.display = "none";
            container.querySelector("#luStart").textContent = "⏹ Stoppen";
            container.querySelector("#luShot").disabled = false;
          })
          .catch(function(e){ alert("Kamera-Zugriff verweigert: " + e.message); });
      });
      container.querySelector("#luZoom").addEventListener("input", function(e){
        state.zoom = parseFloat(e.target.value);
        updateView();
      });
      container.querySelector("#luContrast").addEventListener("input", function(e){
        state.contrast = parseFloat(e.target.value);
        updateView();
      });
      container.querySelector("#luShot").addEventListener("click", function(){
        var v = container.querySelector("#luVideo");
        if(!v || !state.stream) return;
        var canvas = document.createElement("canvas");
        canvas.width = v.videoWidth; canvas.height = v.videoHeight;
        var ctx = canvas.getContext("2d");
        ctx.filter = "contrast(" + state.contrast + ")";
        ctx.drawImage(v, 0, 0);
        var url = canvas.toDataURL("image/jpeg", 0.9);
        var a = document.createElement("a"); a.href = url; a.download = "lupe-"+Date.now()+".jpg"; a.click();
      });
    }

    function updateView(){
      var v = container.querySelector("#luVideo");
      if(v){ v.style.filter = "contrast("+state.contrast+")"; v.style.transform = state.zoom > 1 ? "scale("+state.zoom+")" : "none"; }
      container.querySelector("#luZoom").parentElement.querySelector("div").textContent = state.zoom.toFixed(1)+"×";
    }

    function stopCam(){
      if(state.stream){ state.stream.getTracks().forEach(function(t){ t.stop(); }); state.stream = null; state.track = null; }
    }

    build();
  }

  HalDoApp("lupe", { name: "Lupe", icon: "🔍", render: render, category: "werkzeuge" });
  console.log("🦚 lupe.js v1.0 geladen");
})();
