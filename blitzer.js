/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HALDO BLITZER v16.0 (PEACOCK DELUXE)
   Realistischer Pfau · Kamera · Boot-Log · Custom-Welcome
   Service-Worker · 20 Töne · Leuchtende Logs
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  var LOGO_URL = "logo.png";

  // ── Styled Console Logs ────────────────────────────────
  var GOLD_STYLE = 'color:#ffd700;font-weight:900;font-size:13px;text-shadow:0 0 8px #ffd700,0 0 16px rgba(255,215,0,.6);background:#0a0e2a;padding:2px 6px;border-radius:4px;';
  console.log('%c🦚 HalDo Blitzer v16.0 geladen — Peacock Deluxe Edition', GOLD_STYLE);

  var WELCOME = {
    de:{title:"Willkommen in",author:"von Halil Donma",footer:"HalDo Blitzer a Halil Donma",enter:"Los geht's",ai:"HalDo AI präsentiert"},
    en:{title:"Welcome to",author:"by Halil Donma",footer:"HalDo Blitzer by Halil Donma",enter:"Let's Go",ai:"Presented by HalDo AI"},
    tr:{title:"Hoşgeldiniz",author:"Halil Donma tarafından",footer:"HalDo Blitzer - Halil Donma",enter:"Başla",ai:"HalDo AI tarafından"},
    ar:{title:"مرحبًا بك في",author:"من هليل دونما",footer:"هالدو بليتزر من هليل دونما",enter:"هيا بنا",ai:"مقدمة من هالدو AI"},
    ku:{title:"Bi xêr hatî",author:"ji hêla Halîl Donma",footer:"HalDo Blitzer ji Halîl Donma",enter:"Dest pê bike",ai:"HalDo AI pêşkêş dike"},
    fr:{title:"Bienvenue dans",author:"par Halil Donma",footer:"HalDo Blitzer par Halil Donma",enter:"C'est parti",ai:"Présenté par HalDo AI"},
    es:{title:"Bienvenido a",author:"por Halil Donma",footer:"HalDo Blitzer por Halil Donma",enter:"Vamos",ai:"Presentado por HalDo AI"},
    it:{title:"Benvenuto in",author:"di Halil Donma",footer:"HalDo Blitzer di Halil Donma",enter:"Andiamo",ai:"Presentato da HalDo AI"},
    ru:{title:"Добро пожаловать в",author:"от Халила Донма",footer:"HalDo Blitzer от Халила Донма",enter:"Поехали",ai:"Представлено HalDo AI"}
  };

  var WELCOME_THEMES = {
    gold:   { name:"🥇 Gold",   top:"#0a0e2a", mid:"#1a1a4e", bot:"#5a3a6a", accent:"#ffd700", sun1:"#fffce0", sun2:"#ffe85e", sun3:"#ffd700", sun4:"#ff9800", sun5:"#ff6f00" },
    cosmic: { name:"🌌 Kosmisch",top:"#000010", mid:"#0a0a3a", bot:"#2a0a4a", accent:"#b478ff", sun1:"#f0e8ff", sun2:"#b478ff", sun3:"#8a3aff", sun4:"#4dd0e1", sun5:"#1a3a8a" },
    sunset: { name:"🌅 Sunset", top:"#0a0a1a", mid:"#3a1a3a", bot:"#8a3a2a", accent:"#ff8844", sun1:"#fff0e0", sun2:"#ffb070", sun3:"#ff7733", sun4:"#ff4444", sun5:"#8a1a4a" },
    emerald:{ name:"💚 Smaragd", top:"#0a1a0a", mid:"#0a3a2a", bot:"#0a5a3a", accent:"#4ade80", sun1:"#e0fff0", sun2:"#88ffbb", sun3:"#4ade80", sun4:"#22aa66", sun5:"#0a5a3a" },
    pink:   { name:"🌸 Pink",   top:"#1a0a1a", mid:"#3a1a3a", bot:"#6a2a5a", accent:"#ff77aa", sun1:"#ffe8f0", sun2:"#ff99cc", sun3:"#ff5599", sun4:"#cc3377", sun5:"#6a1a4a" }
  };

  // ═══════════ PEACOCK SVG BUILDER ═══════════
  function buildPeacockSVG(size, uid){
    size = size || 200; uid = uid || (size + "_" + Math.random().toString(36).slice(2,7));
    var cx = 100, cy = 138;
    var feathers = "";
    var numF = 13;
    for(var i = 0; i < numF; i++){
      var angle = -100 + (200 / (numF - 1)) * i;
      var rad = (angle - 90) * Math.PI / 180;
      var len = 52 + Math.abs(angle) * 0.18;
      var x2 = cx + Math.cos(rad) * len;
      var y2 = cy + Math.sin(rad) * len;
      var eyeScale = 0.85 + Math.abs(angle) * 0.0018;
      feathers += `<line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="#1a4a8a" stroke-width="1.5" opacity=".8"/>`;
      feathers += `<ellipse cx="${x2}" cy="${y2}" rx="${(9*eyeScale).toFixed(1)}" ry="${(11*eyeScale).toFixed(1)}" fill="url(#pgEye_${uid})" stroke="#0a2a5a" stroke-width="0.8"/>`;
      feathers += `<ellipse cx="${x2}" cy="${y2}" rx="${(3.2*eyeScale).toFixed(1)}" ry="${(4.2*eyeScale).toFixed(1)}" fill="#001a4d"/>`;
      feathers += `<circle cx="${x2}" cy="${y2}" r="${(1.1*eyeScale).toFixed(1)}" fill="#4dd0e1" opacity=".9"/>`;
    }
    return `<svg viewBox="0 0 200 220" width="${size}" height="${size*1.1}" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;filter:drop-shadow(0 8px 24px rgba(255,215,0,.5)) drop-shadow(0 0 40px rgba(77,208,225,.3))">
      <defs>
        <radialGradient id="pgEye_${uid}" cx="50%" cy="50%" r="55%">
          <stop offset="0%" stop-color="#001a4d"/>
          <stop offset="25%" stop-color="#1a3a7a"/>
          <stop offset="50%" stop-color="#2a7ab8"/>
          <stop offset="70%" stop-color="#4dd0e1"/>
          <stop offset="85%" stop-color="#ffd700"/>
          <stop offset="100%" stop-color="#0a2a5a"/>
        </radialGradient>
        <linearGradient id="pgBody_${uid}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#4dd0e1"/>
          <stop offset="45%" stop-color="#1a7ab8"/>
          <stop offset="100%" stop-color="#052a5a"/>
        </linearGradient>
        <linearGradient id="pgBodyShade_${uid}" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="rgba(255,255,255,.15)"/>
          <stop offset="50%" stop-color="rgba(255,255,255,0)"/>
          <stop offset="100%" stop-color="rgba(0,0,0,.25)"/>
        </linearGradient>
      </defs>
      ${feathers}
      <ellipse cx="100" cy="150" rx="20" ry="32" fill="url(#pgBody_${uid})"/>
      <ellipse cx="100" cy="150" rx="20" ry="32" fill="url(#pgBodyShade_${uid})"/>
      <path d="M 92 128 Q 87 90 100 62 Q 113 90 108 128 Z" fill="url(#pgBody_${uid})"/>
      <path d="M 92 128 Q 87 90 100 62 Q 105 90 104 128 Z" fill="url(#pgBodyShade_${uid})" opacity=".6"/>
      <circle cx="100" cy="58" r="14" fill="url(#pgBody_${uid})"/>
      <circle cx="100" cy="58" r="14" fill="url(#pgBodyShade_${uid})" opacity=".5"/>
      <g transform="translate(100,44)" stroke="#4dd0e1" stroke-width="1.3" fill="none" stroke-linecap="round">
        <line x1="0" y1="0" x2="0" y2="-15"/>
        <line x1="-5" y1="-2" x2="-7" y2="-13"/>
        <line x1="5" y1="-2" x2="7" y2="-13"/>
        <line x1="-9" y1="-6" x2="-12" y2="-11"/>
        <line x1="9" y1="-6" x2="12" y2="-11"/>
      </g>
      <g fill="#ffd700" stroke="#ffb300" stroke-width=".5">
        <circle cx="100" cy="28" r="2.5"/>
        <circle cx="93" cy="30" r="2"/>
        <circle cx="107" cy="30" r="2"/>
        <circle cx="88" cy="34" r="1.8"/>
        <circle cx="112" cy="34" r="1.8"/>
      </g>
      <polygon points="100,54 93,60 100,64" fill="#ffd700" stroke="#b8860b" stroke-width=".6"/>
      <polygon points="100,54 107,60 100,64" fill="#ffb300" stroke="#b8860b" stroke-width=".6"/>
      <circle cx="96" cy="58" r="2.2" fill="#001a4d"/>
      <circle cx="96.6" cy="57.4" r=".8" fill="#fff"/>
      <circle cx="104" cy="58" r="2.2" fill="#001a4d"/>
      <circle cx="104.6" cy="57.4" r=".8" fill="#fff"/>
      <g transform="translate(100,168)">
        <rect x="-13" y="-7" width="26" height="18" rx="3" fill="#1a1a2e" stroke="#ffd700" stroke-width="1.2"/>
        <circle cx="0" cy="2" r="5.5" fill="#4dd0e1" stroke="#fff" stroke-width="1"/>
        <circle cx="0" cy="2" r="2" fill="#fff"/>
        <circle cx="-2" cy="0" r=".8" fill="#ffd700"/>
        <rect x="-4" y="-11" width="8" height="5" rx="1" fill="#1a1a2e" stroke="#ffd700" stroke-width="1"/>
        <circle cx="9" cy="-2" r="1" fill="#ff5555"/>
      </g>
    </svg>`;
  }

  // ═══════════ APP ICON (Warnschild + Kamera) ═══════════
  function appIconSVG(size){
    size = size || 60;
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" style="display:inline-block;vertical-align:middle;filter:drop-shadow(0 4px 12px rgba(255,215,0,.5))">
      <defs><linearGradient id="gGoldIcon_${size}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffe85e"/><stop offset="50%" stop-color="#ffd700"/><stop offset="100%" stop-color="#ffb300"/>
      </linearGradient></defs>
      <polygon points="50,6 95,92 5,92" fill="url(#gGoldIcon_${size})" stroke="#1a1a2e" stroke-width="4" stroke-linejoin="round"/>
      <rect x="32" y="48" width="36" height="26" rx="3" fill="#1a1a2e" stroke="#fff" stroke-width="1.5"/>
      <rect x="44" y="41" width="12" height="9" rx="1" fill="#1a1a2e" stroke="#fff" stroke-width="1.5"/>
      <circle cx="50" cy="61" r="8" fill="#4dd0e1" stroke="#fff" stroke-width="1.5"/>
      <circle cx="50" cy="61" r="3" fill="#fff"/>
      <rect x="34" y="52" width="6" height="3" fill="#ffd700"/>
    </svg>`;
  }

  var CATS = [
    { id:"blitzer_fix",   icon:"📷", color:"#ff5555", type:"warn", sound:"siren",  name:{de:"Fester Blitzer",en:"Fixed Camera",tr:"Sabit Radar",ar:"رادار ثابت",ku:"Radarê Sabît",fr:"Radar fixe",es:"Radar fijo",it:"Autovelox fisso",ru:"Стационарная камера"}, voice:{de:"Achtung, Blitzer in {d}",en:"Warning, camera in {d}",tr:"Dikkat, radar {d}",ar:"تحذير رادار {d}",ku:"Hişyarî, radar li {d}",fr:"Attention, radar à {d}",es:"Atención, radar en {d}",it:"Attenzione, autovelox a {d}",ru:"Внимание, камера через {d}"} },
    { id:"blitzer_mobil", icon:"🚔", color:"#ff8844", type:"warn", sound:"police", name:{de:"Mobile Kontrolle",en:"Mobile Check",tr:"Mobil Kontrol",ar:"مراقبة متحركة",ku:"Kontrola Mobîl",fr:"Contrôle mobile",es:"Control móvil",it:"Controllo mobile",ru:"Мобильная проверка"}, voice:{de:"Achtung, Kontrolle in {d}",en:"Warning, check in {d}",tr:"Dikkat, kontrol {d}",ar:"تحذير مراقبة {d}",ku:"Hişyarî, kontrol li {d}",fr:"Attention, contrôle à {d}",es:"Atención, control en {d}",it:"Attenzione, controllo a {d}",ru:"Внимание, проверка через {d}"} },
    { id:"stau", icon:"🚗", color:"#ffaa33", type:"warn", sound:"siren", name:{de:"Stau",en:"Traffic Jam",tr:"Trafik",ar:"ازدحام",ku:"Traffîk",fr:"Embouteillage",es:"Atasco",it:"Ingorgo",ru:"Пробка"}, voice:{de:"Stau in {d}",en:"Traffic jam in {d}",tr:"Trafik {d}",ar:"ازدحام {d}",ku:"Traffîk li {d}",fr:"Embouteillage à {d}",es:"Atasco en {d}",it:"Ingorgo a {d}",ru:"Пробка через {d}"} },
    { id:"unfall", icon:"💥", color:"#ff3333", type:"warn", sound:"urgent", name:{de:"Unfall",en:"Accident",tr:"Kaza",ar:"حادث",ku:"Qeza",fr:"Accident",es:"Accidente",it:"Incidente",ru:"Авария"}, voice:{de:"Unfall in {d}",en:"Accident in {d}",tr:"Kaza {d}",ar:"حادث {d}",ku:"Qeza li {d}",fr:"Accident à {d}",es:"Accidente en {d}",it:"Incidente a {d}",ru:"Авария через {d}"} },
    { id:"baustelle", icon:"🚧", color:"#ffaa33", type:"warn", sound:"chime", name:{de:"Baustelle",en:"Road Work",tr:"Yol Çalışması",ar:"أعمال طريق",ku:"Karê Rê",fr:"Travaux",es:"Obras",it:"Lavori",ru:"Ремонт дороги"}, voice:{de:"Baustelle in {d}",en:"Road work in {d}",tr:"Yol çalışması {d}",ar:"أعمال طريق {d}",ku:"Karê rê li {d}",fr:"Travaux à {d}",es:"Obras en {d}",it:"Lavori a {d}",ru:"Ремонт дороги через {d}"} },
    { id:"baustelle_gesperrt", icon:"⛔", color:"#ff3333", type:"warn", sound:"buzzer", name:{de:"Baustelle (gesperrt)",en:"Road Closed",tr:"Yol Kapalı",ar:"طريق مغلق",ku:"Rê Girtî",fr:"Route fermée",es:"Vía cerrada",it:"Strada chiusa",ru:"Дорога закрыта"}, voice:{de:"Straße gesperrt in {d}",en:"Road closed in {d}",tr:"Yol kapalı {d}",ar:"طريق مغلق {d}",ku:"Rê girtî li {d}",fr:"Route fermée à {d}",es:"Vía cerrada en {d}",it:"Strada chiusa a {d}",ru:"Дорога закрыта через {d}"} },
    { id:"umleitung", icon:"↪️", color:"#4dd0e1", type:"warn", sound:"siren", name:{de:"Umleitung",en:"Detour",tr:"Güzergah",ar:"تحويلة",ku:"Rêya Din",fr:"Déviation",es:"Desvío",it:"Deviazione",ru:"Объезд"}, voice:{de:"Umleitung in {d}",en:"Detour in {d}",tr:"Güzergah {d}",ar:"تحويلة {d}",ku:"Rêya din li {d}",fr:"Déviation à {d}",es:"Desvío en {d}",it:"Deviazione a {d}",ru:"Объезд через {d}"} },
    { id:"ezidi", icon:"🦚", color:"#ffd700", type:"warn", sound:"radar", name:{de:"Ezidi-Zentrum",en:"Ezidi Center",tr:"Ezidi Merkezi",ar:"مركز إيزيدي",ku:"Navenda Êzîdî",fr:"Centre Ezidi",es:"Centro Ezidi",it:"Centro Ezidi",ru:"Езидский центр"}, voice:{de:"Ezidi-Zentrum in {d}",en:"Ezidi center in {d}",tr:"Ezidi merkezi {d}",ar:"مركز إيزيدي {d}",ku:"Navenda Êzîdî li {d}",fr:"Centre Ezidi à {d}",es:"Centro Ezidi en {d}",it:"Centro Ezidi a {d}",ru:"Езидский центр через {d}"} },
    { id:"poi_fuel", icon:"⛽", color:"#66cc66", type:"poi", osm:"amenity=fuel", sound:"chime", name:{de:"Tankstelle",en:"Gas Station",tr:"Benzinlik",ar:"محطة وقود",ku:"Benzîngeh",fr:"Station",es:"Gasolinera",it:"Benzinaio",ru:"АЗС"}, voice:{de:"Tankstelle in {d}",en:"Gas station in {d}",tr:"Benzinlik {d}",ar:"محطة وقود {d}",ku:"Benzîngeh li {d}",fr:"Station à {d}",es:"Gasolinera en {d}",it:"Benzinaio a {d}",ru:"АЗС через {d}"} },
    { id:"poi_rest", icon:"🍴", color:"#ff8844", type:"poi", osm:"amenity=restaurant", sound:"chime", name:{de:"Restaurant",en:"Restaurant",tr:"Restoran",ar:"مطعم",ku:"Restoran",fr:"Restaurant",es:"Restaurante",it:"Ristorante",ru:"Ресторан"}, voice:{de:"Restaurant in {d}",en:"Restaurant in {d}",tr:"Restoran {d}",ar:"مطعم {d}",ku:"Restoran li {d}",fr:"Restaurant à {d}",es:"Restaurante en {d}",it:"Ristorante a {d}",ru:"Ресторан через {d}"} }
  ];

  var LANGS = {
    de:{name:"Deutsch",code:"de-DE"}, en:{name:"English",code:"en-US"},
    tr:{name:"Türkçe",code:"tr-TR"}, ar:{name:"العربية",code:"ar-SA"},
    ku:{name:"Kurdî (Ezidi)",code:"tr-TR"}, fr:{name:"Français",code:"fr-FR"},
    es:{name:"Español",code:"es-ES"}, it:{name:"Italiano",code:"it-IT"},
    ru:{name:"Русский",code:"ru-RU"}
  };

  var ARROW_COLORS = {
    gold24k:{fill:"#ffd700", glow:"rgba(255,215,0,.9)", name:"🥇 24K Gold"},
    gold:{fill:"#ffed4e", glow:"rgba(255,237,78,.9)", name:"✨ Hellgold"},
    blue:{fill:"#4dd0e1", glow:"rgba(77,208,225,.8)", name:"💎 Cyan"},
    white:{fill:"#ffffff", glow:"rgba(255,255,255,.8)", name:"⚪ Weiß"},
    green:{fill:"#4ade80", glow:"rgba(74,222,128,.8)", name:"🟢 Neon-Grün"},
    red:{fill:"#ff5555", glow:"rgba(255,85,85,.8)", name:"🔴 Rot"},
    purple:{fill:"#b478ff", glow:"rgba(180,120,255,.8)", name:"🟣 Lila"},
    orange:{fill:"#ff8844", glow:"rgba(255,136,68,.8)", name:"🟠 Orange"},
    silver:{fill:"#e0e0e0", glow:"rgba(224,224,224,.8)", name:"🥈 Silber"},
    pink:{fill:"#ff77aa", glow:"rgba(255,119,170,.8)", name:"🌸 Pink"}
  };

  var DEFAULT_SETTINGS = {
    enabled:{}, lang:"de", voiceOn:true, navVoiceOn:true, beepOn:true, notifyOn:true,
    warnDist:1000, sounds:{}, arrowColor:"gold24k", tachoColor:"#ffd700",
    alarmDuration:5, offlineMode:false, flashOnWarning:false, globalMute:false,
    tankerApiKey:"", btDeviceName:null, useCustomVoice:false,
    welcomeTheme:"gold", welcomeSpeed:"normal", welcomeDuration:"normal",
    showBootLog:true
  };
  CATS.forEach(c => { DEFAULT_SETTINGS.enabled[c.id]=true; DEFAULT_SETTINGS.sounds[c.id]=c.sound||"chime"; });

  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function haversine(a,b,c,d){ var R=6371000,dLa=(c-a)*Math.PI/180,dLo=(d-b)*Math.PI/180; var x=Math.sin(dLa/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLo/2)**2; return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); }
  function fmtDist(m){ return m<1000 ? Math.round(m/10)*10+" m" : (m/1000).toFixed(1)+" km"; }
  function fmtTime(sec){ var h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60; return (h>0?h+"h ":"")+m+"m "+s+"s"; }

  // ═══════════ AUDIO ENGINE (20+ Töne) ═══════════
  var audioCtx = null;
  function getAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
  function playBeep(pattern, vol, duration){
    duration = duration || 2.5;
    var ctx = getAudio(); if(!ctx) return;
    var now = ctx.currentTime;

    if(pattern==="siren"||pattern==="siren2"||pattern==="siren3"){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.type="sawtooth";o.connect(g);g.connect(ctx.destination);
      var base = pattern==="siren3"?600:pattern==="siren2"?1000:800;
      o.frequency.setValueAtTime(base,now);
      for(var t=0;t<duration;t+=1){
        o.frequency.linearRampToValueAtTime(base+500,now+t+0.5);
        o.frequency.linearRampToValueAtTime(base,now+t+1);
      }
      g.gain.setValueAtTime(0,now);g.gain.linearRampToValueAtTime(vol,now+0.1);
      g.gain.setValueAtTime(vol,now+duration-0.2);g.gain.linearRampToValueAtTime(0,now+duration);
      o.start(now);o.stop(now+duration);return;
    }
    if(pattern==="long_alarm"||pattern==="long_alarm2"){
      var freq = pattern==="long_alarm2"?1200:1600;
      for(var i=0;i<(duration/0.4);i++){
        var t2=now+i*0.4;
        var o2=ctx.createOscillator(),g2=ctx.createGain();
        o2.type="square";o2.frequency.value=freq;o2.connect(g2);g2.connect(ctx.destination);
        g2.gain.setValueAtTime(0,t2);g2.gain.linearRampToValueAtTime(vol,t2+0.05);
        g2.gain.setValueAtTime(vol,t2+0.25);g2.gain.linearRampToValueAtTime(0,t2+0.35);
        o2.start(t2);o2.stop(t2+0.35);
      }
      return;
    }
    if(pattern==="radar"||pattern==="radar2"){
      var f2 = pattern==="radar2"?2600:2200;
      for(var i=0;i<(duration/0.15);i++){
        var t3=now+i*0.15;
        var o3=ctx.createOscillator(),g3=ctx.createGain();
        o3.type="sine";o3.frequency.value=f2;o3.connect(g3);g3.connect(ctx.destination);
        g3.gain.setValueAtTime(0,t3);g3.gain.linearRampToValueAtTime(vol,t3+0.01);
        g3.gain.exponentialRampToValueAtTime(0.001,t3+0.08);
        o3.start(t3);o3.stop(t3+0.1);
      }
      return;
    }
    if(pattern==="birds"){
      for(var i=0;i<10;i++){
        var t4=now+i*0.22+Math.random()*0.1;
        var o4=ctx.createOscillator(),g4=ctx.createGain();
        o4.type="sine";
        o4.frequency.setValueAtTime(2000+Math.random()*1500,t4);
        o4.frequency.exponentialRampToValueAtTime(2500+Math.random()*1500,t4+0.05);
        o4.connect(g4);g4.connect(ctx.destination);
        g4.gain.setValueAtTime(0,t4);g4.gain.linearRampToValueAtTime(vol,t4+0.01);
        g4.gain.exponentialRampToValueAtTime(0.001,t4+0.1);
        o4.start(t4);o4.stop(t4+0.12);
      }
      return;
    }
    if(pattern==="extreme"){
      var o5=ctx.createOscillator(),g5=ctx.createGain();
      o5.type="sawtooth";o5.frequency.value=300;o5.connect(g5);g5.connect(ctx.destination);
      for(var i=0;i<duration;i+=0.5){
        o5.frequency.setValueAtTime(300,now+i);
        o5.frequency.linearRampToValueAtTime(1500,now+i+0.25);
        o5.frequency.linearRampToValueAtTime(300,now+i+0.5);
      }
      g5.gain.setValueAtTime(vol,now);
      g5.gain.setValueAtTime(vol,now+duration-0.2);
      g5.gain.linearRampToValueAtTime(0,now+duration);
      o5.start(now);o5.stop(now+duration);return;
    }
    if(pattern==="police"){
      for(var i=0;i<Math.ceil(duration*3.3);i++){
        var t6=now+i*0.3;
        var o6=ctx.createOscillator(),g6=ctx.createGain();
        o6.type="square";o6.frequency.value = i%2===0?1400:1800;
        o6.connect(g6);g6.connect(ctx.destination);
        g6.gain.setValueAtTime(0,t6);g6.gain.linearRampToValueAtTime(vol,t6+0.02);
        g6.gain.setValueAtTime(vol,t6+0.15);g6.gain.linearRampToValueAtTime(0,t6+0.18);
        o6.start(t6);o6.stop(t6+0.2);
      }
      return;
    }
    if(pattern==="buzzer"){
      var o7=ctx.createOscillator(),g7=ctx.createGain();
      o7.type="square";o7.frequency.value=120;o7.connect(g7);g7.connect(ctx.destination);
      g7.gain.setValueAtTime(vol,now);
      g7.gain.setValueAtTime(vol,now+duration-0.1);
      g7.gain.linearRampToValueAtTime(0,now+duration);
      o7.start(now);o7.stop(now+duration);return;
    }
    if(pattern==="horn"){
      [400,500].forEach(function(f){
        var o8=ctx.createOscillator(),g8=ctx.createGain();
        o8.type="sawtooth";o8.frequency.value=f;o8.connect(g8);g8.connect(ctx.destination);
        g8.gain.setValueAtTime(0,now);g8.gain.linearRampToValueAtTime(vol*0.5,now+0.05);
        g8.gain.setValueAtTime(vol*0.5,now+duration-0.2);
        g8.gain.linearRampToValueAtTime(0,now+duration);
        o8.start(now);o8.stop(now+duration);
      });
      return;
    }
    if(pattern==="ping"){
      var o9=ctx.createOscillator(),g9=ctx.createGain();
      o9.type="sine";o9.frequency.setValueAtTime(1500,now);
      o9.frequency.exponentialRampToValueAtTime(800,now+0.5);
      o9.connect(g9);g9.connect(ctx.destination);
      g9.gain.setValueAtTime(0,now);g9.gain.linearRampToValueAtTime(vol,now+0.01);
      g9.gain.exponentialRampToValueAtTime(0.001,now+0.6);
      o9.start(now);o9.stop(now+0.7);return;
    }
    if(pattern==="sonar"){
      for(var i=0;i<3;i++){
        var t10=now+i*0.8;
        var o10=ctx.createOscillator(),g10=ctx.createGain();
        o10.type="sine";o10.frequency.setValueAtTime(1800,t10);
        o10.frequency.exponentialRampToValueAtTime(600,t10+0.5);
        o10.connect(g10);g10.connect(ctx.destination);
        g10.gain.setValueAtTime(0,t10);g10.gain.linearRampToValueAtTime(vol,t10+0.02);
        g10.gain.exponentialRampToValueAtTime(0.001,t10+0.7);
        o10.start(t10);o10.stop(t10+0.75);
      }
      return;
    }
    if(pattern==="digital"){
      var notes=[2000,1800,2200,1600,2400,1400];
      for(var i=0;i<Math.ceil(duration*12);i++){
        var t11=now+i*0.08;
        var o11=ctx.createOscillator(),g11=ctx.createGain();
        o11.type="square";o11.frequency.value=notes[i%notes.length];
        o11.connect(g11);g11.connect(ctx.destination);
        g11.gain.setValueAtTime(0,t11);g11.gain.linearRampToValueAtTime(vol,t11+0.005);
        g11.gain.exponentialRampToValueAtTime(0.001,t11+0.06);
        o11.start(t11);o11.stop(t11+0.07);
      }
      return;
    }
    if(pattern==="bell"){
      var o12=ctx.createOscillator(),g12=ctx.createGain();
      o12.type="sine";o12.frequency.value=800;o12.connect(g12);g12.connect(ctx.destination);
      g12.gain.setValueAtTime(0,now);g12.gain.linearRampToValueAtTime(vol,now+0.005);
      g12.gain.exponentialRampToValueAtTime(0.001,now+3);
      o12.start(now);o12.stop(now+3);return;
    }
    if(pattern==="klaxon"){
      for(var i=0;i<Math.ceil(duration*2);i++){
        var t13=now+i*0.5;
        var o13=ctx.createOscillator(),g13=ctx.createGain();
        o13.type="sawtooth";o13.frequency.value=i%2===0?500:700;
        o13.connect(g13);g13.connect(ctx.destination);
        g13.gain.setValueAtTime(0,t13);g13.gain.linearRampToValueAtTime(vol,t13+0.03);
        g13.gain.setValueAtTime(vol,t13+0.35);g13.gain.linearRampToValueAtTime(0,t13+0.45);
        o13.start(t13);o13.stop(t13+0.5);
      }
      return;
    }
    // Standard patterns
    var p = { urgent:[{f:880,t:0,d:0.1},{f:880,t:0.15,d:0.1}],
      alarm:[{f:1200,t:0,d:0.08},{f:1200,t:0.12,d:0.08}],
      chime:[{f:523,t:0,d:0.15},{f:659,t:0.15,d:0.15},{f:784,t:0.3,d:0.25}],
      low:[{f:440,t:0,d:0.2}]
    }[pattern] || [{f:440,t:0,d:0.2}];
    p.forEach(function(b){
      var o=ctx.createOscillator(),g=ctx.createGain();
      o.frequency.value=b.f;o.type="sine";
      g.gain.setValueAtTime(0,now+b.t);g.gain.linearRampToValueAtTime(vol,now+b.t+0.01);
      g.gain.exponentialRampToValueAtTime(0.001,now+b.t+b.d);
      o.connect(g).connect(ctx.destination);o.start(now+b.t);o.stop(now+b.t+b.d+0.02);
    });
  }

  var torchStream=null,torchTrack=null,torchTimer=null;
  async function setTorch(on){
    try{
      if(on){ if(!torchStream){ torchStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}}); torchTrack=torchStream.getVideoTracks()[0]; }
        await torchTrack.applyConstraints({advanced:[{torch:true}]});
      } else if(torchTrack){ try{ await torchTrack.applyConstraints({advanced:[{torch:false}]}); }catch(e){} }
    }catch(e){}
  }
  function blinkTorch(count){
    if(torchTimer) clearInterval(torchTimer);
    var i=0,max=count||5; setTorch(true);
    torchTimer=setInterval(function(){ i++; setTorch(i%2===0?true:false);
      if(i>=max*2){ clearInterval(torchTimer);torchTimer=null;setTorch(false); } },250);
  }

  // ═══════════ SERVICE WORKER (Cross-Device Push) ═══════════
  var swRegistration = null;
  async function registerServiceWorker(){
    if(!('serviceWorker' in navigator)) return null;
    try {
      if(swRegistration) return swRegistration;
      var swCode = `self.addEventListener('push',function(e){var d={title:'HalDo Blitzer',body:'Warnung!'};try{d=e.data.json()}catch(x){}e.waitUntil(self.registration.showNotification(d.title,{body:d.body,icon:d.icon||'/logo.png',badge:d.icon||'/logo.png',vibrate:[200,100,200],requireInteraction:false}))});self.addEventListener('notificationclick',function(e){e.notification.close();e.waitUntil(clients.openWindow('/'))});`;
      var blob = new Blob([swCode],{type:'application/javascript'});
      var url = URL.createObjectURL(blob);
      swRegistration = await navigator.serviceWorker.register(url, {scope:'/'}).catch(function(){ return null; });
      return swRegistration;
    } catch(e){ return null; }
  }

  // ═══════════ MAIN RENDER ═══════════
  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"splash" };
    var geoWatch=null, lastPos=null;
    var trip={active:false,startTime:0,distance:0,warnings:0};
    var map=null,mapMarkers=[],triggered={},lastLimitFetch=0,currentLimit=null;
    var poiCache={},routeData=null,targetPos=null;
    var tfModel=null,cameraStream=null,visionLoop=null;
    var weatherData=null,weatherPos=store.get("weatherPos",{x:20,y:60});
    var parkTimer=null,parkEndTime=0;
    var fuelStations=[];
    var btDevice=null,btServer=null;
    var lastSpokenStep=null,lastSpokenDist=null;
    var voiceRecorder=null,voiceChunks=[];
    var bootLines = [];

    function getSettings(){ var s=store.get("settings",{}); var m=JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); Object.keys(s).forEach(function(k){ m[k]=s[k]; }); return m; }
    function saveSettings(s){ store.set("settings",s); }
    function getWarnings(){ return store.get("warnings",[]); }
    function saveWarnings(w){ store.set("warnings",w); }
    function getCat(id){ return CATS.find(function(c){ return c.id===id; }); }
    function getCustomVoice(){ return store.get("customVoice",{}); }
    function saveCustomVoice(v){ store.set("customVoice",v); }

    function build(){
      var sc=view.screen;
      if(sc==="boot") screenBoot();
      else if(sc==="splash") screenSplash();
      else if(sc==="cockpit") screenCockpit();
      else if(sc==="map") screenMap();
      else if(sc==="settings") screenSettingsMenu();
      else if(sc==="settings_display") screenSettingsDisplay();
      else if(sc==="settings_sounds") screenSettingsSounds();
      else if(sc==="settings_welcome") screenSettingsWelcome();
      else if(sc==="settings_nav") screenSettingsNav();
      else if(sc==="settings_lang") screenSettingsLang();
      else if(sc==="settings_bt") screenSettingsBT();
      else if(sc==="settings_flash") screenSettingsFlash();
      else if(sc==="settings_voice") screenSettingsVoice();
      else if(sc==="settings_about") screenSettingsAbout();
      else if(sc==="nav") screenNav();
      else if(sc==="vision") screenVision();
      else if(sc==="list") screenList();
      else if(sc==="report") screenReport();
      else if(sc==="park") screenPark();
      else if(sc==="fuel") screenFuel();
      else if(sc==="restaurant") screenRestaurants();
    }

    // ═══════════ BOOT LOG SCREEN ═══════════
    function screenBoot(){
      var s = getSettings();
      var logs = [
        "🦚 runtime.js geladen",
        "🦚 store.js geladen",
        "🎙️ 319 Stimmen geladen",
        "🎙️ 346 Stimmen geladen",
        "🦚 notify.js geladen",
        "🎨 theme.js geladen — 8 Themes",
        "🦚 apps.js geladen — 48 Apps",
        "🦚 ai-engine.js geladen — WASM aktiv",
        "🦚 haldo-ai.js geladen",
        "🪟 deskpane.js geladen",
        "👤 avatar.js geladen",
        "🏠 shell.js geladen",
        "⚙️ settings.js geladen",
        "🦚 HalDo Blitzer v16.0 — Peacock Deluxe"
      ];
      var css = `
        .boot-screen{position:fixed;inset:0;background:radial-gradient(ellipse at center,#0a0e2a 0%,#000 100%);z-index:99999;display:flex;align-items:center;justify-content:center;font-family:'SF Mono','Monaco','Consolas',monospace;overflow:hidden}
        .boot-terminal{width:90%;max-width:520px;padding:24px;background:rgba(10,14,42,.85);border:1px solid rgba(255,215,0,.3);border-radius:16px;box-shadow:0 0 60px rgba(255,215,0,.3),inset 0 0 40px rgba(77,208,225,.1);backdrop-filter:blur(10px)}
        .boot-header{font-size:13px;color:#ffd700;font-weight:900;letter-spacing:2px;text-align:center;margin-bottom:16px;text-shadow:0 0 12px #ffd700;animation:bootPulse 2s ease-in-out infinite}
        @keyframes bootPulse{0%,100%{opacity:.8;text-shadow:0 0 12px #ffd700}50%{opacity:1;text-shadow:0 0 24px #ffd700,0 0 40px #ff9800}}
        .boot-lines{font-size:11px;line-height:1.9;max-height:340px;overflow:hidden}
        .boot-line{opacity:0;color:#4dd0e1;text-shadow:0 0 6px rgba(77,208,225,.7);animation:bootLineIn .4s ease-out forwards;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .boot-line:last-child{color:#ffd700;text-shadow:0 0 10px #ffd700,0 0 20px rgba(255,215,0,.6);font-weight:900}
        @keyframes bootLineIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
        .boot-cursor{display:inline-block;width:7px;height:13px;background:#4dd0e1;box-shadow:0 0 10px #4dd0e1;animation:bootBlink 1s step-end infinite;vertical-align:middle;margin-left:4px}
        @keyframes bootBlink{50%{opacity:0}}
        .boot-bar{height:3px;background:rgba(255,255,255,.1);border-radius:2px;margin-top:14px;overflow:hidden}
        .boot-bar-fill{height:100%;background:linear-gradient(90deg,#4dd0e1,#ffd700);box-shadow:0 0 10px #ffd700;animation:bootBarFill 3s ease-in-out forwards;width:0%}
        @keyframes bootBarFill{to{width:100%}}
      `;
      var html = `<style>${css}</style><div class="boot-screen"><div class="boot-terminal">
        <div class="boot-header">🦚 HALDO AI OS — BOOT SEQUENCE 🦚</div>
        <div class="boot-lines" id="bootLines"></div>
        <div class="boot-bar"><div class="boot-bar-fill"></div></div>
      </div></div>`;
      container.innerHTML = html;
      var linesEl = container.querySelector("#bootLines");
      var i = 0;
      function nextLine(){
        if(i >= logs.length) return;
        var div = document.createElement("div");
        div.className = "boot-line";
        div.style.animationDelay = "0ms";
        div.textContent = logs[i];
        linesEl.appendChild(div);
        if(i === logs.length-1){
          var cur = document.createElement("span");
          cur.className = "boot-cursor";
          linesEl.appendChild(cur);
        }
        i++;
        setTimeout(nextLine, 180);
      }
      nextLine();
      setTimeout(function(){ view.screen="splash"; build(); }, 3000);
    }

    // ═══════════ SPLASH SCREEN ═══════════
    function screenSplash(){
      var s = getSettings();
      var w = WELCOME[s.lang] || WELCOME.de;
      var theme = WELCOME_THEMES[s.welcomeTheme] || WELCOME_THEMES.gold;
      var speedMap = { slow: 1.4, normal: 1, fast: 0.6 };
      var speedMult = speedMap[s.welcomeSpeed] || 1;
      var durMap = { short: 2, normal: 4, long: 6 };
      var durMult = durMap[s.welcomeDuration] || 4;
      var flyDur = durMult * speedMult;
      var peacock = buildPeacockSVG(200, "splash");
      var css = `
        .splash{position:fixed;inset:0;background:linear-gradient(to bottom,${theme.top} 0%,${theme.mid} 30%,${theme.bot} 100%);overflow:hidden;z-index:99998;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;display:flex;align-items:center;justify-content:center;flex-direction:column;color:#fff}
        .splash-stars{position:absolute;inset:0;background-image:radial-gradient(1px 1px at 20% 30%,#fff,transparent),radial-gradient(1px 1px at 40% 70%,#fff,transparent),radial-gradient(1.5px 1.5px at 60% 20%,#fff,transparent),radial-gradient(1px 1px at 80% 50%,#fff,transparent),radial-gradient(1px 1px at 30% 85%,#fff,transparent);animation:twinkle 4s ease-in-out infinite alternate;pointer-events:none}
        @keyframes twinkle{from{opacity:.4}to{opacity:1}}
        .splash-ray{position:absolute;top:12%;left:50%;transform:translateX(-50%);width:340px;height:340px;z-index:1;animation:rayRotate 40s linear infinite;pointer-events:none}
        .splash-ray::before{content:'';position:absolute;inset:0;background:conic-gradient(from 0deg,transparent 0deg,${theme.accent}55 8deg,transparent 16deg,transparent 28deg,${theme.accent}55 36deg,transparent 44deg,transparent 56deg,${theme.accent}55 64deg,transparent 72deg,transparent 84deg,${theme.accent}55 92deg,transparent 100deg,transparent 112deg,${theme.accent}55 120deg,transparent 128deg,transparent 140deg,${theme.accent}55 148deg,transparent 156deg,transparent 168deg,${theme.accent}55 176deg,transparent 184deg,transparent 196deg,${theme.accent}55 204deg,transparent 212deg,transparent 224deg,${theme.accent}55 232deg,transparent 240deg,transparent 252deg,${theme.accent}55 260deg,transparent 268deg,transparent 280deg,${theme.accent}55 288deg,transparent 296deg,transparent 308deg,${theme.accent}55 316deg,transparent 324deg,transparent 336deg,${theme.accent}55 344deg,transparent 352deg);border-radius:50%;filter:blur(2px)}
        @keyframes rayRotate{to{transform:translateX(-50%) rotate(360deg)}}
        .splash-sun{position:absolute;top:10%;left:50%;transform:translateX(-50%);width:160px;height:160px;border-radius:50%;background:radial-gradient(circle,${theme.sun1} 0%,${theme.sun2} 25%,${theme.sun3} 50%,${theme.sun4} 75%,${theme.sun5} 100%);box-shadow:0 0 80px ${theme.accent},0 0 160px ${theme.sun4},0 0 240px ${theme.accent}66;z-index:2;animation:sunPulse 3s ease-in-out infinite}
        @keyframes sunPulse{0%,100%{transform:translateX(-50%) scale(1)}50%{transform:translateX(-50%) scale(1.08)}}
        .splash-peacock{position:absolute;top:38%;left:50%;z-index:5;animation:peacockFly ${flyDur}s cubic-bezier(.4,0,.2,1) forwards;pointer-events:none}
        @keyframes peacockFly{
          0%{transform:translate(200%,-400%) scale(.15) rotate(-45deg);opacity:0}
          15%{opacity:1}
          35%{transform:translate(50%,-180%) scale(.5) rotate(-20deg);opacity:1}
          55%{transform:translate(-50%,-60%) scale(.95) rotate(0deg);opacity:1}
          62%{transform:translate(-50%,-50%) scale(1.25,.85) rotate(0deg)}
          68%{transform:translate(-50%,-50%) scale(.85,1.25) rotate(0deg)}
          74%{transform:translate(-50%,-50%) scale(1.15,.9) rotate(0deg)}
          80%{transform:translate(-50%,-50%) scale(.95,1.1) rotate(0deg)}
          86%{transform:translate(-50%,-50%) scale(1.08,.95) rotate(0deg)}
          100%{transform:translate(-50%,-50%) scale(1) rotate(0deg)}
        }
        .splash-logo{position:absolute;top:52%;left:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;object-fit:cover;z-index:6;border:3px solid ${theme.accent};box-shadow:0 0 30px ${theme.accent},0 0 60px ${theme.accent}66;animation:logoIn .8s ease-out ${flyDur*0.9}s both;pointer-events:none}
        @keyframes logoIn{from{opacity:0;transform:translate(-50%,-50%) scale(.3)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}
        .splash-content{position:absolute;bottom:8%;left:50%;transform:translateX(-50%);text-align:center;z-index:10;width:90%;max-width:440px;padding:0 16px}
        .splash-ai{font-size:11px;letter-spacing:3px;color:${theme.accent};font-weight:900;text-transform:uppercase;opacity:0;animation:fadeInUp .8s ease-out ${flyDur*0.65}s forwards;text-shadow:0 0 15px ${theme.accent}}
        .splash-title{font-size:22px;font-weight:800;margin:6px 0;opacity:0;animation:fadeInUp .8s ease-out ${flyDur*0.75}s forwards;color:#fff}
        .splash-brand{font-size:46px;font-weight:900;margin:4px 0;background:linear-gradient(135deg,${theme.sun1} 0%,${theme.accent} 30%,${theme.sun4} 60%,${theme.sun1} 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;background-size:200% 200%;animation:brandShimmer 3s ease-in-out infinite,fadeInUp .9s ease-out ${flyDur*0.85}s forwards;filter:drop-shadow(0 4px 12px ${theme.accent}88);letter-spacing:1px;opacity:0}
        @keyframes brandShimmer{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}
        .splash-author{font-size:15px;color:${theme.sun2};font-weight:800;margin:6px 0 16px;opacity:0;animation:fadeInUp .8s ease-out ${flyDur*0.95}s forwards;text-shadow:0 0 15px ${theme.accent}}
        .splash-footer{font-size:12px;color:rgba(255,255,255,.7);letter-spacing:1px;margin-bottom:20px;opacity:0;animation:fadeInUp .8s ease-out ${flyDur*1.05}s forwards}
        .splash-btn{padding:16px 44px;background:linear-gradient(135deg,${theme.accent} 0%,${theme.sun4} 50%,${theme.accent} 100%);background-size:200% 100%;color:#0a0e2a;border:none;border-radius:14px;font-weight:900;font-size:16px;cursor:pointer;opacity:0;animation:fadeInUp .8s ease-out ${flyDur*1.15}s forwards,btnGlow 2s ease-in-out infinite ${flyDur*1.3}s;font-family:inherit;letter-spacing:1px;box-shadow:0 8px 24px ${theme.accent}66}
        .splash-btn:active{transform:scale(.96)}
        @keyframes btnGlow{0%,100%{box-shadow:0 8px 24px ${theme.accent}66}50%{box-shadow:0 12px 40px ${theme.accent}aa}}
        @keyframes fadeInUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      `;
      container.innerHTML = `<style>${css}</style>
        <div class="splash">
          <div class="splash-stars"></div>
          <div class="splash-ray"></div>
          <div class="splash-sun"></div>
          <div class="splash-peacock">${peacock}</div>
          <img src="${LOGO_URL}" class="splash-logo" onerror="this.style.display='none'">
          <div class="splash-content">
            <div class="splash-ai">${_esc(w.ai)}</div>
            <div class="splash-title">${_esc(w.title)}</div>
            <div class="splash-brand">HalDo Blitzer</div>
            <div class="splash-author">${_esc(w.author)}</div>
            <div class="splash-footer">${_esc(w.footer)}</div>
            <button class="splash-btn" id="splashEnter">${_esc(w.enter)} →</button>
          </div>
        </div>`;
      var enter = container.querySelector("#splashEnter");
      if(enter) enter.addEventListener("click", function(){ view.screen="cockpit"; build(); });
    }

    // ═══════════ COCKPIT ═══════════
    function screenCockpit(){
      var s = getSettings();
      var speed = lastPos ? Math.round((lastPos.coords.speed||0)*3.6) : 0;
      var nextEvent = getNextEvent();
      var nearestWarning = getNearestWarning();
      var maxSpeed=240,startAngle=210,endAngle=510;
      var currentAngle = startAngle + (Math.min(speed,maxSpeed)/maxSpeed)*(endAngle-startAngle);
      var ticks = "";
      for(var i=0;i<=240;i+=20){
        var angle = startAngle+(i/maxSpeed)*(endAngle-startAngle);
        var rad = (angle-90)*Math.PI/180;
        var isMajor = i%40===0;
        var len = isMajor?15:8;
        var x1=100+75*Math.cos(rad),y1=100+75*Math.sin(rad);
        var x2=100+(75-len)*Math.cos(rad),y2=100+(75-len)*Math.sin(rad);
        var tc = (i>180)?'#ff5555':(isMajor?'#fff':'rgba(255,255,255,.3)');
        ticks += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${tc}" stroke-width="${isMajor?3:1.5}"/>`;
        if(isMajor){ var tx=100+60*Math.cos(rad),ty=100+60*Math.sin(rad);
          ticks += `<text x="${tx}" y="${ty}" fill="${tc}" font-size="12" font-weight="900" text-anchor="middle" dominant-baseline="middle">${i}</text>`;
        }
      }
      var ac = ARROW_COLORS[s.arrowColor]||ARROW_COLORS.gold24k;
      var etaStr="—",remTimeStr="—";
      if(routeData && routeData.totalTime){
        var eta = new Date(Date.now()+routeData.totalTime*1000);
        etaStr = eta.toLocaleTimeString("de-DE",{hour:'2-digit',minute:'2-digit'});
        remTimeStr = fmtTime(Math.round(routeData.totalTime));
      }
      var tachoColor = s.tachoColor;
      var isGold = (s.arrowColor==="gold24k"||s.arrowColor==="gold");
      var miniPeacock = buildPeacockSVG(44,"mini");
      var css = `
        .cpt-wrap{position:relative;height:calc(100vh - 100px);min-height:680px;background:radial-gradient(ellipse at 50% 30%,#0a1220 0%,#050810 80%);border-radius:20px;padding:16px;display:flex;flex-direction:column;overflow:hidden;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;color:#fff}
        .cpt-top{display:flex;justify-content:space-between;align-items:center;z-index:10}
        .cpt-navbtn{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:10px 14px;border-radius:12px;font-size:11px;font-weight:900;cursor:pointer;display:flex;align-items:center;gap:6px;transition:.2s;font-family:inherit}
        .cpt-navbtn:hover{background:rgba(255,215,0,.15);border-color:#ffd700}
        .cpt-logo{width:52px;height:52px;border-radius:12px;object-fit:cover;border:2px solid ${tachoColor}88;box-shadow:0 0 20px ${tachoColor}55}
        .cpt-tacho{position:relative;width:440px;height:440px;margin:6px auto;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:transform .1s}
        .cpt-tacho:active{transform:scale(.98)}
        .tacho-bg{position:absolute;inset:0;background:radial-gradient(circle,rgba(10,18,32,1) 0%,rgba(5,8,16,1) 100%);border-radius:50%;border:3px solid ${tachoColor}55;box-shadow:0 0 40px ${tachoColor}33,inset 0 0 30px rgba(0,0,0,.85)}
        .needle-container{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;transform:rotate(${currentAngle}deg);transition:transform .3s cubic-bezier(.4,2.08,.55,.44)}
        .needle{width:4px;height:175px;background:linear-gradient(to top,transparent 40%,${isGold?'#ffd700':'#ff3333'} 40%,${isGold?'#ffd700':'#ff3333'} 100%);position:absolute;bottom:50%;transform-origin:bottom center;border-radius:2px;box-shadow:0 0 15px ${isGold?'#ffd700':'#ff3333'}}
        .needle-center{position:absolute;width:32px;height:32px;background:#111;border:4px solid ${isGold?'#ffd700':'#ff3333'};border-radius:50%;z-index:2;box-shadow:0 0 25px ${isGold?'#ffd700':'#ff3333'}}
        .inner-display{position:absolute;top:50%;left:50%;transform:translate(-50%,-30%);z-index:5;background:linear-gradient(135deg,rgba(20,30,50,.92) 0%,rgba(10,15,25,.96) 100%);backdrop-filter:blur(20px) saturate(180%);border:1.5px solid ${isGold?'rgba(255,215,0,.5)':'rgba(77,208,225,.4)'};border-radius:20px;padding:14px 22px;text-align:center;min-width:180px;box-shadow:0 10px 40px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.15),0 0 40px ${isGold?'rgba(255,215,0,.25)':'rgba(77,208,225,.2)'};cursor:pointer}
        .inner-display .spd{font-size:48px;font-weight:900;line-height:1;font-variant-numeric:tabular-nums;background:linear-gradient(180deg,${isGold?'#ffe85e 0%,#ffd700 50%,#ffb300 100%':'#4dd0e1 0%,#b478ff 100%'});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 15px ${isGold?'rgba(255,215,0,.6)':'rgba(77,208,225,.5)'})}
        .inner-display .unit{font-size:10px;color:#7fa5b8;font-weight:900;letter-spacing:3px;margin-top:2px}
        .inner-display .wrn{margin-top:8px;font-size:10px;font-weight:900;padding:4px 10px;border-radius:12px;background:rgba(255,255,255,.08);white-space:nowrap;display:inline-block;border:1px solid rgba(255,255,255,.1)}
        .inner-display .hint{margin-top:8px;font-size:8px;color:#5a7a8a;letter-spacing:1.5px;font-weight:900}
        .inner-display .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);margin:8px 0}
        .cpt-limit{position:absolute;top:8px;right:8px;width:82px;height:82px;border-radius:50%;background:#fff;border:8px solid #ff3333;display:flex;align-items:center;justify-content:center;z-index:20;box-shadow:0 0 22px rgba(255,51,51,.7)}
        .cpt-limit-num{font-size:30px;font-weight:900;color:#000}
        .holo-container{perspective:800px;width:100%;height:130px;display:flex;align-items:center;justify-content:center;position:relative}
        .holo-base{position:absolute;bottom:0;width:220px;height:44px;background:radial-gradient(ellipse,${ac.glow} 0%,transparent 70%);filter:blur(10px);border-radius:50%}
        .holo-arrow-box{position:relative;transform-style:preserve-3d;transform:rotateX(60deg) rotateZ(var(--rot,0deg));animation:arrowFloat 1.5s infinite alternate}
        .holo-svg{width:100px;height:auto;filter:drop-shadow(0 0 25px ${ac.glow})}
        @keyframes arrowFloat{0%{transform:rotateX(60deg) rotateZ(var(--rot,0deg)) translateZ(0)}100%{transform:rotateX(60deg) rotateZ(var(--rot,0deg)) translateZ(35px)}}
        .road-sign{position:absolute;top:-24px;left:50%;transform:translateX(-50%);background:#0066cc;border:2px solid #fff;border-radius:8px;padding:4px 12px;text-align:center;box-shadow:0 4px 10px rgba(0,0,0,.5);z-index:10;white-space:nowrap}
        .road-sign .num{font-size:16px;font-weight:900;color:#fff;background:#0055aa;display:inline-block;padding:2px 6px;border-radius:4px;margin-bottom:2px}
        .road-sign .dest{font-size:11px;font-weight:800;color:#fff}
        .road-sign .action{font-size:9px;color:#e0e0e0}
        .cpt-bottom{margin-top:auto;background:rgba(0,0,0,.55);backdrop-filter:blur(15px);border-radius:18px;padding:14px;border:1px solid rgba(255,215,0,.15);z-index:10}
        .cpt-stat{display:flex;justify-content:space-around;text-align:center;margin-bottom:10px}
        .cpt-stat div span:first-child{font-size:18px;font-weight:900;color:${tachoColor};display:block;text-shadow:0 0 12px ${tachoColor}66}
        .cpt-stat div span:last-child{font-size:9px;color:#7fa5b8;font-weight:800;text-transform:uppercase;letter-spacing:1px}
        .cpt-btn{width:100%;padding:14px;border:none;border-radius:12px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit;transition:.2s}
        .cpt-btn.start{background:linear-gradient(135deg,#4ade80,#22c55e);color:#000}
        .cpt-btn.stop{background:#ff5555;color:#fff}
        .weather-widget{position:absolute;z-index:100;background:rgba(10,15,25,.85);backdrop-filter:blur(15px);border:1px solid rgba(255,215,0,.3);border-radius:14px;padding:10px 14px;font-size:11px;font-weight:800;display:flex;align-items:center;gap:10px;cursor:move;box-shadow:0 6px 20px rgba(0,0,0,.6);user-select:none;touch-action:none}
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
          <button data-nav="restaurant" class="cpt-navbtn">🍴</button>
          <button data-nav="settings" class="cpt-navbtn">⚙️</button>
        </div>
      </div>`;
      if(weatherData){
        html += `<div id="weatherWidget" class="weather-widget" style="left:${weatherPos.x}px;top:${weatherPos.y}px">
          <span style="font-size:20px">${weatherData.icon}</span>
          <div><div>${weatherData.city||'Ort'} ${weatherData.temp}°C</div>
          <div style="font-size:9px;color:#aaa">${weatherData.desc} · ${weatherData.pressure} hPa</div></div>
        </div>`;
      }
      if(nextEvent && nextEvent.type==="nav"){
        var arrowAngle = nextEvent.modifier && nextEvent.modifier.indexOf('left')>=0?-45:(nextEvent.modifier && nextEvent.modifier.indexOf('right')>=0?45:0);
        var roadName = nextEvent.instruction||"Straße";
        var roadNum="",roadDest=roadName;
        if(roadName.match(/^[AB]\d+/)){ roadNum=roadName.split(" ")[0]; roadDest=roadName.substring(roadName.indexOf(" ")+1)||""; }
        html += `<div style="margin-top:8px;padding:10px;background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.3);border-radius:12px;display:flex;justify-content:space-between;align-items:center;z-index:10">
          <div><div style="font-size:10px;color:#7fa5b8">ROUTE AKTIV</div><div style="font-size:13px;font-weight:900;color:#fff">${_esc(routeData.targetName)}</div></div>
          <div style="text-align:right"><div style="font-size:10px;color:#7fa5b8">ANKUNFT</div><div style="font-size:14px;font-weight:900;color:${tachoColor}">${etaStr} (${remTimeStr})</div></div>
        </div>`;
        html += `<div class="holo-container">
          <div class="road-sign">${roadNum?`<div class="num">${roadNum}</div>`:''}<div class="dest">${_esc(roadDest)}</div><div class="action">in ${fmtDist(nextEvent.distance)}</div></div>
          <div class="holo-base"></div>
          <div class="holo-arrow-box" style="--rot:${arrowAngle}deg">
            <svg class="holo-svg" viewBox="0 0 100 100">
              <defs><linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${isGold?'#ffe85e':ac.fill}"/><stop offset="50%" stop-color="${ac.fill}"/><stop offset="100%" stop-color="${isGold?'#ffb300':ac.fill}"/></linearGradient></defs>
              <polygon points="50,5 90,50 65,50 65,95 35,95 35,50 10,50" fill="url(#ag1)" stroke="#fff" stroke-width="2"/>
            </svg>
          </div>
        </div>`;
      } else {
        html += `<div class="holo-container" style="height:90px;margin-top:10px">
          <div class="holo-base"></div>
          <div class="holo-arrow-box" style="--rot:0deg">
            <svg class="holo-svg" viewBox="0 0 100 100" style="width:65px">
              <defs><linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${isGold?'#ffe85e':ac.fill}"/><stop offset="50%" stop-color="${ac.fill}"/><stop offset="100%" stop-color="${isGold?'#ffb300':ac.fill}"/></linearGradient></defs>
              <polygon points="50,5 90,50 65,50 65,95 35,95 35,50 10,50" fill="url(#ag2)" stroke="#fff" stroke-width="2"/>
            </svg>
          </div>
        </div>`;
      }
      html += `<div class="cpt-tacho" data-open-settings="1">
        ${currentLimit!==null?`<div class="cpt-limit"><div class="cpt-limit-num">${currentLimit===0?"∞":currentLimit}</div></div>`:''}
        <div class="tacho-bg"></div>
        <svg viewBox="0 0 200 200" style="position:absolute;inset:0;width:100%;height:100%">
          <path d="M 39.3 156 A 75 75 0 1 1 160.7 156" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="8"/>
          <path d="M 39.3 156 A 75 75 0 1 1 160.7 156" fill="none" stroke="${tachoColor}" stroke-width="8" stroke-linecap="round" stroke-dasharray="353" stroke-dashoffset="${353-(Math.min(speed,maxSpeed)/maxSpeed*353)}" style="transition:stroke-dashoffset .2s;filter:drop-shadow(0 0 6px ${tachoColor})"/>
          ${ticks}
        </svg>
        <div class="needle-container"><div class="needle"></div></div>
        <div class="needle-center"></div>
        <div class="inner-display">
          <div class="spd">${speed}</div>
          <div class="unit">KM/H</div>
          <div class="divider"></div>
          ${nearestWarning?`<div class="wrn" style="color:${nearestWarning.color}">${nearestWarning.icon} in ${fmtDist(nearestWarning.dist)}</div>`:`<div class="wrn" style="color:#7fa5b8">Bereit</div>`}
          <div class="hint">⚙️ TIPPEN = EINSTELLUNGEN</div>
        </div>
      </div>`;
      var elapsedMin = trip.active?Math.floor((Date.now()-trip.startTime)/60000):0;
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
      var isDragging=false,startX,startY,startLeft,startTop;
      w.addEventListener("pointerdown", function(e){ isDragging=true; startX=e.clientX; startY=e.clientY;
        startLeft=parseInt(w.style.left)||20; startTop=parseInt(w.style.top)||60; w.setPointerCapture(e.pointerId); });
      w.addEventListener("pointermove", function(e){ if(!isDragging) return;
        var dx=e.clientX-startX,dy=e.clientY-startY;
        var nl=Math.max(0,Math.min(window.innerWidth-150,startLeft+dx));
        var nt=Math.max(0,Math.min(window.innerHeight-80,startTop+dy));
        w.style.left=nl+"px"; w.style.top=nt+"px"; weatherPos={x:nl,y:nt}; });
      w.addEventListener("pointerup", function(e){ isDragging=false;
        try{ w.releasePointerCapture(e.pointerId); }catch(err){} store.set("weatherPos",weatherPos); });
    }

    function getNearestWarning(){
      if(!lastPos) return null;
      var lat=lastPos.coords.latitude,lng=lastPos.coords.longitude;
      var minDist=Infinity,nearest=null;
      getWarnings().forEach(function(w){ var d=haversine(lat,lng,w.lat,w.lng); if(d<minDist){ minDist=d; nearest=w; } });
      if(nearest && minDist<10000){ var cat=getCat(nearest.cat); return {icon:cat.icon,color:cat.color,dist:minDist}; }
      return null;
    }

    // ═══════════ SETTINGS ═══════════
    function backBtn(target){ return `<button data-nav="${target||'cockpit'}" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>`; }
    function screenSettingsMenu(){
      var s = getSettings();
      var html = backBtn('cockpit');
      html += `<div class="card"><h3 style="display:flex;align-items:center;gap:10px">${appIconSVG(32)} Einstellungen</h3>
        <div style="display:grid;gap:6px;margin-top:8px">
          <button data-nav="settings_display" class="menu-btn">🎨 Display & Tacho</button>
          <button data-nav="settings_sounds" class="menu-btn">🎵 Töne & Stimmen</button>
          <button data-nav="settings_welcome" class="menu-btn">🦚 Willkommens-Animation</button>
          <button data-nav="settings_voice" class="menu-btn">🎙️ HalDoVoice (eigene Stimme)</button>
          <button data-nav="settings_nav" class="menu-btn">🗺️ Navigation</button>
          <button data-nav="settings_lang" class="menu-btn">🌍 Sprache</button>
          <button data-nav="settings_bt" class="menu-btn">📡 Bluetooth ${s.btDeviceName?`<span style="color:#4ade80">(✓ ${_esc(s.btDeviceName)})</span>`:''}</button>
          <button data-nav="settings_flash" class="menu-btn">💡 Taschenlampe & Warnung</button>
          <button data-nav="settings_about" class="menu-btn">ℹ️ Über HalDo Blitzer</button>
        </div>
      </div>`;
      html += `<style>.menu-btn{width:100%;padding:14px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:13px;font-weight:800;text-align:left;cursor:pointer;font-family:inherit;display:flex;justify-content:space-between;align-items:center;transition:.15s}.menu-btn:hover{background:rgba(255,215,0,.12);border-color:#ffd700}</style>`;
      container.innerHTML = html; bindNav();
    }

    // ═══════════ WELCOME CUSTOMIZER ═══════════
    function screenSettingsWelcome(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>🦚 Willkommens-Animation</h3>
        <div class="field"><label>Farb-Theme</label>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px">
            ${Object.keys(WELCOME_THEMES).map(function(k){
              var t = WELCOME_THEMES[k];
              return `<button data-theme="${k}" style="height:42px;background:linear-gradient(135deg,${t.accent},${t.sun4});border:3px solid ${s.welcomeTheme===k?'#fff':'transparent'};border-radius:8px;cursor:pointer;box-shadow:0 0 12px ${t.accent}88" title="${t.name}">${s.welcomeTheme===k?'✓':''}</button>`;
            }).join("")}
          </div>
        </div>
        <div class="field" style="margin-top:12px"><label>Geschwindigkeit</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px">
            ${[['slow','🐢 Langsam'],['normal','⚡ Normal'],['fast','🚀 Schnell']].map(function(x){
              return `<button data-speed="${x[0]}" style="padding:10px;background:${s.welcomeSpeed===x[0]?'rgba(255,215,0,.25)':'rgba(0,0,0,.3)'};border:1px solid ${s.welcomeSpeed===x[0]?'#ffd700':'#555'};color:${s.welcomeSpeed===x[0]?'#ffd700':'#ccc'};border-radius:8px;font-weight:900;font-size:11px;cursor:pointer;font-family:inherit">${x[1]}</button>`;
            }).join("")}
          </div>
        </div>
        <div class="field" style="margin-top:12px"><label>Dauer der Animation</label>
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px">
            ${[['short','⏱️ Kurz (2s)'],['normal','⏱️ Mittel (4s)'],['long','⏱️ Lang (6s)']].map(function(x){
              return `<button data-duration="${x[0]}" style="padding:10px;background:${s.welcomeDuration===x[0]?'rgba(255,215,0,.25)':'rgba(0,0,0,.3)'};border:1px solid ${s.welcomeDuration===x[0]?'#ffd700':'#555'};color:${s.welcomeDuration===x[0]?'#ffd700':'#ccc'};border-radius:8px;font-weight:900;font-size:11px;cursor:pointer;font-family:inherit">${x[1]}</button>`;
            }).join("")}
          </div>
        </div>
        <div class="field" style="margin-top:12px"><label>Boot-Log-Screen</label>
          <button id="toggleBootLog" style="width:100%;padding:12px;background:${s.showBootLog?'rgba(74,222,128,.2)':'rgba(255,85,85,.2)'};border:1px solid ${s.showBootLog?'#4ade80':'#ff5555'};color:${s.showBootLog?'#4ade80':'#ff5555'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">${s.showBootLog?'✅ Boot-Log AN':'❌ Boot-Log AUS'}</button>
        </div>
        <button id="previewWelcome" style="width:100%;padding:14px;margin-top:12px;background:linear-gradient(135deg,#ffd700,#ff9800);border:none;color:#000;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit">🎬 Vorschau ansehen</button>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelectorAll("[data-theme]").forEach(function(el){
        el.addEventListener("click", function(){ s.welcomeTheme=el.dataset.theme; saveSettings(s); screenSettingsWelcome(); });
      });
      container.querySelectorAll("[data-speed]").forEach(function(el){
        el.addEventListener("click", function(){ s.welcomeSpeed=el.dataset.speed; saveSettings(s); screenSettingsWelcome(); });
      });
      container.querySelectorAll("[data-duration]").forEach(function(el){
        el.addEventListener("click", function(){ s.welcomeDuration=el.dataset.duration; saveSettings(s); screenSettingsWelcome(); });
      });
      container.querySelector("#toggleBootLog").addEventListener("click", function(){ s.showBootLog=!s.showBootLog; saveSettings(s); screenSettingsWelcome(); });
      container.querySelector("#previewWelcome").addEventListener("click", function(){ view.screen="splash"; build(); });
    }

    function screenSettingsDisplay(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>🎨 Tacho-Design</h3>
        <div class="field"><label>Tacho-Farbe</label>
          <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin-top:6px">
            ${['#ffd700','#4dd0e1','#ff5555','#4ade80','#b478ff','#ff8844'].map(function(c){
              return `<button data-color="${c}" style="height:38px;background:${c};border:3px solid ${s.tachoColor===c?'#fff':'transparent'};border-radius:8px;cursor:pointer;box-shadow:0 0 12px ${c}88"></button>`;
            }).join("")}
          </div>
        </div>
        <div class="field" style="margin-top:12px"><label>Pfeil-Farbe (${ARROW_COLORS[s.arrowColor]?ARROW_COLORS[s.arrowColor].name:'24K Gold'})</label>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:6px">
            ${Object.keys(ARROW_COLORS).map(function(k){ var a=ARROW_COLORS[k];
              return `<button data-arrow="${k}" style="height:42px;background:linear-gradient(135deg,${a.fill},${a.fill}cc);border:3px solid ${s.arrowColor===k?'#fff':'transparent'};border-radius:8px;cursor:pointer;box-shadow:0 0 12px ${a.glow}" title="${a.name}"></button>`;
            }).join("")}
          </div>
        </div>
        <div class="field" style="margin-top:12px"><label>Alarm-Dauer: <span id="durLbl">${s.alarmDuration}s</span></label>
          <input type="range" id="setDuration" min="2" max="15" step="1" value="${s.alarmDuration}" style="width:100%">
        </div>
        <div class="field" style="margin-top:12px"><label>Offline Modus</label>
          <button id="toggleOffline" style="width:100%;padding:10px;background:${s.offlineMode?'rgba(255,128,128,.2)':'rgba(74,222,128,.2)'};border:1px solid ${s.offlineMode?'#ff8080':'#4ade80'};color:${s.offlineMode?'#ff8080':'#4ade80'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">${s.offlineMode?'Offline (Karten aus)':'Online (Karten aktiv)'}</button>
        </div>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#setDuration").addEventListener("input", function(e){ s.alarmDuration=parseInt(e.target.value); container.querySelector("#durLbl").textContent=s.alarmDuration+"s"; saveSettings(s); });
      container.querySelectorAll("[data-color]").forEach(function(el){ el.addEventListener("click", function(){ s.tachoColor=el.dataset.color; saveSettings(s); screenSettingsDisplay(); }); });
      container.querySelectorAll("[data-arrow]").forEach(function(el){ el.addEventListener("click", function(){ s.arrowColor=el.dataset.arrow; saveSettings(s); screenSettingsDisplay(); }); });
      container.querySelector("#toggleOffline").addEventListener("click", function(){ s.offlineMode=!s.offlineMode; saveSettings(s); screenSettingsDisplay(); });
    }

    function screenSettingsSounds(){
      var s = getSettings();
      var soundOptions = [
        {id:"siren",name:"🚨 Sirene"},{id:"siren2",name:"🚨 Sirene 2"},{id:"siren3",name:"🚨 Sirene 3"},
        {id:"long_alarm",name:"🔔 Feueralarm"},{id:"long_alarm2",name:"🔔 Feuer 2"},
        {id:"radar",name:"📡 Radar"},{id:"radar2",name:"📡 Radar 2"},
        {id:"urgent",name:"⚠️ Dringend"},{id:"extreme",name:"🔥 Extrem"},
        {id:"police",name:"🚔 Polizei"},{id:"buzzer",name:"⚡ Buzzer"},{id:"horn",name:"📯 Hupe"},
        {id:"ping",name:"🔵 Ping"},{id:"sonar",name:"🌊 Sonar"},{id:"digital",name:"💻 Digital"},
        {id:"bell",name:"🔔 Glocke"},{id:"klaxon",name:"📢 Klaxon"},
        {id:"birds",name:"🐦 Vögel"},{id:"chime",name:"🎵 Glocke"},{id:"low",name:"🕊️ Sanft"}
      ];
      var html = backBtn('settings');
      html += `<div class="card"><h3>🎵 Globale Töne</h3>
        <div style="display:flex;gap:6px;margin-top:6px">
          <button id="muteAll" style="flex:1;padding:12px;background:${s.globalMute?'rgba(255,85,85,.2)':'rgba(74,222,128,.2)'};border:1px solid ${s.globalMute?'#ff5555':'#4ade80'};color:${s.globalMute?'#ff5555':'#4ade80'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">${s.globalMute?'🔇 ALLES STUMM':'🔊 TÖNE AN'}</button>
          <button id="toggleVoice" style="flex:1;padding:12px;background:${s.voiceOn?'rgba(255,215,0,.2)':'rgba(255,85,85,.2)'};border:1px solid ${s.voiceOn?'#ffd700':'#ff5555'};color:${s.voiceOn?'#ffd700':'#ff5555'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">${s.voiceOn?'🗣️ STIMME AN':'🔇 STIMME AUS'}</button>
        </div>
      </div>`;
      html += `<div class="card"><h3>🚨 20 Alarm-Töne</h3>`;
      CATS.forEach(function(c){
        var cur = s.sounds[c.id]||"chime";
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">
          <span style="font-size:11px;font-weight:800;flex:1">${c.icon} ${_esc(c.name.de)}</span>
          <div style="display:flex;gap:4px">
            <select data-sound="${c.id}" style="background:rgba(0,0,0,.5);color:#fff;border:1px solid #444;border-radius:6px;padding:4px 6px;font-size:10px;font-family:inherit">
              ${soundOptions.map(function(o){return `<option value="${o.id}" ${cur===o.id?'selected':''}>${o.name}</option>`;}).join("")}
            </select>
            <button data-test="${c.id}" style="background:rgba(255,215,0,.15);border:1px solid rgba(255,215,0,.3);color:#ffd700;border-radius:6px;width:30px;cursor:pointer;font-size:12px">🔊</button>
          </div>
        </div>`;
      });
      html += `</div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#muteAll").addEventListener("click", function(){ s.globalMute=!s.globalMute; saveSettings(s); screenSettingsSounds(); });
      container.querySelector("#toggleVoice").addEventListener("click", function(){ s.voiceOn=!s.voiceOn; saveSettings(s); screenSettingsSounds(); });
      container.querySelectorAll("[data-sound]").forEach(function(el){ el.addEventListener("change", function(e){ s.sounds[el.dataset.sound]=e.target.value; saveSettings(s); }); });
      container.querySelectorAll("[data-test]").forEach(function(el){ el.addEventListener("click", function(){ playBeep(s.sounds[el.dataset.test]||"chime",0.8,s.alarmDuration); }); });
    }

    function screenSettingsVoice(){
      var s = getSettings();
      var cv = getCustomVoice();
      var html = backBtn('settings');
      html += `<div class="card"><h3>🎙️ HalDoVoice</h3>
        <p style="font-size:11px;color:#7fa5b8;margin-bottom:10px;line-height:1.6">Nimm deine <b>eigene Stimme</b> für jede Warnung auf. 4 Sekunden Zeit zu sprechen.<br>Beispiel: "Achtung, Blitzer voraus!"</p>
        <div style="padding:10px;background:rgba(255,215,0,.08);border:1px solid rgba(255,215,0,.3);border-radius:8px;margin-bottom:12px">
          <button id="toggleCustomVoice" style="width:100%;padding:10px;background:${s.useCustomVoice?'rgba(255,215,0,.25)':'rgba(0,0,0,.3)'};border:1px solid ${s.useCustomVoice?'#ffd700':'#555'};color:${s.useCustomVoice?'#ffd700':'#aaa'};border-radius:8px;font-weight:900;font-size:13px;cursor:pointer;font-family:inherit">
            ${s.useCustomVoice?'🎙️ HalDoVoice AKTIV':'🔇 HalDoVoice INAKTIV (nutzt TTS)'}
          </button>
        </div>
        <div style="max-height:400px;overflow-y:auto">`;
      CATS.forEach(function(c){
        var hasVoice = !!cv[c.id];
        html += `<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:6px;border-left:3px solid ${c.color}">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <span style="font-size:12px;font-weight:800">${c.icon} ${_esc(c.name.de)}</span>
            <div style="display:flex;gap:4px">
              ${hasVoice?`<button data-playvoice="${c.id}" style="background:rgba(74,222,128,.2);border:1px solid #4ade80;color:#4ade80;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer">▶️</button>
              <button data-delvoice="${c.id}" style="background:rgba(255,85,85,.2);border:1px solid #ff5555;color:#ff5555;border-radius:6px;padding:6px 10px;font-size:12px;cursor:pointer">🗑️</button>`:''}
              <button data-recvoice="${c.id}" style="background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;border-radius:6px;padding:6px 12px;font-size:12px;cursor:pointer;font-weight:900">🎙️ Aufnehmen</button>
            </div>
          </div>
          <div id="recStatus_${c.id}" style="font-size:10px;color:#7fa5b8;margin-top:4px">${hasVoice?'✅ Eigene Stimme vorhanden':'❌ Keine eigene Stimme'}</div>
        </div>`;
      });
      html += `</div></div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#toggleCustomVoice").addEventListener("click", function(){ s.useCustomVoice=!s.useCustomVoice; saveSettings(s); screenSettingsVoice(); });
      container.querySelectorAll("[data-recvoice]").forEach(function(el){ el.addEventListener("click", function(){ startVoiceRecording(el.dataset.recvoice); }); });
      container.querySelectorAll("[data-playvoice]").forEach(function(el){ el.addEventListener("click", function(){ var cv=getCustomVoice(); if(cv[el.dataset.playvoice]) new Audio(cv[el.dataset.playvoice]).play().catch(function(){}); }); });
      container.querySelectorAll("[data-delvoice]").forEach(function(el){ el.addEventListener("click", function(){ if(!confirm("Stimme löschen?")) return; var cv=getCustomVoice(); delete cv[el.dataset.delvoice]; saveCustomVoice(cv); screenSettingsVoice(); }); });
    }
    async function startVoiceRecording(catId){
      var status = document.getElementById("recStatus_"+catId);
      try {
        if(!navigator.mediaDevices || !window.MediaRecorder) throw new Error("MediaRecorder nicht verfügbar");
        var stream = await navigator.mediaDevices.getUserMedia({audio:true});
        voiceChunks=[];
        var mimeType = MediaRecorder.isTypeSupported("audio/webm")?"audio/webm":(MediaRecorder.isTypeSupported("audio/mp4")?"audio/mp4":"");
        voiceRecorder = mimeType ? new MediaRecorder(stream,{mimeType:mimeType}) : new MediaRecorder(stream);
        voiceRecorder.ondataavailable = function(e){ if(e.data.size>0) voiceChunks.push(e.data); };
        voiceRecorder.onstop = function(){
          var blob = new Blob(voiceChunks,{type:voiceRecorder.mimeType||"audio/webm"});
          var reader = new FileReader();
          reader.onload = function(){ var cv=getCustomVoice(); cv[catId]=reader.result; saveCustomVoice(cv); stream.getTracks().forEach(function(t){t.stop();}); if(status) status.textContent="✅ Stimme gespeichert!"; setTimeout(function(){ screenSettingsVoice(); },800); };
          reader.readAsDataURL(blob);
        };
        voiceRecorder.start();
        if(status) status.textContent = "🔴 Aufnahme läuft... sprich jetzt! (4s)";
        setTimeout(function(){ if(voiceRecorder && voiceRecorder.state==="recording") voiceRecorder.stop(); }, 4000);
      } catch(e){ if(status) status.textContent = "❌ Fehler: "+e.message; }
    }

    function screenSettingsNav(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>🗺️ Navigation</h3>
        <div class="field"><label>Sprach-Navi</label>
          <button id="toggleNavVoice" style="width:100%;padding:12px;background:${s.navVoiceOn?'rgba(74,222,128,.2)':'rgba(255,85,85,.2)'};border:1px solid ${s.navVoiceOn?'#4ade80':'#ff5555'};color:${s.navVoiceOn?'#4ade80':'#ff5555'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">${s.navVoiceOn?'🗣️ ANSAGEN AN':'🔇 ANSAGEN AUS'}</button>
        </div>
        <div class="field" style="margin-top:10px"><label>Warn-Distanz: <span id="wdLbl">${s.warnDist}m</span></label>
          <input type="range" id="warnDistRange" min="200" max="2000" step="100" value="${s.warnDist}" style="width:100%">
        </div>
        <div class="field" style="margin-top:10px"><label>Push-Nachrichten</label>
          <button id="toggleNotify" style="width:100%;padding:12px;background:${s.notifyOn?'rgba(74,222,128,.2)':'rgba(255,85,85,.2)'};border:1px solid ${s.notifyOn?'#4ade80':'#ff5555'};color:${s.notifyOn?'#4ade80':'#ff5555'};border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">${s.notifyOn?'🔔 PUSH AN':'🔕 PUSH AUS'}</button>
          <div style="font-size:10px;color:#7fa5b8;margin-top:6px">Funktioniert auf allen Geräten via Service Worker.</div>
        </div>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#toggleNavVoice").addEventListener("click", function(){ s.navVoiceOn=!s.navVoiceOn; saveSettings(s); screenSettingsNav(); });
      container.querySelector("#toggleNotify").addEventListener("click", function(){
        s.notifyOn=!s.notifyOn; saveSettings(s);
        if(s.notifyOn){ if("Notification" in window && Notification.permission==="default") Notification.requestPermission(); registerServiceWorker(); }
        screenSettingsNav();
      });
      container.querySelector("#warnDistRange").addEventListener("input", function(e){ s.warnDist=parseInt(e.target.value); container.querySelector("#wdLbl").textContent=s.warnDist+"m"; saveSettings(s); });
    }

    function screenSettingsLang(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>🌍 Sprache</h3>
        <select id="setLang" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid #444;border-radius:8px;color:#fff;font-size:14px">
        ${Object.keys(LANGS).map(function(k){ return `<option value="${k}" ${s.lang===k?"selected":""}>${LANGS[k].name}</option>`; }).join("")}
        </select>
        <button id="testLang" style="width:100%;padding:12px;margin-top:10px;background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">🔊 Test-Sprache</button>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#setLang").addEventListener("change", function(e){ s.lang=e.target.value; saveSettings(s); });
      container.querySelector("#testLang").addEventListener("click", function(){
        if(!window.speechSynthesis) return;
        var msg={de:"Hallo, ich bin HalDo Blitzer",en:"Hello, I am HalDo Blitzer",tr:"Merhaba, ben HalDo Blitzer",ar:"مرحبا، أنا هالدو بليتزر",ku:"Silav, ez HalDo Blitzer im",fr:"Bonjour, je suis HalDo Blitzer",es:"Hola, soy HalDo Blitzer",it:"Ciao, sono HalDo Blitzer",ru:"Привет, я HalDo Blitzer"}[s.lang];
        var u = new SpeechSynthesisUtterance(msg); u.lang = LANGS[s.lang].code;
        window.speechSynthesis.cancel(); window.speechSynthesis.speak(u);
      });
    }

    function screenSettingsBT(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>📡 Bluetooth</h3>
        <div style="font-size:11px;color:#7fa5b8;margin-bottom:10px">Verbinde mit Auto, Lautsprecher, Headset. (Chrome/Edge)</div>
        <button id="btScan" style="width:100%;padding:14px;background:linear-gradient(135deg,#ffd700,#ff9800);border:none;color:#000;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit">🔍 Gerät suchen</button>
        <div id="btStatus" style="margin-top:12px;padding:10px;background:rgba(0,0,0,.3);border-radius:8px;font-size:12px;color:#7fa5b8">${s.btDeviceName?`✅ Verbunden: ${_esc(s.btDeviceName)}`:'❌ Nicht verbunden'}</div>
        ${s.btDeviceName?`<button id="btDisconnect" style="width:100%;padding:12px;margin-top:8px;background:rgba(255,85,85,.2);border:1px solid #ff5555;color:#ff5555;border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">🔌 Trennen</button>`:''}
      </div>`;
      container.innerHTML = html; bindNav();
      var btn = container.querySelector("#btScan");
      if(btn) btn.addEventListener("click", async function(){
        var status = container.querySelector("#btStatus");
        status.textContent = "🔍 Suche...";
        try {
          if(!navigator.bluetooth) throw new Error("Web Bluetooth nicht verfügbar");
          var device = await navigator.bluetooth.requestDevice({acceptAllDevices:true});
          btServer = await device.gatt.connect(); btDevice = device;
          s.btDeviceName = device.name || "Bluetooth-Gerät"; saveSettings(s);
          status.textContent = "✅ "+s.btDeviceName;
          if(HalDo.Notify) HalDo.Notify.success("Verbunden: "+s.btDeviceName);
          screenSettingsBT();
        } catch(e){ status.textContent = "❌ "+e.message; }
      });
      var disc = container.querySelector("#btDisconnect");
      if(disc) disc.addEventListener("click", function(){ if(btServer){ try{ btServer.disconnect(); }catch(e){} } btServer=null; btDevice=null; s.btDeviceName=null; saveSettings(s); screenSettingsBT(); });
    }

    function screenSettingsFlash(){
      var s = getSettings();
      var html = backBtn('settings');
      html += `<div class="card"><h3>💡 Taschenlampe</h3>
        <div style="font-size:11px;color:#7fa5b8;margin-bottom:10px">Blinkt bei jeder Warnung.</div>
        <button id="toggleFlash" style="width:100%;padding:14px;background:${s.flashOnWarning?'rgba(255,215,0,.2)':'rgba(255,255,255,.05)'};border:1px solid ${s.flashOnWarning?'#ffd700':'#555'};color:${s.flashOnWarning?'#ffd700':'#fff'};border-radius:10px;font-weight:900;font-size:14px;cursor:pointer;font-family:inherit">${s.flashOnWarning?'💡 BLINKEN AN':'💡 BLINKEN AUS'}</button>
        <button id="testFlash" style="width:100%;padding:12px;margin-top:10px;background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;border-radius:8px;font-weight:900;font-size:12px;cursor:pointer;font-family:inherit">🔦 Test (3x blinken)</button>
      </div>`;
      container.innerHTML = html; bindNav();
      container.querySelector("#toggleFlash").addEventListener("click", function(){ s.flashOnWarning=!s.flashOnWarning; saveSettings(s); screenSettingsFlash(); });
      container.querySelector("#testFlash").addEventListener("click", function(){ blinkTorch(3); });
    }

    function screenSettingsAbout(){
      var peacock = buildPeacockSVG(140,"about");
      var html = backBtn('settings');
      html += `<div class="card" style="text-align:center">
        <div style="margin:8px 0">${peacock}</div>
        <div style="margin:6px 0">${appIconSVG(64)}</div>
        <h3 style="margin:6px 0">HalDo Blitzer</h3>
        <div style="font-size:12px;color:#ffd700;margin-top:4px;font-weight:800">Version 16.0 · Peacock Deluxe</div>
        <div style="font-size:11px;color:#7fa5b8;margin-top:14px;line-height:1.8">
          ⚠️ Blitzer-Warnungen<br>🦚 Realistischer Pfau<br>🥇 24 Karat Gold<br>🎙️ HalDoVoice<br>🗣️ Sprach-Navi<br>📡 Bluetooth<br>⛽ Tankstellen · 🍴 Restaurants<br>💡 Taschenlampe<br>🌍 9 Sprachen · 20 Töne<br>🎬 Custom Welcome-Animation
        </div>
        <div style="font-size:11px;color:#ffd700;margin-top:20px;font-weight:900">von Halil Donma</div>
        <div style="font-size:10px;color:#5a7a8a;margin-top:6px">Made with ❤️ for the Ezidi Community</div>
      </div>`;
      container.innerHTML = html; bindNav();
    }

    // ═══════════ WEATHER ═══════════
    function fetchWeather(){
      if(!lastPos || getSettings().offlineMode) return;
      fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lastPos.coords.latitude}&longitude=${lastPos.coords.longitude}&current_weather=true&hourly=surface_pressure`)
        .then(r=>r.json()).then(function(data){
          if(data.current_weather){
            var temp=Math.round(data.current_weather.temperature),code=data.current_weather.weathercode;
            var pressure=data.hourly && data.hourly.surface_pressure?Math.round(data.hourly.surface_pressure[0]):"—";
            var icon="☀️",desc="Klar";
            if(code>0&&code<4){icon="🌤️";desc="Wolkig";}
            if(code>=4&&code<70){icon="☁️";desc="Bedeckt";}
            if(code>=70&&code<80){icon="🌧️";desc="Regen";}
            if(code>=80){icon="⛈️";desc="Gewitter";}
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lastPos.coords.latitude}&lon=${lastPos.coords.longitude}`)
              .then(r=>r.json()).then(function(geo){
                var city = geo.address?(geo.address.city||geo.address.town||geo.address.village||geo.address.county):"Unbekannt";
                weatherData = {temp,icon,desc,pressure,city};
                if(view.screen==="cockpit") build();
              }).catch(function(){ weatherData={temp,icon,desc,pressure,city:"Ort"}; if(view.screen==="cockpit") build(); });
          }
        }).catch(function(){});
    }

    // ═══════════ PUSH ═══════════
    async function sendPushNotification(cat, dist){
      var s = getSettings();
      if(!s.notifyOn) return;
      if(!("Notification" in window)) return;
      if(Notification.permission==="default") await Notification.requestPermission();
      if(Notification.permission!=="granted") return;
      try {
        if(swRegistration && swRegistration.active){
          swRegistration.active.postMessage({title:"HalDo Blitzer: "+cat.name.de, body:"Achtung! In "+fmtDist(dist)+".", icon:LOGO_URL});
        }
        new Notification("HalDo Blitzer: "+cat.name.de,{body:"Achtung! In "+fmtDist(dist)+".",icon:LOGO_URL,badge:LOGO_URL});
      } catch(e){}
    }

    // ═══════════ TRIGGERS ═══════════
    function checkTriggers(pos){
      var s = getSettings(),lat=pos.coords.latitude,lng=pos.coords.longitude;
      var zones=[2000,1000,500,200];
      getWarnings().forEach(function(w){
        if(!s.enabled[w.cat]) return;
        var d=haversine(lat,lng,w.lat,w.lng),cat=getCat(w.cat); if(!cat) return;
        for(var i=0;i<zones.length;i++){
          var key=w.id+"_z"+i;
          if(d<=zones[i] && !triggered[key]){
            triggered[key]=true;
            speakAlert(cat,d,s);
            sendPushNotification(cat,d);
            if(s.flashOnWarning) blinkTorch(3);
            trip.warnings++;
            var wn=container.querySelector("#tripWarn"); if(wn) wn.textContent=trip.warnings;
            break;
          }
        }
      });
    }
    function speakAlert(cat,dist,settings){
      if(settings.globalMute) return;
      var cv = getCustomVoice();
      if(settings.useCustomVoice && cv[cat.id]){
        try{ new Audio(cv[cat.id]).play().catch(function(){}); }catch(e){}
        if(navigator.vibrate) navigator.vibrate([200,100,200]);
        return;
      }
      if(settings.beepOn) playBeep(settings.sounds[cat.id]||"chime",0.9,settings.alarmDuration);
      if(settings.voiceOn && window.speechSynthesis){
        var txt = (cat.voice[settings.lang]||cat.voice.de).replace("{d}",fmtDist(dist));
        window.speechSynthesis.cancel();
        var u = new SpeechSynthesisUtterance(txt); u.lang = LANGS[settings.lang].code;
        window.speechSynthesis.speak(u);
      }
      if(navigator.vibrate) navigator.vibrate([200,100,200]);
    }

    // ═══════════ NAV VOICE ═══════════
    function speakNav(text){
      var s = getSettings();
      if(!s.navVoiceOn||s.globalMute) return;
      if(!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text); u.lang = LANGS[s.lang].code;
      window.speechSynthesis.speak(u);
    }
    function getTurnWord(mod,lang){
      mod = mod||"";
      var words = {
        de:{l:"links abbiegen",r:"rechts abbiegen",s:"geradeaus",u:"wenden",sl:"leicht links",sr:"leicht rechts",hl:"scharf links",hr:"scharf rechts"},
        en:{l:"turn left",r:"turn right",s:"straight",u:"u-turn",sl:"slight left",sr:"slight right",hl:"sharp left",hr:"sharp right"},
        tr:{l:"sola dön",r:"sağa dön",s:"düz git",u:"u dönüşü",sl:"hafif sol",sr:"hafif sağ",hl:"keskin sol",hr:"keskin sağ"},
        ar:{l:"انعطف يسارا",r:"انعطف يمينا",s:"استمر",u:"استدر",sl:"يسار قليلا",sr:"يمين قليلا",hl:"يسار حاد",hr:"يمين حاد"},
        ku:{l:"ber bi çepê ve bizivire",r:"ber bi rastê ve bizivire",s:"rasterast",u:"zivirîn",sl:"hinek çep",sr:"hinek rast",hl:"tûj çep",hr:"tûj rast"},
        fr:{l:"tourner à gauche",r:"tourner à droite",s:"tout droit",u:"demi-tour",sl:"légèrement à gauche",sr:"légèrement à droite",hl:"fortement à gauche",hr:"fortement à droite"},
        es:{l:"gira a la izquierda",r:"gira a la derecha",s:"recto",u:"da la vuelta",sl:"ligeramente izq",sr:"ligeramente der",hl:"giro brusco izq",hr:"giro brusco der"},
        it:{l:"gira a sinistra",r:"gira a destra",s:"dritto",u:"inverti marcia",sl:"leggermente sx",sr:"leggermente dx",hl:"bruscamente sx",hr:"bruscamente dx"},
        ru:{l:"поверните налево",r:"поверните направо",s:"прямо",u:"развернитесь",sl:"плавно налево",sr:"плавно направо",hl:"резко налево",hr:"резко направо"}
      };
      var d = words[lang]||words.de;
      if(mod.indexOf("left")>=0 && mod.indexOf("slight")>=0) return d.sl;
      if(mod.indexOf("right")>=0 && mod.indexOf("slight")>=0) return d.sr;
      if(mod.indexOf("left")>=0 && mod.indexOf("sharp")>=0) return d.hl;
      if(mod.indexOf("right")>=0 && mod.indexOf("sharp")>=0) return d.hr;
      if(mod.indexOf("left")>=0) return d.l;
      if(mod.indexOf("right")>=0) return d.r;
      if(mod.indexOf("uturn")>=0||mod.indexOf("u-turn")>=0) return d.u;
      return d.s;
    }
    function checkNavVoice(){
      if(!routeData||!lastPos) return;
      var step = routeData.steps[routeData.currentStep];
      if(!step) return;
      var stepKey = routeData.currentStep+"_"+routeData.targetName;
      if(stepKey===lastSpokenStep) return;
      if(step.distance<300 && step.distance>50){
        if(lastSpokenDist!==stepKey+"_300"){
          lastSpokenDist = stepKey+"_300";
          var s = getSettings();
          var pre = {de:"In "+fmtDist(step.distance)+": ",en:"In "+fmtDist(step.distance)+": ",tr:fmtDist(step.distance)+" sonra: ",ar:"بعد "+fmtDist(step.distance)+": ",ku:"Piştî "+fmtDist(step.distance)+": ",fr:"Dans "+fmtDist(step.distance)+": ",es:"En "+fmtDist(step.distance)+": ",it:"Tra "+fmtDist(step.distance)+": ",ru:"Через "+fmtDist(step.distance)+": "}[s.lang]||"";
          speakNav(pre + getTurnWord(step.maneuver.modifier, s.lang));
        }
      }
      if(step.distance<50){
        lastSpokenStep = stepKey;
        speakNav(getTurnWord(step.maneuver.modifier, getSettings().lang));
        routeData.currentStep++;
      }
    }

    // ═══════════ SPEED LIMIT ═══════════
    function fetchSpeedLimitIfNeeded(){
      if(!lastPos||getSettings().offlineMode) return;
      var now = Date.now();
      if(now-lastLimitFetch<15000) return;
      lastLimitFetch = now;
      var lat=lastPos.coords.latitude,lng=lastPos.coords.longitude;
      fetch("https://overpass-api.de/api/interpreter?data="+encodeURIComponent(`[out:json];way(around:30,${lat},${lng})["highway"]["maxspeed"];out tags;`))
        .then(r=>r.json()).then(function(data){
          if(data.elements && data.elements.length>0){
            var ms = data.elements[0].tags.maxspeed;
            if(ms==="none"||ms==="signals"||ms==="DE:urban") currentLimit = ms==="DE:urban"?50:0;
            else { var num = parseInt(ms); currentLimit = isNaN(num)?null:num; }
          } else currentLimit = null;
          if(view.screen==="cockpit"){
            var el = container.querySelector(".cpt-limit");
            if(el){ el.style.display = currentLimit===null?"none":"flex"; el.innerHTML = `<div class="cpt-limit-num">${currentLimit===0?"∞":currentLimit}</div>`; }
          }
        }).catch(function(){});
    }

    // ═══════════ POIs ═══════════
    function fetchPOIsIfNeeded(){
      if(!lastPos||getSettings().offlineMode) return;
      var lat=lastPos.coords.latitude,lng=lastPos.coords.longitude;
      var s = getSettings();
      var enabled = CATS.filter(function(c){ return c.type==="poi" && s.enabled[c.id]; });
      if(!enabled.length) return;
      var filter = enabled.map(function(c){ return `node(around:3000,${lat},${lng})[${c.osm}];`; }).join("");
      fetch("https://overpass-api.de/api/interpreter?data="+encodeURIComponent(`[out:json];(${filter});out center 30;`))
        .then(r=>r.json()).then(function(data){
          if(!data.elements) return;
          data.elements.forEach(function(el){
            if(!poiCache[el.id]) poiCache[el.id] = {id:el.id,lat:el.lat,lng:el.lon,cat:guessCatFromTags(el.tags),tags:el.tags};
          });
        }).catch(function(){});
    }
    function guessCatFromTags(tags){
      if(!tags) return null;
      if(tags.amenity==="fuel") return "poi_fuel";
      if(tags.amenity==="restaurant") return "poi_rest";
      return null;
    }

    function screenFuel(){
      var s = getSettings();
      var html = backBtn('cockpit') + `<div class="card"><h3>⛽ Tankstellen</h3>`;
      if(!s.tankerApiKey){
        html += `<div style="padding:10px;background:rgba(255,215,0,.1);border:1px solid #ffd700;border-radius:8px;margin-bottom:10px;font-size:11px;color:#ffd700">💡 Für echte Preise: Tankerkönig API-Key. Kostenlos auf creativecommons.tankerkoenig.de</div>
        <div class="field"><label>API-Key</label>
          <input id="tankerKey" placeholder="API-Key..." value="${_esc(s.tankerApiKey)}" style="width:100%;padding:10px;background:rgba(0,0,0,.3);border:1px solid #444;border-radius:8px;color:#fff;font-size:12px">
          <button id="saveTanker" style="width:100%;padding:10px;margin-top:6px;background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;border-radius:8px;font-weight:900;cursor:pointer;font-family:inherit">💾 Speichern</button>
        </div>`;
      } else if(!lastPos){
        html += `<div style="text-align:center;color:#7fa5b8;padding:20px">GPS wird gesucht...</div>`;
      } else {
        html += `<button id="refreshFuel" style="width:100%;padding:10px;background:rgba(74,222,128,.2);border:1px solid #4ade80;color:#4ade80;border-radius:8px;font-weight:900;cursor:pointer;margin-bottom:10px;font-family:inherit">🔄 Aktualisieren</button><div id="fuelList">`;
        if(fuelStations.length===0) html += `<div style="text-align:center;color:#7fa5b8;padding:15px">Lade...</div>`;
        else fuelStations.forEach(function(st){
          var d = lastPos?haversine(lastPos.coords.latitude,lastPos.coords.longitude,st.lat,st.lng):0;
          html += `<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:6px;border-left:3px solid #66cc66">
            <div style="display:flex;justify-content:space-between"><div><div style="font-size:13px;font-weight:900">${_esc(st.name)}</div>
            <div style="font-size:10px;color:#7fa5b8">${_esc(st.street||'')} · ${fmtDist(d)}</div></div>
            <div style="text-align:right;font-size:11px">${st.e5?`<div>E5: <b style="color:#4dd0e1">${st.e5.toFixed(2)}€</b></div>`:''}${st.e10?`<div>E10: <b style="color:#4dd0e1">${st.e10.toFixed(2)}€</b></div>`:''}${st.diesel?`<div>Diesel: <b style="color:#ffd700">${st.diesel.toFixed(2)}€</b></div>`:''}</div></div>
          </div>`;
        });
        html += `</div>`; setTimeout(fetchFuelPrices, 100);
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
      if(!s.tankerApiKey||!lastPos) return;
      fetch(`https://creativecommons.tankerkoenig.de/json/list.php?lat=${lastPos.coords.latitude}&lng=${lastPos.coords.longitude}&rad=3&sort=dist&type=all&apikey=${s.tankerApiKey}`)
        .then(r=>r.json()).then(function(d){ if(d.ok) fuelStations=d.stations; if(view.screen==="fuel") screenFuel(); }).catch(function(){});
    }

    function screenRestaurants(){
      var html = backBtn('cockpit') + `<div class="card"><h3>🍴 Restaurants</h3><div style="font-size:11px;color:#7fa5b8;margin-bottom:8px">In deiner Nähe</div><div id="restList">`;
      var rest = Object.values(poiCache).filter(function(p){ return p.cat==="poi_rest"; });
      if(!rest.length) html += `<div style="text-align:center;color:#7fa5b8;padding:15px">Keine Restaurants. Warte auf GPS...</div>`;
      else rest.forEach(function(r){
        var d = lastPos?haversine(lastPos.coords.latitude,lastPos.coords.longitude,r.lat,r.lng):0;
        var name = r.tags&&r.tags.name?r.tags.name:"Restaurant";
        var cuisine = r.tags&&r.tags.cuisine?r.tags.cuisine.replace(/_/g," "):"";
        html += `<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:6px;border-left:3px solid #ff8844">
          <div style="font-size:13px;font-weight:900">🍴 ${_esc(name)}</div>
          <div style="font-size:10px;color:#7fa5b8">${cuisine?_esc(cuisine)+" · ":""}${fmtDist(d)}</div>
        </div>`;
      });
      html += `</div></div>`; container.innerHTML = html; bindNav();
    }

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
      var el = document.getElementById("blMap"); if(!el||!window.L) return; el.innerHTML="";
      var center = lastPos?[lastPos.coords.latitude,lastPos.coords.longitude]:[51.1657,10.4515];
      map = L.map(el,{zoomControl:false}).setView(center,14);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19}).addTo(map);
      updateMapMarkers();
    }
    function updateMapMarkers(){
      if(!map) return; mapMarkers.forEach(function(m){ map.removeLayer(m); }); mapMarkers=[];
      getWarnings().forEach(function(w){
        var cat = getCat(w.cat); if(!cat) return;
        var icon = L.divIcon({html:`<div style="background:${cat.color};border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff">${cat.icon}</div>`,className:"",iconSize:[32,32],iconAnchor:[16,16]});
        mapMarkers.push(L.marker([w.lat,w.lng],{icon:icon}).addTo(map));
      });
      if(lastPos){
        var uicon = L.divIcon({html:`<div style="background:#ffd700;border:3px solid #fff;border-radius:50%;width:20px;height:20px;box-shadow:0 0 20px #ffd700"></div>`,className:"",iconSize:[20,20],iconAnchor:[10,10]});
        mapMarkers.push(L.marker([lastPos.coords.latitude,lastPos.coords.longitude],{icon:uicon}).addTo(map));
        map.setView([lastPos.coords.latitude,lastPos.coords.longitude]);
      }
    }

    function screenList(){
      var warnings = getWarnings();
      var html = backBtn('cockpit') + `<div class="card"><h3>📋 Warnungen (${warnings.length})</h3>`;
      if(!warnings.length) html += `<div style="text-align:center;color:#7fa5b8;padding:20px;font-size:12px">Keine Warnungen.</div>`;
      else warnings.slice().reverse().forEach(function(w){
        var c = getCat(w.cat)||CATS[0];
        html += `<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid ${c.color}">
          <div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:900">${c.icon} ${_esc(c.name.de)}</div>
          <div style="font-size:10px;color:#7fa5b8">${w.lat.toFixed(4)}, ${w.lng.toFixed(4)}</div></div>
          <button data-del="${w.id}" style="background:rgba(255,128,128,.2);border:none;color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer">✕</button>
        </div>`;
      });
      html += `</div>`; container.innerHTML = html; bindNav();
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){ if(!confirm("Löschen?")) return; saveWarnings(getWarnings().filter(function(w){ return w.id!==el.dataset.del; })); screenList(); });
      });
    }

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
          warnings.push({id:"w"+Date.now(),cat:el.dataset.report,lat:lastPos.coords.latitude,lng:lastPos.coords.longitude,created:Date.now()});
          saveWarnings(warnings);
          if(HalDo.Notify) HalDo.Notify.success("Warnung gemeldet!");
          view.screen="cockpit"; build();
        });
      });
    }

    function screenNav(){
      var hist = store.get("navHistory",[]);
      var favs = store.get("navFavorites",[]);
      var html = backBtn('cockpit') + `<div class="card"><h3>🧭 Navigation</h3>
        <div class="field"><label>Straße + Hausnummer</label><input id="navStreet" placeholder="z.B. Hauptstraße 12" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px;margin-bottom:6px"></div>
        <div class="field"><label>PLZ + Stadt</label><input id="navCity" placeholder="z.B. 30159 Hannover" style="width:100%;padding:12px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:10px;color:#fff;font-size:14px"></div>
        <div style="display:flex;gap:6px;margin-top:8px">
          <button class="btn full" id="navGo" style="flex:1;padding:12px;background:linear-gradient(135deg,#ffd700,#ff9800);color:#000;font-weight:900;border:none;border-radius:10px;cursor:pointer;font-family:inherit">🔍 Route berechnen</button>
          <button id="navFav" style="padding:12px 16px;background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;border-radius:10px;font-size:18px;cursor:pointer">⭐</button>
        </div>
        ${routeData?`<div style="margin-top:14px;padding:12px;background:rgba(255,215,0,.1);border:1px solid rgba(255,215,0,.3);border-radius:10px">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div><div style="font-size:11px;color:#7fa5b8;font-weight:800">ROUTE AKTIV</div><div style="font-size:14px;font-weight:900;color:#ffd700;margin-top:4px">${fmtDist(routeData.totalDist)} · ${fmtTime(Math.round(routeData.totalTime))}</div></div>
            <button id="navClear" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;font-weight:800;font-family:inherit">Beenden</button>
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
        hist.unshift({addr:target,date:new Date().toLocaleString("de-DE")});
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
      container.querySelectorAll("[data-delfav]").forEach(function(el){ el.addEventListener("click", function(){ favs.splice(parseInt(el.dataset.delfav),1); store.set("navFavorites",favs); screenNav(); }); });
      container.querySelectorAll("[data-fav]").forEach(function(el){ el.addEventListener("click", function(){ container.querySelector("#navStreet").value=favs[parseInt(el.dataset.fav)].addr; }); });
      container.querySelectorAll("[data-hist]").forEach(function(el){ el.addEventListener("click", function(){ container.querySelector("#navStreet").value=el.dataset.hist; }); });
      var nc = container.querySelector("#navClear");
      if(nc) nc.addEventListener("click", function(){ routeData=null; screenNav(); });
    }
    function geocodeAndRoute(query){
      fetch("https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(query)+"&limit=1")
        .then(r=>r.json()).then(function(data){
          if(!data||!data.length){ alert("Ziel nicht gefunden"); return; }
          targetPos = {lat:parseFloat(data[0].lat),lng:parseFloat(data[0].lon)};
          var addr = data[0].display_name.split(",")[0];
          speakNav("Navigation gestartet. Ziel: "+addr+".");
          fetch(`https://router.project-osrm.org/route/v1/driving/${lastPos.coords.longitude},${lastPos.coords.latitude};${targetPos.lng},${targetPos.lat}?steps=true&geometries=geojson&overview=false`)
            .then(r=>r.json()).then(function(rdata){
              if(!rdata.routes||!rdata.routes.length){ alert("Route nicht gefunden"); return; }
              routeData = {totalDist:rdata.routes[0].distance,totalTime:rdata.routes[0].duration,steps:rdata.routes[0].legs[0].steps,currentStep:0,targetName:addr};
              lastSpokenStep=null; lastSpokenDist=null;
              if(HalDo.Notify) HalDo.Notify.success("Route: "+fmtDist(routeData.totalDist));
              view.screen="cockpit"; build();
            }).catch(function(e){ alert("Routing-Fehler: "+e.message); });
        }).catch(function(e){ alert("Geocoding-Fehler: "+e.message); });
    }

    function screenPark(){
      var now = Date.now();
      var remaining = parkEndTime>now?Math.floor((parkEndTime-now)/1000):0;
      var html = backBtn('cockpit') + `<div class="card" style="text-align:center"><h3>🅿️ Parkuhr</h3>
        <div style="font-size:56px;font-weight:900;color:${remaining>0?'#ffd700':'#ff5555'};margin:20px 0;text-shadow:0 0 20px ${remaining>0?'rgba(255,215,0,.5)':'rgba(255,85,85,.5)'}" id="parkTime">${fmtTime(remaining)}</div>
        ${remaining===0&&parkEndTime>0?'<div style="color:#ff5555;font-weight:900">⏰ Zeit abgelaufen!</div>':''}
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:20px">
          <button onclick="window._parkAdd(15)" style="background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;padding:12px;border-radius:8px;font-weight:900;cursor:pointer;font-family:inherit">+ 15 Min</button>
          <button onclick="window._parkAdd(30)" style="background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;padding:12px;border-radius:8px;font-weight:900;cursor:pointer;font-family:inherit">+ 30 Min</button>
          <button onclick="window._parkAdd(60)" style="background:rgba(255,215,0,.2);border:1px solid #ffd700;color:#ffd700;padding:12px;border-radius:8px;font-weight:900;cursor:pointer;font-family:inherit">+ 1 Std</button>
          <button onclick="window._parkStop()" style="background:rgba(255,85,85,.2);border:1px solid #ff5555;color:#ff5555;padding:12px;border-radius:8px;font-weight:900;cursor:pointer;font-family:inherit">⏹ Stopp</button>
        </div>
      </div>`;
      container.innerHTML = html; bindNav();
      window._parkAdd = function(mins){ parkEndTime = (parkEndTime>Date.now()?parkEndTime:Date.now())+mins*60000; if(parkTimer) clearInterval(parkTimer); parkTimer=setInterval(updateParkUI,1000); updateParkUI(); };
      window._parkStop = function(){ parkEndTime=0; if(parkTimer) clearInterval(parkTimer); updateParkUI(); };
      function updateParkUI(){
        var el = document.getElementById("parkTime"); if(!el) return;
        var rem = parkEndTime>Date.now()?Math.floor((parkEndTime-Date.now())/1000):0;
        el.textContent = fmtTime(rem);
        el.style.color = rem>0?'#ffd700':'#ff5555';
        if(rem===0 && parkEndTime>0){
          if(HalDo.Notify) HalDo.Notify.error("Parkzeit abgelaufen!");
          playBeep("urgent",1.0,5); parkEndTime = 0;
        }
      }
      if(parkTimer) clearInterval(parkTimer);
      if(parkEndTime>Date.now()) parkTimer = setInterval(updateParkUI,1000);
    }

    function screenVision(){
      var html = backBtn('cockpit') + `<div class="card"><h3>🤖 KI-Kamera</h3>
        <div style="position:relative;background:#000;border-radius:12px;overflow:hidden;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center">
          <video id="visionVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;display:none"></video>
          <canvas id="visionCanvas" style="position:absolute;top:0;left:0;width:100%;height:100%;display:none"></canvas>
          <div id="visionPlaceholder" style="color:#aaa;text-align:center;padding:20px"><div style="font-size:44px">📷</div><div style="font-size:11px;margin-top:8px">Kamera starten</div></div>
        </div>
        <button id="visionStart" style="width:100%;padding:14px;margin-top:10px;background:linear-gradient(135deg,#ffd700,#ff9800);color:#000;border:none;border-radius:10px;font-weight:900;cursor:pointer;font-family:inherit">📷 KI aktivieren</button>
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
        if(!window.tf||!window.cocoSsd){
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.2.0/dist/tf.min.js");
          await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js");
        }
        tfModel = await cocoSsd.load();
        cameraStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:false});
        var video = document.getElementById("visionVideo");
        video.srcObject = cameraStream; video.style.display = "block";
        document.getElementById("visionPlaceholder").style.display = "none";
        document.getElementById("visionCanvas").style.display = "block";
        document.getElementById("visionStart").textContent = "⏹ KI stoppen";
        status.textContent = "🟢 Live";
        runVisionLoop();
      } catch(e){ status.textContent = "❌ Fehler: "+e.message; }
    }
    function loadScript(src){ return new Promise(function(res,rej){ var s=document.createElement("script"); s.src=src; s.onload=res; s.onerror=rej; document.head.appendChild(s); }); }
    async function runVisionLoop(){
      if(!tfModel||!cameraStream) return;
      var video = document.getElementById("visionVideo"), canvas = document.getElementById("visionCanvas");
      if(!video||!canvas) return;
      var c2d = canvas.getContext("2d");
      canvas.width = video.videoWidth||640; canvas.height = video.videoHeight||480;
      async function detect(){
        if(!tfModel||!cameraStream) return;
        var preds = await tfModel.detect(video);
        c2d.clearRect(0,0,canvas.width,canvas.height);
        preds.forEach(function(p){
          if(p.class==="car"||p.class==="truck"||p.class==="person"||p.class==="bicycle"){
            var b = p.bbox;
            c2d.strokeStyle = p.class==="person"?"#ff5555":"#4dd0e1";
            c2d.lineWidth = 3; c2d.strokeRect(b[0],b[1],b[2],b[3]);
            c2d.fillStyle = c2d.strokeStyle;
            c2d.font = "16px sans-serif";
            c2d.fillText(p.class.toUpperCase()+" "+Math.round(p.score*100)+"%", b[0], b[1]>20?b[1]-5:b[1]+20);
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

    function getNextEvent(){
      if(routeData && routeData.steps){
        for(var i=routeData.currentStep;i<routeData.steps.length;i++){
          var st = routeData.steps[i];
          if(st.maneuver && st.maneuver.type!=="depart"){
            return {type:"nav",modifier:st.maneuver.modifier,instruction:st.name||st.maneuver.type,distance:st.distance};
          }
        }
      }
      return null;
    }

    function startGeo(){
      if(!navigator.geolocation) return;
      if(geoWatch) navigator.geolocation.clearWatch(geoWatch);
      geoWatch = navigator.geolocation.watchPosition(onPos, onErr, {enableHighAccuracy:true,maximumAge:3000,timeout:15000});
    }
    function onPos(pos){
      if(lastPos && trip.active){
        var d = haversine(lastPos.coords.latitude,lastPos.coords.longitude,pos.coords.latitude,pos.coords.longitude);
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
    function onErr(err){ console.warn('%c[Blitzer] GPS: '+err.message, 'color:#ff8844;font-weight:900;'); }

    function bindNav(){ container.querySelectorAll("[data-nav]").forEach(function(el){ el.addEventListener("click", function(){ view.screen=el.dataset.nav; build(); }); }); }
    function bindCockpit(){
      var tb = container.querySelector("[data-trip]");
      if(tb) tb.addEventListener("click", function(){
        if(tb.dataset.trip==="start"){ trip={active:true,startTime:Date.now(),distance:0,warnings:0}; if(HalDo.Notify) HalDo.Notify.success("Fahrt gestartet!"); }
        else { trip.active=false; if(HalDo.Notify) HalDo.Notify.info("Fahrt beendet: "+trip.distance.toFixed(1)+" km"); }
        build();
      });
    }

    // Init
    if("Notification" in window && Notification.permission==="default") Notification.requestPermission();
    registerServiceWorker();
    startGeo();
    var s = getSettings();
    view.screen = s.showBootLog ? "boot" : "splash";
    build();
  }

  HalDoApp("blitzer", { name:"HalDo Blitzer", icon:"⚠️", render:render, category:"werkzeuge" });
  console.log('%c🦚 HalDo Blitzer v16.0 — Peacock Deluxe Edition bereit', GOLD_STYLE);
})();
