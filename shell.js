/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SHELL (v154)
   Sidebar · Menü · Navigation
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  /* ═══════════════════════════════════════════════════════════
     SIDEBAR
     ═══════════════════════════════════════════════════════════ */
  function renderSidebar(){
    var sb = document.getElementById("haldo-sidebar");
    if(!sb) return;

    var installed = HalDo.Apps.listInstalled();
    var all = HalDo.Apps.listAll();
    var current = HalDo.Apps.current();
    var missing = all.length - installed.length;

    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.08)">'
      + '<div>'
      + '<div style="font-size:17px;font-weight:900;color:var(--p1)">🦚 HalDo AI OS</div>'
      + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + installed.length + ' installiert' + (missing ? ' · ' + missing + ' geplant' : '') + '</div>'
      + '</div>'
      + '<button id="haldoCloseSb" style="background:rgba(0,0,0,.3);border:none;color:var(--text-dim);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>'
      + '</div>';

    /* ▸ HOME */
    html += sidebarLink({ id: "home", name: "Home", icon: "🏠", category: "system" }, current, true);

    /* ▸ EINSTELLUNGEN (SEPARAT) */
    html += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px 4px">⚙️ Einstellungen</div>';
    ["settings", "theme-hidden", "system-center", "backup", "recovery", "diagnostics", "update"].forEach(function(id){
      var a = HalDo.Apps.get(id);
      if(a) html += sidebarLink(a, current);
    });

    /* ▸ APP-KATEGORIEN */
    var byCat = HalDo.Apps.listByCategory();
    var catKeys = Object.keys(HalDo.Apps.categories).filter(function(k){ return k !== "app"; });

    catKeys.forEach(function(catKey){
      var cat = HalDo.Apps.categories[catKey];
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed && a.category === catKey; }) : [];
      /* Ohne system (oben schon) */
      apps = apps.filter(function(a){ return a.category !== "system"; });
      if(!apps.length) return;

      html += '<div style="font-size:10px;color:' + cat.color + ';font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px 4px">' + cat.icon + ' ' + cat.name + '</div>';
      apps.forEach(function(a){
        html += sidebarLink(a, current);
      });
    });

    /* ▸ FOOTER */
    html += '<div style="margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);text-align:center;font-size:10px;color:var(--text-mute)">'
      + 'v154 · ' + installed.length + '/' + all.length + ' Apps'
      + '</div>';

    sb.innerHTML = html;

    /* Events */
    var cb = sb.querySelector("#haldoCloseSb");
    if(cb) cb.addEventListener("click", closeSidebar);

    sb.querySelectorAll("[data-app-open]").forEach(function(el){
      el.addEventListener("click", function(){
        HalDo.Apps.open(el.dataset.appOpen);
        renderSidebar();
      });
    });
  }

  function sidebarLink(a, current, isHome){
    var isActive = a.id === current;
    return '<button data-app-open="' + _esc(a.id) + '" style="'
      + 'width:100%;padding:10px 12px;'
      + 'background:' + (isActive ? "linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15))" : "transparent") + ';'
      + 'border:' + (isActive ? "1px solid var(--p1)" : "1px solid transparent") + ';'
      + 'border-radius:10px;cursor:pointer;text-align:left;'
      + 'display:flex;align-items:center;gap:10px;color:inherit;font-family:inherit;'
      + 'margin-bottom:2px;transition:.15s">'
      + '<span style="font-size:17px">' + _esc(a.icon) + '</span>'
      + '<span style="font-size:12.5px;font-weight:' + (isActive ? "900" : "700") + ';color:' + (isActive ? "var(--p1)" : "var(--text-dim)") + ';flex:1">' + _esc(a.name) + '</span>'
      + (isActive ? '<span style="font-size:10px;color:var(--p1)">●</span>' : '')
      + '</button>';
  }

  function openSidebar(){
    var sb = document.getElementById("haldo-sidebar");
    var ov = document.getElementById("haldo-overlay");
    if(sb) sb.classList.add("open");
    if(ov) ov.classList.add("open");
    renderSidebar();
  }

  function closeSidebar(){
    var sb = document.getElementById("haldo-sidebar");
    var ov = document.getElementById("haldo-overlay");
    if(sb) sb.classList.remove("open");
    if(ov) ov.classList.remove("open");
  }

  /* ═══════════════════════════════════════════════════════════
     APP-GRID (alle Apps)
     ═══════════════════════════════════════════════════════════ */
  function showAllApps(){
    var content = document.getElementById("haldo-content");
    if(!content) return;

    if(window.HalDoTheme && HalDoTheme.apply){
      HalDoTheme.apply(HalDoTheme.get(), { silent: true });
    }

    var titleEl = document.getElementById("haldo-title");
    if(titleEl) titleEl.textContent = "📱 Alle Apps";

    var all = HalDo.Apps.listAll();
    var installed = all.filter(function(a){ return a.installed; });
    var missing = all.filter(function(a){ return !a.installed; });
    var byCat = HalDo.Apps.listByCategory();

    var body = '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1))">'
      + '<div style="font-size:20px;font-weight:900;color:var(--p1)">📱 Alle Apps</div>'
      + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:6px">'
      + '<b style="color:#4ade80">' + installed.length + ' installiert</b>'
      + (missing.length ? ' · <b style="color:#fbbf24">' + missing.length + ' geplant</b>' : '')
      + ' · ' + all.length + ' gesamt'
      + '</div></div>';

    Object.keys(HalDo.Apps.categories).forEach(function(catKey){
      var cat = HalDo.Apps.categories[catKey];
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
      if(!apps.length) return;

      body += '<div class="card"><h3 style="color:' + cat.color + '">' + cat.icon + ' ' + cat.name + ' <span style="font-size:10px;color:var(--text-mute);font-weight:700">(' + apps.length + ')</span></h3>';
      body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      apps.forEach(function(a){
        body += '<button data-appopen="' + _esc(a.id) + '" style="padding:14px 12px;background:rgba(0,0,0,.2);border:1.5px solid ' + cat.color + '44;border-radius:12px;cursor:pointer;color:inherit;text-align:left;font-family:inherit">'
          + '<div style="font-size:26px;margin-bottom:6px">' + _esc(a.icon) + '</div>'
          + '<div style="font-size:12px;font-weight:900;color:' + cat.color + '">' + _esc(a.name) + '</div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">' + _esc(a.desc) + '</div>'
          + '</button>';
      });
      body += '</div></div>';
    });

    content.innerHTML = body;
    content.scrollTop = 0;

    content.querySelectorAll("[data-appopen]").forEach(function(el){
      el.addEventListener("click", function(){
        HalDo.Apps.open(el.dataset.appopen);
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════ */
  function init(){
    var menuBtn = document.getElementById("haldo-menu");
    if(menuBtn){
      menuBtn.addEventListener("click", function(){
        var sb = document.getElementById("haldo-sidebar");
        if(sb.classList.contains("open")) closeSidebar();
        else openSidebar();
      });
    }

    var ov = document.getElementById("haldo-overlay");
    if(ov) ov.addEventListener("click", closeSidebar);

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeSidebar();
    });

    var titleEl = document.getElementById("haldo-title");
    if(titleEl){
      titleEl.style.cursor = "pointer";
      titleEl.addEventListener("click", showAllApps);
    }

    renderSidebar();

    /* Letzte App oder Home */
    var last = null;
    try { last = localStorage.getItem("haldo:lastApp"); } catch(e){}

    if(last && HalDo.Apps.has(last) && last !== "home"){
      HalDo.Apps.open(last);
    } else if(HalDo.Apps.has("home")){
      HalDo.Apps.open("home");
    } else {
      showAllApps();
    }
  }

  HalDo.Shell = {
    init: init,
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
    renderSidebar: renderSidebar,
    showAllApps: showAllApps,
    welcome: showAllApps
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

  console.log("🦚 shell.js v154 geladen");
})();
