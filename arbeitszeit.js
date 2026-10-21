/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ARBEITSZEIT (v300)
   Live-Timer · Einträge · Statistik
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function fmt(ms) { var s = Math.floor(ms/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60; return (h<10?"0":"")+h + ":" + (m<10?"0":"")+m + ":" + (sec<10?"0":"")+sec; }

  var timerInt = null;

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "tracker");

    function build(){
      var body = '';
      var running = store.get("running", null);
      var entries = store.get("entries", []);
      
      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "tracker" ? " active" : "") + '" data-att="tracker">⏱️ Tracker</button>'
        + '<button class="tab' + (tab === "entries" ? " active" : "") + '" data-att="entries">📋 Einträge</button>'
        + '</div>';

      if(tab === "tracker"){
        body += '<div class="card" style="text-align:center;padding:24px">'
          + '<div id="timerDisplay" style="font-size:48px;font-weight:900;color:var(--p1);font-variant-numeric:tabular-nums">' + (running ? fmt(Date.now() - running.start) : "00:00:00") + '</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:8px">' + (running ? "🟢 Läuft seit " + new Date(running.start).toLocaleTimeString("de-DE") : "Bereit") + '</div>'
          + '<button class="btn full" id="btnToggle" style="margin-top:20px;background:' + (running ? "linear-gradient(135deg,#ff4d4d,#ff8080)" : "linear-gradient(135deg,#4ade80,#00e5ff)") + ';color:#000;font-size:15px;padding:16px">'
          + (running ? "⏹ Stoppen" : "▶ Starten") + '</button>'
          + '</div>';
      }

      if(tab === "entries"){
        body += '<div class="card"><h3>📋 Einträge (' + entries.length + ')</h3>';
        if(!entries.length) body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Einträge</div>';
        else {
          entries.slice().reverse().forEach(function(e, idx){
            var ri = entries.length - 1 - idx;
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid var(--p3)">'
              + '<div style="display:flex;justify-content:space-between">'
              + '<div><div style="font-size:12px;font-weight:900">' + _esc(e.date) + '</div>'
              + '<div style="font-size:15px;font-weight:900;color:var(--p1)">' + fmt(e.duration) + '</div></div>'
              + '<button data-del="'+ri+'" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div></div>';
          });
          body += '<button class="btn danger full" id="clearAll" style="margin-top:10px">🗑️ Alle löschen</button>';
        }
        body += '</div>';
      }

      container.innerHTML = body;

      container.querySelectorAll("[data-att]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.att; store.set("tab", tab); build(); });
      });

      if(tab === "tracker"){
        if(running && !timerInt) {
          timerInt = setInterval(() => {
            var el = container.querySelector("#timerDisplay");
            if(el) el.textContent = fmt(Date.now() - running.start);
          }, 1000);
        }
        container.querySelector("#btnToggle").addEventListener("click", function(){
          if(running) {
            clearInterval(timerInt); timerInt = null;
            var e = store.get("entries", []);
            e.push({ date: new Date().toLocaleString("de-DE"), duration: Date.now() - running.start });
            store.set("entries", e); store.set("running", null);
            if(HalDo.Notify) HalDo.Notify.success("Arbeitszeit gespeichert");
          } else {
            store.set("running", { start: Date.now() });
          }
          build();
        });
      }

      if(tab === "entries"){
        container.querySelectorAll("[data-del]").forEach(el => {
          el.addEventListener("click", function(){
            var e = store.get("entries", []); e.splice(parseInt(el.dataset.del), 1); store.set("entries", e); build();
          });
        });
        var clr = container.querySelector("#clearAll");
        if(clr) clr.addEventListener("click", function(){ if(confirm("Alle löschen?")) { store.set("entries", []); build(); } });
      }
    }
    build();
  }
  HalDoApp("arbeitszeit", { name: "Arbeitszeit", icon: "⏰", render: render, category: "produktivitaet" });
  console.log("🦚 arbeitszeit.js v300 geladen");
})();
