/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BLITZER v4.0 · HALDO DRIVE COCKPIT
   Tempolimit (OSM) · Navigation (OSRM) · POIs · Totwinkel-Demo
   Sprachen: DE/EN/TR/AR/KU(Ezidi)/FR + Eigene Stimme
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  /* ═══════════ KATEGORIEN & POIs ═══════════ */
  var CATS = [
    { id:"blitzer_fix",   icon:"📷", color:"#ff5555", beep:"urgent", type:"warn",
      name:{de:"Fester Blitzer",en:"Fixed Camera",tr:"Sabit Radar",ar:"رادار ثابت",ku:"Radarê Sabît",fr:"Radar fixe"},
      voice:{de:"Achtung, fester Blitzer in {d}",en:"Warning, fixed camera in {d}",tr:"Dikkat, sabit radar {d}",ar:"تحذير رادار ثابت {d}",ku:"Hişyarî, radarê sabît li {d}",fr:"Attention, radar fixe à {d}"} },
    { id:"blitzer_mobil", icon:"🚔", color:"#ff8844", beep:"urgent", type:"warn",
      name:{de:"Mobile Kontrolle",en:"Mobile Check",tr:"Mobil Kontrol",ar:"مراقبة متحركة",ku:"Kontrola Mobîl",fr:"Contrôle mobile"},
      voice:{de:"Achtung, mobile Kontrolle in {d}",en:"Warning, mobile check in {d}",tr:"Dikkat, mobil kontrol {d}",ar:"تحذير مراقبة متحركة {d}",ku:"Hişyarî, kontrola mobîl li {d}",fr:"Attention, contrôle mobile à {d}"} },
    { id:"stau", icon:"🚗", color:"#ffaa33", beep:"medium", type:"warn",
      name:{de:"Stau",en:"Traffic Jam",tr:"Trafik Sıkışıklığı",ar:"ازدحام مروري",ku:"Traffîk Xitimî",fr:"Embouteillage"},
      voice:{de:"Achtung, Stau in {d}",en:"Warning, traffic jam in {d}",tr:"Dikkat, trafik sıkışıklığı {d}",ar:"تحذير ازدحام مروري {d}",ku:"Hişyarî, traffîk xitimî li {d}",fr:"Attention, embouteillage à {d}"} },
    { id:"unfall", icon:"💥", color:"#ff3333", beep:"alarm", type:"warn",
      name:{de:"Unfall",en:"Accident",tr:"Kaza",ar:"حادث",ku:"Qeza",fr:"Accident"},
      voice:{de:"Achtung, Unfall in {d}",en:"Warning, accident in {d}",tr:"Dikkat, kaza {d}",ar:"تحذير حادث {d}",ku:"Hişyarî, qeza li {d}",fr:"Attention, accident à {d}"} },
    { id:"baustelle", icon:"🚧", color:"#ffaa33", beep:"medium", type:"warn",
      name:{de:"Baustelle",en:"Road Work",tr:"Yol Çalışması",ar:"أعمال طريق",ku:"Karê Rê",fr:"Travaux"},
      voice:{de:"Achtung, Baustelle in {d}",en:"Warning, road work in {d}",tr:"Dikkat, yol çalışması {d}",ar:"تحذير أعمال طريق {d}",ku:"Hişyarî, karê rê li {d}",fr:"Attention, travaux à {d}"} },
    { id:"polizei", icon:"👮", color:"#4499ff", beep:"medium", type:"warn",
      name:{de:"Polizei",en:"Police",tr:"Polis",ar:"شرطة",ku:"Polîs",fr:"Police"},
      voice:{de:"Achtung, Polizei in {d}",en:"Warning, police in {d}",tr:"Dikkat, polis {d}",ar:"تحذير شرطة {d}",ku:"Hişyarî, polîs li {d}",fr:"Attention, police à {d}"} },
    { id:"ezidi", icon:"🦚", color:"#ffd700", beep:"medium", type:"warn",
      name:{de:"Ezidi-Zentrum",en:"Ezidi Center",tr:"Ezidi Merkezi",ar:"مركز إيزيدي",ku:"Navenda Êzîdî",fr:"Centre Ezidi"},
      voice:{de:"Ezidi-Zentrum in {d}",en:"Ezidi center in {d}",tr:"Ezidi merkezi {d}",ar:"مركز إيزيدي {d}",ku:"Navenda Êzîdî li {d}",fr:"Centre Ezidi à {d}"} },
    // POIs (Points of Interest)
    { id:"poi_fuel", icon:"⛽", color:"#66cc66", beep:"low", type:"poi", osm:"amenity=fuel",
      name:{de:"Tankstelle",en:"Gas Station",tr:"Benzinlik",ar:"محطة وقود",ku:"Benzîngeh",fr:"Station essence"},
      voice:{de:"Tankstelle in {d}",en:"Gas station in {d}",tr:"Benzinlik {d}",ar:"محطة وقود {d}",ku:"Benzîngeh li {d}",fr:"Station essence à {d}"} },
    { id:"poi_rest", icon:"🍴", color:"#ff8844", beep:"low", type:"poi", osm:"highway=rest_area",
      name:{de:"Raststätte",en:"Rest Area",tr:"Dinlenme Tesisi",ar:"استراحة",ku:"Qada Bêhnvedanê",fr:"Aire de repos"},
      voice:{de:"Raststätte in {d}",en:"Rest area in {d}",tr:"Dinlenme tesisi {d}",ar:"استراحة {d}",ku:"Qada bêhnvedanê li {d}",fr:"Aire de repos à {d}"} },
    { id:"poi_hotel", icon:"🏨", color:"#4da8ff", beep:"low", type:"poi", osm:"tourism=hotel",
      name:{de:"Hotel",en:"Hotel",tr:"Otel",ar:"فندق",ku:"Otel",fr:"Hôtel"},
      voice:{de:"Hotel in {d}",en:"Hotel in {d}",tr:"Otel {d}",ar:"فندق {d}",ku:"Otel li {d}",fr:"Hôtel à {d}"} },
    { id:"poi_werkstatt", icon:"🔧", color:"#b478ff", beep:"low", type:"poi", osm:"shop=car_repair",
      name:{de:"Werkstatt",en:"Repair Shop",tr:"Tamirci",ar:"ورشة إصلاح",ku:"Tamîrxane",fr:"Garage"},
      voice:{de:"Werkstatt in {d}",en:"Repair shop in {d}",tr:"Tamirci {d}",ar:"ورشة إصلاح {d}",ku:"Tamîrxane li {d}",fr:"Garage à {d}"} },
    { id:"poi_parking", icon:"🅿️", color:"#66cc66", beep:"low", type:"poi", osm:"amenity=parking",
      name:{de:"Parkplatz",en:"Parking",tr:"Park Yeri",ar:"موقف سيارات",ku:"Parkkirin",fr:"Parking"},
      voice:{de:"Parkplatz in {d}",en:"Parking in {d}",tr:"Park yeri {d}",ar:"موقف سيارات {d}",ku:"Parkkirin li {d}",fr:"Parking à {d}"} },
    { id:"poi_pharmacy", icon:"💊", color:"#4ade80", beep:"low", type:"poi", osm:"amenity=pharmacy",
      name:{de:"Apotheke",en:"Pharmacy",tr:"Eczane",ar:"صيدلية",ku:"Dermanxane",fr:"Pharmacie"},
      voice:{de:"Apotheke in {d}",en:"Pharmacy in {d}",tr:"Eczane {d}",ar:"صيدلية {d}",ku:"Dermanxane li {d}",fr:"Pharmacie à {d}"} }
  ];

  var LANGS = {
    de:{ name:"Deutsch", code:"de-DE" }, en:{ name:"English", code:"en-US" },
    tr:{ name:"Türkçe", code:"tr-TR" }, ar:{ name:"العربية", code:"ar-SA" },
    ku:{ name:"Kurdî (Ezidi)", code:"tr-TR" }, fr:{ name:"Français", code:"fr-FR" }
  };

  var DEFAULT_SETTINGS = {
    enabled: {}, lang:"de", voiceOn:true, beepOn:true, vibrateOn:true, warnDist: 1000
  };
  CATS.forEach(function(c){ DEFAULT_SETTINGS.enabled[c.id] = true; });

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function haversine(lat1,lng1,lat2,lng2){
    var R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
    var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  function fmtDist(m){
    if(m<1000) return Math.round(m/10)*10 + " m";
    return (m/1000).toFixed(1) + " km";
  }

  /* ═══════════ AUDIO ═══════════ */
  var audioCtx = null;
  function getAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
  function playBeep(pattern, vol){
    var ctx = getAudio(); if(!ctx) return; var now = ctx.currentTime;
    var p = {
      urgent: [{f:880,t:0,d:0.1},{f:880,t:0.15,d:0.1},{f:880,t:0.3,d:0.15}],
      alarm:  [{f:1200,t:0,d:0.08},{f:1200,t:0.12,d:0.08},{f:1200,t:0.24,d:0.08}],
      medium: [{f:660,t:0,d:0.15},{f:660,t:0.25,d:0.15}],
      low:    [{f:440,t:0,d:0.2}]
    }[pattern] || [{f:440,t:0,d:0.2}];
    p.forEach(function(b){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = b.f; o.type = "sine";
      g.gain.setValueAtTime(0, now+b.t); g.gain.linearRampToValueAtTime(vol, now+b.t+0.01); g.gain.exponentialRampToValueAtTime(0.001, now+b.t+b.d);
      o.connect(g).connect(ctx.destination); o.start(now+b.t); o.stop(now+b.t+b.d+0.02);
    });
  }

  /* ═══════════ RENDER ═══════════ */
  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"cockpit" };
    var geoWatch = null, lastPos = null;
    var trip = { active:false, startTime:0, distance:0, warnings:0 };
    var map = null, mapMarkers = [];
    var triggered = {}, lastLimitFetch = 0, currentLimit = null;
    var poiCache = {}, routeData = null, targetPos = null;
    var simAngle = 0, simActive = false;

    function getSettings(){
      var s = store.get("settings", {});
      var m = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      Object.keys(s).forEach(function(k){ m[k] = s[k]; });
      return m;
    }
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

      var html = '<style>'
        + '.cpt-wrap{position:relative;height:calc(100vh - 120px);min-height:600px;background:radial-gradient(ellipse at 50% 30%,#0a1220 0%,#050810 80%);border-radius:20px;padding:16px;display:flex;flex-direction:column;overflow:hidden}'
        + '.cpt-glow{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:500px;height:500px;background:radial-gradient(circle,rgba(77,208,225,.15) 0%,transparent 60%);pointer-events:none}'
        + '.cpt-tacho{position:relative;width:260px;height:260px;margin:10px auto;display:flex;align-items:center;justify-content:center}'
        + '.cpt-ring{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 135deg, transparent 0deg, transparent 90deg, '+(speed>130?'#ff5555':speed>100?'#ffd54f':'#4dd0e1')+' 90deg, '+(speed>130?'#ff5555':speed>100?'#ffd54f':'#4dd0e1')+' '+Math.min(270,speed*1.8+90)+'deg, transparent '+Math.min(270,speed*1.8+90)+'deg)'}'
        + '.cpt-ring::after{content:"";position:absolute;inset:8px;border-radius:50%;background:#050810;}'
        + '.cpt-speed{font-size:88px;font-weight:900;color:#fff;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 0 30px rgba(77,208,225,.6)}'
        + '.cpt-unit{font-size:12px;color:#7fa5b8;font-weight:900;letter-spacing:3px;margin-top:-6px}'
        + '.cpt-limit{position:absolute;top:20px;right:20px;width:72px;height:72px;border-radius:50%;background:#fff;border:8px solid #ff3333;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,.5);z-index:20}'
        + '.cpt-limit-num{font-size:28px;font-weight:900;color:#000;font-variant-numeric:tabular-nums}'
        + '.cpt-limit-none{font-size:16px;font-weight:900;color:#000}'
        + '.cpt-poi{display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border-radius:14px;margin-bottom:6px;border-left:4px solid}'
        + '.cpt-blind{position:absolute;top:0;bottom:0;width:20%;pointer-events:none;opacity:0;transition:opacity .3s}'
        + '.cpt-blind.left{left:0;background:linear-gradient(90deg,rgba(255,60,60,.6),transparent)}'
        + '.cpt-blind.right{right:0;background:linear-gradient(-90deg,rgba(255,60,60,.6),transparent)}'
        + '@keyframes blink{0%,100%{opacity:0.7}50%{opacity:1}}'
        + '@keyframes navArrows{0%,100%{transform:translateX(0)}50%{transform:translateX(6px)}}'
        + '</style>';

      html += '<div class="cpt-wrap">';
      html += '<div class="cpt-glow"></div>';
      
      // Blindspot overlays
      html += '<div id="blindLeft" class="cpt-blind left"></div><div id="blindRight" class="cpt-blind right"></div>';

      // Top Navigation
      html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;z-index:15">'
        + '<div style="display:flex;gap:6px">'
        + '<button data-nav="nav" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.4);color:#4dd0e1;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:6px">🧭 Route</button>'
        + '<button data-nav="list" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer">📋</button>'
        + '</div>'
        + '<button data-nav="settings" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer">⚙️</button>'
        + '</div>';

      // Navigation Hint
      if(nextEvent && nextEvent.type === "nav"){
        html += '<div style="margin-top:12px;padding:14px;background:linear-gradient(135deg,rgba(77,208,225,.15),rgba(180,120,255,.15));border:1px solid rgba(77,208,225,.4);border-radius:16px;display:flex;align-items:center;gap:12px;z-index:15">'
          + '<div style="font-size:44px;animation:navArrows 1.5s infinite">'+nextEvent.arrow+'</div>'
          + '<div style="flex:1"><div style="font-size:11px;color:var(--text-mute);font-weight:800">NÄCHSTER SCHRITT</div>'
          + '<div style="font-size:15px;font-weight:900;color:#4dd0e1;margin-top:2px">'+_esc(nextEvent.instruction)+'</div>'
          + '<div style="font-size:13px;font-weight:800;color:#fff;margin-top:2px">in '+fmtDist(nextEvent.distance)+'</div></div>'
          + '</div>';
      }

      // Tacho + Limit
      html += '<div style="position:relative;margin-top:auto;z-index:10">';
      if(currentLimit !== null){
        html += '<div class="cpt-limit">'
          + (currentLimit === 0 ? '<div class="cpt-limit-none">∞</div>' : '<div class="cpt-limit-num">'+currentLimit+'</div>')
          + '</div>';
      }
      html += '<div class="cpt-tacho">'
        + '<div class="cpt-ring"></div>'
        + '<div style="text-align:center"><div class="cpt-speed">'+speed+'</div><div class="cpt-unit">KM/H</div></div>'
        + '</div></div>';

      // POIs / Warnings in der Nähe
      var nearby = getNearbyPOIs();
      html += '<div style="z-index:10;max-height:140px;overflow-y:auto;margin-top:8px">';
      if(nearby.length === 0){
        html += '<div style="text-align:center;padding:10px;color:var(--text-mute);font-size:11px">Suche Umgebung...</div>';
      } else {
        nearby.slice(0, 3).forEach(function(n){
          var cat = getCat(n.cat);
          html += '<div class="cpt-poi" style="border-left-color:'+cat.color+'">'
            + '<div style="font-size:24px">'+cat.icon+'</div>'
            + '<div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:900;color:#fff">'+_esc(cat.name[s.lang])+'</div>'
            + '<div style="font-size:10px;color:#7fa5b8">'+fmtDist(n.dist)+' entfernt</div></div>'
            + '</div>';
        });
      }
      html += '</div>';

      // Trip Bar
      html += '<div style="margin-top:10px;background:rgba(0,0,0,.4);backdrop-filter:blur(10px);border-radius:16px;padding:12px;border:1px solid rgba(255,255,255,.08);z-index:10">'
        + '<div style="display:flex;justify-content:space-around;text-align:center;margin-bottom:8px">'
        + '<div><div style="font-size:16px;font-weight:900;color:#4dd0e1" id="tripDist">'+trip.distance.toFixed(1)+' km</div><div style="font-size:8px;color:#7fa5b8;font-weight:800">STRECKE</div></div>'
        + '<div><div style="font-size:16px;font-weight:900;color:#4dd0e1" id="tripTime">'+Math.floor((Date.now()-trip.startTime)/60000)+' min</div><div style="font-size:8px;color:#7fa5b8;font-weight:800">ZEIT</div></div>'
        + '<div><div style="font-size:16px;font-weight:900;color:#ffd54f" id="tripWarn">'+trip.warnings+'</div><div style="font-size:8px;color:#7fa5b8;font-weight:800">WARNUNGEN</div></div>'
        + '</div>'
        + (trip.active
            ? '<button data-trip="stop" style="width:100%;padding:12px;background:#ff5555;color:#fff;border:none;border-radius:10px;font-weight:900;font-size:13px;cursor:pointer;font-family:inherit">⏹ Fahrt beenden</button>'
            : '<button data-trip="start" style="width:100%;padding:12px;background:linear-gradient(135deg,#4ade80,#22c55e);color:#000;border:none;border-radius:10px;font-weight:900;font-size:13px;cursor:pointer;font-family:inherit">▶ Fahrt starten</button>')
        + '</div>';

      html += '</div>';
      container.innerHTML = html;
      bindNav();
      bindCockpit();
      
      // Starte POI-Suche / Tempolimit Update
      fetchPOIsIfNeeded();
      fetchSpeedLimitIfNeeded();
    }

    /* ═══════════ HELPER: NÄCHSTES EVENT ═══════════ */
    function getNextEvent(){
      if(routeData && routeData.steps){
        // Nächster Nav-Schritt
        for(var i = routeData.currentStep; i < routeData.steps.length; i++){
          var st = routeData.steps[i];
          if(st.maneuver && st.maneuver.type !== "depart"){
            var icon = getManeuverIcon(st.maneuver);
            return { type:"nav", arrow:icon, instruction:st.name || st.maneuver.type, distance: st.distance };
          }
        }
      }
      return null;
    }

    function getManeuverIcon(m){
      if(!m) return "⬆️";
      var type = m.type, mod = m.modifier || "";
      if(type === "turn"){
        if(mod.indexOf("left") >= 0) return "⬅️";
        if(mod.indexOf("right") >= 0) return "➡️";
        if(mod === "sharp left") return "↖️";
        if(mod === "sharp right") return "↗️";
        if(mod === "slight left") return "↖️";
        if(mod === "slight right") return "↗️";
      }
      if(type === "roundabout") return "🔄";
      if(type === "merge") return "⤵️";
      if(type === "fork") return "↔️";
      if(type === "arrive") return "🏁";
      if(type === "continue") return "⬆️";
      return "⬆️";
    }

    /* ═══════════ GEOLOCATION & TRIGGER ═══════════ */
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
        
        // Re-fetch if needed
        fetchPOIsIfNeeded();
        fetchSpeedLimitIfNeeded();
      }
      if(view.screen === "map" && map) updateMapMarkers();
    }
    function onErr(err){ console.warn("[Blitzer] GPS:", err.message); }

    /* ═══════════ SPEED LIMIT (OVERPASS) ═══════════ */
    function fetchSpeedLimitIfNeeded(){
      if(!lastPos) return;
      var now = Date.now();
      if(now - lastLimitFetch < 15000) return; // Alle 15s max
      lastLimitFetch = now;
      
      var lat = lastPos.coords.latitude, lng = lastPos.coords.longitude;
      var query = '[out:json];way(around:30,'+lat+','+lng+')["highway"]["maxspeed"];out tags;';
      fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query))
        .then(function(r){ return r.json(); })
        .then(function(data){
          if(data.elements && data.elements.length > 0){
            var ms = data.elements[0].tags.maxspeed;
            if(ms === "none" || ms === "signals" || ms === "DE:urban") currentLimit = ms === "DE:urban" ? 50 : 0;
            else {
              var num = parseInt(ms);
              currentLimit = isNaN(num) ? null : num;
            }
          } else {
            currentLimit = null;
          }
          if(view.screen === "cockpit"){
            // Update Limit Anzeige
            var el = container.querySelector(".cpt-limit");
            if(el){
              if(currentLimit === null) el.style.display = "none";
              else {
                el.style.display = "flex";
                el.querySelector(".cpt-limit-num, .cpt-limit-none").textContent = currentLimit === 0 ? "∞" : currentLimit;
              }
            }
          }
        })
        .catch(function(){});
    }

    /* ═══════════ POI FETCH (OVERPASS) ═══════════ */
    function fetchPOIsIfNeeded(){
      if(!lastPos) return;
      var lat = lastPos.coords.latitude, lng = lastPos.coords.longitude;
      var s = getSettings();
      var enabled = CATS.filter(function(c){ return c.type === "poi" && s.enabled[c.id]; });
      if(!enabled.length) return;

      var osmFilter = enabled.map(function(c){ return 'node(around:3000,'+lat+','+lng+')['+c.osm+'];'; }).join("");
      var query = '[out:json];(' + osmFilter + ');out center 20;';
      
      fetch("https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query))
        .then(function(r){ return r.json(); })
        .then(function(data){
          if(!data.elements) return;
          data.elements.forEach(function(el){
            // Prüfe, ob wir das schon haben
            if(poiCache[el.id]) return;
            poiCache[el.id] = {
              id: el.id, lat: el.lat, lng: el.lon, tags: el.tags,
              cat: guessCatFromTags(el.tags)
            };
          });
        })
        .catch(function(){});
    }

    function guessCatFromTags(tags){
      if(!tags) return null;
      if(tags.amenity === "fuel") return "poi_fuel";
      if(tags.highway === "rest_area") return "poi_rest";
      if(tags.tourism === "hotel") return "poi_hotel";
      if(tags.shop === "car_repair") return "poi_werkstatt";
      if(tags.amenity === "parking") return "poi_parking";
      if(tags.amenity === "pharmacy") return "poi_pharmacy";
      return null;
    }

    function getNearbyPOIs(){
      if(!lastPos) return [];
      var lat = lastPos.coords.latitude, lng = lastPos.coords.longitude;
      var nearby = [];
      
      // 1. Manuelle Warnungen
      var s = getSettings();
      getWarnings().forEach(function(w){
        if(!s.enabled[w.cat]) return;
        var d = haversine(lat, lng, w.lat, w.lng);
        if(d < 5000) nearby.push({ cat: w.cat, dist: d });
      });
      
      // 2. POIs aus OSM
      Object.keys(poiCache).forEach(function(id){
        var p = poiCache[id];
        if(!p.cat) return;
        if(!s.enabled[p.cat]) return;
        var d = haversine(lat, lng, p.lat, p.lng);
        if(d < 5000) nearby.push({ cat: p.cat, dist: d });
      });
      
      nearby.sort(function(a,b){ return a.dist - b.dist; });
      return nearby;
    }

    /* ═══════════ TRIGGER & VOICE ═══════════ */
    function checkTriggers(pos){
      var s = getSettings();
      var lat = pos.coords.latitude, lng = pos.coords.longitude;
      
      // Manuelle Warnungen (mit 4 Zonen)
      var zones = [2000, 1000, 500, 200];
      getWarnings().forEach(function(w){
        if(!s.enabled[w.cat]) return;
        var d = haversine(lat, lng, w.lat, w.lng);
        var cat = getCat(w.cat); if(!cat) return;
        for(var i=0; i<zones.length; i++){
          var key = w.id + "_z" + i;
          if(d <= zones[i] && !triggered[key]){
            triggered[key] = true;
            speakAlert(cat, d, s);
            trip.warnings++;
            var wn = container.querySelector("#tripWarn");
            if(wn) wn.textContent = trip.warnings;
            break;
          }
        }
        if(d > 2500) Object.keys(triggered).forEach(function(k){ if(k.indexOf(w.id) === 0) delete triggered[k]; });
      });
      
      // POI-Annäherungen (z.B. Tankstelle in 500m)
      Object.keys(poiCache).forEach(function(id){
        var p = poiCache[id];
        if(!p.cat || !s.enabled[p.cat]) return;
        var d = haversine(lat, lng, p.lat, p.lng);
        var key = "poi_" + id;
        if(d < s.warnDist && !triggered[key]){
          triggered[key] = true;
          speakAlert(getCat(p.cat), d, s);
        }
        if(d > s.warnDist + 200) delete triggered[key];
      });
    }

    function speakAlert(cat, dist, settings){
      var cv = getCustomVoice();
      if(cv[cat.id]){
        var a = new Audio(cv[cat.id]); a.play().catch(function(){});
      } else {
        if(!settings.voiceOn || !window.speechSynthesis) return;
        var txt = cat.voice[settings.lang] || cat.voice.de;
        txt = txt.replace("{d}", fmtDist(dist));
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(txt);
        u.lang = LANGS[settings.lang].code;
        var voices = window.speechSynthesis.getVoices();
        var match = voices.find(function(v){ return v.lang === LANGS[settings.lang].code; });
        if(match) u.voice = match;
        window.speechSynthesis.speak(u);
      }
      if(settings.beepOn) playBeep(cat.beep, 0.8);
      if(settings.vibrateOn && navigator.vibrate) navigator.vibrate([100,50,100]);
    }

    /* ═══════════ NAVIGATION SCREEN ═══════════ */
    function screenNav(){
      var html = '<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card"><h3>🧭 Navigation</h3>'
        + '<div class="field"><label>Ziel eingeben</label><input id="navTarget" placeholder="z.B. Berlin, Alexanderplatz" style="font-size:14px;padding:12px"></div>'
        + '<button class="btn full" id="navGo" style="padding:12px">🔍 Route berechnen</button>'
        + (routeData ? '<div style="margin-top:14px;padding:12px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:10px">'
            + '<div style="font-size:11px;color:var(--text-mute);font-weight:800">ROUTE AKTIV</div>'
            + '<div style="font-size:14px;font-weight:900;color:#4dd0e1;margin-top:4px">'+(routeData.totalDist ? fmtDist(routeData.totalDist) : "—")+'</div>'
            + '<button id="navClear" style="margin-top:8px;background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;font-weight:800">Route beenden</button>'
            + '</div>' : '')
        + '</div>';
      container.innerHTML = html;
      bindNav();
      container.querySelector("#navGo").addEventListener("click", function(){
        var target = container.querySelector("#navTarget").value.trim();
        if(!target || !lastPos) return;
        geocodeAndRoute(target);
      });
      var nc = container.querySelector("#navClear");
      if(nc) nc.addEventListener("click", function(){ routeData = null; screenNav(); });
    }

    function geocodeAndRoute(query){
      // Nominatim Geocoding (kostenlos)
      fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(query) + "&limit=1")
        .then(function(r){ return r.json(); })
        .then(function(data){
          if(!data || !data.length){ alert("Ziel nicht gefunden"); return; }
          targetPos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), name: data[0].display_name };
          if(!lastPos){ alert("GPS fehlt — Route nur mit Standort"); return; }
          var startLng = lastPos.coords.longitude, startLat = lastPos.coords.latitude;
          fetch("https://router.project-osrm.org/route/v1/driving/"+startLng+","+startLat+";"+targetPos.lng+","+targetPos.lat+"?steps=true&geometries=geojson&overview=false")
            .then(function(r){ return r.json(); })
            .then(function(rdata){
              if(!rdata.routes || !rdata.routes.length){ alert("Route nicht gefunden"); return; }
              var route = rdata.routes[0];
              routeData = {
                totalDist: route.distance,
                totalTime: route.duration,
                steps: route.legs[0].steps,
                currentStep: 0
              };
              if(HalDo.Notify) HalDo.Notify.success("Route berechnet: " + fmtDist(route.distance));
              view.screen = "cockpit"; build();
            })
            .catch(function(e){ alert("Routing-Fehler: " + e.message); });
        })
        .catch(function(e){ alert("Geocoding-Fehler: " + e.message); });
    }

    /* ═══════════ SETTINGS SCREEN ═══════════ */
    function screenSettings(){
      var s = getSettings();
      var cv = getCustomVoice();
      
      var html = '<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>';

      // Sprachen
      html += '<div class="card"><h3>🌍 Sprache</h3>'
        + '<select id="setLang" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:inherit;font-family:inherit;font-size:14px">'
        + Object.keys(LANGS).map(function(k){ return '<option value="'+k+'"'+(s.lang===k?" selected":"")+'>'+LANGS[k].name+'</option>'; }).join('')
        + '</select>'
        + '<div style="display:flex;gap:6px;margin-top:8px">'
        + '<button class="btn sec" id="testVoice" style="flex:1;font-size:11px">🔊 Test</button>'
        + '<button class="btn sec" id="testBeep" style="flex:1;font-size:11px">🔔 Beep</button>'
        + '</div></div>';

      // Eigene Stimme
      html += '<div class="card"><h3>🎤 Eigene Stimme</h3>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Nimm deine eigene Warnung pro Kategorie auf.</div>';
      CATS.forEach(function(c){
        if(c.type === "poi") return; // Nur für Warnungen
        var has = !!cv[c.id];
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">'
          + '<span style="font-size:12px;font-weight:800">'+c.icon+' '+_esc(c.name.de)+'</span>'
          + '<button data-rec="'+c.id+'" style="background:'+(has?'rgba(74,222,128,.15)':'rgba(77,208,225,.15)')+';border:1px solid '+(has?'#4ade80':'#4dd0e1')+';color:'+(has?'#4ade80':'#4dd0e1')+';border-radius:6px;padding:5px 10px;font-size:10px;cursor:pointer;font-weight:800">'+(has?'✓ Neu':'🎤 Aufn.')+'</button>'
          + '</div>';
      });
      html += '</div>';

      // Kategorien
      html += '<div class="card"><h3>🎯 Kategorien</h3>';
      CATS.forEach(function(c){
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">'
          + '<span style="font-size:12px;font-weight:800">'+c.icon+' '+_esc(c.name.de)+'</span>'
          + '<button data-tgcat="'+c.id+'" style="background:'+(s.enabled[c.id]?'#4ade80':'rgba(255,255,255,.1)')+';border:none;width:44px;height:24px;border-radius:12px;cursor:pointer;color:'+(s.enabled[c.id]?'#000':'#fff')+';font-size:11px;font-weight:900">'+(s.enabled[c.id]?'✓':'✕')+'</button>'
          + '</div>';
      });
      html += '</div>';

      // Warn-Abstand
      html += '<div class="card"><h3>📏 Warn-Abstand für POIs</h3>'
        + '<input type="range" id="setWarnDist" min="200" max="3000" step="100" value="'+s.warnDist+'" style="width:100%">'
        + '<div style="text-align:center;font-size:12px;font-weight:900;color:#4dd0e1;margin-top:4px" id="warnDistLbl">'+s.warnDist+' m</div></div>';

      container.innerHTML = html;
      bindNav();
      
      container.querySelector("#setLang").addEventListener("change", function(e){ s.lang = e.target.value; saveSettings(s); });
      container.querySelector("#testVoice").addEventListener("click", function(){ speakAlert(CATS[0], 500, s); });
      container.querySelector("#testBeep").addEventListener("click", function(){ playBeep("urgent", 0.8); });
      container.querySelector("#setWarnDist").addEventListener("input", function(e){
        s.warnDist = parseInt(e.target.value); saveSettings(s);
        container.querySelector("#warnDistLbl").textContent = s.warnDist + " m";
      });
      container.querySelectorAll("[data-tgcat]").forEach(function(el){
        el.addEventListener("click", function(){ var k = el.dataset.tgcat; s.enabled[k] = !s.enabled[k]; saveSettings(s); screenSettings(); });
      });
      container.querySelectorAll("[data-rec]").forEach(function(el){
        el.addEventListener("click", function(){ recordVoice(el.dataset.rec); });
      });
    }

    /* ═══════════ MAP & LIST (unverändert von v3.0) ═══════════ */
    function screenMap(){
      var html = '<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card" style="padding:0;overflow:hidden;height:calc(100vh - 200px);position:relative">'
        + '<div id="blMap" style="width:100%;height:100%;background:#0a1220"></div>'
        + '</div>';
      container.innerHTML = html;
      bindNav();
      initMap();
    }
    
    function initMap(){
      if(!document.getElementById("leaflet-css")){
        var lc = document.createElement("link"); lc.id = "leaflet-css"; lc.rel = "stylesheet"; lc.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(lc);
      }
      if(window.L) return buildMap();
      var s = document.createElement("script"); s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload = buildMap; document.head.appendChild(s);
    }
    
    function buildMap(){
      var el = document.getElementById("blMap");
      if(!el || !window.L) return;
      el.innerHTML = "";
      var center = lastPos ? [lastPos.coords.latitude, lastPos.coords.longitude] : [51.1657, 10.4515];
      map = L.map(el, { zoomControl:false }).setView(center, 14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19 }).addTo(map);
      updateMapMarkers();
    }
    
    function updateMapMarkers(){
      if(!map) return;
      mapMarkers.forEach(function(m){ map.removeLayer(m); });
      mapMarkers = [];
      getWarnings().forEach(function(w){
        var cat = getCat(w.cat); if(!cat) return;
        var icon = L.divIcon({ html:'<div style="background:'+cat.color+';border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff">'+cat.icon+'</div>', className:"", iconSize:[32,32], iconAnchor:[16,16] });
        mapMarkers.push(L.marker([w.lat, w.lng], { icon:icon }).addTo(map));
      });
      if(lastPos){
        var uicon = L.divIcon({ html:'<div style="background:#4dd0e1;border:3px solid #fff;border-radius:50%;width:20px;height:20px;box-shadow:0 0 20px #4dd0e1"></div>', className:"", iconSize:[20,20], iconAnchor:[10,10] });
        mapMarkers.push(L.marker([lastPos.coords.latitude, lastPos.coords.longitude], { icon:uicon }).addTo(map));
        map.setView([lastPos.coords.latitude, lastPos.coords.longitude]);
      }
    }

    function screenList(){
      var warnings = getWarnings();
      var html = '<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card"><h3>📋 Gespeicherte Warnungen ('+warnings.length+')</h3>';
      if(!warnings.length){
        html += '<div style="text-align:center;color:var(--text-mute);padding:20px;font-size:12px">Keine Warnungen gespeichert.</div>';
      } else {
        warnings.slice().reverse().forEach(function(w){
          var c = getCat(w.cat) || CATS[0];
          html += '<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid '+c.color+'">'
            + '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:900">'+c.icon+' '+_esc(c.name.de)+'</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">'+w.lat.toFixed(4)+', '+w.lng.toFixed(4)+'</div></div>'
            + '<button data-del="'+w.id+'" style="background:rgba(255,128,128,.2);border:none;color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer">✕</button>'
            + '</div>';
        });
      }
      html += '</div>';
      container.innerHTML = html;
      bindNav();
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Löschen?")) return;
          saveWarnings(getWarnings().filter(function(w){return w.id!==el.dataset.del;}));
          screenList();
        });
      });
    }

    /* ═══════════ BINDINGS ═══════════ */
    function bindNav(){
      container.querySelectorAll("[data-nav]").forEach(function(el){
        el.addEventListener("click", function(){ 
          view.screen = el.dataset.nav; 
          if(view.screen === "map") screenMap();
          else if(view.screen === "settings") screenSettings();
          else if(view.screen === "nav") screenNav();
          else if(view.screen === "list") screenList();
          else build();
        });
      });
    }
    function bindCockpit(){
      var tb = container.querySelector("[data-trip]");
      if(tb) tb.addEventListener("click", function(){
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
      overlay.innerHTML = '<div style="font-size:44px">'+cat.icon+'</div>'
        + '<div style="font-size:14px;font-weight:900;color:#4dd0e1;margin:10px 0">Aufnahme: '+cat.name.de+'</div>'
        + '<div style="font-size:12px;color:#ff5555;margin-bottom:20px">🔴 Aufnahme läuft...</div>'
        + '<button id="recStop" style="padding:14px 30px;background:#ff5555;color:#fff;border:none;border-radius:10px;font-weight:900;cursor:pointer">⏹ Stoppen</button>'
        + '<button id="recCancel" style="margin-top:10px;padding:10px 20px;background:transparent;color:#888;border:1px solid #444;border-radius:8px;cursor:pointer">Abbrechen</button>';
      document.body.appendChild(overlay);

      var chunks = [], rec = null, timer = null;
      navigator.mediaDevices.getUserMedia({ audio:true }).then(function(stream){
        rec = new MediaRecorder(stream);
        rec.ondataavailable = function(e){ if(e.data.size) chunks.push(e.data); };
        rec.onstop = function(){
          stream.getTracks().forEach(function(t){ t.stop(); });
          var blob = new Blob(chunks, { type:"audio/webm" });
          var reader = new FileReader();
          reader.onload = function(){
            var cv = getCustomVoice();
            cv[catId] = reader.result;
            store.set("customVoice", cv);
            overlay.remove();
            if(HalDo.Notify) HalDo.Notify.success("Stimme gespeichert");
            screenSettings();
          };
          reader.readAsDataURL(blob);
        };
        rec.start();
        timer = setTimeout(function(){ if(rec.state === "recording") rec.stop(); }, 8000);
      }).catch(function(e){ alert("Mikrofon-Fehler: " + e.message); overlay.remove(); });

      overlay.querySelector("#recStop").addEventListener("click", function(){ if(rec) rec.stop(); if(timer) clearTimeout(timer); });
      overlay.querySelector("#recCancel").addEventListener("click", function(){
        if(timer) clearTimeout(timer);
        if(rec && rec.state === "recording"){ rec.onstop = null; rec.stop(); }
        overlay.remove();
      });
    }

    // ─── START ───
    startGeo();
    build();
  }

  HalDoApp("blitzer", { name: "Blitzer", icon: "⚠️", render: render, category: "werkzeuge" });
  console.log("🦚 blitzer.js v4.0 geladen — Cockpit · Tempolimit · Navi · POIs · Ezidi · Eigene Stimme");
})();
