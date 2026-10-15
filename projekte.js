/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — PROJEKTE (v152)
   Projektverwaltung · Aufgaben · Status · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "aktiv");

    function build(openIdx, editIdx){
      var body = "";

      if(tab === "aktiv" || tab === "abgeschlossen" || tab === "archiv"){
        var projects = store.get("projects", []);

        var list = projects.filter(function(p){
          var status = p.status || "aktiv";
          if(tab === "aktiv") return status === "aktiv";
          if(tab === "abgeschlossen") return status === "abgeschlossen";
          if(tab === "archiv") return status === "archiv";
          return true;
        });

        body = '<div class="card">'
          + '<button class="btn full" id="prNew" style="margin-bottom:10px">➕ Neues Projekt</button>';

        if(editIdx !== undefined){
          var p = projects[editIdx] || { name: "", desc: "", status: "aktiv", tasks: [], priority: "mittel" };
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="prName" placeholder="Projektname*" value="' + _esc(p.name) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:14px;font-weight:900;margin-bottom:6px">'
            + '<textarea id="prDesc" placeholder="Beschreibung" rows="2" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;font-family:inherit;resize:vertical;margin-bottom:6px">' + _esc(p.desc) + '</textarea>'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
            + '<select id="prStatus" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
            + '<option value="aktiv"' + (p.status==="aktiv"?" selected":"") + '>🟢 Aktiv</option>'
            + '<option value="abgeschlossen"' + (p.status==="abgeschlossen"?" selected":"") + '>✅ Fertig</option>'
            + '<option value="archiv"' + (p.status==="archiv"?" selected":"") + '>📦 Archiv</option>'
            + '</select>'
            + '<select id="prPriority" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
            + '<option value="niedrig"' + (p.priority==="niedrig"?" selected":"") + '>🟢 Niedrig</option>'
            + '<option value="mittel"' + (p.priority==="mittel"?" selected":"") + '>🟡 Mittel</option>'
            + '<option value="hoch"' + (p.priority==="hoch"?" selected":"") + '>🔴 Hoch</option>'
            + '</select></div>'
            + '<div style="display:flex;gap:6px;margin-top:8px">'
            + '<button class="btn" id="prSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="prCancel">✕</button>'
            + '</div></div>';
        }

        if(openIdx !== undefined && openIdx >= 0 && projects[openIdx]){
          var proj = projects[openIdx];
          var tasks = proj.tasks || [];
          var done = tasks.filter(function(t){ return t.done; }).length;
          var pct = tasks.length ? Math.round(done / tasks.length * 100) : 0;

          body += '<div style="padding:14px;background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1));border-radius:12px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<div style="font-size:15px;font-weight:900;color:var(--p1)">' + _esc(proj.name) + '</div>'
            + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:4px;line-height:1.5">' + _esc(proj.desc) + '</div>'
            + '<div style="background:rgba(0,0,0,.4);height:6px;border-radius:3px;overflow:hidden;margin-top:10px">'
            + '<div style="background:linear-gradient(90deg,var(--p1),var(--p3));height:100%;width:' + pct + '%"></div>'
            + '</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:4px">' + done + '/' + tasks.length + ' Aufgaben (' + pct + '%)</div>'
            + '</div>';

          body += '<div style="display:flex;gap:6px;margin-bottom:8px">'
            + '<input type="text" id="taskNew" placeholder="Neue Aufgabe..." style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
            + '<button class="btn" id="taskAdd">+</button>'
            + '</div>';

          if(tasks.length){
            tasks.forEach(function(t, i){
              body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;gap:8px;align-items:center">'
                + '<input type="checkbox" data-pcheck="' + i + '" ' + (t.done ? "checked" : "") + ' style="width:18px;height:18px;accent-color:var(--p1);cursor:pointer">'
                + '<div style="flex:1;font-size:12.5px;' + (t.done ? "text-decoration:line-through;color:var(--text-mute)" : "") + '">' + _esc(t.text) + '</div>'
                + '<button data-ptaskdel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer;font-size:12px">✕</button>'
                + '</div>';
            });
          } else {
            body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:11.5px">Keine Aufgaben</div>';
          }

          body += '<button class="btn sec full" id="prClose" style="margin-top:10px">✕ Schließen</button>';
        }

        if(!list.length && editIdx === undefined && (openIdx === undefined || openIdx < 0)){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Projekte in dieser Kategorie</div>';
        } else {
          list.forEach(function(p){
            var ri = projects.indexOf(p);
            var tasks2 = p.tasks || [];
            var done2 = tasks2.filter(function(t){ return t.done; }).length;
            var pct2 = tasks2.length ? Math.round(done2 / tasks2.length * 100) : 0;
            var prioCol = p.priority === "hoch" ? "#ff8080" : p.priority === "mittel" ? "#fbbf24" : "#4ade80";

            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid ' + prioCol + '">'
              + '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">'
              + '<div style="flex:1;min-width:0" data-popen="' + ri + '" style="cursor:pointer">'
              + '<div style="font-size:13px;font-weight:900;color:var(--p1)">' + _esc(p.name) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + (tasks2.length ? tasks2.length + " Aufgaben · " + pct2 + "%" : "Keine Aufgaben") + '</div>'
              + '<div style="background:rgba(0,0,0,.4);height:4px;border-radius:2px;overflow:hidden;margin-top:6px">'
              + '<div style="background:var(--p1);height:100%;width:' + pct2 + '%"></div>'
              + '</div></div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-pedit="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:4px 8px;font-size:11px">✏️</button>'
              + '<button data-pdel2="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "settings"){
        var projects2 = store.get("projects", []);
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">📊 PROJEKTE</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + projects2.length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="prClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="aktiv"?" active":"") + '" data-prt="aktiv">🟢 Aktiv</button>'
        + '<button class="tab' + (tab==="abgeschlossen"?" active":"") + '" data-prt="abgeschlossen">✅ Fertig</button>'
        + '<button class="tab' + (tab==="archiv"?" active":"") + '" data-prt="archiv">📦 Archiv</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-prt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-prt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.prt; store.set("tab", tab); build();
        });
      });

      if(tab === "aktiv" || tab === "abgeschlossen" || tab === "archiv"){
        var nb = container.querySelector("#prNew");
        if(nb) nb.addEventListener("click", function(){ build(undefined, -1); });

        if(editIdx !== undefined){
          var save = container.querySelector("#prSave");
          if(save) save.addEventListener("click", function(){
            var projects3 = store.get("projects", []);
            var name = container.querySelector("#prName").value.trim();
            if(!name){ alert("Name ist Pflicht"); return; }
            var obj = {
              name: name,
              desc: container.querySelector("#prDesc").value.trim(),
              status: container.querySelector("#prStatus").value,
              priority: container.querySelector("#prPriority").value,
              tasks: editIdx >= 0 ? (projects3[editIdx].tasks || []) : [],
              date: new Date().toLocaleString("de-DE")
            };
            if(editIdx === -1) projects3.push(obj);
            else projects3[editIdx] = obj;
            store.set("projects", projects3);
            if(HalDo.Notify) HalDo.Notify.success("Projekt gespeichert", { app: "projekte" });
            build();
          });
          var cancel = container.querySelector("#prCancel");
          if(cancel) cancel.addEventListener("click", function(){ build(); });
        }

        container.querySelectorAll("[data-pedit]").forEach(function(el){
          el.addEventListener("click", function(e){
            e.stopPropagation();
            build(undefined, parseInt(el.dataset.pedit));
          });
        });
        container.querySelectorAll("[data-pdel2]").forEach(function(el){
          el.addEventListener("click", function(e){
            e.stopPropagation();
            if(!confirm("Projekt löschen?")) return;
            var projects4 = store.get("projects", []);
            projects4.splice(parseInt(el.dataset.pdel2), 1);
            store.set("projects", projects4);
            build();
          });
        });
        container.querySelectorAll("[data-popen]").forEach(function(el){
          el.addEventListener("click", function(){
            build(parseInt(el.dataset.popen));
          });
        });

        /* Task-Add im offenen Projekt */
        var taskAdd = container.querySelector("#taskAdd");
        if(taskAdd && openIdx !== undefined && openIdx >= 0){
          taskAdd.addEventListener("click", function(){
            var inp = container.querySelector("#taskNew");
            var txt = inp.value.trim();
            if(!txt) return;
            var projects5 = store.get("projects", []);
            if(!projects5[openIdx].tasks) projects5[openIdx].tasks = [];
            projects5[openIdx].tasks.push({ text: txt, done: false });
            store.set("projects", projects5);
            build(openIdx);
          });
        }

        container.querySelectorAll("[data-pcheck]").forEach(function(el){
          el.addEventListener("change", function(){
            var projects6 = store.get("projects", []);
            var i = parseInt(el.dataset.pcheck);
            projects6[openIdx].tasks[i].done = !projects6[openIdx].tasks[i].done;
            store.set("projects", projects6);
            build(openIdx);
          });
        });
        container.querySelectorAll("[data-ptaskdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var projects7 = store.get("projects", []);
            projects7[openIdx].tasks.splice(parseInt(el.dataset.ptaskdel), 1);
            store.set("projects", projects7);
            build(openIdx);
          });
        });
        var closeBtn = container.querySelector("#prClose");
        if(closeBtn) closeBtn.addEventListener("click", function(){ build(); });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#prClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Projekte löschen?")) return;
          store.set("projects", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("projekte", { name: "Projekte", icon: "📊", render: render, category: "produktivitaet" });
  console.log("🦚 projekte.js geladen");
})();
