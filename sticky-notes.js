/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — STICKY NOTES (v1.0)
   Farbige Klebezettel · Pin · Grid
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var COLORS = ["#ffd54f","#4dd0e1","#ff8080","#4ade80","#b478ff","#ff9800"];

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list" };

    function getNotes(){ return store.get("notes", []); }
    function saveNotes(n){ store.set("notes", n); }

    function build(){
      if(view.screen === "edit") screenEdit();
      else screenList();
    }

    function screenList(){
      var notes = getNotes();
      notes.sort(function(a,b){
        if(a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (b.updated||b.created||0) - (a.updated||a.created||0);
      });

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(255,213,79,.15),rgba(77,208,225,.1));border:1px solid rgba(255,213,79,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div><div style="font-size:16px;font-weight:900;color:#ffd54f">📝 Notizen</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+notes.length+' Zettel · '+notes.filter(function(n){return n.pinned;}).length+' angepinnt</div></div>'
        + '<button class="btn" id="snAdd" style="padding:10px 14px">➕</button>'
        + '</div></div>';

      if(!notes.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">📝</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">Noch keine Notizen<br><span style="font-size:10.5px;opacity:.7">Tippe auf ➕</span></div></div>';
      } else {
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
        notes.forEach(function(n){
          html += '<div style="position:relative;padding:10px;background:'+n.color+'15;border:1px solid '+n.color+'44;border-left:3px solid '+n.color+';border-radius:10px;min-height:120px;display:flex;flex-direction:column">'
            + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:4px">'
            + (n.pinned ? '<div style="font-size:10px;color:'+n.color+'">📌</div>' : '<div></div>')
            + '<div style="display:flex;gap:2px">'
            + '<button data-pin="'+n.id+'" style="background:transparent;border:none;color:'+n.color+';padding:2px 4px;font-size:10px;cursor:pointer">'+(n.pinned?'📌':'📍')+'</button>'
            + '<button data-edit="'+n.id+'" style="background:transparent;border:none;color:'+n.color+';padding:2px 4px;font-size:10px;cursor:pointer">✏️</button>'
            + '<button data-del="'+n.id+'" style="background:transparent;border:none;color:#ff8080;padding:2px 4px;font-size:10px;cursor:pointer">✕</button>'
            + '</div></div>'
            + '<div style="font-size:11px;font-weight:900;color:'+n.color+';margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+_esc(n.title||"Ohne Titel")+'</div>'
            + '<div style="font-size:10.5px;color:var(--text-dim);flex:1;overflow:hidden;display:-webkit-box;-webkit-line-clamp:5;-webkit-box-orient:vertical;white-space:pre-wrap;word-wrap:break-word;line-height:1.4">'+_esc(n.content||"")+'</div>'
            + '<div style="font-size:8.5px;color:var(--text-mute);margin-top:6px">'+new Date(n.updated||n.created).toLocaleDateString("de-DE")+'</div>'
            + '</div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#snAdd").addEventListener("click", function(){ view.screen="edit"; view.editId=null; build(); });
      container.querySelectorAll("[data-pin]").forEach(function(el){
        el.addEventListener("click", function(){
          var notes = getNotes(); var n = notes.find(function(x){ return x.id === el.dataset.pin; });
          if(n){ n.pinned = !n.pinned; saveNotes(notes); screenList(); }
        });
      });
      container.querySelectorAll("[data-edit]").forEach(function(el){
        el.addEventListener("click", function(){ view.screen="edit"; view.editId=el.dataset.edit; build(); });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Notiz löschen?")) return;
          saveNotes(getNotes().filter(function(n){ return n.id !== el.dataset.del; })); screenList();
        });
      });
    }

    function screenEdit(){
      var isEdit = !!view.editId;
      var notes = getNotes();
      var note = isEdit ? notes.find(function(n){ return n.id === view.editId; }) : { title:"", content:"", color:COLORS[0], pinned:false };
      if(!note) return screenList();
      var color = note.color || COLORS[0];

      function renderForm(){
        var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
          + '<div class="card" style="background:'+color+'15;border-color:'+color+'66"><h3 style="color:'+color+'">'+(isEdit?"Bearbeiten":"Neue Notiz")+'</h3>'
          + '<div class="field"><label>Titel</label><input id="sn-title" value="'+_esc(note.title)+'" placeholder="Titel..." maxlength="60" style="font-size:14px;font-weight:800"></div>'
          + '<div class="field"><label>Inhalt</label><textarea id="sn-content" rows="8" placeholder="Schreib etwas..." style="resize:vertical;font-size:13px">'+_esc(note.content)+'</textarea></div>'
          + '<div class="field"><label>Farbe</label><div style="display:flex;gap:6px;margin-top:6px">'
          + COLORS.map(function(c){
              return '<button data-color="'+c+'" style="flex:1;height:32px;background:'+c+';border:2.5px solid '+(color===c?'#fff':'transparent')+';border-radius:8px;cursor:pointer"></button>';
            }).join('')
          + '</div></div>'
          + '<button class="btn full" id="sn-save" style="background:linear-gradient(135deg,'+color+',#b478ff);color:#000">💾 Speichern</button></div>';
        container.innerHTML = html;
        container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="list"; build(); });
        container.querySelectorAll("[data-color]").forEach(function(el){
          el.addEventListener("click", function(){ color = el.dataset.color; note.color = color; renderForm(); });
        });
        container.querySelector("#sn-save").addEventListener("click", function(){
          var title = container.querySelector("#sn-title").value.trim();
          var content = container.querySelector("#sn-content").value.trim();
          if(!title && !content){ alert("Inhalt oder Titel eingeben"); return; }
          var list = getNotes();
          if(isEdit){
            var ex = list.find(function(n){ return n.id === view.editId; });
            if(ex){ ex.title = title; ex.content = content; ex.color = color; ex.updated = Date.now(); }
          } else {
            list.push({ id:"sn"+Date.now(), title:title, content:content, color:color, pinned:false, created:Date.now(), updated:Date.now() });
          }
          saveNotes(list);
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert");
          view.screen="list"; build();
        });
      }
      renderForm();
    }

    build();
  }

  HalDoApp("sticky-notes", { name: "Notizen", icon: "📝", render: render, category: "produktivitaet" });
  console.log("🦚 sticky-notes.js v1.0 geladen");
})();
