/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HOME (v152) · Dashboard + App-Übersicht
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function render(container, ctx){
    function build(){
      var hour = new Date().getHours();
      var greet = hour < 6 ? "Gute Nacht" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
      var userName = HalDo.Store.get("userName", "Bruder");

      var installed = HalDo.Apps.listInstalled();
      var all = HalDo.Apps.listAll();
      var missing = all.length - installed.length;

      var body = '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.12),rgba(180,120,255,.12))">'
        + '<div style="font-size:28px;font-weight:900;color:var(--p1)">' + greet + ', ' + _esc(userName) + '! 🦚</div>'
        + '<div style="font-size:12px;color:var(--text-dim);margin-top:6px">' + new Date().toLocaleDateString("de-DE", {weekday:"long", day:"numeric", month:"long"}) + '</div>'
        + '</div>';

      /* App-Übersicht-Banner */
      body += '<button data-showapps="1" style="width:100%;padding:18px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border:1.5px solid var(--p1);border-radius:14px;cursor:pointer;color:inherit;font-family:inherit;text-align:left;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">'
        + '<div>'
        + '<div style="font-size:15px;font-weight:900;color:var(--p1)">📱 Alle Apps anzeigen</div>'
        + '<div style="font-size:11px;color:var(--text-dim);margin-top:3px">' + installed.length + ' installiert · ' + missing + ' geplant · ' + all.length + ' gesamt</div>'
        + '</div>'
        + '<div style="font-size:22px;color:var(--p1)">›</div>'
        + '</button>';

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
        + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">';

      var quick = ["chat", "fitness", "kueche", "aufnahme", "settings", "system-center"];
      quick.forEach(function(id){
        var app = HalDo.Apps.get(id);
        if(app) body += quickAction(id, app.icon, app.name);
      });
      body += '</div></div>';

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

      container.querySelectorAll("[data-showapps]").forEach(function(el){
        el.addEventListener("click", function(){
          if(HalDo.Shell && HalDo.Shell.showAllApps) HalDo.Shell.showAllApps();
        });
      });

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

  HalDoApp("home", { name: "Home", icon: "🏠", render: render, category: "system" });
  console.log("🦚 home.js geladen");
})();
