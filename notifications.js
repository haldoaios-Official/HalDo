/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — NOTIFICATIONS MANAGER (v150c)
   Beep · Voice · Popup · Vibration · Taschenlampe · Distanz
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Notify = (function(){
  "use strict";

  var DEFAULTS = {
    master: true,
    beep: true,
    voice: true,
    system: false,
    vibrate: true,
    flashlight: false,
    volume: 0.5,
    beepStyle: "classic",
    distWarn: true,
    distNear: 500,
    distFar: 2000,
    cats: {
      blitzer:   { beep: true, voice: true, system: true },
      stau:      { beep: true, voice: false, system: false },
      unfall:    { beep: true, voice: true, system: true },
      baustelle: { beep: false, voice: false, system: false },
      sperrung:  { beep: true, voice: true, system: true },
      warnung:   { beep: true, voice: true, system: true },
      info:      { beep: false, voice: false, system: false }
    },
    apps: {}
  };

  var _audioCtx = null;
  var _swReg = null;
  var _flashStream = null;
  var _flashTrack = null;
  var _flashInterval = null;

  function _ctx(){
    if(!_audioCtx){
      try { _audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e){}
    }
    return _audioCtx;
  }

  function _beep(freq, dur, vol){
    var c = _ctx();
    if(!c) return;
    try {
      var o = c.createOscillator();
      var g = c.createGain();
      o.frequency.value = freq;
      o.type = "sine";
      g.gain.value = vol;
      o.connect(g); g.connect(c.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.stop(c.currentTime + dur + 0.05);
    } catch(e){}
  }

  var BEEPS = {
    classic: {
      blitzer: function(v){ _beep(1400, 0.12, v); setTimeout(function(){ _beep(1400, 0.12, v); }, 180); },
      stau: function(v){ _beep(500, 0.4, v); },
      unfall: function(v){ _beep(800, 0.2, v); setTimeout(function(){ _beep(600, 0.25, v); }, 250); },
      baustelle: function(v){ _beep(1000, 0.1, v); setTimeout(function(){ _beep(1000, 0.1, v); }, 150); },
      sperrung: function(v){ _beep(400, 0.5, v); },
      warnung: function(v){ _beep(1200, 0.3, v); },
      info: function(v){ _beep(900, 0.15, v); }
    },
    soft: {
      blitzer: function(v){ _beep(800, 0.3, v); setTimeout(function(){ _beep(1000, 0.3, v); }, 250); },
      stau: function(v){ _beep(400, 0.5, v); },
      unfall: function(v){ _beep(600, 0.4, v); },
      baustelle: function(v){ _beep(700, 0.3, v); },
      sperrung: function(v){ _beep(350, 0.6, v); },
      warnung: function(v){ _beep(800, 0.4, v); },
      info: function(v){ _beep(600, 0.2, v); }
    },
    alarm: {
      blitzer: function(v){ _beep(1600, 0.15, v); setTimeout(function(){ _beep(1600, 0.15, v); }, 200); setTimeout(function(){ _beep(1600, 0.15, v); }, 400); },
      stau: function(v){ _beep(600, 0.3, v); setTimeout(function(){ _beep(700, 0.3, v); }, 350); },
      unfall: function(v){ _beep(900, 0.2, v); setTimeout(function(){ _beep(900, 0.2, v); }, 300); setTimeout(function(){ _beep(900, 0.2, v); }, 600); },
      baustelle: function(v){ _beep(1100, 0.12, v); setTimeout(function(){ _beep(1100, 0.12, v); }, 180); },
      sperrung: function(v){ _beep(500, 0.4, v); setTimeout(function(){ _beep(400, 0.4, v); }, 450); },
      warnung: function(v){ _beep(1300, 0.25, v); setTimeout(function(){ _beep(1300, 0.25, v); }, 350); },
      info: function(v){ _beep(800, 0.15, v); }
    },
    digital: {
      blitzer: function(v){ _beep(2000, 0.05, v); setTimeout(function(){ _beep(1600, 0.05, v); }, 70); setTimeout(function(){ _beep(2000, 0.05, v); }, 140); },
      stau: function(v){ _beep(300, 0.15, v); setTimeout(function(){ _beep(400, 0.15, v); }, 200); },
      unfall: function(v){ _beep(1800, 0.08, v); setTimeout(function(){ _beep(1400, 0.08, v); }, 120); },
      baustelle: function(v){ _beep(1500, 0.06, v); setTimeout(function(){ _beep(1700, 0.06, v); }, 100); },
      sperrung: function(v){ _beep(250, 0.2, v); setTimeout(function(){ _beep(200, 0.2, v); }, 250); },
      warnung: function(v){ _beep(1900, 0.1, v); setTimeout(function(){ _beep(1500, 0.1, v); }, 150); },
      info: function(v){ _beep(1200, 0.08, v); }
    }
  };

  /* ═══ Settings ═══ */
  function get(){ return Object.assign({}, DEFAULTS, window.HalDo.Config.get("notify", {})); }
  function save(s){ window.HalDo.Config.set("notify", s); }
  function set(k, v){ var s = get(); s[k] = v; save(s); }
  function setCat(c, k, v){ var s = get(); if(!s.cats[c]) s.cats[c] = {}; s.cats[c][k] = v; save(s); }
  function setApp(id, k, v){ var s = get(); if(!s.apps[id]) s.apps[id] = {}; s.apps[id][k] = v; save(s); }
  function getApp(id){ var s = get(); return s.apps[id] || { enabled:true, beep:true, voice:true, system:false }; }

  /* ═══ Service Worker ═══ */
  function initSW(){
    if(!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("service-worker.js").then(function(reg){
      _swReg = reg;
      if(window.HalDo.Kernel) HalDo.Kernel.log("Service Worker aktiv");
    }).catch(function(e){
      console.warn("[Notify] SW Fehler:", e.message);
    });
  }

  /* ═══ Taschenlampe ═══ */
  function flashlightOn(){
    if(_flashStream) return Promise.resolve(true);
    if(!navigator.mediaDevices) return Promise.reject(new Error("Keine Kamera-API"));
    return navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
      .then(function(stream){
        _flashStream = stream;
        _flashTrack = stream.getVideoTracks()[0];
        if(_flashTrack.getCapabilities){
          var caps = _flashTrack.getCapabilities();
          if(caps.torch){
            return _flashTrack.applyConstraints({ advanced: [{ torch: true }] });
          }
        }
        throw new Error("Taschenlampe nicht verfügbar");
      });
  }
  function flashlightOff(){
    if(_flashTrack && _flashTrack.getCapabilities && _flashTrack.getCapabilities().torch){
      try { _flashTrack.applyConstraints({ advanced: [{ torch: false }] }); } catch(e){}
    }
    if(_flashStream){
      try { _flashStream.getTracks().forEach(function(t){ t.stop(); }); } catch(e){}
      _flashStream = null;
      _flashTrack = null;
    }
  }
  function flashlightBlink(times){
    times = times || 5;
    var i = 0;
    function on(){
      flashlightOn().then(function(){
        setTimeout(function(){
          flashlightOff();
          i++;
          if(i < times) setTimeout(on, 200);
        }, 200);
      }).catch(function(e){
        console.warn("[Flashlight]", e.message);
      });
    }
    on();
  }

  /* ═══ Fire (Hauptfunktion) ═══ */
  function fire(category, title, text, opts){
    opts = opts || {};
    var appId = opts.app || "system";
    var s = get();
    if(!s.master) return false;

    var appSet = getApp(appId);
    if(appSet.enabled === false) return false;
    var cat = s.cats[category] || s.cats.warnung || {};

    /* Priority: opts > app > category > global */
    var doBeep = opts.beep !== undefined ? opts.beep : (cat.beep && s.beep && appSet.beep !== false);
    var doVoice = opts.voice !== undefined ? opts.voice : (cat.voice && s.voice && appSet.voice !== false);
    var doSystem = opts.system !== undefined ? opts.system : (cat.system && s.system && appSet.system !== false);

    /* 1. BEEP */
    if(doBeep){
      var style = s.beepStyle || "classic";
      var fn = BEEPS[style] && BEEPS[style][category];
      if(fn) fn(s.volume || 0.5);
      else _beep(800, 0.2, s.volume || 0.5);
    }

    /* 2. VOICE */
    if(doVoice && text && window.HalDo.Voice){
      var prefix = "";
      if(category === "blitzer") prefix = "Achtung Blitzer! ";
      else if(category === "unfall") prefix = "Unfall! ";
      else if(category === "sperrung") prefix = "Sperrung! ";
      else if(category === "stau") prefix = "Stau! ";
      else if(category === "baustelle") prefix = "Baustelle! ";
      window.HalDo.Voice.speak(prefix + text, opts.voiceId);
    }

    /* 3. SYSTEM POPUP */
    if(doSystem){
      showSystem(title || "🦚 HalDo", text || "", appId);
    }

    /* 4. VIBRATION */
    if(s.vibrate && navigator.vibrate){
      try {
        if(category === "blitzer") navigator.vibrate([200,100,200,100,200]);
        else if(category === "unfall") navigator.vibrate([300,200,300]);
        else if(category === "sperrung") navigator.vibrate([500]);
        else navigator.vibrate([200]);
      } catch(e){}
    }

    /* 5. TASCHENLAMPE */
    if(s.flashlight){
      var blinkCount = 5;
      if(category === "unfall" || category === "sperrung") blinkCount = 8;
      if(category === "blitzer") blinkCount = 6;
      flashlightBlink(blinkCount);
    }

    /* 6. TOAST */
    _toast(title || "ℹ️", text);

    return true;
  }

  /* ═══ System-Popup (mit SW) ═══ */
  function showSystem(title, text, appId){
    if(!("Notification" in window)) return;
    var post = function(){
      if(_swReg && _swReg.active){
        _swReg.active.postMessage({
          type: "notify",
          title: title,
          body: text,
          app: appId || "chat",
          vibrate: [200,100,200],
          tag: "haldo-" + Date.now()
        });
      } else {
        try {
          var n = new Notification(title, {
            body: text,
            icon: "logo.png",
            tag: "haldo-" + Date.now(),
            requireInteraction: true,
            silent: true
          });
          setTimeout(function(){ try { n.close(); } catch(e){} }, 10000);
        } catch(e){}
      }
    };
    if(Notification.permission === "granted"){
      post();
    } else if(Notification.permission !== "denied"){
      Notification.requestPermission().then(function(p){
        if(p === "granted") post();
      });
    }
  }

  /* ═══ Distanz-basierte Warnung (für Verkehr) ═══ */
  function warnAtDistance(targetLat, targetLng, opts){
    opts = opts || {};
    var s = get();
    if(!s.distWarn) return null;
    if(!navigator.geolocation) return null;

    var far = opts.far || s.distFar || 2000;
    var near = opts.near || s.distNear || 500;
    var title = opts.title || "📷 Blitzer";
    var text = opts.text || "in der Nähe";
    var category = opts.cat || "blitzer";
    var appId = opts.app || "verkehr";

    var lastWarn = 0;
    var warned = { 2000:false, 1000:false, 500:false, 200:false };
    var iv = null;

    function haversine(lat1, lng1, lat2, lng2){
      var R = 6371000;
      var dLat = (lat2 - lat1) * Math.PI / 180;
      var dLng = (lng2 - lng1) * Math.PI / 180;
      var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
      var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    }

    function check(){
      navigator.geolocation.getCurrentPosition(function(pos){
        var dist = haversine(pos.coords.latitude, pos.coords.longitude, targetLat, targetLng);
        var mode = opts.mode || "forward";
        /* Warnstufen */
        if(dist <= near && !warned[500]){
          warned[500] = true;
          fire(category, title, "in " + Math.round(dist) + " Metern! " + text, { app: appId });
          if(window.HalDo.Voice) HalDo.Voice.speak("Achtung " + title.replace(/[^\w\säöüÄÖÜß]/g, "") + " in " + Math.round(dist) + " Metern");
        } else if(dist <= 1000 && !warned[1000]){
          warned[1000] = true;
          fire(category, "⚠️ " + title, "in 1 km · " + text, { app: appId });
        } else if(dist <= far && !warned[2000]){
          warned[2000] = true;
          fire(category, "⚠️ " + title, "in " + Math.round(dist) + " Metern · " + text, { app: appId });
        }
      }, function(e){
        /* kein GPS → ignorieren */
      }, { enableHighAccuracy: true, timeout: 5000 });
    }

    check();
    iv = setInterval(check, 5000);

    return {
      stop: function(){ if(iv){ clearInterval(iv); iv = null; } },
      reset: function(){ warned = { 2000:false, 1000:false, 500:false, 200:false }; }
    };
  }

  /* ═══ Permission ═══ */
  function requestPermission(){
    if(!("Notification" in window)) return Promise.reject(new Error("Nicht unterstützt"));
    if(Notification.permission === "granted") return Promise.resolve("granted");
    return Notification.requestPermission();
  }

  /* ═══ Test alle Beeps ═══ */
  function testAll(){
    var cats = ["blitzer", "stau", "unfall", "baustelle", "sperrung", "warnung", "info"];
    var s = get();
    var style = s.beepStyle || "classic";
    var i = 0;
    function next(){
      if(i >= cats.length) return;
      var fn = BEEPS[style] && BEEPS[style][cats[i]];
      if(fn) fn(s.volume || 0.5);
      i++;
      setTimeout(next, 900);
    }
    next();
  }

  function _toast(title, text){
    var t = document.getElementById("toast");
    if(!t) return;
    t.textContent = title + (text ? " · " + text.substring(0, 60) : "");
    t.className = "show ok";
    clearTimeout(t._t);
    t._t = setTimeout(function(){ t.className = ""; }, 3000);
  }

  function init(){
    initSW();
    if(window.HalDo.Kernel) HalDo.Kernel.log("Notify Manager bereit (mit SW + Flashlight)");
  }

  return {
    init: init,
    fire: fire,
    get: get,
    set: set,
    setCat: setCat,
    setApp: setApp,
    getApp: getApp,
    requestPermission: requestPermission,
    showSystem: showSystem,
    testAll: testAll,
    warnAtDistance: warnAtDistance,
    flashlightOn: flashlightOn,
    flashlightOff: flashlightOff,
    flashlightBlink: flashlightBlink,
    DEFAULTS: DEFAULTS,
    info: function(txt, opts){ return fire("info", "ℹ️ Info", txt, opts); },
    warn: function(txt, opts){ return fire("warnung", "⚠️ Warnung", txt, opts); },
    blitzer: function(ort, opts){ return fire("blitzer", "📷 Blitzer", ort, opts); },
    stau: function(ort, opts){ return fire("stau", "🚗 Stau", ort, opts); },
    unfall: function(ort, opts){ return fire("unfall", "🚨 Unfall", ort, opts); },
    baustelle: function(ort, opts){ return fire("baustelle", "👷 Baustelle", ort, opts); },
    sperrung: function(ort, opts){ return fire("sperrung", "🚧 Sperrung", ort, opts); }
  };
})();

console.log("🦚 notifications.js geladen (v150c mit Flashlight + Distanz)");
