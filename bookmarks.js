/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BOOKMARKS (v1.0)
   Lesezeichen · Kategorien · Suche · Import/Export
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function host(url){ try { return new URL(url).hostname; } catch(e){ return url.substring(0,30); } }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", query:"", cat:"all" };

    function getItems(){ return store.get("items", []); }
    function saveItems(i){ store.set("items", i); }
    function getCats(){ return store.get("cats", ["Allgemein"]); }

    function build(){
      if(view.screen === "add" || view.screen === "edit") screenForm();
      else screenList();
    }

    function screenList(){
      var items = getItems();
      var cats = getCats();
      var filtered = items.filter(function(it){
        if(view.cat !== "all" && it.cat !== view.cat) return false;
        if(!view.query) return true;
        var q = view.query.toLowerCase();
        return (it.title||"").toLowerCase().indexOf(q) >= 0 || (it.url||"").toLowerCase().indexOf(q) >= 0;
      });
      filtered.sort(function(a,b){ return (b.created||0) - (a.created||0); });

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">'
        + '<div><div style="font-size:16px;font-weight:900;color:#4dd0e1">📖 Lesezeichen</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+items.length+' gesamt</div></div>'
        + '<button class="btn" id="bmAdd" style="padding:10px 14px">➕</button>'
        + '</div>'
        + '<input id="bmSearch" placeholder="🔍 Suchen..." value="'+_esc(view.query)+'" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-family:inherit;font-size:12px">'
        + '</div>';

      // Categories
      html += '<div class="card" style="padding:8px"><div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none">';
      html += '<button data-cat="all" style="padding:6px 10px;background:'+(view.cat==="all"?'rgba(77,208,225,.25)':'rgba(0,0,0,.2)')+';border:1px solid '+(view.cat==="all"?'#4dd0e1':'var(--border-soft)')+';border-radius:8px;color:'+(view.cat==="all"?'#4dd0e1':'var(--text-mute)')+';font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;font-family:inherit">Alle</button>';
      cats.forEach(function(c){
        var active = view.cat === c;
        html += '<button data-cat="'+_esc(c)+'" style="padding:6px 10px;background:'+(active?'rgba(77,208,225,.25)':'rgba(0,0,0,.2)')+';border:1px solid '+(active?'#4dd0e1':'var(--border-soft)')+';border-radius:8px;color:'+(active?'#4dd0e1':'var(--text-mute)')+';font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;font-family:inherit">'+_esc(c)+'</button>';
      });
      html += '</div></div>';

      if(!filtered.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">📖</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">'+(items.length?'Nichts gefunden':'Noch keine Lesezeichen')+'</div></div>';
      } else {
        html += '<div class="card">';
        filtered.forEach(function(it){
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;border-left:3px solid #4da8ff">'
            + '<div style="display:flex;align-items:flex-start;gap:8px">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:12.5px;font-weight:900">'+_esc(it.title)+'</div>'
            + '<div style="font-size:10.5px;color:#4da8ff;margin-top:2px;word-break:break-all">'+_esc(host(it.url))+'</div>'
            + (it.cat ? '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">'+_esc(it.cat)+'</div>' : '')
            + '</div>'
            + '<div style="display:flex;flex-direction:column;gap:3px">'
            + '<a href="'+_esc(it.url)+'" target="_blank" rel="noopener" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer;text-decoration:none;text-align:center">↗</a>'
            + '<button data-edit="'+it.id+'" style="background:rgba(255,213,79,.15);border:1px solid rgba(255,213,79,.3);color:#ffd54f;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✏️</button>'
            + '<button data-del="'+it.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✕</button>'
            + '</div></div></div>';
        });
        html += '</div>';
      }

      html += '<div class="card" style="display:flex;gap:6px">'
        + '<button id="bmExport" class="btn sec" style="flex:1;font-size:11px;padding:10px">📤 Export</button>'
        + '<button id="bmImport" class="btn sec" style="flex:1;font-size:11px;padding:10px">📥 Import</button>'
        + '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      var s = container.querySelector("#bmSearch");
      s.addEventListener("input", function(){ view.query = s.value; screenList(); setTimeout(function(){ var n = container.querySelector("#bmSearch"); if(n){ n.focus(); n.setSelectionRange(n.value.length,n.value.length); } }, 0); });
      container.querySelector("#bmAdd").addEventListener("click", function(){ view.screen="add"; view.editId=null; build(); });
      container.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click", function(){ view.cat = el.dataset.cat; screenList(); });
      });
      container.querySelectorAll("[data-edit]").forEach(function(el){
        el.addEventListener("click", function(){ view.screen="edit"; view.editId=el.dataset.edit; build(); });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Lesezeichen löschen?")) return;
          saveItems(getItems().filter(function(i){ return i.id !== el.dataset.del; })); screenList();
        });
      });
      container.querySelector("#bmExport").addEventListener("click", function(){
        var data = JSON.stringify({ items: getItems(), cats: getCats() }, null, 2);
        var blob = new Blob([data], { type:"application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = "haldo-bookmarks-"+new Date().toISOString().split("T")[0]+".json"; a.click();
        URL.revokeObjectURL(url);
      });
      container.querySelector("#bmImport").addEventListener("click", function(){
        var input = document.createElement("input"); input.type = "file"; input.accept = ".json";
        input.onchange = function(e){
          var f = e.target.files[0]; if(!f) return;
          var r = new FileReader();
          r.onload = function(ev){
            try {
              var d = JSON.parse(ev.target.result);
              if(d.items && Array.isArray(d.items)){
                var existing = getItems();
                d.items.forEach(function(it){
                  if(!existing.find(function(x){ return x.url === it.url; })){
                    if(!it.id) it.id = "bm" + Date.now() + Math.random();
                    existing.push(it);
                  }
                });
                saveItems(existing);
              }
              if(d.cats) store.set("cats", d.cats);
              if(HalDo.Notify) HalDo.Notify.success("Import erfolgreich");
              screenList();
            } catch(err){ alert("Import fehlgeschlagen: "+err.message); }
          };
          r.readAsText(f);
        };
        input.click();
      });
    }

    function screenForm(){
      var isEdit = view.screen === "edit";
      var items = getItems();
      var item = isEdit ? items.find(function(i){ return i.id === view.editId; }) : { title:"", url:"", cat:"Allgemein" };
      if(!item) return screenList();
      var cats = getCats();

      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card"><h3>'+(isEdit?"Bearbeiten":"Neues Lesezeichen")+'</h3>'
        + '<div class="field"><label>Titel</label><input id="bm-title" value="'+_esc(item.title)+'" placeholder="z.B. GitHub" maxlength="80"></div>'
        + '<div class="field"><label>URL</label><input id="bm-url" value="'+_esc(item.url)+'" placeholder="https://..." type="url"></div>'
        + '<div class="field"><label>Kategorie</label>'
        + '<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px">'
        + cats.map(function(c){
            return '<button data-pickcat="'+_esc(c)+'" style="padding:6px 10px;background:'+(item.cat===c?'rgba(77,208,225,.2)':'rgba(0,0,0,.2)')+';border:1px solid '+(item.cat===c?'#4dd0e1':'var(--border-soft)')+';border-radius:8px;color:'+(item.cat===c?'#4dd0e1':'var(--text-mute)')+';font-size:11px;font-weight:800;cursor:pointer;font-family:inherit">'+_esc(c)+'</button>';
          }).join('')
        + '</div>'
        + '<div style="display:flex;gap:6px"><input id="bm-newcat" placeholder="Neue Kategorie..." style="flex:1;padding:8px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:6px;color:inherit;font-family:inherit;font-size:11px"><button id="bm-addcat" style="padding:8px 12px;background:rgba(77,208,225,.2);border:1px solid rgba(77,208,225,.4);color:#4dd0e1;border-radius:6px;cursor:pointer;font-size:11px;font-weight:800;font-family:inherit">+</button></div>'
        + '</div>'
        + '<button class="btn full" id="bm-save">💾 Speichern</button></div>';

      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen = "list"; build(); });
      container.querySelectorAll("[data-pickcat]").forEach(function(el){
        el.addEventListener("click", function(){ item.cat = el.dataset.pickcat; screenForm(); });
      });
      container.querySelector("#bm-addcat").addEventListener("click", function(){
        var v = container.querySelector("#bm-newcat").value.trim();
        if(!v) return;
        if(!cats.includes(v)){ cats.push(v); store.set("cats", cats); }
        item.cat = v; screenForm();
      });
      container.querySelector("#bm-save").addEventListener("click", function(){
        var title = container.querySelector("#bm-title").value.trim();
        var url = container.querySelector("#bm-url").value.trim();
        if(!title || !url){ alert("Titel und URL ausfüllen"); return; }
        if(!/^https?:\/\//i.test(url)) url = "https://" + url;
        var list = getItems();
        if(isEdit){
          var ex = list.find(function(i){ return i.id === view.editId; });
          if(ex){ ex.title = title; ex.url = url; ex.cat = item.cat; }
        } else {
          list.push({ id:"bm"+Date.now(), title:title, url:url, cat:item.cat, created:Date.now() });
        }
        saveItems(list);
        if(HalDo.Notify) HalDo.Notify.success("Gespeichert");
        view.screen = "list"; build();
      });
    }

    build();
  }

  HalDoApp("bookmarks", { name: "Lesezeichen", icon: "📖", render: render, category: "werkzeuge" });
  console.log("🦚 bookmarks.js v1.0 geladen");
})();
