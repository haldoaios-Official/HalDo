/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BEWERTUNG (v300)
   Filme · Restaurants · 5-Sterne-System
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var ratings = store.get("ratings", []);
    
    function build(){
      var body = '<div class="card">'
        + '<button class="btn full" id="rAdd" style="margin-bottom:10px">+ Neue Bewertung</button>';
      
      if(!ratings.length) body += '<div style="text-align:center;color:var(--text-mute);padding:20px">Keine Bewertungen</div>';
      else {
        ratings.slice().reverse().forEach((r, idx) => {
          var ri = ratings.length - 1 - idx;
          body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid #fbbf24">'
            + '<div style="display:flex;justify-content:space-between">'
            + '<div><div style="font-size:13px;font-weight:900">' + _esc(r.name) + '</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute)">' + _esc(r.category) + '</div>'
            + '<div style="font-size:16px;margin-top:4px">' + "⭐".repeat(r.stars) + "☆".repeat(5-r.stars) + '</div></div>'
            + '<button data-rdel="'+ri+'" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>'
            + '</div>'
            + (r.note ? '<div style="font-size:11px;color:var(--text-dim);margin-top:6px">' + _esc(r.note) + '</div>' : '')
            + '</div>';
        });
      }
      body += '</div>';

      container.innerHTML = body;

      container.querySelector("#rAdd").addEventListener("click", function(){
        var n = prompt("Was bewertest du? (z.B. Film)"); if(!n) return;
        var cat = prompt("Kategorie (z.B. Kino):", "Allgemein");
        var s = parseInt(prompt("Sterne (1-5):", "5"));
        if(!s || s < 1 || s > 5) s = 5;
        var note = prompt("Notiz (optional):");
        var r = store.get("ratings", []);
        r.push({ name: n, category: cat || "Allgemein", stars: s, note: note || "", date: new Date().toLocaleString("de-DE") });
        store.set("ratings", r); build();
      });

      container.querySelectorAll("[data-rdel]").forEach(el => {
        el.addEventListener("click", function(){
          if(!confirm("Löschen?")) return;
          var r = store.get("ratings", []); r.splice(parseInt(el.dataset.rdel), 1); store.set("ratings", r); build();
        });
      });
    }
    build();
  }

  HalDoApp("bewertung", { name: "Bewertung", icon: "⭐", render: render, category: "werkzeuge" });
  console.log("🦚 bewertung.js v300 geladen");
})();
