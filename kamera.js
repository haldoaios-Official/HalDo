/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — KAMERA (v1.0)
   Foto aufnehmen · Galerie · Download
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var state = { stream:null, facing:"environment", photos: store.get("photos", []) };

    function build(){
      var html = '<div class="card" style="padding:8px">'
        + '<div style="position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center">'
        + '<video id="camVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;display:none"></video>'
        + '<div id="camPlaceholder" style="color:#aaa;text-align:center;padding:20px"><div style="font-size:44px">📷</div><div style="font-size:11px;margin-top:8px">Kamera starten</div></div>'
        + '</div>'
        + '<div style="display:grid;grid-template-columns:1fr 2fr 1fr;gap:6px;margin-top:8px">'
        + '<button class="btn sec" id="camFlip" style="padding:12px">🔄</button>'
        + '<button class="btn" id="camStart" style="padding:12px;font-size:13px">📷 Starten</button>'
        + '<button class="btn" id="camShot" style="padding:12px;display:none">📸</button>'
        + '</div></div>';

      html += '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<h3 style="margin:0">🖼️ Galerie ('+state.photos.length+')</h3>'
        + (state.photos.length ? '<button id="camClear" style="background:transparent;border:none;color:#ff8080;font-size:10px;font-weight:900;cursor:pointer">Alle löschen</button>' : '')
        + '</div>';
      if(!state.photos.length){
        html += '<div style="text-align:center;color:var(--text-mute);padding:20px;font-size:12px">Keine Fotos</div>';
      } else {
        html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">';
        state.photos.slice().reverse().forEach(function(p){
          html += '<div style="position:relative;aspect-ratio:1;border-radius:6px;overflow:hidden;background:#000">'
            + '<img src="'+p.data+'" style="width:100%;height:100%;object-fit:cover;cursor:pointer" data-view="'+p.id+'">'
            + '<button data-del="'+p.id+'" style="position:absolute;top:2px;right:2px;background:rgba(0,0,0,.7);border:none;color:#ff8080;border-radius:50%;width:20px;height:20px;cursor:pointer;font-size:11px">✕</button>'
            + '</div>';
        });
        html += '</div>';
      }
      html += '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#camStart").addEventListener("click", startCam);
      container.querySelector("#camFlip").addEventListener("click", function(){ state.facing = state.facing === "environment" ? "user" : "environment"; if(state.stream){ stopCam(); setTimeout(startCam, 200); } });
      var shot = container.querySelector("#camShot");
      if(shot) shot.addEventListener("click", takeShot);
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          state.photos = state.photos.filter(function(p){ return p.id !== el.dataset.del; });
          store.set("photos", state.photos); build();
        });
      });
      container.querySelectorAll("[data-view]").forEach(function(el){
        el.addEventListener("click", function(){
          var p = state.photos.find(function(x){ return x.id === el.dataset.view; });
          if(!p) return;
          var w = window.open("");
          w.document.write('<img src="'+p.data+'" style="max-width:100%;display:block;margin:auto">');
        });
      });
      var cc = container.querySelector("#camClear");
      if(cc) cc.addEventListener("click", function(){
        if(!confirm("Alle Fotos löschen?")) return;
        state.photos = []; store.set("photos", []); build();
      });
    }

    function startCam(){
      if(!navigator.mediaDevices){ alert("Kamera nicht verfügbar"); return; }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: state.facing }, audio: false })
        .then(function(stream){
          state.stream = stream;
          var v = container.querySelector("#camVideo");
          v.srcObject = stream;
          v.style.display = "block";
          container.querySelector("#camPlaceholder").style.display = "none";
          container.querySelector("#camStart").style.display = "none";
          container.querySelector("#camShot").style.display = "block";
        })
        .catch(function(e){ alert("Kamera-Zugriff verweigert: " + e.message); });
    }

    function stopCam(){
      if(state.stream){ state.stream.getTracks().forEach(function(t){ t.stop(); }); state.stream = null; }
    }

    function takeShot(){
      var v = container.querySelector("#camVideo");
      if(!v || !state.stream) return;
      var canvas = document.createElement("canvas");
      canvas.width = v.videoWidth;
      canvas.height = v.videoHeight;
      canvas.getContext("2d").drawImage(v, 0, 0);
      var data = canvas.toDataURL("image/jpeg", 0.85);
      state.photos.push({ id:"p"+Date.now(), data:data, created:Date.now() });
      // Cap at 20 photos (storage)
      if(state.photos.length > 20) state.photos = state.photos.slice(-20);
      store.set("photos", state.photos);
      if(navigator.vibrate) navigator.vibrate(50);
      if(HalDo.Notify) HalDo.Notify.success("Foto aufgenommen");
      build();
      // Restart camera UI
      var v2 = container.querySelector("#camVideo");
      if(v2 && state.stream){ v2.srcObject = state.stream; v2.style.display = "block"; v2.play(); }
      container.querySelector("#camPlaceholder").style.display = "none";
      container.querySelector("#camStart").style.display = "none";
      container.querySelector("#camShot").style.display = "block";
    }

    build();
  }

  HalDoApp("kamera", { name: "Kamera", icon: "📷", render: render, category: "werkzeuge" });
  console.log("🦚 kamera.js v1.0 geladen");
})();
