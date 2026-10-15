/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — LINKS (v152)
   Bookmarks · Kategorien · Favoriten · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function getDomain(url){
    try { return new URL(url).hostname.replace("www.", ""); }
    catch(e){ return url; }
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "alle");

    function build(editIdx){
      var body = "";

      if(tab === "alle" || tab === "favoriten"){
        var links = store.get("links", []);
        var query = store.get("query", "");

        var list = links.filter(function(l){
          if(tab === "favoriten" && !l.fav) return false;
          if(!query) return true;
          var q = query.toLowerCase();
          return (l.title || "").toLowerCase().indexOf(q) !== -1
            || (l.url || "").toLowerCase().indexOf(q) !== -1
            || (l.tags || []).join(" ").toLowerCase().indexOf(q) !== -1;
        });

        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="lSearch" placeholder="🔍 Suchen..." value="' + _esc(query) + '" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="lNew" style="padding:0 16px">+</button>'
          + '</div>';

        if(editIdx !== undefined){
          var l = links[editIdx] || { title: "", url: "", tags: [], desc: "" };
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="lTitle" placeholder="Titel*" value="' + _esc(l.title) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:14px;font-weight:900;margin-bottom:6px">'
            + '<input type="url" id="lUrl" placeholder="https://..." value="' + _esc(l.url) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="lTags" placeholder="Tags (Komma-getrennt)" value="' + _esc((l.tags || []).join(", ")) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="lDesc" placeholder="Beschreibung" value="' + _esc(l.desc) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px">'
            + '<div style="display:flex;gap:6px;margin-top:8px">'
            + '<button class="btn" id="lSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="lCancel">✕</button>'
            + '</div></div>';
        }

        if(!list.length && editIdx === undefined){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">' + (links.length ? "Keine Treffer" : "Noch keine Links") + '</div>';
        } else {
          list.slice().reverse().forEach(function(l){
            var ri = links.indexOf(l);
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;gap:10px;align-items:center;border-left:3px solid ' + (l.fav ? "#fbbf24" : "var(--p1)") + '">'
              + '<div style="font-size:20px;flex-shrink:0">🔗</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:12.5px;font-weight:900;color:var(--p1);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(l.title) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(getDomain(l.url)) + '</div>'
              + (l.desc ? '<div style="font-size:10.5px;color:var(--text-dim);margin-top:2px">' + _esc(l.desc) + '</div>' : '')
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<a href="' + _esc(l.url) + '" target="_blank" rel="noopener" style="background:linear-gradient(135deg,var(--p1),var(--p3));border:none;border-radius:6px;color:#000;cursor:pointer;padding:4px 8px;font-size:11px;text-decoration:none;font-weight:900">→</a>'
              + '<button data-lfav="' + ri + '" style="background:transparent;border:none;cursor:pointer;font-size:13px">' + (l.fav ? "⭐" : "☆") + '</button>'
              + '<button data-ldel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "settings"){
        var links2 = store.get("links", []);
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🔗 LINKS</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + links2.length + '</div>'
          + '</div>'
          + '<button class="btn full" id="lExport" style="margin-top:10px">📤 Als JSON exportieren</button>'
          + '<button class="btn danger full" id="lClear" style="margin-top:8px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="alle"?" active":"") + '" data-lt="alle">🔗 Alle</button>'
        + '<button class="tab' + (tab==="favoriten"?" active":"") + '" data-lt="favoriten">⭐ Favoriten</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-lt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-lt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.lt; store.set("tab", tab); build();
        });
      });

      if(tab === "alle" || tab === "favoriten"){
        var sInp = container.querySelector("#lSearch");
        if(sInp) sInp.addEventListener("input", function(){
          store.set("query", this.value);
          var t = tab; build(editIdx); tab = t;
        });
        var nb = container.querySelector("#lNew");
        if(nb) nb.addEventListener("click", function(){ build(-1); });

        if(editIdx !== undefined){
          var save = container.querySelector("#lSave");
          if(save) save.addEventListener("click", function(){
            var links3 = store.get("links", []);
            var title = container.querySelector("#lTitle").value.trim();
            var url = container.querySelector("#lUrl").value.trim();
            if(!title || !url){ alert("Titel und URL sind Pflicht"); return; }
            if(!/^https?:\/\//.test(url)) url = "https://" + url;
            var obj = {
              title: title, url: url,
              tags: container.querySelector("#lTags").value.split(",").map(function(t){ return t.trim(); }).filter(Boolean),
              desc: container.querySelector("#lDesc").value.trim(),
              fav: editIdx >= 0 ? (links3[editIdx].fav || false) : false,
              date: new Date().toLocaleString("de-DE")
            };
            if(editIdx === -1) links3.push(obj);
            else links3[editIdx] = obj;
            store.set("links", links3);
            if(HalDo.Notify) HalDo.Notify.success("Link gespeichert", { app: "links" });
            build();
          });
          var cancel = container.querySelector("#lCancel");
          if(cancel) cancel.addEventListener("click", function(){ build(); });
        }

        container.querySelectorAll("[data-lfav]").forEach(function(el){
          el.addEventListener("click", function(){
            var links4 = store.get("links", []);
            links4[parseInt(el.dataset.lfav)].fav = !links4[parseInt(el.dataset.lfav)].fav;
            store.set("links", links4);
            build();
          });
        });
        container.querySelectorAll("[data-ldel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Link löschen?")) return;
            var links5 = store.get("links", []);
            links5.splice(parseInt(el.dataset.ldel), 1);
            store.set("links", links5);
            build();
          });
        });
      }

      if(tab === "settings"){
        var exp = container.querySelector("#lExport");
        if(exp) exp.addEventListener("click", function(){
          var data = store.get("links", []);
          var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
          var a = document.createElement("a");
          a.href = URL.createObjectURL(blob);
          a.download = "haldo-links-" + new Date().toISOString().split("T")[0] + ".json";
          a.click();
        });
        var clr = container.querySelector("#lClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Links löschen?")) return;
          store.set("links", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("links", { name: "Links", icon: "🔗", render: render, category: "produktivitaet" });
  console.log("🦚 links.js geladen");
})();
