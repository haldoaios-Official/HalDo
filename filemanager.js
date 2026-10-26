/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — FILEMANAGER (v1.0)
   Virtuelle Dateien · Ordner · Text/JSON · Import/Export
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function fmtSize(n){
    if(n<1024) return n+" B";
    if(n<1048576) return (n/1024).toFixed(1)+" KB";
    return (n/1048576).toFixed(1)+" MB";
  }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", folder:null, editId:null };

    function getFiles(){ return store.get("files", []); }
    function saveFiles(f){ store.set("files", f); }
    function getFolders(){ var f = store.get("folders", null); if(!f){ f = ["Dokumente","Notizen"]; store.set("folders", f); } return f; }

    function screenList(){
      var files = getFiles();
      var folders = getFolders();
      var current = view.folder;
      var visible = files.filter(function(f){
        if(current === null) return !f.folder;
        return f.folder === current;
      });
      visible.sort(function(a,b){ return (b.updated||b.created||0) - (a.updated||a.created||0); });

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div><div style="font-size:16px;font-weight:900;color:#4dd0e1">📁 '+(current||"Dateien")+'</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+visible.length+' Dateien · '+files.length+' gesamt</div></div>'
        + '<div style="display:flex;gap:4px">'
        + (current ? '<button id="fUp" class="btn sec" style="padding:8px 12px;font-size:12px">↑</button>' : '')
        + '<button id="fNew" class="btn" style="padding:10px 14px">➕</button>'
        + '</div></div></div>';

      // Folders
      if(current === null && folders.length){
        html += '<div class="card"><h3>📂 Ordner</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
        folders.forEach(function(f){
          var count = files.filter(function(x){return x.folder===f;}).length;
          html += '<button data-folder="'+_esc(f)+'" style="padding:14px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:10px;color:inherit;font-family:inherit;cursor:pointer;text-align:left">'
            + '<div style="font-size:22px">📂</div>'
            + '<div style="font-size:12px;font-weight:900;margin-top:4px">'+_esc(f)+'</div>'
            + '<div style="font-size:9.5px;color:var(--text-mute)">'+count+' Dateien</div>'
            + '</button>';
        });
        html += '<button id="fNewFolder" style="padding:14px;background:rgba(77,208,225,.1);border:1.5px dashed rgba(77,208,225,.3);border-radius:10px;color:#4dd0e1;font-family:inherit;cursor:pointer;text-align:left">'
          + '<div style="font-size:22px">➕</div>'
          + '<div style="font-size:12px;font-weight:900;margin-top:4px">Neuer Ordner</div>'
          + '</button>';
        html += '</div></div>';
      }

      // Files
      if(!visible.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">📄</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">Keine Dateien</div></div>';
      } else {
        html += '<div class="card">';
        visible.forEach(function(f){
          var size = fmtSize((f.content||"").length);
          var icon = f.ext === "json" ? "🔧" : f.ext === "md" ? "📝" : "📄";
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;border-left:3px solid '+(f.color||"#4dd0e1")+'">'
            + '<div style="display:flex;align-items:center;gap:8px">'
            + '<div style="font-size:24px">'+icon+'</div>'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:12.5px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+_esc(f.name)+'</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">'+size+' · '+new Date(f.updated||f.created).toLocaleString("de-DE")+'</div>'
            + '</div>'
            + '<button data-open="'+f.id+'" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">👁</button>'
            + '<button data-del="'+f.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✕</button>'
            + '</div></div>';
        });
        html += '</div>';
      }

      html += '<div class="card" style="display:flex;gap:6px">'
        + '<button id="fExport" class="btn sec" style="flex:1;font-size:11px;padding:10px">📤 Export</button>'
        + '<button id="fImport" class="btn sec" style="flex:1;font-size:11px;padding:10px">📥 Import</button>'
        + '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelectorAll("[data-folder]").forEach(function(el){
        el.addEventListener("click", function(){ view.folder = el.dataset.folder; screenList(); });
      });
      var up = container.querySelector("#fUp");
      if(up) up.addEventListener("click", function(){ view.folder = null; screenList(); });
      var nf = container.querySelector("#fNewFolder");
      if(nf) nf.addEventListener("click", function(){
        var v = prompt("Ordnername:");
        if(!v) return;
        var folders = getFolders();
        if(!folders.includes(v)) folders.push(v);
        store.set("folders", folders); screenList();
      });
      container.querySelector("#fNew").addEventListener("click", function(){ screenEdit(null); });
      container.querySelectorAll("[data-open]").forEach(function(el){
        el.addEventListener("click", function(){ screenEdit(el.dataset.open, true); });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Datei löschen?")) return;
          saveFiles(getFiles().filter(function(f){return f.id!==el.dataset.del;})); screenList();
        });
      });
      container.querySelector("#fExport").addEventListener("click", function(){
        var data = JSON.stringify({ files: getFiles(), folders: getFolders() }, null, 2);
        var blob = new Blob([data], { type:"application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a"); a.href = url;
        a.download = "haldo-files-"+new Date().toISOString().split("T")[0]+".json";
        a.click(); URL.revokeObjectURL(url);
      });
      container.querySelector("#fImport").addEventListener("click", function(){
        var input = document.createElement("input"); input.type = "file"; input.accept = ".json";
        input.onchange = function(e){
          var f = e.target.files[0]; if(!f) return;
          var r = new FileReader();
          r.onload = function(ev){
            try {
              var d = JSON.parse(ev.target.result);
              if(d.files) saveFiles(d.files);
              if(d.folders) store.set("folders", d.folders);
              if(HalDo.Notify) HalDo.Notify.success("Import erfolgreich");
              screenList();
            } catch(err){ alert("Import fehlgeschlagen: "+err.message); }
          };
          r.readAsText(f);
        };
        input.click();
      });
    }

    function screenEdit(id, readonly){
      var files = getFiles();
      var file = id ? files.find(function(f){return f.id===id;}) : { name:"", content:"", folder:view.folder, ext:"txt", color:"#4dd0e1" };
      if(!file) return screenList();
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card"><h3>'+(id?"Bearbeiten":"Neue Datei")+'</h3>'
        + '<div class="field"><label>Dateiname</label><input id="fe-name" value="'+_esc(file.name)+'" placeholder="z.B. notizen.txt" maxlength="60"></div>'
        + '<div class="field"><label>Endung</label><select id="fe-ext">'
        + ["txt","json","md","csv"].map(function(x){return '<option value="'+x+'"'+(file.ext===x?" selected":"")+'>.'+x+'</option>';}).join('')
        + '</select></div>'
        + '<div class="field"><label>Inhalt</label><textarea id="fe-content" rows="14" placeholder="Inhalt..." style="resize:vertical;font-family:monospace;font-size:11.5px;line-height:1.5">'+_esc(file.content)+'</textarea></div>'
        + '<div style="display:flex;gap:6px">'
        + (readonly ? '<button class="btn sec" id="fe-edit" style="flex:1">✏️ Bearbeiten</button>' : '<button class="btn full" id="fe-save">💾 Speichern</button>')
        + '<button class="btn sec" id="fe-copy" style="flex:0 0 auto">📋</button>'
        + '</div></div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ screenList(); });
      if(readonly){
        container.querySelectorAll("#fe-name,#fe-ext,#fe-content").forEach(function(el){ el.disabled = true; });
        container.querySelector("#fe-edit").addEventListener("click", function(){ screenEdit(id, false); });
      } else {
        container.querySelector("#fe-save").addEventListener("click", function(){
          var name = container.querySelector("#fe-name").value.trim();
          if(!name){ alert("Name fehlt"); return; }
          var ext = container.querySelector("#fe-ext").value;
          var content = container.querySelector("#fe-content").value;
          var list = getFiles();
          if(id){
            var f = list.find(function(x){return x.id===id;});
            if(f){ f.name=name; f.ext=ext; f.content=content; f.updated=Date.now(); }
          } else {
            list.push({ id:"f"+Date.now(), name:name, ext:ext, content:content, folder:file.folder, color:file.color, created:Date.now() });
          }
          saveFiles(list);
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert");
          screenList();
        });
      }
      container.querySelector("#fe-copy").addEventListener("click", function(){
        var text = container.querySelector("#fe-content").value;
        navigator.clipboard.writeText(text).then(function(){
          if(HalDo.Notify) HalDo.Notify.success("Kopiert");
        }).catch(function(){});
      });
    }

    screenList();
  }

  HalDoApp("filemanager", { name: "Dateien", icon: "📁", render: render, category: "produktivitaet" });
  console.log("🦚 filemanager.js v1.0 geladen");
})();
