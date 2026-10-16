/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SHELL (v171)
   Sidebar A-Z · Homescreen-Auswahl · Welcome
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
    var byCat = HalDo.Apps.listByCategory();

    var html = '';

    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.08)">'
      + '<div>'
      + '<div style="font-size:16px;font-weight:900;color:var(--p1)">🦚 HalDo AI OS</div>'
      + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + installed.length + ' / ' + all.length + ' Apps</div>'
      + '</div>'
      + '<button id="haldoCloseSb" style="background:rgba(0,0,0,.3);border:none;color:var(--text-dim);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>'
      + '</div>';

    html += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 4px">📌 Schnellzugriff</div>';
    html += makeLink("home", "🏠", "Home", current === "home");
    html += makeLink("settings", "⚙️", "Einstellungen", current === "settings");

    var catOrder = ["kommunikation", "produktivitaet", "gesundheit", "lifestyle", "werkzeuge", "system"];

    catOrder.forEach(function(catKey){
      var cat = HalDo.Apps.categories[catKey];
      if(!cat) return;
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
      if(catKey === "system"){
        apps = apps.filter(function(a){ return a.id !== "home" && a.id !== "settings"; });
      }
      if(!apps.length) return;

      apps.sort(function(a, b){ return (a.name || "").localeCompare(b.name || "", "de"); });

      html += '<div style="font-size:10px;color:' + cat.color + ';font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px 4px">'
        + cat.icon + ' ' + cat.name + ' <span style="color:var(--text-mute);font-weight:600">(' + apps.length + ')</span>'
        + '</div>';

      apps.forEach(function(a){
        html += makeLink(a.id, a.icon, a.name, a.id === current);
      });
    });

    html += '<div style="margin-top:20px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);text-align:center;font-size:10px;color:var(--text-mute)">'
      + '🦚 HalDo AI OS v171'
      + '</div>';

    sb.innerHTML = html;

    var cb = sb.querySelector("#haldoCloseSb");
    if(cb) cb.addEventListener("click", function(e){
      e.preventDefault(); e.stopPropagation(); closeSidebar();
    });

    sb.querySelectorAll("[data-open-app]").forEach(function(el){
      el.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        var id = el.getAttribute("data-open-app");
        closeSidebar();
        setTimeout(function(){
          try { HalDo.Apps.open(id); }
          catch(err){ console.error("Öffnen fehlgeschlagen:", err); }
        }, 150);
      });
    });
  }

  function makeLink(id, icon, name, isActive){
    return '<button type="button" data-open-app="' + _esc(id) + '" style="'
      + 'width:100%;padding:10px 12px;'
      + 'background:' + (isActive ? "linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15))" : "transparent") + ';'
      + 'border:' + (isActive ? "1px solid var(--p1)" : "1px solid transparent") + ';'
      + 'border-radius:9px;cursor:pointer;text-align:left;'
      + 'display:flex;align-items:center;gap:10px;color:inherit;font-family:inherit;'
      + 'margin-bottom:2px;transition:.15s;'
      + 'font-size:12.5px;font-weight:' + (isActive ? "900" : "700") + ';'
      + 'color:' + (isActive ? "var(--p1)" : "var(--text-dim)") + '">'
      + '<span style="font-size:16px;flex-shrink:0">' + _esc(icon) + '</span>'
      + '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + _esc(name) + '</span>'
      + '</button>';
  }

  /* ═══════════════════════════════════════════════════════════
     OPEN / CLOSE
     ═══════════════════════════════════════════════════════════ */
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
     APP-GRID (Kacheln)
     ═══════════════════════════════════════════════════════════ */
  function showAllAppsGrid(){
    var content = document.getElementById("haldo-content");
    if(!content) return;

    var titleEl = document.getElementById("haldo-title");
    if(titleEl) titleEl.textContent = "📱 Alle Apps";

    var all = HalDo.Apps.listAll();
    var installed = all.filter(function(a){ return a.installed; });
    var byCat = HalDo.Apps.listByCategory();

    var body = '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1))">'
      + '<div style="font-size:20px;font-weight:900;color:var(--p1)">📱 Alle Apps</div>'
      + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:6px">'
      + '<b style="color:#4ade80">' + installed.length + ' installiert</b> · ' + all.length + ' gesamt'
      + '</div></div>';

    var catOrder = ["kommunikation", "produktivitaet", "gesundheit", "lifestyle", "werkzeuge", "system"];
    catOrder.forEach(function(catKey){
      var cat = HalDo.Apps.categories[catKey];
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
      if(!apps.length) return;
      apps.sort(function(a, b){ return (a.name || "").localeCompare(b.name || "", "de"); });

      body += '<div class="card"><h3 style="color:' + cat.color + '">' + cat.icon + ' ' + cat.name + ' <span style="font-size:10px;color:var(--text-mute)">(' + apps.length + ')</span></h3>'
        + '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px">';
      apps.forEach(function(a){
        body += '<button type="button" data-open-app="' + _esc(a.id) + '" style="padding:12px 8px;background:rgba(0,0,0,.2);border:1.5px solid ' + cat.color + '44;border-radius:12px;cursor:pointer;color:inherit;text-align:center;font-family:inherit;transition:.15s">'
          + '<div style="font-size:26px">' + _esc(a.icon) + '</div>'
          + '<div style="font-size:10.5px;font-weight:900;color:' + cat.color + ';margin-top:6px">' + _esc(a.name) + '</div>'
          + '</button>';
      });
      body += '</div></div>';
    });

    content.innerHTML = body;
    content.scrollTop = 0;
    content.querySelectorAll("[data-open-app]").forEach(function(el){
      el.addEventListener("click", function(e){
        e.preventDefault();
        HalDo.Apps.open(el.getAttribute("data-open-app"));
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     WELCOME (Kacheln Variante)
     ═══════════════════════════════════════════════════════════ */
  function showWelcome(){
    showAllAppsGrid();
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════ */
  function init(){
    var menuBtn = document.getElementById("haldo-menu");
    if(menuBtn){
      var newBtn = menuBtn.cloneNode(true);
      menuBtn.parentNode.replaceChild(newBtn, menuBtn);
      newBtn.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        var sb = document.getElementById("haldo-sidebar");
        if(sb && sb.classList.contains("open")) closeSidebar();
        else openSidebar();
      });
    }

    var ov = document.getElementById("haldo-overlay");
    if(ov){
      var newOv = ov.cloneNode(true);
      ov.parentNode.replaceChild(newOv, ov);
      newOv.addEventListener("click", closeSidebar);
    }

    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeSidebar();
    });

    var titleEl = document.getElementById("haldo-title");
    if(titleEl){
      titleEl.style.cursor = "pointer";
      titleEl.addEventListener("click", function(){
        if(window.HalDoDeskpane) HalDoDeskpane.closeAll();
        var style = HalDo.Store.get("homeStyle", "solar");
        if(style === "grid"){
          showAllAppsGrid();
        } else if(HalDo.Apps.has("home")){
          HalDo.Apps.open("home");
        } else {
          showWelcome();
        }
      });
    }

    renderSidebar();

    /* ═══════════════════════════════════════════════════════
       HOMESCREEN-AUSWAHL
       ═══════════════════════════════════════════════════════ */
    setTimeout(function(){
      var style = HalDo.Store.get("homeStyle", "solar");

      if(style === "solar" && HalDo.Apps.has("home")){
        HalDo.Apps.open("home");
      } else if(style === "dashboard" && HalDo.Apps.has("home")){
        HalDo.Apps.open("home");
      } else if(style === "combined" && HalDo.Apps.has("home")){
        HalDo.Apps.open("home");
      } else if(style === "grid"){
        showAllAppsGrid();
      } else {
        if(HalDo.Apps.has("home")) HalDo.Apps.open("home");
        else showWelcome();
      }
    }, 300);
  }

  HalDo.Shell = {
    init: init,
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
    renderSidebar: renderSidebar,
    welcome: showWelcome,
    showAllApps: showAllAppsGrid
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

  console.log("🦚 shell.js v171 geladen — Homescreen-Auswahl aktiv");
})();
