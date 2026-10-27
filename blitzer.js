/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HALDO BLITZER v14.0 (ULTIMATE PRO)
   Bluetooth · Sprach-Navi · Tacho-Settings · Tankstellen-Preise
   Restaurants · Taschenlampe · Neue Kategorien
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var LOGO_URL = "logo.png";

  var CATS = [
    { id:"blitzer_fix",   icon:"📷", color:"#ff5555", type:"warn", sound:"siren",  name:{de:"Fester Blitzer",en:"Fixed Camera",tr:"Sabit Radar",ar:"رادار ثابت",ku:"Radarê Sabît",fr:"Radar fixe",es:"Radar fijo",it:"Autovelox fisso",ru:"Стационарная камера"}, voice:{de:"Achtung, Blitzer in {d}",en:"Warning, camera in {d}",tr:"Dikkat, radar {d}",ar:"تحذير رادار {d}",ku:"Hişyarî, radar li {d}",fr:"Attention, radar à {d}",es:"Atención, radar en {d}",it:"Attenzione, autovelox a {d}",ru:"Внимание, камера через {d}"} },
    { id:"blitzer_mobil", icon:"🚔", color:"#ff8844", type:"warn", sound:"siren", name:{de:"Mobile Kontrolle",en:"Mobile Check",tr:"Mobil Kontrol",ar:"مراقبة متحركة",ku:"Kontrola Mobîl",fr:"Contrôle mobile",es:"Control móvil",it:"Controllo mobile",ru:"Мобильная проверка"}, voice:{de:"Achtung, Kontrolle in {d}",en:"Warning, check in {d}",tr:"Dikkat, kontrol {d}",ar:"تحذير مراقبة {d}",ku:"Hişyarî, kontrol li {d}",fr:"Attention, contrôle à {d}",es:"Atención, control en {d}",it:"Attenzione, controllo a {d}",ru:"Внимание, проверка через {d}"} },
    { id:"stau", icon:"🚗", color:"#ffaa33", type:"warn", sound:"siren", name:{de:"Stau",en:"Traffic Jam",tr:"Trafik",ar:"ازدحام",ku:"Traffîk",fr:"Embouteillage",es:"Atasco",it:"Ingorgo",ru:"Пробка"}, voice:{de:"Stau in {d}",en:"Traffic jam in {d}",tr:"Trafik {d}",ar:"ازدحام {d}",ku:"Traffîk li {d}",fr:"Embouteillage à {d}",es:"Atasco en {d}",it:"Ingorgo a {d}",ru:"Пробка через {d}"} },
    { id:"unfall", icon:"💥", color:"#ff3333", type:"warn", sound:"urgent", name:{de:"Unfall",en:"Accident",tr:"Kaza",ar:"حادث",ku:"Qeza",fr:"Accident",es:"Accidente",it:"Incidente",ru:"Авария"}, voice:{de:"Unfall in {d}",en:"Accident in {d}",tr:"Kaza {d}",ar:"حادث {d}",ku:"Qeza li {d}",fr:"Accident à {d}",es:"Accidente en {d}",it:"Incidente a {d}",ru:"Авария через {d}"} },
    { id:"baustelle", icon:"🚧", color:"#ffaa33", type:"warn", sound:"chime", name:{de:"Baustelle",en:"Road Work",tr:"Yol Çalışması",ar:"أعمال طريق",ku:"Karê Rê",fr:"Travaux",es:"Obras",it:"Lavori",ru:"Ремонт дороги"}, voice:{de:"Baustelle in {d}",en:"Road work in {d}",tr:"Yol çalışması {d}",ar:"أعمال طريق {d}",ku:"Karê rê li {d}",fr:"Travaux à {d}",es:"Obras en {d}",it:"Lavori a {d}",ru:"Ремонт дороги через {d}"} },
    { id:"baustelle_gesperrt", icon:"⛔", color:"#ff3333", type:"warn", sound:"siren", name:{de:"Baustelle (gesperrt)",en:"Road Closed",tr:"Yol Kapalı",ar:"طريق مغلق",ku:"Rê Girtî",fr:"Route fermée",es:"Vía cerrada",it:"Strada chiusa",ru:"Дорога закрыта"}, voice:{de:"Straße gesperrt in {d}",en:"Road closed in {d}",tr:"Yol kapalı {d}",ar:"طريق مغلق {d}",ku:"Rê girtî li {d}",fr:"Route fermée à {d}",es:"Vía cerrada en {d}",it:"Strada chiusa a {d}",ru:"Дорога закрыта через {d}"} },
    { id:"umleitung", icon:"↪️", color:"#4dd0e1", type:"warn", sound:"siren", name:{de:"Umleitung",en:"Detour",tr:"Güzergah",ar:"تحويلة",ku:"Rêya Din",fr:"Déviation",es:"Desvío",it:"Deviazione",ru:"Объезд"}, voice:{de:"Umleitung in {d}",en:"Detour in {d}",tr:"Güzergah {d}",ar:"تحويلة {d}",ku:"Rêya din li {d}",fr:"Déviation à {d}",es:"Desvío en {d}",it:"Deviazione a {d}",ru:"Объезд через {d}"} },
    { id:"ezidi", icon:"🦚", color:"#ffd700", type:"warn", sound:"radar", name:{de:"Ezidi-Zentrum",en:"Ezidi Center",tr:"Ezidi Merkezi",ar:"مركز إيزيدي",ku:"Navenda Êzîdî",fr:"Centre Ezidi",es:"Centro Ezidi",it:"Centro Ezidi",ru:"Езидский центр"}, voice:{de:"Ezidi-Zentrum in {d}",en:"Ezidi center in {d}",tr:"Ezidi merkezi {d}",ar:"مركز إيزيدي {d}",ku:"Navenda Êzîdî li {d}",fr:"Centre Ezidi à {d}",es:"Centro Ezidi en {d}",it:"Centro Ezidi a {d}",ru:"Езидский центр через {d}"} },
    { id:"poi_fuel", icon:"⛽", color:"#66cc66", type:"poi", osm:"amenity=fuel", sound:"siren", name:{de:"Tankstelle",en:"Gas Station",tr:"Benzinlik",ar:"محطة وقود",ku:"Benzîngeh",fr:"Station",es:"Gasolinera",it:"Benzinaio",ru:"АЗС"}, voice:{de:"Tankstelle in {d}",en:"Gas station in {d}",tr:"Benzinlik {d}",ar:"محطة وقود {d}",ku:"Benzîngeh li {d}",fr:"Station à {d}",es:"Gasolinera en {d}",it:"Benzinaio a {d}",ru:"АЗС через {d}"} },
    { id:"poi_rest", icon:"🍴", color:"#ff8844", type:"poi", osm:"amenity=restaurant", sound:"chime", name:{de:"Restaurant",en:"Restaurant",tr:"Restoran",ar:"مطعم",ku:"Restoran",fr:"Restaurant",es:"Restaurante",it:"Ristorante",ru:"Ресторан"}, voice:{de:"Restaurant in {d}",en:"Restaurant in {d}",tr:"Restoran {d}",ar:"مطعم {d}",ku:"Restoran li {d}",fr:"Restaurant à {d}",es:"Restaurante en {d}",it:"Ristorante a {d}",ru:"Ресторан через {d}"} }
  ];

  var LANGS = {
    de:{name:"Deutsch",code:"de-DE"}, en:{name:"English",code:"en-US"},
    tr:{name:"Türkçe",code:"tr-TR"}, ar:{name:"العربية",code:"ar-SA"},
    ku:{name:"Kurdî (Ezidi)",code:"tr-TR"}, fr:{name:"Français",code:"fr-FR"},
    es:{name:"Español",code:"es-ES"}, it:{name:"Italiano",code:"it-IT"},
    ru:{name:"Русский",code:"ru-RU"}
  };

  var DEFAULT_SETTINGS = {
    enabled:{}, lang:"de", voiceOn:true, navVoiceOn:true, beepOn:true, notifyOn:true,
    warnDist:1000, sounds:{}, arrowColor:"gold", tachoColor:"#4dd0e1",
    alarmDuration:5, offlineMode:false, flashOnWarning:false, globalMute:false,
    tankerApiKey:"", btDeviceName:null
  };
  CATS.forEach(c => { DEFAULT_SETTINGS.enabled[c.id]=true; DEFAULT_SETTINGS.sounds[c.id]=c.sound||"chime"; });

  // ── Helpers ────────────────────────────────────────────────
  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function haversine(lat1,lng1,lat2,lng2){ var R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180; var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2); return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); }
  function fmtDist(m){ return m<1000 ? Math.round(m/10)*10+" m" : (m/1000).toFixed(1)+" km"; }
  function fmtTime(sec){ var h=Math.floor(sec/3600), m=Math.floor((sec%3600)/60), s=sec%60; return (h>0?h+"h ":"")+m+"m "+s+"s"; }

  // ── AUDIO ENGINE ───────────────────────────────────────────
  var audioCtx = null;
  function getAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
  function playBeep(pattern, vol, duration){
    duration = duration || 2.5;
    var ctx = getAudio(); if(!ctx) return;
    var now = ctx.currentTime;
    if(pattern==="siren"||pattern==="siren2"||pattern==="siren3"){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.type="sawtooth"; o.connect(g); g.connect(ctx.destination);
      var base = pattern==="siren3"?600:pattern==="siren2"?1000:800;
      o.frequency.setValueAtTime(base, now);
      for(var t=0;t<duration;t+=1.0){
        o.frequency.linearRampToValueAtTime(base+500, now+t+0.5);
        o.frequency.linearRampToValueAtTime(base, now+t+1.0);
      }
      g.gain.setValueAtTime(0,now); g.gain.linearRampToValueAtTime(vol,now+0.1);
      g.gain.setValueAtTime(vol,now+duration-0.2); g.gain.linearRampToValueAtTime(0,now+duration);
      o.start(now); o.stop(now+duration); return;
    }
    if(pattern==="long_alarm"||pattern==="long_alarm2"){
      var freq = pattern==="long_alarm2"?1200:1600;
      for(var i=0;i<(duration/0.4);i++){
        var t=now+(i*0.4);
        var o=ctx.createOscillator(), g=ctx.createGain();
        o.type="square"; o.frequency.value=freq; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.05);
        g.gain.setValueAtTime(vol,t+0.25); g.gain.linearRampToValueAtTime(0,t+0.35);
        o.start(t); o.stop(t+0.35);
      }
      return;
    }
    if(pattern==="radar"||pattern==="radar2"){
      var f2 = pattern==="radar2"?2600:2200;
      for(var i=0;i<(duration/0.15);i++){
        var t=now+(i*0.15);
        var o=ctx.createOscillator(), g=ctx.createGain();
        o.type="sine"; o.frequency.value=f2; o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.01);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.08);
        o.start(t); o.stop(t+0.1);
      }
      return;
    }
    if(pattern==="birds"){
      for(var i=0;i<10;i++){
        var t=now+i*0.22+Math.random()*0.1;
        var o=ctx.createOscillator(), g=ctx.createGain();
        o.type="sine";
        o.frequency.setValueAtTime(2000+Math.random()*1500,t);
        o.frequency.exponentialRampToValueAtTime(2500+Math.random()*1500,t+0.05);
        o.connect(g); g.connect(ctx.destination);
        g.gain.setValueAtTime(0,t); g.gain.linearRampToValueAtTime(vol,t+0.01);
        g.gain.exponentialRampToValueAtTime(0.001,t+0.1);
        o.start(t); o.stop(t+0.12);
      }
      return;
    }
    if(pattern==="extreme"){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.type="sawtooth"; o.frequency.value=300; o.connect(g); g.connect(ctx.destination);
      for(var i=0;i<duration;i+=0.5){
        o.frequency.setValueAtTime(300,now+i);
        o.frequency.linearRampToValueAtTime(1500,now+i+0.25);
        o.frequency.linearRampToValueAtTime(300,now+i+0.5);
      }
      g.gain.setValueAtTime(vol,now);
      g.gain.setValueAtTime(vol,now+duration-0.2);
      g.gain.linearRampToValueAtTime(0,now+duration);
      o.start(now); o.stop(now+duration);
      return;
    }
    var p = {
      urgent:[{f:880,t:0,d:0.1},{f:880,t:0.15,d:0.1}],
      alarm:[{f:1200,t:0,d:0.08},{f:1200,t:0.12,d:0.08}],
      chime:[{f:523,t:0,d:0.15},{f:659,t:0.15,d:0.15},{f:784,t:0.3,d:0.25}],
      low:[{f:440,t:0,d:0.2}]
    }[pattern] || [{f:440,t:0,d:0.2}];
    p.forEach(function(b){
      var o=ctx.createOscillator(), g=ctx.createGain();
      o.frequency.value=b.f; o.type="sine";
      g.gain.setValueAtTime(0,now+b.t);
      g.gain.linearRampToValueAtTime(vol,now+b.t+0.01);
      g.gain.exponentialRampToValueAtTime(0.001,now+b.t+b.d);
      o.connect(g).connect(ctx.destination); o.start(now+b.t); o.stop(now+b.t+b.d+0.02);
    });
  }

  // ── FLASHLIGHT (Torch) ─────────────────────────────────────
  var torchStream = null, torchTrack = null, torchTimer = null;
  async function setTorch(on){
    try {
      if(on){
        if(!torchStream){
          torchStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"environment" } });
          torchTrack = torchStream.getVideoTracks()[0];
        }
        await torchTrack.applyConstraints({ advanced:[{ torch:true }] });
      } else if(torchTrack){
        try { await torchTrack.applyConstraints({ advanced:[{ torch:false }] }); } catch(e){}
      }
    } catch(e){ console.warn("[Torch]", e.message); }
  }
  function blinkTorch(count){
    if(torchTimer) clearInterval(torchTimer);
    var i=0, max=count||5;
    setTorch(true);
    torchTimer = setInterval(function(){
      i++;
      setTorch(i%2===0 ? true : false);
      if(i>=max*2){ clearInterval(torchTimer); torchTimer=null; setTorch(false); }
    }, 250);
  }

  // ── MAIN RENDER ────────────────────────────────────────────
  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"cockpit", settingsSub:null };
    var geoWatch=null, lastPos=null, simTimer=null, simSpeed=0;
    var trip = { active:false, startTime:0, distance:0, warnings:0 };
    var map=null, mapMarkers=[], triggered={}, lastLimitFetch=0, currentLimit=null;
    var poiCache={}, routeData=null, targetPos=null;
    var tfModel=null, cameraStream=null, visionLoop=null;
    var weatherData=null, weatherPos=store.get("weatherPos",{x:20,y:60});
    var parkTimer=null, parkEndTime=0;
    var fuelStations=[], fuelCache={}, restaurantCache={};
    var btDevice=null, btServer=null;
    var lastSpokenStep=null, lastSpokenDist=null;

    function getSettings(){ var s=store.get("settings",{}); var m=JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); Object.keys(s).forEach(function(k){ m[k]=s[k]; }); return m; }
    function saveSettings(s){ store.set("settings",s); }
    function getWarnings(){ return store.get("warnings",[]); }
    function saveWarnings(w){ store.set("warnings",w); }
    function getCat(id){ return CATS.find(function(c){ return c.id===id; }); }

    function build(){
      var sc = view.screen;
      if(sc==="cockpit") screenCockpit();
      else if(sc==="map") screenMap();
      else if(sc==="settings") screenSettingsMenu();
      else if(sc==="settings_display") screenSettingsDisplay();
      else if(sc==="settings_sounds") screenSettingsSounds();
      else if(sc==="settings_nav") screenSettingsNav();
      else if(sc==="settings_lang") screenSettingsLang();
      else if(sc==="settings_bt") screenSettingsBT();
      else if(sc==="settings_flash") screenSettingsFlash();
      else if(sc==="settings_about") screenSettingsAbout();
      else if(sc==="nav") screenNav();
      else if(sc==="vision") screenVision();
      else if(sc==="list") screenList();
      else if(sc==="report") screenReport();
      else if(sc==="park") screenPark();
      else if(sc==="fuel") screenFuel();
    }

    // ═══════════════ COCKPIT ═══════════════
    function screenCockpit(){
      var s = getSettings();
      var speed = lastPos ? Math.round((lastPos.coords.speed||0)*3.6) : 0;
      if(simTimer) speed = Math.round(simSpeed);

      var nextEvent = getNextEvent();
      var nearestWarning = getNearestWarning();
      var maxSpeed = 240, startAngle = 210, endAngle = 510;
      var currentAngle = startAngle + (Math.min(speed,maxSpeed)/maxSpeed)*(endAngle-startAngle);

      var ticks = "";
      for(var i=0;i<=240;i+=20){
        var angle = startAngle + (i/maxSpeed)*(endAngle-startAngle);
        var rad = (angle-90)*Math.PI/180;
        var isMajor = i%40===0;
        var len = isMajor?15:8;
        var x1=100+75*Math.cos(rad), y1=100+75*Math.sin(rad);
        var x2=100+(75-len)*Math.cos(rad), y2=100+(75-len)*Math.sin(rad);
        var tc = (i>180)?'#ff5555':(isMajor?'#fff':'rgba(255,255,255,.3)');
        ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tc}" stroke-width="${isMajor?3:1.5}"/>`;
        if(isMajor){
          var tx=100+60*Math.cos(rad), ty=100+60*Math.sin(rad);
          ticks += `<text x="${tx}" y="${ty}" fill="${tc}" font-size="12" font-weight="900" text-anchor="middle" dominant-baseline="middle">${i}</text>`;
        }
      }

      var arrowColors = {
        gold:{fill:"#ffd700",glow:"rgba(255,215,0,.8)"},
        blue:{fill:"#4dd0e1",glow:"rgba(77,208,225,.8)"},
        white:{fill:"#ffffff",glow:"rgba(255,255,255,.8)"},
        green:{fill:"#4ade80",glow:"rgba(74,222,128,.8)"},
        red:{fill:"#ff5555",glow:"rgba(255,85,85,.8)"},
        purple:{fill:"#b478ff",glow:"rgba(180,120,255,.8)"},
        orange:{fill:"#ff8844",glow:"rgba(255,136,68,.8)"}
      };
      var ac = arrowColors[s.arrowColor] || arrowColors.gold;

      var etaStr="—", remTimeStr="—";
      if(routeData && routeData.totalTime){
        var eta = new Date(Date.now()+routeData.totalTime*1000);
        etaStr = eta.toLocaleTimeString("de-DE",{hour:'2-digit',minute:'2-digit'});
        remTimeStr = fmtTime(Math.round(routeData.totalTime));
      }

      var tachoColor = s.tachoColor;
      var css = `
        .cpt-wrap{position:relative;height:calc(100vh - 100px);min-height:640px;background:radial-gradient(ellipse at 50% 30%,#0a1220 0%,#050810 80%);border-radius:20px;padding:16px;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,sans-serif;color:#fff}
        .cpt-top{display:flex;justify-content:space-between;z-index:10}
        .cpt-navbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:6px}
        .cpt-tacho{position:relative;width:400px;height:400px;margin:8px auto;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .1s}
        .cpt-tacho:active{transform:scale(.98)}
        .tacho-bg{position:absolute;inset:0;background:radial-gradient(circle,rgba(10,18,32,1) 0%,rgba(5,8,16,1) 100%);border-radius:50%;border:2px solid ${tachoColor}44;box-shadow:0 0 30px ${tachoColor}22,inset 0 0 20px rgba(0,0,0,.8)}
        .needle-container{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(${currentAngle}deg);transition:transform .3s cubic-bezier(.4,2.08,.55,.44)}
        .needle{width:4px;height:155px;background:linear-gradient(to top,transparent 40%,#ff3333 40%,#ff3333 100%);position:absolute;bottom:50%;transform-origin:bottom center;border-radius:2px;box-shadow:0 0 12px #ff3333}
        .needle-center{position:absolute;width:28px;height:28px;background:#111;border:4px solid #ff3333;border-radius:50%;z-index:2;box-shadow:0 0 20px #ff3333}
        .inner-display{position:absolute;top:50%;left:50%;transform:translate(-50%,-30%);z-index:5;background:rgba(0,0,0,.55);border:1px solid ${tachoColor}55;border-radius:14px;padding:10px 14px;text-align:center;min-width:130px;backdrop-filter:blur(6px);box-shadow:0 0 20px ${tachoColor}33;cursor:pointer}
        .inner-display .spd{font-size:36px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 0 12px ${tachoColor}}
        .inner-display .unit{font-size:9px;color:#7fa5b8;font-weight:900;letter-spacing:2px;margin-top:2px}
        .inner-display .wrn{margin-top:6px;font-size:10px;font-weight:900;padding:3px 8px;border-radius:10px;background:rgba(255,255,255,.08);white-space:nowrap}
        .inner-display .hint{margin-top:6px;font-size:8px;color:#5a7a8a;letter-spacing:1px}
        .cpt-limit{position:absolute;top:12px;right:12px;width:76px;height:76px;border-radius:50%;background:#fff;border:7px solid #ff3333;display:flex;align-items:center;justify-content:center;z-index:20;box-shadow:0 0 18px rgba(255,51,51,.6)}
        .cpt-limit-num{font-size:28px;font-weight:900;color:#000}
        .holo-container{perspective:800px;width:100%;height:130px;display:flex;align-items:center;justify-content:center;margin-top:0;position:relative}
        .holo-base{position:absolute;bottom:0;width:200px;height:40px;background:radial-gradient(ellipse,${ac.glow} 0%,transparent 70%);filter:blur(8px);border-radius:50%}
        .holo-arrow-box{position:relative;transform-style:preserve-3d;transform:rotateX(60deg) rotateZ(var(--rot,0deg));animation:arrowFloat 1.5s infinite alternate}
        .holo-svg{width:90px;height:auto;filter:drop-shadow(0 0 20px ${ac.glow})}
        @keyframes arrowFloat{0%{transform:rotateX(60deg) rotateZ(var(--rot,0deg)) translateZ(0)}100%{transform:rotateX(60deg) rotateZ(var(--rot,0deg)) translateZ(30px)}}
        .road-sign{position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:#0066cc;border:2px solid #fff;border-radius:8px;padding:4px 12px;text-align:center;box-shadow:0 4px 10px rgba(0,0,0,.5);z-index:10;white-space:nowrap}
        .road-sign .num{font-size:16px;font-weight:900;color:#fff;background:#0055aa;display:inline-block;padding:2px 6px;border-radius:4px;margin-bottom:2px}
        .road-sign .dest{font-size:11px;font-weight:800;color:#fff}
        .road-sign .action{font-size:9px;color:#e0e0e0}
        .cpt-bottom{margin-top:auto;background:rgba(0,0,0,.5);backdrop-filter:blur(10px);border-radius:16px;padding:12px;border:1px solid rgba(255,255,255,.08);z-index:10}
        .cpt-stat{display:flex;justify-content:space-around;text-align:center;margin-bottom:8px}
        .cpt-stat div span:first-child{font-size:16px;font-weight:900;color:${tachoColor};display:block}
        .cpt-stat div span:last-child{font-size:8px;color:#7fa5b8;font-weight:800;text-transform:uppercase}
        .cpt-btn{width:100%;padding:14px;border:none;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;transition:.2s}
        .cpt-btn.start{background:linear-gradient(135deg,#4ade80,#22c55e);color:#000}
        .cpt-btn.stop{background:#ff5555;color:#fff}
        .weather-widget{position:absolute;z-index:100;background:rgba(0,0,0,.7);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.15);border-radius:12px;padding:8px 12px;font-size:11px;font-weight:800;display:flex;align-items:center;gap:8px;cursor:move;box-shadow:0 4px 15px rgba(0,0,0,.5);user-select:none;touch-action:none}
        .cpt-logo{width:44px;height:44px;border-radius:10px;object-fit:cover;border:2px solid ${tachoColor}66;box-shadow:0 0 15px ${tachoColor}44}
      `;

      var html = `<style>${css}</style><div class="cpt-wrap">
      <div class="cpt-top">
        <div style="display:flex;gap:6px;align-items:center">
          <img src="${LOGO_URL}" class="cpt-logo" onerror="this.style.display='none'">
          <button data-nav="nav" class="cpt-navbtn" style="color:${tachoColor}">🧭 Route</button>
          <button data-nav="report" class="cpt-navbtn" style="color:#ff5555">➕ Melden</button>
        </div>
        <div style="display:flex;gap:6px">
          <button data-nav="fuel" class="cpt-navbtn">⛽</button>
          <button data-nav="settings" class="cpt-navbtn">⚙️</button>
        </div>
      </div>`;

      if(weatherData){
        html += `<div id="weatherWidget" class="weather-widget" style="left:${weatherPos.x}px;top:${weatherPos.y}px">
          <span style="font-size:18px">${weatherData.icon}</span>
          <div>
            <div>${weatherData.city||'Ort'} ${weatherData.temp}°C</div>
            <div style="font-size:9px;color:#aaa">${weatherData.desc} · ${weatherData.pressure} hPa</div>
          </div>
        </div>`;
      }

      if(nextEvent && nextEvent.type==="nav"){
        var arrowAngle = nextEvent.modifier && nextEvent.modifier.indexOf('left')>=0 ? -45 : (nextEvent.modifier && nextEvent.modifier.indexOf('right')>=0 ? 45 : 0);
        var roadName = nextEvent.instruction || "Straße";
        var roadNum = "", roadDest = roadName;
        if(roadName.match(/^[AB]\d+/)){ roadNum = roadName.split(" ")[0]; roadDest = roadName.substring(roadName.indexOf(" ")+1)||""; }
        html += `<div style="margin-top:8px;padding:10px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:12px;display:flex;justify-content:space-between;align-items:center;z-index:10">
          <div><div style="font-size:10px;color:#7fa5b8">ROUTE AKTIV</div><div style="font-size:13px;font-weight:900;color:#fff">${_esc(routeData.targetName)}</div></div>
          <div style="text-align:right"><div style="font-size:10px;color:#7fa5b8">ANKUNFT</div><div style="font-size:14px;font-weight:900;color:${tachoColor}">${etaStr} (${remTimeStr})</div></div>
        </div>`;
        html += `<div class="holo-container">
          <div class="road-sign">${roadNum?`<div class="num">${roadNum}</div>`:''}<div class="dest">${_esc(roadDest)}</div><div class="action">in ${fmtDist(nextEvent.distance)}</div></div>
          <div class="holo-base"></div>
          <div class="holo-arrow-box" style="--rot:${arrowAngle}deg">
            <svg class="holo-svg" viewBox="0 0 100 100"><polygon points="50,5 90,50 65,50 65,95 35,95 35,50 10,50" fill="${ac.fill}" stroke="#fff" stroke-width="2"/></svg>
          </div>
        </div>`;
      } else {
        html += `<div class="holo-container" style="height:90px;margin-top:10px">
          <div class="holo-base"></div>
          <div class="holo-arrow-box" style="--rot:0deg">
            <svg class="holo-svg" viewBox="0 0 100 100" style="width:60px"><polygon points="50,5 90,50 65,50 65,95 35,95 35,50 10,50" fill="${ac.fill}" stroke="#fff" stroke-width="2"/></svg>
          </div>
        </div>`;
      }

      html += `<div class="cpt-tacho" data-open-settings="1">
        ${currentLimit!==null?`<div class="cpt-limit"><div class="cpt-limit-num">${currentLimit===0?"∞":currentLimit}</div></div>`:''}
        <div class="tacho-bg"></div>
        <svg viewBox="0 0 200 200" style="position:absolute;inset:0;width:100%;height:100%">
          <path d="M 39.3 156 A 75 75 0 1 1 160.7 156" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="8"/>
          <path d="M 39.3 156 A 75 75 0 1 1 160.7 156" fill="none" stroke="${tachoColor}" stroke-width="8" stroke-linecap="round" stroke-dasharray="353" stroke-dashoffset="${353-(Math.min(speed,maxSpeed)/maxSpeed*353)}" style="transition:stroke-dashoffset .2s"/>
          ${ticks}
        </svg>
        <div class="needle-container"><div class="needle"></div></div>
        <div class="needle-center"></div>
        <div class="inner-display">
          <div class="spd">${speed}</div>
          <div class="unit">KM/H</div>
          ${nearestWarning?`<div class="wrn" style="color:${nearestWarning.color}">${nearestWarning.icon} in ${fmtDist(nearestWarning.dist)}</div>`:`<div class="wrn" style="color:#7fa5b8">Bereit</div>`}
          <div class="hint">⚙️ TIPPEN = EINSTELLUNGEN</div>
        </div>
      </div>`;

      var elapsedMin = trip.active ? Math.floor((Date.now()-trip.startTime)/60000) : 0;
      html += `<div class="cpt-bottom">
        <div class="cpt-stat">
          <div><span>${trip.distance.toFixed(1)} km</span><span>Strecke</span></div>
          <div><span>${elapsedMin} min</span><span>Zeit</span></div>
          <div><span id="tripWarn">${trip.warnings}</span><span>Warnungen</span></div>
        </div>
        <div style="display:flex;gap:6px">
          ${trip.active?`<button data-trip="stop" class="cpt-btn stop" style="flex:1">⏹ Fahrt beenden</button>`:`<button data-trip="start" class="cpt-btn start" style="flex:1">▶ Fahrt starten</button>`}
          <button data-nav="park" class="cpt-btn" style="flex:1;background:rgba(255,255,255,.1);color:#fff">🅿️ Parkuhr</button>
        </div>
        ${!simTimer?`<button id="simBtn" class="cpt-btn" style="margin-top:8px;background:#ffd54f;color:#000;font-size:12px">🧪 Testfahrt simulieren</button>`:''}
      </div></div>`;

      container.innerHTML = html;
      bindNav(); bindCockpit(); bindWeatherDrag();
      var tacho = container.querySelector('[data-open-settings]');
      if(tacho) tacho.addEventListener("click", function(){ view.screen="settings"; build(); });
      fetchPOIsIfNeeded(); fetchSpeedLimitIfNeeded();
      if(!weatherData) fetchWeather();
    }

    function bindWeatherDrag(){
      var w = document.getElementById("weatherWidget"); if(!w) return;
      var isDragging=false, startX, startY, startLeft, startTop;
      w.addEventListener("pointerdown", function(e){
        isDragging=true; startX=e.clientX; startY=e.clientY;
        startLeft=parseInt(w.style.left)||20; startTop=parseInt(w.style.top)||60;
        w.setPointerCapture(e.pointerId);
      });
      w.addEventListener("pointermove", function(e){
        if(!isDragging) return;
        var dx=e.clientX-startX, dy=e.clientY-startY;
        var nl=Math.max(0,Math.min(window.innerWidth-150,startLeft+dx));
        var nt=Math.max(0,Math.min(window.innerHeight-80,startTop+dy));
        w.style.left=nl+"px"; w.style.top=nt+"px";
        weatherPos={x:nl,y:nt};
      });
      w.addEventListener("pointerup", function(e){
        isDragging=false;
        try{ w.releasePointerCapture(e.pointerId); }catch(err){}
        store.set("weatherPos", weatherPos);
      });
    }

    function getNearestWarning(){
      if(!lastPos) return null;
      var lat=lastPos.coords.latitude, lng=lastPos.coords.longitude;
      var minDist=Infinity, nearest=null;
      getWarnings().forEach(function(w){
        var d=haversine(lat,lng,w.lat,w.lng);
        if(d<minDist){ minDist=d; nearest=w; }
      });
      if(nearest && minDist<10000){
        var cat=getCat(nearest.cat);
        return { icon:cat.icon, color:cat.color, dist:minDist };
      }
      return null;
    }

    // ═══════════════ SETTINGS MENU ═══════════════
    function backBtn(target){
      return `<button data-nav="${target||'cockpit'}" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>`;
    }
    function screenSettingsMenu(){
      var s = getSettings();
      var html = backBtn('cockpit');
      html += `<div class="card"><h3>⚙️ Einstellungen</h3>
        <div style="display:grid;gap:6px;margin-top:8px">
          <button data-nav="settings_display" class="menu-btn">🎨 Display & Tacho</button>
          <button data-nav="settings_sounds" class="menu-btn">🎵 Töne & Stimmen</button>
          <button data-nav="settings_nav" class="menu-btn">🗺️ Navigation</button>
          <button data-nav="settings_lang" class="menu-btn">🌍 Sprache</button>
          <button data-nav="settings_bt" class="menu-btn">📡 Bluetooth ${s.btDeviceName?`<span style="color:#4ade80">(✓ ${_esc(s.btDeviceName)})</span>`:''}</button>
          <button data-nav="settings_flash" class="menu-btn">💡 Taschenlampe & Warnung</button>
          <button data-nav="settings_about" class="menu-btn">ℹ️ Über HalDo Blitzer</button>
        </div>
      </div>`;
      html += `<style>.menu-btn{width:100%;padding:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:13px;font-weight:800;text-align:left;cursor:pointer;font-family:inherit;display:flex;justify-content:space-between;align-items:center}.menu-btn:hover{background:rgba(77,208,225,.15);border-color:#4dd0e1}</style>`;
      container.innerHTML = html; bindNav();
    }

    function screenSettingsDisplay(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>🎨 Tacho-Design</h3>
        <div class="field"><label>Tacho-Farbe</label>
          <div style="display:flex;gap:8px;margin-top:6px">
            ${['#4dd0e1','#ff5555','#4ade80','#b478ff','#ffd700','#ff8844'].map(function(c){
              return `<button data-color="${c}" style="flex:1;height:36px;background:${c};border:3px solid ${s.tachoColor===c?'#fff':'transparent'};border-radius:8px;cursor:pointer"></button>`;
            }).join("")}
          </div>
        </div>
        <div class="field" style="margin-top:10px"><label>Pfeil-Farbe</label>
          <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
            ${[['gold','#ffd700'],['blue','#4dd0e1'],['white','#ffffff'],['green','#4ade80'],['red','#ff5555'],['purple','#b478ff'],['orange','#ff8844']].map(function(a){
              return `<button data-arrow="${a[0]}" style="flex:1;min-width:44px;height:36px;background:${a[1]};border:3px solid ${s.arrowColor===a[0]?'#fff':'transparent'};border-radius:8px;cursor:pointer"></button>`;
            }).join("")}
          </div>
        </div>
        <div class="field" style="margin-top:10px"><label>Alarm-Dauer: <span id="durLbl">${s.alarmDuration}s</span></label>
          <input type="range" id="setDuration" min="2" max="15" step="1" value="${s.alarmDuration}" style="width:100%">
        </div>
        <div class="field" style="margin-top:10px"><label>Offline Modus</label>
          <button id="toggleOffline" style="width:100%;padding:10px;background:${s.offlineMode?'rgba(255,128,128,.2)':'rgba(74,222,128,.2)'};border:1px solid ${s.offlineMode?'#ff8080':'#4ade80'};color:${s.offlineMode?'#ff8080':'#4ade80'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">${s.offlineMode?'Offline (Karten aus)':'Online (Karten aktiv)'}</button>
        </div>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#setDuration").addEventListener("input", function(e){
        s.alarmDuration=parseInt(e.target.value); container.querySelector("#durLbl").textContent=s.alarmDuration+"s"; saveSettings(s);
      });
      container.querySelectorAll("[data-color]").forEach(function(el){
        el.addEventListener("click", function(){ s.tachoColor=el.dataset.color; saveSettings(s); screenSettingsDisplay(); });
      });
      container.querySelectorAll("[data-arrow]").forEach(function(el){
        el.addEventListener("click", function(){ s.arrowColor=el.dataset.arrow; saveSettings(s); screenSettingsDisplay(); });
      });
      container.querySelector("#toggleOffline").addEventListener("click", function(){ s.offlineMode=!s.offlineMode; saveSettings(s); screenSettingsDisplay(); });
    }

    function screenSettingsSounds(){
      var s = getSettings();
      var soundOptions = [
        {id:"siren",name:"🚨 Sirene"},{id:"siren2",name:"🚨 Sirene 2"},{id:"siren3",name:"🚨 Sirene 3 (tief)"},
        {id:"long_alarm",name:"🔔 Feueralarm"},{id:"long_alarm2",name:"🔔 Feuer 2"},{id:"radar",name:"📡 Radar"},
        {id:"radar2",name:"📡 Radar 2"},{id:"urgent",name:"⚠️ Dringend"},{id:"extreme",name:"🔥 Extrem"},
        {id:"birds",name:"🐦 Vögel"},{id:"chime",name:"🎵 Glocke"},{id:"low",name:"🕊️ Sanft"}
      ];
      var html = backBtn('settings');
      html += `<div class="card"><h3>🎵 Globale Töne</h3>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button id="muteAll" style="flex:1;padding:12px;background:${s.globalMute?'rgba(255,85,85,.2)':'rgba(74,222,128,.2)'};border:1px solid ${s.globalMute?'#ff5555':'#4ade80'};color:${s.globalMute?'#ff5555':'#4ade80'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">${s.globalMute?'🔇 ALLES STUMM':'🔊 TÖNE AN'}</button>
          <button id="toggleVoice" style="flex:1;padding:12px;background:${s.voiceOn?'rgba(77,208,225,.2)':'rgba(255,85,85,.2)'};border:1px solid ${s.voiceOn?'#4dd0e1':'#ff5555'};color:${s.voiceOn?'#4dd0e1':'#ff5555'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">${s.voiceOn?'🗣️ STIMME AN':'🔇 STIMME AUS'}</button>
        </div>
      </div>`;
      html += `<div class="card"><h3>🚨 Alarm-Töne pro Kategorie</h3>`;
      CATS.forEach(function(c){
        var cur = s.sounds[c.id]||"chime";
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <span style="font-size:11px;font-weight:800;flex:1">${c.icon} ${_esc(c.name.de)}</span>
          <div style="display:flex;gap:4px">
            <select data-sound="${c.id}" style="background:rgba(0,0,0,.5);color:#fff;border:1px solid #444;border-radius:6px;padding:4px 6px;font-size:10px;font-family:inherit">
              ${soundOptions.map(function(o){return `<option value="${o.id}" ${cur===o.id?'selected':''}>${o.name}</option>`;}).join("")}
            </select>
            <button data-test="${c.id}" style="background:rgba(77,208,225,.15);border:1px solid rgba(77,208,225,.3);color:#4dd0e1;border-radius:6px;width:30px;cursor:pointer;font-size:12px">🔊</button>
          </div>
        </div>`;
      });
      html += `</div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#muteAll").addEventListener("click", function(){ s.globalMute=!s.globalMute; saveSettings(s); screenSettingsSounds(); });
      container.querySelector("#toggleVoice").addEventListener("click", function(){ s.voiceOn=!s.voiceOn; saveSettings(s); screenSettingsSounds(); });
      container.querySelectorAll("[data-sound]").forEach(function(el){
        el.addEventListener("change", function(e){ s.sounds[el.dataset.sound]=e.target.value; saveSettings(s); });
      });
      container.querySelectorAll("[data-test]").forEach(function(el){
        el.addEventListener("click", function(){ playBeep(s.sounds[el.dataset.test]||"chime", 0.8, s.alarmDuration); });
      });
    }

    function screenSettingsNav(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>🗺️ Navigation</h3>
        <div class="field"><label>Sprach-Navi</label>
          <button id="toggleNavVoice" style="width:100%;padding:12px;background:${s.navVoiceOn?'rgba(74,222,128,.2)':'rgba(255,85,85,.2)'};border:1px solid ${s.navVoiceOn?'#4ade80':'#ff5555'};color:${s.navVoiceOn?'#4ade80':'#ff5555'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">${s.navVoiceOn?'🗣️ ANSAGEN AN':'🔇 ANSAGEN AUS'}</button>
          <div style="font-size:10px;color:#7fa5b8;margin-top:6px">Bei Aktivierung werden Adresse + Abbiegehinweise angesagt (rechts/links/geradeaus).</div>
        </div>
        <div class="field" style="margin-top:10px"><label>Warn-Distanz: <span id="wdLbl">${s.warnDist}m</span></label>
          <input type="range" id="warnDistRange" min="200" max="2000" step="100" value="${s.warnDist}" style="width:100%">
        </div>
        <div class="field" style="margin-top:10px"><label>Push-Nachrichten (Hintergrund)</label>
          <button id="toggleNotify" style="width:100%;padding:12px;background:${s.notifyOn?'rgba(74,222,128,.2)':'rgba(255,85,85,.2)'};border:1px solid ${s.notifyOn?'#4ade80':'#ff5555'};color:${s.notifyOn?'#4ade80':'#ff5555'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">${s.notifyOn?'🔔 PUSH AN':'🔕 PUSH AUS'}</button>
        </div>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#toggleNavVoice").addEventListener("click", function(){ s.navVoiceOn=!s.navVoiceOn; saveSettings(s); screenSettingsNav(); });
      container.querySelector("#toggleNotify").addEventListener("click", function(){
        s.notifyOn=!s.notifyOn; saveSettings(s);
        if(s.notifyOn && "Notification" in window && Notification.permission==="default") Notification.requestPermission();
        screenSettingsNav();
      });
      container.querySelector("#warnDistRange").addEventListener("input", function(e){
        s.warnDist=parseInt(e.target.value); container.querySelector("#wdLbl").textContent=s.warnDist+"m"; saveSettings(s);
      });
    }

    function screenSettingsLang(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>🌍 Sprache</h3>
        <select id="setLang" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid #444;border-radius:8px;color:#fff;font-size:14px">
        ${Object.keys(LANGS).map(function(k){ return `<option value="${k}" ${s.lang===k?"selected":""}>${LANGS[k].name}</option>`; }).join("")}
        </select>
        <button id="testLang" style="width:100%;padding:12px;margin-top:10px;background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">🔊 Test-Sprache</button>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#setLang").addEventListener("change", function(e){ s.lang=e.target.value; saveSettings(s); });
      container.querySelector("#testLang").addEventListener("click", function(){
        if(!window.speechSynthesis) return;
        var msg = {de:"Hallo, ich bin HalDo Blitzer",en:"Hello, I am HalDo Blitzer",tr:"Merhaba, ben HalDo Blitzer",ar:"مرحبا، أنا هالدو بليتزر",ku:"Silav, ez HalDo Blitzer im",fr:"Bonjour, je suis HalDo Blitzer",es:"Hola, soy HalDo Blitzer",it:"Ciao, sono HalDo Blitzer",ru:"Привет, я HalDo Blitzer"}[s.lang];
        var u = new SpeechSynthesisUtterance(msg); u.lang = LANGS[s.lang].code;
        window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      });
    }

    function screenSettingsBT(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>📡 Bluetooth</h3>
        <div style="font-size:11px;color:#7fa5b8;margin-bottom:10px">Verbinde dein Handy mit Auto, Lautsprecher, Headset oder anderen Geräten. (Web Bluetooth — funktioniert nur in Chrome/Edge auf Android & Desktop.)</div>
        <button id="btScan" style="width:100%;padding:14px;background:linear-gradient(135deg,#4dd0e1,#b478ff);border:none;color:#000;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer">🔍 Gerät suchen</button>
        <div id="btStatus" style="margin-top:12px;padding:10px;background:rgba(0,0,0,.3);border-radius:8px;font-size:12px;color:#7fa5b8">${s.btDeviceName?`✅ Verbunden: ${_esc(s.btDeviceName)}`:'❌ Nicht verbunden'}</div>
        ${s.btDeviceName?`<button id="btDisconnect" style="width:100%;padding:12px;margin-top:8px;background:rgba(255,85,85,.2);border:1px solid #ff5555;color:#ff5555;border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">🔌 Trennen</button>`:''}
      </div>`;
      container.innerHTML = html; bindNav();
      var btn = container.querySelector("#btScan");
      if(btn) btn.addEventListener("click", async function(){
        var status = container.querySelector("#btStatus");
        status.textContent = "🔍 Suche Geräte...";
        try {
          if(!navigator.bluetooth) throw new Error("Web Bluetooth nicht verfügbar (nutze Chrome/Edge auf Android)");
          var device = await navigator.bluetooth.requestDevice({ acceptAllDevices:true, optionalServices:['battery_service','device_information','generic_access'] });
          status.textContent = "⏳ Verbinde...";
          btServer = await device.gatt.connect();
          btDevice = device;
          s.btDeviceName = device.name || "Bluetooth-Gerät";
          saveSettings(s);
          status.textContent = "✅ Verbunden: " + s.btDeviceName;
          if(HalDo.Notify) HalDo.Notify.success("Bluetooth verbunden: " + s.btDeviceName);
          screenSettingsBT();
        } catch(e){
          status.textContent = "❌ " + e.message;
        }
      });
      var disc = container.querySelector("#btDisconnect");
      if(disc) disc.addEventListener("click", function(){
        if(btServer){ try{ btServer.disconnect(); }catch(e){} }
        btServer = null; btDevice = null;
        s.btDeviceName = null; saveSettings(s);
        screenSettingsBT();
      });
    }

    function screenSettingsFlash(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>💡 Taschenlampe</h3>
        <div style="font-size:11px;color:#7fa5b8;margin-bottom:10px">Wenn aktiviert, blinkt die Taschenlampe bei jeder Warnung (Blitzer, Unfall, etc.).</div>
        <button id="toggleFlash" style="width:100%;padding:14px;background:${s.flashOnWarning?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)'};border:1px solid ${s.flashOnWarning?'#ffd700':'#555'};color:${s.flashOnWarning?'#ffd700':'#fff'};border-radius:10px;font-weight:900;font-size:14px;cursor:pointer">${s.flashOnWarning?'💡 BLINKEN AN':'💡 BLINKEN AUS'}</button>
        <button id="testFlash" style="width:100%;padding:12px;margin-top:10px;background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;border-radius:8px;font-weight:900;font-size:12px;cursor:pointer">🔦 Taschenlampe testen (3x blinken)</button>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#toggleFlash").addEventListener("click", function(){
        s.flashOnWarning=!s.flashOnWarning; saveSettings(s); screenSettingsFlash();
      });
      container.querySelector("#testFlash").addEventListener("click", function(){ blinkTorch(3); });
    }

    function screenSettingsAbout(){
      var html = backBtn('settings');
      html += `<div class="card" style="text-align:center">
        <img src="${LOGO_URL}" style="width:80px;height:80px;border-radius:16px;margin:10px auto;display:block" onerror="this.style.display='none'">
        <h3>🦚 HalDo Blitzer</h3>
        <div style="font-size:12px;color:#7fa5b8;margin-top:6px">Version 14.0 (Ultimate Pro)</div>
        <div style="font-size:11px;color:#7fa5b8;margin-top:12px;line-height:1.6">
          📷 Blitzer-Warnungen<br>
          🗣️ Sprach-Navigation<br>
          📡 Bluetooth<br>
          ⛽ Tankstellen-Preise<br>
          🍴 Restaurants<br>
          💡 Taschenlampe<br>
          🌍 9 Sprachen<br>
          🎵 12 Alarm-Töne
        </div>
        <div style="font-size:10px;color:#5a7a8a;margin-top:14px">Made with ❤️ für die Ezidi-Community</div>
      </div>`;
      container.innerHTML = html; bindNav();
    }

    // ═══════════════ WEATHER ═══════════════
    function fetchWeather(){
      if(!lastPos || getSettings().offlineMode) return;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lastPos.coords.latitude}&longitude=${lastPos.coords.longitude}&current_weather=true&hourly=surface_pressure`)
        .then(r=>r.json()).then(function(data){
          if(data.current_weather){
            var temp = Math.round(data.current_weather.temperature);
            var code = data.current_weather.weathercode;
            var pressure = data.hourly && data.hourly.surface_pressure ? Math.round(data.hourly.surface_pressure[0]) : "—";
            var icon = "☀️", desc = "Klar";
            if(code>0 && code<4){ icon="🌤️"; desc="Wolkig"; }
            if(code>=4 && code<70){ icon="☁️"; desc="Bedeckt"; }
            if(code>=70 && code<80){ icon="🌧️"; desc="Regen"; }
            if(code>=80){ icon="⛈️"; desc="Gewitter"; }
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lastPos.coords.latitude}&lon=${lastPos.coords.longitude}`)
              .then(r=>r.json()).then(function(geo){
                var city = geo.address ? (geo.address.city||geo.address.town||geo.address.village||geo.address.county) : "Unbekannt";
                weatherData = { temp, icon, desc, pressure, city };
                if(view.screen==="cockpit") build();
              }).catch(function(){
                weatherData = { temp, icon, desc, pressure, city:"Ort" };
                if(view.screen==="cockpit") build();
              });
          }
        }).catch(function(){});
    }

    // ═══════════════ PUSH ═══════════════
    function sendPushNotification(cat, dist){
      var s = getSettings();
      if(!s.notifyOn) return;
      if(!("Notification" in window) || Notification.permission!=="granted") return;
      try {
        var title = "HalDo Blitzer: " + cat.name.de;
        var body = "Achtung! In " + fmtDist(dist) + ".";
        new Notification(title, { body: body, icon: LOGO_URL, badge: LOGO_URL });
      } catch(e){}
    }

    // ═══════════════ TRIGGERS ═══════════════
    function checkTriggers(pos){
      var s = getSettings(), lat=pos.coords.latitude, lng=pos.coords.longitude;
      var zones = [2000, 1000, 500, 200];
      getWarnings().forEach(function(w){
        if(!s.enabled[w.cat]) return;
        var d = haversine(lat,lng,w.lat,w.lng), cat = getCat(w.cat); if(!cat) return;
        for(var i=0;i<zones.length;i++){
          var key = w.id+"_z"+i;
          if(d<=zones[i] && !triggered[key]){
            triggered[key]=true;
            speakAlert(cat, d, s);
            sendPushNotification(cat, d);
            if(s.flashOnWarning) blinkTorch(3);
            trip.warnings++;
            var wn = container.querySelector("#tripWarn"); if(wn) wn.textContent = trip.warnings;
            break;
          }
        }
      });
    }

    function speakAlert(cat, dist, settings){
      if(settings.globalMute) return;
      if(settings.beepOn) playBeep(settings.sounds[cat.id]||"chime", 0.9, settings.alarmDuration);
      if(settings.voiceOn && window.speechSynthesis){
        var txt = (cat.voice[settings.lang]||cat.voice.de).replace("{d}", fmtDist(dist));
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(txt); u.lang = LANGS[settings.lang].code;
        window.speechSynthesis.speak(u);
      }
      if(navigator.vibrate) navigator.vibrate([200,100,200]);
    }

    // ═══════════════ NAV VOICE ═══════════════
    function speakNav(text){
      var s = getSettings();
      if(!s.navVoiceOn || s.globalMute) return;
      if(!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = LANGS[s.lang].code;
      window.speechSynthesis.speak(u);
    }

    function getTurnWord(modifier, lang){
      var mod = modifier||"";
      var words = {
        de:{left:"links abbiegen",right:"rechts abbiegen",straight:"geradeaus",u:"wenden",slight_left:"leicht links",slight_right:"leicht rechts",sharp_left:"scharf links",sharp_right:"scharf rechts",arrive:"ankommen"},
        en:{left:"turn left",right:"turn right",straight:"straight",u:"make u-turn",slight_left:"slight left",slight_right:"slight right",sharp_left:"sharp left",sharp_right:"sharp right",arrive:"arrive"},
        tr:{left:"sola dön",right:"sağa dön",straight:"düz git",u:"u dönüşü",slight_left:"hafif sol",slight_right:"hafif sağ",sharp_left:"keskin sol",sharp_right:"keskin sağ",arrive:"varış"},
        ar:{left:"انعطف يسارا",right:"انعطف يمينا",straight:"استمر",u:"استدر",slight_left:"يسار قليلا",slight_right:"يمين قليلا",sharp_left:"يسار حاد",sharp_right:"يمين حاد",arrive:"وصلت"},
        ku:{left:"ber bi çepê ve bizivire",right:"ber bi rastê ve bizivire",straight:"rasterast",u:"zivirîn",slight_left:"hinek çep",slight_right:"hinek rast",sharp_left:"tûj çep",sharp_right:"tûj rast",arrive:"gihişt"},
        fr:{left:"tourner à gauche",right:"tourner à droite",straight:"tout droit",u:"demi-tour",slight_left:"légèrement à gauche",slight_right:"légèrement à droite",sharp_left:"fortement à gauche",sharp_right:"fortement à droite",arrive:"arriver"},
        es:{left:"gira a la izquierda",right:"gira a la derecha",straight:"recto",u:"da la vuelta",slight_left:"ligeramente a la izquierda",slight_right:"ligeramente a la derecha",sharp_left:"giro brusco a la izquierda",sharp_right:"giro brusco a la derecha",arrive:"llegar"},
        it:{left:"gira a sinistra",right:"gira a destra",straight:"dritto",u:"inverti la marcia",slight_left:"leggermente a sinistra",slight_right:"leggermente a destra",sharp_left:"bruscamente a sinistra",sharp_right:"bruscamente a destra",arrive:"arrivare"},
        ru:{left:"поверните налево",right:"поверните направо",straight:"прямо",u:"развернитесь",slight_left:"плавно налево",slight_right:"плавно направо",sharp_left:"резко налево",sharp_right:"резко направо",arrive:"прибытие"}
      };
      var dict = words[lang]||words.de;
      if(mod.indexOf("left")>=0 && mod.indexOf("slight")>=0) return dict.slight_left;
      if(mod.indexOf("right")>=0 && mod.indexOf("slight")>=0) return dict.slight_right;
      if(mod.indexOf("left")>=0 && mod.indexOf("sharp")>=0) return dict.sharp_left;
      if(mod.indexOf("right")>=0 && mod.indexOf("sharp")>=0) return dict.sharp_right;
      if(mod.indexOf("left")>=0) return dict.left;
      if(mod.indexOf("right")>=0) return dict.right;
      if(mod.indexOf("uturn")>=0 || mod.indexOf("u-turn")>=0) return dict.u;
      return dict.straight;
    }

    function checkNavVoice(){
      if(!routeData || !lastPos) return;
      var step = routeData.steps[routeData.currentStep];
      if(!step) return;
      var stepKey = routeData.currentStep+"_"+routeData.targetName;
      if(stepKey===lastSpokenStep) return;

      if(step.distance < 300 && step.distance > 50){
        if(lastSpokenDist !== stepKey+"_300"){
          lastSpokenDist = stepKey+"_300";
          var s = getSettings();
          var pre = {de:"In "+fmtDist(step.distance)+": ",en:"In "+fmtDist(step.distance)+": ",tr:fmtDist(step.distance)+" sonra: ",ar:"بعد "+fmtDist(step.distance)+": ",ku:"Piştî "+fmtDist(step.distance)+": ",fr:"Dans "+fmtDist(step.distance)+": ",es:"En "+fmtDist(step.distance)+": ",it:"Tra "+fmtDist(step.distance)+": ",ru:"Через "+fmtDist(step.distance)+": "}[s.lang]||"";
          speakNav(pre + getTurnWord(step.maneuver.modifier, s.lang));
        }
      }
      if(step.distance < 50){
        lastSpokenStep = stepKey;
        var s2 = getSettings();
        speakNav(getTurnWord(step.maneuver.modifier, s2.lang));
        routeData.currentStep++;
      }
    }

    // ═══════════════ SPEED LIMIT ═══════════════
    function fetchSpeedLimitIfNeeded(){
      if(!lastPos || simTimer || getSettings().offlineMode) return;
      var now = Date.now();
      if(now-lastLimitFetch<15000) return;
      lastLimitFetch = now;
      var lat=lastPos.coords.latitude, lng=lastPos.coords.longitude;
      fetch("https://overpass-api.de/api/interpreter?data="+encodeURIComponent(`[out:json];way(around:30,${lat},${lng})["highway"]["maxspeed"];out tags;`))
        .then(r=>r.json()).then(function(data){
          if(data.elements && data.elements.length>0){
            var ms = data.elements[0].tags.maxspeed;
            if(ms==="none"||ms==="signals"||ms==="DE:urban") currentLimit = ms==="DE:urban"?50:0;
            else { var num = parseInt(ms); currentLimit = isNaN(num)?null:num; }
          } else currentLimit = null;
          if(view.screen==="cockpit"){
            var el = container.querySelector(".cpt-limit");
            if(el){
              el.style.display = currentLimit===null?"none":"flex";
              el.innerHTML = `<div class="cpt-limit-num">${currentLimit===0?"∞":currentLimit}</div>`;
            }
          }
        }).catch(function(){});
    }

    // ═══════════════ POIs (Fuel + Restaurants) ═══════════════
    function fetchPOIsIfNeeded(){
      if(!lastPos || simTimer || getSettings().offlineMode) return;
      var lat=lastPos.coords.latitude, lng=lastPos.coords.longitude;
      var s = getSettings();
      var enabled = CATS.filter(function(c){ return c.type==="poi" && s.enabled[c.id]; });
      if(!enabled.length) return;
      var filter = enabled.map(function(c){ return `node(around:3000,${lat},${lng})[${c.osm}];`; }).join("");
      fetch("https://overpass-api.de/api/interpreter?data="+encodeURIComponent(`[out:json];(${filter});out center 30;`))
        .then(r=>r.json()).then(function(data){
          if(!data.elements) return;
          data.elements.forEach(function(el){
            if(!poiCache[el.id]){
              poiCache[el.id] = { id:el.id, lat:el.lat, lng:el.lon, cat:guessCatFromTags(el.tags), tags:el.tags };
            }
          });
        }).catch(function(){});
    }
    function guessCatFromTags(tags){
      if(!tags) return null;
      if(tags.amenity==="fuel") return "poi_fuel";
      if(tags.amenity==="restaurant") return "poi_rest";
      return null;
    }

    // ═══════════════ FUEL SCREEN ═══════════════
    function screenFuel(){
      var s = getSettings();
      var html = backBtn('cockpit');
      html += `<div class="card"><h3>⛽ Tankstellen</h3>`;
      if(!s.tankerApiKey){
        html += `<div style="padding:10px;background:rgba(255,215,0,.1);border:1px solid #ffd700;border-radius:8px;margin-bottom:10px;font-size:11px;color:#ffd700">
          💡 Für echte Preise: Tankerkönig API-Key in Einstellungen eintragen.<br>
          Kostenlos auf <b>creativecommons.tankerkoenig.de</b>
        </div>
        <div class="field"><label>Tankerkönig API-Key</label>
          <input id="tankerKey" placeholder="API-Key einfügen..." value="${_esc(s.tankerApiKey)}" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:1px solid #444;border-radius:8px;color:#fff;font-size:12px">
          <button id="saveTanker" style="width:100%;padding:10px;margin-top:6px;background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;border-radius:8px;font-weight:900;cursor:pointer">💾 Speichern</button>
        </div>`;
      } else if(!lastPos){
        html += `<div style="text-align:center;color:#7fa5b8;padding:20px">GPS wird gesucht...</div>`;
      } else {
        html += `<div style="font-size:11px;color:#7fa5b8;margin-bottom:8px">Standort: ${lastPos.coords.latitude.toFixed(4)}, ${lastPos.coords.longitude.toFixed(4)}</div>
          <button id="refreshFuel" style="width:100%;padding:10px;background:rgba(74,222,128,.2);border:1px solid #4ade80;color:#4ade80;border-radius:8px;font-weight:900;cursor:pointer;margin-bottom:10px">🔄 Preise aktualisieren</button>
          <div id="fuelList">`;
        if(fuelStations.length===0){
          html += `<div style="text-align:center;color:#7fa5b8;padding:15px">Lade Tankstellen...</div>`;
        } else {
          fuelStations.forEach(function(st){
            var d = lastPos ? haversine(lastPos.coords.latitude, lastPos.coords.longitude, st.lat, st.lng) : 0;
            html += `<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:6px;border-left:3px solid #66cc66">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <div><div style="font-size:13px;font-weight:900">${_esc(st.name)}</div>
                <div style="font-size:10px;color:#7fa5b8">${_esc(st.street||'')} · ${fmtDist(d)}</div></div>
                <div style="text-align:right;font-size:11px">
                  ${st.e5?`<div>E5: <b style="color:#4dd0e1">${st.e5.toFixed(2)}€</b></div>`:''}
                  ${st.e10?`<div>E10: <b style="color:#4dd0e1">${st.e10.toFixed(2)}€</b></div>`:''}
                  ${st.diesel?`<div>Diesel: <b style="color:#ffd700">${st.diesel.toFixed(2)}€</b></div>`:''}
                </div>
              </div>
            </div>`;
          });
        }
        html += `</div>`;
        setTimeout(fetchFuelPrices, 100);
      }
      html += `</div>`;
      container.innerHTML = html; bindNav();
      var k = container.querySelector("#saveTanker");
      if(k) k.addEventListener("click", function(){ s.tankerApiKey = container.querySelector("#tankerKey").value.trim(); saveSettings(s); screenFuel(); });
      var r = container.querySelector("#refreshFuel");
      if(r) r.addEventListener("click", fetchFuelPrices);
    }

    function fetchFuelPrices(){
      var s = getSettings();
      if(!s.tankerApiKey || !lastPos) return;
      fetch(`https://creativecommons.tankerkoenig.de/json/list.php?lat=${lastPos.coords.latitude}&lng=${lastPos.coords.longitude}&rad=3&sort=dist&type=all&apikey=${s.tankerApiKey}`)
        .then(r=>r.json()).then(function(d){
          if(d.ok) fuelStations = d.stations;
          if(view.screen==="fuel") screenFuel();
        }).catch(function(e){ console.warn("[Fuel]", e.message); });
    }

    // ═══════════════ RESTAURANTS ═══════════════
    function screenRestaurants(){
      var html = backBtn('cockpit');
      html += `<div class="card"><h3>🍴 Restaurants</h3>
        <div style="font-size:11px;color:#7fa5b8;margin-bottom:8px">Restaurants in deiner Nähe (über OSM)</div>
        <div id="restList">`;
      var rest = Object.values(poiCache).filter(function(p){ return p.cat==="poi_rest"; });
      if(!rest.length){
        html += `<div style="text-align:center;color:#7fa5b8;padding:15px">Keine Restaurants in der Nähe gefunden. Warte auf GPS...</div>`;
      } else {
        rest.forEach(function(r){
          var d = lastPos ? haversine(lastPos.coords.latitude, lastPos.coords.longitude, r.lat, r.lng) : 0;
          var name = r.tags && r.tags.name ? r.tags.name : "Restaurant";
          var cuisine = r.tags && r.tags.cuisine ? r.tags.cuisine.replace(/_/g," ") : "";
          html += `<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:6px;border-left:3px solid #ff8844">
            <div style="font-size:13px;font-weight:900">🍴 ${_esc(name)}</div>
            <div style="font-size:10px;color:#7fa5b8">${cuisine?`${_esc(cuisine)} · `:''}${fmtDist(d)}</div>
          </div>`;
        });
      }
      html += `</div></div>`;
      container.innerHTML = html; bindNav();
    }

    // ═══════════════ MAP ═══════════════
    function screenMap(){
      var html = backBtn('cockpit') + `<div class="card" style="padding:0;overflow:hidden;height:calc(100vh - 200px);position:relative"><div id="blMap" style="width:100%;height:100%;background:#0a1220"></div></div>`;
      container.innerHTML = html; bindNav(); initMap();
    }
    function initMap(){
      if(!document.getElementById("leaflet-css")){
        var lc = document.createElement("link"); lc.id="leaflet-css"; lc.rel="stylesheet"; lc.href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"; document.head.appendChild(lc);
      }
      if(window.L) return buildMap();
      var s = document.createElement("script"); s.src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"; s.onload=buildMap; document.head.appendChild(s);
    }
    function buildMap(){
      var el = document.getElementById("blMap"); if(!el || !window.L) return; el.innerHTML="";
      var center = lastPos ? [lastPos.coords.latitude, lastPos.coords.longitude] : [51.1657,10.4515];
      map = L.map(el,{zoomControl:false}).setView(center,14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);
      updateMapMarkers();
    }
    function updateMapMarkers(){
      if(!map) return; mapMarkers.forEach(function(m){ map.removeLayer(m); }); mapMarkers=[];
      getWarnings().forEach(function(w){
        var cat = getCat(w.cat); if(!cat) return;
        var icon = L.divIcon({ html:`<div style="background:${cat.color};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff">${cat.icon}</div>`, className:"", iconSize:[32,32], iconAnchor:[16,16] });
        mapMarkers.push(L.marker([w.lat,w.lng],{icon:icon}).addTo(map));
      });
      if(lastPos){
        var uicon = L.divIcon({ html:`<div style="background:#4dd0e1;border:3px solid #fff;border-radius:50%;width:20px;height:20px;box-shadow:0 0 20px #4dd0e1"></div>`, className:"", iconSize:[20,20], iconAnchor:[10,10] });
        mapMarkers.push(L.marker([lastPos.coords.latitude,lastPos.coords.longitude],{icon:uicon}).addTo(map));
        map.setView([lastPos.coords.latitude,lastPos.coords.longitude]);
      }
    }

    // ═══════════════ LIST ═══════════════
    function screenList(){
      var warnings = getWarnings();
      var html = backBtn('cockpit') + `<div class="card"><h3>📋 Warnungen (${warnings.length})</h3>`;
      if(!warnings.length) html += `<div style="text-align:center;color:#7fa5b8;padding:20px;font-size:12px">Keine Warnungen.</div>`;
      else warnings.slice().reverse().forEach(function(w){
        var c = getCat(w.cat)||CATS[0];
        html += `<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid ${c.color}">
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:900">${c.icon} ${_esc(c.name.de)}</div><div style="font-size:10px;color:#7fa5b8">${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}</div></div>
          <button data-del="${w.id}" style="background:rgba(255,128,128,.2);border:none;color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer">✕</button>
        </div>`;
      });
      html += `</div>`; container.innerHTML = html; bindNav();
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){ if(!confirm("Löschen?")) return; saveWarnings(getWarnings().filter(function(w){ return w.id!==el.dataset.del; })); screenList(); });
      });
    }

    // ═══════════════ REPORT ═══════════════
    function screenReport(){
      var html = backBtn('cockpit') + `<div class="card"><h3>➕ Warnung melden</h3><div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">`;
      CATS.forEach(function(c){
        html += `<button data-report="${c.id}" style="padding:14px;background:rgba(0,0,0,.2);border:1px solid ${c.color}44;border-radius:10px;color:inherit;font-family:inherit;text-align:center;cursor:pointer">
          <div style="font-size:26px">${c.icon}</div>
          <div style="font-size:10px;color:${c.color};margin-top:4px;font-weight:800">${_esc(c.name.de)}</div>
        </button>`;
      });
      html += `</div></div>`; container.innerHTML = html; bindNav();
      container.querySelectorAll("[data-report]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!lastPos){ alert("GPS fehlt"); return; }
          var warnings = getWarnings();
          warnings.push({ id:"w"+Date.now(), cat:el.dataset.report, lat:lastPos.coords.latitude, lng:lastPos.coords.longitude, created:Date.now() });
          saveWarnings(warnings);
          if(HalDo.Notify) HalDo.Notify.success("Warnung gemeldet!");
          view.screen="cockpit"; build();
        });
      });
    }

    // ═══════════════ NAV SCREEN ═══════════════
    function screenNav(){
      var hist = store.get("navHistory",[]);
      var favs = store.get("navFavorites",[]);
      var html = backBtn('cockpit') + `<div class="card"><h3>🧭 Navigation</h3>
        <div class="field"><label>Straße + Hausnummer</label>
          <input id="navStreet" placeholder="z.B. Hauptstraße 12" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px;margin-bottom:6px">
        </div>
        <div class="field"><label>Postleitzahl + Stadt</label>
          <input id="navCity" placeholder="z.B. 30159 Hannover" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px">
        </div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn full" id="navGo" style="flex:1;padding:12px;background:linear-gradient(135deg,#4dd0e1,#b478ff);color:#000;font-weight:900;border:none;border-radius:10px;cursor:pointer">🔍 Route berechnen</button>
          <button id="navFav" style="padding:12px 16px;background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;border-radius:10px;font-size:18px;cursor:pointer">⭐</button>
        </div>
        ${routeData?`<div style="margin-top:14px;padding:12px;background:rgba(77,208,225,.1);border:1px solid rgba(77,208,225,.3);border-radius:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><div style="font-size:11px;color:#7fa5b8;font-weight:800">ROUTE AKTIV</div><div style="font-size:14px;font-weight:900;color:#4dd0e1;margin-top:4px">${fmtDist(routeData.totalDist)} · ${fmtTime(Math.round(routeData.totalTime))}</div></div>
            <button id="navClear" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;font-weight:800">Beenden</button>
          </div>
        </div>`:""}
      </div>`;
      if(favs.length){
        html += `<div class="card"><h3>⭐ Favoriten</h3>`;
        favs.forEach(function(f,i){
          html += `<div style="display:flex;justify-content:space-between;padding:8px;background:rgba(0,0,0,.2);border-radius:6px;margin-bottom:4px">
            <div style="font-size:12px;font-weight:800;cursor:pointer" data-fav="${i}">${_esc(f.addr)}</div>
            <button data-delfav="${i}" style="background:transparent;border:none;color:#ff8080;cursor:pointer">✕</button>
          </div>`;
        });
        html += `</div>`;
      }
      if(hist.length){
        html += `<div class="card"><h3>🕒 Verlauf</h3>`;
        hist.slice(0,5).forEach(function(h){
          html += `<div style="display:flex;justify-content:space-between;padding:8px;background:rgba(0,0,0,.2);border-radius:6px;margin-bottom:4px">
            <div style="font-size:12px;font-weight:800;cursor:pointer" data-hist="${_esc(h.addr)}">${_esc(h.addr)}</div>
            <div style="font-size:10px;color:#7fa5b8">${h.date}</div>
          </div>`;
        });
        html += `</div>`;
      }
      container.innerHTML = html; bindNav();
      container.querySelector("#navGo").addEventListener("click", function(){
        var street = container.querySelector("#navStreet").value.trim();
        var city = container.querySelector("#navCity").value.trim();
        var target = (street + " " + city).trim();
        if(!target) return;
        hist.unshift({ addr:target, date:new Date().toLocaleString("de-DE") });
        store.set("navHistory", hist.slice(0,20));
        if(!lastPos){ alert("GPS fehlt"); return; }
        geocodeAndRoute(target);
      });
      container.querySelector("#navFav").addEventListener("click", function(){
        var street = container.querySelector("#navStreet").value.trim();
        var city = container.querySelector("#navCity").value.trim();
        var target = (street + " " + city).trim();
        if(!target) return;
        if(!favs.some(function(f){return f.addr===target;})){ favs.push({addr:target}); store.set("navFavorites",favs); screenNav(); }
      });
      container.querySelectorAll("[data-delfav]").forEach(function(el){
        el.addEventListener("click", function(){ favs.splice(parseInt(el.dataset.delfav),1); store.set("navFavorites",favs); screenNav(); });
      });
      container.querySelectorAll("[data-fav]").forEach(function(el){
        el.addEventListener("click", function(){ container.querySelector("#navStreet").value=favs[parseInt(el.dataset.fav)].addr; });
      });
      container.querySelectorAll("[data-hist]").forEach(function(el){
        el.addEventListener("click", function(){ container.querySelector("#navStreet").value=el.dataset.hist; });
      });
      var nc = container.querySelector("#navClear");
      if(nc) nc.addEventListener("click", function(){ routeData=null; screenNav(); });
    }

    function geocodeAndRoute(query){
      fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(query)+"&limit=1")
        .then(r=>r.json()).then(function(data){
          if(!data || !data.length){ alert("Ziel nicht gefunden"); return; }
          targetPos = { lat:parseFloat(data[0].lat), lng:parseFloat(data[0].lon) };
          var addr = data[0].display_name.split(",")[0];
          speakNav(`Navigation gestartet. Ziel: ${addr}.`);
          fetch(`https://router.project-osrm.org/route/v1/driving/${lastPos.coords.longitude},${lastPos.coords.latitude};${targetPos.lng},${targetPos.lat}?steps=true&geometries=geojson&overview=false`)
            .then(r=>r.json()).then(function(rdata){
              if(!rdata.routes || !rdata.routes.length){ alert("Route nicht gefunden"); return; }
              routeData = { totalDist:rdata.routes[0].distance, totalTime:rdata.routes[0].duration, steps:rdata.routes[0].legs[0].steps, currentStep:0, targetName:addr };
              lastSpokenStep = null; lastSpokenDist = null;
              if(HalDo.Notify) HalDo.Notify.success("Route berechnet: "+fmtDist(routeData.totalDist));
              view.screen = "cockpit"; build();
            }).catch(function(e){ alert("Routing-Fehler: "+e.message); });
        }).catch(function(e){ alert("Geocoding-Fehler: "+e.message); });
    }

    // ═══════════════ PARK ═══════════════
    function screenPark(){
      var now = Date.now();
      var remaining = parkEndTime>now ? Math.floor((parkEndTime-now)/1000) : 0;
      var html = backBtn('cockpit') + `<div class="card" style="text-align:center"><h3>🅿️ Parkuhr</h3>
        <div style="font-size:56px;font-weight:900;color:${remaining>0?'#4dd0e1':'#ff5555'};margin:20px 0" id="parkTime">${fmtTime(remaining)}</div>
        ${remaining===0 && parkEndTime>0?'<div style="color:#ff5555;font-weight:900">⏰ Zeit abgelaufen!</div>':''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:20px">
          <button onclick="window._parkAdd(15)" style="background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;padding:12px;border-radius:8px;font-weight:900;cursor:pointer">+ 15 Min</button>
          <button onclick="window._parkAdd(30)" style="background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;padding:12px;border-radius:8px;font-weight:900;cursor:pointer">+ 30 Min</button>
          <button onclick="window._parkAdd(60)" style="background:rgba(77,208,225,.2);border:1px solid #4dd0e1;color:#4dd0e1;padding:12px;border-radius:8px;font-weight:900;cursor:pointer">+ 1 Std</button>
          <button onclick="window._parkStop()" style="background:rgba(255,85,85,.2);border:1px solid #ff5555;color:#ff5555;padding:12px;border-radius:8px;font-weight:900;cursor:pointer">⏹ Stopp</button>
        </div>
      </div>`;
      container.innerHTML = html; bindNav();
      window._parkAdd = function(mins){
        parkEndTime = (parkEndTime>Date.now()?parkEndTime:Date.now()) + mins*60000;
        if(parkTimer) clearInterval(parkTimer);
        parkTimer = setInterval(updateParkUI, 1000);
        updateParkUI();
      };
      window._parkStop = function(){ parkEndTime=0; if(parkTimer) clearInterval(parkTimer); updateParkUI(); };
      function updateParkUI(){
        var el = document.getElementById("parkTime"); if(!el) return;
        var rem = parkEndTime>Date.now() ? Math.floor((parkEndTime-Date.now())/1000) : 0;
        el.textContent = fmtTime(rem);
        el.style.color = rem>0?'#4dd0e1':'#ff5555';
        if(rem===0 && parkEndTime>0){
          if(HalDo.Notify) HalDo.Notify.error("Parkzeit abgelaufen!");
          playBeep("urgent", 1.0, 5);
          parkEndTime = 0;
        }
      }
      if(parkTimer) clearInterval(parkTimer);
      if(parkEndTime>Date.now()) parkTimer = setInterval(updateParkUI, 1000);
    }

    // ═══════════════ VISION ═══════════════
    function screenVision(){
      var html = backBtn('cockpit') + `<div class="card"><h3>🤖 KI-Kamera (TensorFlow)</h3>
        <div style="font-size:11px;color:#7fa5b8;margin-bottom:10px">Erkennt Autos, LKW, Personen in Echtzeit.</div>
        <div style="position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center">
          <video id="visionVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;display:none"></video>
          <canvas id="visionCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;display:none"></canvas>
          <div id="visionPlaceholder" style="color:#aaa;text-align:center;padding:20px"><div style="font-size:44px">📷</div><div style="font-size:11px;margin-top:8px">Kamera starten</div></div>
        </div>
        <button id="visionStart" style="width:100%;padding:14px;margin-top:10px;background:linear-gradient(135deg,#b478ff,#4dd0e1);color:#fff;border:none;border-radius:10px;font-weight:900;cursor:pointer">📷 KI aktivieren</button>
        <div id="visionStatus" style="text-align:center;font-size:11px;font-weight:900;color:#4ade80;margin-top:8px">Bereit</div>
      </div>`;
      container.innerHTML = html; bindNav();
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
        cameraStream = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:"environment" }, audio:false });
        var video = document.getElementById("visionVideo");
        video.srcObject = cameraStream; video.style.display = "block";
        document.getElementById("visionPlaceholder").style.display = "none";
        document.getElementById("visionCanvas").style.display = "block";
        document.getElementById("visionStart").textContent = "⏹ KI stoppen";
        status.textContent = "🟢 Live - Analysiere...";
        runVisionLoop();
      } catch(e){ status.textContent = "❌ Fehler: "+e.message; }
    }
    function loadScript(src){
      return new Promise(function(res,rej){ var s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); });
    }
    async function runVisionLoop(){
      if(!tfModel || !cameraStream) return;
      var video = document.getElementById("visionVideo"), canvas = document.getElementById("visionCanvas");
      if(!video || !canvas) return;
      var ctx2d = canvas.getContext("2d");
      canvas.width = video.videoWidth || 640; canvas.height = video.videoHeight || 480;
      async function detect(){
        if(!tfModel || !cameraStream) return;
        var predictions = await tfModel.detect(video);
        ctx2d.clearRect(0,0,canvas.width,canvas.height);
        predictions.forEach(function(p){
          if(p.class==="car"||p.class==="truck"||p.class==="person"||p.class==="bicycle"){
            var b = p.bbox;
            ctx2d.strokeStyle = p.class==="person"?"#ff5555":"#4dd0e1";
            ctx2d.lineWidth = 3; ctx2d.strokeRect(b[0],b[1],b[2],b[3]);
            ctx2d.fillStyle = p.class==="person"?"#ff5555":"#4dd0e1";
            ctx2d.font = "16px sans-serif";
            ctx2d.fillText(p.class.toUpperCase()+" "+Math.round(p.score*100)+"%", b[0], b[1]>20?b[1]-5:b[1]+20);
          }
        });
        if(cameraStream) visionLoop = requestAnimationFrame(detect);
      }
      detect();
    }
    function stopVision(){
      if(visionLoop) cancelAnimationFrame(visionLoop);
      visionLoop = null;
      if(cameraStream){ cameraStream.getTracks().forEach(function(t){t.stop();}); cameraStream = null; }
      tfModel = null; screenVision();
    }

    // ═══════════════ NEXT EVENT / MANEUVER ═══════════════
    function getNextEvent(){
      if(routeData && routeData.steps){
        for(var i=routeData.currentStep;i<routeData.steps.length;i++){
          var st = routeData.steps[i];
          if(st.maneuver && st.maneuver.type!=="depart"){
            return { type:"nav", modifier:st.maneuver.modifier, instruction:st.name||st.maneuver.type, distance:st.distance };
          }
        }
      }
      return null;
    }

    // ═══════════════ SIMULATION ═══════════════
    function startSimulation(){
      if(simTimer) clearInterval(simTimer);
      lastPos = { coords:{ latitude:51.1657, longitude:10.4515, speed:0 } };
      trip = { active:true, startTime:Date.now(), distance:0, warnings:0 };
      simSpeed = 30;
      simTimer = setInterval(function(){
        simSpeed = Math.min(180, simSpeed + Math.random()*15);
        if(simSpeed>150 && Math.random()>0.8) simSpeed -= 40;
        trip.distance += (simSpeed/3600);
        if(Math.random()>0.95){
          var randomCat = CATS[Math.floor(Math.random()*CATS.length)];
          speakAlert(randomCat, 500, getSettings());
          sendPushNotification(randomCat, 500);
          if(getSettings().flashOnWarning) blinkTorch(3);
          trip.warnings++;
        }
        if(view.screen==="cockpit"){
          var t = container.querySelector(".cpt-speed"); if(t) t.textContent = Math.round(simSpeed);
          var d = container.querySelector("#tripDist"); if(d) d.textContent = trip.distance.toFixed(1)+" km";
          var w = container.querySelector("#tripWarn"); if(w) w.textContent = trip.warnings;
          build();
        }
      }, 1000);
      build();
    }

    // ═══════════════ GEO ═══════════════
    function startGeo(){
      if(!navigator.geolocation) return;
      if(geoWatch) navigator.geolocation.clearWatch(geoWatch);
      geoWatch = navigator.geolocation.watchPosition(onPos, onErr, { enableHighAccuracy:true, maximumAge:3000, timeout:15000 });
    }
    function onPos(pos){
      if(simTimer) return;
      if(lastPos && trip.active){
        var d = haversine(lastPos.coords.latitude, lastPos.coords.longitude, pos.coords.latitude, pos.coords.longitude);
        if(d>3 && d<500) trip.distance += d/1000;
      }
      lastPos = pos;
      checkTriggers(pos);
      checkNavVoice();
      if(view.screen==="cockpit"){
        var t = container.querySelector(".cpt-speed"); if(t) t.textContent = Math.round((pos.coords.speed||0)*3.6);
        fetchPOIsIfNeeded(); fetchSpeedLimitIfNeeded();
      }
      if(view.screen==="map" && map) updateMapMarkers();
    }
    function onErr(err){ console.warn("[Blitzer] GPS:", err.message); }

    function bindNav(){
      container.querySelectorAll("[data-nav]").forEach(function(el){
        el.addEventListener("click", function(){ view.screen=el.dataset.nav; build(); });
      });
    }
    function bindCockpit(){
      var tb = container.querySelector("[data-trip]");
      if(tb) tb.addEventListener("click", function(){
        if(tb.dataset.trip==="start"){ trip={active:true,startTime:Date.now(),distance:0,warnings:0}; if(HalDo.Notify) HalDo.Notify.success("Fahrt gestartet!"); }
        else { trip.active=false; if(simTimer){ clearInterval(simTimer); simTimer=null; } if(HalDo.Notify) HalDo.Notify.info("Fahrt beendet: "+trip.distance.toFixed(1)+" km"); }
        build();
      });
      var simBtn = container.querySelector("#simBtn");
      if(simBtn) simBtn.addEventListener("click", startSimulation);
    }

    if("Notification" in window && Notification.permission==="default") Notification.requestPermission();
    startGeo(); build();
  }

  HalDoApp("blitzer", { name:"HalDo Blitzer", icon:"⚠️", render:render, category:"werkzeuge" });
  console.log("🦚 blitzer.js v14.0 geladen — Bluetooth · Sprach-Navi · Tankstellen-Preise · Restaurants · Taschenlampe");
})();
