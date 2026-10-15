/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — STIMMUNG (v153)
   Mood-Tracker · Verlauf · Statistik · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var MOODS = [
    { emoji: "😄", label: "Super", value: 5, color: "#4ade80" },
    { emoji: "🙂", label: "Gut", value: 4, color: "#84cc16" },
    { emoji: "😐", label: "Okay", value: 3, color: "#fbbf24" },
    { emoji: "😔", label: "Schlecht", value: 2, color: "#fb923c" },
    { emoji: "😢", label: "Sehr schlecht", value: 1, color: "#ff8080" }
  ];

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "tracker");

    function build(){
      var body = "";

      if(tab === "tracker"){
        var moods = store.get("moods", []);
        var today2 = new Date().toISOString().split("T")[0];
        var todayMood = moods.find(function(m){ return m.date && m.date.indexOf(today2) === 0; });

        body = '<div class="card"><h3>😊 Wie fühlst du dich heute?</h3>';

        if(todayMood){
          var cur = MOODS.find(function(m){ return m.value === todayMood.value; }) || MOODS[2];
          body += '<div style="padding:20px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:14px;text-align:center;border:1.5px solid ' + cur.color + '">'
            + '<div style="font-size:64px">' + cur.emoji + '</div>'
            + '<div style="font-size:16px;font-weight:900;color:' + cur.color + ';margin-top:8px">' + cur.label + '</div>'
            + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Um ' + _esc(todayMood.time) + ' erfasst</div>'
            + (todayMood.note ? '<div style="font-size:12px;color:var(--text-dim);margin-top:10px;font-style:italic">"' + _esc(todayMood.note) + '"</div>' : '')
            + '</div>'
            + '<button class="btn sec full" id="moodUpdate" style="margin-top:12px">✏️ Aktualisieren</button>';
        } else {
          body += '<div style="font-size:12px;color:var(--text-dim);text-align:center;margin-bottom:14px">Wähle deine Stimmung</div>'
            + '<div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-bottom:14px">';
          MOODS.forEach(function(m){
            body += '<button data-mood="' + m.value + '" style="padding:14px 6px;background:rgba(0,0,0,.2);border:1.5px solid var(--border-soft);border-radius:12px;cursor:pointer;transition:.15s;text-align:center" onmouseover="this.style.borderColor=\'' + m.color + '\'" onmouseout="this.style.borderColor=\'var(--border-soft)\'">'
              + '<div style="font-size:28px">' + m.emoji + '</div>'
              + '<div style="font-size:9.5px;color:var(--text-mute);font-weight:800;margin-top:4px">' + m.label + '</div>'
              + '</button>';
          });
          body += '</div>'
            + '<div class="field"><label>Notiz (optional)</label>'
            + '<textarea id="moodNote" placeholder="Was ist passiert?" rows="2" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:12.5px;font-family:inherit;resize:vertical"></textarea></div>';
        }
        body += '</div>';

        /* Letzte 7 Tage Übersicht */
        var last7 = [];
        for(var i = 6; i >= 0; i--){
          var d = new Date();
          d.setDate(d.getDate() - i);
          var key = d.toISOString().split("T")[0];
          var m = moods.find(function(x){ return x.date && x.date.indexOf(key) === 0; });
          last7.push({
            label: ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()],
            value: m ? m.value : 0,
            emoji: m ? (MOODS.find(function(x){ return x.value === m.value; }) || {}).emoji || "—" : "—"
          });
        }

        body += '<div class="card"><h3>📊 Letzte 7 Tage</h3>'
          + '<div style="display:flex;gap:6px;justify-content:space-between">';
        last7.forEach(function(d){
          body += '<div style="flex:1;text-align:center">'
            + '<div style="font-size:24px">' + d.emoji + '</div>'
            + '<div style="font-size:10px;font-weight:800;color:var(--text-mute);margin-top:4px">' + d.label + '</div>'
            + '</div>';
        });
        body += '</div></div>';
      }

      else if(tab === "verlauf"){
        var moods2 = store.get("moods", []);
        body = '<div class="card"><h3>📜 Verlauf (' + moods2.length + ')</h3>';
        if(!moods2.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Einträge</div>';
        } else {
          moods2.slice().reverse().forEach(function(m){
            var ri = moods2.indexOf(m);
            var mood = MOODS.find(function(x){ return x.value === m.value; }) || MOODS[2];
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid ' + mood.color + ';display:flex;justify-content:space-between;align-items:center">'
              + '<div style="display:flex;gap:10px;align-items:center">'
              + '<div style="font-size:24px">' + mood.emoji + '</div>'
              + '<div>'
              + '<div style="font-size:12.5px;font-weight:900;color:' + mood.color + '">' + mood.label + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute)">' + _esc(m.date) + ' · ' + _esc(m.time || "") + '</div>'
              + (m.note ? '<div style="font-size:11px;color:var(--text-dim);margin-top:4px;font-style:italic">"' + _esc(m.note) + '"</div>' : '')
              + '</div></div>'
              + '<button data-mooddel="' + ri + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "stats"){
        var moods3 = store.get("moods", []);
        var total = moods3.length;
        var avg = total ? (moods3.reduce(function(s, m){ return s + m.value; }, 0) / total).toFixed(1) : "—";
        var best = total ? MOODS.find(function(m){ return m.value === Math.max.apply(null, moods3.map(function(x){ return x.value; })); }) : null;
        var worst = total ? MOODS.find(function(m){ return m.value === Math.min.apply(null, moods3.map(function(x){ return x.value; })); }) : null;

        body = '<div class="card"><h3>📈 Statistik</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">'
          + '<div style="padding:14px;background:rgba(0,229,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">EINTRÄGE</div>'
          + '<div style="font-size:24px;font-weight:900;color:var(--p1)">' + total + '</div>'
          + '</div>'
          + '<div style="padding:14px;background:rgba(180,120,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">DURCHSCHNITT</div>'
          + '<div style="font-size:24px;font-weight:900;color:var(--p3)">' + avg + '/5</div>'
          + '</div></div>';

        if(best) body += '<div style="padding:12px;background:rgba(74,222,128,.1);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
          + '<span style="font-size:12px;font-weight:800">🏆 Beste Stimmung</span>'
          + '<span style="font-size:20px">' + best.emoji + '</span>'
          + '</div>';
        if(worst) body += '<div style="padding:12px;background:rgba(255,128,128,.1);border-radius:10px;display:flex;justify-content:space-between;align-items:center">'
          + '<span style="font-size:12px;font-weight:800">📉 Schlechteste</span>'
          + '<span style="font-size:20px">' + worst.emoji + '</span>'
          + '</div>';
        body += '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">😊 EINTRÄGE</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + store.get("moods", []).length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="moodClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="tracker"?" active":"") + '" data-stt="tracker">😊 Heute</button>'
        + '<button class="tab' + (tab==="verlauf"?" active":"") + '" data-stt="verlauf">📜 Verlauf</button>'
        + '<button class="tab' + (tab==="stats"?" active":"") + '" data-stt="stats">📈 Statistik</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-stt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-stt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.stt; store.set("tab", tab); build();
        });
      });

      if(tab === "tracker"){
        container.querySelectorAll("[data-mood]").forEach(function(el){
          el.addEventListener("click", function(){
            var val = parseInt(el.dataset.mood);
            var note = container.querySelector("#moodNote");
            var moods4 = store.get("moods", []);
            moods4.push({
              value: val,
              note: note ? note.value.trim() : "",
              date: new Date().toLocaleString("de-DE"),
              time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })
            });
            store.set("moods", moods4);
            if(HalDo.Notify) HalDo.Notify.success("Stimmung erfasst! " + (MOODS.find(function(m){ return m.value === val; }) || {}).emoji, { app: "stimmung" });
            build();
          });
        });
        var upBtn = container.querySelector("#moodUpdate");
        if(upBtn) upBtn.addEventListener("click", function(){
          store.set("moods", store.get("moods", []).filter(function(m){
            return m.date.indexOf(today2()) !== 0;
          }));
          build();
        });
      }

      function today2(){ return new Date().toISOString().split("T")[0]; }

      if(tab === "verlauf"){
        container.querySelectorAll("[data-mooddel]").forEach(function(el){
          el.addEventListener("click", function(){
            var moods5 = store.get("moods", []);
            moods5.splice(parseInt(el.dataset.mooddel), 1);
            store.set("moods", moods5);
            build();
          });
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#moodClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("Alle Stimmungen löschen?")) return;
          store.set("moods", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("stimmung", { name: "Stimmung", icon: "😊", render: render, category: "gesundheit" });
  console.log("🦚 stimmung.js geladen");
})();
