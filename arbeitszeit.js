/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ARBEITSZEIT (v152)
   Zeiterfassung · Läuft · Woche · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var tickInterval = null;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function fmtH(ms){
    var s = Math.floor(ms / 1000);
    var h = Math.floor(s / 3600);
    var m = Math.floor((s % 3600) / 60);
    var sec = s % 60;
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (sec < 10 ? "0" : "") + sec;
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "tracker");

    function build(){
      var body = "";

      /* ═══ TRACKER ═══ */
      if(tab === "tracker"){
        var running = store.get("running", null);
        var entries = store.get("entries", []);
        var today2 = new Date().toISOString().split("T")[0];
        var todayMs = entries
          .filter(function(e){ return e.date && e.date.indexOf(today2) === 0; })
          .reduce(function(s, e){ return s + (e.duration || 0); }, 0);

        body = '<div class="card">'
          + '<div style="text-align:center;padding:20px">'
          + '<div id="awDisplay" style="font-size:48px;font-weight:900;color:var(--p1);font-variant-numeric:tabular-nums">'
          + (running ? fmtH(Date.now() - running.start) : "00:00:00")
          + '</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:6px">'
          + (running ? "🟢 Läuft seit " + new Date(running.start).toLocaleTimeString("de-DE") : "Bereit")
          + '</div>'
          + '</div>';

        if(running){
          body += '<button class="btn danger full" id="awStop">⏹ Stoppen</button>';
        } else {
          body += '<div style="display:flex;gap:6px;margin-bottom:8px">'
            + '<input type="text" id="awTask" placeholder="Aufgabe (z.B. Kundenprojekt)" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
            + '</div>'
            + '<button class="btn full" id="awStart">▶ Start</button>';
        }

        body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-top:12px;text-align:center">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:800">HEUTE</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p3)">' + fmtH(todayMs) + '</div>'
          + '</div></div>';

        if(running && !tickInterval){
          tickInterval = setInterval(function(){
            var el = document.getElementById("awDisplay");
            if(el) el.textContent = fmtH(Date.now() - running.start);
          }, 1000);
        }
      }

      /* ═══ EINTRÄGE ═══ */
      else if(tab === "eintraege"){
        var entries2 = store.get("entries", []);
        body = '<div class="card"><h3>📋 Einträge (' + entries2.length + ')</h3>';
        if(!entries2.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Einträge</div>';
        } else {
          entries2.slice().reverse().forEach(function(e, idx){
            var ri = entries2.length - 1 - idx;
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid var(--p3)">'
              + '<div style="display:flex;justify-content:space-between;align-items:flex-start">'
              + '<div style="flex:1">'
              + '<div style="font-size:12.5px;font-weight:900">' + _esc(e.task || "Ohne Titel") + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + _esc(e.date) + '</div>'
              + '<div style="font-size:15px;font-weight:900;color:var(--p1);margin-top:4px">' + fmtH(e.duration) + '</div>'
              + '</div>'
              + '<button data-awdel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:14px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      /* ═══ WOCHE ═══ */
      else if(tab === "woche"){
        var entries3 = store.get("entries", []);
        var days = [];
        for(var i = 6; i >= 0; i--){
          var d = new Date();
          d.setDate(d.getDate() - i);
          var key = d.toISOString().split("T")[0];
          var ms = entries3.filter(function(e){ return e.date && e.date.indexOf(key) === 0; })
            .reduce(function(s, e){ return s + (e.duration || 0); }, 0);
          days.push({
            label: ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()],
            ms: ms
          });
        }
        var maxMs = Math.max.apply(null, days.map(function(d){ return d.ms; }).concat([3600000]));
        var total = days.reduce(function(s, d){ return s + d.ms; }, 0);

        body = '<div class="card"><h3>📊 7-Tage-Übersicht</h3>'
          + '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px;margin-bottom:12px;text-align:center">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">GESAMT</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + fmtH(total) + '</div>'
          + '</div>'
          + '<div style="display:flex;gap:6px;align-items:flex-end;height:140px">';
        days.forEach(function(d){
          var h = Math.max(4, Math.round(d.ms / maxMs * 100));
          body += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">'
            + '<div style="font-size:9.5px;color:var(--p1);font-weight:900">' + (d.ms > 0 ? Math.floor(d.ms/3600000) + "h" : "") + '</div>'
            + '<div style="width:100%;height:100px;display:flex;align-items:flex-end">'
            + '<div style="width:100%;height:' + h + '%;background:linear-gradient(180deg,var(--p1),var(--p3));border-radius:6px 6px 0 0"></div>'
            + '</div>'
            + '<div style="font-size:10px;font-weight:800;color:var(--text-mute)">' + d.label + '</div>'
            + '</div>';
        });
        body += '</div></div>';
      }

      /* ═══ SETTINGS ═══ */
      else if(tab === "settings"){
        var entries4 = store.get("entries", []);
        var hourlyRate = store.get("hourlyRate", 0);
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div class="field"><label>Stundensatz (€)</label>'
          + '<input type="number" id="awRate" value="' + hourlyRate + '" step="0.5" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '</div>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-top:8px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">📊 GESAMT EINTRÄGE</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + entries4.length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="awClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="tracker"?" active":"") + '" data-awt="tracker">⏱️ Tracker</button>'
        + '<button class="tab' + (tab==="eintraege"?" active":"") + '" data-awt="eintraege">📋 Einträge</button>'
        + '<button class="tab' + (tab==="woche"?" active":"") + '" data-awt="woche">📊 Woche</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-awt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-awt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.awt; store.set("tab", tab); build();
        });
      });

      if(tab === "tracker"){
        var startBtn = container.querySelector("#awStart");
        if(startBtn) startBtn.addEventListener("click", function(){
          var task = container.querySelector("#awTask").value.trim() || "Arbeit";
          store.set("running", { start: Date.now(), task: task });
          build();
        });
        var stopBtn = container.querySelector("#awStop");
        if(stopBtn) stopBtn.addEventListener("click", function(){
          var running2 = store.get("running", null);
          if(!running2) return;
          var entries5 = store.get("entries", []);
          entries5.push({
            task: running2.task,
            date: new Date().toLocaleString("de-DE"),
            duration: Date.now() - running2.start
          });
          store.set("entries", entries5);
          store.set("running", null);
          if(tickInterval){ clearInterval(tickInterval); tickInterval = null; }
          if(HalDo.Notify) HalDo.Notify.success("Zeit gespeichert", { app: "arbeitszeit" });
          build();
        });
      }

      if(tab === "eintraege"){
        container.querySelectorAll("[data-awdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var entries6 = store.get("entries", []);
            entries6.splice(parseInt(el.dataset.awdel), 1);
            store.set("entries", entries6);
            build();
          });
        });
      }

      if(tab === "settings"){
        var rate = container.querySelector("#awRate");
        if(rate) rate.addEventListener("change", function(){
          store.set("hourlyRate", parseFloat(this.value) || 0);
        });
        var clr = container.querySelector("#awClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Einträge löschen?")) return;
          store.set("entries", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("arbeitszeit", { name: "Arbeitszeit", icon: "⏰", render: render, category: "produktivitaet" });
  console.log("🦚 arbeitszeit.js geladen");
})();
