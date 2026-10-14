/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SHELL (v151)
   Sidebar · Menü · Welcome-Screen · Navigation
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
     SIDEBAR RENDERN
     ═══════════════════════════════════════════════════════════ */
  function renderSidebar(){
    var sb = document.getElementById("haldo-sidebar");
    if(!sb) return;

    var apps = HalDo.Apps.list();
    var current = HalDo.Apps.current();

    var html = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,.08)">'
      + '<div>'
      + '<div style="font-size:18px;font-weight:900;color:var(--p1)">🦚 HalDo AI OS</div>'
      + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + apps.length + ' Apps installiert</div>'
      + '</div>'
      + '<button id="haldoCloseSb" style="background:rgba(0,0,0,.3);border:none;color:var(--text-dim);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>'
      + '</div>';

    /* System-Bereich (oben) */
    var systemApps = apps.filter(function(a){ return a.category === "system"; });
    var userApps = apps.filter(function(a){ return a.category !== "system"; });

    if(systemApps.length){
      html += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;padding:0 4px">⚙️ System</div>';
      systemApps.forEach(function(a){
        html += appLink(a, current);
      });
    }

    if(userApps.length){
      html += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:16px 0 6px;padding:0 4px">📱 Apps</div>';
      userApps.forEach(function(a){
        html += appLink(a, current);
      });
    }

    if(!apps.length){
      html += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:11.5px">Keine Apps geladen.<br>Erstelle App-Dateien im Ordner.</div>';
    }

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

  function appLink(a, current){
    var isActive = a.id === current;
    return '<button data-app-open="' + _esc(a.id) + '" style="'
      + 'width:100%;padding:11px 12px;background:' + (isActive ? "linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15))" : "transparent") + ';'
      + 'border:' + (isActive ? "1px solid var(--p1)" : "1px solid transparent") + ';'
      + 'border-radius:10px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;color:inherit;font-family:inherit;margin-bottom:3px;transition:.15s'
      + '" onmouseover="this.style.background=\'rgba(255,255,255,.05)\'" onmouseout="this.style.background=\'' + (isActive ? "linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15))" : "transparent") + '\'">'
      + '<span style="font-size:18px">' + _esc(a.icon) + '</span>'
      + '<span style="font-size:12.5px;font-weight:' + (isActive ? "900" : "700") + ';color:' + (isActive ? "var(--p1)" : "var(--text-dim)") + '">' + _esc(a.name) + '</span>'
      + '</button>';
  }

  /* ═══════════════════════════════════════════════════════════
     SIDEBAR ÖFFNEN / SCHLIESSEN
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
     WELCOME-SCREEN (wenn keine App offen)
     ═══════════════════════════════════════════════════════════ */
  function welcomeScreen(){
    var content = document.getElementById("haldo-content");
    if(!content) return;
    if(HalDo.Apps.current()) return;

    var apps = HalDo.Apps.list();
    var titleEl = document.getElementById("haldo-title");
    if(titleEl) titleEl.textContent = "🦚 HalDo AI OS";

    var html = '<div class="card" style="text-align:center">'
      + '<div style="font-size:56px">🦚</div>'
      + '<div style="font-size:20px;font-weight:900;color:var(--p1);margin-top:8px">Willkommen bei HalDo!</div>'
      + '<div style="font-size:12px;color:var(--text-dim);margin-top:6px">' + apps.length + ' Apps bereit</div>'
      + '</div>';

    html += '<div class="card"><h3>📱 Verfügbare Apps</h3>';

    if(!apps.length){
      html += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:12px">'
        + 'Noch keine Apps registriert.<br>Erstelle App-Dateien im HalDo-Ordner.'
        + '</div>';
    } else {
      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      apps.forEach(function(a){
        html += '<button data-app-open="' + _esc(a.id) + '" style="padding:14px;background:rgba(0,0,0,.2);border:1px solid var(--border-soft);border-radius:12px;cursor:pointer;color:inherit;text-align:left;font-family:inherit;transition:.15s" onmouseover="this.style.transform=\'translateY(-2px)\';this.style.borderColor=\'var(--p1)\'" onmouseout="this.style.transform=\'\';this.style.borderColor=\'var(--border-soft)\'">'
          + '<div style="font-size:26px;margin-bottom:6px">' + _esc(a.icon) + '</div>'
          + '<div style="font-size:12px;font-weight:900;color:var(--p1)">' + _esc(a.name) + '</div>'
          + '</button>';
      });
      html += '</div>';
    }
    html += '</div>';

    content.innerHTML = html;

    content.querySelectorAll("[data-app-open]").forEach(function(el){
      el.addEventListener("click", function(){
        HalDo.Apps.open(el.dataset.appOpen);
        renderSidebar();
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════
     INIT
     ═══════════════════════════════════════════════════════════ */
  function init(){
    /* Menu-Button */
    var menuBtn = document.getElementById("haldo-menu");
    if(menuBtn){
      menuBtn.addEventListener("click", function(){
        var sb = document.getElementById("haldo-sidebar");
        if(sb.classList.contains("open")) closeSidebar();
        else openSidebar();
      });
    }

    /* Overlay-Klick schließt */
    var ov = document.getElementById("haldo-overlay");
    if(ov) ov.addEventListener("click", closeSidebar);

    /* ESC schließt Sidebar */
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape") closeSidebar();
    });

    /* Sidebar initial rendern */
    renderSidebar();

    /* Letzte App oder Welcome */
    var last = null;
    try { last = localStorage.getItem("haldo:lastApp"); } catch(e){}

    if(last && HalDo.Apps.has(last)){
      HalDo.Apps.open(last);
    } else {
      var apps = HalDo.Apps.list();
      /* Erste App öffnen falls vorhanden, sonst Welcome */
      if(apps.length > 0){
        /* Bevorzuge "home" falls vorhanden */
        var home = HalDo.Apps.has("home") ? "home" : apps[0].id;
        HalDo.Apps.open(home);
      } else {
        welcomeScreen();
      }
    }
  }

  HalDo.Shell = {
    init: init,
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
    renderSidebar: renderSidebar,
    welcome: welcomeScreen
  };

  /* Auto-Init wenn DOM bereit */
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

  console.log("🦚 shell.js geladen");
})();
