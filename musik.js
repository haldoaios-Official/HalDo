/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — MUSIK (v152)
   Player · Playlists · YouTube · Favoriten · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "player");

    function build(){
      var body = "";

      /* ═══ PLAYER ═══ */
      if(tab === "player"){
        var current = store.get("current", null);
        var queue = store.get("queue", []);

        body = '<div class="card">'
          + '<div style="padding:24px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:14px;text-align:center;border:1.5px solid var(--p1)">'
          + '<div style="font-size:64px">🎵</div>'
          + '<div style="font-size:15px;font-weight:900;color:var(--p1);margin-top:10px">' + (current ? _esc(current.title) : "Kein Track") + '</div>'
          + '<div style="font-size:11px;color:var(--text-dim);margin-top:4px">' + (current ? _esc(current.artist || "Unbekannt") : "Wähle einen Track") + '</div>'
          + '</div>';

        if(current && current.url){
          /* Falls YouTube-Link → Embed */
          if(/youtube\.com|youtu\.be/.test(current.url)){
            var videoId = extractYouTubeId(current.url);
            if(videoId){
              body += '<div style="margin-top:14px;border-radius:12px;overflow:hidden">'
                + '<iframe width="100%" height="200" src="https://www.youtube.com/embed/' + videoId + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="display:block"></iframe>'
                + '</div>';
            }
          } else {
            body += '<audio controls src="' + _esc(current.url) + '" style="width:100%;margin-top:14px"></audio>';
          }
        }

        body += '<div style="display:flex;gap:6px;margin-top:14px">'
          + '<button class="btn sec" data-mctrl="prev" style="flex:1">⏮</button>'
          + '<button class="btn" data-mctrl="play" style="flex:2">▶ Play</button>'
          + '<button class="btn sec" data-mctrl="next" style="flex:1">⏭</button>'
          + '</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:8px;text-align:center">Queue: ' + queue.length + ' Tracks</div>'
          + '</div>';

      /* ═══ BIBLIOTHEK ═══ */
      } else if(tab === "bibliothek"){
        var tracks = store.get("tracks", []);
        var query = store.get("query", "");

        var filtered = tracks.filter(function(t){
          if(!query) return true;
          var q = query.toLowerCase();
          return (t.title || "").toLowerCase().indexOf(q) !== -1
            || (t.artist || "").toLowerCase().indexOf(q) !== -1;
        });

        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="mSearch" placeholder="🔍 Suchen..." value="' + _esc(query) + '" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="mNew" style="padding:0 16px">+</button>'
          + '</div>';

        if(store.get("editing", false)){
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="mTitle" placeholder="Titel*" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="text" id="mArtist" placeholder="Künstler" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="url" id="mUrl" placeholder="URL (MP3 oder YouTube)" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<div style="display:flex;gap:6px">'
            + '<button class="btn" id="mSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="mCancel">✕</button>'
            + '</div></div>';
        }

        if(!filtered.length && !store.get("editing", false)){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">' + (tracks.length ? "Keine Treffer" : "Noch keine Tracks") + '</div>';
        } else {
          filtered.slice().reverse().forEach(function(t){
            var ri = tracks.indexOf(t);
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;gap:10px;align-items:center;border-left:3px solid ' + (t.fav ? "#fbbf24" : "var(--p3)") + '">'
              + '<div style="font-size:22px;flex-shrink:0">🎵</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:12.5px;font-weight:900">' + _esc(t.title) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute)">' + _esc(t.artist || "—") + '</div>'
              + '</div>'
              + '<div style="display:flex;gap:4px">'
              + '<button data-mplay="' + ri + '" style="background:linear-gradient(135deg,var(--p1),var(--p3));border:none;border-radius:6px;color:#000;cursor:pointer;padding:4px 8px;font-size:11px;font-weight:900">▶</button>'
              + '<button data-mfav="' + ri + '" style="background:transparent;border:none;cursor:pointer;font-size:12px">' + (t.fav ? "⭐" : "☆") + '</button>'
              + '<button data-mdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:4px 8px;font-size:11px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';

      /* ═══ FAVORITEN ═══ */
      } else if(tab === "favoriten"){
        var tracks2 = store.get("tracks", []);
        var favs = tracks2.filter(function(t){ return t.fav; });
        body = '<div class="card"><h3>⭐ Favoriten (' + favs.length + ')</h3>';
        if(!favs.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Favoriten</div>';
        } else {
          favs.forEach(function(t){
            var ri = tracks2.indexOf(t);
            body += '<div style="padding:10px;background:rgba(251,191,36,.08);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid #fbbf24">'
              + '<div><div style="font-size:12.5px;font-weight:900;color:#fbbf24">' + _esc(t.title) + '</div>'
              + '<div style="font-size:10.5px;color:var(--text-mute)">' + _esc(t.artist || "—") + '</div></div>'
              + '<button data-mplay="' + ri + '" style="background:linear-gradient(135deg,#fbbf24,#ff8080);border:none;border-radius:6px;color:#000;cursor:pointer;padding:4px 10px;font-size:11px;font-weight:900">▶</button>'
              + '</div>';
          });
        }
        body += '</div>';

      /* ═══ SETTINGS ═══ */
      } else if(tab === "settings"){
        var tracks3 = store.get("tracks", []);
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🎵 TRACKS</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + tracks3.length + '</div>'
          + '</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:10px;line-height:1.5">'
          + 'ℹ️ Füge MP3-URLs oder YouTube-Links hinzu. Echte Musik-Generierung braucht Server.'
          + '</div>'
          + '<button class="btn danger full" id="mClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="player"?" active":"") + '" data-mt="player">▶ Player</button>'
        + '<button class="tab' + (tab==="bibliothek"?" active":"") + '" data-mt="bibliothek">📚 Bibliothek</button>'
        + '<button class="tab' + (tab==="favoriten"?" active":"") + '" data-mt="favoriten">⭐</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-mt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-mt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.mt; store.set("tab", tab); build();
        });
      });

      if(tab === "bibliothek"){
        var sInp = container.querySelector("#mSearch");
        if(sInp) sInp.addEventListener("input", function(){
          store.set("query", this.value); build();
        });
        var nb = container.querySelector("#mNew");
        if(nb) nb.addEventListener("click", function(){
          store.set("editing", true); build();
        });

        var save = container.querySelector("#mSave");
        if(save) save.addEventListener("click", function(){
          var title = container.querySelector("#mTitle").value.trim();
          var artist = container.querySelector("#mArtist").value.trim();
          var url = container.querySelector("#mUrl").value.trim();
          if(!title){ alert("Titel ist Pflicht"); return; }
          var tracks4 = store.get("tracks", []);
          tracks4.push({ title: title, artist: artist, url: url, fav: false, date: new Date().toLocaleString("de-DE") });
          store.set("tracks", tracks4);
          store.set("editing", false);
          if(HalDo.Notify) HalDo.Notify.success("Track hinzugefügt", { app: "musik" });
          build();
        });
        var cancel = container.querySelector("#mCancel");
        if(cancel) cancel.addEventListener("click", function(){
          store.set("editing", false); build();
        });

        container.querySelectorAll("[data-mplay]").forEach(function(el){
          el.addEventListener("click", function(){
            var t = store.get("tracks", [])[parseInt(el.dataset.mplay)];
            if(t) store.set("current", t);
            tab = "player"; store.set("tab", tab);
            build();
          });
        });
        container.querySelectorAll("[data-mfav]").forEach(function(el){
          el.addEventListener("click", function(){
            var t = store.get("tracks", []);
            t[parseInt(el.dataset.mfav)].fav = !t[parseInt(el.dataset.mfav)].fav;
            store.set("tracks", t);
            build();
          });
        });
        container.querySelectorAll("[data-mdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Track löschen?")) return;
            var t = store.get("tracks", []);
            t.splice(parseInt(el.dataset.mdel), 1);
            store.set("tracks", t);
            build();
          });
        });
      }

      if(tab === "player"){
        container.querySelectorAll("[data-mctrl]").forEach(function(el){
          el.addEventListener("click", function(){
            var ctrl = el.dataset.mctrl;
            if(ctrl === "play" && HalDo.Notify) HalDo.Notify.info("Nutze den eingebauten Player ▶", { app: "musik" });
          });
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#mClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Tracks löschen?")) return;
          store.set("tracks", []);
          build();
        });
      }
    }

    function extractYouTubeId(url){
      var m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      return m ? m[1] : null;
    }

    build();
  }

  HalDoApp("musik", { name: "Musik", icon: "🎵", render: render, category: "lifestyle" });
  console.log("🦚 musik.js geladen");
})();
