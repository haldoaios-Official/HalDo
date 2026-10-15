/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BEWERTUNG (v153)
   Bewertungen · Kategorien · Durchschnitt · Einstellungen
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

      if(tab === "liste"){
        var ratings = store.get("ratings", []);
        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<button class="btn" id="rNew" style="flex:1">+ Neue Bewertung</button>'
          + '</div>';

        if(editIdx !== undefined){
          var r = ratings[editIdx] || { name: "", rating: 5, category: "Allgemein", note: "" };
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="rName" placeholder="Was bewertest du?" value="' + _esc(r.name) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="rCat" placeholder="Kategorie (z.B. Film, Restaurant)" value="' + _esc(r.category) + '" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<div style="font-size:11px;color:var(--text-mute);margin-bottom:6px">Bewertung:</div>'
            + '<div id="stars" style="display:flex;gap:6px;margin-bottom:10px">'
            + [1,2,3,4,5].map(function(s){ return '<button data-star="' + s + '" style="font-size:28px;background:transparent;border:none;cursor:pointer;padding:0">' + (s <= r.rating ? "⭐" : "☆") + '</button>'; }).join("")
            + '</div>'
            + '<textarea id="rNote" placeholder="Notiz..." rows="3" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12.5px;font-family:inherit;resize:vertical">' + _esc(r.note) + '</textarea>'
            + '<div style="display:flex;gap:6px;margin-top:8px">'
            + '<button class="btn" id="rSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="rCancel">✕</button>'
            + '</div></div>';
        }

        if(!ratings.length && editIdx === undefined){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Bewertungen</div>';
        } else {
          ratings.slice().reverse().forEach(function(r2){
            var ri = ratings.indexOf(r2);
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid #fbbf24">'
              + '<div style="display:flex;justify-content:space-between;align-items:flex-start">'
              + '<div style="flex:1">'
              + '<div style="font-size:13px;font-weight:900">' + _esc(r2.name) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + _esc(r2.category) + '</div>'
              + '<div style="font-size:16px;margin-top:4px">' + "⭐".repeat(r2.rating) + "☆".repeat(5 - r2.rating) + '</div>'
              + (r2.note ? '<div style="font-size:11.5px;color:var(--text-dim);margin-top:6px;line-height:1.5">' + _esc(r2.note) + '</div>' : '')
              + '</div>'
              + '<div style="display:flex;flex-direction:column;gap:4px">'
              + '<button data-redit="' + ri + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:4px 8px;font-size:11px">✏️</button>'
              + '<button data-rdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "stats"){
        var ratings2 = store.get("ratings", []);
        var total = ratings2.length;
        var avg = total ? (ratings2.reduce(function(s, r){ return s + r.rating; }, 0) / total).toFixed(2) : "—";

        /* Nach Kategorie */
        var byCat = {};
        ratings2.forEach(function(r){
          if(!byCat[r.category]) byCat[r.category] = [];
          byCat[r.category].push(r.rating);
        });

        body = '<div class="card"><h3>📊 Statistik</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">'
          + '<div style="padding:14px;background:rgba(251,191,36,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">GESAMT</div>'
          + '<div style="font-size:24px;font-weight:900;color:#fbbf24">' + total + '</div>'
          + '</div>'
          + '<div style="padding:14px;background:rgba(0,229,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">DURCHSCHNITT</div>'
          + '<div style="font-size:24px;font-weight:900;color:var(--p1)">' + avg + ' ⭐</div>'
          + '</div></div>';

        Object.keys(byCat).forEach(function(cat){
          var vals = byCat[cat];
          var catAvg = (vals.reduce(function(s, v){ return s + v; }, 0) / vals.length).toFixed(1);
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center">'
            + '<div style="font-size:12.5px;font-weight:800">' + _esc(cat) + '</div>'
            + '<div style="font-size:14px;font-weight:900;color:#fbbf24">' + catAvg + ' ⭐</div>'
            + '</div>';
        });
        body += '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">⭐ BEWERTUNGEN</div>'
          + '<div style="font-size:22px;font-weight:900;color:#fbbf24">' + store.get("ratings", []).length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="rClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="liste"?" active":"") + '" data-rtt="liste">⭐ Liste</button>'
        + '<button class="tab' + (tab==="stats"?" active":"") + '" data-rtt="stats">📊 Statistik</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-rtt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-rtt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.rtt; store.set("tab", tab); build();
        });
      });

      if(tab === "liste"){
        var nb = container.querySelector("#rNew");
        if(nb) nb.addEventListener("click", function(){ build(-1); });

        var curRating = editIdx >= 0 ? store.get("ratings", [])[editIdx].rating : 5;
        container.querySelectorAll("[data-star]").forEach(function(el){
          el.addEventListener("click", function(){
            var val = parseInt(el.dataset.star);
            container.querySelectorAll("[data-star]").forEach(function(s){
              s.textContent = parseInt(s.dataset.star) <= val ? "⭐" : "☆";
            });
            store.set("tempRating", val);
          });
        });

        if(editIdx !== undefined){
          var save = container.querySelector("#rSave");
          if(save) save.addEventListener("click", function(){
            var name = container.querySelector("#rName").value.trim();
            if(!name){ alert("Name ist Pflicht"); return; }
            var r3 = {
              name: name,
              category: container.querySelector("#rCat").value.trim() || "Allgemein",
              rating: store.get("tempRating", curRating),
              note: container.querySelector("#rNote").value.trim(),
              date: new Date().toLocaleString("de-DE")
            };
            var ratings3 = store.get("ratings", []);
            if(editIdx === -1) ratings3.push(r3);
            else ratings3[editIdx] = r3;
            store.set("ratings", ratings3);
            store.set("tempRating", null);
            if(HalDo.Notify) HalDo.Notify.success("Bewertung gespeichert", { app: "bewertung" });
            build();
          });
          var cancel = container.querySelector("#rCancel");
          if(cancel) cancel.addEventListener("click", function(){ build(); });
        }

        container.querySelectorAll("[data-redit]").forEach(function(el){
          el.addEventListener("click", function(){ build(parseInt(el.dataset.redit)); });
        });
        container.querySelectorAll("[data-rdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Bewertung löschen?")) return;
            var ratings4 = store.get("ratings", []);
            ratings4.splice(parseInt(el.dataset.rdel), 1);
            store.set("ratings", ratings4);
            build();
          });
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#rClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Bewertungen löschen?")) return;
          store.set("ratings", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("bewertung", { name: "Bewertung", icon: "⭐", render: render, category: "werkzeuge" });
  console.log("🦚 bewertung.js geladen");
})();
