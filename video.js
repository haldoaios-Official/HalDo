/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VIDEO (v155)
   Video-Sammlung · Player · YouTube · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }
  function ytId(url){
    var m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "bibliothek");

    function build(){
      var body = "";

      if(tab === "player"){
        var cur = store.get("current", null);
        body = '<div class="card">';
        if(cur){
          if(cur.url && ytId(cur.url)){
            body += '<div style="border-radius:12px;overflow:hidden;background:#000">'
              + '<iframe width="100%" height="220" src="https://www.youtube.com/embed/' + ytId(cur.url) + '" frameborder="0" allowfullscreen style="display:block"></iframe>'
              + '</div>';
          } else if(cur.url){
            body += '<video controls src="' + _esc(cur.url) + '" style="width:100%;border-radius:12px;background:#000;max-height:300px"></video>';
          } else {
            body += '<div style="padding:40px;background:rgba(0,0,0,.3);border-radius:12px;text-align:center;font-size:48px">🎬</div>';
          }
          body += '<div style="margin-top:12px">'
            + '<div style="font-size:15px;font-weight:900;color:var(--p1)">' + _esc(cur.title) + '</div>'
            + (cur.desc ? '<div style="font-size:11.5px;color:var(--text-mute);margin-top:4px">' + _esc(cur.desc) + '</div>' : '')
            + '</div>';
        } else {
          body += '<div style="text-align:center;padding:40px"><div style="font-size:64px">🎬</div>'
            + '<div style="font-size:13px;color:var(--text-mute);margin-top:12px">Kein Video ausgewählt</div></div>';
        }
        body += '</div>';
      }

      else if(tab === "bibliothek"){
        var vids = store.get("videos", []);
        var q = store.get("query", "");
        var filtered = vids.filter(function(v){
          if(!q) return true;
          var lq = q.toLowerCase();
          return (v.title || "").toLowerCase().indexOf(lq) !== -1
            || (v.desc || "").toLowerCase().indexOf(lq) !== -1;
        });

        body = '<div class="card">'
          + '<div style="display:flex;gap:6px;margin-bottom:10px">'
          + '<input type="text" id="vSearch" placeholder="🔍 Suchen..." value="' + _esc(q) + '" style="flex:1;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:10px;color:inherit;font-size:13px">'
          + '<button class="btn" id="vNew" style="padding:0 16px">+</button>'
          + '</div>';

        if(store.get("editing", false)){
          body += '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:10px;border-left:3px solid var(--p1)">'
            + '<input type="text" id="vTitle" placeholder="Titel*" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:13px;margin-bottom:6px">'
            + '<input type="url" id="vUrl" placeholder="URL (YouTube oder MP4)" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:6px">'
            + '<input type="text" id="vDesc" placeholder="Beschreibung" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:var(--border-soft);border-radius:8px;color:inherit;font-size:12px;margin-bottom:8px">'
            + '<div style="display:flex;gap:6px">'
            + '<button class="btn" id="vSave" style="flex:1">💾 Speichern</button>'
            + '<button class="btn sec" id="vCancel">✕</button>'
            + '</div></div>';
        }

        if(!filtered.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">' + (vids.length ? "Keine Treffer" : "Noch keine Videos") + '</div>';
        } else {
          filtered.slice().reverse().forEach(function(v){
            var ri = vids.indexOf(v);
            var vid = ytId(v.url || "");
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;display:flex;gap:10px;align-items:center;border-left:3px solid var(--p3)">'
              + '<div style="width:60px;height:40px;background:#000;border-radius:6px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;font-size:20px">'
              + (vid ? '<img src="https://img.youtube.com/vi/' + vid + '/default.jpg" style="width:100%;height:100%;object-fit:cover">' : "🎬")
              + '</div>'
              + '<div style="flex:1;min-width:0">'
              + '<div style="font-size:12.5px;font-weight:900;color:var(--p3)">' + _esc(v.title) + '</div>'
              + (v.desc ? '<div style="font-size:10.5px;color:var(--text-mute);overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(v.desc) + '</div>' : '')
              + '</div>'
              + '<div style="display:flex;gap:4px">'
              + '<button data-vplay="' + ri + '" style="background:linear-gradient(135deg,var(--p1),var(--p3));border:none;border-radius:6px;color:#000;cursor:pointer;padding:5px 10px;font-size:11px;font-weight:900">▶</button>'
              + '<button data-vdel="' + ri + '" style="background:rgba(255,128,128,.15);border:none;border-radius:6px;color:#ff8080;cursor:pointer;padding:5px 8px;font-size:11px">✕</button>'
              + '</div></div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">🎬 VIDEOS</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p3)">' + store.get("videos", []).length + '</div>'
          + '</div>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:12px;line-height:1.5">'
          + 'ℹ️ Füge YouTube-Links oder direkte Video-URLs (MP4) hinzu. Für KI-Video-Generierung: Server nötig.'
          + '</div>'
          + '<button class="btn danger full" id="vClear" style="margin-top:10px">🗑️ Alle löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="bibliothek"?" active":"") + '" data-vt="bibliothek">📚 Bibliothek</button>'
        + '<button class="tab' + (tab==="player"?" active":"") + '" data-vt="player">▶ Player</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-vt="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-vt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.vt; store.set("tab", tab); build();
        });
      });

      if(tab === "bibliothek"){
        var sInp = container.querySelector("#vSearch");
        if(sInp) sInp.addEventListener("input", function(){
          store.set("query", this.value); build();
        });
        var nb = container.querySelector("#vNew");
        if(nb) nb.addEventListener("click", function(){ store.set("editing", true); build(); });
        var save = container.querySelector("#vSave");
        if(save) save.addEventListener("click", function(){
          var t = container.querySelector("#vTitle").value.trim();
          var u = container.querySelector("#vUrl").value.trim();
          if(!t){ alert("Titel ist Pflicht"); return; }
          var vids2 = store.get("videos", []);
          vids2.push({ title: t, url: u, desc: container.querySelector("#vDesc").value.trim(), date: new Date().toLocaleString("de-DE") });
          store.set("videos", vids2);
          store.set("editing", false);
          if(HalDo.Notify) HalDo.Notify.success("Video gespeichert", { app: "video" });
          build();
        });
        var cancel = container.querySelector("#vCancel");
        if(cancel) cancel.addEventListener("click", function(){ store.set("editing", false); build(); });

        container.querySelectorAll("[data-vplay]").forEach(function(el){
          el.addEventListener("click", function(){
            var v = store.get("videos", [])[parseInt(el.dataset.vplay)];
            if(v) store.set("current", v);
            tab = "player"; store.set("tab", tab); build();
          });
        });
        container.querySelectorAll("[data-vdel]").forEach(function(el){
          el.addEventListener("click", function(){
            if(!confirm("Video löschen?")) return;
            var vids3 = store.get("videos", []);
            vids3.splice(parseInt(el.dataset.vdel), 1);
            store.set("videos", vids3);
            build();
          });
        });
      }

      if(tab === "settings"){
        var clr = container.querySelector("#vClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("ALLE Videos löschen?")) return;
          store.set("videos", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("video", { name: "Video", icon: "🎬", render: render, category: "lifestyle" });
  console.log("🦚 video.js v155 geladen");
})();
