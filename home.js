/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HOME (v151) · Dashboard
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    var store = ctx.store;

    function build(){
      var hour = new Date().getHours();
      var greet = hour < 6 ? "Gute Nacht" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
      var userName = HalDo.Store.get("userName", "Bruder");

      var body = '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.12),rgba(180,120,255,.12))">'
        + '<div style="font-size:32px;font-weight:900;color:var(--p1)">' + greet + ', ' + _esc(userName) + '! 🦚</div>'
        + '<div style="font-size:12px;color:var(--text-dim);margin-top:6px">' + new Date().toLocaleDateString("de-DE", {weekday:"long", day:"numeric", month:"long"}) + '</div>'
        + '</div>';

      /* Quick-Stats */
      var steps = (HalDo.Store.get("steps", {})[today()] || 0);
      var water = (HalDo.Store.get("water", {})[today()] || 0);
      var tasks = HalDo.Store.get("tasks", []);
      var openTasks = tasks.filter(function(t){ return !t.done; }).length;
      var notes = HalDo.Store.get("notes", []).length;

      body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">';
      body += statCard("👟", "Schritte", steps.toLocaleString("de-DE"), "var(--p1)");
      body += statCard("💧", "Wasser", water + " Gläser", "var(--p2)");
      body += statCard("✅", "Offen", openTasks + " Tasks", "#fbbf24");
      body += statCard("📝", "Notizen", notes + "", "var(--p3)");
      body += '</div>';

      /* Quick-Actions */
      body += '<div class="card"><h3>⚡ Schnellzugriff</h3>'
        + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">'
        + quickAction("chat", "💬", "Chat")
        + quickAction("fitness", "💪", "Fitness")
        + quickAction("kueche", "🍳", "Küche")
        + quickAction("aufnahme", "🎙️", "Aufnahme")
        + quickAction("settings", "⚙️", "Settings")
        + quickAction("system-center", "🖥️", "System")
        + '</div></div>';

      /* Heutige Tasks */
      var todayTasks = tasks.filter(function(t){ return !t.done; }).slice(0, 5);
      if(todayTasks.length){
        body += '<div class="card"><h3>✅ Offene Aufgaben</h3>';
        todayTasks.forEach(function(t){
          body += '<div style="padding:8px 10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;font-size:12.5px">• ' + _esc(t.text) + '</div>';
        });
        body += '<button class="btn sec full" data-open="tasks" style="margin-top:8px">Alle anzeigen</button></div>';
      }

      container.innerHTML = body;
      container.querySelectorAll("[data-open]").forEach(function(el){
        el.addEventListener("click", function(){ HalDo.Apps.open(el.dataset.open); });
      });
    }

    function statCard(icon, label, val, col){
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:12px;border-left:3px solid ' + col + '">'
        + '<div style="font-size:20px">' + icon + '</div>'
        + '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;margin-top:4px">' + label + '</div>'
        + '<div style="font-size:16px;font-weight:900;color:' + col + '">' + val + '</div>'
        + '</div>';
    }

    function quickAction(id, icon, name){
      return '<button data-open="' + id + '" style="padding:12px 6px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:12px;cursor:pointer;color:inherit;font-family:inherit">'
        + '<div style="font-size:22px">' + icon + '</div>'
        + '<div style="font-size:10.5px;font-weight:800;color:var(--text-dim);margin-top:4px">' + name + '</div>'
        + '</button>';
    }

    function today(){ return new Date().toISOString().split("T")[0]; }
    function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

    build();
  }

  HalDoApp("home", { name: "Home", icon: "🏠", render: render, category: "app" });
  console.log("🦚 home.js geladen");
})();
