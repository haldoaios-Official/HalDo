/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — VOICE LAYER (v150)
   System-Stimmen · ElevenLabs · Charaktere · Panel
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Voice = (function(){
  "use strict";

  /* ─────────── Stimmen-Charaktere ─────────── */
  var CHARACTERS = [
    {id:"haldo_ai",     emoji:"🦚", name:"HalDo AI",   desc:"Freundlich",   pitch:1.05, rate:0.95, lang:"de-DE", engine:"system"},
    {id:"haldo_cyborg", emoji:"⚡", name:"Cyborg",     desc:"Elektronisch", pitch:0.55, rate:0.85, lang:"de-DE", engine:"system"},
    {id:"haldo_robot",  emoji:"🤖", name:"Roboter",    desc:"Mechanisch",   pitch:0.35, rate:0.75, lang:"de-DE", engine:"system"},
    {id:"haldo_kid",    emoji:"🧒", name:"Kind",       desc:"Verspielt",    pitch:1.55, rate:1.15, lang:"de-DE", engine:"system"},
    {id:"haldo_narrator",emoji:"📖",name:"Erzähler",   desc:"Ruhig",        pitch:0.85, rate:0.85, lang:"de-DE", engine:"system"},
    {id:"haldo_whisper",emoji:"🤫", name:"Flüstern",   desc:"Leise",        pitch:1.2,  rate:0.8,  lang:"de-DE", engine:"system"},
    {id:"voice_ezidi",  emoji:"🦚", name:"Êzidî",      desc:"Kurdisch",     pitch:1.0,  rate:0.9,  lang:"tr-TR", engine:"system"},
    {id:"voice_arabic", emoji:"🇸🇦", name:"Arabisch",   desc:"Arabisch",     pitch:1.0,  rate:0.9,  lang:"ar-SA", engine:"system"},
    /* ElevenLabs Custom Voices */
    {id:"voice_custom1",emoji:"🎙️", name:"Meine Stimme 1", desc:"ElevenLabs", pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"7A4KEolVtZ8n3djQIOjb"},
    {id:"voice_custom2",emoji:"🎙️", name:"Meine Stimme 2", desc:"ElevenLabs", pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"Gote05fci1vNcoJBh9Zn"},
    {id:"voice_custom3",emoji:"🎙️", name:"Meine Stimme 3", desc:"ElevenLabs", pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"IUcJJs5QnotPLhMotOd7"},
    {id:"voice_custom4",emoji:"🎙️", name:"Meine Stimme 4", desc:"ElevenLabs", pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"zcF1DZzEkcYBq33PqIkO"}
  ];

  var _sysVoices = [];
  var _currentAudio = null;

  /* ─────────── System-Stimmen laden ─────────── */
  function loadSystemVoices(){
    if(!window.speechSynthesis) return;
    function grab(){ _sysVoices = speechSynthesis.getVoices() || []; }
    grab();
    speechSynthesis.onvoiceschanged = grab;
  }

  function findBestVoice(char){
    if(!_sysVoices.length) return null;
    var lang = char.lang || "de-DE";
    var prefix = lang.split("-")[0];
    var matches = _sysVoices.filter(function(v){
      return v.lang && v.lang.indexOf(prefix) === 0;
    });
    if(!matches.length) matches = _sysVoices;
    return matches[0];
  }

  /* ─────────── System-Speak ─────────── */
  function _speakSystem(text, char){
    if(!window.speechSynthesis || !text) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      var cfg = window.HalDo.Config.get();
      u.pitch = char.pitch * (cfg.ttsPitch || 1);
      u.rate  = char.rate  * (cfg.ttsRate  || 1);
      u.volume = 1;
      u.lang = char.lang || "de-DE";

      /* Sprache dynamisch anpassen */
      var langMap = {de:"de-DE", ku:"tr-TR", ez:"tr-TR", ar:"ar-SA", tr:"tr-TR", en:"en-US", fa:"fa-IR", ru:"ru-RU", fr:"fr-FR", es:"es-ES"};
      var lang = cfg.lang || "de";
      if(langMap[lang]) u.lang = langMap[lang];

      var best = findBestVoice(char);
      if(best) u.voice = best;
      speechSynthesis.speak(u);
    } catch(e){
      if(window.HalDo.Kernel) HalDo.Kernel.log("TTS Fehler: " + e.message, "warn");
    }
  }

  /* ─────────── ElevenLabs ─────────── */
  function _elevenKey(){ return window.HalDo.Config.get("elevenLabsKey") || ""; }
  function _hasElevenKey(){ var k = _elevenKey(); return k && k.length > 10; }

  function _speakElevenLabs(text, char){
    var key = _elevenKey();
    if(!key) return Promise.reject(new Error("Kein ElevenLabs Key"));
    if(!char.voiceId) return Promise.reject(new Error("Keine Voice-ID"));

    return fetch("https://api.elevenlabs.io/v1/text-to-speech/" + char.voiceId + "?output_format=mp3_44100_128", {
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        "Accept": "audio/mpeg"
      },
      body: JSON.stringify({
        text: text,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true }
      })
    }).then(function(r){
      if(!r.ok) throw new Error("ElevenLabs HTTP " + r.status);
      return r.blob();
    }).then(function(blob){
      if(!blob || blob.size < 100) throw new Error("Leerer Audio-Blob");
      if(_currentAudio){ try { _currentAudio.pause(); } catch(e){} }
      var url = URL.createObjectURL(blob);
      var audio = new Audio(url);
      audio.onended = function(){ URL.revokeObjectURL(url); };
      audio.play().catch(function(e){ throw e; });
      _currentAudio = audio;
      return audio;
    });
  }

  /* ─────────── Speak (öffentlich) ─────────── */
  function speak(text, charId){
    if(!text) return;
    var cfg = window.HalDo.Config.get();
    var id = charId || cfg.voiceChar || "haldo_ai";
    var char = CHARACTERS.find(function(c){ return c.id === id; }) || CHARACTERS[0];

    if(char.engine === "eleven" && char.voiceId){
      if(_hasElevenKey()){
        return _speakElevenLabs(text, char).catch(function(err){
          if(window.HalDo.Kernel) HalDo.Kernel.log("ElevenLabs fehlgeschlagen → Fallback: " + err.message, "warn");
          _speakSystem(text, CHARACTERS[0]);
        });
      } else {
        _speakSystem(text, CHARACTERS[0]);
        return;
      }
    }
    _speakSystem(text, char);
  }

  function auto(text){
    if(window.HalDo.Config.get("autoSpeak")) speak(text);
  }

  function stop(){
    if(window.speechSynthesis) speechSynthesis.cancel();
    if(_currentAudio){ try { _currentAudio.pause(); _currentAudio = null; } catch(e){} }
  }

  /* ─────────── Stimme pro App ─────────── */
  function speakFor(appId, text){
    var appCfg = window.HalDo.Config.getApp(appId, {});
    var voiceId = appCfg.voice || window.HalDo.Config.get("voiceChar") || "haldo_ai";
    speak(text, voiceId);
  }

  /* ─────────── Panel ─────────── */
  function openPanel(){
    var modal = document.getElementById("voicePanel");
    var body = document.getElementById("voicePanelBody");
    if(!modal || !body) return;

    var cfg = window.HalDo.Config.get();
    var hasKey = _hasElevenKey();

    body.innerHTML =
      '<div class="group"><h3>🎙️ Eigene Stimmen (ElevenLabs)</h3>'
      + '<div class="voice-grid">'
      + CHARACTERS.filter(function(c){ return c.engine === "eleven"; }).map(function(v){
          return '<div class="voice-card' + (cfg.voiceChar===v.id?" active":"") + '" data-vc="' + v.id + '">'
            + '<span class="emoji">' + v.emoji + '</span>'
            + '<div class="n">' + _esc(v.name) + '</div>'
            + '<div class="d">' + _esc(v.desc) + '</div>'
            + '</div>';
        }).join("")
      + '</div>'
      + '<div class="badge-info">' + (hasKey ? "✅ ElevenLabs verbunden" : "⚠️ Key in ⚙️ Einstellungen eintragen") + '</div>'
      + '</div>'
      + '<div class="group"><h3>🔊 Standard-Stimmen</h3>'
      + '<div class="voice-grid">'
      + CHARACTERS.filter(function(c){ return c.engine === "system"; }).map(function(v){
          return '<div class="voice-card' + (cfg.voiceChar===v.id?" active":"") + '" data-vc="' + v.id + '">'
            + '<span class="emoji">' + v.emoji + '</span>'
            + '<div class="n">' + _esc(v.name) + '</div>'
            + '<div class="d">' + _esc(v.desc) + '</div>'
            + '</div>';
        }).join("")
      + '</div></div>'
      + '<div class="group"><h3>⚙️ Feineinstellung</h3>'
      + '<div class="row"><div class="lbl">Auto-Vorlesen</div><div class="sw' + (cfg.autoSpeak?" on":"") + '" id="vAutoSpeak"></div></div>'
      + '<div style="margin-top:8px"><label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px;display:block">Geschwindigkeit: <span id="vRateVal">' + (cfg.ttsRate||0.95) + '</span></label>'
      + '<input type="range" id="vRate" min="0.5" max="1.5" step="0.05" value="' + (cfg.ttsRate||0.95) + '" style="width:100%;accent-color:var(--p1)"></div>'
      + '<div style="margin-top:8px"><label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px;display:block">Tonhöhe: <span id="vPitchVal">' + (cfg.ttsPitch||1) + '</span></label>'
      + '<input type="range" id="vPitch" min="0.5" max="2" step="0.05" value="' + (cfg.ttsPitch||1) + '" style="width:100%;accent-color:var(--p1)"></div>'
      + '<button class="btn full" id="vTest" style="margin-top:10px">🔊 Test-Satz</button>'
      + '<button class="btn sec full" id="vStop" style="margin-top:6px">⏹ Stop</button>'
      + '</div>'
      + '<div class="group"><h3>🔑 ElevenLabs API-Key</h3>'
      + '<div class="field"><label>API-Key</label><input type="password" id="vElevenKey" placeholder="sk_..." value="' + _esc(_elevenKey()) + '" autocomplete="new-password" name="elevenkey"></div>'
      + '<button class="btn sec full" id="vSaveKey">💾 Key speichern</button>'
      + '<div class="badge-info">Kostenlos: elevenlabs.io — Key aus "Settings → API Keys". Stimmen müssen in "My Voices" kopiert sein!</div>'
      + '</div>';

    /* Voice-Auswahl */
    body.querySelectorAll("[data-vc]").forEach(function(el){
      el.addEventListener("click", function(){
        var id = el.dataset.vc;
        window.HalDo.Config.set("voiceChar", id);
        var ch = CHARACTERS.find(function(c){ return c.id === id; });
        body.querySelectorAll("[data-vc]").forEach(function(x){ x.classList.remove("active"); });
        el.classList.add("active");
        speak("Hallo, ich bin " + (ch ? ch.name : "HalDo"), id);
      });
    });

    var asw = document.getElementById("vAutoSpeak");
    if(asw) asw.addEventListener("click", function(){
      var on = !window.HalDo.Config.get("autoSpeak");
      window.HalDo.Config.set("autoSpeak", on);
      asw.classList.toggle("on", on);
    });

    var vRate = document.getElementById("vRate");
    if(vRate) vRate.addEventListener("input", function(){
      window.HalDo.Config.set("ttsRate", parseFloat(this.value));
      var el = document.getElementById("vRateVal");
      if(el) el.textContent = this.value;
    });
    var vPitch = document.getElementById("vPitch");
    if(vPitch) vPitch.addEventListener("input", function(){
      window.HalDo.Config.set("ttsPitch", parseFloat(this.value));
      var el = document.getElementById("vPitchVal");
      if(el) el.textContent = this.value;
    });

    var vTest = document.getElementById("vTest");
    if(vTest) vTest.addEventListener("click", function(){
      speak("Silav Bruder! Ich bin HalDo, dein Assistent.");
    });
    var vStop = document.getElementById("vStop");
    if(vStop) vStop.addEventListener("click", function(){ stop(); });

    var vSave = document.getElementById("vSaveKey");
    if(vSave) vSave.addEventListener("click", function(){
      var k = document.getElementById("vElevenKey").value.trim();
      window.HalDo.Config.set("elevenLabsKey", k);
      _toast(k ? "💾 Key gespeichert" : "🗑️ Key gelöscht", "ok");
      openPanel();
    });

    modal.classList.add("show");
  }

  /* ─────────── Helfer ─────────── */
  function _esc(s){
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function _toast(msg, type){
    var t = document.getElementById("toast");
    if(!t) return;
    t.textContent = msg;
    t.className = "show" + (type ? " " + type : "");
    clearTimeout(t._t);
    t._t = setTimeout(function(){ t.className = ""; }, 2400);
  }

  /* ─────────── Info ─────────── */
  function all(){ return CHARACTERS.slice(); }
  function get(id){ return CHARACTERS.find(function(c){ return c.id === id; }) || null; }

  function init(){
    loadSystemVoices();
    if(window.HalDo.Kernel) HalDo.Kernel.log("Voice Layer bereit (" + CHARACTERS.length + " Charaktere)");
  }

  return {
    init: init,
    speak: speak,
    auto: auto,
    stop: stop,
    speakFor: speakFor,
    openPanel: openPanel,
    all: all,
    get: get,
    CHARACTERS: CHARACTERS
  };
})();

console.log("🦚 voice.js geladen");
