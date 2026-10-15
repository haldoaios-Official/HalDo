/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — SHELL (v152)
   Sidebar · Welcome · App-Grid · Navigation
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
      + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">' + installed.length + ' installiert · ' + missing + ' geplant</div>'
      + '</div>'
      + '<button id="haldoCloseSb" style="background:rgba(0,0,0,.3);border:none;color:var(--text-dim);width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px">✕</button>'
      + '</div>';

    /* ▸ Alle Apps Button */
    html += '<button id="haldoShowAll" style="width:100%;padding:12px;background:linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15));border:1px solid var(--p1);border-radius:12px;color:var(--p1);font-weight:900;cursor:pointer;font-family:inherit;font-size:12.5px;margin-bottom:14px;text-align:left;display:flex;justify-content:space-between;align-items:center">'
      + '<span>📱 Alle Apps anzeigen</span>'
      + '<span style="font-size:10px;color:var(--text-mute)">' + all.length + ' ›</span>'
      + '</button>';

    /* ▸ Installierte Apps nach Kategorie */
    var byCat = HalDo.Apps.listByCategory();

    Object.keys(HalDo.Apps.categories).forEach(function(catKey){
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
      if(!apps.length) return;

      html += '<div style="font-size:10px;color:var(--text-mute);font-weight:800;text-transform:uppercase;letter-spacing:1px;margin:14px 0 6px 4px">' + HalDo.Apps.categories[catKey] + '</div>';
      apps.forEach(function(a){
        html += appLink(a, current);
      });
    });

    if(!installed.length){
      html += '<div style="color:var(--text-mute);text-align:center;padding:20px;font-size:11.5px">Keine Apps geladen.</div>';
    }

    /* ▸ Footer */
    html += '<div style="margin-top:24px;padding-top:14px;border-top:1px solid rgba(255,255,255,.08);font-size:10px;color:var(--text-mute);text-align:center">'
      + 'v151 · <span id="sbCount">' + installed.length + '/' + all.length + '</span> Apps'
      + '</div>';

    sb.innerHTML = html;

    var cb = sb.querySelector("#haldoCloseSb");
    if(cb) cb.addEventListener("click", closeSidebar);

    var sa = sb.querySelector("#haldoShowAll");
    if(sa) sa.addEventListener("click", function(){
      if(HalDo.Apps.has("home")){
        HalDo.Apps.open("home");
        closeSidebar();
      } else {
        closeSidebar();
        showAllGrid();
      }
    });

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
      + 'width:100%;padding:10px 12px;background:' + (isActive ? "linear-gradient(135deg,rgba(0,229,255,.15),rgba(180,120,255,.15))" : "transparent") + ';'
      + 'border:' + (isActive ? "1px solid var(--p1)" : "1px solid transparent") + ';'
      + 'border-radius:10px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:10px;color:inherit;font-family:inherit;margin-bottom:2px;transition:.15s">'
      + '<span style="font-size:17px">' + _esc(a.icon) + '</span>'
      + '<span style="font-size:12.5px;font-weight:' + (isActive ? "900" : "700") + ';color:' + (isActive ? "var(--p1)" : "var(--text-dim)") + ';flex:1">' + _esc(a.name) + '</span>'
      + (isActive ? '<span style="font-size:10px;color:var(--p1)">●</span>' : '')
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
     WELCOME / APP-GRID (alle Apps)
     ═══════════════════════════════════════════════════════════ */
  function showAllGrid(){
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

    var body = '<div class="card" style="background:linear-gradient(135deg,rgba(0,229,255,.1),rgba(180,120,255,.1))">'
      + '<div style="font-size:22px;font-weight:900;color:var(--p1)">📱 Alle Apps</div>'
      + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:6px">'
      + '<b style="color:#4ade80">' + installed.length + ' installiert</b> · '
      + '<b style="color:#fbbf24">' + missing.length + ' geplant</b> · '
      + '<b>' + all.length + ' gesamt</b>'
      + '</div>'
      + '</div>';

    /* Filter */
    var filter = HalDo.Store.get("appsFilter", "all");

    body += '<div class="card" style="padding:10px">'
      + '<div style="display:flex;gap:6px;overflow-x:auto">'
      + filterBtn("all", "Alle (" + all.length + ")", filter)
      + filterBtn("installed", "✅ Installiert (" + installed.length + ")", filter)
      + filterBtn("missing", "⏳ Geplant (" + missing.length + ")", filter)
      + '</div></div>';

    /* Nach Kategorie */
    var byCat = HalDo.Apps.listByCategory();
    var shown = 0;

    Object.keys(HalDo.Apps.categories).forEach(function(catKey){
      var apps = byCat[catKey] || [];
      if(filter === "installed") apps = apps.filter(function(a){ return a.installed; });
      if(filter === "missing") apps = apps.filter(function(a){ return !a.installed; });
      if(!apps.length) return;

      shown += apps.length;
      body += '<div class="card"><h3>' + HalDo.Apps.categories[catKey] + ' <span style="font-size:10px;color:var(--text-mute);font-weight:700">(' + apps.length + ')</span></h3>';
      body += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      apps.forEach(function(a){ body += appCard(a); });
      body += '</div></div>';
    });

    if(!shown){
      body += '<div class="card" style="text-align:center;padding:30px;color:var(--text-mute);font-size:12px">'
        + (filter === "installed" ? "Keine Apps installiert" : filter === "missing" ? "Alle Apps installiert! 🎉" : "Keine Apps")
        + '</div>';
    }

    container_setHTML(content, body);

    content.querySelectorAll("[data-filter]").forEach(function(el){
      el.addEventListener("click", function(){
        HalDo.Store.set("appsFilter", el.dataset.filter);
        showAllGrid();
      });
    });

    content.querySelectorAll("[data-appopen]").forEach(function(el){
      el.addEventListener("click", function(){
        var id = el.dataset.appopen;
        if(el.dataset.installed === "1"){
          HalDo.Apps.open(id);
        } else {
          if(HalDo.Notify) HalDo.Notify.warn("⏳ " + el.dataset.name + " ist noch in Planung!", { app: "system", duration: 3000 });
        }
      });
    });
  }

  function container_setHTML(el, html){ el.innerHTML = html; el.scrollTop = 0; }

  function filterBtn(id, label, active){
    var isActive = id === active;
    return '<button data-filter="' + id + '" style="padding:8px 14px;background:' + (isActive ? "linear-gradient(135deg,var(--p1),var(--p3))" : "rgba(0,0,0,.2)") + ';color:' + (isActive ? "#000" : "var(--text-dim)") + ';border:1px solid ' + (isActive ? "transparent" : "var(--border-soft)") + ';border-radius:10px;font-weight:900;font-size:11px;cursor:pointer;font-family:inherit;white-space:nowrap">' + _esc(label) + '</button>';
  }

  function appCard(a){
    var ok = a.installed;
    return '<button data-appopen="' + _esc(a.id) + '" data-installed="' + (ok ? "1" : "0") + '" data-name="' + _esc(a.name) + '" style="padding:14px 12px;background:' + (ok ? "rgba(0,0,0,.2)" : "rgba(0,0,0,.1)") + ';border:1.5px solid ' + (ok ? "var(--p1)" : "rgba(255,255,255,.06)") + ';border-radius:12px;cursor:pointer;color:inherit;text-align:left;font-family:inherit;transition:.15s;position:relative;opacity:' + (ok ? "1" : ".5") + '">'
      + '<div style="font-size:26px;margin-bottom:6px">' + _esc(a.icon) + '</div>'
      + '<div style="font-size:12px;font-weight:900;color:' + (ok ? "var(--p1)" : "var(--text-dim)") + '">' + _esc(a.name) + '</div>'
      + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px;line-height:1.4">' + _esc(a.desc) + '</div>'
      + (ok
        ? '<div style="position:absolute;top:8px;right:8px;font-size:11px">✅</div>'
        : '<div style="position:absolute;top:8px;right:8px;font-size:11px">⏳</div>'
      )
      + '</button>';
  }

  function welcomeScreen(){
    showAllGrid();
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

    /* Title-Klick → Alle Apps */
    var titleEl = document.getElementById("haldo-title");
    if(titleEl){
      titleEl.style.cursor = "pointer";
      titleEl.addEventListener("click", function(){
        showAllGrid();
      });
    }

    renderSidebar();

    /* Letzte App öffnen oder Home oder Welcome */
    var last = null;
    try { last = localStorage.getItem("haldo:lastApp"); } catch(e){}

    if(last && HalDo.Apps.has(last) && last !== "home"){
      HalDo.Apps.open(last);
    } else if(HalDo.Apps.has("home")){
      HalDo.Apps.open("home");
    } else {
      showAllGrid();
    }
  }

  HalDo.Shell = {
    init: init,
    openSidebar: openSidebar,
    closeSidebar: closeSidebar,
    renderSidebar: renderSidebar,
    welcome: welcomeScreen,
    showAllApps: showAllGrid
  };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", function(){ setTimeout(init, 100); });
  } else {
    setTimeout(init, 100);
  }

  console.log("🦚 shell.js geladen — mit App-Grid");
})();
