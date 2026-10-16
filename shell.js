/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SHELL (v160)
   Sidebar (ALLE Apps) · Welcome · App-Grid
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
     SIDEBAR — ALLE APPS nach Kategorie
     ═══════════════════════════════════════════════════════════ */
  function renderSidebar(){
    var sb = document.getElementById("haldo-sidebar");
    if(!sb) return;

    var installed = HalDo.Apps.listInstalled();
    var all = HalDo.Apps.listAll();
    var current = HalDo.Apps.current();
    var byCat = HalDo.Apps.listByCategory();

    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.08)">'
      + '<div>'
      + '<div style="font-size:17px;font-weight:900;color:var(--p1)">🦚 HalDo AI OS</div>'
      + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + installed.length + ' / ' + all.length + ' Apps</div>'
      + '</div>'
      + '<button id="haldoCloseSb" style="background:rgba(0,0,0,.3);border:none;color:var(--text-dim);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>'
      + '</div>';

    /* ▸ Schnellzugriff: Home + Einstellungen */
    html += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 4px">Schnellzugriff</div>';
    html += sidebarLink({ id: "home", name: "Home", icon: "🏠" }, current);
    html += sidebarLink({ id: "settings", name: "Einstellungen", icon: "⚙️" }, current);

    /* ▸ Alle Kategorien (inkl. System) */
    Object.keys(HalDo.Apps.categories).forEach(function(catKey){
      if(catKey === "app") return;
      var cat = HalDo.Apps.categories[catKey];
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
      /* Bei system: Home + Settings raus (schon oben) */
      if(catKey === "system"){
        apps = apps.filter(function(a){ return a.id !== "home" && a.id !== "settings"; });
      }
      if(!apps.length) return;

      html += '<div style="font-size:10px;color:' + cat.color + ';font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px 4px">' + cat.icon + ' ' + cat.name + ' <span style="color:var(--text-mute);font-weight:600">(' + apps.length + ')</span></div>';
      apps.forEach(function(a){
        html += sidebarLink(a, current);
      });
    });

    html += '<div style="margin-top:20px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);text-align:center;font-size:10px;color:var(--text-mute)">'
      + '🦚 HalDo AI OS v160'
      + '</div>';

    sb.innerHTML = html;

    var cb = sb.querySelector("#haldoCloseSb");
    if(cb) cb.addEventListener("click", closeSidebar);

    sb.querySelectorAll("[data-app-open]").forEach(function(el){
      el.addEventListener("click", function(){
        HalDo.Apps.open(el.dataset.appOpen);
        renderSidebar();
      });
    });
  }

  function sidebarLink(a, current){
    var isActive = a.id === current;
    return '<button data-app-open="' + _esc(a.id) + '" style="'
      + 'width:100%;padding:9px 12px;'
      + 'background:' + (isActive ? "linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15))" : "transparent") + ';'
      + 'border:' + (isActive ? "1px solid var(--p1)" : "1px solid transparent") + ';'
      + 'border-radius:10px;cursor:pointer;text-align:left;'
      + 'display:flex;align-items:center;gap:10px;color:inherit;font-family:inherit;'
      + 'margin-bottom:2px;transition:.15s">'
      + '<span style="font-size:16px">' + _esc(a.icon) + '</span>'
      + '<span style="font-size:12.5px;font-weight:' + (isActive ? "900" : "700") + ';color:' + (isActive ? "var(--p1)" : "var(--text-dim)") + ';flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(a.name) + '</span>'
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
     WELCOME / HOME
     ═══════════════════════════════════════════════════════════ */
  function showWelcome(){
    var content = document.getElementById("haldo-content");
    if(!content) return;
    if(HalDo.Apps.current()) return;

    var all = HalDo.Apps.listAll();
    var installed = all.filter(function(a){ return a.installed; });
    var byCat = HalDo.Apps.listByCategory();
    var titleEl = document.getElementById("haldo-title");
    if(titleEl) titleEl.textContent = "🦚 HalDo AI OS";

    var body = '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.12),rgba(180,120,255,.12));text-align:center">'
      + '<div style="font-size:56px">🦚</div>'
      + '<div style="font-size:20px;font-weight:900;color:var(--p1);margin-top:8px">Willkommen bei HalDo!</div>'
      + '<div style="font-size:12px;color:var(--text-dim);margin-top:6px">' + installed.length + ' / ' + all.length + ' Apps installiert</div>'
      + '</div>';

    Object.keys(HalDo.Apps.categories).forEach(function(catKey){
      var cat = HalDo.Apps.categories[catKey];
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
      if(!apps.length) return;

      body += '<div class="card"><h3 style="color:' + cat.color + '">' + cat.icon + ' ' + cat.name + ' <span style="font-size:10px;color:var(--text-mute)">(' + apps.length + ')</span></h3>'
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">';
      apps.forEach(function(a){
        body += '<button data-appopen="' + _esc(a.id) + '" style="padding:12px 8px;background:rgba(0,0,0,.2);border:1.5px solid ' + cat.color + '44;border-radius:12px;cursor:pointer;color:inherit;text-align:center;font-family:inherit;transition:.15s">'
          + '<div style="font-size:26px">' + _esc(a.icon) + '</div>'
          + '<div style="font-size:10.5px;font-weight:900;color:' + cat.color + ';margin-top:6px">' + _esc(a.name) + '</div>'
          + '</button>';
      });
      body += '</div></div>';
    });

    content.innerHTML = body;
    content.scrollTop = 0;
    content.querySelectorAll("[data-appopen]").forEach(function(el){
      el.addEventListener("click", function(){ HalDo.Apps.open(el.dataset.appopen); });
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

    renderSidebar();
    showWelcome();
  }

  HalDo.Shell = {
    init: init,
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
    renderSidebar: renderSidebar,
    welcome: showWelcome
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

  console.log("🦚 shell.js v160 geladen");
})();
