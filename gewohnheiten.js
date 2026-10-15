/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — GEWOHNHEITEN (v153)
   Habit-Tracker · Streaks · Statistiken · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var DEFAULTS = [
    { id: "g1", name: "Wasser trinken", icon: "💧" },
    { id: "g2", name: "Sport", icon: "💪" },
    { id: "g3", name: "Lesen", icon: "📖" },
    { id: "g4", name: "Meditation", icon: "🧘" }
  ];

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function today(){ return new Date().toISOString().split("T")[0]; }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "heute");

    function build(){
      var body = "";

      if(tab === "heute"){
        var habits = store.get("habits", DEFAULTS);
        var log = store.get("log", {});
        var td = today();
        var todayLog = log[td] || {};
        var done = habits.filter(function(h){ return todayLog[h.id]; }).length;

        body = '<div class="card">'
          + '<div style="padding:16px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;text-align:center;margin-bottom:14px;border:1.5px solid var(--p1)">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;letter-spacing:2px">HEUTE</div>'
          + '<div style="font-size:34px;font-weight:900;color:var(--p1);margin:4px 0">' + done + ' / ' + habits.length + '</div>'
          + '</div>';

        habits.forEach(function(h){
          var isDone = !!todayLog[h.id];
          var streak = calcStreak(h.id);
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;gap:10px;align-items:center;border-left:3px solid ' + (isDone ? "#4ade80" : "var(--p1)") + '">'
            + '<div style="font-size:22px">' + h.icon + '</div>'
            + '<div style="flex:1">'
            + '<div style="font-size:13px;font-weight:900;' + (isDone ? "color:#4ade80" : "") + '">' + _esc(h.name) + '</div>'
            + (streak > 0 ? '<div style="font-size:10.5px;color:#fbbf24;margin-top:2px">🔥 ' + streak + ' Tage Streak</div>' : '')
            + '</div>'
            + '<button data-toggle="' + h.id + '" style="width:36px;height:36px;border-radius:50%;border:2px solid ' + (isDone ? "#4ade80" : "var(--text-mute)") + ';background:' + (isDone ? "#4ade80" : "transparent") + ';cursor:pointer;font-size:18px;color:' + (isDone ? "#000" : "var(--text-mute)") + '">' + (isDone ? "✓" : "") + '</button>'
            + '</div>';
        });

        body += '<button class="btn sec full" id="hAdd" style="margin-top:10px">+ Neue Gewohnheit</button>';
        body += '</div>';
      }

      else if(tab === "verwalten"){
        var habits2 = store.get("habits", DEFAULTS);
        body = '<div class="card"><h3>⚙️ Verwalten (' + habits2.length + ')</h3>';
        habits2.forEach(function(h, i){
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
            + '<div style="font-size:12.5px;font-weight:800">' + h.icon + ' ' + _esc(h.name) + '</div>'
            + '<button data-hdel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
            + '</div>';
        });
        body += '</div>';
      }

      else if(tab === "stats"){
        var habits3 = store.get("habits", DEFAULTS);
        var log2 = store.get("log", {});

        /* Letzte 7 Tage */
        var last7 = [];
        for(var i = 6; i >= 0; i--){
          var d = new Date();
          d.setDate(d.getDate() - i);
          var key = d.toISOString().split("T")[0];
          var dayLog = log2[key] || {};
          var cnt = habits3.filter(function(h){ return dayLog[h.id]; }).length;
          last7.push({
            label: ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()],
            count: cnt,
            total: habits3.length
          });
        }

        body = '<div class="card"><h3>📊 7-Tage-Übersicht</h3>'
          + '<div style="display:flex;gap:6px;justify-content:space-between">';
        last7.forEach(function(d){
          var pct = d.total ? Math.round(d.count / d.total * 100) : 0;
          body += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">'
            + '<div style="font-size:10px;font-weight:900;color:var(--p1)">' + d.count + '/' + d.total + '</div>'
            + '<div style="width:100%;height:100px;background:rgba(0,0,0,.3);border-radius:6px;display:flex;align-items:flex-end;overflow:hidden">'
            + '<div style="width:100%;height:' + pct + '%;background:linear-gradient(180deg,var(--p1),var(--p3))"></div>'
            + '</div>'
            + '<div style="font-size:10px;font-weight:800;color:var(--text-mute)">' + d.label + '</div>'
            + '</div>';
        });
        body += '</div></div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🔄 GEWOHNHEITEN</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + store.get("habits", DEFAULTS).length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="hReset" style="margin-top:10px">🗑️ Auf Standard zurücksetzen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="heute"?" active":"") + '" data-hbt="heute">✅ Heute</button>'
        + '<button class="tab' + (tab==="verwalten"?" active":"") + '" data-hbt="verwalten">⚙️ Verwalten</button>'
        + '<button class="tab' + (tab==="stats"?" active":"") + '" data-hbt="stats">📊 Statistik</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-hbt="settings">⚙️ Einst.</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-hbt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.hbt; store.set("tab", tab); build();
        });
      });

      if(tab === "heute"){
        container.querySelectorAll("[data-toggle]").forEach(function(el){
          el.addEventListener("click", function(){
            var log3 = store.get("log", {});
            var td2 = today();
            if(!log3[td2]) log3[td2] = {};
            log3[td2][el.dataset.toggle] = !log3[td2][el.dataset.toggle];
            store.set("log", log3);
            build();
          });
        });
        var addBtn = container.querySelector("#hAdd");
        if(addBtn) addBtn.addEventListener("click", function(){
          var name = prompt("Name der Gewohnheit:");
          if(!name) return;
          var icon = prompt("Icon (Emoji):", "⭐") || "⭐";
          var habits4 = store.get("habits", DEFAULTS);
          habits4.push({ id: "g" + Date.now(), name: name, icon: icon });
          store.set("habits", habits4);
          build();
        });
      }

      if(tab === "verwalten"){
        container.querySelectorAll("[data-hdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Gewohnheit löschen?")) return;
            var habits5 = store.get("habits", DEFAULTS);
            habits5.splice(parseInt(el.dataset.hdel), 1);
            store.set("habits", habits5);
            build();
          });
        });
      }

      if(tab === "settings"){
        var rst = container.querySelector("#hReset");
        if(rst) rst.addEventListener("click", function(){
          if(!confirm("Alles zurücksetzen?")) return;
          store.set("habits", DEFAULTS);
          store.set("log", {});
          build();
        });
      }
    }

    function calcStreak(habitId){
      var log = store.get("log", {});
      var streak = 0;
      var d = new Date();
      while(true){
        var key = d.toISOString().split("T")[0];
        if(log[key] && log[key][habitId]){
          streak++;
          d.setDate(d.getDate() - 1);
        } else break;
      }
      return streak;
    }

    build();
  }

  HalDoApp("gewohnheiten", { name: "Gewohnheiten", icon: "🔄", render: render, category: "gesundheit" });
  console.log("🦚 gewohnheiten.js geladen");
})();
