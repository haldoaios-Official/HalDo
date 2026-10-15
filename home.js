/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HOME (v154) · SONNENSYSTEM
   Sonne in Mitte · Planeten kreisen · Klick → AI Chat
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }

  /* Sternenhimmel + Sonnensystem Styles */
  function injectStyles(){
    if(document.getElementById("haldoSolarStyle")) return;
    var st = document.createElement("style");
    st.id = "haldoSolarStyle";
    st.textContent = `
      #solarSystem {
        position: relative;
        width: 100%;
        height: 100%;
        min-height: 520px;
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
      .sun:hover {
        transform: translate(-50%, -50%) scale(1.15);
      }
      .sun:active {
        transform: translate(-50%, -50%) scale(1.05);
      }
      @keyframes sunPulse {
        0%, 100% { box-shadow: 0 0 40px rgba(255,183,0,.8), 0 0 80px rgba(255,106,0,.6), 0 0 140px rgba(255,106,0,.3), inset -8px -8px 20px rgba(180,60,0,.5); }
        50% { box-shadow: 0 0 60px rgba(255,183,0,1), 0 0 120px rgba(255,106,0,.8), 0 0 200px rgba(255,106,0,.4), inset -8px -8px 20px rgba(180,60,0,.5); }
      }
      .sun-label {
        position: absolute;
        top: calc(50% + 60px);
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
        border: 1px dashed rgba(255,255,255,.06);
        pointer-events: none;
        animation: spin linear infinite;
      }
      .planet {
        position: absolute;
        border-radius: 50%;
        cursor: pointer;
        transition: transform .3s;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        color: #fff;
        z-index: 5;
        box-shadow: 0 0 12px currentColor;
      }
      .planet:hover {
        transform: scale(1.25);
        z-index: 20;
      }
      .planet-inner {
        animation: counterSpin linear infinite;
        pointer-events: none;
      }
      .planet-label {
        position: absolute;
        top: calc(100% + 6px);
        left: 50%;
        transform: translateX(-50%);
        font-size: 9px;
        font-weight: 900;
        color: #fff;
        white-space: nowrap;
        pointer-events: none;
        text-shadow: 0 2px 6px rgba(0,0,0,.9);
        background: rgba(0,0,0,.5);
        padding: 2px 6px;
        border-radius: 6px;
        opacity: 0;
        transition: opacity .2s;
      }
      .planet:hover .planet-label { opacity: 1; }

      @keyframes spin {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
      @keyframes counterSpin {
        from { transform: rotate(0deg); }
        to { transform: rotate(-360deg); }
      }
    `;
    document.head.appendChild(st);
  }

  /* Sterne erzeugen */
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
      var all = HalDo.Apps.listAll();
      var byCat = HalDo.Apps.listByCategory();
      var cats = HalDo.Apps.categories;

      var hour = new Date().getHours();
      var greet = hour < 6 ? "Gute Nacht" : hour < 12 ? "Guten Morgen" : hour < 18 ? "Guten Tag" : "Guten Abend";
      var userName = HalDo.Store.get("userName", "Bruder");

      var body = '<div style="margin-bottom:12px;text-align:center">'
        + '<div style="font-size:20px;font-weight:900;color:var(--p1)">' + greet + ', ' + _esc(userName) + '! 🦚</div>'
        + '<div style="font-size:11px;color:var(--text-mute);margin-top:2px">' + installed.length + ' Apps installiert · Klick auf die ☀️ für den Chat</div>'
        + '</div>';

      /* SONNENSYSTEM */
      body += '<div id="solarSystem">';
      body += makeStars(120);

      /* Orbits + Planeten */
      var orbitRadii = [140, 200, 260];
      var catKeys = Object.keys(cats).filter(function(k){ return k !== "app"; });
      var orbitIndex = 0;
      var usedCatIndex = 0;

      catKeys.forEach(function(catKey, idx){
        var cat = cats[catKey];
        var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
        if(!apps.length) return;

        var radius = orbitRadii[orbitIndex % orbitRadii.length];
        var duration = 20 + orbitIndex * 12; /* Sekunden pro Umdrehung */
        var startAngle = (idx * 360 / catKeys.length);

        body += '<div class="orbit" style="width:' + (radius*2) + 'px;height:' + (radius*2) + 'px;animation-duration:' + duration + 's;animation-delay:' + (-duration * startAngle / 360) + 's"></div>';

        /* Planet auf Umlaufbahn positionieren (am oberen Rand des Orbits) */
        body += '<div class="orbit" style="width:' + (radius*2) + 'px;height:' + (radius*2) + 'px;border:none;animation-duration:' + duration + 's;animation-delay:' + (-duration * startAngle / 360) + 's">'
          + '<div class="planet" data-cat="' + catKey + '" '
          + 'style="width:' + cat.size + 'px;height:' + cat.size + 'px;'
          + 'top:-' + (cat.size / 2) + 'px;left:calc(50% - ' + (cat.size / 2) + 'px);'
          + 'background:radial-gradient(circle at 30% 30%, ' + cat.color + ', ' + cat.planet + ');'
          + 'color:' + cat.color + '">'
          + '<div class="planet-inner" style="animation-duration:' + duration + 's;animation-delay:' + (-duration * startAngle / 360) + 's;font-size:' + (cat.size * 0.4) + 'px">'
          + cat.icon
          + '</div>'
          + '<div class="planet-label">' + cat.name + ' (' + apps.length + ')</div>'
          + '</div>'
          + '</div>';

        orbitIndex++;
      });

      /* Sonne in der Mitte */
      body += '<div class="sun" data-sun="1" title="HalDo AI Chat öffnen"></div>';
      body += '<div class="sun-label">☀️ HALDO AI</div>';

      body += '</div>';

      /* Schnellzugriff unten */
      body += '<div class="card" style="margin-top:14px">'
        + '<div style="display:flex;gap:6px;overflow-x:auto">'
        + '<button class="btn sec" data-quick="ai" style="font-size:11px;padding:8px 12px;white-space:nowrap">🧠 AI Chat</button>'
        + '<button class="btn sec" data-quick="fitness" style="font-size:11px;padding:8px 12px;white-space:nowrap">💪 Fitness</button>'
        + '<button class="btn sec" data-quick="kueche" style="font-size:11px;padding:8px 12px;white-space:nowrap">🍳 Küche</button>'
        + '<button class="btn sec" data-quick="tasks" style="font-size:11px;padding:8px 12px;white-space:nowrap">✅ Aufgaben</button>'
        + '<button class="btn sec" data-quick="settings" style="font-size:11px;padding:8px 12px;white-space:nowrap">⚙️ Settings</button>'
        + '</div>'
        + '</div>';

      container.innerHTML = body;

      /* Events */
      var sun = container.querySelector("[data-sun]");
      if(sun) sun.addEventListener("click", function(){
        if(HalDo.Apps.has("ai")) HalDo.Apps.open("ai");
        else if(HalDo.Notify) HalDo.Notify.info("AI Chat nicht installiert", { app: "system" });
      });

      container.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click", function(e){
          e.stopPropagation();
          openCategory(el.dataset.cat);
        });
      });

      container.querySelectorAll("[data-quick]").forEach(function(el){
        el.addEventListener("click", function(){
          HalDo.Apps.open(el.dataset.quick);
        });
      });
    }

    function openCategory(catKey){
      var byCat = HalDo.Apps.listByCategory();
      var cat = HalDo.Apps.categories[catKey];
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];

      var content = document.getElementById("haldo-content");
      var titleEl = document.getElementById("haldo-title");
      if(titleEl) titleEl.textContent = cat.icon + " " + cat.name;

      var html = '<div class="card" style="background:linear-gradient(135deg,' + cat.color + '22,' + cat.planet + '22);border-left:4px solid ' + cat.color + '">'
        + '<div style="display:flex;justify-content:space-between;align-items:center">'
        + '<div>'
        + '<div style="font-size:18px;font-weight:900;color:' + cat.color + '">' + cat.icon + ' ' + cat.name + '</div>'
        + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:4px">' + apps.length + ' Apps</div>'
        + '</div>'
        + '<button class="btn sec" id="solarBack" style="font-size:11px">← Zurück</button>'
        + '</div></div>';

      html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
      apps.forEach(function(a){
        html += '<button data-appopen="' + _esc(a.id) + '" style="padding:14px 12px;background:rgba(0,0,0,.2);border:1.5px solid ' + cat.color + '44;border-radius:12px;cursor:pointer;color:inherit;text-align:left;font-family:inherit;transition:.15s">'
          + '<div style="font-size:26px;margin-bottom:6px">' + _esc(a.icon) + '</div>'
          + '<div style="font-size:12px;font-weight:900;color:' + cat.color + '">' + _esc(a.name) + '</div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px;line-height:1.4">' + _esc(a.desc) + '</div>'
          + '</button>';
      });
      html += '</div>';

      content.innerHTML = html;
      content.scrollTop = 0;

      content.querySelectorAll("[data-appopen]").forEach(function(el){
        el.addEventListener("click", function(){
          HalDo.Apps.open(el.dataset.appopen);
        });
      });

      var back = content.querySelector("#solarBack");
      if(back) back.addEventListener("click", function(){
        build();
        var titleEl2 = document.getElementById("haldo-title");
        if(titleEl2) titleEl2.textContent = "🦚 HalDo AI OS";
      });
    }

    build();
  }

  HalDoApp("home", { name: "Home", icon: "🏠", render: render, category: "system" });
  console.log("🦚 home.js v154 geladen — SONNENSYSTEM");
})();
