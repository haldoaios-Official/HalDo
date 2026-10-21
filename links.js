/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — LINKS (v300)
   Bookmarks · Kategorien · Favoriten
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "alle");

    function build(){
      var body = '';
      var links = store.get("links", []);
      var filtered = tab === "fav" ? links.filter(l => l.fav) : links;

      body += '<div class="tabs">'
        + '<button class="tab' + (tab === "alle" ? " active" : "") + '" data-lt="alle">🔗 Alle</button>'
        + '<button class="tab' + (tab === "fav" ? " active" : "") + '" data-lt="fav">⭐ Favoriten</button>'
        + '</div>';

      body += '<div class="card">'
        + '<button class="btn full" id="lNew" style="margin-bottom:10px">➕ Neuer Link</button>';

      if(!filtered.length) {
        body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Links</div>';
      } else {
        filtered.forEach(l => {
          var ri = links.indexOf(l);
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid ' + (l.fav ? "#fbbf24" : "var(--p1)") + '">'
            + '<div style="flex:1;min-width:0">'
            + '<div style="font-size:12.5px;font-weight:900;color:var(--p1)">' + _esc(l.title) + '</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(l.url) + '</div>'
            + '</div>'
            + '<div style="display:flex;gap:4px">'
            + '<a href="' + _esc(l.url) + '" target="_blank" rel="noopener" style="background:linear-gradient(135deg,var(--p1),var(--p3));border:none;border-radius:6px;color:#000;cursor:pointer;padding:4px 8px;text-decoration:none;font-weight:900">→</a>'
            + '<button data-lfav="'+ri+'" style="background:transparent;border:none;cursor:pointer">' + (l.fav ? "⭐" : "☆") + '</button>'
            + '<button data-ldel="'+ri+'" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px">✕</button>'
            + '</div></div>';
        });
      }
      body += '</div>';

      container.innerHTML = body;

      container.querySelectorAll("[data-lt]").forEach(b => {
        b.addEventListener("click", () => { tab = b.dataset.lt; store.set("tab", tab); build(); });
      });

      container.querySelector("#lNew").addEventListener("click", function(){
        var title = prompt("Titel:"); if(!title) return;
        var url = prompt("URL (https://...):"); if(!url) return;
        if(!/^https?:\/\//.test(url)) url = "https://" + url;
        var l = store.get("links", []);
        l.push({ title: title, url: url, fav: false });
        store.set("links", l); build();
      });

      container.querySelectorAll("[data-lfav]").forEach(el => {
        el.addEventListener("click", function(){
          var l = store.get("links", []); var item = l[parseInt(el.dataset.lfav)]; item.fav = !item.fav; store.set("links", l); build();
        });
      });
      container.querySelectorAll("[data-ldel]").forEach(el => {
        el.addEventListener("click", function(){
          if(!confirm("Link löschen?")) return;
          var l = store.get("links", []); l.splice(parseInt(el.dataset.ldel), 1); store.set("links", l); build();
        });
      });
    }
    build();
  }
  HalDoApp("links", { name: "Links", icon: "🔗", render: render, category: "produktivitaet" });
  console.log("🦚 links.js v300 geladen");
})();
