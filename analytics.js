/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — ANALYTICS (v157)
   Nutzungsstatistiken · App-Tracking · Events · Einstellungen
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){ return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]; }); }

  /* ═══════════════════════════════════════════════════════════
     TRACKING
     ═══════════════════════════════════════════════════════════ */
  var events = [];

  function track(eventName, data){
    events.push({
      name: eventName,
      data: data || {},
      time: Date.now(),
      date: new Date().toLocaleString("de-DE")
    });
    if(events.length > 500) events.shift();
    /* In Store speichern (throttled) */
    if(!window._haldoAnalyticsThrottle){
      window._haldoAnalyticsThrottle = setTimeout(function(){
        window._haldoAnalyticsThrottle = null;
        if(HalDo.Store){
          var stored = HalDo.Store.get("analytics:events", []);
          stored = stored.concat(events.slice(-50));
          if(stored.length > 1000) stored = stored.slice(-1000);
          HalDo.Store.set("analytics:events", stored);
        }
        events = [];
      }, 3000);
    }
  }

  /* App-Open automatisch tracken */
  window.addEventListener("haldo:appopen", function(e){
    track("app_open", { id: e.detail.id });
  });

  /* Theme-Wechsel tracken */
  window.addEventListener("haldo:themechange", function(e){
    track("theme_change", { theme: e.detail.theme });
  });

  /* Sprachwechsel tracken */
  window.addEventListener("haldo:langchange", function(e){
    track("lang_change", { lang: e.detail.lang });
  });

  /* ═══════════════════════════════════════════════════════════
     UI
     ═══════════════════════════════════════════════════════════ */
  function render(container, ctx){
    var store = ctx.store;
    var tab = store.get("tab", "overview");

    function build(){
      var body = "";
      var allEvents = HalDo.Store ? HalDo.Store.get("analytics:events", []) : [];
      var sessionEvents = events;

      if(tab === "overview"){
        var appOpens = allEvents.filter(function(e){ return e.name === "app_open"; });
        var themeChanges = allEvents.filter(function(e){ return e.name === "theme_change"; });
        var langChanges = allEvents.filter(function(e){ return e.name === "lang_change"; });

        /* Top-Apps */
        var appCounts = {};
        appOpens.forEach(function(e){
          var id = e.data && e.data.id;
          if(id) appCounts[id] = (appCounts[id] || 0) + 1;
        });
        var topApps = Object.keys(appCounts).sort(function(a, b){ return appCounts[b] - appCounts[a]; }).slice(0, 5);

        body = '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1))">'
          + '<div style="font-size:20px;font-weight:900;color:var(--p1)">📊 Analytics</div>'
          + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:6px">'
          + '<b>' + allEvents.length + '</b> Events aufgezeichnet'
          + '</div></div>';

        body += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">'
          + statCard("📱", "App-Öffnungen", appOpens.length, "var(--p1)")
          + statCard("🎨", "Theme-Wechsel", themeChanges.length, "var(--p3)")
          + statCard("🌍", "Sprach-Wechsel", langChanges.length, "#fbbf24")
          + '</div>';

        if(topApps.length){
          body += '<div class="card"><h3>🏆 Top-Apps</h3>';
          topApps.forEach(function(id, i){
            var app = HalDo.Apps.get(id);
            var name = app ? app.name : id;
            var icon = app ? app.icon : "📦";
            body += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">'
              + '<div style="font-size:12.5px;font-weight:800">' + (i + 1) + '. ' + icon + ' ' + _esc(name) + '</div>'
              + '<div style="font-size:14px;font-weight:900;color:var(--p1)">' + appCounts[id] + 'x</div>'
              + '</div>';
          });
          body += '</div>';
        }

      } else if(tab === "events"){
        body = '<div class="card"><h3>📋 Letzte Events (' + allEvents.length + ')</h3>';
        if(!allEvents.length){
          body += '<div style="color:var(--text-mute);text-align:center;padding:20px">Noch keine Events</div>';
        } else {
          allEvents.slice().reverse().slice(0, 50).forEach(function(e){
            var icon = e.name === "app_open" ? "📱" : e.name === "theme_change" ? "🎨" : e.name === "lang_change" ? "🌍" : "📌";
            body += '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;margin-bottom:4px;font-size:11px">'
              + '<div style="display:flex;justify-content:space-between">'
              + '<span style="font-weight:800">' + icon + ' ' + _esc(e.name) + '</span>'
              + '<span style="color:var(--text-mute)">' + _esc(e.date) + '</span>'
              + '</div>'
              + (e.data && Object.keys(e.data).length ? '<div style="color:var(--text-mute);margin-top:2px">' + _esc(JSON.stringify(e.data)) + '</div>' : '')
              + '</div>';
          });
        }
        body += '</div>';

      } else if(tab === "settings"){
        body = '<div class="card"><h3>⚙️ Einstellungen</h3>'
          + '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px">'
          + '<div style="font-size:11px;color:var(--text-mute);font-weight:700">📊 EVENTS</div>'
          + '<div style="font-size:22px;font-weight:900;color:var(--p1)">' + allEvents.length + '</div>'
          + '</div>'
          + '<div style="padding:12px;background:rgba(0,229,255,.08);border-radius:10px;margin-top:10px;border-left:3px solid var(--p1)">'
          + '<div style="font-size:11px;color:var(--text-dim);line-height:1.5">'
          + 'ℹ️ Analytics läuft <b>lokal</b>. Keine Daten verlassen dein Gerät.'
          + '</div></div>'
          + '<button class="btn danger full" id="anClear" style="margin-top:10px">🗑️ Events löschen</button>'
          + '</div>';
      }

      container.innerHTML =
        '<div class="tabs">'
        + '<button class="tab' + (tab==="overview"?" active":"") + '" data-ant="overview">📊 Übersicht</button>'
        + '<button class="tab' + (tab==="events"?" active":"") + '" data-ant="events">📋 Events</button>'
        + '<button class="tab' + (tab==="settings"?" active":"") + '" data-ant="settings">⚙️</button>'
        + '</div>' + body;

      container.querySelectorAll("[data-ant]").forEach(function(b){
        b.addEventListener("click", function(){
          tab = b.dataset.ant; store.set("tab", tab); build();
        });
      });

      if(tab === "settings"){
        var clr = container.querySelector("#anClear");
        if(clr) clr.addEventListener("click", function(){
          if(!confirm("Alle Analytics-Events löschen?")) return;
          HalDo.Store.set("analytics:events", []);
          events = [];
          build();
        });
      }
    }

    function statCard(icon, label, val, col){
      return '<div style="padding:12px;background:rgba(0,0,0,.2);border-radius:10px;border-left:3px solid ' + col + '">'
        + '<div style="font-size:18px">' + icon + '</div>'
        + '<div style="font-size:9.5px;color:var(--text-mute);font-weight:800;text-transform:uppercase;margin-top:4px">' + _esc(label) + '</div>'
        + '<div style="font-size:18px;font-weight:900;color:' + col + '">' + val + '</div>'
        + '</div>';
    }

    build();
  }

  HalDoApp("analytics", { name: "Analytics", icon: "📊", render: render, category: "system" });
  console.log("🦚 analytics.js v157 geladen");
})();
