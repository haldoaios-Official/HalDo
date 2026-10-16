/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VOICE KURDISCH (v157)
   Kurdische/Ezidi Sprachausgabe · Fallback auf DE
   ═══════════════════════════════════════════════════════════ */

(function(){
  "use strict";
  if(!window.HalDo || !HalDo.Runtime) return;

  /* ═══════════════════════════════════════════════════════════
     KURDISCHE / EZIDI WÖRTER (für einfache Sätze)
     ═══════════════════════════════════════════════════════════ */
  var WORDS = {
    "hallo": "Silav",
    "danke": "Sipas",
    "bitte": "Ji kerema xwe",
    "ja": "Erê",
    "nein": "Na",
    "wasser": "Av",
    "brot": "Nan",
    "haus": "Mal",
    "freund": "Heval",
    "liebe": "Evîn",
    "tag": "Roj",
    "nacht": "Şev",
    "gut": "Baş",
    "schlecht": "Xerab",
    "groß": "Mezin",
    "klein": "Piçûk",
    "wie geht es dir": "Tu çawa yî?",
    "mir geht es gut": "Ez baş im",
    "guten morgen": "Beyanî baş",
    "guten tag": "Roj baş",
    "guten abend": "Êvar baş",
    "gute nacht": "Şev baş",
    "auf wiedersehen": "Bi xatirê te",
    "entschuldigung": "Bibore",
    "ich liebe dich": "Ez te hez dikim",
    "willkommen": "Bi xêr hatî",
    "herzlich willkommen": "Bi germî bi xêr hatî"
  };

  /* ═══════════════════════════════════════════════════════════
     KURDISCH SPRECHEN
     ═══════════════════════════════════════════════════════════ */
  function speakKurdisch(text, options){
    options = options || {};
    if(!window.speechSynthesis){
      console.warn("Speech Synthesis nicht verfügbar");
      return false;
    }

    /* Text übersetzen (Wort für Wort falls möglich) */
    var translated = translateToKurdisch(text);

    /* Versuche kurdische Stimme zu finden */
    var voices = window.speechSynthesis.getVoices();
    var kurdishVoice = voices.find(function(v){
      return v.lang && (v.lang.indexOf("ku") === 0 || v.lang.indexOf("ckb") === 0);
    });

    var utterance = new SpeechSynthesisUtterance(translated);
    /* Fallback: Wenn keine kurdische Stimme, nutze Türkisch (ähnlich) */
    utterance.lang = kurdishVoice ? kurdishVoice.lang : "tr-TR";
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;

    if(kurdishVoice) utterance.voice = kurdishVoice;

    try {
      window.speechSynthesis.speak(utterance);
      return true;
    } catch(e){
      console.warn("Kurdisch sprechen fehlgeschlagen:", e);
      return false;
    }
  }

  /* ═══════════════════════════════════════════════════════════
     ÜBERSETZUNG (Wort für Wort)
     ═══════════════════════════════════════════════════════════ */
  function translateToKurdisch(text){
    var t = String(text || "").toLowerCase().trim();

    /* Phrasen zuerst prüfen */
    for(var phrase in WORDS){
      if(t.indexOf(phrase) !== -1){
        return WORDS[phrase];
      }
    }

    /* Wort für Wort übersetzen */
    var words = t.split(/\s+/);
    var result = words.map(function(w){
      return WORDS[w] || w;
    });
    return result.join(" ");
  }

  /* ═══════════════════════════════════════════════════════════
     VOICE-ÜBERSETZUNG FÜR ALLE SPRACHEN
     ═══════════════════════════════════════════════════════════ */
  function speakMulti(text, langCode){
    if(!window.speechSynthesis) return false;

    /* Kurdisch-Spezialfall */
    if(langCode === "ku" || langCode === "ckb"){
      return speakKurdisch(text);
    }

    /* Andere Sprachen */
    var langMap = {
      de: "de-DE", en: "en-US", ar: "ar-SA",
      tr: "tr-TR", fa: "fa-IR", fr: "fr-FR",
      es: "es-ES", ru: "ru-RU"
    };

    var utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langMap[langCode] || "de-DE";

    var voices = window.speechSynthesis.getVoices();
    var voice = voices.find(function(v){ return v.lang === utterance.lang; });
    if(voice) utterance.voice = voice;

    window.speechSynthesis.speak(utterance);
    return true;
  }

  /* ═══════════════════════════════════════════════════════════
     GLOBAL API
     ═══════════════════════════════════════════════════════════ */
  HalDo.VoiceKurdisch = {
    speak: speakKurdisch,
    translate: translateToKurdisch,
    speakMulti: speakMulti,
    words: WORDS
  };

  /* Shortcut: In Voice integrieren */
  if(HalDo.Voice && !HalDo.Voice.speakKurdisch){
    HalDo.Voice.speakKurdisch = speakKurdisch;
  }

  console.log("🦚 voice-kurdisch.js v157 geladen — " + Object.keys(WORDS).length + " Ezidi-Wörter");
})();
