/* ═══════════════════════════════════════════════════════════
   HALDO AI OS — HALDOVOICE LAYER (v150c)
   Mit HalDoVoice-Branding + ElevenLabs Diagnose
   ═══════════════════════════════════════════════════════════ */

window.HalDo = window.HalDo || {};
HalDo.Voice = (function(){
  "use strict";

  /* ─────────── Stimmen-Charaktere ─────────── */
  var CHARACTERS = [
    /* === Charakter-Stimmen (System) === */
    {id:"haldo_ai",      emoji:"🦚", name:"HalDo AI",       desc:"Freundlich",      pitch:1.05, rate:0.95, lang:"de-DE", engine:"system"},
    {id:"haldo_cyborg",  emoji:"⚡", name:"Cyborg",         desc:"Elektronisch",    pitch:0.55, rate:0.85, lang:"de-DE", engine:"system"},
    {id:"haldo_robot",   emoji:"🤖", name:"Roboter",        desc:"Mechanisch",      pitch:0.35, rate:0.75, lang:"de-DE", engine:"system"},
    {id:"haldo_kid",     emoji:"🧒", name:"Kind",           desc:"Verspielt",       pitch:1.55, rate:1.15, lang:"de-DE", engine:"system"},
    {id:"haldo_narrator",emoji:"📖", name:"Erzähler",       desc:"Ruhig",           pitch:0.85, rate:0.85, lang:"de-DE", engine:"system"},
    {id:"haldo_whisper", emoji:"🤫", name:"Flüstern",       desc:"Leise",           pitch:1.2,  rate:0.8,  lang:"de-DE", engine:"system"},

    /* === Sprach-Stimmen (System, in jeweiliger Sprache) === */
    {id:"lang_de",       emoji:"🇩🇪", name:"Deutsch",        desc:"Standard",        pitch:1.0,  rate:0.95, lang:"de-DE", engine:"system"},
    {id:"lang_en",       emoji:"🇬🇧", name:"English",        desc:"Englisch",        pitch:1.0,  rate:0.95, lang:"en-US", engine:"system"},
    {id:"lang_ku",       emoji:"🟨", name:"Kurdî",          desc:"Kurmanji",        pitch:1.0,  rate:0.9,  lang:"tr-TR", engine:"system"},
    {id:"lang_ez",       emoji:"🦚", name:"Êzidî",          desc:"Ezidi-Kurdisch",  pitch:1.0,  rate:0.9,  lang:"tr-TR", engine:"system"},
    {id:"lang_ar",       emoji:"🇸🇦", name:"العربية",        desc:"Arabisch",        pitch:1.0,  rate:0.9,  lang:"ar-SA", engine:"system"},
    {id:"lang_tr",       emoji:"🇹🇷", name:"Türkçe",         desc:"Türkisch",        pitch:1.0,  rate:0.95, lang:"tr-TR", engine:"system"},
    {id:"lang_fa",       emoji:"🇮🇷", name:"فارسی",          desc:"Persisch",        pitch:1.0,  rate:0.9,  lang:"fa-IR", engine:"system"},
    {id:"lang_ru",       emoji:"🇷🇺", name:"Русский",        desc:"Russisch",        pitch:1.0,  rate:0.95, lang:"ru-RU", engine:"system"},
    {id:"lang_fr",       emoji:"🇫🇷", name:"Français",       desc:"Französisch",     pitch:1.0,  rate:0.95, lang:"fr-FR", engine:"system"},
    {id:"lang_es",       emoji:"🇪🇸", name:"Español",        desc:"Spanisch",        pitch:1.0,  rate:0.95, lang:"es-ES", engine:"system"},
    {id:"lang_it",       emoji:"🇮🇹", name:"Italiano",       desc:"Italienisch",     pitch:1.0,  rate:0.95, lang:"it-IT", engine:"system"},
    {id:"lang_pt",       emoji:"🇵🇹", name:"Português",      desc:"Portugiesisch",   pitch:1.0,  rate:0.95, lang:"pt-PT", engine:"system"},
    {id:"lang_nl",       emoji:"🇳🇱", name:"Nederlands",     desc:"Niederländisch",  pitch:1.0,  rate:0.95, lang:"nl-NL", engine:"system"},
    {id:"lang_pl",       emoji:"🇵🇱", name:"Polski",         desc:"Polnisch",        pitch:1.0,  rate:0.95, lang:"pl-PL", engine:"system"},
    {id:"lang_el",       emoji:"🇬🇷", name:"Ελληνικά",       desc:"Griechisch",      pitch:1.0,  rate:0.95, lang:"el-GR", engine:"system"},
    {id:"lang_he",       emoji:"🇮🇱", name:"עברית",          desc:"Hebräisch",       pitch:1.0,  rate:0.95, lang:"he-IL", engine:"system"},
    {id:"lang_hi",       emoji:"🇮🇳", name:"हिन्दी",           desc:"Hindi",           pitch:1.0,  rate:0.9,  lang:"hi-IN", engine:"system"},
    {id:"lang_zh",       emoji:"🇨🇳", name:"中文",            desc:"Chinesisch",      pitch:1.0,  rate:0.9,  lang:"zh-CN", engine:"system"},
    {id:"lang_ja",       emoji:"🇯🇵", name:"日本語",          desc:"Japanisch",       pitch:1.0,  rate:0.9,  lang:"ja-JP", engine:"system"},
    {id:"lang_ko",       emoji:"🇰🇷", name:"한국어",          desc:"Koreanisch",      pitch:1.0,  rate:0.9,  lang:"ko-KR", engine:"system"},
    {id:"lang_sv",       emoji:"🇸🇪", name:"Svenska",        desc:"Schwedisch",      pitch:1.0,  rate:0.95, lang:"sv-SE", engine:"system"},
    {id:"lang_no",       emoji:"🇳🇴", name:"Norsk",          desc:"Norwegisch",      pitch:1.0,  rate:0.95, lang:"nb-NO", engine:"system"},
    {id:"lang_da",       emoji:"🇩🇰", name:"Dansk",          desc:"Dänisch",         pitch:1.0,  rate:0.95, lang:"da-DK", engine:"system"},
    {id:"lang_fi",       emoji:"🇫🇮", name:"Suomi",          desc:"Finnisch",        pitch:1.0,  rate:0.95, lang:"fi-FI", engine:"system"},
    {id:"lang_cs",       emoji:"🇨🇿", name:"Čeština",        desc:"Tschechisch",     pitch:1.0,  rate:0.95, lang:"cs-CZ", engine:"system"},
    {id:"lang_ro",       emoji:"🇷🇴", name:"Română",         desc:"Rumänisch",       pitch:1.0,  rate:0.95, lang:"ro-RO", engine:"system"},
    {id:"lang_hu",       emoji:"🇭🇺", name:"Magyar",         desc:"Ungarisch",       pitch:1.0,  rate:0.95, lang:"hu-HU", engine:"system"},
    {id:"lang_uk",       emoji:"🇺🇦", name:"Українська",     desc:"Ukrainisch",      pitch:1.0,  rate:0.95, lang:"uk-UA", engine:"system"},

    /* === HalDoVoice — Deine eigenen Stimmen (ElevenLabs) === */
    {id:"haldo_voice1",  emoji:"🎙️", name:"HalDoVoice 1",    desc:"Meine Stimme A",   pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"zcF1DZzEkcYBq33PqIkO"},
    {id:"haldo_voice2",  emoji:"🎙️", name:"HalDoVoice 2",    desc:"Meine Stimme B",   pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"Gote05fci1vNcoJBh9Zn"},
    {id:"haldo_voice3",  emoji:"🎙️", name:"HalDoVoice 3",    desc:"Halil Donma A",    pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"IUcJJs5QnotPLhMotOd7"},
    {id:"haldo_voice4",  emoji:"🎙️", name:"HalDoVoice 4",    desc:"Halil Donma B",    pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"7A4KEolVtZ8n3djQIOjb"},

    /* === ElevenLabs Premade (Standard, funktionieren immer) === */
    {id:"el_sarah",      emoji:"🎙️", name:"Sarah",           desc:"Klar, weiblich",   pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"EXAVITQu4vr4xnSDxMaL"},
    {id:"el_laura",      emoji:"🎙️", name:"Laura",           desc:"Enthusiastisch",   pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"FGY2WhTYpPnrIDTdsKH5"},
    {id:"el_alice",      emoji:"🎙️", name:"Alice",           desc:"Lehrerin, klar",   pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"Xb7hH8MSUJpSbSDYk0k2"},
    {id:"el_bella",      emoji:"🎙️", name:"Bella",           desc:"Warm, profess.",   pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"hpp4J3VqNfWAUOO0d1Us"},
    {id:"el_jessica",    emoji:"🎙️", name:"Jessica",         desc:"Spielerisch",      pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"cgSgspJ2msm6clMCkdW9"},
    {id:"el_daniel",     emoji:"🎙️", name:"Daniel",          desc:"Broadcaster",      pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"onwK4e9ZLuTAKqWW03F9"},
    {id:"el_george",     emoji:"🎙️", name:"George",          desc:"Warm, Storyteller",pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"JBFqnCBsd6RMkjVDRZzb"},
    {id:"el_brian",      emoji:"🎙️", name:"Brian",           desc:"Tief, ruhig",      pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"nPczCjzI2devNBz1zQrb"},
    {id:"el_adam",       emoji:"🎙️", name:"Adam",            desc:"Dominant, fest",   pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"pNInz6obpgDQGcFmaJgB"},
    {id:"el_roger",      emoji:"🎙️", name:"Roger",           desc:"Casual, laid-back",pitch:1.0, rate:1.0, lang:"de-DE", engine:"eleven", voiceId:"CwhRBWXzGAHq8TQ4Fs17"}
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

      /* Sprache dynamisch aus Config anpassen */
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
    if(!key) return Promise.reject(new Error("Kein HalDoVoice-Key"));
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
      if(r.status === 401) throw new Error("Key hat keine TTS-Rechte (401)");
      if(r.status === 400) throw new Error("Voice-ID nicht verfügbar (400)");
      if(r.status === 403) throw new Error("Key ohne Berechtigung (403)");
      if(r.status === 429) throw new Error("Zu viele Anfragen (429)");
      if(!r.ok) throw new Error("HTTP " + r.status);
      return r.blob();
    }).then(function(blob){
      if(!blob || blob.size < 100) throw new Error("Leere Antwort");
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
          if(window.HalDo.Kernel) HalDo.Kernel.log("HalDoVoice: " + err.message + " → Fallback", "warn");
          _toast("⚠️ " + err.message + " → Standard-Stimme", "err");
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

  function speakFor(appId, text){
    var appCfg = window.HalDo.Config.getApp(appId, {});
    var voiceId = appCfg.voice || window.HalDo.Config.get("voiceChar") || "haldo_ai";
    speak(text, voiceId);
  }

  /* ─────────── Diagnose-Tool ─────────── */
  function testKey(){
    var key = _elevenKey();
    if(!key) return Promise.resolve({ok:false, error:"Kein Key eingetragen"});
    return fetch("https://api.elevenlabs.io/v1/user", {
      headers: { "xi-api-key": key }
    }).then(function(r){
      if(r.status === 401) return {ok:false, error:"❌ 401 — Key ungültig"};
      if(r.status === 403) return {ok:false, error:"❌ 403 — Keine Berechtigung"};
      if(!r.ok) return {ok:false, error:"HTTP " + r.status};
      return r.json().then(function(d){
        var sub = d.subscription || {};
        return {
          ok: true,
          name: d.first_name || d.username || "?",
          tier: sub.tier || "?",
          chars: (sub.character_count || 0) + " / " + (sub.character_limit || 0)
        };
      });
    }).catch(function(e){ return {ok:false, error:e.message}; });
  }

  function listMyVoices(){
    var key = _elevenKey();
    if(!key) return Promise.resolve({ok:false, error:"Kein Key"});
    return fetch("https://api.elevenlabs.io/v1/voices", {
      headers: { "xi-api-key": key }
    }).then(function(r){
      if(!r.ok) return {ok:false, error:"HTTP " + r.status};
      return r.json().then(function(d){ return {ok:true, voices:d.voices || []}; });
    }).catch(function(e){ return {ok:false, error:e.message}; });
  }

  function testVoiceId(voiceId){
    var key = _elevenKey();
    if(!key) return Promise.resolve({ok:false, error:"Kein Key"});
    return fetch("https://api.elevenlabs.io/v1/text-to-speech/" + voiceId + "?output_format=mp3_44100_128", {
      method: "POST",
      headers: {"xi-api-key":key, "Content-Type":"application/json", "Accept":"audio/mpeg"},
      body: JSON.stringify({text: "Test.", model_id: "eleven_multilingual_v2", voice_settings:{stability:0.5, similarity_boost:0.75}})
    }).then(function(r){
      if(r.status === 400) return {ok:false, error:"❌ Voice nicht verfügbar (400)"};
      if(r.status === 401) return {ok:false, error:"❌ 401 — Key ohne TTS-Rechte"};
      if(r.status === 403) return {ok:false, error:"❌ 403 — Keine Berechtigung"};
      if(!r.ok) return {ok:false, error:"HTTP " + r.status};
      return r.blob().then(function(b){
        var url = URL.createObjectURL(b);
        new Audio(url).play();
        return {ok:true, size: b.size};
      });
    }).catch(function(e){ return {ok:false, error:e.message}; });
  }

  function runFullTest(){
    var out = [];
    out.push("═══════ HalDoVoice Diagnose ═══════");
    return testKey().then(function(k){
      if(!k.ok){ out.push("❌ KEY: " + k.error); return out; }
      out.push("✅ Key OK — " + k.name + " (Plan: " + k.tier + ", Chars: " + k.chars + ")");
      return listMyVoices().then(function(v){
        if(!v.ok){ out.push("⚠️ Stimmen: " + v.error); }
        else {
          out.push("📋 Deine Stimmen (" + v.voices.length + "):");
          v.voices.forEach(function(voice){
            out.push("   • " + voice.name + " → " + voice.voice_id);
          });
        }
        out.push("─── Teste Custom-Voice-IDs ───");
        var testIds = [
          "zcF1DZzEkcYBq33PqIkO",
          "Gote05fci1vNcoJBh9Zn",
          "IUcJJs5QnotPLhMotOd7",
          "7A4KEolVtZ8n3djQIOjb",
          "EXAVITQu4vr4xnSDxMaL",
          "onwK4e9ZLuTAKqWW03F9"
        ];
        return Promise.all(testIds.map(function(id){
          return testVoiceId(id).then(function(r){
            out.push((r.ok ? "✅" : "❌") + " " + id + " → " + (r.ok ? "OK" : r.error));
          });
        })).then(function(){ return out; });
      });
    });
  }

  /* ─────────── HalDoVoice Panel ─────────── */
  function openPanel(){
    var modal = document.getElementById("voicePanel");
    var body = document.getElementById("voicePanelBody");
    if(!modal || !body) return;

    var headTitle = modal.querySelector("h2");
    if(headTitle) headTitle.textContent = "🎙️ HalDoVoice";

    var cfg = window.HalDo.Config.get();
    var hasKey = _hasElevenKey();

    body.innerHTML =
      '<div class="group"><h3>🎙️ HalDoVoice — Deine Stimmen (ElevenLabs)</h3>'
      + '<div class="field"><label>HalDoVoice Key (ElevenLabs API)</label>'
      + '<input type="password" id="hvKey" placeholder="sk_..." value="' + _esc(_elevenKey()) + '" autocomplete="new-password" name="haldovoicekey">'
      + '</div>'
      + '<button class="btn sec full" id="hvKeySave">💾 Key speichern</button>'
      + '<button class="btn full" id="hvKeyTest" style="margin-top:6px">🧪 Key testen (Diagnose)</button>'
      + '<div class="badge-info" id="hvTestRes">' + (hasKey ? "✅ Key gespeichert" : "⚠️ Kein Key — Standard-Stimmen aktiv") + '</div>'
      + '<div class="badge-info" style="margin-top:8px">💡 <b>Wichtig:</b> Der Key MUSS die Rechte <b>Text to Speech</b> + <b>Voices: Read</b> haben!<br>Auf elevenlabs.io → Settings → API Keys → Häkchen setzen!</div>'
      + '</div>'

      + '<div class="group"><h3>🎙️ Deine eigenen HalDoVoice-Stimmen</h3><div class="voice-grid">'
      + CHARACTERS.filter(function(c){ return c.id.indexOf("haldo_voice") === 0; }).map(function(v){
          return '<div class="voice-card' + (cfg.voiceChar===v.id?" active":"") + '" data-vc="' + v.id + '">'
            + '<span class="emoji">' + v.emoji + '</span>'
            + '<div class="n">' + _esc(v.name) + '</div>'
            + '<div class="d">' + _esc(v.desc) + '</div>'
            + '</div>';
        }).join("")
      + '</div></div>'

      + '<div class="group"><h3>🎙️ ElevenLabs Standard-Stimmen</h3><div class="voice-grid">'
      + CHARACTERS.filter(function(c){ return c.id.indexOf("el_") === 0; }).map(function(v){
          return '<div class="voice-card' + (cfg.voiceChar===v.id?" active":"") + '" data-vc="' + v.id + '">'
            + '<span class="emoji">' + v.emoji + '</span>'
            + '<div class="n">' + _esc(v.name) + '</div>'
            + '<div class="d">' + _esc(v.desc) + '</div>'
            + '</div>';
        }).join("")
      + '</div></div>'

      + '<div class="group"><h3>🔊 Charakter-Stimmen</h3><div class="voice-grid">'
      + CHARACTERS.filter(function(c){ return c.id.indexOf("haldo_") === 0 && c.engine === "system"; }).map(function(v){
          return '<div class="voice-card' + (cfg.voiceChar===v.id?" active":"") + '" data-vc="' + v.id + '">'
            + '<span class="emoji">' + v.emoji + '</span>'
            + '<div class="n">' + _esc(v.name) + '</div>'
            + '<div class="d">' + _esc(v.desc) + '</div>'
            + '</div>';
        }).join("")
      + '</div></div>'

      + '<div class="group"><h3>🌍 Sprach-Stimmen (' + CHARACTERS.filter(function(c){ return c.id.indexOf("lang_") === 0; }).length + ')</h3><div class="voice-grid">'
      + CHARACTERS.filter(function(c){ return c.id.indexOf("lang_") === 0; }).map(function(v){
          return '<div class="voice-card' + (cfg.voiceChar===v.id?" active":"") + '" data-vc="' + v.id + '">'
            + '<span class="emoji">' + v.emoji + '</span>'
            + '<div class="n">' + _esc(v.name) + '</div>'
            + '<div class="d">' + _esc(v.desc) + '</div>'
            + '</div>';
        }).join("")
      + '</div></div>'

      + '<div class="group"><h3>⚙️ Feineinstellung</h3>'
      + '<div class="row"><div class="lbl">Auto-Vorlesen <small>AI liest Antworten laut</small></div><div class="sw' + (cfg.autoSpeak?" on":"") + '" id="hvAuto"></div></div>'
      + '<div style="margin-top:8px"><label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px;display:block">Geschwindigkeit: <span id="hvRateVal">' + (cfg.ttsRate||0.95) + '</span></label>'
      + '<input type="range" id="hvRate" min="0.5" max="2" step="0.05" value="' + (cfg.ttsRate||0.95) + '" style="width:100%;accent-color:var(--p1)"></div>'
      + '<div style="margin-top:8px"><label style="font-size:10px;color:var(--text-dim);text-transform:uppercase;font-weight:700;margin-bottom:4px;display:block">Tonhöhe: <span id="hvPitchVal">' + (cfg.ttsPitch||1) + '</span></label>'
      + '<input type="range" id="hvPitch" min="0.5" max="2" step="0.05" value="' + (cfg.ttsPitch||1) + '" style="width:100%;accent-color:var(--p1)"></div>'
      + '<button class="btn full" id="hvTest" style="margin-top:10px">🔊 Test-Satz (Deutsch)</button>'
      + '<button class="btn sec full" id="hvTestMult" style="margin-top:6px">🌍 Test in allen Sprachen</button>'
      + '<button class="btn sec full" id="hvStop" style="margin-top:6px">⏹ Stop</button>'
      + '</div>';

    /* Voice-Auswahl */
    body.querySelectorAll("[data-vc]").forEach(function(el){
      el.addEventListener("click", function(){
        var id = el.dataset.vc;
        window.HalDo.Config.set("voiceChar", id);
        var ch = CHARACTERS.find(function(c){ return c.id === id; });
        body.querySelectorAll("[data-vc]").forEach(function(x){ x.classList.remove("active"); });
        el.classList.add("active");
        speak("Silav Bruder! Ich bin " + (ch ? ch.name : "HalDo"), id);
      });
    });

    /* Auto-Speak */
    var a = document.getElementById("hvAuto");
    if(a) a.addEventListener("click", function(){
      var on = !window.HalDo.Config.get("autoSpeak");
      window.HalDo.Config.set("autoSpeak", on);
      a.classList.toggle("on", on);
    });

    /* Rate */
    var r = document.getElementById("hvRate");
    if(r) r.addEventListener("input", function(){
      window.HalDo.Config.set("ttsRate", parseFloat(this.value));
      var el = document.getElementById("hvRateVal");
      if(el) el.textContent = this.value;
    });

    /* Pitch */
    var p = document.getElementById("hvPitch");
    if(p) p.addEventListener("input", function(){
      window.HalDo.Config.set("ttsPitch", parseFloat(this.value));
      var el = document.getElementById("hvPitchVal");
      if(el) el.textContent = this.value;
    });

    /* Test-Sätze */
    var t1 = document.getElementById("hvTest");
    if(t1) t1.addEventListener("click", function(){
      speak("Silav Bruder! Ich bin HalDoVoice. So klinge ich!");
    });
    var tm = document.getElementById("hvTestMult");
    if(tm) tm.addEventListener("click", function(){
      speak("Silav Bruder! Ez êzidî me.", "lang_ez");
      setTimeout(function(){ speak("Hello brother, I am HalDoVoice.", "lang_en"); }, 2500);
      setTimeout(function(){ speak("مرحبا أخي، أنا هالدو.", "lang_ar"); }, 5000);
      setTimeout(function(){ speak("Merhaba kardeşim, ben HalDoVoice.", "lang_tr"); }, 7500);
    });
    var st = document.getElementById("hvStop");
    if(st) st.addEventListener("click", function(){ stop(); });

    /* Key speichern */
    var ks = document.getElementById("hvKeySave");
    if(ks) ks.addEventListener("click", function(){
      var k = document.getElementById("hvKey").value.trim();
      window.HalDo.Config.set("elevenLabsKey", k);
      _toast(k ? "💾 HalDoVoice Key gespeichert — jetzt testen!" : "🗑️ Key gelöscht", "ok");
      openPanel();
    });

    /* Key testen */
    var kt = document.getElementById("hvKeyTest");
    if(kt) kt.addEventListener("click", function(){
      var res = document.getElementById("hvTestRes");
      if(res) res.innerHTML = "⏳ Teste…";
      runFullTest().then(function(lines){
        var html = lines.map(function(l){ return _esc(l); }).join("<br>");
        if(res) res.innerHTML = '<div style="font-family:ui-monospace;font-size:11px;line-height:1.6;text-align:left;padding:8px;background:#000;border-radius:8px;color:#0f0;max-height:300px;overflow-y:auto">' + html + '</div>';
        console.log("HalDoVoice Diagnose:", lines);
      });
    });

    modal.classList.add("show");
  }

  /* ─────────── Hilfsfunktionen ─────────── */
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
    t._t = setTimeout(function(){ t.className = ""; }, 3000);
  }

  function all(){ return CHARACTERS.slice(); }
  function get(id){ return CHARACTERS.find(function(c){ return c.id === id; }) || null; }

  function init(){
    loadSystemVoices();
    if(window.HalDo.Kernel) HalDo.Kernel.log("HalDoVoice bereit (" + CHARACTERS.length + " Stimmen)");
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
    testKey: testKey,
    listMyVoices: listMyVoices,
    testVoiceId: testVoiceId,
    runFullTest: runFullTest,
    CHARACTERS: CHARACTERS
  };
})();

console.log("🦚 voice.js geladen (HalDoVoice v150c)");
