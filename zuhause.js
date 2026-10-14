/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ZUHAUSE APP (v150)
   Habits · Haushalt · Garten · Putzplan
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var DEFAULT_HABITS = [
    { id: "h1", name: "Wasser trinken", icon: "💧", goal: 8, unit: "Gläser" },
    { id: "h2", name: "Beten / Meditieren", icon: "🕊️", goal: 1, unit: "mal" },
    { id: "h3", name: "Lesen", icon: "📖", goal: 30, unit: "min" },
    { id: "h4", name: "Sport", icon: "💪", goal: 1, unit: "Einheit" },
    { id: "h5", name: "Früh aufstehen", icon: "🌅", goal: 1, unit: "mal" },
    { id: "h6", name: "Kein Zucker", icon: "🍭", goal: 1, unit: "Tag" }
  ];

  var DEFAULT_CHORES = [
    { id: "c1", name: "Staubsaugen", room: "Wohnzimmer", freq: "wöchentlich" },
    { id: "c2", name: "Bad putzen", room: "Badezimmer", freq: "wöchentlich" },
    { id: "c3", name: "Küche wischen", room: "Küche", freq: "täglich" },
    { id: "c4", name: "Müll rausbringen", room: "Alle", freq: "2x/Woche" },
    { id: "c5", name: "Wäsche waschen", room: "Waschküche", freq: "wöchentlich" },
    { id: "c6", name: "Betten machen", room: "Schlafzimmer", freq: "täglich" },
    { id: "c7", name: "Fenster putzen", room: "Alle", freq: "monatlich" },
    { id: "c8", name: "Kühlschrank reinigen", room: "Küche", freq: "monatlich" }
  ];

  var DEFAULT_GARDEN = [
    { id: "g1", name: "Tomaten", icon: "🍅", season: "Sommer", note: "Täglich gießen" },
    { id: "g2", name: "Gurken", icon: "🥒", season: "Sommer", note: "Jeden 2. Tag gießen" },
    { id: "g3", name: "Kräuter (Minze, Petersilie)", icon: "🌿", season: "Ganzjährig", note: "Im Topf" },
    { id: "g4", name: "Paprika", icon: "🫑", season: "Sommer", note: "Volle Sonne" },
    { id: "g5", name: "Salat", icon: "🥬", season: "Frühling/Herbst", note: "Halbschatten" },
    { id: "g6", name: "Erdbeeren", icon: "🍓", season: "Frühling", note: "Regelmäßig gießen" }
  ];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function today(){
    return new Date().toISOString().split("T")[0];
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "habits");

    function build(){
      var body = "";

      /* ═══ HABITS ═══ */
      if(tab === "habits"){
        var habits = store.get("habits", DEFAULT_HABITS);
        var log = store.get("habitLog", {});
        var td = today();
        var todayLog = log[td] || {};

        var doneCount = habits.filter(function(h){
          return (todayLog[h.id] || 0) >= h.goal;
        }).length;
        var pct = habits.length ? Math.round(doneCount / habits.length * 100) : 0;

        body = '<div class="card"><h3>✅ Tägliche Habits</h3>'
          + '<div style="padding:16px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;text-align:center;margin-bottom:14px;border:1.5px solid var(--p1)">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;letter-spacing:2px">HEUTE</div>'
          + '<div style="font-size:34px;font-weight:900;color:var(--p1);margin:4px 0">' + doneCount + ' / ' + habits.length + '</div>'
          + '<div style="background:rgba(0,0,0,.4);height:8px;border-radius:4px;overflow:hidden;margin-top:8px">'
          + '<div style="background:linear-gradient(90deg,var(--p1),var(--p3));height:100%;width:' + pct + '%;transition:.3s"></div>'
          + '</div></div>';

        habits.forEach(function(h){
          var cur = todayLog[h.id] || 0;
          var isDone = cur >= h.goal;
          var hpct = Math.min(100, Math.round(cur / h.goal * 100));

          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px;border-left:3px solid ' + (isDone ? "#4ade80" : "var(--p1)") + '">'
            + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
            + '<div style="display:flex;gap:8px;align-items:center">'
            + '<span style="font-size:22px">' + h.icon + '</span>'
            + '<div><div style="font-size:13px;font-weight:800;' + (isDone?"color:#4ade80":"") + '">' + _esc(h.name) + (isDone ? " ✓" : "") + '</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">' + cur + ' / ' + h.goal + ' ' + _esc(h.unit) + '</div></div>'
            + '</div>'
            + '<div style="display:flex;gap:4px">'
            + '<button data-hm="' + h.id + '" style="background:rgba(0,0,0,.3);border:1px solid var(--border-soft);border-radius:8px;color:inherit;cursor:pointer;padding:4px 10px;font-size:14px">−</button>'
            + '<button data-hp="' + h.id + '" style="background:linear-gradient(135deg,var(--p1),var(--p3));border:none;border-radius:8px;color:#000;cursor:pointer;padding:4px 10px;font-size:14px;font-weight:900">+</button>'
            + '</div>'
            + '</div>'
            + '<div style="background:rgba(0,0,0,.4);height:5px;border-radius:3px;overflow:hidden">'
            + '<div style="background:linear-gradient(90deg,var(--p1),var(--p3));height:100%;width:' + hpct + '%;transition:.3s"></div>'
            + '</div></div>';
        });

        body += '<button class="btn sec full" id="habitsReset" style="margin-top:10px">🔄 Heute zurücksetzen</button>';
        body += '</div>';

        /* 7-Tage Verlauf */
        var last7 = [];
        for(var i = 6; i >= 0; i--){
          var d = new Date();
          d.setDate(d.getDate() - i);
          var key = d.toISOString().split("T")[0];
          var dayLog = log[key] || {};
          var done = habits.filter(function(h){ return (dayLog[h.id] || 0) >= h.goal; }).length;
          last7.push({
            label: ["So","Mo","Di","Mi","Do","Fr","Sa"][d.getDay()],
            done: done,
            pct: habits.length ? Math.round(done / habits.length * 100) : 0
          });
        }

        body += '<div class="card"><h3>📊 7-Tage-Verlauf</h3>'
          + '<div style="display:flex;gap:6px;align-items:flex-end;height:120px">';
        last7.forEach(function(d){
          var h = Math.max(4, d.pct);
          body += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">'
            + '<div style="width:100%;height:100px;display:flex;align-items:flex-end">'
            + '<div style="width:100%;height:' + h + '%;background:linear-gradient(180deg,var(--p1),var(--p3));border-radius:6px 6px 0 0;transition:.3s"></div>'
            + '</div>'
            + '<div style="font-size:10px;font-weight:800;color:var(--text-mute)">' + d.label + '</div>'
            + '</div>';
        });
        body += '</div></div>';

      /* ═══ HAUSHALT ═══ */
      } else if(tab === "haushalt"){
        var chores = store.get("chores", DEFAULT_CHORES);
        var choreLog = store.get("choreLog", {});
        var today2 = today();

        body = '<div class="card"><h3>🧹 Haushalt</h3>';
        chores.forEach(function(c){
          var lastDone = choreLog[c.id] || null;
          var isDoneToday = lastDone === today2;
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid ' + (isDoneToday ? "#4ade80" : "var(--p1)") + '">'
            + '<div style="flex:1">'
            + '<div style="font-size:13px;font-weight:800;' + (isDoneToday?"color:#4ade80;text-decoration:line-through":"") + '">' + _esc(c.name) + '</div>'
            + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">📍 ' + _esc(c.room) + ' · 🔁 ' + _esc(c.freq) + '</div>'
            + (lastDone ? '<div style="font-size:9.5px;color:var(--text-dim);margin-top:2px">Zuletzt: ' + _esc(lastDone) + '</div>' : '')
            + '</div>'
            + '<button data-chore="' + c.id + '" style="background:' + (isDoneToday ? "rgba(74,222,128,.2)" : "linear-gradient(135deg,var(--p1),var(--p3))") + ';border:none;border-radius:8px;color:' + (isDoneToday ? "#4ade80" : "#000") + ';cursor:pointer;padding:8px 14px;font-size:12px;font-weight:900">'
            + (isDoneToday ? "✓" : "✓ Fertig")
            + '</button>'
            + '</div>';
        });
        body += '</div>';

      /* ═══ GARTEN ═══ */
      } else if(tab === "garten"){
        var garden = store.get("garden", DEFAULT_GARDEN);
        var gardenLog = store.get("gardenLog", {});
        var today3 = today();

        body = '<div class="card"><h3>🌱 Garten / Pflanzen</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:10px">Klick auf Pflanze → heute gegossen ✓</div>';

        garden.forEach(function(p){
          var lastWater = gardenLog[p.id] || null;
          var wateredToday = lastWater === today3;
          body += '<div data-plant="' + p.id + '" style="padding:14px;background:linear-gradient(135deg,' + (wateredToday ? "rgba(74,222,128,.15)" : "rgba(0,229,255,.08)") + ',rgba(180,120,255,.08));border-radius:12px;margin-bottom:8px;cursor:pointer;border-left:3px solid ' + (wateredToday ? "#4ade80" : "var(--p1)") + '">'
            + '<div style="display:flex;justify-content:space-between;align-items:center">'
            + '<div style="display:flex;gap:10px;align-items:center">'
            + '<span style="font-size:28px">' + p.icon + '</span>'
            + '<div><div style="font-size:13px;font-weight:900;color:var(--p1)">' + _esc(p.name) + '</div>'
            + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">🌤️ ' + _esc(p.season) + ' · ' + _esc(p.note) + '</div></div>'
            + '</div>'
            + '<div style="font-size:20px">' + (wateredToday ? "✅" : "💧") + '</div>'
            + '</div></div>';
        });
        body += '</div>';

      /* ═══ PUTZPLAN ═══ */
      } else if(tab === "putzplan"){
        var weekPlan = store.get("weekPlan", {
          "Mo": ["Staubsaugen", "Betten machen"],
          "Di": ["Küche wischen", "Müll rausbringen"],
          "Mi": ["Bad putzen", "Betten machen"],
          "Do": ["Wäsche waschen"],
          "Fr": ["Staubsaugen", "Küche wischen"],
          "Sa": ["Fenster putzen (monatl.)"],
          "So": ["Ruhetag 🕊️"]
        });

        body = '<div class="card"><h3>📅 Wochen-Putzplan</h3>';
        Object.keys(weekPlan).forEach(function(day){
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px">'
            + '<div style="font-size:12px;font-weight:900;color:var(--p1);margin-bottom:6px">' + day + '</div>';
          weekPlan[day].forEach(function(task){
            body += '<div style="font-size:11.5px;color:var(--text-dim);padding:3px 0">• ' + _esc(task) + '</div>';
          });
          body += '</div>';
        });
        body += '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="habits"?" active":"") + '" data-zt="habits">✅ Habits</button>'
        + '<button class="tab' + (tab==="haushalt"?" active":"") + '" data-zt="haushalt">🧹 Haushalt</button>'
        + '<button class="tab' + (tab==="garten"?" active":"") + '" data-zt="garten">🌱 Garten</button>'
        + '<button class="tab' + (tab==="putzplan"?" active":"") + '" data-zt="putzplan">📅 Plan</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-zt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.zt;
          store.set("tab", tab);
          build();
        });
      });

      /* ═══ Habits +/− ═══ */
      if(tab === "habits"){
        var habits2 = store.get("habits", DEFAULT_HABITS);
        var log2 = store.get("habitLog", {});
        var td2 = today();

        container.querySelectorAll("[data-hp]").forEach(function(el){
          el.addEventListener("click", function(){
            var id = el.dataset.hp;
            var h = habits2.find(function(x){ return x.id === id; });
            if(!h) return;
            var cur = (log2[td2] || {})[id] || 0;
            if(cur < h.goal){
              if(!log2[td2]) log2[td2] = {};
              log2[td2][id] = cur + 1;
              store.set("habitLog", log2);
              if(log2[td2][id] >= h.goal && window.HalDo.Voice){
                HalDo.Voice.speak("Super! " + h.name + " erledigt!");
              }
              build();
            }
          });
        });
        container.querySelectorAll("[data-hm]").forEach(function(el){
          el.addEventListener("click", function(){
            var id = el.dataset.hm;
            var cur = (log2[td2] || {})[id] || 0;
            if(cur > 0){
              if(!log2[td2]) log2[td2] = {};
              log2[td2][id] = cur - 1;
              store.set("habitLog", log2);
              build();
            }
          });
        });
        var rst = container.querySelector("#habitsReset");
        if(rst) rst.addEventListener("click", function(){
          if(!confirm("Alle Habits für heute zurücksetzen?")) return;
          var l = store.get("habitLog", {});
          l[td2] = {};
          store.set("habitLog", l);
          build();
        });
      }

      /* ═══ Haushalt ═══ */
      if(tab === "haushalt"){
        var choreLog2 = store.get("choreLog", {});
        container.querySelectorAll("[data-chore]").forEach(function(el){
          el.addEventListener("click", function(){
            var id = el.dataset.chore;
            choreLog2[id] = today();
            store.set("choreLog", choreLog2);
            if(window.HalDo.Notify) HalDo.Notify.info("Aufgabe erledigt! ✓", { app: "zuhause" });
            build();
          });
        });
      }

      /* ═══ Garten ═══ */
      if(tab === "garten"){
        var gardenLog2 = store.get("gardenLog", {});
        var garden2 = store.get("garden", DEFAULT_GARDEN);
        container.querySelectorAll("[data-plant]").forEach(function(el){
          el.addEventListener("click", function(){
            var id = el.dataset.plant;
            var p = garden2.find(function(x){ return x.id === id; });
            gardenLog2[id] = today();
            store.set("gardenLog", gardenLog2);
            if(window.HalDo.Voice && p) HalDo.Voice.speak(p.name + " gegossen! 💧");
            build();
          });
        });
      }
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("zuhause", { render: render });
  else console.warn("zuhause.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 zuhause.js geladen");
