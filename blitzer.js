/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — BLITZER & WARNUNGEN (v3.0 PROFESSIONAL)
   Cockpit · GPS · Karte · 6 Sprachen (inkl. Ezidi) · Eigene Stimme
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  /* ═══════════ 1. KATEGORIEN & SPRACHEN ═══════════ */
  var CATS = [
    { id:"blitzer_fix",   icon:"📷", color:"#ff5555", beep:"urgent", zones:[2000,1000,500,200],
      name:{de:"Fester Blitzer",en:"Fixed Camera",tr:"Sabit Radar",ar:"رادار ثابت",ku:"Radarê Sabît",fr:"Radar fixe"},
      voice:{de:"Achtung, fester Blitzer in {d}",en:"Warning, fixed camera in {d}",tr:"Dikkat, sabit radar {d}",ar:"تحذير رادار ثابت {d}",ku:"Hişyarî, radarê sabît li {d}",fr:"Attention, radar fixe à {d}"} },
    { id:"blitzer_mobil", icon:"🚔", color:"#ff8844", beep:"urgent", zones:[2000,1000,500,200],
      name:{de:"Mobile Kontrolle",en:"Mobile Check",tr:"Mobil Kontrol",ar:"مراقبة متحركة",ku:"Kontrola Mobîl",fr:"Contrôle mobile"},
      voice:{de:"Achtung, mobile Kontrolle in {d}",en:"Warning, mobile check in {d}",tr:"Dikkat, mobil kontrol {d}",ar:"تحذير مراقبة متحركة {d}",ku:"Hişyarî, kontrola mobîl li {d}",fr:"Attention, contrôle mobile à {d}"} },
    { id:"stau", icon:"🚗", color:"#ffaa33", beep:"medium", zones:[3000,2000,1000,500],
      name:{de:"Stau",en:"Traffic Jam",tr:"Trafik Sıkışıklığı",ar:"ازدحام مروري",ku:"Traffîk Xitimî",fr:"Embouteillage"},
      voice:{de:"Achtung, Stau in {d}",en:"Warning, traffic jam in {d}",tr:"Dikkat, trafik sıkışıklığı {d}",ar:"تحذير ازدحام مروري {d}",ku:"Hişyarî, traffîk xitimî li {d}",fr:"Attention, embouteillage à {d}"} },
    { id:"unfall", icon:"💥", color:"#ff3333", beep:"alarm", zones:[3000,2000,1000],
      name:{de:"Unfall",en:"Accident",tr:"Kaza",ar:"حادث",ku:"Qeza",fr:"Accident"},
      voice:{de:"Achtung, Unfall in {d}",en:"Warning, accident in {d}",tr:"Dikkat, kaza {d}",ar:"تحذير حادث {d}",ku:"Hişyarî, qeza li {d}",fr:"Attention, accident à {d}"} },
    { id:"baustelle", icon:"🚧", color:"#ffaa33", beep:"medium", zones:[2000,1000,500],
      name:{de:"Baustelle",en:"Road Work",tr:"Yol Çalışması",ar:"أعمال طريق",ku:"Karê Rê",fr:"Travaux"},
      voice:{de:"Achtung, Baustelle in {d}",en:"Warning, road work in {d}",tr:"Dikkat, yol çalışması {d}",ar:"تحذير أعمال طريق {d}",ku:"Hişyarî, karê rê li {d}",fr:"Attention, travaux à {d}"} },
    { id:"polizei", icon:"👮", color:"#4499ff", beep:"medium", zones:[2000,1000,500],
      name:{de:"Polizei",en:"Police",tr:"Polis",ar:"شرطة",ku:"Polîs",fr:"Police"},
      voice:{de:"Achtung, Polizei in {d}",en:"Warning, police in {d}",tr:"Dikkat, polis {d}",ar:"تحذير شرطة {d}",ku:"Hişyarî, polîs li {d}",fr:"Attention, police à {d}"} },
    { id:"ezidi", icon:"🦚", color:"#ffd700", beep:"medium", zones:[5000,2000,1000],
      name:{de:"Ezidi-Zentrum",en:"Ezidi Center",tr:"Ezidi Merkezi",ar:"مركز إيزيدي",ku:"Navenda Êzîdî",fr:"Centre Ezidi"},
      voice:{de:"Ezidi-Zentrum in {d}",en:"Ezidi center in {d}",tr:"Ezidi merkezi {d}",ar:"مركز إيزيدي {d}",ku:"Navenda Êzîdî li {d}",fr:"Centre Ezidi à {d}"} },
    { id:"raststaette", icon:"🅿️", color:"#66cc66", beep:"low", zones:[2000,1000,500],
      name:{de:"Raststätte",en:"Rest Area",tr:"Dinlenme Tesisi",ar:"استراحة",ku:"Qada Bêhnvedanê",fr:"Aire de repos"},
      voice:{de:"Raststätte in {d}",en:"Rest area in {d}",tr:"Dinlenme tesisi {d}",ar:"استراحة {d}",ku:"Qada bêhnvedanê li {d}",fr:"Aire de repos à {d}"} },
    { id:"tankstelle", icon:"⛽", color:"#66cc66", beep:"low", zones:[1000,500],
      name:{de:"Tankstelle",en:"Gas Station",tr:"Benzinlik",ar:"محطة وقود",ku:"Benzîngeh",fr:"Station essence"},
      voice:{de:"Tankstelle in {d}",en:"Gas station in {d}",tr:"Benzinlik {d}",ar:"محطة وقود {d}",ku:"Benzîngeh li {d}",fr:"Station essence à {d}"} }
  ];

  var LANGS = {
    de:{ name:"Deutsch", code:"de-DE" },
    en:{ name:"English", code:"en-US" },
    tr:{ name:"Türkçe", code:"tr-TR" },
    ar:{ name:"العربية", code:"ar-SA" },
    ku:{ name:"Kurdî (Ezidi)", code:"tr-TR" }, // Fallback auf TR-Stimme, da Standard-TTS kein Kurdisch kann
    fr:{ name:"Français", code:"fr-FR" }
  };

  var DEFAULT_SETTINGS = {
    enabled: {}, lang:"de", voiceOn:true, beepOn:true, vibrateOn:true,
    pauseAfterMin: 120, warnFactor: 1.0
  };
  CATS.forEach(function(c){ DEFAULT_SETTINGS.enabled[c.id] = true; });

  /* ═══════════ 2. UTILS & AUDIO ═══════════ */
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
    (patterns[pattern]||patterns.medium).forEach(function(b){
      var o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = b.f; o.type = "sine";
      g.gain.setValueAtTime(0, now+b.t);
      g.gain.linearRampToValueAtTime(vol, now+b.t+0.01);
      g.gain.exponentialRampToValueAtTime(0.001, now+b.t+b.d);
      o.connect(g).connect(ctx.destination);
      o.start(now+b.t); o.stop(now+b.t+b.d+0.02);
    });
  }
  function vibrate(pattern){
    if(!navigator.vibrate) return;
    var p = { urgent:[100,50,100,50,100], alarm:[150,50,150,50,150], medium:[200,100,200], low:[300] }[pattern] || [200];
    try { navigator.vibrate(p); } catch(e){}
  }

  /* ═══════════ 3. RENDER FUNKTION ═══════════ */
  function render(container, ctx){
    var store = ctx.store;
    var view = { screen:"cockpit" };
    var geoWatch = null, lastPos = null;
    var trip = { active:false, startTime:0, distance:0, warnings:0 };
    var map = null, mapMarkers = [];
    var triggered = {};

    // ─── State Helpers ───
    function getSettings(){
      var s = store.get("settings", {});
      var m = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      Object.keys(s).forEach(function(k){ m[k] = s[k]; });
      if(!m.enabled || Object.keys(m.enabled).length === 0) m.enabled = DEFAULT_SETTINGS.enabled;
      return m;
    }
    function saveSettings(s){ store.set("settings", s); }
    function getWarnings(){ return store.get("warnings", []); }
    function saveWarnings(w){ store.set("warnings", w); }
    function getCustomVoice(){ return store.get("customVoice", {}); }

    // ─── Main Build ───
    function build(){
      if(view.screen === "cockpit") screenCockpit();
      else if(view.screen === "map") screenMap();
      else if(view.screen === "settings") screenSettings();
      else if(view.screen === "add") screenAdd();
      else if(view.screen === "list") screenList();
    }

    /* ═══════════ COCKPIT VIEW ═══════════ */
    function screenCockpit(){
      var s = getSettings();
      var speed = lastPos ? Math.round((lastPos.coords.speed||0)*3.6) : 0;
      var warnings = getWarnings();
      var nextWarn = null, minDist = Infinity;

      if(lastPos){
        warnings.forEach(function(w){
          if(!s.enabled[w.cat]) return;
          var d = haversine(lastPos.coords.latitude, lastPos.coords.longitude, w.lat, w.lng);
          if(d < minDist){ minDist = d; nextWarn = { w:w, d:d }; }
        });
      }

      var html = '<style>'
        + '.cpt-wrap{display:flex;flex-direction:column;height:100%;min-height:calc(100vh - 120px);background:radial-gradient(circle at 50% 30%,#0a1220 0%,#050810 100%);border-radius:16px;padding:16px;position:relative;overflow:hidden}'
        + '.cpt-tacho{position:relative;width:240px;height:240px;margin:20px auto;border-radius:50%;background:conic-gradient(from 180deg at 50% 50%, #4dd0e1 0deg, #b478ff '+Math.min(360,speed*1.5)+'deg, transparent '+Math.min(360,speed*1.5)+'deg);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(77,208,225,.2)}'
        + '.cpt-tacho::before{content:"";position:absolute;inset:8px;border-radius:50%;background:#050810;}'
        + '.cpt-speed{position:relative;font-size:72px;font-weight:900;color:#fff;line-height:1;font-variant-numeric:tabular-nums;text-shadow:0 0 20px rgba(77,208,225,.5)}'
        + '.cpt-unit{position:relative;font-size:12px;color:#7fa5b8;font-weight:800;letter-spacing:2px;margin-top:-4px}'
        + '</style>';

      html += '<div class="cpt-wrap">';
      
      // Top Bar
      html += '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;z-index:10">'
        + '<div style="display:flex;gap:6px">'
        + '<button data-nav="map" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:8px 12px;border-radius:10px;font-size:11px;font-weight:800;cursor:pointer">🗺️ Karte</button>'
        + '<button data-nav="list" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:8px 12px;border-radius:10px;font-size:11px;font-weight:800;cursor:pointer">📋 Liste</button>'
        + '</div>'
        + '<button data-nav="settings" style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);color:#fff;padding:8px 12px;border-radius:10px;font-size:11px;font-weight:800;cursor:pointer">⚙️</button>'
        + '</div>';

      // Tacho
      html += '<div class="cpt-tacho">'
        + '<div style="text-align:center">'
        + '<div class="cpt-speed">'+speed+'</div>'
        + '<div class="cpt-unit">KM/H</div>'
        + '</div></div>';

      // Next Warning
      html += '<div style="text-align:center;margin-top:10px;z-index:10">';
      if(nextWarn){
        var cat = CATS.find(function(c){return c.id===nextWarn.w.cat;}) || CATS[0];
        html += '<div style="display:inline-flex;align-items:center;gap:10px;padding:10px 20px;background:'+cat.color+'15;border:1px solid '+cat.color+'66;border-radius:14px">'
          + '<div style="font-size:32px">'+cat.icon+'</div>'
          + '<div style="text-align:left"><div style="font-size:14px;font-weight:900;color:'+cat.color+'">'+_esc(cat.name[s.lang])+'</div>'
          + '<div style="font-size:16px;font-weight:800;color:#fff">in '+fmtDist(nextWarn.d)+'</div></div>'
          + '</div>';
      } else {
        html += '<div style="display:inline-flex;align-items:center;gap:10px;padding:10px 20px;background:rgba(74,222,128,.1);border:1px solid rgba(74,222,128,.3);border-radius:14px">'
          + '<div style="font-size:24px">✅</div><div style="font-size:12px;font-weight:900;color:#4ade80">Keine Warnungen voraus</div>'
          + '</div>';
      }
      html += '</div>';

      // Trip Bar
      html += '<div style="margin-top:auto;z-index:10;background:rgba(0,0,0,.4);backdrop-filter:blur(10px);border-radius:16px;padding:14px;border:1px solid rgba(255,255,255,.08)">'
        + '<div style="display:flex;justify-content:space-around;text-align:center;margin-bottom:10px">'
        + '<div><div style="font-size:18px;font-weight:900;color:#4dd0e1">'+trip.distance.toFixed(1)+' km</div><div style="font-size:9px;color:#7fa5b8;font-weight:800">STRECKE</div></div>'
        + '<div><div style="font-size:18px;font-weight:900;color:#4dd0e1">'+Math.floor((Date.now()-trip.startTime)/60000)+' min</div><div style="font-size:9px;color:#7fa5b8;font-weight:800">ZEIT</div></div>'
        + '<div><div style="font-size:18px;font-weight:900;color:#ffd54f">'+trip.warnings+'</div><div style="font-size:9px;color:#7fa5b8;font-weight:800">WARNUNGEN</div></div>'
        + '</div>'
        + (trip.active
            ? '<button class="btn danger full" data-trip="stop" style="padding:14px;font-weight:900">⏹ Fahrt beenden</button>'
            : '<button class="btn full" data-trip="start" style="padding:14px;font-weight:900;background:linear-gradient(135deg,#4ade80,#22c55e);color:#000">▶ Fahrt starten</button>')
        + '</div>';

      html += '</div>';
      container.innerHTML = html;
      bindCockpit();
    }

    /* ═══════════ MAP VIEW ═══════════ */
    function screenMap(){
      var html = '<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card" style="padding:0;overflow:hidden;height:calc(100vh - 200px);position:relative">'
        + '<div id="blMap" style="width:100%;height:100%;background:#0a1220"></div>'
        + '<button data-nav="add" style="position:absolute;bottom:20px;right:20px;width:56px;height:56px;border-radius:50%;background:#4dd0e1;color:#000;border:none;font-size:28px;font-weight:900;cursor:pointer;box-shadow:0 4px 20px rgba(77,208,225,.5);z-index:1000">+</button>'
        + '</div>';
      container.innerHTML = html;
      bindNav();
      initMap();
    }

    function initMap(){
      if(!document.getElementById("leaflet-css")){
        var lc = document.createElement("link");
        lc.id = "leaflet-css"; lc.rel = "stylesheet"; lc.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(lc);
      }
      if(window.L) return buildMap();
      var s = document.createElement("script");
      s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      s.onload = buildMap;
      document.head.appendChild(s);
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
      var warnings = getWarnings();
      warnings.forEach(function(w){
        var cat = CATS.find(function(c){return c.id===w.cat;}) || CATS[0];
        var icon = L.divIcon({
          html: '<div style="background:'+cat.color+';color:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;font-size:18px;border:2px solid #fff;box-shadow:0 2px 10px rgba(0,0,0,.6)">'+cat.icon+'</div>',
          className:"", iconSize:[36,36], iconAnchor:[18,18]
        });
        mapMarkers.push(L.marker([w.lat, w.lng], { icon:icon }).addTo(map).bindPopup(_esc(cat.name.de)));
      });
      if(lastPos){
        var uicon = L.divIcon({
          html: '<div style="background:#4dd0e1;border:3px solid #fff;border-radius:50%;width:24px;height:24px;box-shadow:0 0 20px #4dd0e1"></div>',
          className:"", iconSize:[24,24], iconAnchor:[12,12]
        });
        mapMarkers.push(L.marker([lastPos.coords.latitude, lastPos.coords.longitude], { icon:uicon }).addTo(map));
        map.setView([lastPos.coords.latitude, lastPos.coords.longitude]);
      }
    }

    /* ═══════════ ADD WARNING ═══════════ */
    function screenAdd(){
      if(!lastPos){
        container.innerHTML = '<div class="card" style="text-align:center;padding:30px"><div style="font-size:44px">📍</div><div style="font-size:14px;font-weight:900;color:#ff8080;margin-top:10px">GPS nicht aktiv</div><button class="btn full" data-nav="cockpit" style="margin-top:16px">Zurück</button></div>';
        bindNav(); return;
      }
      var lat = lastPos.coords.latitude.toFixed(6);
      var lng = lastPos.coords.longitude.toFixed(6);
      var html = '<button data-nav="map" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Abbrechen</button>'
        + '<div class="card"><h3>Neue Warnung</h3>'
        + '<div class="field"><label>Kategorie</label>'
        + '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px" id="catGrid">';
      CATS.forEach(function(c){
        html += '<button data-cat="'+c.id+'" style="padding:10px 4px;background:rgba(0,0,0,.3);border:1.5px solid rgba(255,255,255,.1);border-radius:10px;cursor:pointer;color:inherit;font-family:inherit;text-align:center;transition:.15s">'
          + '<div style="font-size:22px">'+c.icon+'</div>'
          + '<div style="font-size:9.5px;color:var(--text-mute);margin-top:4px;font-weight:800;line-height:1.2">'+_esc(c.name.de)+'</div>'
          + '</button>';
      });
      html += '</div></div>'
        + '<div class="field"><label>Notiz (optional)</label><input id="addNote" placeholder="z.B. Hinter der Brücke..." maxlength="60" style="font-size:13px"></div>'
        + '<button class="btn full" id="saveWarn" style="padding:14px;margin-top:10px">💾 Speichern</button>'
        + '</div>';
      container.innerHTML = html;
      
      var selectedCat = null;
      container.querySelectorAll("[data-cat]").forEach(function(el){
        el.addEventListener("click", function(){
          selectedCat = el.dataset.cat;
          container.querySelectorAll("[data-cat]").forEach(function(x){
            var c = CATS.find(function(c){return c.id===x.dataset.cat;});
            var active = x.dataset.cat === selectedCat;
            x.style.borderColor = active ? c.color : "rgba(255,255,255,.1)";
            x.style.background = active ? (c.color + "22") : "rgba(0,0,0,.3)";
          });
        });
      });
      container.querySelector("#saveWarn").addEventListener("click", function(){
        if(!selectedCat){ alert("Bitte Kategorie wählen."); return; }
        var warnings = getWarnings();
        warnings.push({
          id: "w"+Date.now(), cat: selectedCat, lat: lastPos.coords.latitude, lng: lastPos.coords.longitude,
          note: container.querySelector("#addNote").value.trim(), created: Date.now()
        });
        saveWarnings(warnings);
        if(HalDo.Notify) HalDo.Notify.success("Warnung gespeichert");
        view.screen = "map"; build();
      });
      bindNav();
    }

    /* ═══════════ LIST VIEW ═══════════ */
    function screenList(){
      var warnings = getWarnings();
      var html = '<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>'
        + '<div class="card"><h3>📋 Meine Warnungen ('+warnings.length+')</h3>';
      if(!warnings.length){
        html += '<div style="text-align:center;color:var(--text-mute);padding:20px;font-size:12px">Keine Warnungen gespeichert.</div>';
      } else {
        warnings.slice().reverse().forEach(function(w){
          var c = CATS.find(function(x){return x.id===w.cat;}) || CATS[0];
          html += '<div style="padding:10px;background:rgba(0,0,0,.3);border-radius:10px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center;border-left:3px solid '+c.color+'">'
            + '<div style="flex:1;min-width:0"><div style="font-size:13px;font-weight:900">'+c.icon+' '+_esc(c.name.de)+'</div>'
            + '<div style="font-size:10px;color:var(--text-mute)">'+w.lat.toFixed(4)+', '+w.lng.toFixed(4)+'</div></div>'
            + '<button data-del="'+w.id+'" style="background:rgba(255,128,128,.2);border:none;color:#ff8080;border-radius:6px;padding:6px 10px;font-size:11px;cursor:pointer">✕</button>'
            + '</div>';
        });
      }
      html += '</div>';
      container.innerHTML = html;
      container.querySelectorAll("[data-del]").forEach(function(el){
        el.addEventListener("click", function(){
          if(!confirm("Löschen?")) return;
          saveWarnings(getWarnings().filter(function(w){return w.id!==el.dataset.del;}));
          screenList();
        });
      });
      bindNav();
    }

    /* ═══════════ SETTINGS VIEW ═══════════ */
    function screenSettings(){
      var s = getSettings();
      var customVoice = getCustomVoice();

      var html = '<button data-nav="cockpit" style="background:transparent;border:none;color:#4dd0e1;cursor:pointer;font-size:12px;font-weight:900;padding:6px 0;margin-bottom:6px">← Zurück</button>';

      // Sprache
      html += '<div class="card"><h3>🌍 Sprache & Stimme</h3>'
        + '<div class="field"><label>Warn-Sprache</label><select id="setLang" style="font-size:14px;padding:12px">'
        + Object.keys(LANGS).map(function(k){ return '<option value="'+k+'"'+(s.lang===k?" selected":"")+'>'+LANGS[k].name+'</option>'; }).join('')
        + '</select></div>'
        + '<div style="display:flex;gap:6px;margin-top:8px">'
        + '<button class="btn sec" id="testVoice" style="flex:1;font-size:11px">🔊 TTS Test</button>'
        + '<button class="btn sec" id="testBeep" style="flex:1;font-size:11px">🔔 Beep Test</button>'
        + '</div>'
        + '<div style="display:flex;gap:6px;margin-top:6px">'
        + '<button data-toggle="voiceOn" style="flex:1;padding:8px;background:'+(s.voiceOn?'rgba(74,222,128,.2)':'rgba(0,0,0,.3)')+';border:1px solid '+(s.voiceOn?'#4ade80':'rgba(255,255,255,.1)')+';color:'+(s.voiceOn?'#4ade80':'var(--text-mute)')+';border-radius:8px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit">Sprache '+(s.voiceOn?'AN':'AUS')+'</button>'
        + '<button data-toggle="beepOn" style="flex:1;padding:8px;background:'+(s.beepOn?'rgba(74,222,128,.2)':'rgba(0,0,0,.3)')+';border:1px solid '+(s.beepOn?'#4ade80':'rgba(255,255,255,.1)')+';color:'+(s.beepOn?'#4ade80':'var(--text-mute)')+';border-radius:8px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit">Beep '+(s.beepOn?'AN':'AUS')+'</button>'
        + '<button data-toggle="vibrateOn" style="flex:1;padding:8px;background:'+(s.vibrateOn?'rgba(74,222,128,.2)':'rgba(0,0,0,.3)')+';border:1px solid '+(s.vibrateOn?'#4ade80':'rgba(255,255,255,.1)')+';color:'+(s.vibrateOn?'#4ade80':'var(--text-mute)')+';border-radius:8px;font-size:10px;font-weight:800;cursor:pointer;font-family:inherit">Vibration '+(s.vibrateOn?'AN':'AUS')+'</button>'
        + '</div></div>';

      // Eigene Stimme
      html += '<div class="card"><h3>🎤 Eigene Stimme (A-Z)</h3>'
        + '<div style="font-size:10.5px;color:var(--text-mute);margin-bottom:8px">Nimm deine eigene Warnung pro Kategorie auf (z.B. auf Ezidi!).</div>';
      CATS.forEach(function(c){
        var has = !!customVoice[c.id];
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">'
          + '<span style="font-size:12px;font-weight:800">'+c.icon+' '+_esc(c.name.de)+'</span>'
          + '<button data-rec="'+c.id+'" style="background:'+(has?'rgba(74,222,128,.15)':'rgba(77,208,225,.15)')+';border:1px solid '+(has?'#4ade80':'#4dd0e1')+';color:'+(has?'#4ade80':'#4dd0e1')+';border-radius:6px;padding:5px 10px;font-size:10px;cursor:pointer;font-weight:800">'+(has?'✓ Neu aufnehmen':'🎤 Aufnehmen')+'</button>'
          + '</div>';
      });
      html += '</div>';

      // Kategorien
      html += '<div class="card"><h3>🎯 Kategorien</h3>';
      CATS.forEach(function(c){
        html += '<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.05)">'
          + '<span style="font-size:12px;font-weight:800">'+c.icon+' '+_esc(c.name.de)+'</span>'
          + '<button data-tgcat="'+c.id+'" style="background:'+(s.enabled[c.id]?'#4ade80':'rgba(255,255,255,.1)')+';border:none;width:44px;height:24px;border-radius:12px;cursor:pointer;color:'+(s.enabled[c.id]?'#000':'#fff')+';font-size:11px;font-weight:900;position:relative">'+(s.enabled[c.id]?'✓':'✕')+'</button>'
          + '</div>';
      });
      html += '</div>';

      container.innerHTML = html;
      
      // Bind Settings
      container.querySelector("#setLang").addEventListener("change", function(e){ s.lang = e.target.value; saveSettings(s); });
      container.querySelectorAll("[data-toggle]").forEach(function(el){
        el.addEventListener("click", function(){ var k = el.dataset.toggle; s[k] = !s[k]; saveSettings(s); screenSettings(); });
      });
      container.querySelector("#testVoice").addEventListener("click", function(){
        var cat = CATS[0];
        speakAlert(cat, 500, s);
      });
      container.querySelector("#testBeep").addEventListener("click", function(){ playBeep("urgent", 0.8); });
      container.querySelectorAll("[data-tgcat]").forEach(function(el){
        el.addEventListener("click", function(){ var k = el.dataset.tgcat; s.enabled[k] = !s.enabled[k]; saveSettings(s); screenSettings(); });
      });
      container.querySelectorAll("[data-rec]").forEach(function(el){
        el.addEventListener("click", function(){ recordVoice(el.dataset.rec, s); });
      });
      bindNav();
    }

    /* ═══════════ AUFNAHME & SPRACHWARNUNG ═══════════ */
    function recordVoice(catId, settings){
      var cat = CATS.find(function(c){return c.id===catId;});
      if(!navigator.mediaDevices){ alert("Mikrofon nicht verfügbar"); return; }
      
      var overlay = document.createElement("div");
      overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:99999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:20px;color:#fff;text-align:center";
      overlay.innerHTML = '<div style="font-size:44px">'+cat.icon+'</div>'
        + '<div style="font-size:14px;font-weight:900;color:#4dd0e1;margin:10px 0">Aufnahme: '+cat.name.de+'</div>'
        + '<div id="recStatus" style="font-size:12px;color:#ff5555;margin-bottom:20px">🔴 Aufnahme läuft...</div>'
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

    function speakAlert(cat, dist, settings){
      var cv = getCustomVoice();
      if(cv[cat.id]){
        var a = new Audio(cv[cat.id]);
        a.play().catch(function(){});
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
      if(settings.vibrateOn) vibrate(cat.beep);
    }

    /* ═══════════ GEOLOCATION & TRIGGER ═══════════ */
    function startGeo(){
      if(!navigator.geolocation){ if(HalDo.Notify) HalDo.Notify.error("GPS nicht verfügbar"); return; }
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
        var dist = container.querySelector("#tripDist");
        if(dist) dist.textContent = trip.distance.toFixed(1) + " km";
      }
      if(view.screen === "map") updateMapMarkers();
    }
    function onErr(err){ console.warn("[Blitzer] GPS:", err.message); }

    function checkTriggers(pos){
      var s = getSettings();
      var warnings = getWarnings();
      var lat = pos.coords.latitude, lng = pos.coords.longitude;

      warnings.forEach(function(w){
        if(!s.enabled[w.cat]) return;
        var cat = CATS.find(function(c){return c.id===w.cat;}); if(!cat) return;
        var dist = haversine(lat, lng, w.lat, w.lng);
        
        for(var i=0; i<cat.zones.length; i++){
          var zoneDist = cat.zones[i] * s.warnFactor;
          var key = w.id + "_z" + i;
          if(dist <= zoneDist && !triggered[key]){
            triggered[key] = true;
            speakAlert(cat, dist, s);
            trip.warnings++;
            if(view.screen === "cockpit"){
              var wn = container.querySelector("#tripWarn");
              if(wn) wn.textContent = trip.warnings;
            }
            break;
          }
        }
        if(dist > (cat.zones[0] * s.warnFactor) + 500){
          for(var j=0; j<cat.zones.length; j++) delete triggered[w.id + "_z" + j];
        }
      });
    }

    /* ═══════════ BINDINGS ═══════════ */
    function bindNav(){
      container.querySelectorAll("[data-nav]").forEach(function(el){
        el.addEventListener("click", function(){ view.screen = el.dataset.nav; build(); });
      });
    }

    function bindCockpit(){
      bindNav();
      var tb = container.querySelector("[data-trip]");
      if(tb) tb.addEventListener("click", function(){
        if(tb.dataset.trip === "start"){
          trip = { active:true, startTime:Date.now(), distance:0, warnings:0 };
          if(HalDo.Notify) HalDo.Notify.success("Fahrt gestartet. Gute Fahrt!");
        } else {
          trip.active = false;
          if(HalDo.Notify) HalDo.Notify.info("Fahrt beendet: " + trip.distance.toFixed(1) + " km");
        }
        screenCockpit();
      });
    }

    // ─── START ───
    startGeo();
    build();
  }

  HalDoApp("blitzer", { name: "Blitzer", icon: "⚠️", render: render, category: "werkzeuge" });
  console.log("🦚 blitzer.js v3.0 geladen — Cockpit · GPS · Karte · 6 Sprachen (Ezidi) · Eigene Stimme");
})();
