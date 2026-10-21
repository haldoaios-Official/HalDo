/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — GEWOHNHEITEN (v300)
   Daily Habits · Streaks · Fortschritt
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function today(){ return new Date().toISOString().split("T")[0]; }

  function render(container, ctx){
    var store = ctx.store;
    var habits = store.get("habits", [
      { id: 1, name: "Wasser trinken", icon: "💧" },
      { id: 2, name: "Sport", icon: "💪" },
      { id: 3, name: "Lesen", icon: "📖" }
    ]);
    var log = store.get("log", {});
    var td = today();
    var todayLog = log[td] || {};

    function build(){
      var done = habits.filter(h => todayLog[h.id]).length;
      var body = '<div class="card" style="text-align:center">'
        + '<h3>Tägliche Gewohnheiten</h3>'
        + '<div style="font-size:32px;font-weight:900;color:var(--p1)">' + done + ' / ' + habits.length + '</div>'
        + '</div>';

      body += '<div class="card">';
      habits.forEach(h => {
        var isDone = !!todayLog[h.id];
        body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;gap:10px;align-items:center;border-left:3px solid '+(isDone?"#4ade80":"var(--p1)")+'">'
          + '<div style="font-size:22px">'+h.icon+'</div>'
          + '<div style="flex:1;font-size:13px;font-weight:900;'+(isDone?"color:#4ade80;text-decoration:line-through":"")+'">'+_esc(h.name)+'</div>'
          + '<button data-toggle="'+h.id+'" style="width:36px;height:36px;border-radius:50%;border:2px solid '+(isDone?"#4ade80":"var(--text-mute)")+';background:'+(isDone?"#4ade80":"transparent")+';cursor:pointer;font-size:18px;color:'+(isDone?"#000":"var(--text-mute)")+'">'+(isDone?"✓":"")+'</button>'
          + '</div>';
      });
      body += '</div>';

      body += '<div class="card"><button class="btn full" id="hAdd">+ Neue Gewohnheit</button></div>';
      container.innerHTML = body;

      container.querySelectorAll("[data-toggle]").forEach(el => {
        el.addEventListener("click", function(){
          var id = parseInt(this.dataset.toggle);
          if(!log[td]) log[td] = {};
          log[td][id] = !log[td][id];
          store.set("log", log); build();
          if(log[td][id] && HalDo.Notify) HalDo.Notify.success("Super gemacht!");
        });
      });

      container.querySelector("#hAdd").addEventListener("click", function(){
        var name = prompt("Name der Gewohnheit:"); if(!name) return;
        var icon = prompt("Emoji (z.B. 🏃):", "⭐");
        var h = store.get("habits", habits);
        h.push({ id: Date.now(), name: name, icon: icon || "⭐" });
        store.set("habits", h); build();
      });
    }
    build();
  }

  HalDoApp("gewohnheiten", { name: "Gewohnheiten", icon: "🔄", render: render, category: "gesundheit" });
  console.log("🦚 gewohnheiten.js v300 geladen");
})();
