/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — REISEN (v153)
   Reiseplanung · Packliste · Ziele · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "reisen");

    function build(openIdx){
      var body = "";

      if(tab === "reisen"){
        var trips = store.get("trips", []);
        body = '<div class="card">'
          + '<button class="btn full" id="tripNew" style="margin-bottom:10px">✈️ Neue Reise planen</button>';

        if(openIdx !== undefined){
          var t = trips[openIdx] || { name: "", dest: "", from: "", to: "", notes: "" };
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="trName" placeholder="Reise-Name" value="' + _esc(t.name) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="trDest" placeholder="Ziel" value="' + _esc(t.dest) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px">'
            + '<input type="date" id="trFrom" value="' + _esc(t.from) + '" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
            + '<input type="date" id="trTo" value="' + _esc(t.to) + '" style="padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px">'
            + '</div>'
            + '<textarea id="trNotes" placeholder="Notizen" rows="2" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;font-family:inherit;resize:vertical">' + _esc(t.notes) + '</textarea>'
            + '<div style="display:flex;gap:6px;margin-top:8px">'
            + '<button class="btn" id="trSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="trCancel">✕</button>'
            + '</div></div>';
        }

        if(!trips.length && openIdx === undefined){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">Noch keine Reisen</div>';
        } else {
          trips.forEach(function(t2){
            var ri = trips.indexOf(t2);
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid var(--p2)">'
              + '<div style="display:flex;justify-content:space-between;align-items:flex-start">'
              + '<div style="flex:1">'
              + '<div style="font-size:13px;font-weight:900;color:var(--p2)">✈️ ' + _esc(t2.name) + '</div>'
              + '<div style="font-size:11px;color:var(--text-dim);margin-top:2px">📍 ' + _esc(t2.dest) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">📅 ' + _esc(t2.from) + ' → ' + _esc(t2.to) + '</div>'
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-tripedit="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:4px 8px;font-size:11px">✏️</button>'
              + '<button data-tripdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "packliste"){
        var packing = store.get("packing", []);
        body = '<div class="card"><h3>🎒 Packliste (' + packing.filter(function(p){ return p.done; }).length + '/' + packing.length + ')</h3>'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="packNew" placeholder="Neuer Eintrag" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="packAdd">+</button>'
          + '</div>';

        if(!packing.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:14px;font-size:12px">Packliste leer</div>';
        } else {
          packing.forEach(function(p, i){
            body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;gap:8px;align-items:center">'
              + '<input type="checkbox" data-packcheck="' + i + '" ' + (p.done ? "checked" : "") + ' style="width:18px;height:18px;accent-color:var(--p1);cursor:pointer">'
              + '<div style="flex:1;font-size:12.5px;' + (p.done ? "text-decoration:line-through;color:var(--text-mute)" : "") + '">' + _esc(p.text) + '</div>'
              + '<button data-packdel="' + i + '" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
              + '</div>';
          });
          body += '<button class="btn sec full" id="packClear" style="margin-top:8px;font-size:11px">🗑️ Erledigte löschen</button>';
        }
        body += '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">✈️ REISEN</div>'
          + '<div style="font-size:20px;font-weight:900;color:var(--p2)">' + store.get("trips", []).length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">🎒 PACKLISTE</div>'
          + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + store.get("packing", []).length + '</div>'
          + '</div></div>'
          + '<button class="btn danger full" id="trClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="reisen"?" active":"") + '" data-rst="reisen">✈️ Reisen</button>'
        + '<button class="tab' + (tab==="packliste"?" active":"") + '" data-rst="packliste">🎒 Packliste</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-rst="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-rst]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.rst; store.set("tab", tab); build();
        });
      });

      if(tab === "reisen"){
        var nb = container.querySelector("#tripNew");
        if(nb) nb.addEventListener("click", function(){ build(-1); });

        if(openIdx !== undefined){
          var save = container.querySelector("#trSave");
          if(save) save.addEventListener("click", function(){
            var trips2 = store.get("trips", []);
            var obj = {
              name: container.querySelector("#trName").value.trim() || "Unbenannt",
              dest: container.querySelector("#trDest").value.trim(),
              from: container.querySelector("#trFrom").value,
              to: container.querySelector("#trTo").value,
              notes: container.querySelector("#trNotes").value.trim(),
              date: new Date().toLocaleString("de-DE")
            };
            if(openIdx === -1) trips2.push(obj);
            else trips2[openIdx] = obj;
            store.set("trips", trips2);
            if(HalDo.Notify) HalDo.Notify.success("Reise gespeichert", { app: "reisen" });
            build();
          });
          var cancel = container.querySelector("#trCancel");
          if(cancel) cancel.addEventListener("click", function(){ build(); });
        }

        container.querySelectorAll("[data-tripedit]").forEach(function(el){
          el.addEventListener("click", function(){ build(parseInt(el.dataset.tripedit)); });
        });
        container.querySelectorAll("[data-tripdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Reise löschen?")) return;
            var trips3 = store.get("trips", []);
            trips3.splice(parseInt(el.dataset.tripdel), 1);
            store.set("trips", trips3);
            build();
          });
        });
      }

      if(tab === "packliste"){
        var add = container.querySelector("#packAdd");
        if(add) add.addEventListener("click", function(){
          var inp = container.querySelector("#packNew");
          var v = inp.value.trim();
          if(!v) return;
          var packing2 = store.get("packing", []);
          packing2.push({ text: v, done: false });
          store.set("packing", packing2);
          inp.value = "";
          build();
        });
        container.querySelectorAll("[data-packcheck]").forEach(function(el){
          el.addEventListener("change", function(){
            var packing3 = store.get("packing", []);
            packing3[parseInt(el.dataset.packcheck)].done = !packing3[parseInt(el.dataset.packcheck)].done;
            store.set("packing", packing3);
            build();
          });
        });
        container.querySelectorAll("[data-packdel]").forEach(function(el){
          el.addEventListener("click", function(){
            var packing4 = store.get("packing", []);
            packing4.splice(parseInt(el.dataset.packdel), 1);
            store.set("packing", packing4);
            build();
          });
        });
        var clr2 = container.querySelector("#packClear");
        if(clr2) clr2.addEventListener("click", function(){
          store.set("packing", store.get("packing", []).filter(function(p){ return !p.done; }));
          build();
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#trClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Reisen + Packlisten löschen?")) return;
          store.set("trips", []);
          store.set("packing", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("reisen", { name: "Reisen", icon: "✈️", render: render, category: "lifestyle" });
  console.log("🦚 reisen.js geladen");
})();
