/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BLITZER v5.0 · AI DRIVE COCKPIT
   TensorFlow.js (Toter Winkel) · Hologramm-Pfeile · GPS · POIs
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  /* ═══════════ KATEGORIEN & POIs ═══════════ */
  var CATS = [
    { id:"blitzer_fix",   icon:"📷", color:"#ff5555", type:"warn", name:{de:"Fester Blitzer",en:"Fixed Camera",tr:"Sabit Radar",ar:"رادار ثابت",ku:"Radarê Sabît",fr:"Radar fixe"}, voice:{de:"Achtung, Blitzer in {d}",en:"Warning, camera in {d}",tr:"Dikkat, radar {d}",ar:"تحذير رادار {d}",ku:"Hişyarî, radar li {d}",fr:"Attention, radar à {d}"} },
    { id:"blitzer_mobil", icon:"🚔", color:"#ff8844", type:"warn", name:{de:"Mobile Kontrolle",en:"Mobile Check",tr:"Mobil Kontrol",ar:"مراقبة متحركة",ku:"Kontrola Mobîl",fr:"Contrôle mobile"}, voice:{de:"Achtung, Kontrolle in {d}",en:"Warning, check in {d}",tr:"Dikkat, kontrol {d}",ar:"تحذير مراقبة {d}",ku:"Hişyarî, kontrol li {d}",fr:"Attention, contrôle à {d}"} },
    { id:"stau", icon:"🚗", color:"#ffaa33", type:"warn", name:{de:"Stau",en:"Traffic Jam",tr:"Trafik",ar:"ازدحام",ku:"Traffîk",fr:"Embouteillage"}, voice:{de:"Stau in {d}",en:"Traffic jam in {d}",tr:"Trafik {d}",ar:"ازدحام {d}",ku:"Traffîk li {d}",fr:"Embouteillage à {d}"} },
    { id:"unfall", icon:"💥", color:"#ff3333", type:"warn", name:{de:"Unfall",en:"Accident",tr:"Kaza",ar:"حادث",ku:"Qeza",fr:"Accident"}, voice:{de:"Unfall in {d}",en:"Accident in {d}",tr:"Kaza {d}",ar:"حادث {d}",ku:"Qeza li {d}",fr:"Accident à {d}"} },
    { id:"baustelle", icon:"🚧", color:"#ffaa33", type:"warn", name:{de:"Baustelle",en:"Road Work",tr:"Yol Çalışması",ar:"أعمال طريق",ku:"Karê Rê",fr:"Travaux"}, voice:{de:"Baustelle in {d}",en:"Road work in {d}",tr:"Yol çalışması {d}",ar:"أعمال طريق {d}",ku:"Karê rê li {d}",fr:"Travaux à {d}"} },
    { id:"ezidi", icon:"🦚", color:"#ffd700", type:"warn", name:{de:"Ezidi-Zentrum",en:"Ezidi Center",tr:"Ezidi Merkezi",ar:"مركز إيزيدي",ku:"Navenda Êzîdî",fr:"Centre Ezidi"}, voice:{de:"Ezidi-Zentrum in {d}",en:"Ezidi center in {d}",tr:"Ezidi merkezi {d}",ar:"مركز إيزيدي {d}",ku:"Navenda Êzîdî li {d}",fr:"Centre Ezidi à {d}"} },
    { id:"poi_fuel", icon:"⛽", color:"#66cc66", type:"poi", osm:"amenity=fuel", name:{de:"Tankstelle",en:"Gas Station",tr:"Benzinlik",ar:"محطة وقود",ku:"Benzîngeh",fr:"Station"}, voice:{de:"Tankstelle in {d}",en:"Gas station in {d}",tr:"Benzinlik {d}",ar:"محطة وقود {d}",ku:"Benzîngeh li {d}",fr:"Station à {d}"} },
    { id:"poi_rest", icon:"🍴", color:"#ff8844", type:"poi", osm:"highway=rest_area", name:{de:"Raststätte",en:"Rest Area",tr:"Dinlenme",ar:"استراحة",ku:"Bêhnvedan",fr:"Repos"}, voice:{de:"Raststätte in {d}",en:"Rest area in {d}",tr:"Dinlenme {d}",ar:"استراحة {d}",ku:"Bêhnvedan li {d}",fr:"Repos à {d}"} },
    { id:"poi_hotel", icon:"🏨", color:"#4da8ff", type:"poi", osm:"tourism=hotel", name:{de:"Hotel",en:"Hotel",tr:"Otel",ar:"فندق",ku:"Otel",fr:"Hôtel"}, voice:{de:"Hotel in {d}",en:"Hotel in {d}",tr:"Otel {d}",ar:"فندق {d}",ku:"Otel li {d}",fr:"Hôtel à {d}"} },
    { id:"poi_werkstatt", icon:"🔧", color:"#b478ff", type:"poi", osm:"shop=car_repair", name:{de:"Werkstatt",en:"Repair",tr:"Tamirci",ar:"ورشة",ku:"Tamîrxane",fr:"Garage"}, voice:{de:"Werkstatt in {d}",en:"Repair in {d}",tr:"Tamirci {d}",ar:"ورشة {d}",ku:"Tamîrxane li {d}",fr:"Garage à {d}"} },
    { id:"poi_parking", icon:"🅿️", color:"#66cc66", type:"poi", osm:"amenity=parking", name:{de:"Parkplatz",en:"Parking",tr:"Park",ar:"موقف",ku:"Park",fr:"Parking"}, voice:{de:"Parkplatz in {d}",en:"Parking in {d}",tr:"Park {d}",ar:"موقف {d}",ku:"Park li {d}",fr:"Parking à {d}"} }
  ];

  var LANGS = {
    de:{ name:"Deutsch", code:"de-DE" }, en:{ name:"English", code:"en-US" },
    tr:{ name:"Türkçe", code:"tr-TR" }, ar:{ name:"العربية", code:"ar-SA" },
    ku:{ name:"Kurdî (Ezidi)", code:"tr-TR" }, fr:{ name:"Français", code:"fr-FR" }
  };

  var DEFAULT_SETTINGS = { enabled: {}, lang:"de", voiceOn:true, beepOn:true, vibrateOn:true, warnDist: 1000, visionOn: false };
  CATS.forEach(function(c){ DEFAULT_SETTINGS.enabled[c.id] = true; });

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function haversine(lat1,lng1,lat2,lng2){
    var R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
    var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  function fmtDist(m){ return m<1000 ? Math.round(m/10)*10 + " m" : (m/1000).toFixed(1) + " km"; }

  var audioCtx = null;
  function getAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
  function playBeep(pattern, vol){
    var ctx = getAudio(); if(!ctx) return; var now = ctx.currentTime;
    var p = { urgent: [{f:880,t:0,d:0.1},{f:880,t:0.15,d:0.1}], alarm: [{f:1200,t:0,d:0.08},{f:1200,t:0.12,d:0.08}], medium: [{f:660,t:0,d:0.15}], low: [{f:440,t:0,d:0.2}] }[pattern] || [{f:440,t:0,d:0.2}];
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
    var geoWatch = null, lastPos = null;
    var trip = { active:false, startTime:0, distance:0, warnings:0 };
    var map = null, mapMarkers = [];
    var triggered = {}, lastLimitFetch = 0, currentLimit = null;
    var poiCache = {}, routeData = null, targetPos = null;
    var tfModel = null, cameraStream = null, visionLoop = null;

    function getSettings(){ var s = store.get("settings", {}); var m = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); Object.keys(s).forEach(function(k){ m[k] = s[k]; }); return m; }
    function saveSettings(s){ store.set("settings", s); }
    function getWarnings(){ return store.get("warnings", []); }
    function saveWarnings(w){ store.set("warnings", w); }
    function getCustomVoice(){ return store.get("customVoice", {}); }
    function getCat(id){ return CATS.find(function(c){ return c.id === id; }); }

    /* ═══════════ COCKPIT SCREEN ═══════════ */
    function screenCockpit(){
      var s = getSettings();
      var speed = lastPos ? Math.round((lastPos.coords.speed||0)*3.6) : 0;
      var nextEvent = getNextEvent();

      // CSS STYLES (Sauber in einem String!)
      var css = `
        .cpt-wrap{position:relative;height:calc(100vh - 100px);min-height:600px;background:radial-gradient(ellipse at 50% 30%,#0a1220 0%,#050810 80%);border-radius:20px;padding:16px;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,sans-serif}
        .cpt-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:500px;background:radial-gradient(circle,rgba(77,208,225,.15) 0%,transparent 60%);pointer-events:none}
        .cpt-tacho{position:relative;width:240px;height:240px;margin:10px auto;display:flex;align-items:center;justify-content:center}
        .cpt-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 135deg, transparent 0deg, transparent 90deg, ${speed>130?'#ff5555':speed>100?'#ffd54f':'#4dd0e1'} 90deg, ${speed>130?'#ff5555':speed>100?'#ffd54f':'#4dd0e1'} ${Math.min(270, speed*1.8+90)}deg, transparent ${Math.min(270, speed*1.8+90)}deg);}
        .cpt-ring::after{content:"";position:absolute;inset:8px;border-radius:50%;background:#050810;}
        .cpt-speed{font-size:88px;font-weight:900;color:#fff;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 0 30px rgba(77,208,225,.6)}
        .cpt-unit{font-size:12px;color:#7fa5b8;font-weight:900;letter-spacing:3px;margin-top:-6px}
        .cpt-limit{position:absolute;top:20px;right:20px;width:72px;height:72px;border-radius:50%;background:#fff;border:8px solid #ff3333;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.5);z-index:20}
        .cpt-limit-num{font-size:28px;font-weight:900;color:#000;font-variant-numeric:tabular-nums}
        .holo-arrow-container{position:relative;width:100px;height:100px;display:flex;align-items:center;justify-content:center;margin:0 auto}
        .holo-arrow{font-size:64px;color:#4dd0e1;filter:drop-shadow(0 0 15px #4dd0e1) drop-shadow(0 0 30px #4dd0e1);transform-style:preserve-3d;animation:holoFloat 2s ease-in-out infinite, holoTurn 3s linear infinite;text-shadow:0 0 10px #fff}
        .vision-overlay{position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;z-index:50;opacity:0;transition:opacity .3s}
        .vision-overlay.active{opacity:1}
        .blind-spot{position:absolute;top:0;bottom:0;width:30%;background:linear-gradient(90deg,rgba(255,50,50,.5),transparent);opacity:0;transition:opacity .3s}
        .blind-spot.right{right:0;background:linear-gradient(-90deg,rgba(255,50,50,.5),transparent)}
        .blind-spot.alert{opacity:1;animation:blinkAlert .5s infinite}
        @keyframes holoFloat{0%,100%{transform:translateY(0) rotateX(20deg)}50%{transform:translateY(-15px) rotateX(20deg)}}
        @keyframes holoTurn{0%,100%{transform:rotateY(0deg) rotateX(20deg)}50%{transform:rotateY(30deg) rotateX(20deg)}}
        @keyframes blinkAlert{0%,100%{opacity:.5}50%{opacity:1}}
      `;

      var html = `<style>${css}</style><div class="cpt-wrap"><div class="cpt-glow"></div>
      <div id="visionOverlay" class="vision-overlay"><div id="blindLeft" class="blind-spot"></div><div id="blindRight" class="blind-spot right"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:flex-start;z-index:15">
        <div style="display:flex;gap:6px">
          <button data-nav="nav" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.4);color:#4dd0e1;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:6px">🧭 Route</button>
          <button data-nav="vision" style="background:rgba(180,120,255,.15);border:1px solid rgba(180,120,255,.4);color:#b478ff;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:6px">🤖 KI-Kamera</button>
        </div>
        <button data-nav="settings" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer">⚙️</button>
      </div>`;

      // HOLOGRAMM NAVIGATION HINT
      if(nextEvent && nextEvent.type === "nav"){
        html += `<div style="margin-top:12px;padding:14px;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.15));border:1px solid rgba(77,208,225,.4);border-radius:16px;display:flex;align-items:center;gap:12px;z-index:15">
          <div class="holo-arrow-container"><div class="holo-arrow">${nextEvent.arrow}</div></div>
          <div style="flex:1"><div style="font-size:11px;color:var(--text-mute);font-weight:800">NÄCHSTER SCHRITT</div>
          <div style="font-size:15px;font-weight:900;color:#4dd0e1;margin-top:2px">${_esc(nextEvent.instruction)}</div>
          <div style="font-size:13px;font-weight:800;color:#fff;margin-top:2px">in ${fmtDist(nextEvent.distance)}</div></div>
        </div>`;
      }

      html += `<div style="position:relative;margin-top:auto;z-index:10">`;
      if(currentLimit !== null){
        html += `<div class="cpt-limit"><div class="cpt-limit-num">${currentLimit === 0 ? "∞" : currentLimit}</div></div>`;
      }
      html += `<div class="cpt-tacho"><div class="cpt-ring"></div><div style="text-align:center"><div class="cpt-speed">${speed}</div><div class="cpt-unit">KM/H</div></div></div></div>`;

      var nearby = getNearbyPOIs();
      html += `<div style="z-index:10;max-height:140px;overflow-y:auto;margin-top:8px">`;
      if(nearby.length === 0){
        html += `<div style="text-align:center;padding:10px;color:var(--text-mute);font-size:11px">Suche Umgebung...</div>`;
      } else {
        nearby.slice(0, 3).forEach(function(n){
          var cat = getCat(n.cat);
          html += `<div style="display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border-radius:14px;margin-bottom:6px;border-left:4px solid ${cat.color}">
            <div style="font-size:24px">${cat.icon}</div>
            <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:900;color:#fff">${_esc(cat.name[s.lang])}</div>
            <div style="font-size:10px;color:#7fa5b8">${fmtDist(n.dist)} entfernt</div></div></div>`;
        });
      }
      html += `</div>`;

      html += `<div style="margin-top:10px;background:rgba(0,0,0,.4);backdrop-filter:blur(10px);border-radius:16px;padding:12px;border:1px solid rgba(255,255,255,.08);z-index:10">
        <div style="display:flex;justify-content:space-around;text-align:center;margin-bottom:8px">
        <div><div style="font-size:16px;font-weight:900;color:#4dd0e1" id="tripDist">${trip.distance.toFixed(1)} km</div><div style="font-size:8px;color:#7fa5b8;font-weight:800">STRECKE</div></div>
        <div><div style="font-size:16px;font-weight:900;color:#4dd0e1" id="tripTime">${Math.floor((Date.now()-trip.startTime)/60000)} min</div><div style="font-size:8px;color:#7fa5b8;font-weight:800">ZEIT</div></div>
        <div><div style="font-size:16px;font-weight:900;color:#ffd54f" id="tripWarn">${trip.warnings}</div><div style="font-size:8px;color:#7fa5b8;font-weight:800">WARNUNGEN</div></div>
        </div>
        ${trip.active 
          ? `<button data-trip="stop" style="width:100%;padding:12px;background:#ff5555;color:#fff;border:none;border-radius:10px;font-weight:900;font-size:13px;cursor:pointer;font-family:inherit">⏹ Fahrt beenden</button>`
          : `<button data-trip="start" style="width:100%;padding:12px;background:linear-gradient(135deg,#4ade80,#22c55e);color:#000;border:none;border-radius:10px;font-weight:900;font-size:13px;cursor:pointer;font-family:inherit">▶ Fahrt starten</button>`}
        </div></div>`;

      container.innerHTML = html;
      bindNav(); bindCockpit();
      fetchPOIsIfNeeded(); fetchSpeedLimitIfNeeded();
    }

    /* ═══════════ KI VISION SCREEN ═══════════ */
    function screenVision(){
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>
      <div class="card">
        <h3>🤖 KI-Kamera (TensorFlow)</h3>
        <div style="font-size:11px;color:var(--text-mute);margin-bottom:10px">Erkennt Autos, LKW, Personen in Echtzeit. Warnt bei Annäherung im toten Winkel.</div>
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
      status.textContent = "Lade KI-Modell (kann dauern)...";
      try {
        if(!window.tf || !window.cocoSsd){
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.2.0/dist/tf.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js");
        }
        tfModel = await cocoSsd.load();
        status.textContent = "Modell geladen. Starte Kamera...";
        
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        var video = document.getElementById("visionVideo");
        video.srcObject = cameraStream; video.style.display = "block";
        document.getElementById("visionPlaceholder").style.display = "none";
        document.getElementById("visionCanvas").style.display = "block";
        document.getElementById("visionStart").textContent = "⏹ KI stoppen";
        status.textContent = "🟢 Live - Analysiere Umgebung...";
        
        runVisionLoop();
      } catch(e){
        status.textContent = "❌ Fehler: " + e.message;
      }
    }

    function loadScript(src){
      return new Promise((res, rej) => {
        var s = document.createElement("script");
        s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
      });
    }

    async function runVisionLoop(){
      if(!tfModel || !cameraStream) return;
      var video = document.getElementById("visionVideo");
      var canvas = document.getElementById("visionCanvas");
      if(!video || !canvas) return;

      var ctx2d = canvas.getContext("2d");
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      
      async function detect(){
        if(!tfModel || !cameraStream) return;
        var predictions = await tfModel.detect(video);
        ctx2d.clearRect(0, 0, canvas.width, canvas.height);
        
        var leftAlert = false, rightAlert = false;
        var s = getSettings();
        
        predictions.forEach(p => {
          if(p.class === "car" || p.class === "truck" || p.class === "person" || p.class === "bicycle"){
            var [x, y, w, h] = p.bbox;
            var area = (w * h) / (canvas.width * canvas.height);
            
            // Zeichne Box
            ctx2d.strokeStyle = p.class === "person" ? "#ff5555" : "#4dd0e1";
            ctx2d.lineWidth = 3;
            ctx2d.strokeRect(x, y, w, h);
            ctx2d.fillStyle = p.class === "person" ? "#ff5555" : "#4dd0e1";
            ctx2d.font = "16px sans-serif";
            ctx2d.fillText(p.class.toUpperCase() + " " + Math.round(p.score * 100) + "%", x, y > 20 ? y - 5 : y + 20);

            // Toter Winkel Warnung (wenn links/rechts und groß)
            if(area > 0.15){ // Objekt ist groß (nah)
              if(x + w/2 < canvas.width * 0.4) leftAlert = true;
              if(x + w/2 > canvas.width * 0.6) rightAlert = true;
            }
          }
        });

        // Visuelle Warnung im Cockpit
        var blindL = document.getElementById("blindLeft");
        var blindR = document.getElementById("blindRight");
        if(blindL) blindL.classList.toggle("alert", leftAlert);
        if(blindR) blindR.classList.toggle("alert", rightAlert);
        
        if((leftAlert || rightAlert) && s.beepOn){
          playBeep("urgent", 0.5);
          if(s.vibrateOn && navigator.vibrate) navigator.vibrate(100);
        }

        if(cameraStream) visionLoop = requestAnimationFrame(detect);
      }
      detect();
    }

    function stopVision(){
      if(visionLoop) cancelAnimationFrame(visionLoop);
      visionLoop = null;
      if(cameraStream){ cameraStream.getTracks().forEach(t => t.stop()); cameraStream = null; }
      tfModel = null;
      screenVision();
    }

    /* ═══════════ HELFER & LOGIK ═══════════ */
    function getNextEvent(){
      if(routeData && routeData.steps){
        for(var i = routeData.currentStep; i < routeData.steps.length; i++){
          var st = routeData.steps[i];
          if(st.maneuver && st.maneuver.type !== "depart"){
            return { type:"nav", arrow:getManeuverIcon(st.maneuver), instruction:st.name || st.maneuver.type, distance: st.distance };
          }
        }
      }
      return null;
    }

    function getManeuverIcon(m){
      if(!m) return "⬆️"; var type = m.type, mod = m.modifier || "";
      if(type === "turn"){
        if(mod.indexOf("left") >= 0) return "⬅️"; if(mod.indexOf("right") >= 0) return "➡️";
        if(mod === "sharp left") return "↖️"; if(mod === "sharp right") return "↗️";
      }
      if(type === "roundabout") return "🔄"; if(type === "merge") return "⤵️";
      if(type === "arrive") return "🏁"; return "⬆️";
    }

    function startGeo(){
      if(!navigator.geolocation) return;
      if(geoWatch) navigator.geolocation.clearWatch(geoWatch);
      geoWatch = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy:true, maximumAge:3000, timeout:15000 });
    }
    function onPos(pos){
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

    function fetchSpeedLimitIfNeeded(){
      if(!lastPos) return; var now = Date.now();
      if(now - lastLimitFetch < 15000) return; lastLimitFetch = now;
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
      if(!lastPos) return;
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
      if(tags.tourism === "hotel") return "poi_hotel";
      if(tags.shop === "car_repair") return "poi_werkstatt";
      if(tags.amenity === "parking") return "poi_parking";
      return null;
    }

    function getNearbyPOIs(){
      if(!lastPos) return [];
      var lat = lastPos.coords.latitude, lng = lastPos.coords.longitude;
      var nearby = [], s = getSettings();
      getWarnings().forEach(w => {
        if(!s.enabled[w.cat]) return;
        var d = haversine(lat, lng, w.lat, w.lng);
        if(d < 5000) nearby.push({ cat: w.cat, dist: d });
      });
      Object.keys(poiCache).forEach(id => {
        var p = poiCache[id]; if(!p.cat || !s.enabled[p.cat]) return;
        var d = haversine(lat, lng, p.lat, p.lng);
        if(d < 5000) nearby.push({ cat: p.cat, dist: d });
      });
      return nearby.sort((a,b) => a.dist - b.dist);
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
            triggered[key] = true; speakAlert(cat, d, s); trip.warnings++;
            var wn = container.querySelector("#tripWarn"); if(wn) wn.textContent = trip.warnings;
            break;
          }
        }
        if(d > 2500) Object.keys(triggered).forEach(k => { if(k.indexOf(w.id) === 0) delete triggered[k]; });
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
      if(cv[cat.id]){ new Audio(cv[cat.id]).play().catch(()=>{}); }
      else if(settings.voiceOn && window.speechSynthesis){
        var txt = (cat.voice[settings.lang] || cat.voice.de).replace("{d}", fmtDist(dist));
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(txt); u.lang = LANGS[settings.lang].code;
        var voices = window.speechSynthesis.getVoices();
        var match = voices.find(v => v.lang === LANGS[settings.lang].code);
        if(match) u.voice = match; window.speechSynthesis.speak(u);
      }
      if(settings.beepOn) playBeep(cat.beep || "medium", 0.8);
      if(settings.vibrateOn && navigator.vibrate) navigator.vibrate([100,50,100]);
    }

    /* ═══════════ NAVIGATION SCREEN ═══════════ */
    function screenNav(){
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>
      <div class="card"><h3>🧭 Navigation (Hologramm)</h3>
      <div class="field"><label>Ziel eingeben</label><input id="navTarget" placeholder="z.B. Berlin, Alexanderplatz" style="font-size:14px;padding:12px;width:100%;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff"></div>
      <button class="btn full" id="navGo" style="padding:12px;margin-top:8px;background:linear-gradient(135deg,#4dd0e1,#b478ff);color:#000;font-weight:900;border:none;border-radius:10px;cursor:pointer">🔍 Route berechnen</button>
      ${routeData ? `<div style="margin-top:14px;padding:12px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:10px">
        <div style="font-size:11px;color:var(--text-mute);font-weight:800">ROUTE AKTIV</div>
        <div style="font-size:14px;font-weight:900;color:#4dd0e1;margin-top:4px">${fmtDist(routeData.totalDist)}</div>
        <button id="navClear" style="margin-top:8px;background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;font-weight:800">Route beenden</button>
      </div>` : ""}</div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#navGo").addEventListener("click", function(){
        var target = container.querySelector("#navTarget").value.trim();
        if(!target || !lastPos) return;
        geocodeAndRoute(target);
      });
      var nc = container.querySelector("#navClear");
      if(nc) nc.addEventListener("click", function(){ routeData = null; screenNav(); });
    }

    function geocodeAndRoute(query){
      fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(query) + "&limit=1")
        .then(r => r.json()).then(data => {
          if(!data || !data.length){ alert("Ziel nicht gefunden"); return; }
          targetPos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
          if(!lastPos){ alert("GPS fehlt"); return; }
          fetch(`https://router.project-osrm.org/route/v1/driving/${lastPos.coords.longitude},${lastPos.coords.latitude};${targetPos.lng},${targetPos.lat}?steps=true&geometries=geojson&overview=false`)
            .then(r => r.json()).then(rdata => {
              if(!rdata.routes || !rdata.routes.length){ alert("Route nicht gefunden"); return; }
              routeData = { totalDist: rdata.routes[0].distance, steps: rdata.routes[0].legs[0].steps, currentStep: 0 };
              if(HalDo.Notify) HalDo.Notify.success("Route berechnet: " + fmtDist(routeData.totalDist));
              view.screen = "cockpit"; build();
            }).catch(e => alert("Routing-Fehler: " + e.message));
        }).catch(e => alert("Geocoding-Fehler: " + e.message));
    }

    /* ═══════════ SETTINGS SCREEN ═══════════ */
    function screenSettings(){
      var s = getSettings(), cv = getCustomVoice();
      var html = `<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>`;
      
      html += `<div class="card"><h3>🌍 Sprache</h3>
        <select id="setLang" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-family:inherit;font-size:14px">
        ${Object.keys(LANGS).map(k => `<option value="${k}" ${s.lang===k?"selected":""}>${LANGS[k].name}</option>`).join("")}
        </select>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn sec" id="testVoice" style="flex:1;font-size:11px;padding:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;cursor:pointer">🔊 Test</button>
          <button class="btn sec" id="testBeep" style="flex:1;font-size:11px;padding:10px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;color:#fff;cursor:pointer">🔔 Beep</button>
        </div></div>`;

      html += `<div class="card"><h3>🎤 Eigene Stimme</h3>
        <div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Nimm deine Warnung pro Kategorie auf.</div>`;
      CATS.forEach(c => {
        if(c.type === "poi") return;
        var has = !!cv[c.id];
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <span style="font-size:12px;font-weight:800">${c.icon} ${_esc(c.name.de)}</span>
          <button data-rec="${c.id}" style="background:${has?'rgba(74,222,128,.15)':'rgba(77,208,225,.15)'};border:1px solid ${has?'#4ade80':'#4dd0e1'};color:${has?'#4ade80':'#4dd0e1'};border-radius:6px;padding:5px 10px;font-size:10px;cursor:pointer;font-weight:800">${has?'✓ Neu':'🎤 Aufn.'}</button>
        </div>`;
      });
      html += `</div>`;

      html += `<div class="card"><h3>🎯 Kategorien</h3>`;
      CATS.forEach(c => {
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <span style="font-size:12px;font-weight:800">${c.icon} ${_esc(c.name.de)}</span>
          <button data-tgcat="${c.id}" style="background:${s.enabled[c.id]?'#4ade80':'rgba(255,255,255,.1)'};border:none;width:44px;height:24px;border-radius:12px;cursor:pointer;color:${s.enabled[c.id]?'#000':'#fff'};font-size:11px;font-weight:900">${s.enabled[c.id]?'✓':'✕'}</button>
        </div>`;
      });
      html += `</div>`;

      html += `<div class="card"><h3>📏 Warn-Abstand</h3>
        <input type="range" id="setWarnDist" min="200" max="3000" step="100" value="${s.warnDist}" style="width:100%">
        <div style="text-align:center;font-size:12px;font-weight:900;color:#4dd0e1;margin-top:4px" id="warnDistLbl">${s.warnDist} m</div></div>`;

      container.innerHTML = html; bindNav();
      container.querySelector("#setLang").addEventListener("change", e => { s.lang = e.target.value; saveSettings(s); });
      container.querySelector("#testVoice").addEventListener("click", () => { speakAlert(CATS[0], 500, s); });
      container.querySelector("#testBeep").addEventListener("click", () => { playBeep("urgent", 0.8); });
      container.querySelector("#setWarnDist").addEventListener("input", e => {
        s.warnDist = parseInt(e.target.value); saveSettings(s);
        container.querySelector("#warnDistLbl").textContent = s.warnDist + " m";
      });
      container.querySelectorAll("[data-tgcat]").forEach(el => {
        el.addEventListener("click", () => { var k = el.dataset.tgcat; s.enabled[k] = !s.enabled[k]; saveSettings(s); screenSettings(); });
      });
      container.querySelectorAll("[data-rec]").forEach(el => {
        el.addEventListener("click", () => { recordVoice(el.dataset.rec); });
      });
    }

    /* ═══════════ MAP & LIST (Sauber) ═══════════ */
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

    /* ═══════════ BINDINGS ═══════════ */
    function bindNav(){
      container.querySelectorAll("[data-nav]").forEach(el => {
        el.addEventListener("click", () => { 
          view.screen = el.dataset.nav; 
          if(view.screen === "map") screenMap();
          else if(view.screen === "settings") screenSettings();
          else if(view.screen === "nav") screenNav();
          else if(view.screen === "vision") screenVision();
          else if(view.screen === "list") screenList();
          else build();
        });
      });
    }
    function bindCockpit(){
      var tb = container.querySelector("[data-trip]");
      if(tb) tb.addEventListener("click", () => {
        if(tb.dataset.trip === "start"){
          trip = { active:true, startTime:Date.now(), distance:0, warnings:0 };
          if(HalDo.Notify) HalDo.Notify.success("Fahrt gestartet!");
        } else {
          trip.active = false;
          if(HalDo.Notify) HalDo.Notify.info("Fahrt beendet: " + trip.distance.toFixed(1) + " km");
        }
        build();
      });
    }

    function recordVoice(catId){
      var cat = getCat(catId);
      if(!navigator.mediaDevices){ alert("Mikrofon nicht verfügbar"); return; }
      var overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;color:#fff;text-align:center";
      overlay.innerHTML = `<div style="font-size:44px">${cat.icon}</div>
        <div style="font-size:14px;font-weight:900;color:#4dd0e1;margin:10px 0">Aufnahme: ${cat.name.de}</div>
        <div style="font-size:12px;color:#ff5555;margin-bottom:20px">🔴 Aufnahme läuft...</div>
        <button id="recStop" style="padding:14px 30px;background:#ff5555;color:#fff;border:none;border-radius:10px;font-weight:900;cursor:pointer">⏹ Stoppen</button>
        <button id="recCancel" style="margin-top:10px;padding:10px 20px;background:transparent;color:#888;border:1px solid #444;border-radius:8px;cursor:pointer">Abbrechen</button>`;
      document.body.appendChild(overlay);
      var chunks = [], rec = null, timer = null;
      navigator.mediaDevices.getUserMedia({ audio:true }).then(stream => {
        rec = new MediaRecorder(stream);
        rec.ondataavailable = e => { if(e.data.size) chunks.push(e.data); };
        rec.onstop = () => {
          stream.getTracks().forEach(t => t.stop());
          var blob = new Blob(chunks, { type:"audio/webm" });
          var reader = new FileReader();
          reader.onload = () => {
            var cv = getCustomVoice(); cv[catId] = reader.result; store.set("customVoice", cv);
            overlay.remove(); if(HalDo.Notify) HalDo.Notify.success("Stimme gespeichert"); screenSettings();
          };
          reader.readAsDataURL(blob);
        };
        rec.start(); timer = setTimeout(() => { if(rec.state === "recording") rec.stop(); }, 8000);
      }).catch(e => { alert("Mikrofon-Fehler: " + e.message); overlay.remove(); });
      overlay.querySelector("#recStop").addEventListener("click", () => { if(rec) rec.stop(); if(timer) clearTimeout(timer); });
      overlay.querySelector("#recCancel").addEventListener("click", () => {
        if(timer) clearTimeout(timer);
        if(rec && rec.state === "recording"){ rec.onstop = null; rec.stop(); }
        overlay.remove();
      });
    }

    startGeo(); build();
  }

  HalDoApp("blitzer", { name: "Blitzer", icon: "⚠️", render: render, category: "werkzeuge" });
  console.log("🦚 blitzer.js v5.0 geladen — Cockpit · Tempolimit · Navi · POIs · KI-Kamera (TensorFlow)");
})();
