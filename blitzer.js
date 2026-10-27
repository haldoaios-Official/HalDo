/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BLITZER v6.0 · ULTIMATE COCKPIT
   SVG Tacho · 3D Hologramm · Push-Notifications · Custom Töne
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  /* ═══════════ KATEGORIEN ═══════════ */
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

  var LANGS = { de:{ name:"Deutsch", code:"de-DE" }, en:{ name:"English", code:"en-US" }, tr:{ name:"Türkçe", code:"tr-TR" }, ar:{ name:"العربية", code:"ar-SA" }, ku:{ name:"Kurdî (Ezidi)", code:"tr-TR" }, fr:{ name:"Français", code:"fr-FR" } };

  var DEFAULT_SETTINGS = { enabled: {}, lang:"de", voiceOn:true, beepOn:true, notifyOn:true, warnDist: 1000, sounds:{} };
  CATS.forEach(function(c){ DEFAULT_SETTINGS.enabled[c.id] = true; DEFAULT_SETTINGS.sounds[c.id] = c.id === "blitzer_fix" ? "urgent" : "medium"; });

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function haversine(lat1,lng1,lat2,lng2){ var R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180; var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2); return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); }
  function fmtDist(m){ return m<1000 ? Math.round(m/10)*10 + " m" : (m/1000).toFixed(1) + " km"; }
  function fmtTime(sec){ var h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=sec%60; return (h>0?h+"h ":"")+m+"m "+s+"s"; }

  /* ═══════════ AUDIO ENGINE ═══════════ */
  var audioCtx = null;
  function getAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
  function playBeep(pattern, vol){
    var ctx = getAudio(); if(!ctx) return; var now = ctx.currentTime;
    var p = {
      urgent: [{f:880,t:0,d:0.1},{f:880,t:0.15,d:0.1}],
      alarm:  [{f:1200,t:0,d:0.08},{f:1200,t:0.12,d:0.08}],
      chime:  [{f:523,t:0,d:0.15},{f:659,t:0.15,d:0.15},{f:784,t:0.3,d:0.25}],
      low:    [{f:440,t:0,d:0.2}]
    }[pattern] || [{f:440,t:0,d:0.2}];
    p.forEach(function(b){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = b.f; o.type = "sine";
      g.gain.setValueAtTime(0, now+b.t); g.gain.linearRampToValueAtTime(vol, now+b.t+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+b.t+b.d);
      o.connect(g).connect(ctx.destination); o.start(now+b.t); o.stop(now+b.t+b.d+0.02);
    });
  }

  /* ═══════════ MAIN RENDER ═══════════ */
  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"cockpit" };
    var geoWatch = null, lastPos = null, simTimer = null;
    var trip = { active:false, startTime:0, distance:0, warnings:0 };
    var map = null, mapMarkers = [], triggered = {}, lastLimitFetch = 0, currentLimit = null;
    var poiCache = {}, routeData = null;

    function getSettings(){ var s = store.get("settings", {}); var m = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); Object.keys(s).forEach(function(k){ m[k] = s[k]; }); return m; }
    function saveSettings(s){ store.set("settings", s); }
    function getWarnings(){ return store.get("warnings", []); }
    function getCat(id){ return CATS.find(function(c){ return c.id === id; }); }

    function build(){
      if(view.screen === "cockpit") screenCockpit();
      else if(view.screen === "map") screenMap();
      else if(view.screen === "settings") screenSettings();
      else if(view.screen === "nav") screenNav();
      else if(view.screen === "vision") screenVision();
      else if(view.screen === "list") screenList();
    }

    /* ═══════════ COCKPIT SCREEN (SVG + 3D) ═══════════ */
    function screenCockpit(){
      var s = getSettings();
      var speed = lastPos ? Math.round((lastPos.coords.speed||0)*3.6) : 0;
      if(simTimer) speed = 85; // Simulation

      var nextEvent = getNextEvent();
      
      // Tacho SVG Winkel (Max 240 km/h)
      var maxSpeed = 240;
      var percent = Math.min(1, speed / maxSpeed);
      var dashArray = 565; // Umfang des SVG Kreises
      var dashOffset = dashArray - (percent * dashArray);

      var css = `
        .cpt-wrap{position:relative;height:calc(100vh - 100px);min-height:600px;background:radial-gradient(ellipse at 50% 30%,#0a1220 0%,#050810 80%);border-radius:20px;padding:16px;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,sans-serif;color:#fff}
        .cpt-top{display:flex;justify-content:space-between;z-index:10}
        .cpt-navbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:6px}
        .cpt-tacho{position:relative;width:260px;height:260px;margin:20px auto;display:flex;flex-direction:column;align-items:center;justify-content:center}
        .svg-ring{position:absolute;top:0;left:0;width:100%;height:100%;transform:rotate(135deg)}
        .svg-ring circle{fill:none;stroke-linecap:round}
        .svg-ring .bg{stroke:rgba(255,255,255,.05);stroke-width:12}
        .svg-ring .fg{stroke:#4dd0e1;stroke-width:12;stroke-dasharray:565;transition:stroke-dashoffset .3s ease-out}
        .svg-ring .fg.fast{stroke:#ffd54f}
        .svg-ring .fg.veryfast{stroke:#ff5555}
        .cpt-speed{font-size:82px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;z-index:2}
        .cpt-unit{font-size:12px;color:#7fa5b8;font-weight:900;letter-spacing:3px;margin-top:4px;z-index:2}
        .cpt-limit{position:absolute;top:20px;right:20px;width:72px;height:72px;border-radius:50%;background:#fff;border:8px solid #ff3333;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.5);z-index:20}
        .cpt-limit-num{font-size:28px;font-weight:900;color:#000}
        
        /* 3D Hologram Arrow */
        .holo-container{perspective:800px;width:100%;height:120px;display:flex;align-items:center;justify-content:center;margin-top:10px}
        .holo-arrow{font-size:64px;color:#4dd0e1;text-shadow:0 0 15px #4dd0e1, 0 0 30px #4dd0e1;transform:rotateX(60deg) rotateZ(var(--angle,0deg));transform-style:preserve-3d;animation:holoPulse 1.5s infinite alternate}
        @keyframes holoPulse{from{filter:brightness(1);transform:rotateX(60deg) rotateZ(var(--angle,0deg)) translateZ(0)}to{filter:brightness(1.5);transform:rotateX(60deg) rotateZ(var(--angle,0deg)) translateZ(20px)}}
        
        .cpt-bottom{margin-top:auto;background:rgba(0,0,0,.4);backdrop-filter:blur(10px);border-radius:16px;padding:12px;border:1px solid rgba(255,255,255,.08);z-index:10}
        .cpt-stat{display:flex;justify-content:space-around;text-align:center;margin-bottom:8px}
        .cpt-stat div span:first-child{font-size:18px;font-weight:900;color:#4dd0e1;display:block}
        .cpt-stat div span:last-child{font-size:8px;color:#7fa5b8;font-weight:800;text-transform:uppercase}
        .cpt-btn{width:100%;padding:14px;border:none;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;transition:.2s}
        .cpt-btn.start{background:linear-gradient(135deg,#4ade80,#22c55e);color:#000}
        .cpt-btn.stop{background:#ff5555;color:#fff}
      `;

      var html = `<style>${css}</style><div class="cpt-wrap">
      <div class="cpt-top">
        <div style="display:flex;gap:6px">
          <button data-nav="nav" class="cpt-navbtn" style="color:#4dd0e1">🧭 Route</button>
          <button data-nav="vision" class="cpt-navbtn" style="color:#b478ff">🤖 KI</button>
        </div>
        <button data-nav="settings" class="cpt-navbtn">⚙️</button>
      </div>`;

      // 3D Hologram
      var arrowAngle = 0;
      if(nextEvent && nextEvent.type === "nav"){
        var mod = nextEvent.modifier || "";
        if(mod.indexOf("left") >= 0) arrowAngle = -45;
        if(mod.indexOf("right") >= 0) arrowAngle = 45;
        
        html += `<div class="holo-container"><div class="holo-arrow" style="--angle:${arrowAngle}deg">⬆️</div></div>
        <div style="text-align:center;margin-top:-10px;z-index:10">
          <div style="font-size:14px;font-weight:900;color:#4dd0e1">${_esc(nextEvent.instruction)}</div>
          <div style="font-size:12px;color:#fff;margin-top:4px">in ${fmtDist(nextEvent.distance)}</div>
        </div>`;
      } else {
        html += `<div style="text-align:center;margin-top:20px;color:#7fa5b8;font-size:12px">Keine aktive Route.</div>`;
      }

      // SVG Tacho
      html += `<div class="cpt-tacho">
        ${currentLimit !== null ? `<div class="cpt-limit"><div class="cpt-limit-num">${currentLimit === 0 ? "∞" : currentLimit}</div></div>` : ''}
        <svg class="svg-ring" viewBox="0 0 200 200">
          <circle class="bg" cx="100" cy="100" r="90"></circle>
          <circle class="fg ${speed>130?'veryfast':speed>100?'fast':''}" cx="100" cy="100" r="90" style="stroke-dashoffset:${dashOffset}"></circle>
        </svg>
        <div class="cpt-speed">${speed}</div>
        <div class="cpt-unit">KM/H</div>
      </div>`;

      var elapsedMin = trip.active ? Math.floor((Date.now() - trip.startTime) / 60000) : 0;

      // Bottom Bar
      html += `<div class="cpt-bottom">
        <div class="cpt-stat">
          <div><span>${trip.distance.toFixed(1)} km</span><span>Strecke</span></div>
          <div><span>${elapsedMin} min</span><span>Zeit</span></div>
          <div><span>${trip.warnings}</span><span>Warnungen</span></div>
        </div>
        ${trip.active 
          ? `<button data-trip="stop" class="cpt-btn stop">⏹ Fahrt beenden</button>`
          : `<button data-trip="start" class="cpt-btn start">▶ Fahrt starten</button>`}
        ${!navigator.geolocation ? `<button id="simBtn" class="cpt-btn" style="margin-top:8px;background:#ffd54f;color:#000;font-size:12px">🧪 Testfahrt simulieren</button>` : ''}
      </div></div>`;

      container.innerHTML = html;
      bindNav(); bindCockpit();
      fetchSpeedLimitIfNeeded();
    }

    /* ═══════════ NAVIGATION LOGIK ═══════════ */
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

    /* ═══════════ SETTINGS ═══════════ */
    function screenSettings(){
      var s = getSettings();
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>`;

      // Push Notifications
      html += `<div class="card"><h3>🔔 Front-Display Warnungen</h3>
        <div style="font-size:11px;color:var(--text-mute);margin-bottom:8px">Erhalte Nachrichten auf dem Display, auch wenn die App im Hintergrund ist.</div>
        <button id="reqNotify" style="width:100%;padding:12px;background:${Notification.permission==="granted"?'rgba(74,222,128,.2)':'rgba(255,255,255,.1)'};border:1px solid ${Notification.permission==="granted"?'#4ade80':'#fff'};color:${Notification.permission==="granted"?'#4ade80':'#fff'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">${Notification.permission==="granted"?'✅ Push aktiviert':'⚠️ Push aktivieren'}</button>
      </div>`;

      // Töne pro Kategorie
      html += `<div class="card"><h3>🎵 Töne pro Warnung</h3>`;
      CATS.forEach(c => {
        var currentSound = s.sounds[c.id] || "medium";
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <span style="font-size:12px;font-weight:800">${c.icon} ${_esc(c.name.de)}</span>
          <select data-sound="${c.id}" style="background:rgba(0,0,0,.5);color:#fff;border:1px solid #444;border-radius:6px;padding:4px 8px;font-size:11px">
            <option value="urgent" ${currentSound==='urgent'?'selected':''}>🚨 Dringend</option>
            <option value="alarm" ${currentSound==='alarm'?'selected':''}>🔔 Alarm</option>
            <option value="chime" ${currentSound==='chime'?'selected':''}>🎵 Glocke</option>
            <option value="low" ${currentSound==='low'?'selected':''}>🕊️ Sanft</option>
          </select>
        </div>`;
      });
      html += `</div>`;

      // Sprache
      html += `<div class="card"><h3>🌍 Sprache</h3>
        <select id="setLang" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:1px solid #444;border-radius:8px;color:#fff">
        ${Object.keys(LANGS).map(k => `<option value="${k}" ${s.lang===k?"selected":""}>${LANGS[k].name}</option>`).join("")}
        </select></div>`;

      container.innerHTML = html;
      bindNav();
      
      container.querySelector("#reqNotify").addEventListener("click", function(){
        Notification.requestPermission().then(p => { if(p==="granted") screenSettings(); });
      });

      container.querySelector("#setLang").addEventListener("change", function(e){ s.lang = e.target.value; saveSettings(s); });
      
      container.querySelectorAll("[data-sound]").forEach(el => {
        el.addEventListener("change", function(e){
          s.sounds[el.dataset.sound] = e.target.value;
          saveSettings(s);
          playBeep(e.target.value, 0.5); // Vorschau abspielen
        });
      });
    }

    /* ═══════════ TESTFAHRT SIMULATION ═══════════ */
    function startSimulation(){
      if(simTimer) clearInterval(simTimer);
      lastPos = { coords: { latitude: 51.1657, longitude: 10.4515, speed: 0 } }; // Erfundene Startposition
      trip = { active:true, startTime:Date.now(), distance:0, warnings:0 };
      
      var spd = 30;
      simTimer = setInterval(() => {
        spd = Math.min(120, spd + Math.random() * 10);
        lastPos.coords.speed = spd / 3.6;
        trip.distance += (spd / 3600);
        if(view.screen === "cockpit"){
          var t = container.querySelector(".cpt-speed");
          if(t) t.textContent = Math.round(spd);
          var d = container.querySelector("#tripDist");
          if(d) d.textContent = trip.distance.toFixed(1) + " km";
        }
      }, 1000);
      build();
    }

    /* ═══════════ GEOLOCATION ═══════════ */
    function startGeo(){
      if(!navigator.geolocation) return;
      if(geoWatch) navigator.geolocation.clearWatch(geoWatch);
      geoWatch = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy:true, timeout:10000, maximumAge:5000 });
    }
    function onPos(pos){
      if(simTimer) return; // Ignoriere echtes GPS wenn Simulation läuft
      if(lastPos && trip.active){
        var d = haversine(lastPos.coords.latitude, lastPos.coords.longitude, pos.coords.latitude, pos.coords.longitude);
        if(d > 3 && d < 500) trip.distance += d / 1000;
      }
      lastPos = pos;
      checkTriggers(pos);
      if(view.screen === "cockpit"){
        var t = container.querySelector(".cpt-speed");
        if(t) t.textContent = Math.round((pos.coords.speed||0)*3.6);
      }
      if(view.screen === "map" && map) updateMapMarkers();
    }
    function onErr(err){ console.warn("[Blitzer] GPS:", err.message); }

    /* ═══════════ TRIGGER & PUSH ═══════════ */
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
            sendPushNotification(cat, d);
            trip.warnings++;
            break;
          }
        }
      });
    }

    function speakAlert(cat, dist, settings){
      var cv = getCustomVoice();
      if(cv[cat.id]){ new Audio(cv[cat.id]).play().catch(()=>{}); }
      else if(settings.voiceOn && window.speechSynthesis){
        var txt = (cat.voice[settings.lang] || cat.voice.de).replace("{d}", fmtDist(dist));
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(txt); u.lang = LANGS[settings.lang].code;
        window.speechSynthesis.speak(u);
      }
      var soundKey = settings.sounds[cat.id] || "medium";
      if(settings.beepOn) playBeep(soundKey, 0.8);
    }

    function sendPushNotification(cat, dist){
      if(!("Notification" in window) || Notification.permission !== "granted") return;
      var title = "HalDo Blitzer";
      var body = (cat.name.de || cat.name.en) + " in " + fmtDist(dist);
      try {
        new Notification(title, { body: body, icon: "https://haldoaios-official.github.io/HalDo/logo.png" });
      } catch(e){}
    }

    function getCustomVoice(){ return store.get("customVoice", {}); }

    /* ═══════════ BINDINGS ═══════════ */
    function bindNav(){ container.querySelectorAll("[data-nav]").forEach(el => { el.addEventListener("click", () => { view.screen = el.dataset.nav; build(); }); }); }
    function bindCockpit(){
      var tb = container.querySelector("[data-trip]");
      if(tb) tb.addEventListener("click", () => {
        if(tb.dataset.trip === "start"){
          trip = { active:true, startTime:Date.now(), distance:0, warnings:0 };
        } else {
          trip.active = false; if(simTimer){ clearInterval(simTimer); simTimer = null; }
        }
        build();
      });
      var simBtn = container.querySelector("#simBtn");
      if(simBtn) simBtn.addEventListener("click", startSimulation);
    }

    startGeo(); build();
  }

  HalDoApp("blitzer", { name: "Blitzer", icon: "⚠️", render: render, category: "werkzeuge" });
  console.log("🦚 blitzer.js v6.0 geladen — ULTIMATE COCKPIT (SVG · 3D · PUSH)");
})();
