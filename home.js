/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HOME (v170) · MULTI-MODE
   3 Modes: Sonnensystem · Grid · Focus
   Menü: Mode · Apps · Einstellungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var MODES = [
    { id: "solar", icon: "☀️", name: "Sonnensystem", desc: "Planeten kreisen um die Sonne" },
    { id: "grid",  icon: "📱", name: "Grid",         desc: "Alle Apps nach Kategorie" },
    { id: "focus", icon: "🎯", name: "Focus",        desc: "Uhr + deine 6 Kern-Apps" }
  ];
  var CAT_ORDER = ["kommunikation","produktivitaet","gesundheit","lifestyle","werkzeuge","system"];

  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function getMode(){
    var m = (HalDo.Store && HalDo.Store.get("homeMode", "solar")) || "solar";
    var ok = MODES.some(function(x){ return x.id === m; });
    return ok ? m : "solar";
  }
  function setMode(m){
    if(HalDo.Store && HalDo.Store.set) HalDo.Store.set("homeMode", m);
  }

  function injectStyles(){
    if(document.getElementById("haldoHomeV170")) return;
    var st = document.createElement("style");
    st.id = "haldoHomeV170";
    st.textContent = `
      /* Header */
      .hm-header{display:flex;justify-content:space-between;align-items:center;padding:12px 14px;margin-bottom:10px;background:linear-gradient(135deg,rgba(0,200,255,.08),rgba(150,80,255,.08));border:1px solid rgba(0,200,255,.15);border-radius:14px;gap:10px}
      .hm-header-left{flex:1;min-width:0}
      .hm-greet{font-size:15px;font-weight:900;color:var(--p1);line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .hm-sub{font-size:10.5px;color:var(--text-mute);margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .hm-header-right{display:flex;gap:6px;flex-shrink:0}
      .hm-iconbtn{width:38px;height:38px;border-radius:10px;background:rgba(0,200,255,.1);border:1px solid rgba(0,200,255,.25);color:var(--p1);font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.15s;font-family:inherit}
      .hm-iconbtn:hover,.hm-iconbtn:active{background:rgba(0,200,255,.25);transform:scale(1.05)}

      /* Solar */
      #solarSystem{position:relative;width:100%;height:calc(100vh - 220px);min-height:480px;overflow:hidden;border-radius:16px;background:radial-gradient(ellipse at center,#0a0f1a 0%,#050810 60%,#000 100%)}
      .star{position:absolute;background:#fff;border-radius:50%;animation:twinkle 3s infinite ease-in-out}
      @keyframes twinkle{0%,100%{opacity:.3}50%{opacity:1}}
      .sun{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100px;height:100px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff5c2 0%,#ffb700 35%,#ff6a00 70%,#c92a00 100%);box-shadow:0 0 40px rgba(255,183,0,.8),0 0 80px rgba(255,106,0,.6),0 0 140px rgba(255,106,0,.3),inset -8px -8px 20px rgba(180,60,0,.5);cursor:pointer;animation:sunPulse 4s ease-in-out infinite;z-index:10;transition:transform .3s}
      .sun::before{content:"";position:absolute;inset:-24px;border-radius:50%;background:conic-gradient(from 0deg,transparent 0deg,rgba(255,183,0,.35) 60deg,transparent 120deg,rgba(255,100,0,.35) 180deg,transparent 240deg,rgba(255,183,0,.3) 300deg,transparent 360deg);animation:sunRotate 20s linear infinite;z-index:-1;pointer-events:none;filter:blur(2px)}
      @keyframes sunRotate{from{transform:rotate(0)}to{transform:rotate(360deg)}}
      .sun:hover{transform:translate(-50%,-50%) scale(1.15)}
      .sun:active{transform:translate(-50%,-50%) scale(1.05)}
      @keyframes sunPulse{0%,100%{box-shadow:0 0 40px rgba(255,183,0,.8),0 0 80px rgba(255,106,0,.6),0 0 140px rgba(255,106,0,.3),inset -8px -8px 20px rgba(180,60,0,.5)}50%{box-shadow:0 0 60px rgba(255,183,0,1),0 0 120px rgba(255,106,0,.8),0 0 200px rgba(255,106,0,.4),inset -8px -8px 20px rgba(180,60,0,.5)}}
      .sun-label{position:absolute;top:calc(50% + 62px);left:50%;transform:translateX(-50%);font-size:10px;color:#ffb700;font-weight:900;letter-spacing:1.5px;pointer-events:none;text-shadow:0 0 8px rgba(255,183,0,.8);z-index:11;white-space:nowrap}
      .orbit{position:absolute;top:50%;left:50%;border-radius:50%;border:1px dashed rgba(255,255,255,.08);pointer-events:none}
      .orbit-spin{position:absolute;top:50%;left:50%;border-radius:50%;pointer-events:none;animation:spin linear infinite}
      .planet{position:absolute;border-radius:50%;cursor:pointer;transition:filter .3s;display:flex;align-items:center;justify-content:center;font-size:18px;color:#fff;z-index:5;box-shadow:0 0 12px currentColor}
      .planet:hover{filter:brightness(1.4);z-index:20}
      .planet-inner{animation:counterSpin linear infinite;pointer-events:none;font-size:18px}
      .planet-label{position:absolute;top:calc(100% + 4px);left:50%;transform:translateX(-50%);font-size:9px;font-weight:900;color:#fff;white-space:nowrap;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.9);background:rgba(0,0,0,.6);padding:2px 6px;border-radius:6px}
      @keyframes spin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
      @keyframes counterSpin{from{transform:rotate(0)}to{transform:rotate(-360deg)}}

      /* Grid */
      .hm-grid{padding:4px 4px 30px;display:flex;flex-direction:column;gap:18px}
      .hm-grid-cat{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:6px}
      .hm-grid-count{font-size:9px;background:rgba(255,255,255,.1);padding:1px 6px;border-radius:6px;color:var(--text-dim)}
      .hm-grid-list{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .hm-app-tile{padding:12px 8px;background:rgba(0,0,0,.25);border:1.5px solid;border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;transition:.15s}
      .hm-app-tile:hover,.hm-app-tile:active{background:rgba(0,200,255,.1);transform:translateY(-2px)}
      .hm-app-icon{font-size:26px;margin-bottom:4px;line-height:1}
      .hm-app-name{font-size:10px;font-weight:900;line-height:1.2}

      /* Focus */
      .hm-focus{display:flex;flex-direction:column;align-items:center;padding:30px 14px;gap:4px}
      .hm-focus-clock{font-size:68px;font-weight:900;color:var(--p1);text-shadow:0 0 30px rgba(0,200,255,.4);letter-spacing:2px;line-height:1}
      .hm-focus-date{font-size:13px;color:var(--text-dim);font-weight:700;margin-top:6px}
      .hm-focus-apps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%;max-width:360px;margin-top:24px}
      .hm-focus-app{padding:18px 10px;background:rgba(0,0,0,.25);border:1.5px solid rgba(0,200,255,.2);border-radius:14px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;transition:.15s}
      .hm-focus-app:hover,.hm-focus-app:active{background:rgba(0,200,255,.1);transform:translateY(-2px)}
      .hm-focus-icon{font-size:32px;line-height:1}
      .hm-focus-name{font-size:10.5px;font-weight:800;color:var(--p1);margin-top:6px}
      .hm-focus-more{margin-top:20px;padding:10px 20px;background:rgba(0,200,255,.1);border:1px solid rgba(0,200,255,.3);border-radius:10px;color:var(--p1);font-size:11px;font-weight:900;cursor:pointer;font-family:inherit}

      /* Modal */
      .hm-modal-backdrop{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10000;display:flex;align-items:flex-end;justify-content:center;padding:20px;animation:hmFade .15s}
      @keyframes hmFade{from{opacity:0}to{opacity:1}}
      .hm-modal{background:var(--bg,#0a1218);border:1px solid rgba(0,200,255,.3);border-radius:16px;padding:16px;width:100%;max-width:400px;box-shadow:0 8px 40px rgba(0,200,255,.2);animation:hmUp .2s}
      @keyframes hmUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
      .hm-modal-title{font-size:14px;font-weight:900;color:var(--p1);margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
      .hm-modal-x{background:transparent;border:none;color:#ff8080;font-size:18px;cursor:pointer;padding:0;font-family:inherit}
      .hm-mode-item{display:flex;align-items:center;gap:12px;width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:left;margin-bottom:6px;transition:.15s}
      .hm-mode-item.active{background:rgba(0,200,255,.15);border-color:var(--p1)}
      .hm-mode-item:hover{background:rgba(0,200,255,.1)}
      .hm-mode-icon{font-size:28px;line-height:1}
      .hm-mode-text{flex:1}
      .hm-mode-name{font-size:13px;font-weight:900;color:var(--p1)}
      .hm-mode-desc{font-size:10.5px;color:var(--text-mute);margin-top:2px}
      .hm-mode-check{font-size:18px;color:var(--p1);font-weight:900}
    `;
    document.head.appendChild(st);
  }

  function makeStars(n){
    var out = "";
    for(var i=0;i<n;i++){
      var s = (Math.random()*2+1).toFixed(1);
      var x = (Math.random()*100).toFixed(1);
      var y = (Math.random()*100).toFixed(1);
      var d = (Math.random()*3).toFixed(1);
      out += '<div class="star" style="width:'+s+'px;height:'+s+'px;left:'+x+'%;top:'+y+'%;animation-delay:'+d+'s"></div>';
    }
    return out;
  }

  function render(container, ctx){
    injectStyles();
    var modal = null;

    function greet(){
      var h = new Date().getHours();
      return h<6?"Gute Nacht":h<12?"Guten Morgen":h<18?"Guten Tag":"Guten Abend";
    }

    function header(modeId){
      var m = MODES.find(function(x){ return x.id === modeId; }) || MODES[0];
      var count = HalDo.Apps.listInstalled().length;
      var user = HalDo.Store.get("userName", "Bruder");
      return '<div class="hm-header">'
        + '<div class="hm-header-left">'
        + '<div class="hm-greet">'+greet()+', '+_esc(user)+'! 🦚</div>'
        + '<div class="hm-sub">'+count+' Apps · '+m.name+'</div>'
        + '</div>'
        + '<div class="hm-header-right">'
        + '<button class="hm-iconbtn" data-modebtn="1" title="Mode wechseln">'+m.icon+'</button>'
        + '<button class="hm-iconbtn" data-appsbtn="1" title="Alle Apps">📱</button>'
        + '<button class="hm-iconbtn" data-settingsbtn="1" title="Einstellungen">⚙️</button>'
        + '</div>'
        + '</div>';
    }

    function solar(){
      var byCat = HalDo.Apps.listByCategory();
      var cats = HalDo.Apps.categories;
      var radii = [130,195,260];
      var oi = 0;
      var html = '<div id="solarSystem">' + makeStars(140);
      CAT_ORDER.forEach(function(ck, idx){
        var cat = cats[ck];
        if(!cat) return;
        var apps = byCat[ck] ? byCat[ck].filter(function(a){ return a.installed; }) : [];
        if(!apps.length) return;
        var r = radii[oi % radii.length];
        var dur = 30 + oi*15;
        var ang = (idx*360/CAT_ORDER.length);
        html += '<div class="orbit" style="width:'+(r*2)+'px;height:'+(r*2)+'px"></div>';
        html += '<div class="orbit-spin" style="width:'+(r*2)+'px;height:'+(r*2)+'px;animation-duration:'+dur+'s;animation-delay:'+(-dur*ang/360)+'s">'
          + '<div class="planet" data-cat="'+ck+'" title="'+_esc(cat.name)+' · '+apps.length+' Apps"'
          + ' style="width:'+cat.size+'px;height:'+cat.size+'px;top:-'+(cat.size/2)+'px;left:calc(50% - '+(cat.size/2)+'px);background:radial-gradient(circle at 30% 30%,'+cat.color+','+cat.planet+');color:'+cat.color+'">'
          + '<div class="planet-inner" style="animation-duration:'+dur+'s;animation-delay:'+(-dur*ang/360)+'s;font-size:'+(cat.size*0.42)+'px">'+cat.icon+'</div>'
          + '<div class="planet-label">'+_esc(cat.name)+' ('+apps.length+')</div>'
          + '</div>'
          + '</div>';
        oi++;
      });
      html += '<div class="sun" data-sun="1" title="HalDo AI Chat"></div>';
      html += '<div class="sun-label">☀️ HALDO AI</div>';
      html += '</div>';
      return html;
    }

    function grid(){
      var byCat = HalDo.Apps.listByCategory();
      var cats = HalDo.Apps.categories;
      var html = '<div class="hm-grid">';
      CAT_ORDER.forEach(function(ck){
        var cat = cats[ck];
        if(!cat) return;
        var apps = byCat[ck] ? byCat[ck].filter(function(a){ return a.installed; }) : [];
        if(!apps.length) return;
        apps.sort(function(a,b){ return (a.name||"").localeCompare(b.name||"", "de"); });
        html += '<div>'
          + '<div class="hm-grid-cat" style="color:'+cat.color+'">'+cat.icon+' '+_esc(cat.name)+' <span class="hm-grid-count">'+apps.length+'</span></div>'
          + '<div class="hm-grid-list">'
          + apps.map(function(a){
              return '<button class="hm-app-tile" data-appopen="'+_esc(a.id)+'" style="border-color:'+cat.color+'44">'
                + '<div class="hm-app-icon">'+_esc(a.icon)+'</div>'
                + '<div class="hm-app-name" style="color:'+cat.color+'">'+_esc(a.name)+'</div>'
                + '</button>';
            }).join('')
          + '</div>'
          + '</div>';
      });
      html += '</div>';
      return html;
    }

    function focus(){
      var installed = HalDo.Apps.listInstalled();
      var now = new Date();
      var t = String(now.getHours()).padStart(2,"0") + ":" + String(now.getMinutes()).padStart(2,"0");
      var d = now.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"});
      var pinned = HalDo.Store.get("homePinned", []) || [];
      var pick = [];
      if(pinned.length){
        pinned.forEach(function(id){
          var a = installed.find(function(x){ return x.id === id; });
          if(a) pick.push(a);
        });
      }
      if(!pick.length){
        var byCat = HalDo.Apps.listByCategory();
        ["kommunikation","produktivitaet","gesundheit","lifestyle","werkzeuge"].forEach(function(ck){
          var apps = byCat[ck] ? byCat[ck].filter(function(a){ return a.installed; }) : [];
          apps.forEach(function(a){
            if(pick.length < 6 && !pick.find(function(x){ return x.id === a.id; })) pick.push(a);
          });
        });
      }
      pick = pick.slice(0, 6);
      var html = '<div class="hm-focus">'
        + '<div class="hm-focus-clock">'+t+'</div>'
        + '<div class="hm-focus-date">'+_esc(d)+'</div>'
        + '<div class="hm-focus-apps">';
      pick.forEach(function(a){
        html += '<button class="hm-focus-app" data-appopen="'+_esc(a.id)+'">'
          + '<div class="hm-focus-icon">'+_esc(a.icon)+'</div>'
          + '<div class="hm-focus-name">'+_esc(a.name)+'</div>'
          + '</button>';
      });
      html += '</div>';
      html += '<button class="hm-focus-more" data-appsbtn="1">Alle Apps anzeigen →</button>';
      html += '</div>';
      return html;
    }

    function modalHTML(modeId){
      return '<div class="hm-modal-backdrop" data-modalclose="1">'
        + '<div class="hm-modal">'
        + '<div class="hm-modal-title"><span>Mode wählen</span><button class="hm-modal-x" data-modalclose="1">✕</button></div>'
        + MODES.map(function(m){
            var active = m.id === modeId;
            return '<button class="hm-mode-item'+(active?" active":"")+'" data-selectmode="'+m.id+'">'
              + '<div class="hm-mode-icon">'+m.icon+'</div>'
              + '<div class="hm-mode-text">'
              + '<div class="hm-mode-name">'+m.name+'</div>'
              + '<div class="hm-mode-desc">'+m.desc+'</div>'
              + '</div>'
              + (active?'<div class="hm-mode-check">✓</div>':'')
              + '</button>';
          }).join('')
        + '</div>'
        + '</div>';
    }

    function categoryView(catKey){
      var byCat = HalDo.Apps.listByCategory();
      var cat = HalDo.Apps.categories[catKey];
      if(!cat) return build();
      var apps = byCat[catKey] ? byCat[catKey].filter(function(a){ return a.installed; }) : [];
      apps.sort(function(a,b){ return (a.name||"").localeCompare(b.name||"","de"); });
      var html = '<div style="padding:4px">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:14px;background:linear-gradient(135deg,'+cat.color+'22,'+cat.planet+'22);border-radius:14px;border-left:4px solid '+cat.color+'">'
        + '<div><div style="font-size:18px;font-weight:900;color:'+cat.color+'">'+cat.icon+' '+_esc(cat.name)+'</div>'
        + '<div style="font-size:11.5px;color:var(--text-dim);margin-top:4px">'+apps.length+' Apps</div></div>'
        + '<button type="button" data-backcat="1" class="btn sec" style="font-size:11px">← Zurück</button>'
        + '</div>'
        + '<div class="hm-grid-list">';
      apps.forEach(function(a){
        html += '<button class="hm-app-tile" data-appopen="'+_esc(a.id)+'" style="border-color:'+cat.color+'44">'
          + '<div class="hm-app-icon">'+_esc(a.icon)+'</div>'
          + '<div class="hm-app-name" style="color:'+cat.color+'">'+_esc(a.name)+'</div>'
          + '</button>';
      });
      html += '</div></div>';
      container.innerHTML = html;
      container.scrollTop = 0;
      bindCategory();
    }

    function bindCategory(){
      container.querySelectorAll("[data-appopen]").forEach(function(el){
        el.addEventListener("click", function(){ HalDo.Apps.open(el.dataset.appopen); });
      });
      var bk = container.querySelector("[data-backcat]");
      if(bk) bk.addEventListener("click", function(){ build(); });
    }

    function bind(){
      // Sun
      var sun = container.querySelector("[data-sun]");
      if(sun) sun.addEventListener("click", function(){
        if(HalDo.Apps.has("ai")) HalDo.Apps.open("ai");
        else if(HalDo.Notify) HalDo.Notify.info("AI nicht verfügbar");
      });

      // Planet → Kategorie
      container.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click", function(e){
          e.stopPropagation();
          categoryView(el.dataset.cat);
        });
      });

      // App öffnen
      container.querySelectorAll("[data-appopen]").forEach(function(el){
        el.addEventListener("click", function(){ HalDo.Apps.open(el.dataset.appopen); });
      });

      // Mode
      container.querySelectorAll("[data-modebtn]").forEach(function(el){
        el.addEventListener("click", function(){ modal = "mode"; build(); });
      });

      // Apps → Grid
      container.querySelectorAll("[data-appsbtn]").forEach(function(el){
        el.addEventListener("click", function(){
          if(getMode() !== "grid") setMode("grid");
          modal = null; build();
        });
      });

      // Settings
      container.querySelectorAll("[data-settingsbtn]").forEach(function(el){
        el.addEventListener("click", function(){
          if(HalDo.Apps.has("settings")) HalDo.Apps.open("settings");
          else if(HalDo.Notify) HalDo.Notify.info("Einstellungen nicht verfügbar");
        });
      });

      // Modal
      if(modal){
        container.querySelectorAll("[data-modalclose]").forEach(function(el){
          el.addEventListener("click", function(){ modal = null; build(); });
        });
        var box = container.querySelector(".hm-modal");
        if(box) box.addEventListener("click", function(e){ e.stopPropagation(); });
        container.querySelectorAll("[data-selectmode]").forEach(function(el){
          el.addEventListener("click", function(){
            setMode(el.dataset.selectmode);
            modal = null; build();
          });
        });
      }
    }

    function build(){
      var mode = getMode();
      var body = header(mode);
      if(mode === "solar") body += solar();
      else if(mode === "grid") body += grid();
      else body += focus();
      if(modal === "mode") body += modalHTML(mode);
      container.innerHTML = body;
      bind();
    }

    build();
  }

  HalDoApp("home", { name: "Home", icon: "🏠", render: render, category: "system" });
  console.log("🦚 home.js v170 geladen — MULTI-MODE (Solar/Grid/Focus)");
})();
