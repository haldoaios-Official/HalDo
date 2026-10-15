/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — WÖRTERBUCH (v152)
   Suchen · Favoriten · Eigene Wörter · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "suchen");

    function build(){
      var body = "";

      if(tab === "suchen"){
        var words = store.get("words", []);
        var query = store.get("query", "");

        var filtered = words.filter(function(w){
          if(!query) return true;
          var q = query.toLowerCase();
          return (w.term || "").toLowerCase().indexOf(q) !== -1 || (w.def || "").toLowerCase().indexOf(q) !== -1;
        });

        body = '<div class="card">'
          + '<input type="text" id="wbSearch" placeholder="🔍 Wort suchen..." value="' + _esc(query) + '" style="width:100%;padding:11px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;margin-bottom:10px">';

        if(!filtered.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">' + (words.length ? "Keine Treffer" : "Noch keine Wörter. Gehe zu ➕ Hinzufügen") + '</div>';
        } else {
          filtered.forEach(function(w){
            var ri = words.indexOf(w);
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;gap:10px;border-left:3px solid var(--p1)">'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:14px;font-weight:900;color:var(--p1)">' + _esc(w.term) + '</div>'
              + (w.pron ? '<div style="font-size:10.5px;color:var(--text-mute);font-style:italic">[' + _esc(w.pron) + ']</div>' : '')
              + '<div style="font-size:12px;color:var(--text-dim);margin-top:4px;line-height:1.5">' + _esc(w.def) + '</div>'
              + (w.example ? '<div style="font-size:11px;color:var(--text-mute);margin-top:6px;font-style:italic">"' + _esc(w.example) + '"</div>' : '')
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-wfav="' + ri + '" style="background:' + (w.fav ? "rgba(251,191,36,.3)" : "rgba(0,0,0,.3)") + ';border:none;border-radius:6px;cursor:pointer;padding:6px 10px;font-size:11px">' + (w.fav ? "⭐" : "☆") + '</button>'
              + '<button data-wdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:6px 10px;font-size:11px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';

      } else if(tab === "add"){
        body = '<div class="card"><h3>➕ Neues Wort</h3>'
          + '<div class="field"><label>Wort / Begriff</label><input type="text" id="wTerm" placeholder="z.B. Algorithmus" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div class="field"><label>Aussprache (optional)</label><input type="text" id="wPron" placeholder="z.B. al-go-rit-mus" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<div class="field"><label>Definition</label><textarea id="wDef" placeholder="Was bedeutet das Wort?" rows="3" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px;font-family:inherit;resize:vertical"></textarea></div>'
          + '<div class="field"><label>Beispielsatz (optional)</label><input type="text" id="wExample" placeholder="Ein Beispiel..." style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px"></div>'
          + '<button class="btn full" id="wSave">💾 Speichern</button>'
          + '</div>';

      } else if(tab === "favoriten"){
        var words2 = store.get("words", []);
        var favs = words2.filter(function(w){ return w.fav; });
        body = '<div class="card"><h3>⭐ Favoriten (' + favs.length + ')</h3>';
        if(!favs.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Favoriten</div>';
        } else {
          favs.forEach(function(w){
            body += '<div style="padding:10px;background:rgba(251,191,36,.1);border-radius:8px;margin-bottom:4px;border-left:3px solid #fbbf24">'
              + '<div style="font-size:13px;font-weight:900;color:#fbbf24">' + _esc(w.term) + '</div>'
              + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:2px">' + _esc(w.def) + '</div>'
              + '</div>';
          });
        }
        body += '</div>';

      } else if(tab === "settings"){
        var words3 = store.get("words", []);
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px">'
          + '<div style="font-size:12.5px;font-weight:800">📚 Wörter</div>'
          + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + words3.length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="wDelAll" style="margin-top:8px">🗑️ Alle Wörter löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="suchen"?" active":"") + '" data-wbt="suchen">🔍 Suchen</button>'
        + '<button class="tab' + (tab==="add"?" active":"") + '" data-wbt="add">➕ Hinzufügen</button>'
        + '<button class="tab' + (tab==="favoriten"?" active":"") + '" data-wbt="favoriten">⭐ Favoriten</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-wbt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-wbt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.wbt;
          store.set("tab", tab);
          build();
        });
      });

      if(tab === "suchen"){
        var sInp = container.querySelector("#wbSearch");
        if(sInp){
          sInp.addEventListener("input", function(){
            store.set("query", this.value);
            /* Nur Wort-Liste neu rendern, nicht das Input */
            var q = this.value;
            setTimeout(function(){
              var words4 = store.get("words", []);
              var f = words4.filter(function(w){
                if(!q) return true;
                var lq = q.toLowerCase();
                return (w.term || "").toLowerCase().indexOf(lq) !== -1 || (w.def || "").toLowerCase().indexOf(lq) !== -1;
              });
              /* Nur Liste aktualisieren */
              var card = container.querySelector(".card");
              if(!card) return;
              var listHtml = "";
              if(!f.length){
                listHtml = '<div style="color:var(--text-mute);text-align:center;padding:20px">' + (words4.length ? "Keine Treffer" : "Noch keine Wörter") + '</div>';
              } else {
                f.forEach(function(w){
                  var ri = words4.indexOf(w);
                  listHtml += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;gap:10px;border-left:3px solid var(--p1)">'
                    + '<div style="flex:1;min-width:0">'
                    + '<div style="font-size:14px;font-weight:900;color:var(--p1)">' + _esc(w.term) + '</div>'
                    + (w.pron ? '<div style="font-size:10.5px;color:var(--text-mute);font-style:italic">[' + _esc(w.pron) + ']</div>' : '')
                    + '<div style="font-size:12px;color:var(--text-dim);margin-top:4px;line-height:1.5">' + _esc(w.def) + '</div>'
                    + (w.example ? '<div style="font-size:11px;color:var(--text-mute);margin-top:6px;font-style:italic">"' + _esc(w.example) + '"</div>' : '')
                    + '</div>'
                    + '<div style="display:flex;flex-direction:column;gap:4px">'
                    + '<button data-wfav="' + ri + '" style="background:' + (w.fav ? "rgba(251,191,36,.3)" : "rgba(0,0,0,.3)") + ';border:none;border-radius:6px;cursor:pointer;padding:6px 10px;font-size:11px">' + (w.fav ? "⭐" : "☆") + '</button>'
                    + '<button data-wdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:6px 10px;font-size:11px">✕</button>'
                    + '</div></div>';
                });
              }
              /* Alte Liste entfernen, neue einfügen */
              var all = card.children;
              for(var i = all.length - 1; i >= 1; i--) all[i].remove();
              card.insertAdjacentHTML("beforeend", listHtml);
              bindList();
            }, 0);
          });
        }
        bindList();
      }

      function bindList(){
        container.querySelectorAll("[data-wfav]").forEach(function(el){
          el.addEventListener("click", function(){
            var words5 = store.get("words", []);
            var w = words5[parseInt(el.dataset.wfav)];
            if(w){ w.fav = !w.fav; store.set("words", words5); build(); }
          });
        });
        container.querySelectorAll("[data-wdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Wort löschen?")) return;
            var words6 = store.get("words", []);
            words6.splice(parseInt(el.dataset.wdel), 1);
            store.set("words", words6);
            build();
          });
        });
      }

      if(tab === "add"){
        container.querySelector("#wSave").addEventListener("click", function(){
          var term = container.querySelector("#wTerm").value.trim();
          var pron = container.querySelector("#wPron").value.trim();
          var def = container.querySelector("#wDef").value.trim();
          var ex = container.querySelector("#wExample").value.trim();
          if(!term || !def){ alert("Wort und Definition sind Pflicht"); return; }
          var words7 = store.get("words", []);
          words7.push({ term: term, pron: pron, def: def, example: ex, fav: false, date: new Date().toLocaleString("de-DE") });
          store.set("words", words7);
          if(HalDo.Notify) HalDo.Notify.success("Wort gespeichert", { app: "woerterbuch" });
          tab = "suchen"; store.set("tab", tab);
          build();
        });
      }

      if(tab === "settings"){
        var da = container.querySelector("#wDelAll");
        if(da) da.addEventListener("click", function(){
          if(!confirm("ALLE Wörter löschen?")) return;
          store.set("words", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("woerterbuch", { name: "Wörterbuch", icon: "📖", render: render, category: "werkzeuge" });
  console.log("🦚 woerterbuch.js geladen");
})();
