/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SYSTEM CENTER (v150)
   Übersicht · App-Manager · Health · Storage · Logs
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function fmtBytes(b){
    if(b < 1024) return b + " B";
    if(b < 1024*1024) return (b/1024).toFixed(1) + " KB";
    return (b/1024/1024).toFixed(2) + " MB";
  }

  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "uebersicht");

    function build(){
      var body = "";

      /* ═══ ÜBERSICHT ═══ */
      if(tab === "uebersicht"){
        var apps = (window.HalDo && HalDo.Apps && HalDo.Apps.list) ? HalDo.Apps.list() : [];
        var storageKeys = Object.keys(localStorage).filter(function(k){
          return k.indexOf("haldo") === 0 || k.indexOf("HalDo") === 0;
        });
        var storageSize = 0;
        storageKeys.forEach(function(k){
          storageSize += (localStorage.getItem(k) || "").length;
        });

        var uptime = window.HalDo && HalDo.Runtime && HalDo.Runtime.uptime ? HalDo.Runtime.uptime() : 0;
        var uptimeMin = Math.floor(uptime / 60000);
        var uptimeTxt = uptimeMin < 60 ? uptimeMin + " min" : Math.floor(uptimeMin/60) + "h " + (uptimeMin%60) + "m";

        body = '<div class="card"><h3>🖥️ System-Übersicht</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">'
          + '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">APPS</div>'
          + '<div style="font-size:24px;font-weight:900;color:var(--p1)">' + apps.length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(180,120,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">SPEICHER</div>'
          + '<div style="font-size:24px;font-weight:900;color:var(--p3)">' + fmtBytes(storageSize) + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(74,222,128,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">UPTIME</div>'
          + '<div style="font-size:20px;font-weight:900;color:#4ade80">' + uptimeTxt + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(251,191,36,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">VERSION</div>'
          + '<div style="font-size:20px;font-weight:900;color:#fbbf24">v150</div>'
          + '</div>'
          + '</div></div>';

        /* Browser-Info */
        body += '<div class="card"><h3>🌐 Umgebung</h3>'
          + '<div style="font-size:11.5px;line-height:2;color:var(--text-dim)">'
          + '<div>💻 <b>User Agent:</b><br><span style="font-size:10px;color:var(--text-mute);word-break:break-all">' + _esc(navigator.userAgent) + '</span></div>'
          + '<div>🌍 <b>Sprache:</b> ' + _esc(navigator.language) + '</div>'
          + '<div>📱 <b>Plattform:</b> ' + _esc(navigator.platform || "unbekannt") + '</div>'
          + '<div>🎨 <b>Auflösung:</b> ' + screen.width + '×' + screen.height + '</div>'
          + '<div>🕐 <b>Zeitzone:</b> ' + _esc(Intl.DateTimeFormat().resolvedOptions().timeZone) + '</div>'
          + '</div></div>';

      /* ═══ APPS ═══ */
      } else if(tab === "apps"){
        var apps2 = (window.HalDo && HalDo.Apps && HalDo.Apps.list) ? HalDo.Apps.list() : [];

        body = '<div class="card"><h3>📱 App-Manager (' + apps2.length + ')</h3>';
        if(!apps2.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Apps registriert</div>';
        } else {
          apps2.forEach(function(app){
            var name = app.name || app.id || "unbekannt";
            var icon = app.icon || "📦";
            var desc = app.desc || app.description || "";
            body += '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:6px;border-left:3px solid var(--p1)">'
              + '<div style="display:flex;gap:10px;align-items:center">'
              + '<div style="font-size:24px">' + _esc(icon) + '</div>'
              + '<div style="flex:1">'
              + '<div style="font-size:13px;font-weight:900;color:var(--p1)">' + _esc(name) + '</div>'
              + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + _esc(desc) + '</div>'
              + '</div>'
              + '<div style="font-size:20px;color:#4ade80">✓</div>'
              + '</div></div>';
          });
        }
        body += '</div>';

      /* ═══ HEALTH ═══ */
      } else if(tab === "health"){
        var checks = [];

        checks.push({
          name: "HalDo Runtime",
          ok: !!(window.HalDo && HalDo.Runtime),
          msg: window.HalDo && HalDo.Runtime ? "aktiv" : "fehlt"
        });
        checks.push({
          name: "HalDo Store",
          ok: !!(window.HalDo && HalDo.Store),
          msg: window.HalDo && HalDo.Store ? "verfügbar" : "fehlt"
        });
        checks.push({
          name: "HalDo Voice",
          ok: !!(window.HalDo && HalDo.Voice),
          msg: window.HalDo && HalDo.Voice ? "verfügbar" : "nicht geladen"
        });
        checks.push({
          name: "HalDo Notify",
          ok: !!(window.HalDo && HalDo.Notify),
          msg: window.HalDo && HalDo.Notify ? "verfügbar" : "nicht geladen"
        });
        checks.push({
          name: "Speech Recognition",
          ok: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
          msg: (window.SpeechRecognition || window.webkitSpeechRecognition) ? "verfügbar" : "nicht unterstützt"
        });
        checks.push({
          name: "MediaRecorder",
          ok: typeof MediaRecorder !== "undefined",
          msg: typeof MediaRecorder !== "undefined" ? "verfügbar" : "nicht unterstützt"
        });
        checks.push({
          name: "LocalStorage",
          ok: (function(){ try { localStorage.setItem("_test", "1"); localStorage.removeItem("_test"); return true; } catch(e){ return false; } })(),
          msg: "prüfe Schreibzugriff"
        });
        checks.push({
          name: "Clipboard API",
          ok: !!navigator.clipboard,
          msg: navigator.clipboard ? "verfügbar" : "nicht unterstützt"
        });
        checks.push({
          name: "Service Worker",
          ok: "serviceWorker" in navigator,
          msg: "serviceWorker" in navigator ? "verfügbar" : "nicht unterstützt"
        });

        var okCount = checks.filter(function(c){ return c.ok; }).length;
        var pct = Math.round(okCount / checks.length * 100);

        body = '<div class="card"><h3>💚 System-Health</h3>'
          + '<div style="padding:20px;background:linear-gradient(135deg,' + (pct === 100 ? "rgba(74,222,128,.15)" : pct >= 70 ? "rgba(251,191,36,.15)" : "rgba(255,128,128,.15)") + ',rgba(0,229,255,.1));border-radius:14px;text-align:center;margin-bottom:14px;border:1.5px solid ' + (pct === 100 ? "#4ade80" : pct >= 70 ? "#fbbf24" : "#ff8080") + '">'
          + '<div style="font-size:44px">' + (pct === 100 ? "💚" : pct >= 70 ? "💛" : "❤️") + '</div>'
          + '<div style="font-size:38px;font-weight:900;color:' + (pct === 100 ? "#4ade80" : pct >= 70 ? "#fbbf24" : "#ff8080") + ';margin-top:6px">' + pct + '%</div>'
          + '<div style="font-size:11px;color:var(--text-dim);margin-top:4px">' + okCount + ' / ' + checks.length + ' Checks OK</div>'
          + '</div>';
        checks.forEach(function(c){
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
            + '<div><div style="font-size:12px;font-weight:800">' + _esc(c.name) + '</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">' + _esc(c.msg) + '</div></div>'
            + '<div style="font-size:18px">' + (c.ok ? "✅" : "❌") + '</div>'
            + '</div>';
        });
        body += '</div>';

      /* ═══ STORAGE ═══ */
      } else if(tab === "storage"){
        var keys = Object.keys(localStorage).sort();
        var totalSize = 0;
        var rows = [];

        keys.forEach(function(k){
          var v = localStorage.getItem(k) || "";
          var size = v.length;
          totalSize += size;
          rows.push({ key: k, size: size });
        });

        rows.sort(function(a, b){ return b.size - a.size; });

        body = '<div class="card"><h3>💾 Speicher (' + keys.length + ' Einträge · ' + fmtBytes(totalSize) + ')</h3>';
        if(!keys.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Daten gespeichert</div>';
        } else {
          var maxSize = rows[0].size || 1;
          rows.slice(0, 100).forEach(function(r){
            var pct = Math.round(r.size / maxSize * 100);
            body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px">'
              + '<div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:3px">'
              + '<span style="font-weight:800;word-break:break-all;color:var(--p1)">' + _esc(r.key) + '</span>'
              + '<span style="color:var(--text-mute);font-weight:700">' + fmtBytes(r.size) + '</span>'
              + '</div>'
              + '<div style="background:rgba(0,0,0,.4);height:4px;border-radius:2px;overflow:hidden">'
              + '<div style="background:linear-gradient(90deg,var(--p1),var(--p3));height:100%;width:' + pct + '%"></div>'
              + '</div></div>';
          });
        }
        body += '</div>';

      /* ═══ LOGS ═══ */
      } else if(tab === "logs"){
        var logs = store.get("systemLogs", []);
        body = '<div class="card"><h3>📋 System-Logs</h3>'
          + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:10px">Letzte Aktionen im System</div>';
        if(!logs.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Keine Logs</div>';
        } else {
          logs.slice().reverse().forEach(function(l){
            body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;border-left:3px solid var(--p1);font-size:11px">'
              + '<div style="color:var(--text-mute);font-size:10px">' + _esc(l.date) + '</div>'
              + '<div style="color:var(--text-dim);margin-top:2px">' + _esc(l.text) + '</div>'
              + '</div>';
          });
        }
        body += '<button class="btn danger full" id="clearLogs" style="margin-top:10px">🗑️ Logs löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="uebersicht"?" active":"") + '" data-sct="uebersicht">🖥️ Übersicht</button>'
        + '<button class="tab' + (tab==="apps"?" active":"") + '" data-sct="apps">📱 Apps</button>'
        + '<button class="tab' + (tab==="health"?" active":"") + '" data-sct="health">💚 Health</button>'
        + '<button class="tab' + (tab==="storage"?" active":"") + '" data-sct="storage">💾 Storage</button>'
        + '<button class="tab' + (tab==="logs"?" active":"") + '" data-sct="logs">📋 Logs</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-sct]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.sct;
          store.set("tab", tab);
          build();
        });
      });

      var clearLogs = container.querySelector("#clearLogs");
      if(clearLogs) clearLogs.addEventListener("click", function(){
        if(!confirm("Alle Logs löschen?")) return;
        store.set("systemLogs", []);
        build();
      });
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("system-center", { render: render });
  else console.warn("system-center.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 system-center.js geladen");
