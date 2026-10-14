/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — NOTIFICATIONS MANAGER (v150)
   Beep · Voice · System-Popup · App-übergreifend
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Notify = (function(){
  "use strict";

  /* ═══ Standard-Einstellungen ═══ */
  var DEFAULTS = {
    master: true,          /* Haupt-Schalter */
    beep: true,            /* Piepton */
    voice: true,           /* Sprachansage */
    system: false,         /* System-Popup (außerhalb App) */
    vibrate: true,         /* Vibration */
    volume: 0.5,           /* Lautstärke 0-1 */
    beepStyle: "classic",  /* classic / soft / alarm / digital */

    /* Pro-Kategorie */
    cats: {
      blitzer:   { beep: true, voice: true, system: true },
      stau:      { beep: true, voice: false, system: false },
      unfall:    { beep: true, voice: true, system: true },
      baustelle: { beep: false, voice: false, system: false },
      sperrung:  { beep: true, voice: true, system: true },
      warnung:   { beep: true, voice: true, system: true },
      info:      { beep: false, voice: false, system: false }
    },

    /* Pro App */
    apps: {}   /* {appId: {enabled: true, beep: true, voice: true, system: true}} */
  };

  /* ═══ Beep-Sounds (verschiedene Stile) ═══ */
  var _audioCtx = null;
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
      o.connect(g);
      g.connect(c.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
      o.stop(c.currentTime + dur + 0.05);
    } catch(e){}
  }

  var BEEPS = {
    classic: {
      blitzer: function(v){ _beep(1400, 0.12, v); setTimeout(function(){ _beep(1400, 0.12, v); }, 180); },
      stau:    function(v){ _beep(500, 0.4, v); },
      unfall:  function(v){ _beep(800, 0.2, v); setTimeout(function(){ _beep(600, 0.25, v); }, 250); },
      baustelle: function(v){ _beep(1000, 0.1, v); setTimeout(function(){ _beep(1000, 0.1, v); }, 150); },
      sperrung: function(v){ _beep(400, 0.5, v); },
      warnung: function(v){ _beep(1200, 0.3, v); },
      info:    function(v){ _beep(900, 0.15, v); }
    },
    soft: {
      blitzer: function(v){ _beep(800, 0.3, v); setTimeout(function(){ _beep(1000, 0.3, v); }, 250); },
      stau:    function(v){ _beep(400, 0.5, v); },
      unfall:  function(v){ _beep(600, 0.4, v); },
      baustelle: function(v){ _beep(700, 0.3, v); },
      sperrung: function(v){ _beep(350, 0.6, v); },
      warnung: function(v){ _beep(800, 0.4, v); },
      info:    function(v){ _beep(600, 0.2, v); }
    },
    alarm: {
      blitzer: function(v){ _beep(1600, 0.15, v); setTimeout(function(){ _beep(1600, 0.15, v); }, 200); setTimeout(function(){ _beep(1600, 0.15, v); }, 400); },
      stau:    function(v){ _beep(600, 0.3, v); setTimeout(function(){ _beep(700, 0.3, v); }, 350); },
      unfall:  function(v){ _beep(900, 0.2, v); setTimeout(function(){ _beep(900, 0.2, v); }, 300); setTimeout(function(){ _beep(900, 0.2, v); }, 600); },
      baustelle: function(v){ _beep(1100, 0.12, v); setTimeout(function(){ _beep(1100, 0.12, v); }, 180); },
      sperrung: function(v){ _beep(500, 0.4, v); setTimeout(function(){ _beep(400, 0.4, v); }, 450); },
      warnung: function(v){ _beep(1300, 0.25, v); setTimeout(function(){ _beep(1300, 0.25, v); }, 350); },
      info:    function(v){ _beep(800, 0.15, v); }
    },
    digital: {
      blitzer: function(v){ _beep(2000, 0.05, v); setTimeout(function(){ _beep(1600, 0.05, v); }, 70); setTimeout(function(){ _beep(2000, 0.05, v); }, 140); },
      stau:    function(v){ _beep(300, 0.15, v); setTimeout(function(){ _beep(400, 0.15, v); }, 200); },
      unfall:  function(v){ _beep(1800, 0.08, v); setTimeout(function(){ _beep(1400, 0.08, v); }, 120); },
      baustelle: function(v){ _beep(1500, 0.06, v); setTimeout(function(){ _beep(1700, 0.06, v); }, 100); },
      sperrung: function(v){ _beep(250, 0.2, v); setTimeout(function(){ _beep(200, 0.2, v); }, 250); },
      warnung: function(v){ _beep(1900, 0.1, v); setTimeout(function(){ _beep(1500, 0.1, v); }, 150); },
      info:    function(v){ _beep(1200, 0.08, v); }
    }
  };

  /* ═══ Einstellungen laden/speichern ═══ */
  function get(){ return Object.assign({}, DEFAULTS, window.HalDo.Config.get("notify", {})); }
  function save(s){ window.HalDo.Config.set("notify", s); }
  function set(k, v){
    var s = get();
    s[k] = v;
    save(s);
    applyConfig();
  }
  function setCat(cat, k, v){
    var s = get();
    if(!s.cats[cat]) s.cats[cat] = {};
    s.cats[cat][k] = v;
    save(s);
  }
  function setApp(appId, k, v){
    var s = get();
    if(!s.apps[appId]) s.apps[appId] = { enabled: true, beep: true, voice: true, system: false };
    s.apps[appId][k] = v;
    save(s);
  }
  function getApp(appId){
    var s = get();
    if(!s.apps[appId]) return { enabled: true, beep: true, voice: true, system: false };
    return s.apps[appId];
  }

  /* ═══ Wichtige Funktion: auslösen ═══ */
  function fire(category, title, text, opts){
    opts = opts || {};
    var appId = opts.app || "system";
    var s = get();

    /* Master-Schalter prüfen */
    if(!s.master) return false;

    /* App-Schalter prüfen */
    var appSet = getApp(appId);
    if(appSet.enabled === false) return false;

    /* Kategorie-Einstellungen */
    var cat = s.cats[category] || s.cats.warnung || {};

    /* Beep prüfen */
    var shouldBeep = opts.beep !== undefined ? opts.beep : (cat.beep && s.beep && appSet.beep !== false);
    if(shouldBeep){
      var style = s.beepStyle || "classic";
      var fn = BEEPS[style] && BEEPS[style][category];
      if(fn) fn(s.volume || 0.5);
      else _beep(800, 0.2, s.volume || 0.5);
    }

    /* Voice prüfen */
    var shouldVoice = opts.voice !== undefined ? opts.voice : (cat.voice && s.voice && appSet.voice !== false);
    if(shouldVoice && text && window.HalDo.Voice){
      var prefix = "";
      if(category === "blitzer") prefix = "Achtung Blitzer! ";
      else if(category === "unfall") prefix = "Unfall! ";
      else if(category === "sperrung") prefix = "Sperrung! ";
      else if(category === "stau") prefix = "Stau! ";
      else if(category === "baustelle") prefix = "Baustelle! ";
      window.HalDo.Voice.speak(prefix + text, opts.voiceId);
    }

    /* System-Popup prüfen */
    var shouldSystem = opts.system !== undefined ? opts.system : (cat.system && s.system && appSet.system !== false);
    if(shouldSystem){
      showSystem(title || "🦚 HalDo", text || "");
    }

    /* Vibrate */
    if(s.vibrate && navigator.vibrate){
      try {
        if(category === "blitzer") navigator.vibrate([200, 100, 200, 100, 200]);
        else if(category === "unfall") navigator.vibrate([300, 200, 300]);
        else if(category === "sperrung") navigator.vibrate([500]);
        else navigator.vibrate([200]);
      } catch(e){}
    }

    /* Toast in-App */
    _toast(title || "ℹ️", text);

    return true;
  }

  /* ═══ System-Popup ═══ */
  function showSystem(title, text){
    if(!("Notification" in window)) return;
    if(Notification.permission === "granted"){
      _doSystem(title, text);
    } else if(Notification.permission !== "denied"){
      Notification.requestPermission().then(function(p){
        if(p === "granted") _doSystem(title, text);
      });
    }
  }

  function _doSystem(title, text){
    try {
      var n = new Notification(title, {
        body: text,
        icon: "logo.png",
        tag: "haldo-" + Date.now(),
        silent: true
      });
      setTimeout(function(){ try { n.close(); } catch(e){} }, 10000);
    } catch(e){}
  }

  /* ═══ Request Permission ═══ */
  function requestPermission(){
    if(!("Notification" in window)) return Promise.reject(new Error("Nicht unterstützt"));
    if(Notification.permission === "granted") return Promise.resolve("granted");
    return Notification.requestPermission();
  }

  /* ═══ Test aller Beeps ═══ */
  function testAll(){
    var cats = ["blitzer", "stau", "unfall", "baustelle", "sperrung", "warnung", "info"];
    var s = get();
    var style = s.beepStyle || "classic";
    var i = 0;
    function next(){
      if(i >= cats.length) return;
      var c = cats[i];
      var fn = BEEPS[style] && BEEPS[style][c];
      if(fn) fn(s.volume || 0.5);
      i++;
      setTimeout(next, 900);
    }
    next();
  }

  /* ═══ Konfiguration anwenden ═══ */
  function applyConfig(){
    var s = get();
    window.HalDo.Config.set("notify", s);
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
    if(window.HalDo.Kernel) HalDo.Kernel.log("Notify Manager bereit");
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
    DEFAULTS: DEFAULTS,
    /* Bequeme Aliase für Apps */
    info: function(txt, opts){ return fire("info", "ℹ️ Info", txt, opts); },
    warn: function(txt, opts){ return fire("warnung", "⚠️ Warnung", txt, opts); },
    blitzer: function(ort, opts){ return fire("blitzer", "📷 Blitzer", ort, opts); },
    stau: function(ort, opts){ return fire("stau", "🚗 Stau", ort, opts); },
    unfall: function(ort, opts){ return fire("unfall", "🚨 Unfall", ort, opts); },
    baustelle: function(ort, opts){ return fire("baustelle", "👷 Baustelle", ort, opts); },
    sperrung: function(ort, opts){ return fire("sperrung", "🚧 Sperrung", ort, opts); }
  };
})();

console.log("🦚 notifications.js geladen");
