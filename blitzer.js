/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BLITZER & WARNUNGEN (v2.0 PROFESSIONAL)
   GPS · Karte · 20 Kategorien · 6 Sprachen · Sprachwarnungen
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  /* ═══════════ KATEGORIEN ═══════════ */
  var CATS = [
    { id:"blitzer_fix",   icon:"📷", color:"#ff5555", beep:"urgent",
      name:{de:"Fester Blitzer",en:"Fixed Camera",tr:"Sabit Radar",ar:"رادار ثابت",ku:"Radarê sabît",fr:"Radar fixe"},
      voice:{de:"Achtung, fester Blitzer in {d}",en:"Warning, fixed camera in {d}",tr:"Dikkat, sabit radar {d}",ar:"تحذير رادار ثابت {d}",ku:"Hişyarî radarê sabît {d}",fr:"Attention, radar fixe à {d}"},
      zones:[2000,1000,500,200,100,50] },
    { id:"blitzer_mobil", icon:"🚔", color:"#ff8844", beep:"urgent",
      name:{de:"Mobile Kontrolle",en:"Mobile Check",tr:"Mobil Kontrol",ar:"مراقبة متحركة",ku:"Kontrola gerok",fr:"Contrôle mobile"},
      voice:{de:"Achtung, mobile Kontrolle in {d}",en:"Warning, mobile check in {d}",tr:"Dikkat, mobil kontrol {d}",ar:"تحذير مراقبة متحركة {d}",ku:"Hişyarî kontrola gerok {d}",fr:"Attention, contrôle mobile à {d}"},
      zones:[2000,1000,500,200,100,50] },
    { id:"blitzer_ampel", icon:"🚦", color:"#ff5555", beep:"urgent",
      name:{de:"Ampelblitzer",en:"Red Light Camera",tr:"Kırmızı Işık Radarı",ar:"رادار إشارة حمراء",ku:"Radarê çira sor",fr:"Radar feu rouge"},
      voice:{de:"Achtung, Ampelblitzer in {d}",en:"Warning, red light camera in {d}",tr:"Dikkat, kırmızı ışık radarı {d}",ar:"تحذير رادار إشارة حمراء {d}",ku:"Hişyarî radarê çira sor {d}",fr:"Attention, radar feu rouge à {d}"},
      zones:[1000,500,200,100,50] },
    { id:"blitzer_abstand", icon:"📏", color:"#ff8844", beep:"urgent",
      name:{de:"Abstandsmessung",en:"Distance Check",tr:"Mesafe Ölçümü",ar:"قياس المسافة",ku:"Pîvana mesafeyê",fr:"Contrôle distance"},
      voice:{de:"Achtung, Abstandsmessung in {d}",en:"Warning, distance check in {d}",tr:"Dikkat, mesafe ölçümü {d}",ar:"تحذير قياس المسافة {d}",ku:"Hişyarî pîvana mesafeyê {d}",fr:"Attention, contrôle distance à {d}"},
      zones:[2000,1000,500,200] },
    { id:"stau", icon:"🚗", color:"#ffaa33", beep:"medium",
      name:{de:"Stau",en:"Traffic Jam",tr:"Trafik Sıkışıklığı",ar:"ازدحام مروري",ku:"Trafîk xitimî",fr:"Embouteillage"},
      voice:{de:"Achtung, Stau in {d}",en:"Warning, traffic jam in {d}",tr:"Dikkat, trafik sıkışıklığı {d}",ar:"تحذير ازدحام مروري {d}",ku:"Hişyarî trafîk xitimî {d}",fr:"Attention, embouteillage à {d}"},
      zones:[3000,2000,1000,500,200] },
    { id:"unfall", icon:"💥", color:"#ff3333", beep:"alarm",
      name:{de:"Unfall",en:"Accident",tr:"Kaza",ar:"حادث",ku:"Qeza",fr:"Accident"},
      voice:{de:"Achtung, Unfall in {d}",en:"Warning, accident in {d}",tr:"Dikkat, kaza {d}",ar:"تحذير حادث {d}",ku:"Hişyarî qeza {d}",fr:"Attention, accident à {d}"},
      zones:[3000,2000,1000,500,200] },
    { id:"sperrung", icon:"⛔", color:"#ff3333", beep:"alarm",
      name:{de:"Sperrung",en:"Road Closed",tr:"Yol Kapalı",ar:"طريق مغلق",ku:"Rê girtî",fr:"Route fermée"},
      voice:{de:"Achtung, Straße gesperrt in {d}",en:"Warning, road closed in {d}",tr:"Dikkat, yol kapalı {d}",ar:"تحذير طريق مغلق {d}",ku:"Hişyarî rê girtî {d}",fr:"Attention, route fermée à {d}"},
      zones:[3000,2000,1000,500] },
    { id:"baustelle", icon:"🚧", color:"#ffaa33", beep:"medium",
      name:{de:"Baustelle",en:"Road Work",tr:"Yol Çalışması",ar:"أعمال طريق",ku:"Karê rê",fr:"Travaux"},
      voice:{de:"Achtung, Baustelle in {d}",en:"Warning, road work in {d}",tr:"Dikkat, yol çalışması {d}",ar:"تحذير أعمال طريق {d}",ku:"Hişyarî karê rê {d}",fr:"Attention, travaux à {d}"},
      zones:[2000,1000,500,200] },
    { id:"umleitung", icon:"↩️", color:"#ffaa33", beep:"medium",
      name:{de:"Umleitung",en:"Detour",tr:"Güzergah Değişikliği",ar:"تحويلة",ku:"Rêya alternatîv",fr:"Déviation"},
      voice:{de:"Achtung, Umleitung in {d}",en:"Warning, detour in {d}",tr:"Dikkat, güzergah değişikliği {d}",ar:"تحذير تحويلة {d}",ku:"Hişyarî rêya alternatîv {d}",fr:"Attention, déviation à {d}"},
      zones:[2000,1000,500] },
    { id:"kontrolle", icon:"👮", color:"#4499ff", beep:"medium",
      name:{de:"Polizei-Kontrolle",en:"Police Check",tr:"Polis Kontrolü",ar:"نقطة تفتيش",ku:"Kontrola polîs",fr:"Contrôle police"},
      voice:{de:"Achtung, Polizei-Kontrolle in {d}",en:"Warning, police check in {d}",tr:"Dikkat, polis kontrolü {d}",ar:"تحذير نقطة تفتيش {d}",ku:"Hişyarî kontrola polîs {d}",fr:"Attention, contrôle police à {d}"},
      zones:[2000,1000,500,200] },
    { id:"glatteis", icon:"❄️", color:"#88ccff", beep:"medium",
      name:{de:"Glätte",en:"Ice",tr:"Buzlanma",ar:"انزلاق",ku:"Qeşa cemedê",fr:"Verglas"},
      voice:{de:"Achtung, Glätte in {d}",en:"Warning, ice in {d}",tr:"Dikkat, buzlanma {d}",ar:"تحذير انزلاق {d}",ku:"Hişyarî qeşa cemedê {d}",fr:"Attention, verglas à {d}"},
      zones:[2000,1000,500] },
    { id:"nebel", icon:"🌫️", color:"#99aabb", beep:"medium",
      name:{de:"Nebel",en:"Fog",tr:"Sis",ar:"ضباب",ku:"Mij",fr:"Brouillard"},
      voice:{de:"Achtung, Nebel in {d}",en:"Warning, fog in {d}",tr:"Dikkat, sis {d}",ar:"تحذير ضباب {d}",ku:"Hişyarî mij {d}",fr:"Attention, brouillard à {d}"},
      zones:[2000,1000,500] },
    { id:"wild", icon:"🦌", color:"#88cc44", beep:"medium",
      name:{de:"Wildwechsel",en:"Wild Animals",tr:"Vahşi Hayvan",ar:"حيوانات برية",ku:"Ajalên kovî",fr:"Animaux sauvages"},
      voice:{de:"Achtung, Wildwechsel in {d}",en:"Warning, wild animals in {d}",tr:"Dikkat, vahşi hayvan {d}",ar:"تحذير حيوانات برية {d}",ku:"Hişyarî ajalên kovî {d}",fr:"Attention, animaux sauvages à {d}"},
      zones:[2000,1000,500] },
    { id:"gefahr", icon:"⚠️", color:"#ff8844", beep:"medium",
      name:{de:"Gefahr",en:"Danger",tr:"Tehlike",ar:"خطر",ku:"Talûke",fr:"Danger"},
      voice:{de:"Achtung, Gefahr in {d}",en:"Warning, danger in {d}",tr:"Dikkat, tehlike {d}",ar:"تحذير خطر {d}",ku:"Hişyarî talûke {d}",fr:"Attention, danger à {d}"},
      zones:[2000,1000,500,200] },
    { id:"ausfahrt", icon:"⬇️", color:"#4499ff", beep:"low",
      name:{de:"Ausfahrt",en:"Exit",tr:"Çıkış",ar:"مخرج",ku:"Derketin",fr:"Sortie"},
      voice:{de:"Ausfahrt in {d}",en:"Exit in {d}",tr:"Çıkış {d}",ar:"مخرج {d}",ku:"Derketin {d}",fr:"Sortie dans {d}"},
      zones:[2000,1000,500] },
    { id:"tankstelle", icon:"⛽", color:"#66cc66", beep:"low",
      name:{de:"Tankstelle",en:"Gas Station",tr:"Benzinlik",ar:"محطة وقود",ku:"Benzîngeh",fr:"Station essence"},
      voice:{de:"Tankstelle in {d}",en:"Gas station in {d}",tr:"Benzinlik {d}",ar:"محطة وقود {d}",ku:"Benzîngeh {d}",fr:"Station essence dans {d}"},
      zones:[2000,1000,500] },
    { id:"raststaette", icon:"🅿️", color:"#66cc66", beep:"low",
      name:{de:"Raststätte",en:"Rest Area",tr:"Dinlenme Tesisi",ar:"استراحة",ku:"Qada bêhnvedanê",fr:"Aire de repos"},
      voice:{de:"Raststätte in {d}",en:"Rest area in {d}",tr:"Dinlenme tesisi {d}",ar:"استراحة {d}",ku:"Qada bêhnvedanê {d}",fr:"Aire de repos dans {d}"},
      zones:[2000,1000,500] },
    { id:"parkplatz", icon:"🅿️", color:"#66cc66", beep:"low",
      name:{de:"Parkplatz",en:"Parking",tr:"Park Yeri",ar:"موقف سيارات",ku:"Parkkirin",fr:"Parking"},
      voice:{de:"Parkplatz in {d}",en:"Parking in {d}",tr:"Park yeri {d}",ar:"موقف سيارات {d}",ku:"Parkkirin {d}",fr:"Parking dans {d}"},
      zones:[1000,500,200] },
    { id:"pause", icon:"☕", color:"#ffcc44", beep:"low",
      name:{de:"Pause empfohlen",en:"Break Recommended",tr:"Mola Önerilir",ar:"يُنصح بالراحة",ku:"Bêhnvedan tê pêşniyazkirin",fr:"Pause recommandée"},
      voice:{de:"Zeit für eine Pause",en:"Time for a break",tr:"Mola zamanı",ar:"وقت للراحة",ku:"Dema bêhnvedanê",fr:"Temps de pause"},
      zones:[0] }
  ];

  /* ═══════════ SETTINGS ═══════════ */
  var DEFAULT_SETTINGS = {
    enabled: {},
    voiceOn: true,
    voiceLang: "de",
    voiceRate: 1.0,
    voicePitch: 1.0,
    beepOn: true,
    beepVolume: 0.7,
    vibrateOn: true,
    warnFactor: 1.0,
    pauseAfterMin: 120,
    autoStart: false
  };
  CATS.forEach(function(c){ DEFAULT_SETTINGS.enabled[c.id] = true; });

  /* ═══════════ UTILS ═══════════ */
  function _esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function haversine(lat1,lng1,lat2,lng2){
    var R=6371000, dLat=(lat2-lat1)*Math.PI/180, dLng=(lng2-lng1)*Math.PI/180;
    var a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)*Math.sin(dLng/2);
    return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
  }
  function fmtDist(m){
    if(m<1000) return Math.round(m/10)*10 + " Metern";
    return (m/1000).toFixed(1) + " Kilometern";
  }
  function getCat(id){ return CATS.find(function(c){return c.id===id;}); }

  /* ═══════════ AUDIO ENGINE ═══════════ */
  var audioCtx = null;
  function getAudio(){ if(!audioCtx){ try{ audioCtx = new (window.AudioContext||window.webkitAudioContext)(); }catch(e){} } return audioCtx; }
  function playBeep(pattern, vol){
    var ctx = getAudio(); if(!ctx) return;
    var now = ctx.currentTime;
    var patterns = {
      urgent: [{f:880,t:0,d:0.1},{f:880,t:0.15,d:0.1},{f:880,t:0.3,d:0.15}],
      alarm:  [{f:1200,t:0,d:0.08},{f:1200,t:0.12,d:0.08},{f:1200,t:0.24,d:0.08},{f:1200,t:0.36,d:0.12}],
      medium: [{f:660,t:0,d:0.15},{f:660,t:0.25,d:0.15}],
      low:    [{f:440,t:0,d:0.2}]
    };
    var seq = patterns[pattern] || patterns.medium;
    seq.forEach(function(b){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = b.f; o.type = "sine";
      g.gain.setValueAtTime(0, now+b.t);
      g.gain.linearRampToValueAtTime(vol, now+b.t+0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now+b.t+b.d);
      o.connect(g).connect(ctx.destination);
      o.start(now+b.t); o.stop(now+b.t+b.d+0.02);
    });
  }
  function vibratePattern(pattern){
    if(!navigator.vibrate) return;
    var p = { urgent:[100,50,100,50,100], alarm:[150,50,150,50,150,50,150], medium:[200,100,200], low:[300] }[pattern] || [200];
    try { navigator.vibrate(p); } catch(e){}
  }
  function speak(text, settings){
    if(!settings.voiceOn || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = { de:"de-DE", en:"en-US", tr:"tr-TR", ar:"ar-SA", ku:"tr-TR", fr:"fr-FR" }[settings.voiceLang] || "de-DE";
      u.rate = settings.voiceRate; u.pitch = settings.voicePitch; u.volume = 1;
      window.speechSynthesis.speak(u);
    } catch(e){}
  }
  function triggerWarning(cat, dist, settings, customVoice){
    // Custom voice has priority
    if(customVoice && customVoice[cat.id]){
      try {
        var a = new Audio(customVoice[cat.id]);
        if(settings.voiceOn) a.play().catch(function(){});
      } catch(e){}
    } else {
      var tpl = cat.voice[settings.voiceLang] || cat.voice.de;
      var msg = tpl.replace("{d}", fmtDist(dist));
      speak(msg, settings);
    }
    if(settings.beepOn) playBeep(cat.beep, settings.beepVolume);
    if(settings.vibrateOn) vibratePattern(cat.beep);
  }

  /* ═══════════ RENDER ═══════════ */
  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"main", editId:null };
    var geoWatch = null;
    var lastPos = null;
    var trip = { active:false, startTime:0, startPos:null, distance:0, warningsPassed:0, lastPausePrompt:0 };
    var map = null, mapMarkers = [], mapReady = false;
    var timer = null;

    function getSettings(){
      var s = store.get("settings", {});
      var merged = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      Object.keys(s).forEach(function(k){ merged[k] = s[k]; });
      if(!merged.enabled || Object.keys(merged.enabled).length === 0) merged.enabled = DEFAULT_SETTINGS.enabled;
      return merged;
    }
    function saveSettings(s){ store.set("settings", s); }
    function getWarnings(){ return store.get("warnings", []); }
    function saveWarnings(w){ store.set("warnings", w); }
    function getTriggered(){ return store.get("triggered", {}); }
    function saveTriggered(t){ store.set("triggered", t); }
    function getCustomVoice(){ return store.get("customVoice", {}); }

    /* ═══════════ MAIN SCREEN ═══════════ */
    function screenMain(){
      var settings = getSettings();
      var warnings = getWarnings();
      var speed = lastPos ? Math.round((lastPos.coords.speed||0)*3.6) : 0;
      var gpsStatus = lastPos ? "🟢 GPS aktiv" : "🔴 GPS aus";
      var gpsAccuracy = lastPos ? Math.round(lastPos.coords.accuracy) : 0;

      var html = '';

      // Status Header
      html += '<div class="card" style="background:linear-gradient(135deg,rgba(255,85,85,.15),rgba(255,136,68,.1));border:1px solid rgba(255,85,85,.3)">'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
        + '<div><div style="font-size:16px;font-weight:900;color:#ff5555">⚠️ Blitzer & Warnungen</div>'
        + '<div style="font-size:10px;color:var(--text-mute);margin-top:2px">'+gpsStatus+(gpsAccuracy?(' · ±'+gpsAccuracy+'m'):'')+'</div></div>'
        + '<div style="text-align:right"><div style="font-size:28px;font-weight:900;color:#ff5555;font-variant-numeric:tabular-nums">'+speed+'</div>'
        + '<div style="font-size:9px;color:var(--text-mute)">km/h</div></div>'
        + '</div>'
        + '<div style="display:flex;gap:6px">'
        + (trip.active
            ? '<button class="btn danger" data-trip="stop" style="flex:1;padding:12px">⏹ Fahrt beenden</button>'
            : '<button class="btn" data-trip="start" style="flex:1;padding:12px">▶ Fahrt starten</button>')
        + '<button class="btn sec" data-goto="add" style="flex:0 0 auto;padding:12px 16px">➕</button>'
        + '</div>'
        + (trip.active ? '<div style="margin-top:10px;padding:8px;background:rgba(0,0,0,.2);border-radius:8px;font-size:11px;color:var(--text-dim);display:flex;justify-content:space-around;text-align:center">'
            + '<div><div style="font-weight:900;color:#4ade80;font-size:14px" id="trip-dist">'+trip.distance.toFixed(1)+' km</div><div style="font-size:9px">Distanz</div></div>'
            + '<div><div style="font-weight:900;color:#4ade80;font-size:14px" id="trip-time">'+Math.floor((Date.now()-trip.startTime)/60000)+' min</div><div style="font-size:9px">Fahrzeit</div></div>'
            + '<div><div style="font-weight:900;color:#ffd54f;font-size:14px" id="trip-warn">'+trip.warningsPassed+'</div><div style="font-size:9px">Warnungen</div></div>'
            + '</div>' : '')
        + '</div>';

      // Karte
      html += '<div class="card" style="padding:8px">'
        + '<div id="blMap" style="height:300px;border-radius:10px;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;color:var(--text-mute);font-size:11px;text-align:center;padding:20px;position:relative;overflow:hidden">'
        + (mapReady ? '' : '<div>🗺️<br><br>Karte wird geladen...<br><span style="font-size:9.5px;opacity:.7">(Internet erforderlich)</span></div>')
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:6px">'
        + '<button class="btn sec" data-goto="list" style="flex:1;font-size:11px;padding:8px">📋 Meine Warnungen ('+warnings.length+')</button>'
        + '<button class="btn sec" data-goto="settings" style="flex:0 0 auto;font-size:11px;padding:8px 12px">⚙️</button>'
        + '</div></div>';

      // Nächste Warnungen (in der Nähe)
      var nearby = [];
      if(lastPos){
        var lat = lastPos.coords.latitude, lng = lastPos.coords.longitude;
        nearby = warnings.map(function(w){
          var d = haversine(lat, lng, w.lat, w.lng);
          return { w:w, d:d };
        }).filter(function(x){ return x.d <= 10000; })
          .sort(function(a,b){ return a.d - b.d; })
          .slice(0, 5);
      }
      if(nearby.length){
        html += '<div class="card"><h3>📍 In der Nähe</h3>';
        nearby.forEach(function(n){
          var c = getCat(n.w.cat); if(!c) return;
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid '+c.color+'">'
            + '<div><div style="font-size:12px;font-weight:900">'+c.icon+' '+_esc(c.name[getSettings().voiceLang]||c.name.de)+'</div>'
            + (n.w.note ? '<div style="font-size:10px;color:var(--text-mute)">'+_esc(n.w.note)+'</div>' : '')
            + '</div>'
            + '<div style="font-size:14px;font-weight:900;color:'+c.color+'">'+(n.d<1000?Math.round(n.d)+'m':(n.d/1000).toFixed(1)+'km')+'</div>'
            + '</div>';
        });
        html += '</div>';
      }

      // Info
      html += '<div class="card" style="font-size:10.5px;color:var(--text-mute);line-height:1.5">'
        + '⚖️ <b>Rechtlicher Hinweis:</b> Diese App dient der Verkehrssicherheit. Blitzer-Warnungen während der Fahrt können in Deutschland als Ordnungswidrigkeit gelten (StVO §23). Nutzung auf eigene Verantwortung. Keine echten Live-Behördendaten — alle Einträge sind nutzergeneriert.'
        + '</div>';

      container.innerHTML = html;
      bindMain();
      initMap();
    }

    function bindMain(){
      container.querySelectorAll("[data-goto]").forEach(function(el){
        el.addEventListener("click", function(){
          view.screen = el.dataset.goto;
          if(view.screen === "add") screenAdd();
          else if(view.screen === "list") screenList();
          else if(view.screen === "settings") screenSettings();
        });
      });
      var tb = container.querySelector("[data-trip]");
      if(tb) tb.addEventListener("click", function(){
        if(tb.dataset.trip === "start"){
          trip.active = true; trip.startTime = Date.now(); trip.distance = 0;
          trip.warningsPassed = 0; trip.lastPausePrompt = 0;
          trip.startPos = lastPos ? { lat:lastPos.coords.latitude, lng:lastPos.coords.longitude } : null;
          if(HalDo.Notify) HalDo.Notify.success("Fahrt gestartet! Gute Fahrt!");
          screenMain();
        } else {
          if(!confirm("Fahrt beenden?")) return;
          trip.active = false;
          if(HalDo.Notify) HalDo.Notify.success("Fahrt beendet: " + trip.distance.toFixed(1) + " km");
          screenMain();
        }
      });
    }

    /* ═══════════ MAP (LEAFLET) ═══════════ */
    function initMap(){
      if(mapReady) { updateMap(); return; }
      if(!document.getElementById("leaflet-css")){
        var lc = document.createElement("link");
        lc.id = "leaflet-css"; lc.rel = "stylesheet";
        lc.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(lc);
      }
      if(window.L){
        buildMap();
        return;
      }
      var s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = function(){ buildMap(); };
      s.onerror = function(){
        var m = document.getElementById("blMap");
        if(m) m.innerHTML = '<div style="color:#ff8080">⚠️ Karte konnte nicht geladen werden<br><span style="font-size:9px">(Offline oder CDN blockiert)</span></div>';
      };
      document.head.appendChild(s);
    }
    function buildMap(){
      var el = document.getElementById("blMap");
      if(!el || !window.L) return;
      el.innerHTML = '';
      try {
        var center = lastPos ? [lastPos.coords.latitude, lastPos.coords.longitude] : [51.1657, 10.4515];
        map = L.map(el, { zoomControl:false, attributionControl:false }).setView(center, 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom:19 }).addTo(map);
        mapReady = true;
        updateMap();
      } catch(e){
        el.innerHTML = '<div style="color:#ff8080">⚠️ Karte Fehler</div>';
      }
    }
    function updateMap(){
      if(!map || !mapReady) return;
      mapMarkers.forEach(function(m){ map.removeLayer(m); });
      mapMarkers = [];
      var warnings = getWarnings();
      warnings.forEach(function(w){
        var c = getCat(w.cat); if(!c) return;
        var icon = L.divIcon({
          html: '<div style="background:'+c.color+';color:#fff;border-radius:50%;width:32px;height:32px;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)">'+c.icon+'</div>',
          className: "", iconSize:[32,32], iconAnchor:[16,16]
        });
        mapMarkers.push(L.marker([w.lat, w.lng], { icon:icon }).addTo(map).bindPopup(_esc(c.name.de) + (w.note ? '<br>'+_esc(w.note) : '')));
      });
      if(lastPos){
        var uicon = L.divIcon({
          html: '<div style="background:#00e5ff;border:3px solid #fff;border-radius:50%;width:20px;height:20px;box-shadow:0 0 12px #00e5ff"></div>',
          className: "", iconSize:[20,20], iconAnchor:[10,10]
        });
        mapMarkers.push(L.marker([lastPos.coords.latitude, lastPos.coords.longitude], { icon:uicon }).addTo(map));
        map.setView([lastPos.coords.latitude, lastPos.coords.longitude]);
      }
    }

    /* ═══════════ ADD WARNING ═══════════ */
    function screenAdd(){
      if(!lastPos){
        container.innerHTML = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
          + '<div class="card" style="text-align:center;padding:30px">'
          + '<div style="font-size:44px">📍</div>'
          + '<div style="font-size:14px;font-weight:900;color:#ff8080;margin-top:10px">GPS nicht aktiv</div>'
          + '<div style="font-size:11px;color:var(--text-mute);margin-top:6px">Zum Hinzufügen einer Warnung<br>muss dein Standort bekannt sein.</div>'
          + '<button class="btn full" id="retryGps" style="margin-top:16px">📍 GPS aktivieren</button>'
          + '</div>';
        container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="main"; screenMain(); });
        container.querySelector("#retryGps").addEventListener("click", function(){ startGeo(); });
        return;
      }
      var lat = lastPos.coords.latitude.toFixed(6);
      var lng = lastPos.coords.longitude.toFixed(6);
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card"><h3>Neue Warnung</h3>'
        + '<div class="field"><label>Kategorie</label>'
        + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px" id="catGrid">';
      CATS.forEach(function(c){
        html += '<button data-cat="'+c.id+'" style="padding:10px 4px;background:rgba(0,0,0,.2);border:1.5px solid var(--border-soft);border-radius:8px;cursor:pointer;color:inherit;font-family:inherit;text-align:center">'
          + '<div style="font-size:20px">'+c.icon+'</div>'
          + '<div style="font-size:9px;color:var(--text-mute);margin-top:2px;line-height:1.2">'+_esc(c.name.de)+'</div>'
          + '</button>';
      });
      html += '</div></div>'
        + '<div class="field"><label>Notiz (optional)</label><input id="addNote" placeholder="z.B. Blitzer hinter Brücke" maxlength="80"></div>'
        + '<div class="field"><label>Position</label>'
        + '<div style="padding:8px;background:rgba(0,0,0,.2);border-radius:8px;font-size:11px;color:var(--text-dim);font-family:monospace">'+lat+', '+lng+'</div>'
        + '</div>'
        + '<button class="btn full" id="saveWarn">💾 Speichern</button>'
        + '</div>';
      container.innerHTML = html;
      var selectedCat = null;
      container.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click", function(){
          selectedCat = el.dataset.cat;
          container.querySelectorAll("[data-cat]").forEach(function(x){
            var c = getCat(x.dataset.cat);
            x.style.borderColor = (x.dataset.cat === selectedCat) ? c.color : "var(--border-soft)";
            x.style.background = (x.dataset.cat === selectedCat) ? (c.color + "22") : "rgba(0,0,0,.2)";
          });
        });
      });
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="main"; screenMain(); });
      container.querySelector("#saveWarn").addEventListener("click", function(){
        if(!selectedCat){ alert("Bitte Kategorie wählen."); return; }
        var note = container.querySelector("#addNote").value.trim();
        var warnings = getWarnings();
        warnings.push({
          id: "w"+Date.now(),
          cat: selectedCat,
          lat: lastPos.coords.latitude,
          lng: lastPos.coords.longitude,
          note: note,
          created: Date.now()
        });
        saveWarnings(warnings);
        if(HalDo.Notify) HalDo.Notify.success("Warnung gespeichert");
        view.screen = "main"; screenMain();
      });
    }

    /* ═══════════ LIST ═══════════ */
    function screenList(){
      var warnings = getWarnings();
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
        + '<h3 style="margin:0">📋 Meine Warnungen ('+warnings.length+')</h3>'
        + '<div style="display:flex;gap:4px">'
        + '<button id="expBtn" style="background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.3);color:var(--p1);border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">📤</button>'
        + '<button id="impBtn" style="background:rgba(0,229,255,.15);border:1px solid rgba(0,229,255,.3);color:var(--p1);border-radius:6px;padding:5px 9px;font-size:11px;cursor:pointer">📥</button>'
        + '</div></div>';
      if(!warnings.length){
        html += '<div style="text-align:center;color:var(--text-mute);padding:24px;font-size:12px">Keine Warnungen gespeichert.<br><span style="font-size:10.5px;opacity:.7">Füge Warnungen auf der Karte hinzu.</span></div>';
      } else {
        warnings.slice().reverse().forEach(function(w){
          var c = getCat(w.cat); if(!c) return;
          html += '<div style="padding:10px;background:rgba(0,0,0,.2);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid '+c.color+'">'
            + '<div style="flex:1;min-width:0"><div style="font-size:12.5px;font-weight:900">'+c.icon+' '+_esc(c.name.de)+'</div>'
            + (w.note ? '<div style="font-size:10.5px;color:var(--text-dim)">'+_esc(w.note)+'</div>' : '')
            + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:2px">'+new Date(w.created).toLocaleString("de-DE")+' · '+w.lat.toFixed(4)+', '+w.lng.toFixed(4)+'</div></div>'
            + '<button data-del="'+w.id+'" style="background:rgba(255,128,128,.15);border:1px solid rgba(255,128,128,.3);color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer;margin-left:6px">✕</button>'
            + '</div>';
        });
      }
      html += '</div>';
      container.innerHTML = html;
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="main"; screenMain(); });
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Warnung löschen?")) return;
          saveWarnings(getWarnings().filter(function(w){ return w.id !== el.dataset.del; }));
          screenList();
        });
      });
      container.querySelector("#expBtn").addEventListener("click", function(){
        var data = JSON.stringify(getWarnings(), null, 2);
        var blob = new Blob([data], { type:"application/json" });
        var url = URL.createObjectURL(blob);
        var a = document.createElement("a");
        a.href = url; a.download = "haldo-warnungen-" + new Date().toISOString().split("T")[0] + ".json";
        a.click(); URL.revokeObjectURL(url);
      });
      container.querySelector("#impBtn").addEventListener("click", function(){
        var input = document.createElement("input"); input.type = "file"; input.accept = ".json";
        input.onchange = function(e){
          var file = e.target.files[0]; if(!file) return;
          var reader = new FileReader();
          reader.onload = function(ev){
            try {
              var imported = JSON.parse(ev.target.result);
              if(!Array.isArray(imported)) throw new Error("Kein Array");
              var warnings = getWarnings();
              var added = 0;
              imported.forEach(function(w){
                if(w.cat && w.lat && w.lng && !warnings.find(function(x){return x.id===w.id;})){
                  if(!w.id) w.id = "w"+Date.now()+Math.random();
                  if(!w.created) w.created = Date.now();
                  warnings.push(w); added++;
                }
              });
              saveWarnings(warnings);
              if(HalDo.Notify) HalDo.Notify.success(added + " Warnungen importiert");
              screenList();
            } catch(err){
              alert("Import fehlgeschlagen: " + err.message);
            }
          };
          reader.readAsText(file);
        };
        input.click();
      });
    }

    /* ═══════════ SETTINGS ═══════════ */
    function screenSettings(){
      var s = getSettings();
      var html = '<button data-back style="background:transparent;border:none;color:var(--p1);cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>';

      // Sprachwarnungen
      html += '<div class="card"><h3>🔊 Sprachwarnungen</h3>'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
        + '<span style="font-size:12px">Aktiviert</span>'
        + '<button id="tgVoice" style="background:'+(s.voiceOn?'#4ade80':'rgba(255,255,255,.1)')+';border:none;width:50px;height:26px;border-radius:13px;cursor:pointer;position:relative;color:'+(s.voiceOn?'#000':'#fff')+';font-size:11px;font-weight:900">'+(s.voiceOn?'ON':'OFF')+'</button></div>'
        + '<div class="field"><label>Sprache</label><select id="setLang">'
        + '<option value="de"'+(s.voiceLang==="de"?" selected":"")+'>🇩🇪 Deutsch</option>'
        + '<option value="en"'+(s.voiceLang==="en"?" selected":"")+'>🇬🇧 English</option>'
        + '<option value="tr"'+(s.voiceLang==="tr"?" selected":"")+'>🇹🇷 Türkçe</option>'
        + '<option value="ar"'+(s.voiceLang==="ar"?" selected":"")+'>🇸🇦 العربية</option>'
        + '<option value="ku"'+(s.voiceLang==="ku"?" selected":"")+'>🟡 Kurdî</option>'
        + '<option value="fr"'+(s.voiceLang==="fr"?" selected":"")+'>🇫🇷 Français</option>'
        + '</select></div>'
        + '<button class="btn sec full" id="testVoice" style="margin-top:6px">🔊 Test-Sprache</button>'
        + '</div>';

      // Beep
      html += '<div class="card"><h3>🔔 Beep-Töne</h3>'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
        + '<span style="font-size:12px">Aktiviert</span>'
        + '<button id="tgBeep" style="background:'+(s.beepOn?'#4ade80':'rgba(255,255,255,.1)')+';border:none;width:50px;height:26px;border-radius:13px;cursor:pointer;color:'+(s.beepOn?'#000':'#fff')+';font-size:11px;font-weight:900">'+(s.beepOn?'ON':'OFF')+'</button></div>'
        + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
        + '<span style="font-size:12px">Vibration</span>'
        + '<button id="tgVib" style="background:'+(s.vibrateOn?'#4ade80':'rgba(255,255,255,.1)')+';border:none;width:50px;height:26px;border-radius:13px;cursor:pointer;color:'+(s.vibrateOn?'#000':'#fff')+';font-size:11px;font-weight:900">'+(s.vibrateOn?'ON':'OFF')+'</button></div>'
        + '<button class="btn sec full" id="testBeep">🔔 Test-Beep (Urgent)</button>'
        + '</div>';

      // Kategorien
      html += '<div class="card"><h3>🎯 Kategorien</h3>';
      CATS.forEach(function(c){
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">'
          + '<span style="font-size:12px">'+c.icon+' '+_esc(c.name.de)+'</span>'
          + '<button data-tgcat="'+c.id+'" style="background:'+(s.enabled[c.id]?'#4ade80':'rgba(255,255,255,.1)')+';border:none;width:40px;height:22px;border-radius:11px;cursor:pointer;color:'+(s.enabled[c.id]?'#000':'#fff')+';font-size:10px;font-weight:900">'+(s.enabled[c.id]?'✓':'')+'</button>'
          + '</div>';
      });
      html += '</div>';

      // Fahrt & Pause
      html += '<div class="card"><h3>🚗 Fahrt</h3>'
        + '<div class="field"><label>Pausen-Erinnerung nach (Minuten)</label>'
        + '<input type="number" id="setPause" value="'+s.pauseAfterMin+'" min="30" max="300" step="15"></div>'
        + '<div style="font-size:10px;color:var(--text-mute)">Empfehlung: 120 Minuten (2h)</div>'
        + '</div>';

      // Custom Voice
      var customVoice = getCustomVoice();
      html += '<div class="card"><h3>🎤 Eigene Stimme</h3>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Nimm pro Kategorie deine eigene Warnung auf.</div>';
      CATS.forEach(function(c){
        if(c.id === "pause") return;
        var has = !!customVoice[c.id];
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05)">'
          + '<span style="font-size:11px">'+c.icon+' '+_esc(c.name.de)+'</span>'
          + '<button data-rec="'+c.id+'" style="background:'+(has?'rgba(74,222,128,.15)':'rgba(0,229,255,.15)')+';border:1px solid '+(has?'#4ade80':'#00e5ff')+';color:'+(has?'#4ade80':'#00e5ff')+';border-radius:6px;padding:5px 10px;font-size:10px;cursor:pointer">'+(has?'✓ Neu':'🎤 Aufn.')+'</button>'
          + '</div>';
      });
      html += '</div>';

      // Reset
      html += '<div class="card"><button class="btn danger full" id="resetWarn">🗑️ Alle Warnungen löschen</button></div>';

      container.innerHTML = html;
      bindSettings();
    }

    function bindSettings(){
      var s = getSettings();
      container.querySelector("[data-back]").addEventListener("click", function(){ view.screen="main"; screenMain(); });

      container.querySelector("#tgVoice").addEventListener("click", function(){ s.voiceOn = !s.voiceOn; saveSettings(s); screenSettings(); });
      container.querySelector("#tgBeep").addEventListener("click", function(){ s.beepOn = !s.beepOn; saveSettings(s); screenSettings(); });
      container.querySelector("#tgVib").addEventListener("click", function(){ s.vibrateOn = !s.vibrateOn; saveSettings(s); screenSettings(); });
      container.querySelector("#setLang").addEventListener("change", function(e){ s.voiceLang = e.target.value; saveSettings(s); });
      container.querySelector("#setPause").addEventListener("change", function(e){ s.pauseAfterMin = parseInt(e.target.value) || 120; saveSettings(s); });

      container.querySelectorAll("[data-tgcat]").forEach(function(el){
        el.addEventListener("click", function(){
          s.enabled[el.dataset.tgcat] = !s.enabled[el.dataset.tgcat];
          saveSettings(s); screenSettings();
        });
      });

      container.querySelector("#testVoice").addEventListener("click", function(){
        var tpl = {de:"Achtung, fester Blitzer in 500 Metern",en:"Warning, fixed camera in 500 meters",tr:"Dikkat, sabit radar 500 metre",ar:"تحذير رادار ثابت على بعد 500 متر",ku:"Hişyarî radarê sabît 500 metre",fr:"Attention, radar fixe à 500 mètres"}[s.voiceLang] || "Achtung, Testwarnung";
        speak(tpl, s);
      });
      container.querySelector("#testBeep").addEventListener("click", function(){
        playBeep("urgent", s.beepVolume);
        if(s.vibrateOn) vibratePattern("urgent");
      });

      // Voice recording
      container.querySelectorAll("[data-rec]").forEach(function(el){
        el.addEventListener("click", function(){
          recordVoice(el.dataset.rec);
        });
      });

      container.querySelector("#resetWarn").addEventListener("click", function(){
        if(!confirm("Wirklich ALLE Warnungen löschen?")) return;
        if(!confirm("Sicher? Kann nicht rückgängig gemacht werden.")) return;
        saveWarnings([]); saveTriggered({});
        if(HalDo.Notify) HalDo.Notify.success("Alle Warnungen gelöscht");
      });
    }

    function recordVoice(catId){
      var cat = getCat(catId);
      if(!navigator.mediaDevices){
        alert("Mikrofon nicht verfügbar"); return;
      }
      var html = '<div style="position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:100000;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;color:#fff;text-align:center">'
        + '<div style="font-size:44px;margin-bottom:10px">'+cat.icon+'</div>'
        + '<div style="font-size:14px;font-weight:900;color:#00e5ff;margin-bottom:20px">Aufnahme: '+_esc(cat.name.de)+'</div>'
        + '<div id="recStatus" style="font-size:12px;color:#ff5555;margin-bottom:20px">🔴 Aufnahme läuft...</div>'
        + '<div style="font-size:11px;color:#aaa;margin-bottom:20px">Sprich deine Warnung jetzt</div>'
        + '<button id="recStop" style="padding:14px 30px;background:#ff5555;color:#fff;border:none;border-radius:10px;font-weight:900;font-size:14px;cursor:pointer">⏹ Stopp & Speichern</button>'
        + '<button id="recCancel" style="margin-top:10px;padding:10px 20px;background:transparent;color:#888;border:1px solid #444;border-radius:8px;font-size:12px;cursor:pointer">Abbrechen</button>'
        + '</div>';
      var overlay = document.createElement("div");
      overlay.innerHTML = html;
      document.body.appendChild(overlay);

      var chunks = [];
      var rec = null;
      var timer = null;
      navigator.mediaDevices.getUserMedia({ audio:true }).then(function(stream){
        try {
          rec = new MediaRecorder(stream);
          rec.ondataavailable = function(e){ if(e.data.size) chunks.push(e.data); };
          rec.onstop = function(){
            stream.getTracks().forEach(function(t){ t.stop(); });
            var blob = new Blob(chunks, { type:"audio/webm" });
            var reader = new FileReader();
            reader.onload = function(){
              var customVoice = getCustomVoice();
              customVoice[catId] = reader.result;
              store.set("customVoice", customVoice);
              overlay.remove();
              if(HalDo.Notify) HalDo.Notify.success("Stimme gespeichert für " + cat.name.de);
              screenSettings();
            };
            reader.readAsDataURL(blob);
          };
          rec.start();
          timer = setTimeout(function(){ if(rec.state === "recording") rec.stop(); }, 8000);
        } catch(e){ alert("Aufnahme fehlgeschlagen: " + e.message); overlay.remove(); }
      }).catch(function(e){
        alert("Mikrofon-Zugriff verweigert: " + e.message);
        overlay.remove();
      });

      overlay.querySelector("#recStop").addEventListener("click", function(){ if(rec && rec.state === "recording") rec.stop(); });
      overlay.querySelector("#recCancel").addEventListener("click", function(){
        if(timer) clearTimeout(timer);
        if(rec && rec.state === "recording") rec.stop();
        overlay.remove();
      });
    }

    /* ═══════════ GEOLOCATION ═══════════ */
    function startGeo(){
      if(!navigator.geolocation){
        if(HalDo.Notify) HalDo.Notify.error("GPS nicht verfügbar");
        return;
      }
      if(geoWatch) navigator.geolocation.clearWatch(geoWatch);
      geoWatch = navigator.geolocation.watchPosition(onPos, onGeoErr, {
        enableHighAccuracy: true, maximumAge: 5000, timeout: 15000
      });
    }
    function onPos(pos){
      if(lastPos && trip.active && trip.startPos){
        var d = haversine(lastPos.coords.latitude, lastPos.coords.longitude, pos.coords.latitude, pos.coords.longitude);
        if(d > 3 && d < 500) trip.distance += d / 1000;
      }
      lastPos = pos;
      checkWarnings(pos);
      if(view.screen === "main" && !trip.active) {
        var spd = container.querySelector('div[style*="font-size:28px;font-weight:900;color:#ff5555"]');
        if(spd) spd.textContent = Math.round((pos.coords.speed||0)*3.6);
      }
      if(trip.active){
        var td = container.querySelector("#trip-dist"); if(td) td.textContent = trip.distance.toFixed(1) + " km";
        var tt = container.querySelector("#trip-time"); if(tt) tt.textContent = Math.floor((Date.now()-trip.startTime)/60000) + " min";
        if(td) {
          var timeDriven = (Date.now() - trip.startTime) / 60000;
          var settings = getSettings();
          if(timeDriven - trip.lastPausePrompt >= settings.pauseAfterMin){
            trip.lastPausePrompt = timeDriven;
            var cat = getCat("pause");
            if(cat && settings.enabled[cat.id]) {
              triggerWarning(cat, 0, settings, getCustomVoice());
            }
          }
        }
      }
      if(mapReady) updateMap();
    }
    function onGeoErr(err){
      console.warn("[Blitzer] GPS:", err.message);
    }

    function checkWarnings(pos){
      var lat = pos.coords.latitude, lng = pos.coords.longitude;
      var settings = getSettings();
      var warnings = getWarnings();
      var triggered = getTriggered();
      var customVoice = getCustomVoice();
      var anyTriggered = false;

      warnings.forEach(function(w){
        if(!settings.enabled[w.cat]) return;
        var cat = getCat(w.cat); if(!cat) return;
        var d = haversine(lat, lng, w.lat, w.lng);
        var zones = cat.zones.map(function(z){ return z * settings.warnFactor; });
        var currentZone = -1;
        for(var i = 0; i < zones.length; i++){
          if(d <= zones[i]) { currentZone = i; break; }
        }
        if(currentZone === -1) {
          // Reset if moved away
          Object.keys(triggered).forEach(function(k){
            if(k.indexOf(w.id + "_") === 0) delete triggered[k];
          });
          return;
        }
        var key = w.id + "_" + currentZone;
        if(triggered[key]) return;
        triggered[key] = Date.now();
        triggerWarning(cat, d, settings, customVoice);
        anyTriggered = true;
        trip.warningsPassed++;
        var tw = container.querySelector("#trip-warn"); if(tw) tw.textContent = trip.warningsPassed;
      });

      // Cleanup old triggers
      Object.keys(triggered).forEach(function(k){
        if(Date.now() - triggered[k] > 300000) delete triggered[k];
      });

      if(anyTriggered) saveTriggered(triggered);
    }

    /* ═══════════ INIT ═══════════ */
    function init(){
      startGeo();
      if(view.screen === "main") screenMain();
    }

    // Route based on view
    if(view.screen === "add") screenAdd();
    else if(view.screen === "list") screenList();
    else if(view.screen === "settings") screenSettings();
    else { screenMain(); startGeo(); }

    // Cleanup on unmount — attempt via container remove
    var origInner = container.innerHTML;
  }

  HalDoApp("blitzer", { name: "Blitzer", icon: "⚠️", render: render, category: "werkzeuge" });
  console.log("🦚 blitzer.js v2.0 geladen — GPS · 20 Kategorien · 6 Sprachen · Sprachwarnungen · Eigene Stimme");
})();
