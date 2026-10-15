/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VOICE (v152.1) · Bugfix
   Text-to-Speech · Null-Safe Storage
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";

  if(!window.HalDo) window.HalDo = {};

  /* ═══════════════════════════════════════════════════════════
     STORE FALLBACK (falls Store nicht geladen)
     ═══════════════════════════════════════════════════════════ */
  function getStoreValue(key, def){
    try {
      if(HalDo.Store && typeof HalDo.Store.get === "function"){
        return HalDo.Store.get(key, def);
      }
      /* Fallback: direkt localStorage */
      var v = localStorage.getItem("haldo:" + key);
      if(v === null) return def;
      return JSON.parse(v);
    } catch(e){
      return def;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     VOICE ENGINE
     ═══════════════════════════════════════════════════════════ */
  var queue = [];
  var speaking = false;

  function getVoices(){
    if(!window.speechSynthesis) return [];
    return window.speechSynthesis.getVoices() || [];
  }

  function findVoice(lang){
    var voices = getVoices();
    if(!lang) lang = "de-DE";

    /* Exakter Match */
    var exact = voices.filter(function(v){ return v.lang === lang; });
    if(exact.length) return exact[0];

    /* Sprach-Prefix Match (z.B. "de") */
    var prefix = lang.split("-")[0].toLowerCase();
    var pref = voices.filter(function(v){
      return (v.lang || "").toLowerCase().indexOf(prefix) === 0;
    });
    if(pref.length) return pref[0];

    /* Fallback: erster Voice oder null */
    return voices[0] || null;
  }

  function speak(text, options){
    options = options || {};
    if(!window.speechSynthesis){
      console.warn("Speech Synthesis nicht verfügbar");
      return false;
    }

    /* Prüfen ob Voice aktiviert */
    var enabled = getStoreValue("voiceEnabled", true);
    if(!enabled && !options.force) return false;

    /* Queue leeren bei sofortigem Sprechen */
    if(options.interrupt !== false){
      window.speechSynthesis.cancel();
    }

    var lang = options.lang || getStoreValue("voiceLang", "de-DE");
    var rate = parseFloat(getStoreValue("voiceRate", 1)) || 1;
    var pitch = parseFloat(getStoreValue("voicePitch", 1)) || 1;
    var volume = parseFloat(getStoreValue("voiceVolume", 1));
    if(isNaN(volume)) volume = 1;

    var utterance = new SpeechSynthesisUtterance(String(text || "").trim());
    utterance.lang = lang;
    utterance.rate = Math.max(0.1, Math.min(10, rate));
    utterance.pitch = Math.max(0, Math.min(2, pitch));
    utterance.volume = Math.max(0, Math.min(1, volume));

    var voice = findVoice(lang);
    if(voice) utterance.voice = voice;

    utterance.onstart = function(){ speaking = true; };
    utterance.onend = function(){
      speaking = false;
      if(queue.length){
        var next = queue.shift();
        speak(next.text, next.options);
      }
    };
    utterance.onerror = function(e){
      speaking = false;
      if(e.error !== "canceled" && e.error !== "interrupted"){
        console.warn("Voice-Fehler:", e.error);
      }
    };

    try {
      window.speechSynthesis.speak(utterance);
      return true;
    } catch(e){
      console.warn("Sprechen fehlgeschlagen:", e);
      return false;
    }
  }

  function stop(){
    if(window.speechSynthesis){
      window.speechSynthesis.cancel();
      queue = [];
      speaking = false;
    }
  }

  function pause(){
    if(window.speechSynthesis) window.speechSynthesis.pause();
  }

  function resume(){
    if(window.speechSynthesis) window.speechSynthesis.resume();
  }

  function isSpeaking(){ return speaking || (window.speechSynthesis && window.speechSynthesis.speaking); }

  /* ═══════════════════════════════════════════════════════════
     VOICES LISTE
     ═══════════════════════════════════════════════════════════ */
  function listVoices(){
    return getVoices().map(function(v){
      return { name: v.name, lang: v.lang, default: v.default, local: v.localService };
    });
  }

  /* ═══════════════════════════════════════════════════════════
     VOICES ASYNC LADEN (manchmal erst nach Event)
     ═══════════════════════════════════════════════════════════ */
  if(window.speechSynthesis){
    if(window.speechSynthesis.onvoiceschanged !== undefined){
      window.speechSynthesis.onvoiceschanged = function(){
        var v = getVoices();
        if(v.length){
          console.log("🎙️ " + v.length + " Stimmen geladen");
        }
      };
    }
  }

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  HalDo.Voice = {
    speak: speak,
    stop: stop,
    pause: pause,
    resume: resume,
    isSpeaking: isSpeaking,
    listVoices: listVoices,
    getVoices: getVoices,
    /* Queue */
    queue: function(text, options){
      if(speaking){
        queue.push({ text: text, options: options || {} });
      } else {
        speak(text, options);
      }
    }
  };

  console.log("🦚 voice.js v152.1 geladen (bugfix)");
})();
