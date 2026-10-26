/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — NETZWERK-INFO (v1.0)
   Verbindung · IP · Speed · Ping
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }

  function render(container, ctx){
    var store = ctx.store;
    var state = {
      online: navigator.onLine,
      conn: null,
      publicIP: store.get("publicIP", "—"),
      publicIPCache: store.get("publicIPCache", 0),
      lastPing: store.get("lastPing", null),
      loadingPing: false
    };

    function build(){
      var conn = state.conn || {};
      var html = '<div class="card" style="background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.1));border:1px solid rgba(77,208,225,.3);text-align:center">'
        + '<div style="font-size:44px">📶</div>'
        + '<div style="font-size:16px;font-weight:900;color:#4dd0e1;margin-top:6px">Netzwerk-Info</div>'
        + '<div style="margin-top:10px;display:inline-block;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:900;background:'+(state.online?"rgba(74,222,128,.2);color:#4ade80":"rgba(255,128,128,.2);color:#ff8080")+'">'+(state.online?"🟢 ONLINE":"🔴 OFFLINE")+'</div>'
        + '</div>';

      // Connection details
      html += '<div class="card"><h3>Verbindung</h3>'
        + row("Status", state.online ? "Verbunden" : "Getrennt")
        + (conn.effectiveType ? row("Typ", conn.effectiveType.toUpperCase()) : '')
        + (conn.downlink ? row("Download (geschätzt)", conn.downlink + " Mbps") : '')
        + (conn.rtt ? row("Latenz (RTT)", conn.rtt + " ms") : '')
        + (conn.saveData !== undefined ? row("Datensparmodus", conn.saveData ? "Aktiv" : "Aus") : '')
        + '</div>';

      // Public IP
      html += '<div class="card"><h3>🌐 Öffentliche IP</h3>'
        + '<div style="padding:14px;background:rgba(0,0,0,.3);border-radius:10px;text-align:center;font-family:monospace;font-size:18px;font-weight:900;color:#4dd0e1;margin:8px 0">'+_esc(state.publicIP)+'</div>'
        + '<button class="btn full" id="ni-fetchIP">🔄 IP aktualisieren</button>'
        + (state.publicIPCache ? '<div style="text-align:center;font-size:10px;color:var(--text-mute);margin-top:6px">Zuletzt: '+new Date(state.publicIPCache).toLocaleString("de-DE")+'</div>' : '')
        + '</div>';

      // Ping test
      html += '<div class="card"><h3>⚡ Ping-Test</h3>';
      if(state.loadingPing){
        html += '<div style="text-align:center;padding:14px;color:var(--text-mute)">⏳ Teste...</div>';
      } else if(state.lastPing !== null){
        html += '<div style="text-align:center;padding:10px;background:rgba(77,208,225,.1);border-radius:10px;margin-bottom:8px">'
          + '<div style="font-size:26px;font-weight:900;color:#4dd0e1">'+state.lastPing+' ms</div>'
          + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">'+pingLabel(state.lastPing)+'</div>'
          + '</div>';
      }
      html += '<button class="btn full" id="ni-ping">🏓 Ping testen</button></div>';

      // Details
      html += '<div class="card"><h3>📋 Details</h3>'
        + row("Browser", getBrowser())
        + row("Plattform", navigator.platform || "—")
        + row("User Agent", navigator.userAgent.substring(0, 50) + (navigator.userAgent.length > 50 ? "..." : ""))
        + row("Sprache", navigator.language || "—")
        + row("Cookies", navigator.cookieEnabled ? "Erlaubt" : "Blockiert")
        + '</div>';

      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelector("#ni-fetchIP").addEventListener("click", function(){
        fetchIP();
      });
      container.querySelector("#ni-ping").addEventListener("click", function(){
        state.loadingPing = true; build();
        var start = performance.now();
        fetch("https://api.ipify.org?format=json", { cache:"no-store" })
          .then(function(r){ return r.json(); })
          .then(function(){
            var ms = Math.round(performance.now() - start);
            state.lastPing = ms; state.loadingPing = false;
            store.set("lastPing", ms);
            build();
          })
          .catch(function(){
            state.lastPing = null; state.loadingPing = false;
            build();
            if(HalDo.Notify) HalDo.Notify.error("Ping fehlgeschlagen");
          });
      });
    }

    function fetchIP(){
      if(navigator.onLine === false){ state.publicIP = "—"; build(); return; }
      fetch("https://api.ipify.org?format=json", { cache:"no-store" })
        .then(function(r){ return r.json(); })
        .then(function(d){
          state.publicIP = d.ip || "—";
          state.publicIPCache = Date.now();
          store.set("publicIP", state.publicIP);
          store.set("publicIPCache", state.publicIPCache);
          build();
        })
        .catch(function(){
          state.publicIP = "Nicht erreichbar";
          build();
        });
    }

    function pingLabel(ms){
      if(ms < 50) return "🟢 Ausgezeichnet";
      if(ms < 100) return "🟢 Sehr gut";
      if(ms < 200) return "🟡 Gut";
      if(ms < 500) return "🟠 Mittel";
      return "🔴 Langsam";
    }

    function getBrowser(){
      var ua = navigator.userAgent;
      if(ua.indexOf("Chrome") >= 0 && ua.indexOf("Edg") < 0) return "Chrome " + (ua.match(/Chrome\/([0-9]+)/) || [])[1];
      if(ua.indexOf("Safari") >= 0 && ua.indexOf("Chrome") < 0) return "Safari " + (ua.match(/Version\/([0-9]+)/) || [])[1];
      if(ua.indexOf("Firefox") >= 0) return "Firefox " + (ua.match(/Firefox\/([0-9]+)/) || [])[1];
      if(ua.indexOf("Edg") >= 0) return "Edge " + (ua.match(/Edg\/([0-9]+)/) || [])[1];
      return "Unbekannt";
    }

    function row(k, v){
      return '<div style="display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:11.5px;gap:8px"><span style="color:var(--text-mute);flex-shrink:0">'+k+'</span><span style="font-weight:800;color:var(--p1);text-align:right;word-break:break-word">'+v+'</span></div>';
    }

    // Watch connection
    try {
      var connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if(connection){
        state.conn = { effectiveType: connection.effectiveType, downlink: connection.downlink, rtt: connection.rtt, saveData: connection.saveData };
        connection.addEventListener("change", function(){
          state.conn = { effectiveType: connection.effectiveType, downlink: connection.downlink, rtt: connection.rtt, saveData: connection.saveData };
          build();
        });
      }
    } catch(e){}

    window.addEventListener("online", function(){ state.online = true; build(); });
    window.addEventListener("offline", function(){ state.online = false; build(); });

    build();
    if(!state.publicIPCache || Date.now() - state.publicIPCache > 3600000){
      fetchIP();
    }
  }

  HalDoApp("netzwerk-info", { name: "Netzwerk", icon: "📶", render: render, category: "system" });
  console.log("🦚 netzwerk-info.js v1.0 geladen");
})();
