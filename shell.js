/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SHELL (v162)
   Sidebar A-Z · Sauberer Homescreen · Sonnensystem-Default
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
     SIDEBAR (funktioniert bereits)
     ═══════════════════════════════════════════════════════════ */
  function renderSidebar(){
    var sb = document.getElementById("haldo-sidebar");
    if(!sb) return;

    var installed = HalDo.Apps.listInstalled();
    var all = HalDo.Apps.listAll();
    var current = HalDo.Apps.current();
    var byCat = HalDo.Apps.listByCategory();

    var html = '';

    /* HEADER */
    html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.08)">'
      + '<div>'
      + '<div style="font-size:16px;font-weight:900;color:var(--p1)">🦚 HalDo AI OS</div>'
      + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + installed.length + ' / ' + all.length + ' Apps</div>'
      + '</div>'
      + '<button id="haldoCloseSb" style="background:rgba(0,0,0,.3);border:none;color:var(--text-dim);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>'
      + '</div>';

    /* SCHNELLZUGRIFF */
    html += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:0 0 6px 4px">📌 Schnellzugriff</div>';
    html += makeLink("home", "🏠", "Home (Sonnensystem)", current === "home");
    html += makeLink("settings", "⚙️", "Einstellungen", current === "settings");

    /* ALLE KATEGORIEN */
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

    /* FOOTER */
    html += '<div style="margin-top:20px;padding-top:12px;border-top:1px solid rgba(255,255,255,.08);text-align:center;font-size:10px;color:var(--text-mute)">'
      + '🦚 HalDo AI OS v162'
      + '</div>';

    sb.innerHTML = html;

    /* EVENTS */
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
     SAUBERER HOMESCREEN — statt Chaos-Grid
     ═══════════════════════════════════════════════════════════ */
  function showWelcome(){
    var content = document.getElementById("haldo-content");
    if(!content) return;
    if(HalDo.Apps.current()) return;

    var installed = HalDo.Apps.listInstalled();
    var all = HalDo.Apps.listAll();
    var titleEl = document.getElementById("haldo-title");
    if(titleEl) titleEl.textContent = "🦚 HalDo AI OS";

    /* Sauberer Homescreen — nur Willkommen + 3 große Aktionen */
    var body = '<div style="min-height:calc(100vh - 100px);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px">'

      /* Logo */
      + '<div style="font-size:96px;line-height:1;margin-bottom:16px;filter:drop-shadow(0 0 40px rgba(0,229,255,.5))">🦚</div>'

      /* Titel */
      + '<div style="font-size:32px;font-weight:900;color:var(--p1);letter-spacing:2px;margin-bottom:6px">HALDO AI OS</div>'
      + '<div style="font-size:12px;color:var(--text-mute);letter-spacing:3px;font-weight:800;margin-bottom:32px">VERSION 162</div>'

      /* Stats */
      + '<div style="display:flex;gap:20px;margin-bottom:32px">'
      + '<div style="text-align:center">'
      + '<div style="font-size:28px;font-weight:900;color:var(--p1)">' + installed.length + '</div>'
      + '<div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;letter-spacing:1px">Apps</div>'
      + '</div>'
      + '<div style="width:1px;background:rgba(255,255,255,.1)"></div>'
      + '<div style="text-align:center">'
      + '<div style="font-size:28px;font-weight:900;color:var(--p3)">8</div>'
      + '<div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;letter-spacing:1px">Themes</div>'
      + '</div>'
      + '<div style="width:1px;background:rgba(255,255,255,.1)"></div>'
      + '<div style="text-align:center">'
      + '<div style="font-size:28px;font-weight:900;color:#4ade80">6</div>'
      + '<div style="font-size:10px;color:var(--text-mute);text-transform:uppercase;letter-spacing:1px">Sprachen</div>'
      + '</div>'
      + '</div>'

      /* Große Aktion-Buttons */
      + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;width:100%;max-width:480px;margin-bottom:20px">'
      + bigBtn("home", "🌟", "Home / Sonnensystem", "Startseite öffnen")
      + bigBtn("ai", "🧠", "AI Chat", "Mit KI sprechen")
      + bigBtn("settings", "⚙️", "Einstellungen", "Alle Optionen")
      + bigBtn("appstore", "🏪", "Alle Apps", "48 Apps durchsuchen")
      + '</div>'

      /* Hinweis */
      + '<div style="font-size:11px;color:var(--text-mute);line-height:1.6;max-width:400px">'
      + '💡 <b>☰ Menü</b> oben links öffnet die komplette App-Liste (A-Z nach Kategorie)'
      + '</div>'

      + '</div>';

    content.innerHTML = body;
    content.scrollTop = 0;

    content.querySelectorAll("[data-open-app]").forEach(function(el){
      el.addEventListener("click", function(e){
        e.preventDefault(); e.stopPropagation();
        HalDo.Apps.open(el.getAttribute("data-open-app"));
      });
    });
  }

  function bigBtn(id, icon, title, desc){
    return '<button type="button" data-open-app="' + _esc(id) + '" style="'
      + 'padding:20px 14px;'
      + 'background:linear-gradient(135deg,rgba(0,229,255,.08),rgba(180,120,255,.08));'
      + 'border:1.5px solid rgba(0,229,255,.2);'
      + 'border-radius:16px;cursor:pointer;color:inherit;font-family:inherit;text-align:left;'
      + 'transition:.2s;'
      + '">'
      + '<div style="font-size:36px;margin-bottom:8px">' + icon + '</div>'
      + '<div style="font-size:13px;font-weight:900;color:var(--p1)">' + title + '</div>'
      + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:4px">' + desc + '</div>'
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

    /* Klick auf Titel → Sonnensystem als Default */
    var titleEl = document.getElementById("haldo-title");
    if(titleEl){
      titleEl.style.cursor = "pointer";
      titleEl.addEventListener("click", function(){
        if(window.HalDoDeskpane) HalDoDeskpane.closeAll();
        if(HalDo.Apps.has("home")) HalDo.Apps.open("home");
        else showWelcome();
      });
    }

    renderSidebar();

    /* ═══════════════════════════════════════════════════════
       WICHTIG: Direkt Sonnensystem als Home öffnen (statt Welcome-Grid!)
       ═══════════════════════════════════════════════════════ */
    setTimeout(function(){
      if(HalDo.Apps.has("home")){
        /* Sonnensystem als Standard öffnen */
        HalDo.Apps.open("home");
      } else {
        showWelcome();
      }
    }, 300);
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

  console.log("🦚 shell.js v162 geladen — Sonnensystem-Default aktiv");
})();
