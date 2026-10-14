/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — CONFIG (v150)
   Konfiguration · Defaults · Persistenz
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Config = (function(){
  "use strict";

  var STORAGE_KEY = "haldo_config_v150";

  /* ─────────── Standardwerte ─────────── */
  var DEFAULTS = {
    /* Theme & Aussehen */
    theme: "kosmos",           /* kosmos | erde | holo */
    cyborg: false,             /* Cyberpunk/Pink Modus */
    logo: "logo.png",
    planetSpeed: 5,            /* 1-10 */
    clockOn: true,             /* Uhr-Planeten */
    reduceMotion: false,

    /* Sprache */
    lang: "de",                /* de | ku | ez | ar | tr | en | fa | ru | fr | es */

    /* Benutzer */
    userName: "Bruder",

    /* Stimme */
    voiceChar: "haldo_ai",
    autoSpeak: false,
    ttsRate: 0.95,
    ttsPitch: 1.0,

    /* API-Keys */
    elevenLabsKey: "",
    orsKey: "",
    tankerKey: "",
    aiProvider: "gemini",      /* gemini | openai | claude */
    aiKeyGemini: "",
    aiKeyOpenai: "",
    aiKeyClaude: "",
    aiModelGemini: "gemini-2.0-flash",
    aiModelOpenai: "gpt-4o-mini",
    aiModelClaude: "claude-3-5-haiku-20241022",

    /* Verkehr */
    verkehr: {
      blitzerBeep: true,
      blitzerVoice: true,
      stauBeep: true,
      stauVoice: false,
      unfallBeep: true,
      unfallVoice: true,
      baustelleBeep: false,
      baustelleVoice: false,
      sperrungBeep: true,
      sperrungVoice: true,
      notify: false
    },

    /* App-spezifisch */
    appSettings: {},           /* {appId: {color, voice}} */

    /* System */
    version: "150",
    firstRun: true,
    bootCount: 0,
    lastBoot: null
  };

  /* ─────────── Aktueller Zustand ─────────── */
  var _config = {};
  var _loaded = false;

  /* ─────────── Storage-Helfer ─────────── */
  function readStorage(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return null;
      return JSON.parse(raw);
    } catch(e){
      console.warn("[Config] Lesen fehlgeschlagen:", e.message);
      return null;
    }
  }
  function writeStorage(data){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch(e){
      console.warn("[Config] Schreiben fehlgeschlagen:", e.message);
      return false;
    }
  }

  /* ─────────── Deep Merge ─────────── */
  function deepMerge(base, override){
    var out = {};
    var key;
    for(key in base){
      if(base.hasOwnProperty(key)){
        if(typeof base[key] === "object" && base[key] !== null && !Array.isArray(base[key])){
          out[key] = deepMerge(base[key], (override && override[key]) || {});
        } else {
          out[key] = (override && override.hasOwnProperty(key)) ? override[key] : base[key];
        }
      }
    }
    /* zusätzliche Keys aus override übernehmen */
    if(override){
      for(key in override){
        if(override.hasOwnProperty(key) && !out.hasOwnProperty(key)){
          out[key] = override[key];
        }
      }
    }
    return out;
  }

  /* ─────────── Laden ─────────── */
  function load(){
    var stored = readStorage();
    _config = deepMerge(DEFAULTS, stored || {});
    _loaded = true;

    /* Boot-Zähler erhöhen */
    _config.bootCount = (_config.bootCount || 0) + 1;
    _config.lastBoot = new Date().toISOString();

    save();
    if(window.HalDo && HalDo.Kernel) HalDo.Kernel.log("Config geladen (Boot #" + _config.bootCount + ")");
    return _config;
  }

  /* ─────────── Speichern ─────────── */
  function save(){
    if(!_loaded) return false;
    return writeStorage(_config);
  }

  /* ─────────── Werte lesen/schreiben ─────────── */
  function get(key, fallback){
    if(!_loaded) load();
    if(typeof key === "undefined") return _config;
    if(_config.hasOwnProperty(key)) return _config[key];
    return fallback;
  }
  function set(key, value){
    if(!_loaded) load();
    _config[key] = value;
    save();
    return value;
  }
  function update(patch){
    if(!_loaded) load();
    _config = deepMerge(_config, patch || {});
    save();
    return _config;
  }

  /* ─────────── App-spezifische Einstellungen ─────────── */
  function getApp(appId, fallback){
    if(!_loaded) load();
    if(!_config.appSettings) _config.appSettings = {};
    if(!_config.appSettings[appId]) return fallback || {color:"global", voice:""};
    return _config.appSettings[appId];
  }
  function setApp(appId, settings){
    if(!_loaded) load();
    if(!_config.appSettings) _config.appSettings = {};
    _config.appSettings[appId] = settings;
    save();
  }

  /* ─────────── Reset ─────────── */
  function reset(){
    _config = deepMerge(DEFAULTS, {});
    save();
    return _config;
  }

  /* ─────────── Export / Import ─────────── */
  function exportAll(){
    return JSON.parse(JSON.stringify(_config));
  }
  function importAll(data){
    if(typeof data !== "object" || data === null) return false;
    _config = deepMerge(DEFAULTS, data);
    save();
    return true;
  }

  /* ─────────── Öffentliche API ─────────── */
  return {
    DEFAULTS: DEFAULTS,
    load: load,
    save: save,
    get: get,
    set: set,
    update: update,
    getApp: getApp,
    setApp: setApp,
    reset: reset,
    exportAll: exportAll,
    importAll: importAll,
    isLoaded: function(){return _loaded;}
  };
})();

console.log("🦚 config.js geladen");
