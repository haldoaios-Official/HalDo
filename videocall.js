/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VIDEOCALL (v156)
   Videoanruf-UI · Kontakte · Verlauf · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "anrufen");

    function build(){
      var body = "";

      if(tab === "anrufen"){
        var contacts = HalDo.Store ? HalDo.Store.get("kontakte:items", []) : [];
        var recent = store.get("recent", []);

        body = '<div class="card">'
          + '<div style="padding:30px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border-radius:14px;text-align:center;border:1.5px solid var(--p1);margin-bottom:14px">'
          + '<div style="font-size:64px">📹</div>'
          + '<div style="font-size:16px;font-weight:900;color:var(--p1);margin-top:8px">Video-Anruf</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:4px">Wähle einen Kontakt zum Anrufen</div>'
          + '</div>';

        if(recent.length){
          body += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;margin-bottom:6px">Zuletzt</div>';
          recent.slice(0, 3).forEach(function(r){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div><div style="font-size:12.5px;font-weight:800">📹 ' + _esc(r.name) + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(r.date) + '</div></div>'
              + '<button data-vcall="' + _esc(r.name) + '" style="background:linear-gradient(135deg,#4ade80,#00e5ff);border:none;border-radius:6px;color:#000;cursor:pointer;padding:6px 12px;font-size:11px;font-weight:900">📹</button>'
              + '</div>';
          });
        }

        if(contacts.length){
          body += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;margin:14px 0 6px">Kontakte</div>';
          contacts.forEach(function(c){
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div><div style="font-size:12.5px;font-weight:800">👤 ' + _esc(c.name) + '</div>'
              + (c.phone ? '<div style="font-size:10.5px;color:var(--text-mute)">' + _esc(c.phone) + '</div>' : '') + '</div>'
              + '<button data-vcall="' + _esc(c.name) + '" style="background:linear-gradient(135deg,#4ade80,#00e5ff);border:none;border-radius:6px;color:#000;cursor:pointer;padding:6px 12px;font-size:11px;font-weight:900">📹</button>'
              + '</div>';
          });
        }
        body += '</div>';
      }

      else if(tab === "verlauf"){
        var hist = store.get("history", []);
        body = '<div class="card"><h3>📹 Video-Anrufe (' + hist.length + ')</h3>';
        if(!hist.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Anrufe</div>';
        } else {
          hist.slice().reverse().forEach(function(h){
            var ri = hist.indexOf(h);
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div><div style="font-size:12.5px;font-weight:800">' + (h.type === "out" ? "📤" : "📥") + " " + _esc(h.name) + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(h.date) + (h.duration ? " · " + _esc(h.duration) : "") + '</div></div>'
              + '<button data-vcall="' + _esc(h.name) + '" style="background:rgba(0,229,255,.15);border:none;border-radius:6px;color:var(--p1);cursor:pointer;padding:6px 10px;font-size:11px">📹</button>'
              + '</div>';
          });
          body += '<button class="btn sec full" id="vcClear" style="margin-top:8px;font-size:11px">🗑️ Verlauf löschen</button>';
        }
        body += '</div>';
      }

      else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-bottom:12px;border-left:3px solid var(--p1)">'
          + '<div style="font-size:11.5px;color:var(--text-dim);line-height:1.5">'
          + 'ℹ️ Dies ist eine <b>UI-Simulation</b>. Echte Videoanrufe brauchen WebRTC-Server.'
          + '</div></div>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">📹 ANRUFE</div>'
          + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + store.get("history", []).length + '</div>'
          + '</div>'
          + '<button class="btn danger full" id="vcDel" style="margin-top:8px">🗑️ Alle Daten löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="anrufen"?" active":"") + '" data-vct="anrufen">📹 Anrufen</button>'
        + '<button class="tab' + (tab==="verlauf"?" active":"") + '" data-vct="verlauf">📞 Verlauf</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-vct="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-vct]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.vct; store.set("tab", tab); build();
        });
      });

      if(tab === "anrufen" || tab === "verlauf"){
        container.querySelectorAll("[data-vcall]").forEach(function(el){
          el.addEventListener("click", function(){
            var name = el.dataset.vcall;
            var hist2 = store.get("history", []);
            hist2.push({ name: name, type: "out", date: new Date().toLocaleString("de-DE"), duration: "0:00" });
            store.set("history", hist2);
            var recent2 = store.get("recent", []);
            recent2 = recent2.filter(function(r){ return r.name !== name; });
            recent2.unshift({ name: name, date: new Date().toLocaleString("de-DE") });
            store.set("recent", recent2.slice(0, 5));
            if(HalDo.Notify) HalDo.Notify.info("📹 Video-Anruf zu " + name + " simuliert", { app: "videocall" });
            build();
          });
        });
      }

      if(tab === "verlauf"){
        var clr = container.querySelector("#vcClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("Verlauf löschen?")) return;
          store.set("history", []);
          build();
        });
      }

      if(tab === "settings"){
        var del = container.querySelector("#vcDel");
        if(del) del.addEventListener("click", function(){
          if(!confirm("Alle Daten löschen?")) return;
          store.set("history", []); store.set("recent", []);
          build();
        });
      }
    }

    build();
  }

  HalDoApp("videocall", { name: "VideoCall", icon: "📹", render: render, category: "kommunikation" });
  console.log("🦚 videocall.js v156 geladen");
})();
