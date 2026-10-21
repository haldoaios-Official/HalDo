/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — PROJEKTE (v300)
   Kanban · Aufgaben · Status · Priorität
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "aktiv");

    function build(){
      var body = '';
      var projects = store.get("projects", []);
      var filterStatus = tab === "aktiv" ? "active" : tab === "fertig" ? "done" : "archiv";
      
      var filtered = projects.filter(p => p.status === filterStatus);

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "aktiv" ? " active" : "") + '" data-pt="aktiv">🟢 Aktiv</button>'
        + '<button class="tab' + (tab === "fertig" ? " active" : "") + '" data-pt="fertig">✅ Fertig</button>'
        + '<button class="tab' + (tab === "archiv" ? " active" : "") + '" data-pt="archiv">📦 Archiv</button>'
        + '</div>';

      body += '<div class="card">'
        + '<button class="btn full" id="prNew" style="margin-bottom:10px">➕ Neues Projekt</button>';

      if(!filtered.length) {
        body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Projekte in dieser Liste</div>';
      } else {
        filtered.forEach(p => {
          var ri = projects.indexOf(p);
          var tasks = p.tasks || [];
          var done = tasks.filter(t => t.done).length;
          var pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;
          var prioCol = p.priority === "hoch" ? "#ff8080" : p.priority === "mittel" ? "#fbbf24" : "#4ade80";

          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:8px;border-left:3px solid ' + prioCol + '">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start">'
            + '<div style="flex:1">'
            + '<div style="font-size:13px;font-weight:900;color:var(--p1)">' + _esc(p.name) + '</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + (tasks.length ? tasks.length + " Aufgaben · " + pct + "%" : "Keine Aufgaben") + '</div>'
            + '<div style="background:rgba(0,0,0,.4);height:4px;border-radius:2px;overflow:hidden;margin-top:6px">'
            + '<div style="background:var(--p1);height:100%;width:' + pct + '%"></div>'
            + '</div></div>'
            + '<div style="display:flex;gap:4px">'
            + '<button data-pcheck="'+ri+'" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:4px 8px">✔</button>'
            + '<button data-pdel="'+ri+'" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px">✕</button>'
            + '</div></div></div>';
        });
      }
      body += '</div>';

      container.innerHTML = body;

      container.querySelectorAll("[data-pt]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.pt; store.set("tab", tab); build(); });
      });

      container.querySelector("#prNew").addEventListener("click", function(){
        var name = prompt("Projektname:"); if(!name) return;
        var prio = prompt("Priorität (niedrig, mittel, hoch):", "mittel");
        var p = store.get("projects", []);
        p.push({ name: name, status: "active", priority: prio || "mittel", tasks: [] });
        store.set("projects", p); build();
      });

      container.querySelectorAll("[data-pcheck]").forEach(el => {
        el.addEventListener("click", function(){
          var p = store.get("projects", []); var item = p[parseInt(el.dataset.pcheck)];
          if(item.status === "active") item.status = "done";
          else if(item.status === "done") item.status = "archiv";
          else item.status = "active";
          store.set("projects", p); build();
        });
      });
      container.querySelectorAll("[data-pdel]").forEach(el => {
        el.addEventListener("click", function(){
          if(!confirm("Projekt löschen?")) return;
          var p = store.get("projects", []); p.splice(parseInt(el.dataset.pdel), 1); store.set("projects", p); build();
        });
      });
    }
    build();
  }
  HalDoApp("projekte", { name: "Projekte", icon: "📊", render: render, category: "produktivitaet" });
  console.log("🦚 projekte.js v300 geladen");
})();
