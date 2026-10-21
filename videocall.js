/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VIDEOCALL (v300)
   Webcam-Preview · Anrufe · Favoriten
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "call");
    var stream = null;

    function build(){
      var body = '';
      var calls = store.get("calls", []);

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "call" ? " active" : "") + '" data-vct="call">📹 Videoanruf</button>'
        + '<button class="tab' + (tab === "history" ? " active" : "") + '" data-vct="history">📞 Verlauf</button>'
        + '</div>';

      if(tab === "call"){
        body += '<div class="card">'
          + '<div style="position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:16/9;margin-bottom:12px">'
          + '<video id="localVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;display:block"></video>'
          + '<div id="noCam" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--text-mute);background:rgba(0,0,0,.8)">'
          + '<div style="font-size:48px">📷</div><div style="font-size:12px;margin-top:8px">Kamera starten</div>'
          + '</div></div>';

        body += '<div style="display:flex;gap:8px">'
          + '<button class="btn full" id="btnStartCam" style="background:var(--p1);color:#000">📷 Kamera starten</button>'
          + '<button class="btn danger" id="btnStopCam" style="width:80px">⏹</button>'
          + '</div>'
          
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:12px">'
          + '<button class="btn full" id="btnSimCall" style="background:linear-gradient(135deg,#4ade80,#00e5ff);color:#000">📞 Anruf starten</button>'
          + '<button class="btn sec full" id="btnAddFav">+ Kontakt</button>'
          + '</div></div>';
      }

      if(tab === "history"){
        body += '<div class="card"><h3>📞 Verlauf (' + calls.length + ')</h3>';
        if(!calls.length) body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Anrufe</div>';
        else {
          calls.slice().reverse().forEach(function(c){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div><div style="font-size:12.5px;font-weight:800">📹 ' + _esc(c.name) + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(c.date) + '</div></div>'
              + '<button data-vcall="'+_esc(c.name)+'" style="background:linear-gradient(135deg,#4ade80,#00e5ff);border:none;border-radius:6px;color:#000;cursor:pointer;padding:6px 10px;font-size:11px;font-weight:900">📹</button>'
              + '</div>';
          });
          body += '<button class="btn sec full" id="vClear" style="margin-top:10px">🗑️ Verlauf löschen</button>';
        }
        body += '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-vct]").forEach(b => {
        b.addEventListener("click", function(){ tab = b.dataset.vct; store.set("tab", tab); build(); });
      });

      if(tab === "call"){
        var video = container.querySelector("#localVideo");
        var noCam = container.querySelector("#noCam");
        var btnStart = container.querySelector("#btnStartCam");
        var btnStop = container.querySelector("#btnStopCam");

        btnStart.addEventListener("click", async function(){
          try {
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            video.srcObject = stream;
            noCam.style.display = "none";
            if(HalDo.Notify) HalDo.Notify.success("Kamera gestartet");
          } catch(e) {
            alert("Kamera-Fehler: " + e.message);
          }
        });

        btnStop.addEventListener("click", function(){
          if(stream) { stream.getTracks().forEach(t => t.stop()); stream = null; }
          video.srcObject = null;
          noCam.style.display = "flex";
        });

        container.querySelector("#btnSimCall").addEventListener("click", function(){
          var n = prompt("Name des Kontakts:");
          if(!n) return;
          var c = store.get("calls", []); c.push({ name: n, type: "out", date: new Date().toLocaleString("de-DE") }); store.set("calls", c);
          if(HalDo.Notify) HalDo.Notify.info("📹 Videoanruf zu " + n + " simuliert");
          tab = "history"; store.set("tab", tab); build();
        });

        container.querySelector("#btnAddFav").addEventListener("click", function(){
          var n = prompt("Name des Favoriten:");
          if(!n) return;
          var c = store.get("calls", []); c.push({ name: n, type: "fav", date: new Date().toLocaleString("de-DE") }); store.set("calls", c);
          build();
        });
      }

      if(tab === "history"){
        container.querySelectorAll("[data-vcall]").forEach(el => {
          el.addEventListener("click", function(){
            var n = el.dataset.vcall;
            if(HalDo.Notify) HalDo.Notify.info("📹 Wähle " + n + "...");
          });
        });
        var clr = container.querySelector("#vClear");
        if(clr) clr.addEventListener("click", function(){ if(confirm("Verlauf löschen?")) { store.set("calls", []); build(); } });
      }
    }

    build();
  }

  HalDoApp("videocall", { name: "VideoCall", icon: "📹", render: render, category: "kommunikation" });
  console.log("🦚 videocall.js v300 geladen — WEBCAM READY");
})();
