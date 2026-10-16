/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HOME (v162) · SONNENSYSTEM
   Sterne · Sonne · Planeten · Klick → AI Chat / Kategorie
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  function injectStyles(){
    if(document.getElementById("haldoSolarStyle")) return;
    var st = document.createElement("style");
    st.id = "haldoSolarStyle";
    st.textContent = `
      #solarSystem {
        position: relative;
        width: 100%;
        height: calc(100vh - 120px);
        min-height: 500px;
        overflow: hidden;
        border-radius: 16px;
        background: radial-gradient(ellipse at center, #0a0f1a 0%, #050810 60%, #000 100%);
      }
      .star {
        position: absolute;
        background: #fff;
        border-radius: 50%;
        animation: twinkle 3s infinite ease-in-out;
      }
      @keyframes twinkle {
        0%, 100% { opacity: .3; }
        50% { opacity: 1; }
      }
      .sun {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: radial-gradient(circle at 35% 35%, #fff5c2 0%, #ffb700 35%, #ff6a00 70%, #c92a00 100%);
        box-shadow:
          0 0 40px rgba(255, 183, 0, .8),
          0 0 80px rgba(255, 106, 0, .6),
          0 0 140px rgba(255, 106, 0, .3),
          inset -8px -8px 20px rgba(180, 60, 0, .5);
        cursor: pointer;
        animation: sunPulse 4s ease-in-out infinite;
        z-index: 10;
        transition: transform .3s;
      }
      .sun:hover { transform: translate(-50%, -50%) scale(1.15); }
      .sun:active { transform: translate(-50%, -50%) scale(1.05); }
      @keyframes sunPulse {
        0%, 100% { box-shadow: 0 0 40px rgba(255,183,0,.8), 0 0 80px rgba(255,106,0,.6), 0 0 140px rgba(255,106,0,.3), inset -8px -8px 20px rgba(180,60,0,.5); }
        50% { box-shadow: 0 0 60px rgba(255,183,0,1), 0 0 120px rgba(255,106,0,.8), 0 0 200px rgba(255,106,0,.4), inset -8px -8px 20px rgba(180,60,0,.5); }
      }
      .sun-label {
        position: absolute;
        top: calc(50% + 62px);
        left: 50%;
        transform: translateX(-50%);
        font-size: 10px;
        color: #ffb700;
        font-weight: 900;
        letter-spacing: 1.5px;
        pointer-events: none;
        text-shadow: 0 0 8px rgba(255,183,0,.8);
        z-index: 11;
        white-space: nowrap;
      }
      .orbit {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        border: 1px dashed rgba(255,255,255,.08);
        pointer-events: none;
      }
      .orbit-spin {
        position: absolute;
        top: 50%;
        left: 50%;
        border-radius: 50%;
        pointer-events: none;
        animation: spin linear infinite;
      }
      .planet {
        position: absolute;
        border-radius: 50%;
        cursor: pointer;
        transition: filter .3s;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        color: #fff;
        z-index: 5;
        box-shadow: 0 0 12px currentColor;
      }
      .planet:hover {
        filter: brightness(1.4);
        z-index: 20;
      }
      .planet-inner {
        animation: counterSpin linear infinite;
        pointer-events: none;
        font-size: 18px;
      }
      .planet-label {
        position: absolute;
        top: calc(100% + 4px);
        left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        font-weight: 900;
        color: #fff;
        white-space: nowrap;
        pointer-events: none;
        text-shadow: 0 2px 6px rgba(0,0,0,.9);
        background: rgba(0,0,0,.6);
        padding: 2px 6px;
        border-radius: 6px;
      }
      @keyframes spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes counterSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }
      .solar-info {
        position: absolute;
        bottom: 12px;
        left: 12px;
        right: 12px;
        padding: 10px 14px;
        background: rgba(0,0,0,.6);
        backdrop-filter: blur(8px);
        border-radius: 10px;
        font-size: 11px;
        color: var(--text-dim);
        border: 1px solid rgba(255,255,255,.06);
        z-index: 15;
      }
    `;
    document.head.appendChild(st);
  }

  function makeStars(count){
    var out = "";
    for(var i = 0; i < count; i++){
      var size = Math.random() * 2 + 1;
      var x = Math.random() * 100;
      var y = Math.random() * 100;
      var delay = (Math.random() * 3).toFixed(1);
      out += '<div class="star" style="width:' + size + 'px;height:' + size + 'px;left:' + x + '%;top:' + y + '%;animation-delay:' + delay + 's"></div>';
    }
    return out;
  }

  function render(container, ctx){
    injectStyles();

    function build(){
      var installed = HalDo.Apps.listInstalled();
      var byCat = HalDo.Apps.listByCategory();
      var cats = HalDo.Apps.categories;

      var hour = new Date().getHours();
      var greet = hour < 6 ? "Gute Nacht" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
      var userName = HalDo.Store.get("userName", "Bruder");

      var body = '';

      /* Header */
      body += '<div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;padding:0 4px">'
        + '<div>'
        + '<div style="font-size:16px;font-weight:900;color:var(--p1)">' + greet + ', ' + _esc(userName) + '! 🦚</div>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-top:2px">' + installed.length + ' Apps bereit · Klick ☀️ für AI Chat</div>'
        + '</div>'
        + '<button type="button" data-showapps="1" class="btn sec" style="font-size:11px;padding:8px 12px">📱 Apps</button>'
        + '</div>';

      /* Sonnensystem */
      body += '<div id="solarSystem">';
      body += makeStars(150);

      /* Orbits */
      var orbitRadii = [130, 195, 260];
      var catKeys = ["kommunikation", "produktivitaet", "gesundheit", "lifestyle", "werkzeuge", "system"];
      var orbitIndex = 0;

      catKeys.forEach(function(catKey, idx){
        var cat = cats[catKey];
        if(!cat) return;
        var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
        if(!apps.length) return;

        var radius = orbitRadii[orbitIndex % orbitRadii.length];
        var duration = 30 + orbitIndex * 15;
        var startAngle = (idx * 360 / catKeys.length);

        /* Orbit-Linie */
        body += '<div class="orbit" style="width:' + (radius*2) + 'px;height:' + (radius*2) + 'px"></div>';

        /* Spinning Container */
        body += '<div class="orbit-spin" style="width:' + (radius*2) + 'px;height:' + (radius*2) + 'px;animation-duration:' + duration + 's;animation-delay:' + (-duration * startAngle / 360) + 's">'
          + '<div class="planet" data-cat="' + catKey + '" '
          + 'style="width:' + cat.size + 'px;height:' + cat.size + 'px;'
          + 'top:-' + (cat.size / 2) + 'px;left:calc(50% - ' + (cat.size / 2) + 'px);'
          + 'background:radial-gradient(circle at 30% 30%, ' + cat.color + ', ' + cat.planet + ');'
          + 'color:' + cat.color + '">'
          + '<div class="planet-inner" style="animation-duration:' + duration + 's;animation-delay:' + (-duration * startAngle / 360) + 's;font-size:' + (cat.size * 0.42) + 'px">'
          + cat.icon
          + '</div>'
          + '<div class="planet-label">' + cat.name + ' (' + apps.length + ')</div>'
          + '</div>'
          + '</div>';

        orbitIndex++;
      });

      /* Sonne */
      body += '<div class="sun" data-sun="1" title="HalDo AI Chat öffnen"></div>';
      body += '<div class="sun-label">☀️ HALDO AI</div>';

      /* Info */
      body += '<div class="solar-info">'
        + '💡 Klick auf <b>☀️ Sonne</b> → AI Chat · Klick auf <b>Planet</b> → Kategorie'
        + '</div>';

      body += '</div>';

      container.innerHTML = body;

      /* Events */
      var sun = container.querySelector("[data-sun]");
      if(sun) sun.addEventListener("click", function(){
        if(HalDo.Apps.has("ai")) HalDo.Apps.open("ai");
        else if(HalDo.Notify) HalDo.Notify.info("AI Chat nicht verfügbar", { app: "system" });
      });

      container.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click", function(e){
          e.stopPropagation();
          openCategory(el.dataset.cat);
        });
      });

      var showApps = container.querySelector("[data-showapps]");
      if(showApps) showApps.addEventListener("click", function(){
        showAllAppsGrid();
      });
    }

    function openCategory(catKey){
      var byCat = HalDo.Apps.listByCategory();
      var cat = HalDo.Apps.categories[catKey];
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];

      var body = '<div style="padding:14px">'

        /* Header mit Zurück */
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:14px;background:linear-gradient(135deg,' + cat.color + '22,' + cat.planet + '22);border-radius:14px;border-left:4px solid ' + cat.color + '">'
        + '<div>'
        + '<div style="font-size:18px;font-weight:900;color:' + cat.color + '">' + cat.icon + ' ' + cat.name + '</div>'
        + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:4px">' + apps.length + ' Apps</div>'
        + '</div>'
        + '<button type="button" data-back="1" class="btn sec" style="font-size:11px">← Zurück</button>'
        + '</div>'

        /* App-Liste */
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';

      apps.forEach(function(a){
        body += '<button type="button" data-appopen="' + _esc(a.id) + '" style="padding:14px 12px;background:rgba(0,0,0,.2);border:1.5px solid ' + cat.color + '44;border-radius:12px;cursor:pointer;color:inherit;text-align:left;font-family:inherit;transition:.15s">'
          + '<div style="font-size:26px;margin-bottom:6px">' + _esc(a.icon) + '</div>'
          + '<div style="font-size:12px;font-weight:900;color:' + cat.color + '">' + _esc(a.name) + '</div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px;line-height:1.4">' + _esc(a.desc || "") + '</div>'
          + '</button>';
      });

      body += '</div></div>';

      container.innerHTML = body;
      container.scrollTop = 0;

      container.querySelectorAll("[data-appopen]").forEach(function(el){
        el.addEventListener("click", function(){
          HalDo.Apps.open(el.dataset.appopen);
        });
      });

      var back = container.querySelector("[data-back]");
      if(back) back.addEventListener("click", function(){ build(); });
    }

    function showAllAppsGrid(){
      var all = HalDo.Apps.listAll();
      var byCat = HalDo.Apps.listByCategory();

      var body = '<div style="padding:14px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">'
        + '<div style="font-size:18px;font-weight:900;color:var(--p1)">📱 Alle Apps (' + all.filter(function(a){ return a.installed; }).length + ')</div>'
        + '<button type="button" data-back="1" class="btn sec" style="font-size:11px">← Zurück</button>'
        + '</div>';

      var catOrder = ["kommunikation", "produktivitaet", "gesundheit", "lifestyle", "werkzeuge", "system"];
      catOrder.forEach(function(catKey){
        var cat = HalDo.Apps.categories[catKey];
        if(!cat) return;
        var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
        if(!apps.length) return;
        apps.sort(function(a, b){ return (a.name || "").localeCompare(b.name || "", "de"); });

        body += '<div style="margin-bottom:16px">'
          + '<div style="font-size:11px;color:' + cat.color + ';font-weight:900;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">' + cat.icon + ' ' + cat.name + ' (' + apps.length + ')</div>'
          + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
        apps.forEach(function(a){
          body += '<button type="button" data-appopen="' + _esc(a.id) + '" style="padding:12px 10px;background:rgba(0,0,0,.2);border:1.5px solid ' + cat.color + '44;border-radius:10px;cursor:pointer;color:inherit;text-align:left;font-family:inherit">'
            + '<div style="font-size:22px">' + _esc(a.icon) + '</div>'
            + '<div style="font-size:11px;font-weight:900;color:' + cat.color + ';margin-top:4px">' + _esc(a.name) + '</div>'
            + '</button>';
        });
        body += '</div></div>';
      });

      body += '</div>';
      container.innerHTML = body;
      container.scrollTop = 0;

      container.querySelectorAll("[data-appopen]").forEach(function(el){
        el.addEventListener("click", function(){
          HalDo.Apps.open(el.dataset.appopen);
        });
      });

      var back = container.querySelector("[data-back]");
      if(back) back.addEventListener("click", function(){ build(); });
    }

    build();
  }

  HalDoApp("home", { name: "Home", icon: "🏠", render: render, category: "system" });
  console.log("🦚 home.js v162 geladen — SONNENSYSTEM");
})();
