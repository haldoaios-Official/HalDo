/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — KONTAKTE (v152)
   Liste · Detail · Kategorien · Favoriten · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "liste");

    function build(editIdx){
      var body = "";

      /* ═══ LISTE ═══ */
      if(tab === "liste" || tab === "favoriten"){
        var contacts = store.get("items", []);
        var query = store.get("query", "");

        var list = contacts.filter(function(c){
          if(tab === "favoriten" && !c.fav) return false;
          if(!query) return true;
          var q = query.toLowerCase();
          return (c.name || "").toLowerCase().indexOf(q) !== -1
            || (c.phone || "").toLowerCase().indexOf(q) !== -1
            || (c.email || "").toLowerCase().indexOf(q) !== -1
            || (c.tags || []).join(" ").toLowerCase().indexOf(q) !== -1;
        });

        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="cSearch" placeholder="🔍 Suchen..." value="' + _esc(query) + '" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="cNew" style="padding:0 16px">+ Neu</button>'
          + '</div>';

        if(editIdx !== undefined){
          var c = contacts[editIdx] || { name: "", phone: "", email: "", address: "", notes: "", tags: [] };
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="cName" placeholder="Name*" value="' + _esc(c.name) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:14px;font-weight:900;margin-bottom:6px">'
            + '<input type="tel" id="cPhone" placeholder="Telefon" value="' + _esc(c.phone) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="email" id="cEmail" placeholder="E-Mail" value="' + _esc(c.email) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="cAddress" placeholder="Adresse" value="' + _esc(c.address) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="cTags" placeholder="Tags (Komma-getrennt)" value="' + _esc((c.tags || []).join(", ")) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<textarea id="cNotes" placeholder="Notizen..." rows="2" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;font-family:inherit;resize:vertical">' + _esc(c.notes) + '</textarea>'
            + '<div style="display:flex;gap:6px;margin-top:8px">'
            + '<button class="btn" id="cSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="cCancel">Abbrechen</button>'
            + '</div></div>';
        }

        if(!list.length && editIdx === undefined){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">' + (contacts.length ? "Keine Treffer" : "Noch keine Kontakte") + '</div>';
        } else {
          var sorted = list.slice().sort(function(a, b){ return (a.name || "").localeCompare(b.name || "", "de"); });
          sorted.forEach(function(c){
            var ri = contacts.indexOf(c);
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;gap:10px;align-items:center;border-left:3px solid ' + (c.fav ? "#fbbf24" : "var(--p1)") + '">'
              + '<div style="width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--p1),var(--p3));display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:900;color:#000;flex-shrink:0">'
              + _esc((c.name || "?").charAt(0).toUpperCase())
              + '</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:13px;font-weight:900;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(c.name) + '</div>'
              + (c.phone ? '<div style="font-size:11px;color:var(--text-dim)">📞 ' + _esc(c.phone) + '</div>' : '')
              + (c.email ? '<div style="font-size:10.5px;color:var(--text-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">📧 ' + _esc(c.email) + '</div>' : '')
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-cfav="' + ri + '" style="background:transparent;border:none;cursor:pointer;font-size:14px">' + (c.fav ? "⭐" : "☆") + '</button>'
              + '<button data-cedit="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:4px 8px;font-size:11px">✏️</button>'
              + '<button data-cdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      /* ═══ SETTINGS ═══ */
      else if(tab === "settings"){
        var contacts2 = store.get("items", []);
        var sortBy = store.get("sortBy", "name");
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div class="field"><label>Sortieren nach</label>'
          + '<select id="cSort" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<option value="name"' + (sortBy==="name"?" selected":"") + '>Name</option>'
          + '<option value="recent"' + (sortBy==="recent"?" selected":"") + '>Zuletzt hinzugefügt</option>'
          + '</select></div>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-top:8px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">👥 GESAMT</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + contacts2.length + '</div>'
          + '</div>'
          + '<button class="btn full" id="cExport" style="margin-top:10px">📤 Als JSON exportieren</button>'
          + '<button class="btn danger full" id="cClear" style="margin-top:8px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="liste"?" active":"") + '" data-ct="liste">👥 Alle</button>'
        + '<button class="tab' + (tab==="favoriten"?" active":"") + '" data-ct="favoriten">⭐ Favoriten</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-ct="settings">⚙️</button>'
        + '</div>' + body;

      /* Events */
      container.querySelectorAll("[data-ct]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.ct; store.set("tab", tab); build();
        });
      });

      if(tab === "liste" || tab === "favoriten"){
        var sInp = container.querySelector("#cSearch");
        if(sInp) sInp.addEventListener("input", function(){
          store.set("query", this.value);
          var t = tab; build(editIdx); tab = t;
        });

        var nb = container.querySelector("#cNew");
        if(nb) nb.addEventListener("click", function(){ build(-1); });

        if(editIdx !== undefined){
          var save = container.querySelector("#cSave");
          if(save) save.addEventListener("click", function(){
            var name = container.querySelector("#cName").value.trim();
            if(!name){ alert("Name ist Pflicht"); return; }
            var contacts3 = store.get("items", []);
            var obj = {
              name: name,
              phone: container.querySelector("#cPhone").value.trim(),
              email: container.querySelector("#cEmail").value.trim(),
              address: container.querySelector("#cAddress").value.trim(),
              tags: container.querySelector("#cTags").value.split(",").map(function(t){ return t.trim(); }).filter(Boolean),
              notes: container.querySelector("#cNotes").value.trim(),
              fav: editIdx >= 0 ? (contacts3[editIdx].fav || false) : false,
              date: new Date().toLocaleString("de-DE")
            };
            if(editIdx === -1) contacts3.push(obj);
            else contacts3[editIdx] = obj;
            store.set("items", contacts3);
            if(HalDo.Notify) HalDo.Notify.success("Kontakt gespeichert", { app: "kontakte" });
            build();
          });
          var cancel = container.querySelector("#cCancel");
          if(cancel) cancel.addEventListener("click", function(){ build(); });
        }

        container.querySelectorAll("[data-cedit]").forEach(function(el){
          el.addEventListener("click", function(){ build(parseInt(el.dataset.cedit)); });
        });
        container.querySelectorAll("[data-cdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Kontakt löschen?")) return;
            var contacts4 = store.get("items", []);
            contacts4.splice(parseInt(el.dataset.cdel), 1);
            store.set("items", contacts4);
            build();
          });
        });
        container.querySelectorAll("[data-cfav]").forEach(function(el){
          el.addEventListener("click", function(){
            var contacts5 = store.get("items", []);
            var c2 = contacts5[parseInt(el.dataset.cfav)];
            c2.fav = !c2.fav;
            store.set("items", contacts5);
            build();
          });
        });
      }

      if(tab === "settings"){
        var sortSel = container.querySelector("#cSort");
        if(sortSel) sortSel.addEventListener("change", function(){
          store.set("sortBy", this.value);
        });
        var exp = container.querySelector("#cExport");
        if(exp) exp.addEventListener("click", function(){
          var data = store.get("items", []);
          var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "haldo-kontakte-" + new Date().toISOString().split("T")[0] + ".json";
          a.click();
        });
        var clr = container.querySelector("#cClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Kontakte löschen?")) return;
          store.set("items", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("kontakte", { name: "Kontakte", icon: "👥", render: render, category: "kommunikation" });
  console.log("🦚 kontakte.js geladen");
})();
