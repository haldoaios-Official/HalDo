/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — LESELISTE (v1.0)
   Bücher · Fortschritt · Bewertung · Notizen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var STATUS = [
    { id:"want", name:"Will lesen", icon:"📚", color:"#4da8ff" },
    { id:"reading", name:"Lese ich", icon:"📖", color:"#ffd54f" },
    { id:"read", name:"Gelesen", icon:"✅", color:"#4ade80" }
  ];

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"list", filter:"all" };

    function getBooks(){ return store.get("books", []); }
    function saveBooks(b){ store.set("books", b); }

    function build(){
      if(view.screen === "edit") screenEdit();
      else screenList();
    }

    function screenList(){
      var books = getBooks();
      var filtered = view.filter === "all" ? books : books.filter(function(b){ return b.status === view.filter; });
      filtered.sort(function(a,b){ return (b.updated||b.created||0) - (a.updated||a.created||0); });

      var stats = {
        total: books.length,
        reading: books.filter(function(b){ return b.status === "reading"; }).length,
        read: books.filter(function(b){ return b.status === "read"; }).length,
        pagesRead: books.reduce(function(s,b){ return s + (b.status === "read" ? (b.pages||0) : (b.currentPage||0)); }, 0)
      };

      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(255,213,79,.1));border:1px solid rgba(77,208,225,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div><div style="font-size:16px;font-weight:900;color:#4dd0e1">📚 Leseliste</div>'
        + '<div style="font-size:10px;color:var(--text-mute)">'+stats.total+' Bücher · '+stats.pagesRead+' Seiten gelesen</div></div>'
        + '<button class="btn" id="lbAdd" style="padding:10px 14px">➕</button>'
        + '</div></div>';

      html += '<div class="card" style="padding:8px"><div style="display:flex;gap:4px;overflow-x:auto;scrollbar-width:none">';
      var filters = [{id:"all",name:"Alle",icon:"📚"}].concat(STATUS);
      filters.forEach(function(f){
        var active = view.filter === f.id;
        var count = f.id === "all" ? books.length : books.filter(function(b){ return b.status === f.id; }).length;
        html += '<button data-filter="'+f.id+'" style="padding:6px 10px;background:'+(active?'rgba(77,208,225,.25)':'rgba(0,0,0,.2)')+';border:1px solid '+(active?'#4dd0e1':'var(--border-soft)')+';border-radius:8px;color:'+(active?'#4dd0e1':'var(--text-mute)')+';font-size:10.5px;font-weight:800;cursor:pointer;white-space:nowrap;font-family:inherit">'+f.icon+' '+f.name+' ('+count+')</button>';
      });
      html += '</div></div>';

      if(!filtered.length){
        html += '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">📚</div><div style="font-size:12px;color:var(--text-mute);margin-top:10px">'+(books.length?'Keine Bücher in dieser Kategorie':'Noch keine Bücher')+'</div></div>';
      } else {
        html += '<div class="card">';
        filtered.forEach(function(b){
          var st = STATUS.find(function(s){ return s.id === b.status; }) || STATUS[0];
          var progress = 0;
          if(b.pages && b.currentPage !== undefined){
            progress = b.status === "read" ? 100 : Math.round(b.currentPage / b.pages * 100);
          }
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;border-left:3px solid '+st.color+'">'
            + '<div style="display:flex;align-items:flex-start;gap:10px">'
            + '<div style="font-size:26px">'+st.icon+'</div>'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:12.5px;font-weight:900">'+_esc(b.title)+'</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute)">'+_esc(b.author||"—")+'</div>'
            + (b.pages ? '<div style="margin-top:6px"><div style="height:4px;background:rgba(0,0,0,.3);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+progress+'%;background:'+st.color+';border-radius:2px"></div></div><div style="font-size:9px;color:var(--text-mute);margin-top:2px">'+(b.status === "read" ? "Fertig" : (b.currentPage||0)+"/"+b.pages+" S. · "+progress+"%")+'</div></div>' : '')
            + (b.rating ? '<div style="font-size:11px;color:#ffd54f;margin-top:4px">'+"⭐".repeat(b.rating)+'</div>' : '')
            + '</div>'
            + '<div style="display:flex;flex-direction:column;gap:3px">'
            + '<button data-edit="'+b.id+'" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✏️</button>'
            + '<button data-del="'+b.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">✕</button>'
            + '</div></div></div>';
        });
        html += '</div>';
      }

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#lbAdd").addEventListener("click", function(){ view.screen = "edit"; view.editId = null; build(); });
      container.querySelectorAll("[data-filter]").forEach(function(el){
        el.addEventListener("click", function(){ view.filter = el.dataset.filter; screenList(); });
      });
      container.querySelectorAll("[data-edit]").forEach(function(el){
        el.addEventListener("click", function(){ view.screen = "edit"; view.editId = el.dataset.edit; build(); });
      });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Buch löschen?")) return;
          saveBooks(getBooks().filter(function(b){ return b.id !== el.dataset.del; })); screenList();
        });
      });
    }

    function screenEdit(){
      var isEdit = !!view.editId;
      var books = getBooks();
      var book = isEdit ? books.find(function(b){ return b.id === view.editId; }) : { title:"", author:"", pages:0, currentPage:0, status:"want", rating:0, notes:"" };
      if(!book) return screenList();
      var status = book.status || "want";

      function renderForm(){
        var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
          + '<div class="card"><h3>'+(isEdit?"Buch bearbeiten":"Neues Buch")+'</h3>'
          + '<div class="field"><label>Titel</label><input id="bk-title" value="'+_esc(book.title)+'" placeholder="Buchtitel" maxlength="120"></div>'
          + '<div class="field"><label>Autor</label><input id="bk-author" value="'+_esc(book.author||"")+'" placeholder="Autor" maxlength="80"></div>'
          + '<div class="field"><label>Status</label><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px">'
          + STATUS.map(function(s){
              var active = status === s.id;
              return '<button data-status="'+s.id+'" style="padding:10px 4px;background:'+(active?s.color+'25':'rgba(0,0,0,.2)')+';border:1.5px solid '+(active?s.color:'var(--border-soft)')+';border-radius:8px;color:'+(active?s.color:'var(--text-dim)')+';cursor:pointer;font-family:inherit;text-align:center;font-size:10.5px;font-weight:800"><div style="font-size:18px">'+s.icon+'</div>'+s.name+'</button>';
            }).join('')
          + '</div></div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">'
          + '<div class="field"><label>Seiten gesamt</label><input id="bk-pages" type="number" value="'+(book.pages||"")+'" min="0" placeholder="z.B. 320"></div>'
          + '<div class="field"><label>Aktuelle Seite</label><input id="bk-current" type="number" value="'+(book.currentPage||"")+'" min="0" placeholder="0"></div>'
          + '</div>'
          + '<div class="field"><label>Bewertung</label><div style="display:flex;gap:4px;margin-top:6px">'
          + [1,2,3,4,5].map(function(n){
              return '<button data-rate="'+n+'" style="flex:1;padding:10px;background:rgba(0,0,0,.2);border:1.5px solid '+((book.rating||0)>=n?'#ffd54f':'var(--border-soft)')+';border-radius:8px;cursor:pointer;color:'+((book.rating||0)>=n?'#ffd54f':'var(--text-mute)')+';font-size:20px">⭐</button>';
            }).join('')
          + '</div></div>'
          + '<div class="field"><label>Notizen</label><textarea id="bk-notes" rows="3" style="resize:vertical">'+_esc(book.notes||"")+'</textarea></div>'
          + '<button class="btn full" id="bk-save">💾 Speichern</button></div>';
        container.innerHTML = html;
        bindForm();
      }

      function bindForm(){
        container.querySelector("[data-back]").addEventListener("click", function(){ view.screen = "list"; build(); });
        container.querySelectorAll("[data-status]").forEach(function(el){
          el.addEventListener("click", function(){ status = el.dataset.status; book.status = status; renderForm(); });
        });
        container.querySelectorAll("[data-rate]").forEach(function(el){
          el.addEventListener("click", function(){ book.rating = parseInt(el.dataset.rate); renderForm(); });
        });
        container.querySelector("#bk-save").addEventListener("click", function(){
          var title = container.querySelector("#bk-title").value.trim();
          if(!title){ alert("Titel fehlt"); return; }
          var data = {
            title: title,
            author: container.querySelector("#bk-author").value.trim(),
            pages: parseInt(container.querySelector("#bk-pages").value) || 0,
            currentPage: parseInt(container.querySelector("#bk-current").value) || 0,
            status: status,
            rating: book.rating || 0,
            notes: container.querySelector("#bk-notes").value.trim()
          };
          var list = getBooks();
          if(isEdit){
            var ex = list.find(function(b){ return b.id === view.editId; });
            if(ex){ Object.keys(data).forEach(function(k){ ex[k] = data[k]; }); ex.updated = Date.now(); }
          } else {
            list.push({ id:"bk"+Date.now(), created:Date.now(), updated:Date.now(), title:data.title, author:data.author, pages:data.pages, currentPage:data.currentPage, status:data.status, rating:data.rating, notes:data.notes });
          }
          saveBooks(list);
          if(HalDo.Notify) HalDo.Notify.success("Gespeichert");
          view.screen = "list"; build();
        });
      }
      renderForm();
    }

    build();
  }

  HalDoApp("leseliste", { name: "Leseliste", icon: "📚", render: render, category: "werkzeuge" });
  console.log("🦚 leseliste.js v1.0 geladen");
})();
