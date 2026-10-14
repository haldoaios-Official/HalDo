/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — DIAGNOSTICS (v150)
   Systemdiagnose · Performance · Fehler · Report
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
    var tab = store.get("tab", "overview");

    function build(){
      var body = "";

      /* ═══ ÜBERSICHT ═══ */
      if(tab === "overview"){
        var memInfo = performance.memory ? {
          used: performance.memory.usedJSHeapSize,
          total: performance.memory.totalJSHeapSize,
          limit: performance.memory.jsHeapSizeLimit
        } : null;

        var perfEntries = performance.getEntriesByType("navigation");
        var loadTime = perfEntries.length ? Math.round(perfEntries[0].duration) : 0;
        var domReady = perfEntries.length ? Math.round(perfEntries[0].domContentLoadedEventEnd) : 0;

        var totalStorage = 0;
        Object.keys(localStorage).forEach(function(k){
          totalStorage += (localStorage.getItem(k) || "").length;
        });

        body = '<div class="card"><h3>🩺 System-Diagnose</h3>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';

        if(memInfo){
          var memPct = Math.round(memInfo.used / memInfo.limit * 100);
          body += '<div style="padding:12px;background:rgba(0,229,255,.1);border-radius:10px">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">JS-HEAP</div>'
            + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + fmtBytes(memInfo.used) + '</div>'
            + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">von ' + fmtBytes(memInfo.limit) + '</div>'
            + '</div>';
        }

        body += '<div style="padding:12px;background:rgba(180,120,255,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">LADEZEIT</div>'
          + '<div style="font-size:20px;font-weight:900;color:var(--p3)">' + loadTime + ' ms</div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">DOM: ' + domReady + ' ms</div>'
          + '</div>'

          + '<div style="padding:12px;background:rgba(74,222,128,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">SPEICHER</div>'
          + '<div style="font-size:20px;font-weight:900;color:#4ade80">' + fmtBytes(totalStorage) + '</div>'
          + '</div>'

          + '<div style="padding:12px;background:rgba(251,191,36,.1);border-radius:10px">'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">VERBINDUNG</div>'
          + '<div style="font-size:14px;font-weight:900;color:#fbbf24">' + (navigator.onLine ? "🟢 Online" : "🔴 Offline") + '</div>'
          + (navigator.connection ? '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">' + _esc(navigator.connection.effectiveType || "?") + '</div>' : '')
          + '</div>'

          + '</div></div>';

        /* Quick Test */
        body += '<div class="card"><h3>⚡ Quick-Test</h3>'
          + '<button class="btn full" id="runDiag">🔬 Diagnose starten</button>'
          + '<div id="diagResult" style="margin-top:12px"></div>'
          + '</div>';

      /* ═══ PERFORMANCE ═══ */
      } else if(tab === "performance"){
        var perf = performance.getEntriesByType("resource") || [];
        var byType = { script: 0, css: 0, img: 0, fetch: 0, other: 0 };
        var slowest = [];

        perf.forEach(function(p){
          var t = p.initiatorType || "other";
          if(byType[t] === undefined) byType[t] = 0;
          byType[t]++;
          if(p.duration > 50) slowest.push(p);
        });

        slowest.sort(function(a, b){ return b.duration - a.duration; });

        body = '<div class="card"><h3>⚡ Performance</h3>'
          + '<div style="font-size:10px;color:var(--text-mute);font-weight:700;margin-bottom:8px">RESSOURCEN (' + perf.length + ')</div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px">';

        Object.keys(byType).forEach(function(k){
          if(!byType[k]) return;
          var icons = { script: "📜", css: "🎨", img: "🖼️", fetch: "🌐", other: "📦" };
          body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px">'
            + '<div style="font-size:10px;color:var(--text-mute);font-weight:700">' + (icons[k] || "📦") + ' ' + k.toUpperCase() + '</div>'
            + '<div style="font-size:16px;font-weight:900;color:var(--p1)">' + byType[k] + '</div>'
            + '</div>';
        });
        body += '</div>';

        if(slowest.length){
          body += '<div style="font-size:10px;color:var(--text-mute);font-weight:700;margin-bottom:6px">LANGSAMSTE (>50ms)</div>';
          slowest.slice(0, 8).forEach(function(p){
            var name = (p.name || "").split("/").pop().substring(0, 40);
            body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;font-size:11px">'
              + '<span style="color:var(--text-dim);word-break:break-all">' + _esc(name) + '</span>'
              + '<span style="color:' + (p.duration > 500 ? "#ff8080" : "#fbbf24") + ';font-weight:800">' + Math.round(p.duration) + 'ms</span>'
              + '</div>';
          });
        } else {
          body += '<div style="color:#4ade80;font-size:11.5px;text-align:center;padding:14px">✅ Keine langsamen Ressourcen</div>';
        }
        body += '</div>';

      /* ═══ FEHLER ═══ */
      } else if(tab === "errors"){
        var errors = store.get("errorLog", []);

        body = '<div class="card"><h3>🐛 Fehler-Log (' + errors.length + ')</h3>';

        if(!window._haldoErrorHook){
          window._haldoErrorHook = true;
          window.addEventListener("error", function(e){
            var errs = store.get("errorLog", []);
            errs.push({
              msg: e.message,
              file: e.filename ? e.filename.split("/").pop() : "",
              line: e.lineno,
              date: new Date().toLocaleString("de-DE")
            });
            if(errs.length > 50) errs.shift();
            store.set("errorLog", errs);
          });
          window.addEventListener("unhandledrejection", function(e){
            var errs = store.get("errorLog", []);
            errs.push({
              msg: String(e.reason),
              file: "Promise",
              line: 0,
              date: new Date().toLocaleString("de-DE")
            });
            if(errs.length > 50) errs.shift();
            store.set("errorLog", errs);
          });
        }

        if(!errors.length){
          body += '<div style="color:#4ade80;text-align:center;padding:24px;font-size:13px;font-weight:800">✅ Keine Fehler protokolliert</div>';
        } else {
          errors.slice().reverse().forEach(function(e){
            body += '<div style="padding:10px;background:rgba(255,128,128,.1);border-radius:8px;margin-bottom:6px;border-left:3px solid #ff8080">'
              + '<div style="font-size:10px;color:var(--text-mute);margin-bottom:4px">' + _esc(e.date) + (e.file ? " · " + _esc(e.file) + (e.line ? ":" + e.line : "") : "") + '</div>'
              + '<div style="font-size:11.5px;color:#ff8080;word-break:break-word">' + _esc(e.msg) + '</div>'
              + '</div>';
          });
          body += '<button class="btn danger full" id="clearErr" style="margin-top:10px">🗑️ Fehler-Log leeren</button>';
        }
        body += '</div>';

      /* ═══ REPORT ═══ */
      } else if(tab === "report"){
        body = '<div class="card"><h3>📄 Diagnose-Report</h3>'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.65;margin-bottom:14px">'
          + 'Erstellt einen vollständigen Report mit Systeminfo für Fehlerberichte.'
          + '</div>'
          + '<button class="btn full" id="genReport">📋 Report generieren</button>'
          + '<button class="btn sec full" id="copyReport" style="margin-top:8px;display:none">📎 Report kopieren</button>'
          + '<div id="reportOut" style="margin-top:12px"></div>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="overview"?" active":"") + '" data-dt="overview">🩺 Übersicht</button>'
        + '<button class="tab' + (tab==="performance"?" active":"") + '" data-dt="performance">⚡ Performance</button>'
        + '<button class="tab' + (tab==="errors"?" active":"") + '" data-dt="errors">🐛 Fehler</button>'
        + '<button class="tab' + (tab==="report"?" active":"") + '" data-dt="report">📄 Report</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-dt]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.dt;
          store.set("tab", tab);
          build();
        });
      });

      /* Quick-Test */
      var rd = container.querySelector("#runDiag");
      if(rd) rd.addEventListener("click", function(){
        var res = container.querySelector("#diagResult");
        res.innerHTML = '<div style="text-align:center;padding:14px;color:var(--text-mute)">🔬 Test läuft...</div>';

        var tests = [
          { n: "LocalStorage", f: function(){ try { localStorage.setItem("_t","1"); localStorage.removeItem("_t"); return true; } catch(e){ return false; } } },
          { n: "JSON Parser", f: function(){ try { JSON.parse(JSON.stringify({a:1})); return true; } catch(e){ return false; } } },
          { n: "Promise Support", f: function(){ return typeof Promise !== "undefined"; } },
          { n: "Fetch API", f: function(){ return typeof fetch !== "undefined"; } },
          { n: "HalDo Runtime", f: function(){ return !!(window.HalDo && HalDo.Runtime); } },
          { n: "HalDo Store", f: function(){ return !!(window.HalDo && HalDo.Store); } },
          { n: "Intl API", f: function(){ try { new Intl.DateTimeFormat("de-DE"); return true; } catch(e){ return false; } } },
          { n: "Canvas", f: function(){ try { return !!document.createElement("canvas").getContext("2d"); } catch(e){ return false; } } }
        ];

        setTimeout(function(){
          var out = '<div style="display:flex;flex-direction:column;gap:4px">';
          tests.forEach(function(t){
            var ok = false;
            try { ok = t.f(); } catch(e){ ok = false; }
            out += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;display:flex;justify-content:space-between;align-items:center">'
              + '<div style="font-size:11.5px;font-weight:700">' + _esc(t.n) + '</div>'
              + '<div style="font-size:16px">' + (ok ? "✅" : "❌") + '</div>'
              + '</div>';
          });
          out += '</div>';
          var okCount = tests.filter(function(t){ try { return t.f(); } catch(e){ return false; } }).length;
          var pct = Math.round(okCount / tests.length * 100);
          var col = pct === 100 ? "#4ade80" : pct >= 60 ? "#fbbf24" : "#ff8080";
          out = '<div style="padding:12px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:10px;text-align:center">'
            + '<div style="font-size:22px;font-weight:900;color:' + col + '">' + okCount + '/' + tests.length + ' OK</div>'
            + '<div style="font-size:10.5px;color:var(--text-mute)">' + pct + '%</div>'
            + '</div>' + out;
          res.innerHTML = out;
        }, 400);
      });

      var ce = container.querySelector("#clearErr");
      if(ce) ce.addEventListener("click", function(){
        if(!confirm("Fehler-Log leeren?")) return;
        store.set("errorLog", []);
        build();
      });

      var gr = container.querySelector("#genReport");
      if(gr) gr.addEventListener("click", function(){
        var mem = performance.memory ? fmtBytes(performance.memory.usedJSHeapSize) : "N/A";
        var totalStorage = 0;
        var storKeys = Object.keys(localStorage).filter(function(k){
          return k.indexOf("haldo") === 0 || k.indexOf("HalDo") === 0;
        });
        storKeys.forEach(function(k){ totalStorage += (localStorage.getItem(k) || "").length; });
        var errors = store.get("errorLog", []);
        var apps = (window.HalDo && HalDo.Apps && HalDo.Apps.list) ? HalDo.Apps.list() : [];

        var report = [
          "═══ HALDO AI OS — DIAGNOSE-REPORT ═══",
          "Datum: " + new Date().toLocaleString("de-DE"),
          "Version: v150",
          "",
          "─── SYSTEM ───",
          "User Agent: " + navigator.userAgent,
          "Plattform: " + (navigator.platform || "?"),
          "Sprache: " + navigator.language,
          "Auflösung: " + screen.width + "×" + screen.height,
          "Online: " + (navigator.onLine ? "ja" : "nein"),
          "JS-Heap: " + mem,
          "",
          "─── HALDO ───",
          "Apps registriert: " + apps.length,
          "Storage Keys: " + storKeys.length,
          "Storage Größe: " + fmtBytes(totalStorage),
          "Fehler im Log: " + errors.length,
          "",
          "─── FEHLER (letzte 10) ───"
        ];

        if(errors.length){
          errors.slice(-10).forEach(function(e){
            report.push("• [" + e.date + "] " + e.msg + (e.file ? " (" + e.file + ":" + e.line + ")" : ""));
          });
        } else {
          report.push("Keine Fehler protokolliert ✅");
        }

        report.push("");
        report.push("═══ ENDE REPORT ═══");

        var txt = report.join("\n");
        var out = container.querySelector("#reportOut");
        out.innerHTML = '<pre style="padding:14px;background:rgba(0,0,0,.3);border-radius:10px;font-size:10px;line-height:1.5;color:var(--text-dim);white-space:pre-wrap;word-break:break-word;max-height:400px;overflow:auto">' + _esc(txt) + '</pre>';

        var cb = container.querySelector("#copyReport");
        cb.style.display = "block";
        cb.onclick = function(){
          if(navigator.clipboard){
            navigator.clipboard.writeText(txt).then(function(){
              if(window.HalDo.Notify) HalDo.Notify.success("Report kopiert", { app: "diagnostics" });
            });
          }
        };
      });
    }

    build();
  }

  if(window.HalDoApp) HalDoApp("diagnostics", { render: render });
  else console.warn("diagnostics.js: HalDoApp nicht verfügbar");
})();

console.log("🦚 diagnostics.js geladen");
