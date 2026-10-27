/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HALDO BLITZER v12.0 (ULTIMATE)
   Tacho (7-5 Uhr) · Wetter · Navi-Verlauf · Parkuhr · Community
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var CATS = [
    { id:"blitzer_fix",   icon:"📷", color:"#ff5555", type:"warn", name:{de:"Fester Blitzer",en:"Fixed Camera",tr:"Sabit Radar",ar:"رادار ثابت",ku:"Radarê Sabît",fr:"Radar fixe"}, voice:{de:"Achtung, Blitzer in {d}",en:"Warning, camera in {d}",tr:"Dikkat, radar {d}",ar:"تحذير رادار {d}",ku:"Hişyarî, radar li {d}",fr:"Attention, radar à {d}"} },
    { id:"blitzer_mobil", icon:"🚔", color:"#ff8844", type:"warn", name:{de:"Mobile Kontrolle",en:"Mobile Check",tr:"Mobil Kontrol",ar:"مراقبة متحركة",ku:"Kontrola Mobîl",fr:"Contrôle mobile"}, voice:{de:"Achtung, Kontrolle in {d}",en:"Warning, check in {d}",tr:"Dikkat, kontrol {d}",ar:"تحذير مراقبة {d}",ku:"Hişyarî, kontrol li {d}",fr:"Attention, contrôle à {d}"} },
    { id:"stau", icon:"🚗", color:"#ffaa33", type:"warn", name:{de:"Stau",en:"Traffic Jam",tr:"Trafik",ar:"ازدحام",ku:"Traffîk",fr:"Embouteillage"}, voice:{de:"Stau in {d}",en:"Traffic jam in {d}",tr:"Trafik {d}",ar:"ازدحام {d}",ku:"Traffîk li {d}",fr:"Embouteillage à {d}"} },
    { id:"unfall", icon:"💥", color:"#ff3333", type:"warn", name:{de:"Unfall",en:"Accident",tr:"Kaza",ar:"حادث",ku:"Qeza",fr:"Accident"}, voice:{de:"Unfall in {d}",en:"Accident in {d}",tr:"Kaza {d}",ar:"حادث {d}",ku:"Qeza li {d}",fr:"Accident à {d}"} },
    { id:"baustelle", icon:"🚧", color:"#ffaa33", type:"warn", name:{de:"Baustelle",en:"Road Work",tr:"Yol Çalışması",ar:"أعمال طريق",ku:"Karê Rê",fr:"Travaux"}, voice:{de:"Baustelle in {d}",en:"Road work in {d}",tr:"Yol çalışması {d}",ar:"أعمال طريق {d}",ku:"Karê rê li {d}",fr:"Travaux à {d}"} },
    { id:"ezidi", icon:"🦚", color:"#ffd700", type:"warn", name:{de:"Ezidi-Zentrum",en:"Ezidi Center",tr:"Ezidi Merkezi",ar:"مركز إيزيدي",ku:"Navenda Êzîdî",fr:"Centre Ezidi"}, voice:{de:"Ezidi-Zentrum in {d}",en:"Ezidi center in {d}",tr:"Ezidi merkezi {d}",ar:"مركز إيزيدي {d}",ku:"Navenda Êzîdî li {d}",fr:"Centre Ezidi à {d}"} },
    { id:"poi_fuel", icon:"⛽", color:"#66cc66", type:"poi", osm:"amenity=fuel", name:{de:"Tankstelle",en:"Gas Station",tr:"Benzinlik",ar:"محطة وقود",ku:"Benzîngeh",fr:"Station"}, voice:{de:"Tankstelle in {d}",en:"Gas station in {d}",tr:"Benzinlik {d}",ar:"محطة وقود {d}",ku:"Benzîngeh li {d}",fr:"Station à {d}"} },
    { id:"poi_rest", icon:"🍴", color:"#ff8844", type:"poi", osm:"highway=rest_area", name:{de:"Raststätte",en:"Rest Area",tr:"Dinlenme",ar:"استراحة",ku:"Bêhnvedan",fr:"Repos"}, voice:{de:"Raststätte in {d}",en:"Rest area in {d}",tr:"Dinlenme {d}",ar:"استراحة {d}",ku:"Bêhnvedan li {d}",fr:"Repos à {d}"} }
  ];

  var LANGS = { 
    de:{ name:"Deutsch", code:"de-DE" }, en:{ name:"English", code:"en-US" }, 
    tr:{ name:"Türkçe", code:"tr-TR" }, ar:{ name:"العربية", code:"ar-SA" }, 
    ku:{ name:"Kurdî (Ezidi)", code:"tr-TR" }, fr:{ name:"Français", code:"fr-FR" },
    es:{ name:"Español", code:"es-ES" }, it:{ name:"Italiano", code:"it-IT" }
  };

  var DEFAULT_SETTINGS = { 
    enabled: {}, lang:"de", voiceOn:true, beepOn:true, notifyOn:true, warnDist: 1000, sounds:{}, 
    arrowStyle: "gold", tachoColor: "#4dd0e1", tachoStyle: "sport", alarmDuration: 5, offlineMode: false 
  };
  
  CATS.forEach(function(c){ 
    DEFAULT_SETTINGS.enabled[c.id] = true; 
    DEFAULT_SETTINGS.sounds[c.id] = (c.id.indexOf("blitzer") === 0 || c.id === "unfall") ? "siren" : "chime"; 
  });

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function haversine(lat1,lng1,lat2,lng2){ var R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180; var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2); return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); }
  function fmtDist(m){ return m<1000 ? Math.round(m/10)*10 + " m" : (m/1000).toFixed(1) + " km"; }
  function fmtTime(sec){ var h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=sec%60; return (h>0?h+"h ":"")+m+"m "+s+"s"; }

  /* ═══════════ AUDIO ENGINE ═══════════ */
  var audioCtx = null;
  function getAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
  
  function playBeep(pattern, vol, duration = 2.5){
    var ctx = getAudio(); if(!ctx) return; 
    var now = ctx.currentTime;
    
    if (pattern === "siren") {
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sawtooth"; o.connect(g); g.connect(ctx.destination);
      o.frequency.setValueAtTime(800, now);
      for (var t = 0; t < duration; t += 1.0) {
        o.frequency.linearRampToValueAtTime(1300, now + t + 0.5);
        o.frequency.linearRampToValueAtTime(800, now + t + 1.0);
      }
      g.gain.setValueAtTime(0, now); g.gain.linearRampToValueAtTime(vol, now + 0.1);
      g.gain.setValueAtTime(vol, now + duration - 0.2); g.gain.linearRampToValueAtTime(0, now + duration);
      o.start(now); o.stop(now + duration); return;
    }
    if (pattern === "long_alarm") {
      for (let i=0; i < (duration / 0.4); i++) {
        let t = now + (i * 0.4);
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "square"; o.frequency.value = 1600;
        o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.05);
        g.gain.setValueAtTime(vol, t + 0.25); g.gain.linearRampToValueAtTime(0, t + 0.35);
        o.start(t); o.stop(t + 0.35);
      }
      return;
    }
    if (pattern === "radar") {
      for (let i=0; i < (duration / 0.15); i++) {
        let t = now + (i * 0.15);
        var o = ctx.createOscillator(), g = ctx.createGain();
        o.type = "sine"; o.frequency.value = 2200;
        o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.01);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.start(t); o.stop(t + 0.1);
      }
      return;
    }
    var p = { urgent: [{f:880,t:0,d:0.1},{f:880,t:0.15,d:0.1}], alarm: [{f:1200,t:0,d:0.08},{f:1200,t:0.12,d:0.08}], chime: [{f:523,t:0,d:0.15},{f:659,t:0.15,d:0.15},{f:784,t:0.3,d:0.25}], low: [{f:440,t:0,d:0.2}] }[pattern] || [{f:440,t:0,d:0.2}];
    p.forEach(function(b){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = b.f; o.type = "sine";
      g.gain.setValueAtTime(0, now+b.t); g.gain.linearRampToValueAtTime(vol, now+b.t+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+b.t+b.d);
      o.connect(g).connect(ctx.destination); o.start(now+b.t); o.stop(now+b.t+b.d+0.02);
    });
  }

  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"cockpit" };
    var geoWatch = null, lastPos = null, simTimer = null, simSpeed = 0;
    var trip = { active:false, startTime:0, distance:0, warnings:0 };
    var map = null, mapMarkers = [], triggered = {}, lastLimitFetch = 0, currentLimit = null;
    var poiCache = {}, routeData = null, targetPos = null;
    var tfModel = null, cameraStream = null, visionLoop = null;
    var weatherData = null;
    var parkTimer = null, parkEndTime = 0;

    function getSettings(){ var s = store.get("settings", {}); var m = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); Object.keys(s).forEach(function(k){ m[k] = s[k]; }); return m; }
    function saveSettings(s){ store.set("settings", s); }
    function getWarnings(){ return store.get("warnings", []); }
    function getCustomVoice(){ return store.get("customVoice", {}); }
    function getCat(id){ return CATS.find(function(c){ return c.id === id; }); }

    function build(){
      if(view.screen === "cockpit") screenCockpit();
      else if(view.screen === "map") screenMap();
      else if(view.screen === "settings") screenSettings();
      else if(view.screen === "nav") screenNav();
      else if(view.screen === "vision") screenVision();
      else if(view.screen === "list") screenList();
      else if(view.screen === "report") screenReport();
      else if(view.screen === "park") screenPark();
    }

    /* ═══════════ COCKPIT ═══════════ */
    function screenCockpit(){
      var s = getSettings();
      var speed = lastPos ? Math.round((lastPos.coords.speed||0)*3.6) : 0;
      if(simTimer) speed = Math.round(simSpeed);
      
      var nextEvent = getNextEvent();
      
      // Tacho: Startet bei 7 Uhr (210°) und endet bei 5 Uhr (510°)
      var maxSpeed = 240;
      var startAngle = 210; 
      var endAngle = 510;
      var currentAngle = startAngle + (Math.min(speed, maxSpeed) / maxSpeed) * (endAngle - startAngle);

      var ticks = "";
      for (var i = 0; i <= 240; i += 20) {
        var angle = startAngle + (i / maxSpeed) * (endAngle - startAngle);
        var rad = (angle - 90) * Math.PI / 180;
        var isMajor = i % 40 === 0;
        var len = isMajor ? 15 : 8;
        
        var x1 = 100 + 75 * Math.cos(rad);
        var y1 = 100 + 75 * Math.sin(rad);
        var x2 = 100 + (75 - len) * Math.cos(rad);
        var y2 = 100 + (75 - len) * Math.sin(rad);
        
        // Farbe für Redline (über 180 km/h)
        var tickColor = (i > 180) ? '#ff5555' : (isMajor ? '#fff' : 'rgba(255,255,255,.3)');
        ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tickColor}" stroke-width="${isMajor ? 3 : 1.5}" />`;
        
        if (isMajor) {
          var tx = 100 + 60 * Math.cos(rad);
          var ty = 100 + 60 * Math.sin(rad);
          ticks += `<text x="${tx}" y="${ty}" fill="${tickColor}" font-size="12" font-weight="900" text-anchor="middle" dominant-baseline="middle">${i}</text>`;
        }
      }

      var etaStr = "—", remTimeStr = "—";
      if (routeData && routeData.totalTime) {
        var now = new Date();
        var eta = new Date(now.getTime() + routeData.totalTime * 1000);
        etaStr = eta.toLocaleTimeString("de-DE", {hour: '2-digit', minute:'2-digit'});
        remTimeStr = fmtTime(Math.round(routeData.totalTime));
      }

      var tachoColor = s.tachoColor;
      var arrowColor = s.arrowStyle === "gold" ? "#ffd700" : s.arrowStyle === "blue" ? "#4dd0e1" : "#ffffff";
      var arrowGlow = s.arrowStyle === "gold" ? "rgba(255,215,0,.8)" : s.arrowStyle === "blue" ? "rgba(77,208,225,.8)" : "rgba(255,255,255,.8)";

      var css = `
        .cpt-wrap{position:relative;height:calc(100vh - 100px);min-height:600px;background:radial-gradient(ellipse at 50% 30%,#0a1220 0%,#050810 80%);border-radius:20px;padding:16px;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,sans-serif;color:#fff}
        .cpt-top{display:flex;justify-content:space-between;z-index:10}
        .cpt-navbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:6px}
        
        .cpt-tacho{position:relative;width:300px;height:300px;margin:10px auto;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .1s}
        .cpt-tacho:active{transform:scale(.98)}
        .tacho-bg{position:absolute;inset:0;background:radial-gradient(circle, rgba(10,18,32,1) 0%, rgba(5,8,16,1) 100%);border-radius:50%;border:2px solid ${tachoColor}44;box-shadow:0 0 30px ${tachoColor}22, inset 0 0 20px rgba(0,0,0,.8)}
        
        .needle-container{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(${currentAngle}deg);transition:transform .3s cubic-bezier(0.4, 2.08, 0.55, 0.44)}
        .needle{width:4px;height:120px;background:linear-gradient(to top, transparent 40%, #ff3333 40%, #ff3333 100%);position:absolute;bottom:50%;transform-origin:bottom center;border-radius:2px;box-shadow:0 0 12px #ff3333}
        .needle-center{position:absolute;width:28px;height:28px;background:#111;border:4px solid #ff3333;border-radius:50%;z-index:2;box-shadow:0 0 20px #ff3333}
        
        .cpt-speed-box{position:absolute;bottom:70px;left:50%;transform:translateX(-50%);text-align:center;z-index:3;background:rgba(0,0,0,.6);padding:6px 16px;border-radius:12px;border:1px solid rgba(255,255,255,.1);box-shadow:0 4px 10px rgba(0,0,0,.5)}
        .cpt-speed{font-size:38px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 0 15px rgba(255,255,255,.3)}
        .cpt-unit{font-size:9px;color:#7fa5b8;font-weight:900;letter-spacing:2px;margin-top:2px}
        
        .cpt-limit{position:absolute;top:20px;right:20px;width:64px;height:64px;border-radius:50%;background:#fff;border:6px solid #ff3333;display:flex;align-items:center;justify-content:center;z-index:20;box-shadow:0 0 15px rgba(255,51,51,.5)}
        .cpt-limit-num{font-size:24px;font-weight:900;color:#000}
        
        .holo-container{perspective:800px;width:100%;height:160px;display:flex;align-items:center;justify-content:center;margin-top:5px;position:relative}
        .holo-base{position:absolute;bottom:0px;width:200px;height:40px;background:radial-gradient(ellipse, ${arrowGlow} 0%, transparent 70%);filter:blur(8px);border-radius:50%}
        .holo-arrow-box{position:relative;transform-style:preserve-3d;transform:rotateX(60deg) rotateZ(${nextEvent ? (nextEvent.modifier && nextEvent.modifier.indexOf('left') >= 0 ? -45 : nextEvent.modifier && nextEvent.modifier.indexOf('right') >= 0 ? 45 : 0) : 0}deg);animation:arrowFloat 1.5s infinite alternate}
        .holo-svg{width:100px;height:auto;filter:drop-shadow(0 0 20px ${arrowGlow})}
        @keyframes arrowFloat{0%{transform:rotateX(60deg) rotateZ(var(--rot,0deg)) translateZ(0)}100%{transform:rotateX(60deg) rotateZ(var(--rot,0deg)) translateZ(40px)}}

        .road-sign{position:absolute;top:-40px;left:50%;transform:translateX(-50%);background:#0066cc;border:2px solid #fff;border-radius:8px;padding:6px 16px;text-align:center;box-shadow:0 4px 10px rgba(0,0,0,.5);z-index:10;white-space:nowrap}
        .road-sign .num{font-size:18px;font-weight:900;color:#fff;background:#0055aa;display:inline-block;padding:2px 8px;border-radius:4px;margin-bottom:2px}
        .road-sign .dest{font-size:12px;font-weight:800;color:#fff}
        .road-sign .action{font-size:10px;color:#e0e0e0}

        .cpt-bottom{margin-top:auto;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border-radius:16px;padding:12px;border:1px solid rgba(255,255,255,.08);z-index:10}
        .cpt-stat{display:flex;justify-content:space-around;text-align:center;margin-bottom:8px}
        .cpt-stat div span:first-child{font-size:16px;font-weight:900;color:${tachoColor};display:block}
        .cpt-stat div span:last-child{font-size:8px;color:#7fa5b8;font-weight:800;text-transform:uppercase}
        .cpt-btn{width:100%;padding:14px;border:none;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;transition:.2s}
        .cpt-btn.start{background:linear-gradient(135deg,#4ade80,#22c55e);color:#000}
        .cpt-btn.stop{background:#ff5555;color:#fff}
      `;

      var html = `<style>${css}</style><div class="cpt-wrap">
      <div class="cpt-top">
        <div style="display:flex;gap:6px">
          <button data-nav="nav" class="cpt-navbtn" style="color:${tachoColor}">🧭 Route</button>
          <button data-nav="report" class="cpt-navbtn" style="color:#ff5555;font-weight:900">➕ Melden</button>
        </div>
        <div style="display:flex;gap:6px">
          ${weatherData ? `<div style="background:rgba(255,255,255,.06);padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;display:flex;align-items:center;gap:6px">${weatherData.temp}°C ${weatherData.icon}</div>` : ''}
          <button data-nav="settings" class="cpt-navbtn">⚙️</button>
        </div>
      </div>`;

      if(nextEvent && nextEvent.type === "nav"){
        var arrowAngle = nextEvent.modifier && nextEvent.modifier.indexOf('left') >= 0 ? -45 : nextEvent.modifier && nextEvent.modifier.indexOf('right') >= 0 ? 45 : 0;
        
        var roadName = nextEvent.instruction || "Straße";
        var roadNum = "";
        var roadDest = roadName;
        
        if (roadName.indexOf("A") === 0 || roadName.match(/^A\d+/)) {
            roadNum = roadName.split(" ")[0];
            roadDest = roadName.substring(roadName.indexOf(" ") + 1) || "";
        } else if (roadName.indexOf("B") === 0 || roadName.match(/^B\d+/)) {
            roadNum = roadName.split(" ")[0];
            roadDest = roadName.substring(roadName.indexOf(" ") + 1) || "";
        }

        html += `<div style="margin-top:10px;padding:10px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:12px;display:flex;justify-content:space-between;align-items:center;z-index:10">
          <div><div style="font-size:10px;color:#7fa5b8">ROUTE AKTIV</div><div style="font-size:13px;font-weight:900;color:#fff">${_esc(routeData.targetName)}</div></div>
          <div style="text-align:right"><div style="font-size:10px;color:#7fa5b8">ANKUNFT</div><div style="font-size:14px;font-weight:900;color:${tachoColor}">${etaStr} (${remTimeStr})</div></div>
        </div>`;

        html += `<div class="holo-container">
          <div class="road-sign">
            ${roadNum ? `<div class="num">${roadNum}</div>` : ''}
            <div class="dest">${_esc(roadDest)}</div>
            <div class="action">Ausfahrt in ${fmtDist(nextEvent.distance)}</div>
          </div>
          <div class="holo-base"></div>
          <div class="holo-arrow-box" style="--rot:${arrowAngle}deg">
            <svg class="holo-svg" viewBox="0 0 100 100">
              <defs>
                <linearGradient id="arrowGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stop-color="${arrowColor}"/>
                  <stop offset="100%" stop-color="${arrowColor}"/>
                </linearGradient>
              </defs>
              <polygon points="50,5 90,50 65,50 65,95 35,95 35,50 10,50" fill="url(#arrowGrad)" stroke="#fff" stroke-width="2"/>
            </svg>
          </div>
        </div>`;
      } else {
        html += `<div style="text-align:center;margin:25px 0;color:#7fa5b8;font-size:12px">Keine aktive Route.</div>`;
      }

      // Tacho
      html += `<div class="cpt-tacho" onclick="this.closest('.cpt-wrap').dispatchEvent(new CustomEvent('open-settings'))">
        ${currentLimit !== null ? `<div class="cpt-limit"><div class="cpt-limit-num">${currentLimit === 0 ? "∞" : currentLimit}</div></div>` : ''}
        <div class="tacho-bg"></div>
        <svg viewBox="0 0 200 200" style="position:absolute;inset:0;width:100%;height:100%;">
          <path d="M 39.3 156 A 75 75 0 1 1 160.7 156" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="8" />
          <path d="M 39.3 156 A 75 75 0 1 1 160.7 156" fill="none" stroke="${tachoColor}" stroke-width="8" stroke-linecap="round" stroke-dasharray="353" stroke-dashoffset="${353 - (Math.min(speed,maxSpeed)/maxSpeed * 353)}" style="transition:stroke-dashoffset .2s" />
          ${ticks}
        </svg>
        <div class="needle-container"><div class="needle"></div></div>
        <div class="needle-center"></div>
        <div class="cpt-speed-box">
          <div class="cpt-speed">${speed}</div>
          <div class="cpt-unit">KM/H</div>
        </div>
      </div>`;

      var elapsedMin = trip.active ? Math.floor((Date.now() - trip.startTime) / 60000) : 0;

      html += `<div class="cpt-bottom">
        <div class="cpt-stat">
          <div><span>${trip.distance.toFixed(1)} km</span><span>Strecke</span></div>
          <div><span>${elapsedMin} min</span><span>Zeit</span></div>
          <div><span>${trip.warnings}</span><span>Warnungen</span></div>
        </div>
        <div style="display:flex;gap:6px">
          ${trip.active 
            ? `<button data-trip="stop" class="cpt-btn stop" style="flex:1">⏹ Fahrt beenden</button>`
            : `<button data-trip="start" class="cpt-btn start" style="flex:1">▶ Fahrt starten</button>`}
          <button data-nav="park" class="cpt-btn" style="flex:1;background:rgba(255,255,255,.1);color:#fff">🅿️ Parkuhr</button>
        </div>
        ${!simTimer ? `<button id="simBtn" class="cpt-btn" style="margin-top:8px;background:#ffd54f;color:#000;font-size:12px">🧪 Testfahrt simulieren</button>` : ''}
      </div></div>`;

      container.innerHTML = html;
      bindNav(); bindCockpit();
      
      container.querySelector('.cpt-wrap').addEventListener('open-settings', function() {
          view.screen = "settings"; build();
      });
      
      fetchPOIsIfNeeded(); fetchSpeedLimitIfNeeded();
      if(!weatherData) fetchWeather();
    }

    /* ═══════════ SETTINGS (Tacho & Sprache) ═══════════ */
    function screenSettings(){
      var s = getSettings();
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>`;
      
      html += `<div class="card"><h3>🏎️ Tacho-Design</h3>
        <div class="field"><label>Alarm-Dauer (Sekunden)</label>
          <input type="range" id="setDuration" min="2" max="15" step="1" value="${s.alarmDuration}" style="width:100%">
          <div style="text-align:right;font-size:11px;font-weight:900;color:#4dd0e1;margin-top:2px" id="durLbl">${s.alarmDuration} Sekunden</div>
        </div>
        <div class="field" style="margin-top:10px"><label>Tacho-Farbe</label>
          <div style="display:flex;gap:8px;margin-top:6px">
            <button data-color="#4dd0e1" style="flex:1;height:36px;background:#4dd0e1;border:3px solid ${s.tachoColor==='#4dd0e1'?'#fff':'transparent'};border-radius:8px;cursor:pointer"></button>
            <button data-color="#ff5555" style="flex:1;height:36px;background:#ff5555;border:3px solid ${s.tachoColor==='#ff5555'?'#fff':'transparent'};border-radius:8px;cursor:pointer"></button>
            <button data-color="#4ade80" style="flex:1;height:36px;background:#4ade80;border:3px solid ${s.tachoColor==='#4ade80'?'#fff':'transparent'};border-radius:8px;cursor:pointer"></button>
            <button data-color="#b478ff" style="flex:1;height:36px;background:#b478ff;border:3px solid ${s.tachoColor==='#b478ff'?'#fff':'transparent'};border-radius:8px;cursor:pointer"></button>
            <button data-color="#ffd700" style="flex:1;height:36px;background:#ffd700;border:3px solid ${s.tachoColor==='#ffd700'?'#fff':'transparent'};border-radius:8px;cursor:pointer"></button>
          </div>
        </div>
        <div class="field" style="margin-top:10px"><label>Offline Modus</label>
          <button id="toggleOffline" style="width:100%;padding:10px;background:${s.offlineMode?'rgba(255,128,128,.2)':'rgba(74,222,128,.2)'};border:1px solid ${s.offlineMode?'#ff8080':'#4ade80'};color:${s.offlineMode?'#ff8080':'#4ade80'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">${s.offlineMode ? 'Offline (Karten aus)' : 'Online (Karten aktiv)'}</button>
        </div>
      </div>`;

      html += `<div class="card"><h3>🎵 Alarm-Töne</h3>`;
      var soundOptions = [
        { id:"siren", name:"🚨 Sirene" }, { id:"long_alarm", name:"🔔 Feueralarm" },
        { id:"radar", name:"📡 Radar" }, { id:"urgent", name:"⚠️ Dringend" },
        { id:"chime", name:"🎵 Glocke" }, { id:"low", name:"🕊️ Sanft" }
      ];

      CATS.forEach(c => {
        var currentSound = s.sounds[c.id] || "chime";
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <span style="font-size:11px;font-weight:800;flex:1">${c.icon} ${_esc(c.name.de)}</span>
          <div style="display:flex;gap:4px">
            <select data-sound="${c.id}" style="background:rgba(0,0,0,.5);color:#fff;border:1px solid #444;border-radius:6px;padding:4px 6px;font-size:10px;font-family:inherit">
              ${soundOptions.map(o => `<option value="${o.id}" ${currentSound===o.id?'selected':''}>${o.name}</option>`).join("")}
            </select>
            <button data-test="${c.id}" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;border-radius:6px;width:28px;cursor:pointer;font-size:12px">🔊</button>
          </div>
        </div>`;
      });
      html += `</div>`;

      html += `<div class="card"><h3>🌍 Sprache</h3>
        <select id="setLang" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:1px solid #444;border-radius:8px;color:#fff">
        ${Object.keys(LANGS).map(k => `<option value="${k}" ${s.lang===k?"selected":""}>${LANGS[k].name}</option>`).join("")}
        </select></div>`;

      container.innerHTML = html; bindNav();
      
      container.querySelector("#setDuration").addEventListener("input", function(e) {
        s.alarmDuration = parseInt(e.target.value);
        container.querySelector("#durLbl").textContent = s.alarmDuration + " Sekunden";
        saveSettings(s);
      });

      container.querySelectorAll("[data-color]").forEach(el => {
        el.addEventListener("click", function() { s.tachoColor = el.dataset.color; saveSettings(s); screenSettings(); });
      });
      
      container.querySelector("#toggleOffline").addEventListener("click", function() {
        s.offlineMode = !s.offlineMode; saveSettings(s); screenSettings();
      });

      container.querySelector("#setLang").addEventListener("change", e => { s.lang = e.target.value; saveSettings(s); });
      container.querySelectorAll("[data-sound]").forEach(el => {
        el.addEventListener("change", e => { s.sounds[el.dataset.sound] = e.target.value; saveSettings(s); });
      });
      container.querySelectorAll("[data-test]").forEach(el => {
        el.addEventListener("click", function() { playBeep(s.sounds[el.dataset.test] || "chime", 0.8, s.alarmDuration); });
      });
    }

    /* ═══════════ NAVIGATION MIT VERLAUF & FAVORITEN ═══════════ */
    function screenNav(){
      var hist = store.get("navHistory", []);
      var favs = store.get("navFavorites", []);
      
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>
      <div class="card"><h3>🧭 Navigation</h3>
      <div class="field"><label>Ziel eingeben</label>
      <div style="display:flex;gap:6px">
        <input id="navTarget" placeholder="Adresse..." style="flex:1;font-size:14px;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff">
        <button id="navFav" style="background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;border-radius:10px;width:44px;font-size:18px;cursor:pointer">⭐</button>
      </div></div>
      <button class="btn full" id="navGo" style="padding:12px;margin-top:8px;background:linear-gradient(135deg,#4dd0e1,#b478ff);color:#000;font-weight:900;border:none;border-radius:10px;cursor:pointer">🔍 Route berechnen</button>
      ${routeData ? `<div style="margin-top:14px;padding:12px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:10px">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <div><div style="font-size:11px;color:var(--text-mute);font-weight:800">ROUTE AKTIV</div><div style="font-size:14px;font-weight:900;color:#4dd0e1;margin-top:4px">${fmtDist(routeData.totalDist)}</div></div>
          <button id="navClear" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;font-weight:800">Beenden</button>
        </div>
      </div>` : ""}</div>`;

      if(favs.length){
        html += `<div class="card"><h3>⭐ Favoriten</h3>`;
        favs.forEach((f, i) => {
          html += `<div style="display:flex;justify-content:space-between;padding:8px;background:rgba(0,0,0,.2);border-radius:6px;margin-bottom:4px">
            <div style="font-size:12px;font-weight:800;cursor:pointer" onclick="document.getElementById('navTarget').value='${_esc(f)}'">${_esc(f)}</div>
            <button data-delfav="${i}" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>
          </div>`;
        });
        html += `</div>`;
      }

      if(hist.length){
        html += `<div class="card"><h3>🕒 Verlauf</h3>`;
        hist.slice(0, 5).forEach(h => {
          html += `<div style="display:flex;justify-content:space-between;padding:8px;background:rgba(0,0,0,.2);border-radius:6px;margin-bottom:4px">
            <div style="font-size:12px;font-weight:800;cursor:pointer" onclick="document.getElementById('navTarget').value='${_esc(h.addr)}'">${_esc(h.addr)}</div>
            <div style="font-size:10px;color:var(--text-mute)">${h.date}</div>
          </div>`;
        });
        html += `</div>`;
      }

      container.innerHTML = html; bindNav();
      
      container.querySelector("#navGo").addEventListener("click", function(){
        var target = container.querySelector("#navTarget").value.trim();
        if(!target) return;
        
        // Save to history
        hist.unshift({ addr: target, date: new Date().toLocaleString("de-DE") });
        store.set("navHistory", hist.slice(0, 20));
        
        if(!lastPos){ alert("GPS fehlt"); return; }
        geocodeAndRoute(target);
      });

      container.querySelector("#navFav").addEventListener("click", function(){
        var target = container.querySelector("#navTarget").value.trim();
        if(!target) return;
        if(!favs.includes(target)){ favs.push(target); store.set("navFavorites", favs); screenNav(); }
      });

      container.querySelectorAll("[data-delfav]").forEach(el => {
        el.addEventListener("click", () => {
          favs.splice(parseInt(el.dataset.delfav), 1); store.set("navFavorites", favs); screenNav();
        });
      });
      
      var nc = container.querySelector("#navClear");
      if(nc) nc.addEventListener("click", function(){ routeData = null; screenNav(); });
    }

    function geocodeAndRoute(query){
      fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(query) + "&limit=1")
        .then(r => r.json()).then(data => {
          if(!data || !data.length){ alert("Ziel nicht gefunden"); return; }
          targetPos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          fetch(`https://router.project-osrm.org/route/v1/driving/${lastPos.coords.longitude},${lastPos.coords.latitude};${targetPos.lng},${targetPos.lat}?steps=true&geometries=geojson&overview=false`)
            .then(r => r.json()).then(rdata => {
              if(!rdata.routes || !rdata.routes.length){ alert("Route nicht gefunden"); return; }
              routeData = { totalDist: rdata.routes[0].distance, totalTime: rdata.routes[0].duration, steps: rdata.routes[0].legs[0].steps, currentStep: 0, targetName: data[0].display_name.split(",")[0] };
              if(HalDo.Notify) HalDo.Notify.success("Route berechnet: " + fmtDist(routeData.totalDist));
              view.screen = "cockpit"; build();
            }).catch(e => alert("Routing-Fehler: " + e.message));
        }).catch(e => alert("Geocoding-Fehler: " + e.message));
    }

    /* ═══════════ PARKUHR & MELDEN ═══════════ */
    function screenPark(){
      var now = Date.now();
      var remaining = parkEndTime > now ? Math.floor((parkEndTime - now) / 1000) : 0;
      
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>
      <div class="card" style="text-align:center">
        <h3>🅿️ Parkuhr</h3>
        <div style="font-size:56px;font-weight:900;color:${remaining > 0 ? '#4dd0e1' : '#ff5555'};margin:20px 0" id="parkTime">${fmtTime(remaining)}</div>
        ${remaining === 0 && parkEndTime > 0 ? '<div style="color:#ff5555;font-weight:900">⏰ Zeit abgelaufen!</div>' : ''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:20px">
          <button class="btn" onclick="window._parkAdd(15)" style="background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;padding:12px;border-radius:8px;font-weight:900">+ 15 Min</button>
          <button class="btn" onclick="window._parkAdd(30)" style="background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;padding:12px;border-radius:8px;font-weight:900">+ 30 Min</button>
          <button class="btn" onclick="window._parkAdd(60)" style="background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;padding:12px;border-radius:8px;font-weight:900">+ 1 Std</button>
          <button class="btn" onclick="window._parkStop()" style="background:rgba(255,85,85,.2);border:1px solid #ff5555;color:#ff5555;padding:12px;border-radius:8px;font-weight:900">⏹ Stopp</button>
        </div>
      </div>`;
      
      container.innerHTML = html; bindNav();
      
      window._parkAdd = function(mins) {
        parkEndTime = (parkEndTime > Date.now() ? parkEndTime : Date.now()) + mins * 60000;
        if(parkTimer) clearInterval(parkTimer);
        parkTimer = setInterval(updateParkUI, 1000);
        updateParkUI();
      };
      
      window._parkStop = function() {
        parkEndTime = 0;
        if(parkTimer) clearInterval(parkTimer);
        updateParkUI();
      };
      
      function updateParkUI() {
        var el = document.getElementById("parkTime");
        if(!el) return;
        var rem = parkEndTime > Date.now() ? Math.floor((parkEndTime - Date.now()) / 1000) : 0;
        el.textContent = fmtTime(rem);
        el.style.color = rem > 0 ? '#4dd0e1' : '#ff5555';
        if(rem === 0 && parkEndTime > 0) {
           if(HalDo.Notify) HalDo.Notify.error("Parkzeit abgelaufen!");
           playBeep("urgent", 1.0, 5);
           parkEndTime = 0;
        }
      }
      
      if(parkTimer) clearInterval(parkTimer);
      if(parkEndTime > Date.now()) parkTimer = setInterval(updateParkUI, 1000);
    }

    function screenReport(){
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>
      <div class="card"><h3>➕ Warnung melden</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
      
      CATS.forEach(c => {
        html += `<button data-report="${c.id}" style="padding:14px;background:rgba(0,0,0,.2);border:1px solid ${c.color}44;border-radius:10px;color:inherit;font-family:inherit;text-align:center;cursor:pointer">
          <div style="font-size:26px">${c.icon}</div>
          <div style="font-size:10px;color:${c.color};margin-top:4px;font-weight:800">${_esc(c.name.de)}</div>
        </button>`;
      });
      
      html += `</div></div>`;
      container.innerHTML = html; bindNav();
      
      container.querySelectorAll("[data-report]").forEach(el => {
        el.addEventListener("click", function() {
          if(!lastPos){ alert("GPS fehlt zum Melden"); return; }
          var catId = el.dataset.report;
          var warnings = getWarnings();
          warnings.push({ id: "w"+Date.now(), cat: catId, lat: lastPos.coords.latitude, lng: lastPos.coords.longitude, created: Date.now() });
          store.set("warnings", warnings);
          if(HalDo.Notify) HalDo.Notify.success("Warnung gemeldet!");
          view.screen = "cockpit"; build();
        });
      });
    }

    /* ═══════════ WETTER & HILFSFUNKTIONEN ═══════════ */
    function fetchWeather(){
      if(!lastPos || getSettings().offlineMode) return;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lastPos.coords.latitude}&longitude=${lastPos.coords.longitude}&current_weather=true`)
        .then(r => r.json()).then(data => {
          if(data.current_weather) {
            var temp = Math.round(data.current_weather.temperature);
            var code = data.current_weather.weathercode;
            var icon = "☀️";
            if(code > 0 && code < 4) icon = "🌤️";
            if(code >= 4 && code < 70) icon = "☁️";
            if(code >= 70 && code < 80) icon = "🌧️";
            if(code >= 80) icon = "⛈️";
            weatherData = { temp, icon };
            if(view.screen === "cockpit") build();
          }
        }).catch(()=>{});
    }

    function checkTriggers(pos){
      var s = getSettings(), lat = pos.coords.latitude, lng = pos.coords.longitude;
      var zones = [2000, 1000, 500, 200];
      getWarnings().forEach(w => {
        if(!s.enabled[w.cat]) return;
        var d = haversine(lat, lng, w.lat, w.lng), cat = getCat(w.cat); if(!cat) return;
        for(var i=0; i<zones.length; i++){
          var key = w.id + "_z" + i;
          if(d <= zones[i] && !triggered[key]){
            triggered[key] = true; 
            speakAlert(cat, d, s); 
            trip.warnings++;
            var wn = container.querySelector("#tripWarn"); if(wn) wn.textContent = trip.warnings;
            break;
          }
        }
      });
      Object.keys(poiCache).forEach(id => {
        var p = poiCache[id]; if(!p.cat || !s.enabled[p.cat]) return;
        var d = haversine(lat, lng, p.lat, p.lng), key = "poi_" + id;
        if(d < s.warnDist && !triggered[key]){ triggered[key] = true; speakAlert(getCat(p.cat), d, s); }
        if(d > s.warnDist + 200) delete triggered[key];
      });
    }

    function speakAlert(cat, dist, settings){
      var cv = getCustomVoice();
      if(settings.beepOn) playBeep(settings.sounds[cat.id] || "chime", 0.9, settings.alarmDuration);
      
      if(cv[cat.id]){ 
        new Audio(cv[cat.id]).play().catch(()=>{}); 
      } else if(settings.voiceOn && window.speechSynthesis){
        var txt = (cat.voice[settings.lang] || cat.voice.de).replace("{d}", fmtDist(dist));
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(txt); u.lang = LANGS[settings.lang].code;
        window.speechSynthesis.speak(u);
      }
      if(settings.vibrateOn && navigator.vibrate) navigator.vibrate([200,100,200]);
    }

    function fetchSpeedLimitIfNeeded(){
      if(!lastPos || simTimer || getSettings().offlineMode) return; 
      var now = Date.now();
      if(now - lastLimitFetch < 15000) return; 
      lastLimitFetch = now;
      var lat = lastPos.coords.latitude, lng = lastPos.coords.longitude;
      
      fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(`[out:json];way(around:30,${lat},${lng})["highway"]["maxspeed"];out tags;`))
        .then(r => r.json()).then(data => {
          if(data.elements && data.elements.length > 0){
            var ms = data.elements[0].tags.maxspeed;
            if(ms === "none" || ms === "signals" || ms === "DE:urban") currentLimit = ms === "DE:urban" ? 50 : 0;
            else { var num = parseInt(ms); currentLimit = isNaN(num) ? null : num; }
          } else currentLimit = null;
          
          if(view.screen === "cockpit"){
            var el = container.querySelector(".cpt-limit");
            if(el){
              el.style.display = currentLimit === null ? "none" : "flex";
              el.innerHTML = `<div class="cpt-limit-num">${currentLimit === 0 ? "∞" : currentLimit}</div>`;
            }
          }
        }).catch(()=>{});
    }

    function fetchPOIsIfNeeded(){
      if(!lastPos || simTimer || getSettings().offlineMode) return;
      var lat = lastPos.coords.latitude, lng = lastPos.coords.longitude;
      var s = getSettings();
      var enabled = CATS.filter(c => c.type === "poi" && s.enabled[c.id]);
      if(!enabled.length) return;
      var filter = enabled.map(c => `node(around:3000,${lat},${lng})[${c.osm}];`).join("");
      fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(`[out:json];(${filter});out center 20;`))
        .then(r => r.json()).then(data => {
          if(!data.elements) return;
          data.elements.forEach(el => {
            if(!poiCache[el.id]){
              poiCache[el.id] = { id: el.id, lat: el.lat, lng: el.lon, cat: guessCatFromTags(el.tags) };
            }
          });
        }).catch(()=>{});
    }

    function guessCatFromTags(tags){
      if(!tags) return null;
      if(tags.amenity === "fuel") return "poi_fuel";
      if(tags.highway === "rest_area") return "poi_rest";
      return null;
    }

    function getNextEvent(){
      if(routeData && routeData.steps){
        for(var i = routeData.currentStep; i < routeData.steps.length; i++){
          var st = routeData.steps[i];
          if(st.maneuver && st.maneuver.type !== "depart"){
            return { type:"nav", arrow:getManeuverIcon(st.maneuver), modifier:st.maneuver.modifier, instruction:st.name || st.maneuver.type, distance: st.distance };
          }
        }
      }
      return null;
    }
    function getManeuverIcon(m){ if(!m) return "⬆️"; if(m.type==="turn") return m.modifier && m.modifier.indexOf("left")>=0 ? "⬅️" : "➡️"; if(m.type==="arrive") return "🏁"; return "⬆️"; }

    function screenVision(){
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>
      <div class="card">
        <h3>🤖 KI-Kamera (TensorFlow)</h3>
        <div style="font-size:11px;color:var(--text-mute);margin-bottom:10px">Erkennt Autos, LKW, Personen in Echtzeit.</div>
        <div style="position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center">
          <video id="visionVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;display:none"></video>
          <canvas id="visionCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;display:none"></canvas>
          <div id="visionPlaceholder" style="color:#aaa;text-align:center;padding:20px"><div style="font-size:44px">📷</div><div style="font-size:11px;margin-top:8px">Kamera starten</div></div>
        </div>
        <button class="btn full" id="visionStart" style="padding:14px;margin-top:10px;background:linear-gradient(135deg,#b478ff,#4dd0e1);color:#fff">📷 KI aktivieren</button>
        <div id="visionStatus" style="text-align:center;font-size:11px;font-weight:900;color:#4ade80;margin-top:8px">Bereit</div>
      </div>`;
      container.innerHTML = html;
      bindNav();
      container.querySelector("#visionStart").addEventListener("click", startVision);
    }

    async function startVision(){
      if(tfModel){ stopVision(); return; }
      var status = document.getElementById("visionStatus");
      status.textContent = "Lade KI-Modell...";
      try {
        if(!window.tf || !window.cocoSsd){
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.2.0/dist/tf.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js");
        }
        tfModel = await cocoSsd.load();
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        var video = document.getElementById("visionVideo");
        video.srcObject = cameraStream; video.style.display = "block";
        document.getElementById("visionPlaceholder").style.display = "none";
        document.getElementById("visionCanvas").style.display = "block";
        document.getElementById("visionStart").textContent = "⏹ KI stoppen";
        status.textContent = "🟢 Live - Analysiere...";
        runVisionLoop();
      } catch(e){ status.textContent = "❌ Fehler: " + e.message; }
    }

    function loadScript(src){
      return new Promise((res, rej) => {
        var s = document.createElement("script");
        s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }

    async function runVisionLoop(){
      if(!tfModel || !cameraStream) return;
      var video = document.getElementById("visionVideo"), canvas = document.getElementById("visionCanvas");
      if(!video || !canvas) return;
      var ctx2d = canvas.getContext("2d");
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      
      async function detect(){
        if(!tfModel || !cameraStream) return;
        var predictions = await tfModel.detect(video);
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        predictions.forEach(p => {
          if(p.class === "car" || p.class === "truck" || p.class === "person" || p.class === "bicycle"){
            var [x, y, w, h] = p.bbox;
            ctx2d.strokeStyle = p.class === "person" ? "#ff5555" : "#4dd0e1";
            ctx2d.lineWidth = 3; ctx2d.strokeRect(x, y, w, h);
            ctx2d.fillStyle = p.class === "person" ? "#ff5555" : "#4dd0e1";
            ctx2d.font = "16px sans-serif";
            ctx2d.fillText(p.class.toUpperCase() + " " + Math.round(p.score * 100) + "%", x, y > 20 ? y - 5 : y + 20);
          }
        });
        if(cameraStream) visionLoop = requestAnimationFrame(detect);
      }
      detect();
    }

    function stopVision(){
      if(visionLoop) cancelAnimationFrame(visionLoop);
      visionLoop = null;
      if(cameraStream){ cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
      tfModel = null; screenVision();
    }

    function screenMap(){
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>
      <div class="card" style="padding:0;overflow:hidden;height:calc(100vh - 200px);position:relative"><div id="blMap" style="width:100%;height:100%;background:#0a1220"></div></div>`;
      container.innerHTML = html; bindNav(); initMap();
    }
    function initMap(){
      if(!document.getElementById("leaflet-css")){
        var lc = document.createElement("link"); lc.id = "leaflet-css"; lc.rel = "stylesheet"; lc.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(lc);
      }
      if(window.L) return buildMap();
      var s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload = buildMap; document.head.appendChild(s);
    }
    function buildMap(){
      var el = document.getElementById("blMap"); if(!el || !window.L) return; el.innerHTML = "";
      var center = lastPos ? [lastPos.coords.latitude, lastPos.coords.longitude] : [51.1657, 10.4515];
      map = L.map(el, { zoomControl:false }).setView(center, 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19 }).addTo(map);
      updateMapMarkers();
    }
    function updateMapMarkers(){
      if(!map) return; mapMarkers.forEach(m => map.removeLayer(m)); mapMarkers = [];
      getWarnings().forEach(w => {
        var cat = getCat(w.cat); if(!cat) return;
        var icon = L.divIcon({ html:`<div style="background:${cat.color};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff">${cat.icon}</div>`, className:"", iconSize:[32,32], iconAnchor:[16,16] });
        mapMarkers.push(L.marker([w.lat, w.lng], { icon:icon }).addTo(map));
      });
      if(lastPos){
        var uicon = L.divIcon({ html:`<div style="background:#4dd0e1;border:3px solid #fff;border-radius:50%;width:20px;height:20px;box-shadow:0 0 20px #4dd0e1"></div>`, className:"", iconSize:[20,20], iconAnchor:[10,10] });
        mapMarkers.push(L.marker([lastPos.coords.latitude, lastPos.coords.longitude], { icon:uicon }).addTo(map));
        map.setView([lastPos.coords.latitude, lastPos.coords.longitude]);
      }
    }

    function screenList(){
      var warnings = getWarnings();
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>
      <div class="card"><h3>📋 Gespeicherte Warnungen (${warnings.length})</h3>`;
      if(!warnings.length){
        html += `<div style="text-align:center;color:var(--text-mute);padding:20px;font-size:12px">Keine Warnungen gespeichert.</div>`;
      } else {
        warnings.slice().reverse().forEach(w => {
          var c = getCat(w.cat) || CATS[0];
          html += `<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid ${c.color}">
            <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:900">${c.icon} ${_esc(c.name.de)}</div>
            <div style="font-size:10px;color:var(--text-mute)">${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}</div></div>
            <button data-del="${w.id}" style="background:rgba(255,128,128,.2);border:none;color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer">✕</button>
          </div>`;
        });
      }
      html += `</div>`; container.innerHTML = html; bindNav();
      container.querySelectorAll("[data-del]").forEach(el => {
        el.addEventListener("click", () => {
          if(!confirm("Löschen?")) return;
          saveWarnings(getWarnings().filter(w => w.id !== el.dataset.del)); screenList();
        });
      });
    }

    function startSimulation(){
      if(simTimer) clearInterval(simTimer);
      lastPos = { coords: { latitude: 51.1657, longitude: 10.4515, speed: 0 } }; 
      trip = { active:true, startTime:Date.now(), distance:0, warnings:0 };
      
      simSpeed = 30;
      simTimer = setInterval(() => {
        simSpeed = Math.min(180, simSpeed + Math.random() * 15);
        if(simSpeed > 150 && Math.random() > 0.8) simSpeed -= 40; 
        trip.distance += (simSpeed / 3600);
        
        if(Math.random() > 0.95){
           var randomCat = CATS[Math.floor(Math.random()*CATS.length)];
           speakAlert(randomCat, 500, getSettings());
           trip.warnings++;
        }

        if(view.screen === "cockpit"){
          var t = container.querySelector(".cpt-speed");
          if(t) t.textContent = Math.round(simSpeed);
          var d = container.querySelector("#tripDist");
          if(d) d.textContent = trip.distance.toFixed(1) + " km";
          var w = container.querySelector("#tripWarn");
          if(w) w.textContent = trip.warnings;
          build();
        }
      }, 1000);
      build();
    }

    function startGeo(){
      if(!navigator.geolocation) return;
      if(geoWatch) navigator.geolocation.clearWatch(geoWatch);
      geoWatch = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy:true, maximumAge:3000, timeout:15000 });
    }
    function onPos(pos){
      if(simTimer) return;
      if(lastPos && trip.active){
        var d = haversine(lastPos.coords.latitude, lastPos.coords.longitude, pos.coords.latitude, pos.coords.longitude);
        if(d > 3 && d < 500) trip.distance += d / 1000;
      }
      lastPos = pos;
      checkTriggers(pos);
      if(view.screen === "cockpit"){
        var t = container.querySelector(".cpt-speed");
        if(t) t.textContent = Math.round((pos.coords.speed||0)*3.6);
        fetchPOIsIfNeeded(); fetchSpeedLimitIfNeeded();
      }
      if(view.screen === "map" && map) updateMapMarkers();
    }
    function onErr(err){ console.warn("[Blitzer] GPS:", err.message); }

    function bindNav(){
      container.querySelectorAll("[data-nav]").forEach(el => {
        el.addEventListener("click", () => { view.screen = el.dataset.nav; build(); });
      });
    }
    function bindCockpit(){
      var tb = container.querySelector("[data-trip]");
      if(tb) tb.addEventListener("click", () => {
        if(tb.dataset.trip === "start"){ trip = { active:true, startTime:Date.now(), distance:0, warnings:0 }; if(HalDo.Notify) HalDo.Notify.success("Fahrt gestartet!"); }
        else { trip.active = false; if(simTimer){ clearInterval(simTimer); simTimer = null; } if(HalDo.Notify) HalDo.Notify.info("Fahrt beendet: " + trip.distance.toFixed(1) + " km"); }
        build();
      });
      var simBtn = container.querySelector("#simBtn");
      if(simBtn) simBtn.addEventListener("click", startSimulation);
    }

    startGeo(); build();
  }

  HalDoApp("blitzer", { name: "HalDo Blitzer", icon: "⚠️", render: render, category: "werkzeuge" });
  console.log("🦚 blitzer.js v12.0 geladen — Tacho(7-5) · Wetter · Navi-Verlauf · Parkuhr · Community");
})();
