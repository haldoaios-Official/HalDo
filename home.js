/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HOME (v180) · FULLSCREEN DESKTOP
   5 Designs: Solar · Grid · Focus · Nebula · Minimal
   Desktop-Hintergrund · Apps öffnen als Fenster darüber
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var DESIGNS = [
    { id: "solar",   icon: "☀️", name: "Sonnensystem", desc: "Planeten kreisen um die Sonne" },
    { id: "grid",    icon: "📱", name: "Grid",         desc: "Alle Apps nach Kategorie" },
    { id: "focus",   icon: "🎯", name: "Focus",        desc: "Uhr + Kern-Apps, minimalistisch" },
    { id: "nebula",  icon: "🌌", name: "Nebula",       desc: "Apps als Sterne im Weltraum" },
    { id: "minimal", icon: "⚪", name: "Minimal",      desc: "Nur das Wesentliche" }
  ];
  var CAT_ORDER = ["kommunikation","produktivitaet","gesundheit","lifestyle","werkzeuge","system"];

  function _esc(s){
    return String(s==null?"":s).replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function getDesign(){
    var d = (HalDo.Store && HalDo.Store.get("homeDesign","solar")) || "solar";
    return DESIGNS.some(function(x){return x.id===d;}) ? d : "solar";
  }
  function setDesign(d){ if(HalDo.Store && HalDo.Store.set) HalDo.Store.set("homeDesign", d); }

  function injectStyles(){
    if(document.getElementById("haldoHomeV180")) return;
    var st = document.createElement("style");
    st.id = "haldoHomeV180";
    st.textContent = `
      #haldoHomeRoot{
        position:fixed;inset:0;z-index:50;
        overflow-y:auto;overflow-x:hidden;
        background:radial-gradient(ellipse at 50% 100%,#1a0f2e 0%,#0a0f1a 45%,#050810 80%,#000 100%);
        color:#e0f7fa;font-family:-apple-system,"Segoe UI",Roboto,sans-serif;
      }
      #haldoHomeRoot *{box-sizing:border-box}

      /* Topbar */
      .hm-topbar{
        position:sticky;top:0;z-index:60;
        display:flex;justify-content:space-between;align-items:center;
        padding:12px 14px;gap:10px;
        background:linear-gradient(180deg,rgba(5,8,16,.85) 0%,rgba(5,8,16,.5) 70%,transparent 100%);
        backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);
      }
      .hm-greet{font-size:15px;font-weight:900;color:#4dd0e1;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .hm-sub{font-size:10.5px;color:#7fa5b8;margin-top:3px}
      .hm-btns{display:flex;gap:6px;flex-shrink:0}
      .hm-btn{
        width:40px;height:40px;border-radius:11px;
        background:rgba(0,200,255,.1);border:1px solid rgba(0,200,255,.3);
        color:#4dd0e1;font-size:18px;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        transition:.15s;font-family:inherit;
      }
      .hm-btn:hover,.hm-btn:active{background:rgba(0,200,255,.28);transform:scale(1.06)}

      /* Hero area */
      .hm-hero{position:relative;width:100%}

      /* SOLAR */
      .hm-solar{position:relative;width:100%;height:calc(100vh - 70px);min-height:520px;overflow:hidden}
      .hm-star{position:absolute;background:#fff;border-radius:50%;animation:hmTwinkle 3s infinite ease-in-out}
      @keyframes hmTwinkle{0%,100%{opacity:.25}50%{opacity:.95}}
      .hm-sun{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100px;height:100px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fff5c2 0%,#ffb700 35%,#ff6a00 70%,#c92a00 100%);box-shadow:0 0 40px rgba(255,183,0,.8),0 0 80px rgba(255,106,0,.6),0 0 140px rgba(255,106,0,.3),inset -8px -8px 20px rgba(180,60,0,.5);cursor:pointer;animation:hmSunPulse 4s ease-in-out infinite;z-index:10;transition:transform .3s}
      .hm-sun:hover{transform:translate(-50%,-50%) scale(1.15)}
      .hm-sun:active{transform:translate(-50%,-50%) scale(1.05)}
      @keyframes hmSunPulse{0%,100%{box-shadow:0 0 40px rgba(255,183,0,.8),0 0 80px rgba(255,106,0,.6),0 0 140px rgba(255,106,0,.3),inset -8px -8px 20px rgba(180,60,0,.5)}50%{box-shadow:0 0 60px rgba(255,183,0,1),0 0 120px rgba(255,106,0,.8),0 0 200px rgba(255,106,0,.4),inset -8px -8px 20px rgba(180,60,0,.5)}}
      .hm-sun-lbl{position:absolute;top:calc(50% + 62px);left:50%;transform:translateX(-50%);font-size:10px;color:#ffb700;font-weight:900;letter-spacing:1.5px;pointer-events:none;text-shadow:0 0 8px rgba(255,183,0,.8);z-index:11;white-space:nowrap}
      .hm-orbit{position:absolute;top:50%;left:50%;border-radius:50%;border:1px dashed rgba(255,255,255,.08);pointer-events:none}
      .hm-orbit-spin{position:absolute;top:50%;left:50%;border-radius:50%;pointer-events:none;animation:hmSpin linear infinite}
      .hm-planet{position:absolute;border-radius:50%;cursor:pointer;transition:filter .3s;display:flex;align-items:center;justify-content:center;z-index:5;box-shadow:0 0 12px currentColor}
      .hm-planet:hover{filter:brightness(1.4);z-index:20}
      .hm-planet-inner{animation:hmCounterSpin linear infinite;pointer-events:none;display:flex;align-items:center;justify-content:center}
      .hm-planet-lbl{position:absolute;top:calc(100% + 4px);left:50%;transform:translateX(-50%);font-size:9px;font-weight:900;color:#fff;white-space:nowrap;pointer-events:none;text-shadow:0 2px 6px rgba(0,0,0,.9);background:rgba(0,0,0,.6);padding:2px 6px;border-radius:6px}
      @keyframes hmSpin{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
      @keyframes hmCounterSpin{from{transform:rotate(0)}to{transform:rotate(-360deg)}}

      /* GRID / MINIMAL */
      .hm-pad{padding:12px 14px 40px}
      .hm-cat-title{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:flex;align-items:center;gap:6px}
      .hm-cat-count{font-size:9px;background:rgba(255,255,255,.1);padding:1px 6px;border-radius:6px;color:#7fa5b8}
      .hm-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
      .hm-tile{padding:12px 8px;background:rgba(0,0,0,.35);border:1.5px solid;border-radius:11px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;transition:.15s}
      .hm-tile:hover,.hm-tile:active{background:rgba(0,200,255,.12);transform:translateY(-2px)}
      .hm-tile-icon{font-size:26px;margin-bottom:4px;line-height:1}
      .hm-tile-name{font-size:10px;font-weight:900;line-height:1.2}

      /* FOCUS */
      .hm-focus-wrap{padding:40px 16px 30px;display:flex;flex-direction:column;align-items:center;gap:4px;min-height:calc(100vh - 70px)}
      .hm-clock{font-size:78px;font-weight:900;color:#4dd0e1;text-shadow:0 0 30px rgba(0,200,255,.4);letter-spacing:2px;line-height:1}
      .hm-date{font-size:13px;color:#7fa5b8;font-weight:700;margin-top:6px}
      .hm-focus-apps{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;width:100%;max-width:380px;margin-top:28px}
      .hm-focus-app{padding:20px 10px;background:rgba(0,0,0,.35);border:1.5px solid rgba(0,200,255,.25);border-radius:14px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;transition:.15s}
      .hm-focus-app:hover,.hm-focus-app:active{background:rgba(0,200,255,.15);transform:translateY(-2px)}
      .hm-focus-icon{font-size:34px;line-height:1}
      .hm-focus-name{font-size:11px;font-weight:800;color:#4dd0e1;margin-top:6px}
      .hm-more-btn{margin-top:20px;padding:11px 22px;background:rgba(0,200,255,.12);border:1px solid rgba(0,200,255,.3);border-radius:11px;color:#4dd0e1;font-size:11.5px;font-weight:900;cursor:pointer;font-family:inherit}

      /* NEBULA */
      .hm-nebula{position:relative;width:100%;height:calc(100vh - 70px);min-height:520px;overflow:hidden;background:radial-gradient(ellipse at 30% 40%,rgba(80,20,120,.5),transparent 60%),radial-gradient(ellipse at 70% 60%,rgba(20,80,140,.5),transparent 60%),#050810}
      .hm-neb-app{position:absolute;cursor:pointer;transition:.2s;display:flex;flex-direction:column;align-items:center;gap:4px}
      .hm-neb-app:hover{transform:translate(-50%,-50%) scale(1.15)!important;z-index:30}
      .hm-neb-orb{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.4),rgba(0,200,255,.15));border:1px solid rgba(0,200,255,.5);box-shadow:0 0 20px rgba(0,200,255,.6),0 0 40px rgba(0,200,255,.3);animation:hmNebFloat 6s ease-in-out infinite}
      @keyframes hmNebFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
      .hm-neb-lbl{font-size:9px;font-weight:900;color:#a0d8e8;white-space:nowrap;text-shadow:0 2px 6px #000}

      /* DESIGN MODAL */
      .hm-modal-bd{position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:10000;display:flex;align-items:flex-end;justify-content:center;padding:20px;animation:hmFade .15s}
      @keyframes hmFade{from{opacity:0}to{opacity:1}}
      .hm-modal{background:#0a1218;border:1px solid rgba(0,200,255,.3);border-radius:16px;padding:16px;width:100%;max-width:420px;box-shadow:0 8px 40px rgba(0,200,255,.25);animation:hmUp .2s;max-height:85vh;overflow-y:auto}
      @keyframes hmUp{from{transform:translateY(30px);opacity:0}to{transform:translateY(0);opacity:1}}
      .hm-modal-title{font-size:15px;font-weight:900;color:#4dd0e1;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center}
      .hm-modal-x{background:transparent;border:none;color:#ff8080;font-size:20px;cursor:pointer;padding:0;font-family:inherit}
      .hm-des-item{display:flex;align-items:center;gap:12px;width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.08);border-radius:11px;cursor:pointer;color:inherit;font-family:inherit;text-align:left;margin-bottom:6px;transition:.15s}
      .hm-des-item.active{background:rgba(0,200,255,.15);border-color:#4dd0e1}
      .hm-des-item:hover{background:rgba(0,200,255,.08)}
      .hm-des-icon{font-size:28px;line-height:1}
      .hm-des-text{flex:1}
      .hm-des-name{font-size:13px;font-weight:900;color:#4dd0e1}
      .hm-des-desc{font-size:10.5px;color:#7fa5b8;margin-top:2px}
      .hm-des-check{font-size:18px;color:#4dd0e1;font-weight:900}
    `;
    document.head.appendChild(st);
  }

  function stars(n){
    var out="";for(var i=0;i<n;i++){var s=(Math.random()*2+1).toFixed(1);var x=(Math.random()*100).toFixed(2);var y=(Math.random()*100).toFixed(2);var d=(Math.random()*3).toFixed(2);out+='<div class="hm-star" style="width:'+s+'px;height:'+s+'px;left:'+x+'%;top:'+y+'%;animation-delay:'+d+'s"></div>';}
    return out;
  }

  function render(container, ctx){
    injectStyles();

    // Hide parent window if present + redirect to fullscreen root
    try {
      var win = container.closest && container.closest(".dp-window, .deskpane-window, .window, [data-win]");
      if(win) win.style.display = "none";
    } catch(e){}
    try { container.innerHTML = ""; } catch(e){}

    var root = document.getElementById("haldoHomeRoot");
    if(!root){
      root = document.createElement("div");
      root.id = "haldoHomeRoot";
      document.body.appendChild(root);
    }
    container = root;

    var modal = null;

    function greet(){
      var h = new Date().getHours();
      return h<6?"Gute Nacht":h<12?"Guten Morgen":h<18?"Guten Tag":"Guten Abend";
    }

    function topbar(designId){
      var d = DESIGNS.find(function(x){return x.id===designId;}) || DESIGNS[0];
      var n = HalDo.Apps.listInstalled().length;
      var u = HalDo.Store.get("userName","Bruder");
      return '<div class="hm-topbar">'
        + '<div style="flex:1;min-width:0">'
        + '<div class="hm-greet">'+greet()+', '+_esc(u)+'! 🦚</div>'
        + '<div class="hm-sub">'+n+' Apps · '+d.name+'</div>'
        + '</div>'
        + '<div class="hm-btns">'
        + '<button class="hm-btn" data-act="design" title="Design">'+d.icon+'</button>'
        + '<button class="hm-btn" data-act="allapps" title="Alle Apps">📱</button>'
        + '<button class="hm-btn" data-act="settings" title="Einstellungen">⚙️</button>'
        + '</div>'
        + '</div>';
    }

    function solar(){
      var byCat = HalDo.Apps.listByCategory();
      var cats = HalDo.Apps.categories;
      var radii = [140,215,290];
      var oi=0;
      var html='<div class="hm-solar">'+stars(160);
      CAT_ORDER.forEach(function(ck, idx){
        var cat = cats[ck]; if(!cat) return;
        var apps = byCat[ck]?byCat[ck].filter(function(a){return a.installed;}):[];
        if(!apps.length) return;
        var r = radii[oi%radii.length];
        var dur = 32+oi*16;
        var ang = (idx*360/CAT_ORDER.length);
        html += '<div class="hm-orbit" style="width:'+(r*2)+'px;height:'+(r*2)+'px"></div>';
        html += '<div class="hm-orbit-spin" style="width:'+(r*2)+'px;height:'+(r*2)+'px;animation-duration:'+dur+'s;animation-delay:'+(-dur*ang/360)+'s">'
          +'<div class="hm-planet" data-cat="'+ck+'" title="'+_esc(cat.name)+' · '+apps.length+' Apps"'
          +' style="width:'+cat.size+'px;height:'+cat.size+'px;top:-'+(cat.size/2)+'px;left:calc(50% - '+(cat.size/2)+'px);background:radial-gradient(circle at 30% 30%,'+cat.color+','+cat.planet+');color:'+cat.color+'">'
          +'<div class="hm-planet-inner" style="width:100%;height:100%;animation-duration:'+dur+'s;animation-delay:'+(-dur*ang/360)+'s;font-size:'+(cat.size*0.42)+'px">'+cat.icon+'</div>'
          +'<div class="hm-planet-lbl">'+_esc(cat.name)+' ('+apps.length+')</div>'
          +'</div></div>';
        oi++;
      });
      html += '<div class="hm-sun" data-sun="1" title="HalDo AI Chat"></div>';
      html += '<div class="hm-sun-lbl">☀️ HALDO AI</div>';
      html += '</div>';
      return html;
    }

    function grid(){
      var byCat = HalDo.Apps.listByCategory();
      var cats = HalDo.Apps.categories;
      var html = '<div class="hm-pad">';
      CAT_ORDER.forEach(function(ck){
        var cat = cats[ck]; if(!cat) return;
        var apps = byCat[ck]?byCat[ck].filter(function(a){return a.installed;}):[];
        if(!apps.length) return;
        apps.sort(function(a,b){return (a.name||"").localeCompare(b.name||"","de");});
        html += '<div style="margin-bottom:18px">'
          +'<div class="hm-cat-title" style="color:'+cat.color+'">'+cat.icon+' '+_esc(cat.name)+' <span class="hm-cat-count">'+apps.length+'</span></div>'
          +'<div class="hm-grid">'
          +apps.map(function(a){
            return '<button class="hm-tile" data-appopen="'+_esc(a.id)+'" style="border-color:'+cat.color+'44">'
              +'<div class="hm-tile-icon">'+_esc(a.icon)+'</div>'
              +'<div class="hm-tile-name" style="color:'+cat.color+'">'+_esc(a.name)+'</div>'
              +'</button>';
          }).join('')
          +'</div></div>';
      });
      html += '</div>';
      return html;
    }

    function focus(){
      var installed = HalDo.Apps.listInstalled();
      var now = new Date();
      var t = String(now.getHours()).padStart(2,"0")+":"+String(now.getMinutes()).padStart(2,"0");
      var d = now.toLocaleDateString("de-DE",{weekday:"long",day:"numeric",month:"long"});
      var pinned = HalDo.Store.get("homePinned",[]) || [];
      var pick = [];
      if(pinned.length) pinned.forEach(function(id){var a=installed.find(function(x){return x.id===id;});if(a)pick.push(a);});
      if(!pick.length){
        var byCat = HalDo.Apps.listByCategory();
        ["kommunikation","produktivitaet","gesundheit","lifestyle","werkzeuge"].forEach(function(ck){
          (byCat[ck]||[]).forEach(function(a){if(pick.length<6&&!pick.find(function(x){return x.id===a.id;}))pick.push(a);});
        });
      }
      pick = pick.slice(0,6);
      var html = '<div class="hm-focus-wrap">'
        +'<div class="hm-clock">'+t+'</div>'
        +'<div class="hm-date">'+_esc(d)+'</div>'
        +'<div class="hm-focus-apps">';
      pick.forEach(function(a){
        html += '<button class="hm-focus-app" data-appopen="'+_esc(a.id)+'">'
          +'<div class="hm-focus-icon">'+_esc(a.icon)+'</div>'
          +'<div class="hm-focus-name">'+_esc(a.name)+'</div>'
          +'</button>';
      });
      html += '</div><button class="hm-more-btn" data-act="allapps">Alle Apps anzeigen →</button></div>';
      return html;
    }

    function nebula(){
      var apps = HalDo.Apps.listInstalled();
      var html = '<div class="hm-nebula">'+stars(90);
      var colors = ["#4dd0e1","#ffd54f","#ab47bc","#66bb6a","#ef5350","#ff9800"];
      apps.forEach(function(a,i){
        var x = 12 + ((i*37.3)%76);
        var y = 12 + ((i*53.7)%72);
        var c = colors[i%colors.length];
        var delay = (i*0.4).toFixed(1);
        html += '<div class="hm-neb-app" data-appopen="'+_esc(a.id)+'" style="left:'+x+'%;top:'+y+'%;transform:translate(-50%,-50%)">'
          +'<div class="hm-neb-orb" style="animation-delay:'+delay+'s;border-color:'+c+'88;box-shadow:0 0 20px '+c+'aa,0 0 40px '+c+'44">'+_esc(a.icon)+'</div>'
          +'<div class="hm-neb-lbl">'+_esc(a.name)+'</div>'
          +'</div>';
      });
      html += '</div>';
      return html;
    }

    function minimal(){
      var apps = HalDo.Apps.listInstalled();
      apps.sort(function(a,b){return (a.name||"").localeCompare(b.name||"","de");});
      var html = '<div class="hm-pad" style="padding-top:24px">';
      apps.forEach(function(a){
        html += '<button class="hm-tile" data-appopen="'+_esc(a.id)+'" style="display:flex;align-items:center;gap:12px;width:100%;margin-bottom:6px;text-align:left;padding:14px;border-color:rgba(0,200,255,.15)">'
          +'<div style="font-size:22px;width:32px;text-align:center">'+_esc(a.icon)+'</div>'
          +'<div class="hm-tile-name" style="color:#4dd0e1;flex:1">'+_esc(a.name)+'</div>'
          +'<div style="color:#4dd0e1;opacity:.5">→</div>'
          +'</button>';
      });
      html += '</div>';
      return html;
    }

    function modalDesign(current){
      return '<div class="hm-modal-bd" data-mclose="1">'
        +'<div class="hm-modal">'
        +'<div class="hm-modal-title"><span>Design wählen</span><button class="hm-modal-x" data-mclose="1">✕</button></div>'
        +DESIGNS.map(function(d){
          var a = d.id===current;
          return '<button class="hm-des-item'+(a?" active":"")+'" data-seldesign="'+d.id+'">'
            +'<div class="hm-des-icon">'+d.icon+'</div>'
            +'<div class="hm-des-text"><div class="hm-des-name">'+d.name+'</div><div class="hm-des-desc">'+d.desc+'</div></div>'
            +(a?'<div class="hm-des-check">✓</div>':'')
            +'</button>';
        }).join('')
        +'</div></div>';
    }

    function categoryView(catKey){
      var byCat = HalDo.Apps.listByCategory();
      var cat = HalDo.Apps.categories[catKey];
      if(!cat) return build();
      var apps = byCat[catKey]?byCat[catKey].filter(function(a){return a.installed;}):[];
      apps.sort(function(a,b){return (a.name||"").localeCompare(b.name||"","de");});
      var html = '<div class="hm-pad">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;padding:14px;background:linear-gradient(135deg,'+cat.color+'22,'+cat.planet+'22);border-radius:14px;border-left:4px solid '+cat.color+'">'
        +'<div><div style="font-size:18px;font-weight:900;color:'+cat.color+'">'+cat.icon+' '+_esc(cat.name)+'</div>'
        +'<div style="font-size:11.5px;color:#7fa5b8;margin-top:4px">'+apps.length+' Apps</div></div>'
        +'<button data-act="back" style="background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.15);border-radius:8px;color:inherit;padding:6px 12px;cursor:pointer;font-family:inherit;font-size:11px;font-weight:900">← Zurück</button>'
        +'</div>'
        +'<div class="hm-grid">';
      apps.forEach(function(a){
        html += '<button class="hm-tile" data-appopen="'+_esc(a.id)+'" style="border-color:'+cat.color+'44">'
          +'<div class="hm-tile-icon">'+_esc(a.icon)+'</div>'
          +'<div class="hm-tile-name" style="color:'+cat.color+'">'+_esc(a.name)+'</div>'
          +'</button>';
      });
      html += '</div></div>';
      container.innerHTML = html;
      bind();
    }

    function bind(){
      container.querySelectorAll("[data-sun]").forEach(function(el){
        el.addEventListener("click", function(){
          if(HalDo.Apps.has("ai")) HalDo.Apps.open("ai");
        });
      });
      container.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click", function(e){e.stopPropagation();categoryView(el.dataset.cat);});
      });
      container.querySelectorAll("[data-appopen]").forEach(function(el){
        el.addEventListener("click", function(){HalDo.Apps.open(el.dataset.appopen);});
      });
      container.querySelectorAll("[data-act]").forEach(function(el){
        el.addEventListener("click", function(){
          var a = el.dataset.act;
          if(a==="design"){modal="design";build();}
          else if(a==="allapps"){ if(getDesign()!=="grid") setDesign("grid"); modal=null; build(); }
          else if(a==="settings"){ if(HalDo.Apps.has("settings")) HalDo.Apps.open("settings"); }
          else if(a==="back"){ build(); }
        });
      });
      if(modal==="design"){
        container.querySelectorAll("[data-mclose]").forEach(function(el){
          el.addEventListener("click", function(){modal=null;build();});
        });
        var mx = container.querySelector(".hm-modal");
        if(mx) mx.addEventListener("click", function(e){e.stopPropagation();});
        container.querySelectorAll("[data-seldesign]").forEach(function(el){
          el.addEventListener("click", function(){setDesign(el.dataset.seldesign);modal=null;build();});
        });
      }
    }

    function build(){
      var d = getDesign();
      var html = topbar(d);
      if(d==="solar") html += solar();
      else if(d==="grid") html += grid();
      else if(d==="focus") html += focus();
      else if(d==="nebula") html += nebula();
      else html += minimal();
      if(modal==="design") html += modalDesign(d);
      container.innerHTML = html;
      container.scrollTop = 0;
      bind();
    }

    build();
  }

  HalDoApp("home", { name: "Home", icon: "🏠", render: render, category: "system" });
  console.log("🦚 home.js v180 geladen — FULLSCREEN · 5 DESIGNS (Solar/Grid/Focus/Nebula/Minimal)");
})();
