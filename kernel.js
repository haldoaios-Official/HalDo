/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — KERNEL (v150)
   Boot-Chain · Zustände · Environment Detection
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Kernel = (function(){
  "use strict";

  /* ─────────── Zustände ─────────── */
  var STATE = {
    BOOTING:   "BOOTING",
    STARTING:  "STARTING",
    READY:     "READY",
    DEGRADED:  "DEGRADED",
    ERROR:     "ERROR",
    RECOVERY:  "RECOVERY"
  };

  var _state = STATE.BOOTING;
  var _log = [];
  var _services = {};
  var _modules = {};
  var _env = {};

  /* ─────────── Logging ─────────── */
  function log(msg, type){
    var time = new Date().toISOString().substring(11,23);
    var entry = "[" + time + "] " + msg;
    _log.push({t:Date.now(), m:msg, type:type||"info"});
    if(_log.length > 500) _log.shift();
    console.log("[HalDo Kernel] " + msg);
    var bs = document.getElementById("bootStatus");
    if(bs && _state === STATE.BOOTING) bs.textContent = msg;
  }

  /* ─────────── Boot-Screen Fortschritt ─────────── */
  var _bootProgress = 0;
  function setProgress(pct){
    _bootProgress = Math.min(100, Math.max(0, pct));
    var fill = document.getElementById("bootBarFill");
    if(fill) fill.style.width = _bootProgress + "%";
  }
  function progressTo(target){
    var steps = 20;
    var diff = target - _bootProgress;
    var stepSize = diff / steps;
    var i = 0;
    return new Promise(function(resolve){
      var iv = setInterval(function(){
        i++;
        setProgress(_bootProgress + stepSize);
        if(i >= steps){clearInterval(iv); setProgress(target); resolve();}
      }, 30);
    });
  }

  /* ─────────── Environment Detection ─────────── */
  function detectEnvironment(){
    _env = {
      isMobile: /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent),
      isTablet: /iPad|Tablet/i.test(navigator.userAgent),
      isDesktop: !(/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)),
      isIOS: /iPhone|iPad|iPod/i.test(navigator.userAgent),
      isAndroid: /Android/i.test(navigator.userAgent),
      isPWA: window.matchMedia && window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true,
      screenW: window.innerWidth,
      screenH: window.innerHeight,
      dpr: window.devicePixelRatio || 1,
      cores: navigator.hardwareConcurrency || 4,
      online: navigator.onLine !== false,
      language: navigator.language || "de-DE",
      timezone: (Intl && Intl.DateTimeFormat) ? Intl.DateTimeFormat().resolvedOptions().timeZone : "Europe/Berlin",
      hasTouch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
      hasSpeechRec: !!(window.SpeechRecognition || window.webkitSpeechRecognition),
      hasSpeechSynth: !!window.speechSynthesis,
      hasNotification: "Notification" in window,
      hasCamera: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      hasStorage: (function(){try{localStorage.setItem("_t","1");localStorage.removeItem("_t");return true;}catch(e){return false;}})(),
      hasAudioCtx: !!(window.AudioContext || window.webkitAudioContext),
      hasCanvas: !!document.createElement("canvas").getContext,
      hasWebGL: (function(){try{var c=document.createElement("canvas");return !!(c.getContext("webgl")||c.getContext("experimental-webgl"));}catch(e){return false;}})(),
      hasFileSystem: "showSaveFilePicker" in window || "webkitRequestFileSystem" in window
    };
    log("Environment: " + (_env.isMobile ? "Mobile" : _env.isTablet ? "Tablet" : "Desktop") + " · " + _env.cores + " Kerne · " + _env.screenW + "×" + _env.screenH);
    return _env;
  }

  /* ─────────── Boot-Chain ─────────── */
  function boot(){
    log("HalDo AI OS v150 wird gestartet…");
    setProgress(5);

    return progressTo(10)
      .then(function(){ log("Boot Detection…"); return progressTo(15); })
      .then(function(){ log("Environment Detection…"); detectEnvironment(); return progressTo(25); })
      .then(function(){ log("Storage Check…");
        if(!_env.hasStorage){ log("⚠ Storage nicht verfügbar — eingeschränkter Modus", "warn"); return STATE.DEGRADED; }
        return progressTo(35);
      })
      .then(function(){ log("Security Check…"); return progressTo(45); })
      .then(function(){ log("Configuration Load…");
        if(HalDo.Config && HalDo.Config.load) HalDo.Config.load();
        return progressTo(55);
      })
      .then(function(){ log("Kernel startet Dienste…"); return progressTo(65); })
      .then(function(){ log("System Services…");
        return runSystemServices();
      })
      .then(function(){ log("App Registry…"); return progressTo(80); })
      .then(function(){ log("App Manager…"); return progressTo(85); })
      .then(function(){ log("Runtime…"); return progressTo(90); })
      .then(function(){ log("Router + Window Manager…"); return progressTo(94); })
      .then(function(){ log("Display Layer…"); return progressTo(97); })
      .then(function(){ log("Cosmic World…"); return progressTo(99); })
      .then(function(){
        log("✅ READY");
        setProgress(100);
        _state = STATE.READY;
        return true;
      })
      .catch(function(err){
        log("❌ Boot-Fehler: " + (err.message || err), "error");
        _state = STATE.ERROR;
        return false;
      });
  }

  /* ─────────── System Services ─────────── */
  function runSystemServices(){
    return new Promise(function(resolve){
      setTimeout(function(){
        /* Prüfe wichtige APIs */
        _services.storage    = _env.hasStorage;
        _services.speech     = _env.hasSpeechSynth;
        _services.recognition= _env.hasSpeechRec;
        _services.notify     = _env.hasNotification;
        _services.camera     = _env.hasCamera;
        _services.canvas     = _env.hasCanvas;
        _services.audio      = _env.hasAudioCtx;
        _services.webgl      = _env.hasWebGL;
        resolve(true);
      }, 150);
    });
  }

  /* ─────────── Öffentliche API ─────────── */
  return {
    STATE: STATE,
    boot: boot,
    log: log,
    env: function(){return _env;},
    state: function(){return _state;},
    setState: function(s){ if(STATE[s]) _state = STATE[s]; },
    service: function(name){ return !!_services[name]; },
    services: function(){ return Object.assign({}, _services); },
    getLog: function(){ return _log.slice(); },
    getBootProgress: function(){ return _bootProgress; },
    register: function(name, mod){ _modules[name] = mod; log("Modul registriert: " + name); },
    module: function(name){ return _modules[name]; },
    modules: function(){ return Object.keys(_modules); }
  };
})();

console.log("🦚 kernel.js geladen");
